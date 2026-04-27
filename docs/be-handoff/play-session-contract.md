# Contrato de Sesión y Draft (PlaySession)

Este documento describe la estructura de datos que el frontend gestiona en caliente y cómo se transforma para su envío al backend.

## Estructura de PlaySession
La sesión es el contenedor raíz del carrito de compras actual.
- `id`: UUID generado por el cliente.
- `drafts`: Array de `PlayDraft`.
- `status`: Estado del flujo (`idle`, `reviewing`, `confirming`, etc.).

## Estructura de PlayDraft
Es la representación de una línea de apuesta en el carrito.
- `gameId`: Identificador del juego (ej: `euromillones`).
- `gameType`: Categoría (ej: `loteria-nacional`).
- `drawDate`: Fecha del sorteo (ISO String).
- `selection`: Objeto `GameSelection` (ver abajo).
- `quantity`: Multiplicador (usado principalmente en Lotería Nacional para décimos).
- `unitPrice`: Precio por apuesta/décimo.
- `totalPrice`: Importe total de este draft (`unitPrice * betsCount * quantity`).
- `betsCount`: Número de apuestas/columnas generadas.
- `mode`: Modo de juego (`simple`, `multiple`, `reduced`).
- `hasInsurance`: Flag de protección de premios (LaGuinda style).
- `isSubscription`: Flag de apuesta recurrente.
- `metadata`: Objeto flexible para datos adicionales (ej: `orderDrawDates` para multi-draw).

## Estructura de GameSelection
Unión discriminada por el campo `type`:
- **National**: `{ type: 'national', number: string, drawLabel: string }`
- **Euromillones**: `{ type: 'euromillones', numbers: number[], stars: number[] }`
- **Quiniela**: `{ type: 'quiniela', matches: { id, value }[], systemId?: string }`
- **Primitiva/Bonoloto**: `{ type: 'primitiva', numbers: number[] }`
- **Gordo**: `{ type: 'gordo', numbers: number[], key: number }`

## Transformación a DTO (Backend)
Al confirmar la sesión, el frontend mapea los drafts a un formato plano:
- `numbers`: Array de números (o dígitos para Nacional).
- `stars`: Array de estrellas o clave.
- `selections`: Para Quiniela.
- `metadata`: Se pasan campos como `nationalDrawLabel` o `nationalQuantity`.

## Campos Críticos para Confirmación
Backend DEBE ignorar el campo `totalPrice` del payload para el cobro real y utilizarlo solo para validación cruzada. El cálculo de saldo debe basarse en la lógica interna del BE.

## Compatibilidad Legacy
El campo `metadata` permite extender el contrato sin romper versiones antiguas de la PWA. Actualmente se usa para almacenar `orderDrawDates` en compras multi-sorteo.
