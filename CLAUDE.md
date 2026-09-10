# CLAUDE.md - Developer Guidelines for Lotería Manises

This file provides context and guidelines for Claude Code and other development tools working in this repository.

## Commands

- **Build**: `npm run build`
- **Development**: `npm run dev` (runs Vite dev server on port 3000)
- **Lint/Typecheck**: `npm run lint` or `npx tsc --noEmit`
- **Clean**: `npm run clean`

## Code Style & Architecture

- **Structure**: Follow the domain-driven modular structure:
  - `src/app/`: Core app shell, providers, router, and guards.
  - `src/features/`: Feature modules (auth, catalog, play, profile, tickets, results, wallet). Keep business logic in features-specific `services` rather than UI pages.
  - `src/shared/`: Shared generic UI elements, hooks, and configurations.
- **Styling**: Use Tailwind CSS (v4) with standard classes. Implement responsive, mobile-first layouts.
- **State Management**: Use React Context. Do not introduce Zustand/Redux unless absolutely necessary.
- **TypeScript**: Use strict TypeScript typing. Do not use `any` where possible.
- **Naming Conventions**:
  - Components: PascalCase (e.g., `NationalCheckoutReview.tsx`)
  - Services/Hooks: camelCase (e.g., `useNationalCart.ts`)
  - Files/Folders: kebab-case or camelCase as appropriate for modules.

## Forma de trabajo en este proyecto

Acordado con el responsable del proyecto. Aplica siempre, sin que haga falta
pedirlo en cada tarea.

### Verificar antes de afirmar

- **Medir, no suponer.** Los arreglos de UI se comprueban renderizando el
  componente real (Playwright sobre el Chromium del entorno) y midiendo antes y
  después, a varios anchos. Los de arranque, con el segundo arranque, nunca el
  primero.
- **Nada de datos inventados.** Esto es una app de dinero real. Donde falte un
  dato —garantías, desarrollos, precios— la interfaz lo declara en vez de
  rellenarlo con valores de ejemplo. Si aparecen cifras sin fuente, se retiran y
  se anota el porqué en el código.
- **Antes de subir:** `npx tsc --noEmit` y `npm run build`, los dos limpios.

### Decidir dónde está la frontera

- Se arregla lo que es inequívocamente nuestro (erratas, contradicciones
  internas del código, comportamiento roto).
- Lo que es decisión de producto o de negocio —qué reducciones se venden, qué
  precio se cobra, qué copy legal— se pregunta al cliente y **no se toca**
  mientras tanto, aunque parezca evidente.

### Entregar

- **`main` es la variante DEMO** (`demoEnabled: true`, `apiProvider` en `mock`).
  Es deliberado. Ver `RELEASE_SOURCE_OF_TRUTH.md`.
- **FE/BE no trabajan sobre este repositorio**, sino sobre ZIP con parches
  acumulativos. El procedimiento completo, con su verificación, está en
  `docs/fe-handoff/mejoras-y-paso-a-produccion.md` §6. Resumido:
  1. `git format-patch --stdout <base>..main`.
  2. Aplicar con `patch -p1 --forward` sobre una copia limpia **sin `.git`**.
     Cero `.rej`.
  3. `diff -r` contra una extracción de `main`: idénticos.
  4. `tsc` y `build` desde la copia parcheada.
  5. `APLICAR.md` con la comprobación de base (`sha1sum` de un fichero que
     distinga la base esperada) y el aviso de que `patch --dry-run` da falsos
     errores.
- **Cada ronda deja el documento de traspaso actualizado**, no solo el código.
- **Los mensajes al cliente y al equipo técnico se redactan y se pasan para
  revisar**, no se envían solos.
