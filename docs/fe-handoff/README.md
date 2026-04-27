# Handoff Técnico: PWA a Web (Lotería Manises)

Este paquete de documentación está diseñado para que el equipo de Frontend (FE) evalúe la viabilidad y el esfuerzo de reutilizar el código actual de la PWA en un entorno Web tradicional.

## Objetivo del Paquete
Proporcionar una visión clara de la arquitectura actual, identificando qué piezas están desacopladas y listas para la web y cuáles requieren adaptación debido a su orientación actual a dispositivo móvil o PWA.

## Orden Recomendado de Revisión
1. **[Login](login-review.md)**: Flujo de entrada y autenticación.
2. **[Home](home-review.md)**: Estructura de landing y catálogo.
3. **[Euromillón](euromillon-review.md)**: El flujo de juego más complejo (Application Layer).

## ¿Qué se considera Reutilizable?
- **Shared UI Components**: `Button`, `Input`, `GameBadge`, etc.
- **Application Layer**: Módulos en `features/play/application` que encapsulan lógica de negocio pura (precios, fechas, borradores).
- **Domain Mappers**: Toda la lógica de transformación de DTOs de API a modelos de dominio.
- **Types & Constants**: Definiciones globales de juegos y tipos TypeScript.

## ¿Qué requiere Adaptación?
- **Layouts**: El uso de `AuthScreenShell` o el estilo de "pantalla completa" de PWA.
- **Interacciones Táctiles**: Componentes como `PremiumTouchInteraction` que emulan feedback háptico/móvil.
- **GSAP Animations**: Muchas animaciones están optimizadas para transiciones de "App".
- **Navigation**: El uso intensivo de `useNavigate` y estados de localización para pasar datos entre pantallas.

## Checklist General para FE
- [ ] Validar compatibilidad de `motion/react` (Framer Motion) con el stack web objetivo.
- [ ] Revisar el acoplamiento de los hooks de autenticación con Firebase.
- [ ] Evaluar si el sistema de "Modo Demo" debe persistir en la versión web.
- [ ] Comprobar el manejo de la zona horaria (`timezone.ts`) en navegadores de escritorio.
