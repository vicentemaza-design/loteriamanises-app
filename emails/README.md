# Sistema de Comunicados por Email — Lotería Manises

Emails HTML transaccionales y de marketing compatibles con Microsoft Outlook, Gmail, Apple Mail y clientes web.

---

## Estructura de carpetas

```
emails/
  README.md                          ← Este archivo
  EMAIL-DESIGN-GUIDE.md              ← Guía de diseño/construcción (leer antes de tocar un template)
  COMUNICACIONES-EMAIL-BE.md         ← Spec completa de variables por email, de cara al backend
  assets/
    ASSETS_LIST.md                   ← Imágenes necesarias y especificaciones
  scripts/                           ← build-previews.cjs, render-jpgs.cjs (Node + Playwright)
  templates/
    shared/
      _header.html                   ← Cabecera + hero compartida (patrón de color, ver EMAIL-DESIGN-GUIDE.md)
      _footer-contact.html           ← Footer oscuro con contacto y redes
      _footer-legal.html             ← Footer pie legal
    transaccional/                   ← 34 templates .html (auth, cuenta, abonos, juegos, nacional, recarga, wallet)
    marketing/
      (vacío — futuros comunicados)
  delivery/                          ← Carpeta de entrega para el cliente (regenerada, no editar a mano)
```

---

## Tecnología y compatibilidad

| Técnica            | Motivo                                                                 |
|--------------------|------------------------------------------------------------------------|
| XHTML 1.0 Transitional | DOCTYPE más compatible con Microsoft Outlook (Word engine)         |
| Tables para layout | Outlook no soporta flexbox/grid; las tablas son el único método fiable |
| CSS inline         | Gmail y Outlook eliminan `<style>` externo; todo debe ir inline        |
| `bgcolor` attribute | Outlook ignora `background-color` CSS en algunos contextos; usar attr  |
| MSO comments       | `<!--[if mso]>...<![endif]-->` para VML y overrides específicos Outlook |
| Media queries      | Responsive en Gmail, Apple Mail, Outlook.com — NO en Outlook desktop  |
| UTF-8              | Encoding declarado en meta; se pueden usar caracteres españoles directamente |

### Comportamiento en Outlook desktop (Windows)
Outlook usa el motor de renderizado de Microsoft Word, no un navegador. Consecuencias:
- **No hay border-radius** — los elementos redondeados aparecen cuadrados
- **No hay box-shadow** — sombras ignoradas
- **No hay media queries** — siempre muestra el layout de 600px (desktop)
- **No hay flexbox/grid** — todo debe ser tabla
- El email se ve bien, simplemente más "cuadrado" que en otros clientes

---

## Variables de plantilla

Las variables usan la sintaxis `{{VARIABLE}}` (compatible con Mustache, Handlebars, Jinja2…).

### Variables globales (todas las plantillas)
| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_USUARIO}}` | Nombre de pila del usuario | `Carlos` |
| `{{URL_VERSION_WEB}}` | Enlace a versión web del email | `https://app.loteriamanises.com/emails/...` |
| `{{URL_APP_STORE}}` | Enlace App Store | `https://apps.apple.com/...` |
| `{{URL_GOOGLE_PLAY}}` | Enlace Google Play | `https://play.google.com/...` |

### Enlaces fijos del footer
| Red | URL |
|---|---|
| Facebook | `https://www.facebook.com/LoteriaManises/` |
| Instagram | `https://www.instagram.com/loteriamanises/` |
| X (Twitter) | `https://x.com/loteriamanises` |

### Variables específicas por plantilla

Ver `COMUNICACIONES-EMAIL-BE.md` — documenta, para cada uno de los 34
templates, sus variables específicas, el contenido esperado y notas para
el backend. Es la fuente de verdad; no se duplica aquí para evitar que
ambos documentos queden desincronizados.

---

## Assets necesarios (imágenes)

Todas las imágenes deben estar en una URL absoluta y pública (CDN recomendado).
Ver `assets/ASSETS_LIST.md` para especificaciones completas.

**URL base sugerida:** `https://cdn.loteriamanises.com/emails/`

---

## Crear una nueva plantilla

1. Copiar `templates/transaccional/recarga-transferencia.html` como base
2. Mantener intactas las secciones marcadas con:
   - `<!-- == CABECERA COMPARTIDA (START/END) == -->`
   - `<!-- == FOOTER CONTACTO COMPARTIDO (START/END) == -->`
   - `<!-- == FOOTER LEGAL COMPARTIDO (END) == -->`
3. Reemplazar el bloque `<!-- == CONTENIDO ESPECÍFICO (START/END) == -->`
4. Actualizar `<title>` y el texto del `<!-- HIDDEN PREHEADER -->`
5. Documentar las nuevas variables en este README

---

## Testing recomendado

- **Litmus** o **Email on Acid** — previsualización en +90 clientes
- **Outlook 2016/2019/2021** en Windows (el más restrictivo)
- **Gmail** (web + Android + iOS)
- **Apple Mail** (Mac + iOS)
- **Outlook.com** (web)

Antes de envío a producción, verificar siempre con imágenes desactivadas (Outlook bloquea imágenes por defecto): el email debe ser legible solo con texto y `alt` attributes.
