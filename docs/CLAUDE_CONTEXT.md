# Claude Context: App Manises

## Proyecto
- Nombre de trabajo: App Manises
- Ruta local: `/Users/jvmartinez/Downloads/App-manises-main`
- Stack actual: Vite + React + TypeScript + Tailwind + Firebase
- Objetivo: construir una app móvil/web de loterías alineada con el negocio real de Lotería Manises, no un simple prototipo visual.

## Propiedad y Negocio
- La app es para `Lotería Manises`.
- Referencia corporativa y de negocio principal: `https://www.loteriamanises.com/`
- La app debe responder al negocio real de esa web: juegos, cuenta, jugadas, resultados, saldo/movimientos, premios, contenido de confianza y futuro checkout/cesta.

## Referencias de Producto
### Referencias directas
- `https://www.loteriamanises.com/`
  - Referencia principal de negocio, catálogo y alcance funcional.

### Referencias comparables
- `TuLotero`
- `MiLoto`

Estas referencias se usan para orientar:
- arquitectura de producto
- densidad funcional
- confianza percibida
- navegación de usuario
- estructura de features

No se deben copiar visualmente de forma literal. Se usan como benchmark funcional y de experiencia.

## Decisiones ya tomadas
### 1. El proyecto no debe tratarse como demo genérica
Aunque el repo parecía una app generada desde AI Studio, la dirección correcta es convertirlo en una base de producto real para Lotería Manises.

### 2. La app debe parecerse más a una plataforma de cuenta + compra + seguimiento
No solo a una pantalla para elegir números.

### 3. Antes de diseño, había que ordenar la estructura
Se decidió no entrar de lleno al diseño hasta tener una arquitectura mínima más estable.

## Problemas detectados al inicio
- Faltaban componentes `ui` que el proyecto importaba pero no existían.
- El login con Firebase no funcionaba en local por `auth/unauthorized-domain`.
- La estructura original tenía demasiada mezcla entre:
  - páginas
  - acceso a Firebase
  - auth
  - layout global
  - datos de dominio

## Correcciones ya realizadas
### Base técnica
- Se recreó una capa mínima de `ui` para que la app compilara.
- `npm run lint` y `npm run build` quedaron funcionando.
- El servidor local quedó operativo en `http://localhost:3000/`.

### Firebase/Auth
- Se identificó el error `auth/unauthorized-domain`.
- Se indicó añadir `localhost` en Firebase Auth > Authorized domains.
- Tras ese cambio, el login con Google quedó funcionando.
- Se mejoró el manejo de errores del login para que no falle en silencio.

### Reorganización estructural
Se ejecutó una refactorización mínima hacia esta filosofía:
- `app/`
- `features/`
- `shared/`

## Estructura actual del proyecto
La estructura fue reorganizada a este esquema base:

```text
src/
  app/
    guards/
    layouts/
    providers/
    router/

  features/
    auth/
    catalog/
    play/
    profile/
    results/
    tickets/
    wallet/
    content/

  shared/
    config/
    constants/
    layout/
    lib/
    types/
    ui/
```

## Archivos clave actuales
### App shell y routing
- `src/App.tsx`
- `src/app/router/AppRouter.tsx`
- `src/app/layouts/PublicLayout.tsx`
- `src/app/layouts/PrivateLayout.tsx`
- `src/app/guards/RequireAuth.tsx`

### Auth
- `src/app/providers/AuthProvider.tsx`
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/services/auth.service.ts`
- `src/features/auth/pages/LoginPage.tsx`

### Shared
- `src/shared/config/firebase.ts`
- `src/shared/constants/games.ts`
- `src/shared/types/domain.ts`
- `src/shared/layout/Header.tsx`
- `src/shared/layout/BottomNav.tsx`
- `src/shared/ui/*`

### Features
- `src/features/catalog/pages/HomePage.tsx`
- `src/features/catalog/pages/GamesPage.tsx`
- `src/features/play/pages/GamePlayPage.tsx`
- `src/features/tickets/pages/TicketsPage.tsx`
- `src/features/results/pages/ResultsPage.tsx`
- `src/features/profile/pages/ProfilePage.tsx`

## Criterio arquitectónico acordado
La app debe evolucionar como producto de loterías con estas áreas de dominio:
- auth
- catalog
- play
- tickets
- results
- profile
- wallet
- content

Y más adelante potencialmente:
- cart
- checkout
- prizes
- subscriptions
- favorites
- company-lottery

## Evaluación profesional ya realizada
### Conclusión resumida
- La base actual ya no está mal.
- No necesita una reescritura total.
- Sí necesita seguir desacoplando dominio, datos y UI.
- Antes era más prototipo visual que producto.
- Tras la reorganización, ya hay una base razonable para seguir trabajando con criterio.

### Riesgos aún presentes
1. La lógica de negocio sigue demasiado cerca de algunas páginas.
2. `play` sigue escribiendo directamente en Firebase desde la vista.
3. `tickets` y `results` todavía no tienen una capa de servicios limpia.
4. Hay componentes de dominio que aún no se han extraído.
5. El bundle sigue siendo grande para el tamaño funcional actual.

## Referencia funcional del negocio real de Lotería Manises
La app debe poder alinearse progresivamente con capacidades como:
- catálogo de juegos
- acceso/login
- jugadas del usuario
- resultados
- perfil
- saldo/movimientos
- premios
- información corporativa y de confianza

No todo debe implementarse ahora, pero la arquitectura no debe bloquear esa evolución.

## Qué no hacer
- No introducir Redux/Zustand todavía sin necesidad real.
- No sobre-abstracting.
- No convertir esto en arquitectura de framework para una app aún pequeña.
- No diseñar solo pantallas bonitas sin soporte estructural.
- No separar en demasiadas capas artificiales que no aporten valor.

## Qué sí hacer a continuación
### Prioridad técnica
1. Extraer lógica de negocio de `play`, `tickets` y `results` a `services`.
2. Crear componentes de dominio reutilizables.
3. Mantener `shared` realmente transversal y no meter negocio ahí.

### Prioridad de diseño
Una vez hecha esa limpieza mínima, entrar al diseño con este criterio:
- referencia funcional: Lotería Manises
- benchmark UX: TuLotero / MiLoto
- objetivo visual: más confianza, más claridad operativa, menos aspecto de demo conceptual

## Componentes de dominio recomendados a extraer después
- `GameCard`
- `FeaturedGameCard`
- `TicketCard`
- `ResultCard`
- `BalanceChip`
- `StatusBadge`
- `GameHeader`
- `BetSummaryBar`

## Estado de compilación al cerrar este contexto
- `npm run lint`: OK
- `npm run build`: OK
- login Firebase local: OK tras autorizar `localhost` en Firebase Auth

## Mensaje para Claude
Si retomas este proyecto:
- asume que la dirección correcta es producto real de Lotería Manises
- no vuelvas a una estructura genérica de demo
- prioriza claridad de dominio sobre refactors cosméticos
- antes de rediseñar fuerte, protege la arquitectura mínima ya creada
- usa como benchmark de negocio `loteriamanises.com`
- usa como benchmark de experiencia `TuLotero` y `MiLoto`
