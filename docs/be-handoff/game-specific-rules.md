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

## Quiniela
- **Estructura**: Array de 15 partidos (`selections`).
- **Valores**: `1`, `X`, `2`. Para el "Pleno al 15" se esperan valores de goles (`0`, `1`, `2`, `M`).
- **Sistemas**: Si se envía `systemId`, validar que la cantidad de dobles y triples en `selections` coincide con el sistema (ej: Reducida de 7 dobles).

## Lotería Nacional
Es un producto radicalmente distinto:
- **Selección**: No hay array de números aleatorios, sino un string `number` de 5 cifras (ej: "69844").
- **Stock**: BE debe gestionar el inventario de décimos disponibles por cada número y sorteo.
- **Validación**: No mezclar lógica de "apuestas" con Nacional. No existe el concepto de "apuesta múltiple" en Nacional.
