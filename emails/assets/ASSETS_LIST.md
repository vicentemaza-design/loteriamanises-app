# Assets de Email — Lotería Manises

URL base CDN: `https://cdn.loteriamanises.com/emails/`

Todas las imágenes deben estar en formato PNG (fondo transparente donde aplique) y subirse al CDN antes de enviar los emails en producción. Las que no estén subidas aún deben crearse siguiendo el estilo de línea blanca simple ya usado en el resto del set (trazo ~1.8px, sin relleno, esquinas redondeadas) para mantener coherencia visual.

## Sistema de color de cabecera

Todas las cabeceras (excepto las de juego, ver más abajo) usan un degradado de 3 colores posibles, elegido según el tipo de mensaje — nunca fondo blanco liso:

| Color | Degradado (135deg) | Uso |
|---|---|---|
| Azul | `#0B2145 → #123B7A → #1565C0` | Informativo / transaccional rutinario (accesos, recargas, solicitudes, recordatorios) |
| Verde | `#0B3320 → #14532D → #1E7A45` | Positivo / hito (bienvenida, confirmaciones de éxito, premio) |
| Rojo | `#7A1620 → #A81F1F → #DC2626` | Cancelación / fallo / rechazo |

El logo en cabecera es siempre `logo-manises-white.png` (nunca la versión a color, que solo tiene sentido sobre fondo blanco y ya no se usa en cabeceras). El icono principal va en una insignia cuadrada redondeada translúcida (`background-color:rgba(255,255,255,0.15)`, `border-radius:20px`, 90×90px) que solo resulta visible sobre estos fondos de color — nunca sobre blanco.

El degradado se aplica semitransparente (alpha ~0.88) sobre `hero-bg.jpg` (foto de confeti/billetes cayendo, la misma imagen de la pantalla de login de la app), con `background-size:cover;background-position:center top`, igual que ya hacían los templates de juego. Así se ve el brillo/textura del confeti por debajo del color, en vez de un degradado completamente plano.

Excepción: los templates de **juego** (`juegos-*`, `nacional-recepcion-solicitud`, `nacional-confirmacion-pedido`) usan `{{HERO_COLOR}}` — el color oscuro de marca del juego concreto (ej. verde Bonoloto, rojo La Primitiva), que el BE resuelve por catálogo. Es un sistema distinto y no debe mezclarse con la paleta de 3 colores de mensaje.

## Logo

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `logo-manises-white.png` | Cabecera (sobre degradado de color) y footer oscuro | 190px ancho (cabecera) / 118–120px (footer) | 380×~114px @2x, fondo transparente |
| `logo-manises-color.png` | Sin uso actual en cabeceras; se mantiene solo por si algún email puntual necesita fondo blanco | 190px ancho | 380×~114px @2x |

## Iconos de cabecera (insignia cuadrada 90×90)

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-hero-lock-square.png` | Recuperar / crear contraseña | 90px | 216×216px, blanco sobre transparente |
| `icon-hero-email-square.png` | Solicitudes/comunicaciones recibidas por email | 90px | 216×216px |
| `icon-hero-user-square.png` | Bienvenida / cuenta | 90px | 216×216px |
| `icon-hero-device-square.png` | Nuevo acceso / dispositivo | 90px | 216×216px |
| `icon-x-white.png` | Cancelación / rechazo (aspa) | 46px | glifo simple, blanco |
| `icon-check-white.png` | Confirmación / éxito (check) | 46px | glifo simple, blanco |
| `icon-card-white.png` | Recarga / pago con tarjeta | 46px | glifo simple, blanco |
| `icon-truck-white.png` | Envío de pedido | 46px | glifo simple, blanco |
| `icon-trophy-white.png` | Premio (Lotería Nacional) | 40px | glifo simple, blanco |
| `icon-bell-white.png` | Recordatorio de abono | 40px | glifo simple, blanco — **pendiente de subir al CDN** |
| `icon-hero-pending.png` | Pedido recibido / pendiente (juegos) | 90px | ilustración autocontenida sobre `{{HERO_COLOR}}` |
| `icon-hero-check.png` | Pedido confirmado (juegos) | 90px | ilustración autocontenida |
| `icon-hero-prize.png` | Escrutinio con premio (juegos) | 90px | ilustración autocontenida |
| `icon-hero-no-prize.png` | Escrutinio sin premio (juegos) | 90px | ilustración autocontenida |
| `icon-hero-cancelled.png` | Pedido cancelado (juegos) | 90px | ilustración autocontenida |
| `hero-bg.jpg` | Foto de fondo de las 34 cabeceras (confeti/billetes cayendo, misma imagen de la pantalla de login de la app), bajo el degradado semitransparente | cover, top center | 807×1440px, JPG |

## Iconos pequeños (tarjetas de datos y avisos)

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-lock-white.png` | Aviso "imprescindible" (recarga por transferencia) | 24px | glifo simple, blanco |
| `icon-xcircle-navy.png` | Reservado — sin uso activo tras la limpieza de iconos decorativos en eyebrows | — | — |
| `icon-clock.png` / `icon-clock-amber-circle.png` | Plazos / avisos de tiempo | 24–28px | glifo simple — **pendientes de subir al CDN** |
| `icon-check.png` | Confirmaciones inline en listas | 20px | glifo simple — **pendiente de subir al CDN** |
| `icon-people-navy-circle.png` | Contacto / atención al cliente | 24px | glifo simple — **pendiente de subir al CDN** |
| `icon-solicitud.png` / `icon-importe.png` / `icon-metodo.png` / `icon-transferencia.png` / `icon-user.png` | Iconos de campo en tarjetas "Datos de tu solicitud" | 24px | glifos simples — **pendientes de subir al CDN** |

> Los ítems marcados "pendiente de subir al CDN" no existen aún como archivo real; los previews JPG usan un icono de sustitución generado localmente. Antes de enviar a producción hay que diseñarlos y subirlos con el nombre exacto indicado.

## Secuencias numeradas

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-step-1-navy.png` | Paso 1 en secuencias numeradas | 32px | círculo azul marino con "1", 64×64px |
| `icon-step-2-navy.png` | Paso 2 en secuencias numeradas | 32px | círculo azul marino con "2", 64×64px |
| `icon-step-3-navy.png` | Paso 3 en secuencias numeradas | 32px | círculo azul marino con "3", 64×64px |

## App

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `app-mockups-duo.png` | Composición de dos móviles para módulo promo app (todos los templates) | 196px ancho | 250×384px con transparencia |
| `app-mockup-jugadas.png` | Móvil individual — alternativa/reserva | 165×360px | Optimizado desde captura Mis jugadas |
| `mockup-movil-email.png` | Preview local del módulo app con captura real | 118px ancho | 236×567px @2x |
| `badge-appstore.png` | Badge App Store | 132px ancho, alto automático | SVG/PNG oficial sin deformar |
| `badge-googleplay.png` | Badge Google Play | 130px ancho, alto automático | PNG oficial sin deformar |

> Los badges oficiales de App Store y Google Play están disponibles en:
> - App Store: https://developer.apple.com/app-store/marketing/guidelines/
> - Google Play: https://play.google.com/intl/en_us/badges/

## Redes sociales (footer, fondo azul marino #0d1f40)

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-phone-hdr.png` | Icono de teléfono, columna "¿Necesitas ayuda?" | 36px ancho | 72×72px @2x, blanco |
| `icon-facebook.png` / `icon-facebook-light.png` | Facebook | 36px ancho | 72×72px @2x, blanco — ambos nombres son el mismo icono blanco, usar indistintamente |
| `icon-instagram.png` / `icon-instagram-light.png` | Instagram | 36px ancho | 72×72px @2x, blanco |
| `icon-x.png` / `icon-x-light.png` | X (Twitter) | 36px ancho | 72×72px @2x, blanco |

> Icono blanco sobre transparente: funciona igual en el footer oscuro que en cualquier hero de color. Las variantes "-light" existían como alias sueltos en algunos templates; se mantienen por compatibilidad pero apuntan al mismo diseño.

## Notas técnicas

- Formato: **PNG** con transparencia donde aplique; **JPG** solo para fotos o texturas (`hero-bg.jpg`)
- Resolución: **@2x** (doble de los píxeles de render) para pantallas Retina
- Peso: optimizar con TinyPNG o similar antes de subir al CDN
- Las imágenes deben ser accesibles sin autenticación (URL pública)
- Incluir siempre `alt` descriptivo en el HTML para cuando Outlook bloquee las imágenes
- Los iconos de insignia de cabecera y los glifos pequeños deben ser **trazo blanco simple**, sin relleno sólido pesado, para mantener coherencia entre los 34 templates
