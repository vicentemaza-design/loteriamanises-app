# Cambios realizados para Lotería Manises

Fecha: 23 de junio de 2026

Este documento resume el trabajo hecho en las fases de compra, checkout, postcompra y abonos. Está pensado como handoff para Claude Code.

## Estado general

- Se mantuvo el estilo visual actual de la app.
- No se tocó backend real.
- No se cambiaron reglas globales de pricing salvo visualización/resumen donde correspondía.
- No se mezclaron compra normal, checkout, Mis jugadas y abonos salvo enlaces o pasos necesarios.
- La carpeta actual no tiene `.git`, por lo que no se pudieron crear commits.

## Fase 1: Compra de juegos de combinación

Alcance:
- Euromillones, Bonoloto, Primitiva, El Gordo y reducidas.
- No se tocó Lotería Nacional ni Quiniela.

Cambios:
- Se creó `PurchaseBottomBar` como módulo inferior común para saldo, importe y continuar.
- Se aplicó el módulo inferior común a flujo normal, aleatorio y manual multijugada.
- Se reordenó el flujo de combinación:
  - fechas;
  - tipo de jugada;
  - aleatorio/manual;
  - boleto;
  - módulo inferior.
- Se mantuvo carrusel compacto de fechas donde aporta valor.
- En El Gordo no se fuerza el carrusel si queda pobre.
- Se eliminó pares/impares del aleatorio.
- Manual multijugada incluye flechas anterior/siguiente visibles y acciones rápidas.

Archivos principales:
- `src/features/play/components/PurchaseBottomBar.tsx`
- `src/features/play/pages/GamePlayPage.tsx`
- `src/features/play/quick-pick/components/QuickPickPanel.tsx`
- `src/features/play/quick-pick/hooks/useQuickPick.ts`
- `src/features/play/quick-pick/contracts/quick-pick.contract.ts`
- `src/features/play/services/play.service.ts`
- `src/features/play/multicolumn/components/MulticolumnTicketFlow.tsx`

## Fase 2: Compra de Lotería Nacional

Alcance:
- Lotería Jueves y Lotería Sábado.
- Navidad / Niño quedan preparados como tipos, pero no fueron foco principal.
- No se tocaron juegos de combinación, Quiniela, Perfil, Mis jugadas ni resultados.

Cambios:
- El flujo Nacional queda separado del patrón de Euromillones.
- Orden de compra:
  - sorteo;
  - tipo de entrega;
  - elegir número / Décimo de la Suerte;
  - selección de décimos;
  - cesta.
- “Elegir número” queda como opción principal e inicial.
- “Décimo de la Suerte” queda como opción de menor peso visual.
- Buscador prioritario con número completo, terminación y coincidencia parcial.
- Filtros de disponibilidad: `Todos`, `+10`, `+20`, `+30`, `+50`.
- Mensajería se desactiva si el sorteo está demasiado próximo.
- Si mensajería está activa, suma gastos de envío al total.
- Formulario editable de envío:
  - nombre;
  - apellidos;
  - dirección;
  - CP;
  - municipio;
  - provincia;
  - teléfono.
- Serie/fracción no se muestran en escaparate ni selección.

Archivos principales:
- `src/features/play/national/components/NationalAdvancedFlow.tsx`
- `src/features/play/national/components/NationalDeliverySelector.tsx`
- `src/features/play/national/components/NationalSearchBar.tsx`
- `src/features/play/national/components/NationalNumberShowcase.tsx`
- `src/features/play/national/components/NationalCartSummary.tsx`
- `src/features/play/national/components/NationalShippingForm.tsx`
- `src/features/play/national/application/search-national-showcase.ts`
- `src/features/play/national/hooks/useNationalCart.ts`
- `src/features/play/components/NationalTicketVisual.tsx`

## Fase 3: Cesta / checkout de Lotería Nacional

Alcance:
- Revisión previa a pago.
- No se tocó selección de números ni compra de otros juegos.

Cambios:
- Se añadió paso intermedio de checkout:
  - desde selección, `Continuar` abre revisión de cesta;
  - desde checkout, `Continuar a pago` persiste en sesión demo.
- Se creó `NationalCheckoutReview`.
- Digital:
  - agrupa décimos por sorteo/fecha;
  - muestra número, cantidad, importe y `Ver décimo`;
  - muestra `Abonarme` solo como opción futura si aplica;
  - no muestra serie/fracción antes de confirmación.
- Mensajería:
  - no muestra abono;
  - muestra desglose de décimos, envío y total;
  - muestra dirección editable;
  - usa acción `Ver ticket azul`;
  - no duplica gastos de envío por número.
- Se eliminó el CTA antiguo duplicado de la cesta provisional.

Archivos principales:
- `src/features/play/national/components/NationalCheckoutReview.tsx`
- `src/features/play/national/components/NationalAdvancedFlow.tsx`
- `src/features/play/national/components/NationalCartSummary.tsx`
- `src/features/play/national/components/NationalShippingForm.tsx`

## Fase 4: Mis jugadas, detalle y certificados

Alcance:
- Postcompra.
- No se tocaron pantallas de compra.

Cambios:
- `Mis jugadas` distingue estados:
  - pendiente;
  - tramitando;
  - confirmada;
  - escrutada;
  - rechazada.
- Cada tarjeta muestra:
  - juego;
  - importe;
  - estado;
  - fecha de sorteo;
  - premio si existe o pendiente.
- Accesos rápidos:
  - volver a jugar;
  - abonarse;
  - visualizar números;
  - ver certificado;
  - descargar;
  - añadir a favoritas.
- Añadir a favoritas pide nombre con `prompt` y avisa que estará en `Perfil > Jugadas favoritas`.
- Juegos semanales muestran detalle por día/sorteo, sin mezclar sorteos en un único bloque.
- Lotería Nacional pendiente:
  - muestra número solicitado, cantidad, importe y estado;
  - no muestra serie/fracción;
  - no muestra imagen definitiva.
- Lotería Nacional confirmada:
  - muestra certificado demo;
  - número;
  - titular;
  - fecha de confirmación;
  - desglose de series/fracciones.
- Lotería Nacional escrutada:
  - muestra premios;
  - en custodia indica abono automático demo en saldo;
  - en mensajería muestra estado de envío.
- Mensajería muestra dirección y estado sin duplicar gastos por número.

Archivos principales:
- `src/features/tickets/pages/TicketsPage.tsx`
- `src/features/tickets/components/NationalDecimoCard.tsx`
- `src/features/tickets/components/TicketReceiptModal.tsx`
- `src/shared/types/domain.ts`
- `src/services/api/adapters/mock/tickets.mock.ts`

## Fase 5: Abonos de Lotería Nacional

Alcance:
- Perfil > Mis abonos.
- No es compra normal.
- No es suscripción automática.
- Es reserva preferente pendiente de pago.

Cambios:
- Se reemplazó la pantalla anterior de “suscripciones automáticas” por una bandeja de reservas.
- Tabs:
  - `Pendientes de pago`;
  - `Mis números abonados`.
- Pendientes de pago:
  - lista cronológica;
  - checkbox grande;
  - tipo de sorteo: `JUE`, `SÁB`, `NAV`, `NIÑ`;
  - fecha;
  - número abonado;
  - cantidad de décimos;
  - importe.
- Accesos rápidos:
  - todos;
  - esta semana;
  - próximo sorteo.
- Selección múltiple de varios números y sorteos.
- Pago conjunto con botón `Pagar seleccionados`.
- Módulo inferior muestra:
  - saldo;
  - importe total;
  - resumen de líneas, números, sorteos y décimos.
- Mis números abonados:
  - ver números abonados;
  - modificar cantidad;
  - dar de baja.
- Baja de abono:
  - confirmación previa: “Perderás la reserva preferente de este número para futuros sorteos.”
  - confirmación final con `alert`.
- Fix móvil:
  - el módulo `Pagar seleccionados` se elevó por encima de la navegación inferior;
  - se añadió padding inferior extra al contenido cuando aparece;
  - ya no queda tapado por el footer móvil.

Archivos principales:
- `src/features/profile/pages/SubscriptionsPage.tsx`
- `src/features/play/components/PurchaseBottomBar.tsx`

## Ajuste móvil específico en Mis abonos

Problema detectado:
- En móvil, el módulo flotante `Pagar seleccionados` quedaba parcialmente oculto bajo la navegación inferior.

Solución aplicada:
- En `SubscriptionsPage`, el `PurchaseBottomBar` usa:
  - `bottom-[calc(var(--nav-height)+0.75rem)]`
  - `z-[70]`
  - `pb-0`
- El contenido principal usa padding inferior dinámico:
  - `pb-[calc(var(--nav-height)+11rem)]`

Motivo:
- `BottomNav` es `fixed bottom-0 z-50`.
- `PurchaseBottomBar` también era `fixed bottom-0 z-50`.
- Al renderizarse la navegación después, podía tapar la barra de pago.

## Validaciones ejecutadas

Tras las fases y ajustes:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Resultado:
- TypeScript OK.
- Lint OK.
- Build OK.

## Rutas relevantes

- Compra juegos: `/play/:gameId`
- Mis jugadas: `/tickets`
- Mis abonos: `/profile/subscriptions`
- Perfil: `/profile`

## Pendiente no implementado aquí

Fase 6 de Resultados todavía queda pendiente en esta sesión:
- listado cronológico de resultados;
- histórico aproximado de 3 meses;
- detalle con escrutinio completo;
- comprobador de número para Lotería Nacional.

---

## Fase 7: Mejoras UI según diseño cliente (junio 2026)

Alcance:
- Navidad — selección de décimos y MI CESTA.
- Lotería Nacional — modal de envío y stepper de cantidad.
- NationalShippingForm — vista resumen editable.
- NationalCheckoutReview — etiqueta de envío.

No se tocó: flujo de compra de juegos de combinación, Quiniela, Perfil, Mis jugadas, resultados, backend real.

### Navidad — NavidadCheckoutFlow

Cambios en paso de selección:
- Barra de búsqueda con botón QR a la derecha (icono `QrCode` de iconoir-react/regular).
- Chips horizontales de disponibilidad: `TODOS` / `+10` / `+20` / `+30` / `+50` (estado `minAvailability`, filtra `filteredItems`).
- Card "Décimo de la Suerte" destacada en oro al inicio de la lista (elige un décimo aleatorio disponible).
- Texto de disponibilidad: `"N disponibles · X €"`.
- Se eliminó el botón "Décimo de la Suerte" flotante del final de la lista.

Cambios en paso MI CESTA:
- Chip de modo de entrega en el header: "Décimos digitales" (emerald) / "Mensajería" (amber).
- Cabecera de grupo de sorteo con fecha completa y conteo de décimos.
- Cada décimo muestra botones de acción: "Ver décimo" (icono Eye) y "Abonarme" (icono Repeat2, solo en modo digital).
- Envío mostrado como "Envío MRW" en vez de "Envío".

### Lotería Nacional — NationalAdvancedFlow

- Modal bottom-sheet "Envíos no disponibles":
  - reemplaza el banner inline de `WarningTriangle`;
  - se abre al hacer clic en el botón "Mensajería" bloqueado;
  - backdrop con blur, animación spring, icono Truck, texto explicativo y botón "Entendido".
- Stepper "¿Cuántos décimos?" en modo aleatorio (solo cuando hay líneas en carrito):
  - grid 2 columnas: "Del mismo número" y "Distintos números";
  - "Del mismo número" controla la cantidad de la línea principal;
  - "Distintos números" añade/elimina números aleatorios adicionales.
- Header del escaparate muestra "Cambiar número" en modo aleatorio; buscador oculto en modo aleatorio.

### NationalDeliverySelector

- Botón "Mensajería" clickable aunque no esté disponible (antes desabilitado).
- Icono `Lock` superpuesto cuando no disponible.
- Nueva prop `onShippingUnavailableClick?: () => void`.
- Etiquetas actualizadas: "Custodia / Digital" → "Digital", "Custodia sin envío", "Envío a tu casa".

### NationalShippingForm (reescrito)

- Vista compacta por defecto: nombre, dirección, CP+ciudad, teléfono.
- Badge "Guardada" + botón "Modificar" alterna formulario completo / resumen.
- Formulario completo solo visible cuando `editing === true`.
- Dirección demo precargada (`DEMO_ADDRESS`).

### NationalCheckoutReview

- "Gastos de envío" renombrado a "Envío MRW".

### Archivos modificados

- `src/features/play/national/components/NavidadCheckoutFlow.tsx`
- `src/features/play/national/components/NationalAdvancedFlow.tsx`
- `src/features/play/national/components/NationalDeliverySelector.tsx`
- `src/features/play/national/components/NationalShippingForm.tsx`
- `src/features/play/national/components/NationalCheckoutReview.tsx`

### Validaciones ejecutadas

```bash
npx tsc --noEmit   # OK — sin errores
```

Commit en rama `feature/euromillones-boleto-layout`, mergeado a `main` y desplegado en Vercel.

---

## Deuda técnica detectada

### GamePlayPage monolito

`src/features/play/pages/GamePlayPage.tsx` tiene 1883 líneas y maneja 4 familias de juego completamente distintas mediante flags booleanos (`isNationalLottery`, `isQuiniela`, `supportsQuickPick`).

Propuesta de división:
```
src/features/play/pages/
  GamePlayPage.tsx          → dispatcher ~50 líneas
  NumericGamePlayPage.tsx   → euromillones, primitiva, bonoloto, gordo, eurodreams
  QuinielaPlayPage.tsx      → quiniela
  NationalPlayPage.tsx      → wrapper NationalAdvancedFlow
  NavidadPlayPage.tsx       → wrapper NavidadCheckoutFlow

src/features/play/components/
  GamePlayHeader.tsx        → header colorido compartido
```

El router (`AppRouter.tsx`) no cambia — sigue con `/play/:gameId`.

