# Revisión Técnica: Login

## Ruta / Página Actual
- **Ruta**: `/login`
- **Archivo**: `src/features/auth/pages/LoginPage.tsx`

## Componentes Principales
- `AuthScreenShell`: Proporciona el layout visual (fondo, blur, estructura). Muy orientado a móvil/PWA.
- `GoogleIcon`: Implementado como SVG inline en el archivo de la página.
- `Button` & `Input`: Componentes atómicos de `src/shared/ui`.

## Dependencias de Auth
- **Hook**: `useAuth` (`src/features/auth/hooks/useAuth.ts`).
- **Servicio**: `auth.service.ts` (Firebase implementation).
- **Contexto**: Envuelto por `AuthProvider` en el nivel raíz.

## Estilos / UI Reutilizables
- La lógica de validación visual y los `motion` de Framer Motion son 100% compatibles con web.
- Los "Trust Badges" son componentes de presentación puros.

## Reutilización (Tal Cual)
- La lógica de integración con Google Auth (`signInWithGoogle`).
- El servicio de autenticación y los tipos de usuario.

## Adaptación Necesaria
- **Layout**: `AuthScreenShell` fuerza un estilo de pantalla completa que en escritorio podría verse demasiado vacío. Se recomienda un layout de "Split Screen" o centrando el card.
- **Feedback**: El uso de `sonner` para toasts es compartible, pero los mensajes pueden necesitar revisión de tono para escritorio.

## Riesgos
- El **Modo Demo** (`signInDemo`) está hardcodeado para bypass de Firebase. Debe evaluarse si se mantiene como herramienta de testing en web.
- Dependencia directa de `react-router-dom` para navegación interna post-login.
