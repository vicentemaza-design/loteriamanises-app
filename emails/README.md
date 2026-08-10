# Sistema de Comunicados por Email — Lotería Manises

Emails HTML transaccionales y de marketing compatibles con Microsoft Outlook, Gmail, Apple Mail y clientes web.

---

## Estructura de carpetas

```
emails/
  README.md                          ← Este archivo
  assets/
    ASSETS_LIST.md                   ← Imágenes necesarias y especificaciones
  templates/
    shared/
      _header.html                   ← Cabecera compartida (preheader + logo)
      _footer-contact.html           ← Footer oscuro con contacto y redes
      _footer-legal.html             ← Footer pie legal
    transaccional/
      recarga-transferencia.html     ← Solicitud de recarga por transferencia bancaria
    marketing/
      (vacío — futuros comunicados)
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
| `{{URL_FACEBOOK}}` | Perfil Facebook | `https://facebook.com/loteriamanises` |
| `{{URL_INSTAGRAM}}` | Perfil Instagram | `https://instagram.com/loteriamanises` |
| `{{URL_X_TWITTER}}` | Perfil X (Twitter) | `https://x.com/loteriamanises` |

### Variables específicas por plantilla

#### `recarga-transferencia.html`
| Variable | Descripción | Ejemplo |
|---|---|---|
| `{{NUMERO_SOLICITUD}}` | ID de la solicitud de recarga | `4773337` |
| `{{IMPORTE}}` | Importe solicitado formateado | `50,00 €` |
| `{{BENEFICIARIO}}` | Nombre del beneficiario | `LOTERÍA MANISES, S.L.` |
| `{{BANCO}}` | Nombre del banco | `Banco Sabadell` |
| `{{IBAN}}` | IBAN con espacios para legibilidad | `ES96 0081 0271 80 0001345344` |
| `{{URL_COPIAR_IBAN}}` | URL que copia el IBAN (opcional) | `https://app.loteriamanises.com/copy-iban/...` |
| `{{PLAZO_ESTIMADO}}` | Horas hábiles estimadas | `72` |

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
