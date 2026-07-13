# Lotería Manises — App

PWA de venta de lotería oficial para Lotería Manises, S.L. Construida con React 19, TypeScript, Vite y Tailwind CSS.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS 4 |
| Routing | React Router 7 |
| Auth | Firebase Authentication (Google) |
| Base de datos | Firebase Firestore |
| Animaciones | Motion (Framer), GSAP |
| Notificaciones | Sonner |
| Pagos | Redsys (pendiente de integración real — ver abajo) |

---

## Arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Editar .env.local — ver sección "Variables de entorno"

# 4. Arrancar en modo desarrollo
npm run dev        # http://localhost:3000
```

---

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores.

```bash
# Adaptador de datos (mock | firebase | http)
VITE_API_PROVIDER=mock

# Solo si VITE_API_PROVIDER=http
VITE_API_BASE_URL=https://api.loteriamanises.com/v1

# Solo si VITE_API_PROVIDER=firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Sistema de proveedores de datos

La app usa un patrón **provider/adapter/factory** que desacopla la UI de la fuente de datos.

```
src/services/api/
├── providers/
│   └── api.provider.ts          ← IApiProvider: contrato que implementa el backend
├── factory/
│   └── createApiClient.ts       ← Lee VITE_API_PROVIDER y carga el adaptador
├── adapters/
│   ├── mock/                    ← Datos locales en memoria (default)
│   ├── firebase/                ← Firestore + Firebase Auth
│   └── http/                    ← REST API (stub — pendiente de implementar)
├── contracts/                   ← DTOs tipados por dominio
│   ├── auth.contracts.ts
│   ├── play.contracts.ts
│   ├── results.contracts.ts
│   ├── subscriptions.contracts.ts
│   ├── tickets.contracts.ts
│   └── wallet.contracts.ts
├── mappers/                     ← Traducen DTOs ↔ modelos de dominio
└── shared/
    └── play.utils.ts            ← Utilidades compartidas entre adaptadores
```

Para cambiar de proveedor, solo hay que cambiar `VITE_API_PROVIDER` en `.env.local`. No se toca ninguna pantalla.

---

## Integración con backend REST

El contrato que debe implementar el backend está en `src/services/api/providers/api.provider.ts` (`IApiProvider`).

Los tipos de request y response están en `src/services/api/contracts/`. El backend debe producir el JSON que coincida con esos DTOs.

### Endpoints requeridos

| Namespace | Operación | Método sugerido |
|-----------|-----------|----------------|
| `results.getLatest` | Últimos resultados de todos los juegos | `GET /results` |
| `results.getById` | Resultado por ID | `GET /results/:id` |
| `tickets.getUserTickets` | Tickets del usuario | `GET /users/:userId/tickets` |
| `tickets.getTicketById` | Ticket por ID | `GET /tickets/:id` |
| `play.placeBet` | Compra individual | `POST /bets` |
| `play.submitPlaySession` | Compra de carrito (atómica) | `POST /play-sessions` |
| `play.calculatePrice` | Cotización de precio | `POST /play/quote` |
| `wallet.getBalance` | Saldo del usuario | `GET /users/:userId/wallet/balance` |
| `wallet.getMovements` | Historial de movimientos | `GET /users/:userId/wallet/movements` |
| `wallet.topUp` | Recarga de saldo | `POST /users/:userId/wallet/top-up` |

Para implementar el adaptador HTTP, editar los archivos en `src/services/api/adapters/http/`.

---

## Tipos de dominio

Los modelos de dominio principales están en `src/shared/types/domain.ts`:

- `GameType` — tipos de juego soportados
- `BetMode` — modos de apuesta (`simple | multiple | reduced | nacional | ...`)
- `SelaeGameCode` — códigos internos de SELAE (`LNAC | LNNA | PRIM | EURO | ...`)
- `Ticket` — ticket de compra (incluye `selaeTicketId`)
- `UserProfile` — perfil de usuario con saldo
- `WalletMovement` — movimiento de cartera
- `LotteryGame` — configuración de un juego (catálogo)

---

## Integración con SELAE

SELAE (Sociedad Estatal Loterías y Apuestas del Estado) es el organismo oficial que gestiona todos los sorteos. La integración tiene **dos flujos distintos** según el tipo de juego.

### Flujo A — Lotería Nacional (décimos preimpresos)

```
Usuario compra → Backend (MySQL) → CRAPI → SELAE Sistema Central
```

La administración tiene décimos físicos. Al vender uno online:

1. El backend registra la venta en MySQL
2. Transmite la operación a SELAE vía **CRAPI** (protocolo propietario, credenciales facilitadas por SELAE al dar de alta el punto de venta)
3. SELAE devuelve un `selaeTransmissionId` que confirma el registro

El frontend envía `serie` y `fraccion` en `SubmitPlaySessionItemDto` — son los identificadores físicos del décimo que CRAPI necesita.

### Flujo B — Otros juegos (Primitiva, Euromillones, Quiniela…)

```
Usuario apuesta → Backend → SELAE (API revendedor autorizado) → MySQL
```

La apuesta debe registrarse en SELAE primero para ser válida. SELAE devuelve un **resguardo** (`selaeResguardoId`) que es la prueba legal de participación.

> Requiere autorización de SELAE para venta online — licencia independiente de la administración física.

### Campos SELAE en los contratos

| Campo | DTO | Descripción |
|-------|-----|-------------|
| `selaeGameCode` | `CreateBetRequestDto` | Código SELAE del juego (`LNAC`, `PRIM`…) para enrutar al subsistema correcto |
| `selaeTransmissionId` | `SubmitPlaySessionResponseDto` | Confirmación CRAPI para décimos Nacional |
| `selaeResguardoId` | `SubmitPlaySessionResponseDto` | ID de apuesta registrada en SELAE (otros juegos) |
| `selaeTicketId` | `TicketDto` | ID oficial SELAE almacenado en MySQL para trazabilidad |
| `selaeDrawId` | `ResultDto` | ID de sorteo SELAE para cruzar resultados con su sistema |

### Códigos de juego SELAE

| `SelaeGameCode` | Juego |
|----------------|-------|
| `LNAC` | Lotería Nacional (Jueves + Sábado) |
| `LNNA` | Sorteo de Navidad |
| `LNNI` | Sorteo del Niño |
| `PRIM` | La Primitiva |
| `ELGR` | El Gordo de la Primitiva |
| `BONO` | Bonoloto |
| `EURO` | Euromillones |
| `QUNI` | La Quiniela |
| `EDRE` | EuroDreams |

### Obtención de resultados

SELAE no tiene API pública documentada. Opciones para el backend:

| Opción | Fiabilidad | Coste |
|--------|-----------|-------|
| [loteriasapi.com](https://loteriasapi.com) | Alta — tercero dedicado | ~€30/mes |
| Scraping loteriasyapuestas.es | Media — puede cambiar sin aviso | Gratis |
| RSS oficial | Baja — cobertura parcial | Gratis |

---

## Autenticación

Actualmente usa **Firebase Authentication con Google Sign-In**. El flujo es:

1. `AuthProvider.tsx` escucha `onAuthStateChanged` (Firebase SDK)
2. Al login, sincroniza el documento de usuario en Firestore
3. El token de Firebase se adjunta automáticamente por el SDK

**Para migrar a JWT propio:** añadir un interceptor en el adaptador HTTP que adjunte el Bearer token a cada request, y actualizar `AuthProvider.tsx` para gestionar el ciclo de vida del JWT.

---

## Pagos — Redsys

`src/features/profile/components/RedsysGateway.tsx` es actualmente una **UI de demostración** que simula el flujo 3DS. No realiza ninguna llamada real a Redsys.

Para la integración real:
- Ver la memoria de arquitectura en `.claude/projects/.../memory/project_be_redsys_cards.md`
- El backend debe generar los parámetros `Ds_Merchant_*` y la firma SHA-256
- El frontend renderiza el formulario POST hacia la URL de Redsys o embebe el JS de Redsys Sis

---

## Stubs conocidos (pendiente de implementar)

| Archivo | Qué falta |
|---------|-----------|
| `adapters/http/*.ts` | Todos los métodos — son stubs que lanzan error |
| `adapters/firebase/play.firebase.ts` | `submitPlaySession` — carrito multi-décimo no implementado |
| `features/profile/components/RedsysGateway.tsx` | Integración real con Redsys |
| `providers/api.provider.ts` → `calculatePrice` | El precio debe ser validado en servidor |

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo en :3000
npm run build    # Build de producción en /dist
npm run preview  # Preview del build
npm run lint     # TypeScript type-check (sin emitir)
```

---

## Estructura de features

```
src/features/
├── auth/          ← Login, registro, guards de ruta
├── catalog/       ← Home, catálogo de juegos
├── legal/         ← Condiciones, privacidad, aviso legal, condiciones de abonos
├── play/          ← Flujos de compra por tipo de juego
├── profile/       ← Perfil, abonos, movimientos, favoritos
├── results/       ← Resultados de sorteos
├── session/       ← Bandeja de juego (carrito activo)
└── tickets/       ← Mis jugadas
```

---

Lotería Manises, S.L. · CIF B98483522 · info@loteriamanises.com
