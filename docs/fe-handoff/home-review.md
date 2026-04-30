# Revisión Técnica: Home

## Ruta / Página Actual
- **Ruta**: `/home` (o raíz `/`)
- **Archivo**: `src/features/catalog/pages/HomePage.tsx`

## Secciones Principales
1. **Greeting**: Saludo personalizado basado en `profile`.
2. **Hero Section**: Sorteo destacado con countdown y jackpot dinámico.
3. **Peñas Oficiales**: Listado horizontal de sindicatos.
4. **Bento Grid**: Próximos sorteos en formato rejilla.
5. **Editorial Premium**: Servicios adicionales (Empresas, Abonos).

## Componentes Visuales / Cards
- `BentoGameCard`: Card principal de juego. Usa `PremiumTouchInteraction` para feedback.
- `PenaCompactCard`: Card de peña con indicador de bote.
- `PremiumEditorialCard`: Card grande para servicios secundarios.
- `HeroTimeChip` & `HeroJackpot`: Sub-componentes internos para el Hero.

## Navegación
- Uso de `useNavigate` para redirigir a `/play/:gameId`.
- Dependencia de `react-router-dom`.

## Dependencias de Catálogo
- **Hook**: `useLotteryGames` (`src/shared/hooks/useLotteryGames.ts`).
- **Lógica**: `getGameIdentity` (`src/shared/lib/game-identity.ts`).
- **Constantes**: `LOTTERY_GAMES` (`src/shared/constants/games.ts`).

## Reutilización
- El **Bento Grid** es muy moderno y funciona bien en web, aunque las columnas podrían expandirse de 2 a 3 o 4 en pantallas grandes.
- Los componentes de "Hero" son visualmente premium y reutilizables como componentes de landing.

## Adaptación Necesaria
- **Animaciones GSAP**: El `stagger` de entrada está pensado para una carga de "App". En web, esto podría integrarse con el scroll (ScrollTrigger).
- **Interacciones**: `PremiumTouchInteraction` debe ser auditado para comportamiento con ratón (hover vs active).
- **Assets**: Uso intensivo de imágenes locales en `src/assets`. Evaluar estrategia de CDN para web.
