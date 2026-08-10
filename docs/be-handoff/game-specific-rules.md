# Reglas Específicas por Juego

Cada juego tiene restricciones de selección que el backend debe validar para evitar jugadas imposibles o malformadas.

## Juegos Semanales Generales
Siguen un patrón de números + complementarios (estrellas, claves, sueños).

| Juego | Rango Números | Rango Extras | Apuesta Mínima |
| :--- | :--- | :--- | :--- |
| **Euromillón** | 5 de 50 | 2 de 12 | 2.50 € |
| **Primitiva** | 6 de 49 | Reintegro (auto) | 1.00 € |
| **Bonoloto** | 6 de 49 | Reintegro (auto) | 0.50 € |
| **El Gordo** | 5 de 54 | 1 de 9 | 1.50 € |
| **Eurodreams** | 6 de 40 | 1 de 5 | 2.50 € |

### Validaciones Backend:
- Validar que no hay números duplicados en el array `numbers`.
- Validar que los números están dentro del rango permitido (ej: 1-50 para Euromillón).
- Para **Apuestas Múltiples**, validar que la combinación de cantidad de números y estrellas es legal (ej: Euromillón máximo 10 números o 5 estrellas).

### Joker (Primitiva)

El Joker es un juego adicional vinculado exclusivamente a **Primitiva**.

- Activado desde el FE mediante toggle en la pantalla de juego.
- Se envía en `PlayDraft.metadata.jokerEnabled: true`.
- **Coste**: 1,00 € por apuesta por sorteo. El FE ya lo suma en `totalPrice`.
- **BE debe**:
  1. Detectar `metadata.jokerEnabled === true` en un draft de Primitiva.
  2. Generar un número Joker de 7 dígitos aleatorio por apuesta.
  3. Recalcular el precio sumando `betsCount × 1,00 € × drawsCount` al importe base.
  4. Persistir el Joker en el ticket resultante.
  5. Al devolver el ticket (`GET /tickets/:id`), incluir el Joker en `metadata.joker` (string de 7 dígitos) si fue jugado.
- **Resultados**: el campo `joker` ya está en `ResultDto` (ver `api-endpoints.md`); el BE sirve el número ganador ahí.

## Quiniela
- **Estructura**: Array de 15 partidos (`selections`).
- **Valores**: `1`, `X`, `2`. Para el "Pleno al 15" se esperan valores de goles (`0`, `1`, `2`, `M`).
- **Sistemas**: Si se envía `systemId`, validar que la cantidad de dobles y triples en `selections` coincide con el sistema (ej: Reducida de 7 dobles).

## Lotería Nacional (Jueves / Sábado / Navidad / El Niño)
Es un producto radicalmente distinto:
- **Selección**: No hay array de números aleatorios, sino un string `number` de 5 cifras (ej: "69844").
- **Stock**: BE debe gestionar el inventario de décimos disponibles por cada número y sorteo.
- **Validación**: No mezclar lógica de "apuestas" con Nacional. No existe el concepto de "apuesta múltiple" en Nacional.
- **Modo de entrega** (`deliveryMode: 'custody' | 'shipping'`): el FE envía este campo por línea de carrito.
  - `custody` = décimo digital en custodia, sin envío físico.
  - `shipping` = envío físico MRW; BE debe sumar el coste de envío y gestionar la dirección postal.
- **Coste de envío**: cuando `deliveryMode === 'shipping'`, BE aplica tarifa MRW fija por pedido (no por décimo). El FE lo espera en `breakdown.shippingCost`.
- **Dirección de envío**: el FE recoge nombre, apellidos, teléfono, dirección, CP, municipio y provincia. BE debe validar que estos campos están presentes cuando `deliveryMode === 'shipping'`.

### El Niño (`gameType: 'nino'`, `gameId: 'loteria-nino'`)

Misma estructura y validaciones que Navidad con las siguientes diferencias:
- `drawDate` fijo: **6 de enero** del año correspondiente.
- `drawId` = `'nino'` (para identificar el sorteo en subscriptions y resultados).
- En `ResultDto`, los campos opcionales de premios (primero, segundo, tercero, reintegros, últimas cifras) siguen el mismo esquema que Navidad. Incluir `secondPrizeNumbers: string[]` (El Niño tiene dos segundos premios).
- Los abonos de El Niño usan el mismo endpoint de subscriptions que Navidad, filtrando por `drawId: 'nino'`.
