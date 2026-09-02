# Arquitectura final iOS/PWA — estado de entrega

Este documento describe el estado integrado en `main`; no es una propuesta de fix.
**Excepción:** la sección «Arranque» describe `fix/auth-startup-loader`, que a fecha de
hoy NO está en `main`. Está marcada como tal.

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

## Arranque (rama `fix/auth-startup-loader`, pendiente de merge)

> Estado de `fix/auth-startup-loader` (`f6b7f7c`, `2fcb9e8`, `108c6a3`, `9bd075f`).
> Todavía no integrado en `main`. Validado en iPhone físico con PWA reinstalada.

El arranque tiene cuatro propietarios consecutivos. Cada pieza existe para que el
siguiente relevo no se vea:

1. **iOS** pinta su launch surface. No la controlamos (ver «Pendientes»).
2. **`scripts/prepare-ios-startup.mjs`** inyecta `<style id="auth-critical-first-paint">`
   justo tras `<meta charset>`: el primer frame componible ya sale `#0A4792` sin
   esperar al bundle.
3. **`vite.config.ts` → `nonBlockingStylesheets()`** convierte el `<link>` que genera
   Vite en `preload` + swap en `onload`, de modo que ninguna hoja bloquee el render.
4. **`vite.config.ts` → `shellPrecache` (vite-plugin-pwa)** precachea el shell, para
   que el documento no se pida por red en cada arranque.

Medido sobre el build real (frames compuestos vía CDP screencast, 250 ms de RTT
simulado por petición, HTML `must-revalidate` como lo sirve Vercel):

| | azul de marca | loading usable |
|---|---|---|
| Antes | 289–356 ms | 719–963 ms |
| Relanzamiento con SW | **36–51 ms** | **172–180 ms** |

### Invariantes — no tocar sin releer esto

- **`html` y `html.has-bottom-nav` llevan `!important` en `src/index.css`. No es
  decorativo.** El `<style>` crítico va SIN capa, y en la cascada una declaración
  normal sin capa gana a cualquier declaración normal dentro de `@layer`, que es
  donde Tailwind v4 mete estas reglas. Sin `!important`, el bootstrap inline no
  caduca: deja `html` en `#0A4792` en TODAS las rutas y borra el alfa
  `#0A4792CC` de `html.has-bottom-nav`. No lo delata ningún build.
- **No reintroducir ninguna hoja de estilos render-blocking.** Una sola retiene el
  primer frame del documento entero y vuelve inerte el `<style>` crítico: medido,
  el azul pasaba de ~40 ms planos a 184/299/2045 ms según la latencia del CSS.
- **`#manises-css-gate` va emparejado con la clase `css-ready`.** Oculta `#root`
  mientras el bundle no se ha aplicado (al no bloquear, React puede montar antes:
  medido 146 ms vs 285 ms). Nadie debe ASIGNAR `documentElement.className` —solo
  `classList.add/remove/toggle`— o `css-ready` se borra y `#root` queda invisible.
- **`manifest: false` en vite-plugin-pwa.** `public/manifest.json` ya existe y
  lleva configuración de iOS validada en dispositivo; el manifest generado la
  pisaría.
- **Sin `skipWaiting`/`clientsClaim`.** Un worker nuevo espera y toma el control en
  el siguiente arranque, en vez de recargar la app en mitad de una sesión.
- **El runtime caching está acotado a mismo origen.** Firebase es cross-origin y no
  debe pasar por ahí.

### Valores de referencia (para detectar regresiones)

Fondo computado de `html`, con el bundle ya aplicado:

| Ruta | `html` |
|---|---|
| `/` (auth) | `rgb(10, 71, 146)` |
| `/home`, `/games` | `rgba(10, 71, 146, 0.8)` |
| `/play/*` | `rgb(59, 108, 168)` |

`body` es `#3B6CA8` salvo en auth, y `#root` debe acabar `visible` en todas.

### QA

- **Medir el SEGUNDO arranque.** El primero tras instalar paga la red igualmente:
  el service worker tiene que instalarse antes de poder servir nada.
- **Desinstalar y reinstalar la PWA** para reiniciar tanto el service worker como
  la caché de metas de iOS. Un build nuevo tarda un arranque en tomar el control,
  por diseño.

### Pendientes conocidos

- **No hay `apple-touch-startup-image`.** El negro que queda es la launch surface
  nativa de iOS. Eliminarlo exige una matriz de imágenes por resolución que
  coincida al píxel con el primer frame web, y para eso hace falta el isotipo en
  SVG o un master ≥512 px: el PNG actual de 48×60 se vería blando al lado del
  render CSS y delataría el relevo.
- **`theme-color` no coincide:** `#3B6CA8` en `index.html` vs `#285c9c` en
  `manifest.json`.
- **`npm run build` modifica el `index.html` versionado**, porque
  `prepare-ios-startup.mjs` escribe sobre el fuente antes de que corra Vite. No
  commitear esos bloques generados.
- **Color de los glifos del status bar en rutas privadas.** Con la banda en
  `#3B6CA8` (luminancia 0,145) iOS puede pintarlos oscuros; con `#0A4792` (0,066)
  los pinta claros. Pendiente de confirmar si `main` se comporta igual antes de
  tratarlo como regresión. Relacionado: `apple-mobile-web-app-status-bar-style:
  black-translucent` sin `viewport-fit=cover` es una combinación contradictoria.
