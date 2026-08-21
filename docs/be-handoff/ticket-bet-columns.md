# Desarrollo real de columnas en apuestas reducidas/múltiples

Documento de handoff técnico sobre un dato que falta en el detalle de jugada
("Detalle de jugada" / "Mis jugadas") para apuestas de sistema reducido en
juegos numéricos (Bonoloto, Primitiva, Euromillones, Gordo, EuroDreams).

## Qué ya existe y funciona

El modelo `Ticket` (`src/shared/types/domain.ts`) YA tiene los campos
correctos para representar el desarrollo real de una jugada:

```ts
bets?: number[][];        // una entrada por columna realmente jugada
betStars?: number[][];
betReintegros?: number[];
```

`TicketDetailPage.tsx` (`getBets()`, `BoletosGrid`/`BoletoGroupsView`/
`SingleDrawDetail`/`SemanalDetail`) YA renderiza correctamente estas columnas
reales cuando `ticket.bets` está poblado — una tarjeta o fila por columna,
reutilizando `BallSelection`. Esto se puede comprobar hoy mismo en
`demo-primitiva` (18 columnas reales) y en los tickets de quiniela
(`ticket.metadata.generatedColumns`).

## Qué falta

Cuando un usuario juega un **sistema reducido** (p. ej. Bonoloto, 20 números,
sistema "Reducida al 5" → 1336 apuestas/columnas reales, 668,00 €), el
pipeline de creación de la jugada (`buildGameSelection` →
`buildPlayDrafts` → `CreateBetRequestDto`/`SubmitPlaySessionItemDto` →
`buildTicketsForBet` en `src/services/api/adapters/mock/play.mock.ts`) **no
calcula ni transporta el desarrollo real de columnas en ningún punto**. Solo
viaja la selección plana original (`numbers: number[]`, 20 elementos) y el
recuento total de apuestas (`betsCount`, ya corregido para llegar a
`ticket.metadata.betsCount` — ver más abajo).

El único sitio del código que genera combinaciones parecidas a un desarrollo
real es `generateDemoCombinations()` en
`src/features/play/reduced/components/ReducedSystemList.tsx` (pantalla "Ver
desarrollo" del selector de sistemas reducidos) — es una vista previa
**explícitamente de demo**, no relacionada con lo que finalmente se compra
(al pulsar "Jugar" solo se envía `systemId`, nunca las combinaciones
mostradas en esa vista previa). No se ha reutilizado esa función para
rellenar `ticket.bets` porque generar combinaciones de un sistema de
reducción es una regla de negocio de lotería (qué columnas concretas
garantizan qué categoría de premio) que debe ser autoritativa en BE, no
improvisada en el cliente.

## Corregido en esta tarea (sin generar combinaciones)

`buildTicketsForBet()` no copiaba `dto.betsCount` (ya calculado por
`resolvePlayPricing()` y presente en el DTO) a `ticket.metadata.betsCount`,
que es lo que lee `TicketDetailPage.getBetsCount()`. Se ha añadido esa única
línea de "plumbing" — **no es un cálculo de lotería, es reutilizar un número
que ya existía** en otra propiedad del mismo objeto (ver sección 8 de la
tarea del cliente). Gracias a esto, el detalle de jugada ahora sabe cuántas
columnas se jugaron realmente (ej. 1336) aunque no sepa cuáles son.

## Contrato pendiente de BE

Para que `TicketDetailPage.tsx` pueda mostrar el desarrollo real (columna a
columna, reutilizando el mismo `getBets()`/`BoletosGrid` ya existentes, sin
ningún cambio adicional de UI), BE necesita, al confirmarse una apuesta con
sistema reducido, devolver/persistir el desarrollo calculado
server-side en `TicketDto`:

```ts
bets: number[][];         // una entrada por columna real
betStars?: number[][];    // si aplica (Euromillones)
betReintegros?: number[]; // si aplica (Bonoloto/Primitiva)
```

mismo shape que ya usan `demo-primitiva` y el resto de fixtures — no se
necesita ningún campo nuevo en el contrato, solo que el adapter real (hoy
inexistente; el mock es la única implementación) lo popule.

## Comportamiento actual del FE mientras no llega ese dato

Cuando `ticket.bets` no está poblado y `ticket.metadata.betsCount > 1`
(apuesta múltiple/reducida real), `TicketDetailPage.tsx` ya NO presenta la
selección original como si fuera "Mi apuesta (1)". En su lugar:

- Título: "Selección · N columnas" (N = `betsCount` real).
- Se muestra la selección original (útil, no inventada) en una tarjeta,
  claramente NO etiquetada como "mi apuesta".
- Debajo, un aviso honesto "Desarrollo de columnas no disponible"
  (mismo patrón visual `border-dashed` que "Pendiente de escrutinio", ya
  existente en el archivo).

Ninguna combinación se genera ni se infiere en el frontend en ningún punto.
