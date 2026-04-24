# Handoff Técnico: Frontend a Backend (Lotería Manises)

Este paquete de documentación define los contratos, reglas de negocio y validaciones que el Backend (BE) debe implementar para garantizar la integridad de las jugadas recibidas desde la PWA/App.

## Objetivo del Paquete
Asegurar que el BE no se limite a persistir lo enviado por el FE, sino que replique las validaciones críticas de precio, combinatoria y calendario para evitar fraudes o errores de datos.

## Orden Recomendado de Revisión
1. **[Endpoints REST esperados](api-endpoints.md)**: Todos los endpoints que el FE consumirá, con shapes completos.
2. **[Contrato de Sesión y Draft](play-session-contract.md)**: Estructura de datos persistida y enviada.
3. **[Validación de Precios](pricing-validation.md)**: Lógica de cálculo que BE debe recalcular.
4. **[Calendario y Sorteos](draw-dates-scheduling.md)**: Validación de fechas y estados de sorteo.
5. **[Reglas por Juego](game-specific-rules.md)**: Validaciones específicas de combinatoria.
6. **[Flujo de Euromillón](euromillon-flow.md)**: Ejemplo completo de integración.
7. **[Integración de Resultados](results-integration.md)**: Campos renderizados, juegos soportados, fuente SELAE.
8. **[Pagos y Wallet](payment-wallet.md)**: Flujo de compra, recarga, validaciones y áreas pendientes.

## Contratos Críticos
- `PlayDraft`: El objeto atómico de una jugada.
- `GameSelection`: La unión discriminada que define los números elegidos.
- `SubmitPlaySessionRequest`: El payload final de compra.

## Módulos FE como Referencia
Para implementar las validaciones en BE, se recomienda consultar:
- `src/features/play/application/resolve-play-pricing.ts` (Lógica de precios).
- `src/features/play/lib/bet-calculator.ts` (Combinatoria matemática).
- `src/features/play/application/resolve-draw-dates.ts` (Gestión de fechas).

## ¿Qué debe validar BE sí o sí?
- **Importe Total**: No confiar en `totalPrice` enviado; recalcular usando `unitPrice` y `betsCount`.
- **Saldo del Usuario**: Validar contra la Wallet antes de confirmar.
- **Sorteo Abierto**: Validar que la `drawDate` corresponde a un sorteo futuro y que no ha pasado la hora de cierre.
- **Combinatoria**: Validar que el número de apuestas (`betsCount`) es correcto para los números seleccionados (Múltiples/Reducidas).
