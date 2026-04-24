# Integración de Resultados

## Estado actual (FE)

- Fuente de datos: `src/services/api/adapters/mock/results.mock.ts`
- Hook: `src/features/results/hooks/useResults.ts` → `createApiClient()` → `client.results.getLatest()`
- Render: `src/features/results/pages/ResultsPage.tsx`

El FE está preparado para recibir datos reales. Solo requiere que BE implemente `GET /api/results/latest`.

## Campos renderizados por el FE

| Campo | Render |
|-------|--------|
| `gameId` | Identifica el juego, busca nombre e identidad visual |
| `date` | Fecha del sorteo (formateada) |
| `numbers` | Bolas principales + dígitos para lotería nacional |
| `stars` | Bolas doradas (Euromillones, Gordo, EuroDreams) |
| `complementario` | Bola `C` — solo se renderiza si el campo existe |
| `reintegro` | Bola `R` — solo se renderiza si el campo existe |
| `firstPrizeNumber` | Solo lotería nacional: nº completo del 1er premio |
| `reintegros` | Solo lotería nacional: array de dígitos de reintegro |
| `jackpotNext` | Bote o premio próximo sorteo |

## Juegos soportados

El FE reconoce estos `gameId`:
- `euromillones`, `primitiva`, `bonoloto`, `gordo`, `eurodreams`, `quiniela`
- `loteria-nacional-jueves`, `loteria-nacional-sabado`
- `loteria-navidad`, `loteria-nino`

Resultados con `gameId` no reconocido se ignoran en el render (guard en `ResultsPage`).

## Quiniela

`numbers` para Quiniela es `Array<number | string>`: valores `1`, `X`, `2` o especiales como `M-1`. El FE los renderiza como `NumberBall` genérico.

## Fuente oficial recomendada

Los datos deben provenir de SELAE (Sociedad Estatal de Loterías y Apuestas del Estado). La integración directa es responsabilidad del BE — el FE consume `ResultDto[]` independientemente de la fuente.

## Lo que NO debe hacer el FE

- El FE no llama a SELAE directamente.
- El FE no scrapea resultados.
- El FE no cachea resultados entre sesiones (sin service worker de datos).
