# Phase 3 — Auditoría de Integración Backend
**Proyecto:** Lotería Manises PWA  
**Rama:** `refactor/gameplay-application-layer`  
**Fecha:** 2026-04-29  
**Tipo:** Documento de handoff técnico. Solo lectura. Sin cambios de código.

> Este documento complementa los contratos ya publicados en `docs/be-handoff/`.  
> Puede entregarse directamente al equipo backend como punto de entrada unificado para la fase 3.

---

## 1. Resumen Ejecutivo

El frontend de Lotería Manises está en estado de integración avanzada. La arquitectura separa completamente la UI de la fuente de datos mediante la interfaz `IApiProvider` (`src/services/api/providers/api.provider.ts`). Existen tres adaptadores: `MockAdapter` (activo, 100% funcional), `FirebaseAdapter` (Firestore, parcialmente activo para auth y balance) y `HttpAdapter` (stub vacío, punto de entrada para REST).

**El backend solo necesita implementar los endpoints REST y respetar los contratos DTO existentes.** No se requieren cambios en la UI, el application layer ni los contratos mientras el backend cumpla la interfaz.

**Principio irrenunciable:** El backend nunca acepta los valores de precio calculados por el frontend como fuente de verdad. Todo precio debe recalcularse y validarse en el servidor antes de confirmar cualquier jugada, movimiento de wallet o reserva.

**Estado general:**

| Área | Estado FE | Bloqueante BE |
|------|-----------|---------------|
| Auth / Perfil | Firebase activo | Bajo — JWT ya validado por Firebase |
| Play Session | Mock activo, contratos definidos | Sí — endpoint submit sin implementar |
| Pricing engine | Cálculo local FE | Sí — BE debe recalcular, ver sección 3 |
| Lotería Nacional | Mock completo, contratos definidos | Sí — catálogo y disponibilidad Nacional pendientes |
| Wallet | Mock + Firebase parcial | Sí — pasarela externa sujeta a validación legal |
| Tickets | Mock, TicketDto definido | Sí — persistencia pendiente |
| Empresas / Colectivos | Mock hardcoded | Sí — contrato pendiente (ver sección 6) |
| Resultados | Mock, ResultDto definido | Medio — fuente de datos externa pendiente |
| Catálogo / Avisos | Mock hardcoded | Bajo — depende de CMS, no bloquea jugada |

---

## 2. Estado Actual del Frontend

### Adaptador activo

```
src/config/runtime.ts → RUNTIME_CONFIG.apiProvider = 'mock'
```

El switch de adaptador es una línea de configuración. Cambiar a `'http'` activa el `HttpAdapter` — que actualmente lanza excepción (stub). No hacer este cambio hasta que el `HttpAdapter` esté implementado.

### Application layer — funciones puras no modificar

Estas funciones viven en `src/features/play/application/` y son estables. El backend debe implementar lógica equivalente, no que el FE la elimine:

- `buildPlayDrafts()` → construye `PlayDraft[]` desde la selección del usuario
- `resolvePlayPricing()` → calcula precio local para mostrar en UI (no para confirmar)
- `resolveDrawDates()` → resuelve fechas de sorteo según modo de programa
- `buildGameSelection()` → convierte selección a tipos tagged-union (`GameSelection`)
- `mapDraftToDto()` → traduce `PlayDraft` a `SubmitPlaySessionItemDto` antes del envío

### Contratos DTO existentes — no modificar sin coordinación

Todos los contratos están en `src/services/api/contracts/`. Cambiar su forma requiere actualizar simultáneamente el FE y todos los adaptadores. Cualquier propuesta de cambio debe coordinarse antes de implementar.

### HttpAdapter — estado actual

```
src/services/api/adapters/http/play.http.ts   → stub, devuelve error fijo
src/services/api/adapters/http/wallet.http.ts → stub vacío
src/services/api/adapters/http/tickets.http.ts → stub vacío
src/services/api/adapters/http/results.http.ts → stub vacío
```

La implementación del `HttpAdapter` es la única tarea FE bloqueante para conectar backend REST.

---

## 3. Principios de Integración Segura

Estos principios son no negociables en la integración.

### P1 — Backend recalcula siempre el precio

El campo `price`, `unitPrice`, `totalPrice` y `totalAmount` enviados por el FE son **valores de visualización**, no de facturación. El backend debe recalcular el precio correcto usando exclusivamente:

- `gameId` → precio base del juego (fuente: catálogo interno BE)
- `mode` → `'simple' | 'multiple' | 'reduced' | 'nacional'`
- Longitud de `numbers[]` y `stars[]` → determina `betsCount` en modo múltiple
- `systemId` → determina `betsCount` fijo en sistemas reducidos
- `quantity` → solo para Lotería Nacional (`decimoPrice × quantity`)
- `drawDates[]` → número de sorteos = multiplicador del precio total

Si el precio recalculado difiere del recibido, el backend **rechaza la solicitud** con código `400` y motivo `PRICE_MISMATCH`. El FE ya tiene tipado el campo `failures[]` en `SubmitPlaySessionResponseDto` para manejar este caso.

Ver detalles del algoritmo de recálculo en `docs/be-handoff/pricing-validation.md`.

### P2 — Usuario autenticado extraído del JWT, nunca del payload

El campo `userId` en los DTOs es redundante para endpoints protegidos. El backend extrae el `uid` del token Firebase incluido en la cabecera `Authorization: Bearer <token>`. Si `userId` del payload no coincide con el JWT, rechazar con `403`.

### P3 — Sorteo abierto validado en servidor

El backend valida que la `drawDate` de cada ítem corresponde a un sorteo futuro con estado `'open'`. El FE calcula las fechas localmente con `resolveDrawDates()` — puede existir deriva de zona horaria o sorteo cancelado. La zona horaria de referencia es siempre `Europe/Madrid`.

### P4 — Saldo descontado en transacción atómica

La confirmación de una sesión de juego (`submitPlaySession`) debe ejecutarse en una sola transacción: validar saldo → descontar importe → crear tickets → crear movimiento de wallet. Si cualquier paso falla, revertir todo. El FE envía `paymentMethod: 'wallet'` exclusivamente en la fase demo.

### P5 — Operaciones financieras marcadas como demo hasta aprobación legal

Las operaciones de recarga, retirada, reserva de Nacional y stock de Nacional son **simuladas en la demo**. Ningún flujo de dinero real o reserva efectiva contra proveedores debe activarse hasta que el cliente y el equipo legal validen el modelo de negocio y los requisitos regulatorios aplicables.

---

## 4. Contratos Existentes

### 4.1 Play — Sesión de Jugada

```
src/services/api/contracts/play.contracts.ts
```

**`CreateBetRequestDto`** — ítem de jugada individual:

| Campo | Tipo | Notas |
|-------|------|-------|
| `gameId` | `string` | Identificador del juego (`'primitiva'`, `'euromillones'`, etc.) |
| `gameType` | `GameType` | Enum del dominio FE |
| `numbers` | `number[]?` | Números seleccionados (no en Nacional ni Quiniela pura) |
| `stars` | `number[]?` | Estrellas (Euromillones, Eurodreams) |
| `selections` | `Array<{id: number; val: string \| null}>?` | Quiniela — pronóstico por partido |
| `systemId` | `string?` | ID del sistema reducido |
| `mode` | `string` | `'simple' \| 'multiple' \| 'reduced' \| 'nacional'` |
| `price` | `number` | Valor de UI — BE debe recalcular y no confiar |
| `drawDate` | `string` | ISO 8601 — BE valida que el sorteo esté abierto |
| `drawDates` | `string[]?` | Múltiples fechas en modo semanal |
| `scheduleMode` | `ScheduleMode?` | Modo de programa: `'next_draw' \| 'full_week' \| ...` |
| `weeksCount` | `number?` | Número de semanas en modo `'custom_weeks'` |
| `betsCount` | `number` | Calculado en FE — BE recalcula y compara |
| `hasInsurance` | `boolean` | Seguro de apuesta |
| `isSubscription` | `boolean` | Suscripción recurrente (no activa en demo) |
| `metadata` | `Record<string, any>?` | Datos específicos del juego — ver tabla extendida |

**Campos `metadata` por tipo de juego:**

| Juego | Campos metadata |
|-------|----------------|
| Lotería Nacional | `nationalNumber`, `nationalQuantity`, `nationalDrawLabel`, `deliveryMode: 'custody' \| 'shipping'` |
| Reducida (cualquier juego) | `technicalMode`, `systemFamily`, `reducedSystemId` |
| Multicolumna | `drawsCount`, `scheduleMode`, `weeksCount`, `orderDrawDates[]` |

**`SubmitPlaySessionRequestDto`** — payload de confirmación completa:

```
sessionId      string   Generado en FE — BE puede usar como idempotency key
userId         string   Redundante en endpoints /me/* — extraer del JWT
paymentMethod  'wallet' Único valor en demo
totalAmount    number   Suma de todos los ítems — BE recalcula y valida
items          SubmitPlaySessionItemDto[]
```

**`SubmitPlaySessionResponseDto`** — respuesta del backend:

```
success            boolean
confirmedDraftIds  string[]?   IDs de los drafts procesados correctamente
ticketIds          string[]?   IDs de los tickets creados
failures           Array<{ draftId: string; reason: string }>?
error              string?
```

### 4.2 Wallet

```
src/services/api/contracts/wallet.contracts.ts
```

| Contrato | Campos |
|----------|--------|
| `WalletBalanceDto` | `{ balance: number; userId: string }` |
| `WalletMovementDto` | `{ id, userId, type: 'deposit'\|'bet'\|'prize', amount, description, createdAt }` |

**Nota:** El tipo `'withdrawal'` está en el dominio FE (`src/shared/types/domain.ts`) pero el DTO solo tiene `'deposit' \| 'bet' \| 'prize'`. Hay que añadir `'withdrawal'` al DTO cuando se active el flujo de retirada. Coordinar con FE antes.

### 4.3 Tickets

```
src/services/api/contracts/tickets.contracts.ts
```

```
id             string
userId         string
gameId         string
gameType       GameType
numbers        number[]
stars          number[]?
drawDate       string (ISO)
status         'pending' | 'won' | 'lost'
prize          number?
price          number
hasInsurance   boolean?
isSubscription boolean?
orderId        string?    — referencia al pedido padre
metadata       TicketMetadata?
createdAt      string (ISO)
```

### 4.4 Results

```
src/services/api/contracts/results.contracts.ts
```

```
gameId            string
gameType          GameType
date              string (ISO)
numbers           number[]
stars             number[]?
complementario    number?
reintegro         number?
firstPrizeNumber  string?   — solo Lotería Nacional (número ganador del Gordo)
secondPrizeNumber string?
reintegros        string[]
decimoPrice       number?
jackpotNext       number?
drawId            string?
```

### 4.5 Auth / Perfil

```
src/services/api/contracts/auth.contracts.ts
```

```
AuthUserDto     { uid, email, displayName, photoURL? }
UserProfileDto  extends AuthUserDto { balance, createdAt }
```

---

## 5. Endpoints Recomendados — Demo Conectada

Estos endpoints son suficientes para conectar la demo con datos reales sin activar flujos financieros reales.

Todos los endpoints protegidos usan `Authorization: Bearer <firebase_id_token>` en cabecera. El backend valida el token con Firebase Admin SDK y extrae el `uid`.

### 5.1 Perfil y Auth

```
GET  /api/me/profile
```
Respuesta: `UserProfileDto`  
Acción BE: Leer documento de usuario desde la base de datos interna. El perfil demo tiene `balance: 47.50`.

### 5.2 Play Session

```
POST /api/sessions/submit
```
Body: `SubmitPlaySessionRequestDto`  
Respuesta: `SubmitPlaySessionResponseDto`

Acciones obligatorias del BE:
1. Extraer `uid` del JWT — ignorar `userId` del body para autorización
2. Recalcular precio de cada ítem — rechazar si difiere (ver sección 3, P1)
3. Validar que cada `drawDate` corresponde a un sorteo abierto
4. Verificar saldo suficiente (`balance >= totalAmount`)
5. Transacción atómica: descontar saldo + crear tickets + crear movimiento `'bet'`
6. Devolver `ticketIds[]` y `confirmedDraftIds[]`

### 5.3 Tickets

```
GET /api/me/tickets?status=pending|won|lost&page=0&limit=20
GET /api/me/tickets/:ticketId
```
Respuesta: `GetTicketsResponseDto` / `GetTicketByIdResponseDto`

### 5.4 Wallet

```
GET  /api/me/wallet/balance
```
Respuesta: `GetBalanceResponseDto`  
Nota: En demo el balance es simulado. En producción debe reflejar el saldo real con validación de saldo mínimo operativo.

```
GET  /api/me/wallet/movements?page=0&limit=20&type=deposit|bet|prize
```
Respuesta: `GetMovementsResponseDto`  
Nota: Paginación obligatoria. El FE actualmente no la tiene implementada — coordinar antes de activar.

```
POST /api/me/wallet/topup
```
Body: `{ amount: number }`  
Respuesta: `{ success: boolean; newBalance: number }`  
**Estado: Demo simulada. No conectar a pasarela de pagos externa sin validación legal y proveedor de pagos aprobado.**

### 5.5 Resultados

```
GET /api/results/latest
GET /api/results/:drawId
```
Respuesta: `ResultDto[]` / `ResultDto`  
Nota: La fuente de datos de resultados oficiales requiere acuerdo con el proveedor de datos. En demo, el backend puede servir datos de ejemplo con el mismo formato.

---

## 6. Endpoints Futuros — Sujetos a Validación Legal y Proveedor

Estos endpoints **no deben implementarse** hasta que el cliente y el equipo legal confirmen el modelo operativo.

### 6.1 Catálogo y Disponibilidad Nacional

El frontend tiene un mock de 600 ítems hardcoded (`national-showcase.mock.ts`). La integración real requiere acceso al catálogo de disponibilidad de décimos, cuya fuente y condiciones de acceso deben definirse con el proveedor de servicios de administración de lotería.

```
GET /api/national/draws          — Sorteos disponibles y configuración
GET /api/national/showcase       — Disponibilidad por sorteo (paginado, con stock)
POST /api/national/reserve       — Reserva temporal de número (requiere acuerdo proveedor)
POST /api/national/checkout      — Confirmación de compra de Nacional
POST /api/national/shipping      — Preferencia de entrega — sujeto a operativa mensajería
```

Campos de disponibilidad Nacional que el backend debe servir (basado en `NationalShowcaseItem`):

```
number       string    número de 5 dígitos
available    boolean
drawId       string    'jueves' | 'sabado' | 'especial' | id de sorteo
drawLabel    string    etiqueta legible del sorteo
decimoPrice  number    precio oficial del décimo (validado por BE, no tomado del FE)
stockLabel   string    'Disponible' | 'Últimas unidades' | 'Agotado'
badge        string?   'ultimo' | 'destacado' | 'agotandose'
```

### 6.2 Retirada de Fondos

```
POST /api/me/wallet/withdrawal
```
Body: `{ amount: number; iban: string }`  
**Estado: No implementar. Requiere verificación KYC, validación de IBAN con proveedor bancario, y cumplimiento de normativa de juego responsable.**

### 6.3 KYC y Límites de Juego Responsable

```
POST /api/me/kyc/initiate
GET  /api/me/limits
PUT  /api/me/limits
```
**Estado: No implementar. Requiere proveedor de verificación de identidad aprobado y diseño del flujo regulatorio.**

### 6.4 Métodos de Pago Externos

**Estado: No implementar.** La demo usa exclusivamente `paymentMethod: 'wallet'`. La integración de pasarela de pago (tarjeta, Bizum, etc.) requiere acuerdo con PSP (Payment Service Provider) y cumplimiento PCI-DSS.

---

## 7. Validaciones Backend Obligatorias

Estas validaciones deben existir en el servidor. No pueden delegarse al cliente.

| Validación | Endpoint | Descripción |
|-----------|---------|-------------|
| Precio recalculado | `POST /sessions/submit` | Recalcular desde `gameId` + selección + tablas internas. Rechazar si difiere. |
| Saldo suficiente | `POST /sessions/submit` | Leer balance antes de procesar. No confiar en el balance que el FE muestra. |
| Sorteo abierto | `POST /sessions/submit` | Cada `drawDate` debe ser futura y el sorteo en estado `'open'`. Zona horaria `Europe/Madrid`. |
| JWT válido | Todos los endpoints `/me/*` | Verificar firma del token Firebase. Extraer `uid` del claim, no del body. |
| `userId` del payload coincide con JWT | `POST /sessions/submit` | Si difieren, rechazar con `403`. |
| `betsCount` coherente con selección | `POST /sessions/submit` | Recalcular desde modo + longitud de arrays. Ver `docs/be-handoff/pricing-validation.md`. |
| `decimoPrice` de Nacional validado | `POST /sessions/submit` (Nacional) | El precio del décimo lo define el catálogo interno del BE, no el payload del FE. |
| Stock disponible en Nacional | `POST /national/checkout` | Verificar disponibilidad en el momento de confirmar, no en el de browsing. |
| `sessionId` idempotente | `POST /sessions/submit` | Si se recibe el mismo `sessionId` dos veces, devolver la respuesta original sin duplicar tickets. |
| Código de colectivo válido y vigente | `GET /api/company/resolve/:code` | Validar expiración y cupo. No devolver datos de colectivo expirado. |

---

## 8. Riesgos Técnicos

### R1 — Divergencia de precio FE/BE (riesgo alto)

El FE calcula el precio con `quotePlay()` en `src/features/play/lib/play-matrix.ts`. Si el backend implementa su lógica de pricing de forma independiente sin paridad de pruebas, los precios diferirán. **Acción:** Acordar un conjunto de casos de prueba de paridad antes de Sprint 2. El FE ya tiene la lógica documentada en `docs/be-handoff/pricing-validation.md`.

### R2 — HttpAdapter vacío puede romper silenciosamente (riesgo alto)

Cambiar `apiProvider` a `'http'` en `runtime.ts` antes de implementar el `HttpAdapter` provoca que `createApiClient()` lance excepción y toda la app quede inoperativa. El cambio de adaptador debe hacerse solo cuando el `HttpAdapter` tenga implementados al menos los métodos del Sprint 1.

### R3 — WalletMovementDto sin tipo 'withdrawal' (riesgo medio)

El DTO actual solo tiene `'deposit' | 'bet' | 'prize'`. El dominio FE sí incluye `'withdrawal'`. Si el backend empieza a devolver movimientos de tipo `'withdrawal'`, el FE los filtrará o los mostrará incorrectamente hasta que se actualice el DTO. Coordinar antes de activar el flujo de retirada.

### R4 — National showcase sin paginación en el FE (riesgo medio)

El hook `useNationalShowcase()` carga todos los ítems en memoria (mock: 600). El endpoint real necesitará paginación (`page`, `limit`, `drawId`). Hay que añadir params de query al hook antes de conectar el endpoint de catálogo Nacional.

### R5 — Tickets in-memory se pierden al recargar (riesgo bajo en integración)

El `MockAdapter` gestiona tickets en un singleton de módulo. Con `FirebaseAdapter` o `HttpAdapter` esto desaparece automáticamente. Tenerlo en cuenta durante las sesiones de prueba de integración.

### R6 — `orderId` opcional en TicketDto (riesgo bajo)

La pantalla de confirmación del FE muestra el `orderId` del ticket. Si el backend no lo incluye en la respuesta, el campo aparece vacío en la UI. Recomendado incluirlo desde el principio.

### R7 — Múltiples draw dates en un solo draft (riesgo futuro)

El documento `README.md` del handoff menciona que la Fase 2 requiere soportar arrays de selecciones independientes dentro de un draft. En la fase actual cada draft tiene exactamente una selección lógica. No adelantar este cambio de contrato.

---

## 9. Roadmap Backend por Fases

### Fase A — Demo Conectada (mínimo para presentación con datos reales)

Objetivo: sustituir `MockAdapter` por `HttpAdapter` con datos persistidos. Sin dinero real.

```
A-01  Implementar HttpAdapter en FE (src/services/api/adapters/http/)
A-02  GET  /api/me/profile            — perfil y balance demo
A-03  GET  /api/me/wallet/balance     — saldo en tiempo real
A-04  GET  /api/me/wallet/movements   — histórico paginado (page, limit, type)
A-05  GET  /api/me/tickets            — listado de tickets persistidos
A-06  GET  /api/me/tickets/:ticketId  — detalle de ticket
A-07  GET  /api/results/latest        — resultados de ejemplo (formato oficial)
```

### Fase B — Persistencia de Jugadas

Objetivo: el flujo de confirmación de jugada escribe en base de datos real.

```
B-01  POST /api/sessions/submit       — confirmar sesión, descontar saldo demo, crear tickets
B-02  Recálculo de precio server-side — paridad de pruebas con FE validada
B-03  Validación de sorteo abierto    — tabla de sorteos en BD interna
B-04  Idempotencia por sessionId      — evitar tickets duplicados
```

### Fase C — Wallet Interno

Objetivo: saldo y movimientos gestionados por el backend con historial real.

```
C-01  POST /api/me/wallet/topup       — recarga demo (sin pasarela externa)
C-02  Creación de movimiento 'bet'    — al confirmar jugada
C-03  Creación de movimiento 'deposit'— al recargar
C-04  Transacción atómica saldo + movimiento
```

### Fase D — Catálogo y Disponibilidad Nacional

Objetivo: el escaparate de Nacional muestra disponibilidad gestionada por backend interno.

```
D-01  GET  /api/national/draws        — sorteos disponibles y config
D-02  GET  /api/national/showcase     — disponibilidad paginada por sorteo
D-03  Añadir paginación al hook FE useNationalShowcase() — coordinar con FE
D-04  POST /api/national/reserve      — sujeto a acuerdo con proveedor
D-05  POST /api/national/checkout     — integrado en B-01 si es via submitPlaySession
```

### Fase E — Flujos sujetos a validación legal y proveedor

**No planificar hasta que cliente y legal confirmen modelo operativo.**

```
E-01  Pasarela de pago externa (PSP)  — requeire aprobación PCI-DSS
E-02  POST /api/me/wallet/withdrawal  — requiere KYC y proveedor bancario
E-03  POST /api/me/kyc/initiate       — requiere proveedor de verificación de identidad
E-04  GET/PUT /api/me/limits          — requiere diseño del flujo regulatorio
E-05  Resultados oficiales en tiempo real — requiere acuerdo con proveedor de datos
```

### Fase F — Empresas / Colectivos

```
F-01  GET /api/company/resolve/:code  — contrato en sección 6 de este documento
F-02  Expiración y cupo de colectivo  — validación en BE
F-03  Flujo de participación colectiva — diseño pendiente
```

---

## 10. Decisiones Pendientes con Cliente / Legal

Estas decisiones **no tienen respuesta técnica**. Deben resolverse antes de planificar las fases E y F.

| # | Decisión | Impacto técnico |
|---|---------|----------------|
| D1 | ¿El modelo de negocio es administración propia de lotería, agencia o plataforma de participaciones? | Define el alcance regulatorio completo y si aplica licencia de juego. |
| D2 | ¿Qué proveedor de servicios de administración de lotería gestiona el stock de Nacional? | Define el contrato de `GET /national/showcase` y la fuente de disponibilidad real. |
| D3 | ¿El cliente asume la custodia física de décimos o subcontrata? | Afecta directamente al flujo de `deliveryMode: 'shipping'` y su operativa real. |
| D4 | ¿El wallet interno es una cuenta de pago regulada o un sistema de créditos no monetarios? | Determina si aplica PSD2 y qué proveedor de pagos puede usarse. |
| D5 | ¿Qué proveedor de KYC / verificación de identidad se usa? | Define la integración técnica del flujo de verificación. |
| D6 | ¿El modelo de colectivos / empresas requiere RGPD adicional para datos de grupo? | Afecta el diseño del contrato de empresa y la gestión de datos de participantes. |
| D7 | ¿Los resultados oficiales se obtienen de una fuente de datos con licencia? | Define si el módulo de resultados puede ser en tiempo real o solo histórico. |
| D8 | ¿Hay límites de depósito / retirada definidos por operativa interna? | Afecta el diseño de `POST /me/wallet/topup` y la validación de importes. |

---

## 11. Qué No Tocar Todavía

| Elemento | Razón |
|---------|-------|
| `IApiProvider` interface | Cualquier cambio rompe los tres adaptadores simultáneamente. Coordinación total necesaria. |
| `SubmitPlaySessionRequestDto` / `ResponseDto` | El flujo de confirmación completo depende de estos shapes. Cambio requiere actualizar FE, adapters y BE en sincronía. |
| `PlayDraft` y `PlaySession` tipos | El contexto de sesión del FE depende de estos shapes. Cambio requiere migración de estado. |
| `buildPlayDrafts()` / `buildGameSelection()` | Application layer estable. Los cambios aquí rompen el flujo de confirmación. |
| `quotePlay()` en `play-matrix.ts` | El FE muestra el precio calculado por esta función. Si BE implementa pricing diferente, acordar paridad de pruebas antes de tocar. |
| `MockAdapter` | Mantener funcional como entorno de desarrollo y demos offline. No eliminar al activar HttpAdapter. |
| `FirebaseAdapter` | Activo para auth y balance en tiempo real. No sustituir hasta que HttpAdapter tenga paridad funcional. |
| Componentes UI de `GamePlayPage` | No hay razón para tocarlos. Todo el trabajo de integración es en la capa de servicios. |
| Flujo UX de empresas / colectivos | No existe DTO aprobado todavía. Diseñar contrato primero (ver sección 6), luego implementar. |
| Flujos de pago externo, retirada, KYC | Sujetos a decisiones legales pendientes (sección 10). No planificar implementación técnica hasta que estén resueltas. |

---

## 12. Anexos — Archivos FE Relevantes

### Contratos y Tipos

| Archivo | Contenido |
|---------|-----------|
| `src/services/api/contracts/play.contracts.ts` | `CreateBetRequestDto`, `SubmitPlaySessionRequestDto/ResponseDto`, `QuotePlayRequestDto/ResponseDto` |
| `src/services/api/contracts/wallet.contracts.ts` | `WalletMovementDto`, `WalletBalanceDto` |
| `src/services/api/contracts/tickets.contracts.ts` | `TicketDto` |
| `src/services/api/contracts/results.contracts.ts` | `ResultDto` |
| `src/services/api/contracts/auth.contracts.ts` | `AuthUserDto`, `UserProfileDto` |
| `src/services/api/providers/api.provider.ts` | `IApiProvider` — interfaz unificada de todos los adaptadores |
| `src/shared/types/domain.ts` | Tipos de dominio: `PlayDraft`, `PlaySession`, `GameSelection`, `WalletMovement`, `UserProfile` |

### Application Layer

| Archivo | Función |
|---------|--------|
| `src/features/play/application/resolve-play-pricing.ts` | Lógica de pricing FE — referencia para paridad BE |
| `src/features/play/application/build-play-drafts.ts` | Construcción de drafts — referencia para validar metadata |
| `src/features/play/application/resolve-draw-dates.ts` | Lógica de fechas — referencia para validación de sorteo abierto |
| `src/features/play/lib/play-matrix.ts` | `quotePlay()` — combinatoria y precios base |
| `src/features/play/lib/bet-calculator.ts` | `calculateMultipleBets()` — combinatoria matemática |

### Adaptadores

| Archivo | Rol |
|---------|-----|
| `src/services/api/adapters/mock/mock.adapter.ts` | Implementación de referencia completa — ver para entender comportamiento esperado |
| `src/services/api/adapters/firebase/firebase.adapter.ts` | Implementación Firestore activa |
| `src/services/api/adapters/http/*.ts` | Stubs vacíos — punto de entrada para implementación REST |
| `src/services/api/factory/createApiClient.ts` | Switch de adaptador — cambiar `RUNTIME_CONFIG.apiProvider` para activar |

### Documentación Complementaria

| Archivo | Contenido |
|---------|-----------|
| `docs/be-handoff/README.md` | Índice del paquete de handoff y orden de revisión |
| `docs/be-handoff/pricing-validation.md` | Algoritmo de recálculo de precio y casos especiales |
| `docs/be-handoff/play-session-contract.md` | Estructura completa de `PlayDraft` y `PlaySession` |
| `docs/be-handoff/api-endpoints.md` | Endpoints definidos en fase anterior |
| `docs/be-handoff/draw-dates-scheduling.md` | Validación de fechas y estados de sorteo |
| `docs/be-handoff/game-specific-rules.md` | Reglas de combinatoria por juego |
| `docs/be-handoff/payment-wallet.md` | Flujo de wallet y áreas pendientes |

### Contrato Preliminar de Empresas / Colectivos

Basado en `src/features/company/data/company-demo.mock.ts`. Este contrato es una propuesta — requiere validación con cliente antes de implementar.

```
GET /api/company/resolve/:code

Respuesta propuesta:
{
  code          string      código normalizado (mayúsculas, sin espacios)
  slug          string      identificador URL-friendly
  name          string      nombre completo del colectivo
  shortName     string      nombre corto (para cabeceras)
  description   string      descripción del colectivo
  expiresAt     string?     ISO 8601 — fecha de expiración del acceso
  memberCount   number?     número de participantes (si se expone)
  featuredProduct {
    gameId          string
    productName     string
    drawLabel       string
    protagonistNumber string?   número de lotería asignado al colectivo
    decimoPrice     number      precio validado por BE
    quantityOptions number[]    opciones de cantidad permitidas
    deliveryMode    'custody' | 'shipping'
  }
}

Errores esperados:
  404  código no encontrado
  410  código expirado
  403  cupo agotado
```

---

*Documento generado en fase de auditoría técnica. No contiene código ejecutable ni instrucciones de implementación directa. Para implementación, coordinar con el equipo frontend antes de cada sprint.*
