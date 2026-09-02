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

### `npm run dev` NO reproduce el arranque

Comprobado: en dev **no existe nada de esto**. Ni el `<style>` crítico, ni el
loader, ni la compuerta de `#root`. `scripts/prepare-ios-startup.mjs` solo corre
en `npm run build` (ver `package.json`), y el desbloqueo de la hoja de estilos no
tiene nada que transformar porque en dev Vite inyecta el CSS por JS.

No es un fallo: es que el arranque solo existe en un build de producción. Quien
trabaje en dev y eche en falta el loader, que no lo "arregle" — no está roto.
Para verlo: `npm run build` y servir `dist/`.

### QA

- **Medir el SEGUNDO arranque.** El primero tras instalar paga la red igualmente:
  el service worker tiene que instalarse antes de poder servir nada.
- **Desinstalar y reinstalar la PWA** para reiniciar tanto el service worker como
  la caché de metas de iOS. Un build nuevo tarda un arranque en tomar el control,
  por diseño.

## Toasts y status bar (rama `fix/toast-status-bar-tint`)

> Validado en iPhone físico: con los toasts sobre la superficie azul, los glifos
> del status bar dejan de ponerse oscuros.

El `Toaster` vive en `position="top-center"`, así que un toast aterriza pegado
bajo el status bar de iOS. Con `richColors`, sonner pintaba fondos casi blancos
por tipo —success `hsl(143,85%,96%)`, error, warning e info al 97%— y
`color-scheme: light` fuerza justo esos. Esa superficie clara bajo el status bar
era la que conmutaba los glifos del sistema a oscuro, y no los revertía al
desaparecer el toast. Estaba también en `main`: no lo introdujo el trabajo de
arranque.

Ahora los toasts van sobre `#0A4792` y el tipo lo lleva el color del icono,
mismo patrón que `ConnectionStatusBanner`. sonner mantiene un icono distinto por
tipo, así que el estado nunca queda codificado solo en color.

### Invariantes — dos selectores con especificidad deliberada

Ambos están en `src/shared/styles/toasts.css` y ninguno es cosmético:

- **`html [data-sonner-toaster][data-sonner-theme]`** — el `html` delante no
  sobra. sonner inyecta en runtime `[data-sonner-toaster][data-sonner-theme="light"]`
  con `--normal-bg:#fff`: son dos selectores de atributo, (0,2,0), insertados
  después del bundle. Un `[data-sonner-toaster]` a secas es (0,1,0) y pierde —
  se desplegó así una vez y el toast seguía saliendo blanco en el dispositivo.
- **`html [data-sonner-toaster] [data-sonner-toast][data-styled='true'] [data-description]`**
  — sonner inyecta esa descripción con un gris fijo `rgb(63,63,63)` a (0,3,0).
  Con `richColors` quedaba anulado por su propia regla `color:inherit`, así que
  al quitarlo el gris queda al descubierto: texto oscuro sobre azul oscuro.

**Cómo verificar un cambio aquí:** con un `<Toaster>` real de sonner y la hoja
de estilos ya construida, nunca contra un DOM montado a mano — las reglas que
compiten se inyectan en runtime y en un DOM fabricado no existen, así que un
selector demasiado débil parece funcionar.

Valores de referencia sobre `#0A4792`: título blanco (contraste 9,02),
descripción blanca al 78% (6,16), iconos success `#34D399`, error `#FB7185`,
warning `#F5C518`, info `#93C5FD` (3,35–5,53). Botón de acción dorado
`#F5C518` sobre texto `#0a4792`: el `#0a4792` anterior era invisible sobre el
nuevo fondo.

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
