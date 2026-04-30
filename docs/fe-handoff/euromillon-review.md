# Revisión Técnica: Euromillón (Flujo de Juego)

## Ruta / Página Actual
- **Ruta**: `/play/euromillones`
- **Archivo**: `src/features/play/pages/GamePlayPage.tsx`

## Detección de Euromillón
- La página es genérica para todos los juegos (`:gameId`).
- Euromillón se detecta mediante `gameId === 'euromillones'`.
- La UI se adapta dinámicamente mediante el objeto `game` recuperado de `LOTTERY_GAMES`.

## Componentes Usados
- **Selectores**: `GameModeSelector`, `ReductionSystemSelector`.
- **Feedback**: `GameBadge`, `GameInfoSheet`.
- **Layout**: `PlaySessionIndicator` (acoplado a sesión de carrito).

## Selección de Números y Estrellas
- Estado local en `GamePlayPage`: `selectedNumbers`, `selectedStars`.
- Lógica de validación: Basada en `game.selectionRange` (min/max).

## Application Layer (Reutilización Clave)
El proyecto cuenta con una capa de aplicación desacoplada que FE puede usar en la web sin cambios:
- `resolve-play-pricing.ts`: Calcula apuestas y precios de forma pura.
- `resolve-draw-dates.ts`: Resuelve fechas de sorteo según la modalidad elegida (próximo, semana, etc.).
- `build-game-selection.ts`: Mapea el estado de UI a un objeto de dominio `GameSelection`.
- `build-play-drafts.ts`: Transforma la selección en borradores (`PlayDraft`) listos para el carrito.

## Estado de Reutilización
### Partes Listas (Reusables)
- Toda la carpeta `src/features/play/application`.
- El hook `usePlay` (si se mantiene el contrato de entrada).
- Lógica matemática en `src/features/play/lib/bet-calculator.ts`.

### Partes Acopladas (Requieren Refactor)
- **GamePlayPage.tsx**: Es un archivo gigante (>1300 líneas) que mezcla UI, gestión de estado de todos los tipos de juego (Nacional, Quiniela, Euromillones) y efectos.
- **useEffect de Mapeo**: El proceso de cargar un draft existente para edición está muy acoplado al estado local de la página.

## Checklist de Pruebas para FE
- [ ] Verificar que `resolve-play-pricing` devuelve el mismo importe en Web que en PWA para selecciones múltiples.
- [ ] Validar que el objeto `GameSelection` generado cumple con el esquema esperado por el backend.
- [ ] Comprobar que los "Modos de Juego" (Simple, Múltiple, Reducida) se renderizan correctamente según `PLAY_MATRIX`.
