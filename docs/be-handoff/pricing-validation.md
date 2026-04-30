# Validación de Precios y Apuestas

El Backend no debe confiar en los cálculos de precio enviados por el Frontend. Se debe implementar una lógica de "Shadow Pricing" para validar cada jugada.

## Algoritmo de Cálculo en FE
La lógica reside en `resolve-play-pricing.ts`. El precio se compone de:
1. **`betsCount`**: Determinado por la combinatoria (Múltiples) o tablas fijas (Reducidas).
2. **`unitPrice`**: Precio base de 1 apuesta del juego (ej: 2.50€ para Euromillones).
3. **`drawsCount`**: Cantidad de fechas seleccionadas en `drawDates`.
4. **`totalPrice`**: `(unitPrice * betsCount) * drawsCount`.

## Funciones de Referencia
- **`calculateMultipleBets`**: Implementa la combinatoria matemática para apuestas múltiples.
- **`QUINIELA_REDUCED_TABLES`**: Contiene el número de apuestas fijas por cada sistema reducido de Quiniela.
- **`quotePlay`**: Retorna garantías y recuentos para sistemas reducidos de juegos semanales.

## Recalculo en Backend
BE debe repetir el cálculo de `betsCount` basándose exclusivamente en:
- `gameId`
- `mode`
- Longitud de `numbers` y `stars`.
- `systemId` (para reducidas).

### Riesgos de Confianza en FE
- Manipulación de `totalPrice` en el payload para pagar menos.
- Envío de selecciones múltiples (ej: 7 números en Primitiva) marcadas como `mode: simple` para evitar el recargo de apuestas.

## Casos Especiales
### Lotería Nacional
- No se basa en combinatoria. El precio es `decimoPrice * quantity`.
- `decimoPrice` varía según el sorteo (3€ Jueves, 6€ Sábado, 20€ Navidad). BE debe validar este precio contra su base de datos de sorteos, no contra el valor enviado por FE.

### Quiniela Reducida
- El backend debe validar que las `selections` enviadas coinciden con el `systemId` solicitado (ej: Reducida de 7 dobles).
