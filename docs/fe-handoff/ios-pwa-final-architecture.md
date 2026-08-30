# Arquitectura final iOS/PWA — estado de entrega

Este documento describe el estado integrado en `main`; no es una propuesta de fix.

## Superficies y viewport

- `html`/`body` conservan la superficie física estable `#3B6CA8` utilizada por WebKit/PWA en las zonas fuera del contenido alcanzable. No convertirla en un gradiente dinámico por juego ni modificarla sin QA física iPhone/PWA.
- `PrivateLayout` mantiene el shell privado, el scroll de `<main>` y la navegación inferior.
- `BottomNav` se monta fuera de `.app-shell` deliberadamente, porque WebKit puede clippear descendientes `fixed` cuando el ancestro usa `overflow-hidden`.
- `html.has-bottom-nav` forma parte de la superficie final: `background: #0A4792CC` y `backdrop-filter: blur(64px)`.
- La navegación bajo `has-bottom-nav` usa `rgba(10,71,146,0.8)` / equivalente compilado `#0A4792CC`.
- `GamePlayHeader` permanece visualmente transparente y usa la superficie `PlayTopSurface` situada debajo; su z-index efectivo es `60`.
- `PlayTopSurface` usa `height: var(--play-top-surface-height, 54px)` y `z-index: var(--play-top-surface-z, 1)`. No volver a `z:auto` sin nueva QA física.
- Las rutas de juego numérico mantienen `min-h-dvh` para cubrir la superficie hasta la barra inferior.
- `viewport-fit`, safe areas y las alturas protegidas de Auth no deben cambiarse sin QA físico de iOS/PWA.

## Auth y teclado

- `/` es Login real; `index.html` marca la ruta raíz como `auth-route` antes de React.
- `auth-route` usa `#0A4792` como startup surface.
- `PrivateLayout` elimina defensivamente `auth-route` al entrar en zona privada. No eliminar esta limpieza.
- Login usa scroll nativo del documento en `auth-route`. No añadir `scrollIntoView`, `window.scrollBy`, offsets de foco ni correcciones manuales sin reproducir primero un bug real.
- El experimento `f12bac8c5bcfca052adfc4b70bbe9f3c72e26c00` fue revertido por `5a6395d761ea7b41bdd4bc0cf4ce533ae37be1b2` porque interfería con el scroll gestual/manual. No recuperarlo.

## Layer debug

`layer-debug` fue instrumentación histórica y fue eliminado en `0adbfbdb894fe1bdee2b4298013f244216aa3d26`. No es una dependencia funcional de runtime ni debe reactivarse para resolver diferencias de color. Cualquier cambio en esta zona requiere validar Safari y PWA instalada en iPhone.

## QA

Validado físicamente durante la investigación: continuidad azul inferior, BottomNav glass, superficie superior de `/play`, juegos numéricos, startup Auth sin flash claro, Login/teclado aceptado y retirada de `layer-debug`.

Pendiente de una matriz QA completa: todos los dispositivos, orientación, Withdrawals, `ShippingAddressModal` y flujos no cubiertos físicamente. Build y automatización desktop no sustituyen la comprobación en iPhone real.
