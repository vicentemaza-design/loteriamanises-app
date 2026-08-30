# Arquitectura final iOS/PWA — estado de entrega

Este documento describe el estado integrado en `main`; no es una propuesta de fix.

## Superficies y viewport

- `PrivateLayout` mantiene el shell privado, el scroll de `<main>` y la navegación inferior.
- `BottomNav` se monta fuera de `.app-shell` para no quedar subordinado a su clipping.
- `GamePlayHeader` y las rutas `/play/*` usan su propia superficie superior.
- `viewport-fit`, safe areas y las alturas protegidas de Auth no deben cambiarse sin QA físico de iOS/PWA.

## Layer debug

`layer-debug` fue un mecanismo histórico de diagnóstico visual. No es una dependencia funcional de runtime ni debe reactivarse para resolver diferencias de color. Cualquier cambio en esta zona requiere validar Safari y PWA instalada en iPhone.

## QA pendiente

El build y la automatización desktop no sustituyen la comprobación en iPhone real: teclado abrir/cerrar, scroll largo, modales, carrito, orientación, Withdrawals y `ShippingAddressModal`.
