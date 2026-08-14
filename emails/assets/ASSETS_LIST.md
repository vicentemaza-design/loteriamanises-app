# Assets de Email — Lotería Manises

URL base CDN: `https://cdn.loteriamanises.com/emails/`

Todas las imágenes deben estar en formato PNG (fondo transparente donde aplique) y subirse al CDN antes de enviar los emails en producción.

## Logo

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `logo-manises-full.png` | Cabecera email (fondo blanco) | 200px ancho | 400×120px @2x |
| `logo-manises-white.png` | Footer oscuro | 120px ancho | 240×72px @2x |

## Iconos de sección (hero)

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-transferencia.png` | Hero recarga transferencia | 90px ancho | 180×180px @2x |
| `icon-confirmacion.png` | Hero confirmación de pago | 90px ancho | 180×180px @2x |
| `icon-premio.png` | Hero notificación de premio | 90px ancho | 180×180px @2x |
| `icon-bienvenida.png` | Hero email de bienvenida | 90px ancho | 180×180px @2x |

## Iconos pequeños (tarjetas de datos)

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-solicitud.png` | N.º de solicitud | 24px ancho | 48×48px @2x |
| `icon-importe.png` | Importe | 24px ancho | 48×48px @2x |
| `icon-metodo.png` | Método de pago | 24px ancho | 48×48px @2x |
| `icon-banco-sm.png` | Sección "Datos para transferencia" | 16px ancho | 32×32px @2x |

## App

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `app-mockup.png` | Módulo promo app | 118px ancho | 236×567px @2x recomendado |
| `app-mockup-jugadas.png` | Segundo móvil para módulo promo app | 165×360px | Optimizado desde captura Mis jugadas |
| `app-mockups-duo.png` | Composición de dos móviles con carcasa para módulo promo app | 196px ancho | 250×384px con transparencia |
| `mockup-movil-email.png` | Preview local del módulo app con captura real | 118px ancho | 236×567px @2x recomendado |
| `badge-appstore.png` | Badge App Store | 132px ancho, altura automática | SVG/PNG oficial sin deformar |
| `badge-googleplay.png` | Badge Google Play | 130px ancho, altura automática | PNG oficial sin deformar |

> Los badges oficiales de App Store y Google Play están disponibles en:
> - App Store: https://developer.apple.com/app-store/marketing/guidelines/
> - Google Play: https://play.google.com/intl/en_us/badges/

## Redes sociales (footer)

| Archivo | Uso | Tamaño render | Tamaño fuente |
|---|---|---|---|
| `icon-facebook.png` | Facebook | 34px ancho | 68×68px @2x |
| `icon-instagram.png` | Instagram | 34px ancho | 68×68px @2x |
| `icon-x.png` | X (Twitter) | 34px ancho | 68×68px @2x |

> Usar iconos blancos sobre fondo transparente para que funcionen sobre el footer oscuro (#002B3D).

## Notas técnicas

- Formato: **PNG** con transparencia donde aplique; **JPG** solo para fotos o app mockup
- Resolución: **@2x** (doble de los píxeles de render) para pantallas Retina
- Peso: optimizar con TinyPNG o similar antes de subir al CDN
- Las imágenes deben ser accesibles sin autenticación (URL pública)
- Incluir siempre `alt` descriptivo en el HTML para cuando Outlook bloquee las imágenes
