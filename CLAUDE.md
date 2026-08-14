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
