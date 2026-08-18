# Guía de diseño y construcción de emails — Lotería Manises

> Referencia única para crear o modificar cualquier template de email HTML.
> Leer esta guía ANTES de tocar ningún template evita los errores que hemos
> corregido manualmente en sesiones anteriores.

---

## Índice

1. [Arquitectura de un template](#1-arquitectura-de-un-template)
2. [Sistema de diseño](#2-sistema-de-diseño)
3. [Reglas críticas de HTML email](#3-reglas-críticas-de-html-email)
4. [Bloques reutilizables — copiar y pegar](#4-bloques-reutilizables--copiar-y-pegar)
5. [Checklist antes de dar un template por terminado](#5-checklist-antes-de-dar-un-template-por-terminado)
6. [Variables disponibles por template](#6-variables-disponibles-por-template)
7. [Errores conocidos y sus causas](#7-errores-conocidos-y-sus-causas)
8. [Generar previews](#8-generar-previews)

---

## 1. Arquitectura de un template

Todo template sigue **exactamente** esta estructura de capas:

```
DOCTYPE XHTML 1.0 Transitional
└── <html> (con namespaces VML y Office)
    ├── <head>
    │   ├── MSO OfficeDocumentSettings (condicional)
    │   ├── <style> — reset + responsive
    │   └── Bloque de comentario con variables del template
    └── <body id="body">
        └── [WRAPPER] table width="100%" bgcolor="#EEF2FF"
            └── <td align="center" padding:24px 0 32px>
                └── [CONTENEDOR] table width="600" class="email-container"
                    │  (max-width:600px, border-radius:14px, box-shadow azul)
                    │
                    ├── [PREHEADER OCULTO] — preview text del cliente de email
                    ├── [CABECERA] — logo o hero con logo
                    ├── [HERO] — título + intro (inline con cabecera o separado)
                    │
                    ├── [CONTENIDO ESPECÍFICO]
                    │   └── ... bloques según el tipo de email ...
                    │
                    ├── [SEPARADOR ACENTO] — línea #1565C0, height:2px
                    ├── [FOOTER CONTACTO] — bgcolor:#0d1f40
                    └── [FOOTER LEGAL] — bgcolor:#091730
```

### Cabecera: un único patrón, 3 colores de mensaje

**Regla fija: la cabecera nunca lleva fondo blanco.** Cabecera y hero van
integrados en un único `<td>` con `bgcolor` + `background-image` en
degradado (135deg, 3 paradas), logo `logo-manises-white.png` centrado
arriba, y el icono principal en una insignia cuadrada redondeada
translúcida de 90×90px (`background-color:rgba(255,255,255,0.15)`,
`border-radius:20px`). Esa insignia solo se ve bien sobre fondo de color:
si el hero fuera blanco el icono queda "lavado" — es el motivo por el que
existía antes una variante B de fondo blanco y se eliminó.

El color se elige según el tipo de mensaje, no por template:

| Color | Degradado (135deg) | Cuándo usarlo |
|---|---|---|
| Azul | `#0B2145 → #123B7A → #1565C0` | Informativo / transaccional rutinario (accesos, recargas, solicitudes, recordatorios, envíos) |
| Verde | `#0B3320 → #14532D → #1E7A45` | Positivo / hito (bienvenida, confirmación de éxito, premio) |
| Rojo | `#7A1620 → #A81F1F → #DC2626` | Cancelación / fallo / rechazo |

Excepción: `juegos-*`, `nacional-recepcion-solicitud` y
`nacional-confirmacion-pedido` no usan esta paleta — llevan
`{{HERO_COLOR}}` e `{{HERO_IMAGE_URL}}`, el color e imagen de marca del
juego concreto que resuelve el backend por catálogo. No mezclar los dos
sistemas: un email de juego se tiñe del color del juego, todo lo demás
usa uno de los 3 colores de mensaje.

Ver `emails/templates/shared/_header.html` para el bloque copiar-y-pegar
completo, y `ASSETS_LIST.md` → "Sistema de color de cabecera" para la
tabla de referencia rápida.

---

## 2. Sistema de diseño

### Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `--blue-brand` | `#1565C0` | Color principal, links, acentos, botones primarios |
| `--blue-dark` | `#0a4792` / `#1E3A5F` | Títulos y textos de peso |
| `--blue-hero` | `#052a5a` | Fondo hero variante A |
| `--blue-light` | `#EEF2FF` | Fondo del wrapper exterior, separadores suaves |
| `--blue-muted` | `#DBEAFE` | Chips/badges inline, fondo sección datos |
| `--green-success` | `#16A34A` | Icono círculo confirmación, borde info-box verde |
| `--green-bg` | `#F0FDF4` | Fondo info-box verde |
| `--green-border` | `#BBF7D0` | Borde info-box verde |
| `--green-text` | `#14532D` | Título dentro de info-box verde |
| `--orange-warn` | `#EA580C` | Icono círculo advertencia |
| `--red-error` | `#DC2626` | Importe cancelado, estados de error |
| `--red-bg` | `#FEF2F2` | Fondo fila importe cancelado |
| `--red-border` | `#FECACA` | Borde fila importe cancelado |
| `--slate-muted` | `#64748B` | Icono círculo neutro (cancelación MOTIVO) |
| `--footer-bg` | `#0d1f40` | Fondo footer contacto |
| `--footer-legal-bg` | `#091730` | Fondo footer legal |
| `--text-primary` | `#1E3A5F` | Texto principal |
| `--text-secondary` | `#4B5563` / `#334155` | Texto secundario |
| `--text-muted` | `#9CA3AF` / `#6B7280` | Labels, metadatos |
| `--border-light` | `#F3F4F6` | Separadores entre filas |
| `--border-medium` | `#E5E7EB` | Separadores de sección |

### Tipografía

- **Fuente única**: `'Inter', Arial, Helvetica, sans-serif` — siempre en este orden
- **Monospace** (solo para IBAN o códigos): `'Courier New', Courier, monospace`
- **No usar fuentes de sistema distintas** — Outlook no las soporta

| Rol | Size | Weight | Color |
|---|---|---|---|
| H1 hero | 22–24px | 700 | #FFFFFF |
| H2 sección | 16–18px | 700 | #0a4792 / #1E3A5F |
| H3 subsección | 15px | 700 | #1E3A5F |
| Eyebrow / label de sección | 10–11px | 700 | #1565C0, uppercase, letter-spacing:0.1em |
| Cuerpo | 13–14px | 400 | #4B5563 / #334155 |
| Caption / metadato | 11–12px | 400 | #6B7280 / #9CA3AF |
| Valor destacado (importe) | 20–22px | 700 | Según contexto |
| IBAN | 21px | 700 | #1565C0, monospace, letter-spacing:3px |

### Espaciado

- **Padding de sección**: `padding:24px 24px` (horizontal) — consistente en todo el contenido
- **Padding del hero**: `padding:28px 24px 38px`
- **Gap entre elementos dentro de sección**: margen inferior del párrafo `8–14px`
- **Padding de tarjetas blancas** (data cards): `padding:14px 10px`
- **Padding de info-boxes**: `padding:14px 18px` (interior) + `padding:12px 24px 0` (celda exterior)
- **Ancho contenedor**: 600px fijo (máximo), 100% en móvil

---

## 3. Reglas críticas de HTML email

### ⚠️ La regla más importante: `border-collapse` vs `border-radius`

El CSS global del template incluye:
```css
table { border-collapse: collapse !important; }
```

Esta regla **impide que `border-radius:50%` funcione en `<td>`**. Para crear
iconos circulares, la tabla que envuelve el círculo DEBE declarar en su atributo
`style` inline:

```html
<table ... style="border-collapse:separate !important;">
```

Los estilos inline tienen especificidad mayor que un selector de tipo (`table`)
aunque ese selector use `!important`. Sin esto, los iconos quedan achatados
(cuadrados o rectangulares).

### Reglas generales

| Regla | Razón |
|---|---|
| Todo CSS en **inline style** (atributos `style="..."`) | Outlook 2013–2021 ignora `<style>` en el body |
| Usar siempre `bgcolor=""` además de `style="background-color:"` | Outlook no interpreta background-color sin bgcolor |
| Imágenes: siempre `width=""` + `style="width:Xpx"` | Evita escalado inesperado en Outlook |
| `border-radius` en `<table>`, nunca en `<td>` | Outlook ignora border-radius en celdas |
| Botones principales con VML condicional para Outlook | Sin VML, el botón aparece como link plano en Outlook |
| `mso-line-height-rule:exactly` junto a `line-height` fijo | Outlook ajusta line-height automáticamente sin esto |
| `role="presentation"` en todas las tablas de layout | Accesibilidad (lectores de pantalla) |
| Caracteres especiales como entidades HTML | `&amp;`, `&iacute;`, `&eacute;`, `&ntilde;`, etc. |
| `<!--[if mso | IE]>...<![endif]-->` para contenidos compatibles con Outlook | Permite ajustar layout específico para Word-rendering |

### Estructura DOCTYPE obligatoria

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="es"
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
```

---

## 4. Bloques reutilizables — copiar y pegar

### 4.1 Icono circular (badge)

Usa este patrón **siempre** para iconos de símbolo (✓, i, !, 1, 2, 3…).
Cambia `bgcolor`, `background-color` y el carácter interior según el contexto.

```html
<td width="42" valign="top"
    style="vertical-align:top;padding-right:14px;padding-top:2px;width:42px;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="28"
         style="border-collapse:separate !important;">
    <tr>
      <td width="28" height="28" bgcolor="AQUÍ_EL_COLOR"
          style="background-color:AQUÍ_EL_COLOR;border-radius:50%;
                 width:28px;height:28px;text-align:center;vertical-align:middle;
                 line-height:28px;mso-line-height-rule:exactly;">
        <span style="font-family:Arial,Helvetica,sans-serif;
                     font-size:16px;font-weight:700;color:#FFFFFF;
                     line-height:28px;mso-line-height-rule:exactly;">
          AQUÍ_EL_SÍMBOLO
        </span>
      </td>
    </tr>
  </table>
</td>
```

| Tipo | bgcolor | Símbolo | font-size |
|---|---|---|---|
| Confirmación (✓ verde) | `#16A34A` | `&#10003;` | 16px |
| Información (i azul) | `#2563EB` | `i` | 15px |
| Advertencia (! naranja) | `#EA580C` | `!` | 16px |
| Paso numerado (1, 2, 3 azul) | `#1565C0` | `1` / `2` / `3` | 14px |

### 4.2 Info-box con borde izquierdo de color

Patrón estándar para bloques informativos (verde, azul, naranja, gris).
La `<td>` exterior tiene `padding:12px 24px 0` para separación de la sección
anterior y el `0` abajo evita doble espaciado si hay CTA justo después.

```html
<!-- INFO BOX [COLOR] -->
<tr>
  <td bgcolor="#EEF2FF" style="background-color:#EEF2FF;padding:12px 24px 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
           style="background-color:BG_COLOR;border-radius:0 10px 10px 0;
                  border:1px solid BORDER_COLOR;border-left:4px solid ACCENT_COLOR;">
      <tr>
        <td style="padding:14px 18px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <!-- Icono circular (sección 4.1) -->
              <td width="42" valign="top"
                  style="vertical-align:top;padding-right:14px;padding-top:2px;width:42px;">
                ... icono circular aquí ...
              </td>
              <!-- Texto -->
              <td valign="top" style="vertical-align:top;">
                <p style="margin:0 0 3px 0;
                           font-family:'Inter',Arial,Helvetica,sans-serif;
                           font-size:13px;font-weight:700;color:TITLE_COLOR;
                           line-height:1.4;">
                  Título del mensaje
                </p>
                <p style="margin:0;
                           font-family:'Inter',Arial,Helvetica,sans-serif;
                           font-size:12px;color:#334155;line-height:1.6;">
                  Texto descriptivo del mensaje informativo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

| Variante | BG_COLOR | BORDER_COLOR | ACCENT_COLOR | TITLE_COLOR |
|---|---|---|---|---|
| Verde (éxito) | `#F0FDF4` | `#BBF7D0` | `#16A34A` | `#14532D` |
| Azul (info) | `#EEF2FF` | `#C7D7F9` | `#1565C0` | `#0a4792` |
| Naranja (aviso) | `#FFF7ED` | `#FED7AA` | `#EA580C` | `#7C2D12` |
| Rojo (error) | `#FEF2F2` | `#FECACA` | `#DC2626` | `#991B1B` |
| Gris (neutro) | `#F8FAFC` | `#E2E8F0` | `#64748B` | `#1E3A5F` |

### 4.3 Botón CTA principal (Outlook + web)

```html
<tr>
  <td style="padding:20px 24px 24px;text-align:center;background-color:#FFFFFF;">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      href="{{URL_CTA}}"
      style="height:44px;v-text-anchor:middle;width:260px;"
      arcsize="50%" strokecolor="#1565C0" fillcolor="#1565C0">
      <w:anchorlock/>
      <center style="color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;
                     font-size:15px;font-weight:700;">
        Texto del botón
      </center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <a href="{{URL_CTA}}"
       style="display:inline-block;padding:13px 36px;
              background-color:#1565C0;border-radius:24px;
              font-family:'Inter',Arial,Helvetica,sans-serif;
              font-size:15px;font-weight:700;color:#FFFFFF;
              text-decoration:none;line-height:normal;
              mso-hide:all;">
      Texto del botón
    </a>
    <!--<![endif]-->
  </td>
</tr>
```

**Botón outline** (secundario, sin relleno):
- Cambia `fillcolor="#FFFFFF"` y `strokecolor="#1565C0"` en VML
- En el `<a>`: `background-color:#FFFFFF;border:1.5px solid #1565C0;color:#1565C0`
- `arcsize="50%"` → píldora; para rectángulo con redondeo menor usar `arcsize="15%"`

### 4.4 Separador de sección con eyebrow label

```html
<tr>
  <td bgcolor="#FFFFFF"
      style="background-color:#FFFFFF;padding:24px 24px 0;">
    <!-- Eyebrow -->
    <p style="margin:0 0 14px 0;
               font-family:'Inter',Arial,Helvetica,sans-serif;
               font-size:10px;font-weight:700;color:#1565C0;
               letter-spacing:0.1em;text-transform:uppercase;line-height:1.4;">
      TÍTULO DE SECCIÓN
    </p>
    <!-- Línea separadora debajo del eyebrow (opcional) -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="border-bottom:1px solid #E5E7EB;font-size:0;line-height:0;
                   padding-bottom:16px;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>
```

### 4.5 Fila de dato label / valor

```html
<tr>
  <td style="border-bottom:1px solid #F3F4F6;padding:13px 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td width="140"
            style="font-family:'Inter',Arial,Helvetica,sans-serif;
                   font-size:13px;color:#9CA3AF;vertical-align:top;
                   padding-right:12px;">
          Etiqueta del dato
        </td>
        <td style="font-family:'Inter',Arial,Helvetica,sans-serif;
                   font-size:14px;font-weight:600;color:#1E3A5F;
                   vertical-align:top;">
          {{VALOR_VARIABLE}}
        </td>
      </tr>
    </table>
  </td>
</tr>
```

### 4.6 Tarjetas de resumen en 3 columnas (mini data cards)

```html
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <!-- Columna 1 -->
    <td class="data-card" valign="top"
        style="vertical-align:top;padding-right:5px;width:33.33%;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td bgcolor="#FFFFFF"
              style="background-color:#FFFFFF;border-radius:10px;
                     padding:14px 10px;text-align:center;">
            <img src="https://cdn.loteriamanises.com/emails/ICON.png"
                 width="36" alt=""
                 style="display:block;margin:0 auto 10px;width:36px;height:auto;border:0;" />
            <p style="margin:0 0 3px 0;
                       font-family:'Inter',Arial,Helvetica,sans-serif;
                       font-size:10px;color:#6B7280;line-height:1.4;">
              Label
            </p>
            <p style="margin:0;
                       font-family:'Inter',Arial,Helvetica,sans-serif;
                       font-size:15px;font-weight:700;color:#1E3A5F;
                       line-height:1.3;">
              {{VALOR}}
            </p>
          </td>
        </tr>
      </table>
    </td>
    <!-- Columna 2: padding:0 3px -->
    <!-- Columna 3: padding-left:5px -->
  </tr>
</table>
```

En móvil la clase `.data-card` hace `display:block;width:100%` (definida en `<style>`).

### 4.7 Paso numerado (pasos de un proceso)

```html
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <!-- Número circular (ver sección 4.1, bgcolor:#1565C0) -->
    <td width="42" valign="top"
        style="vertical-align:top;padding-right:14px;padding-top:2px;width:42px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="28"
             style="border-collapse:separate !important;">
        <tr>
          <td width="28" height="28" bgcolor="#1565C0"
              style="background-color:#1565C0;border-radius:50%;
                     width:28px;height:28px;text-align:center;vertical-align:middle;
                     line-height:28px;mso-line-height-rule:exactly;">
            <span style="font-family:Arial,Helvetica,sans-serif;
                         font-size:14px;font-weight:700;color:#FFFFFF;
                         line-height:28px;mso-line-height-rule:exactly;">1</span>
          </td>
        </tr>
      </table>
    </td>
    <!-- Contenido del paso -->
    <td valign="top" style="vertical-align:top;">
      <p style="margin:0 0 4px 0;
                 font-family:'Inter',Arial,Helvetica,sans-serif;
                 font-size:13px;font-weight:700;color:#1E3A5F;line-height:1.4;">
        Título del paso
      </p>
      <p style="margin:0;
                 font-family:'Inter',Arial,Helvetica,sans-serif;
                 font-size:13px;color:#4B5563;line-height:1.6;">
        Descripción del paso.
      </p>
    </td>
  </tr>
</table>
```

### 4.8 Fila con importe destacado (cancelación / premio)

```html
<tr>
  <td style="padding:16px 20px;background-color:#FEF2F2;border-top:1px solid #FECACA;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="font-family:'Inter',Arial,Helvetica,sans-serif;
                   font-size:11px;font-weight:600;color:#991B1B;
                   text-transform:uppercase;letter-spacing:0.07em;vertical-align:middle;">
          Importe cancelado
        </td>
        <td style="text-align:right;
                   font-family:'Inter',Arial,Helvetica,sans-serif;
                   font-size:22px;font-weight:700;color:#DC2626;
                   vertical-align:middle;letter-spacing:-0.01em;">
          {{IMPORTE_CANCELADO}}
        </td>
      </tr>
    </table>
  </td>
</tr>
```

Para premios positivos cambia los colores: `#14532D` (label), `#16A34A` (valor), bg `#F0FDF4`, border `#BBF7D0`.

### 4.9 Preheader oculto (preview text)

Va como **primer `<tr>`** dentro del contenedor de 600px:

```html
<tr>
  <td style="display:none;font-size:1px;line-height:1px;max-height:0;
             max-width:0;opacity:0;overflow:hidden;mso-hide:all;
             font-family:'Inter',Arial,Helvetica,sans-serif;">
    Texto que aparece en la bandeja de entrada junto al asunto.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </td>
</tr>
```

Los `&zwnj;&nbsp;` al final "rellenan" el espacio para que los clientes de email
no añadan texto del cuerpo del correo al preheader.

### 4.10 Separador acento azul (entre contenido y footer)

```html
<tr>
  <td bgcolor="#1565C0"
      style="background-color:#1565C0;height:2px;font-size:0;line-height:0;">&nbsp;</td>
</tr>
```

---

## 5. Checklist antes de dar un template por terminado

### Estructura

- [ ] DOCTYPE XHTML 1.0 Transitional presente
- [ ] `xmlns:v` y `xmlns:o` declarados en `<html>`
- [ ] MSO `OfficeDocumentSettings` en `<!--[if mso]>` presente en `<head>`
- [ ] Bloque `<style>` con reset completo (box-sizing, text-size-adjust, mso-table, img, body, `table { border-collapse:collapse !important }`)
- [ ] `@media only screen and (max-width:620px)` con clases responsive declaradas
- [ ] Preheader oculto presente como primer `<tr>`
- [ ] Wrapper externo: `table width="100%" bgcolor="#EEF2FF"`
- [ ] Contenedor 600px: `width="600"` + `max-width:600px` + `border-radius:14px` + `box-shadow`
- [ ] Separador acento azul antes del footer
- [ ] Footer contacto (`bgcolor:#0d1f40`) presente
- [ ] Footer legal (`bgcolor:#091730`) presente
- [ ] `</body>` y `</html>` al final

### Balance de etiquetas

Contar aperturas y cierres con:
```bash
grep -c '<table' template.html   # debe igualar a:
grep -c '</table>' template.html
grep -c '<tr>' template.html     # debe igualar a:
grep -c '</tr>' template.html
grep -c '<td' template.html      # debe igualar a:
grep -c '</td>' template.html
```

### Iconos circulares

- [ ] Cada icono circular usa una `<table>` interior con `style="border-collapse:separate !important;"`
- [ ] La `<td>` del círculo tiene `width="28" height="28"` como **atributos HTML** (no solo CSS)
- [ ] La `<td>` del círculo tiene `bgcolor="COLOR"` como **atributo HTML** (no solo CSS)
- [ ] Dimensiones 28×28px (no 20×20)
- [ ] `mso-line-height-rule:exactly` en la `<td>` y en el `<span>` interior
- [ ] `line-height:28px` en el `<span>` interior

### Botones CTA

- [ ] VML condicional `<!--[if mso]>...<![endif]-->` presente para Outlook
- [ ] Alternativa `<!--[if !mso]><!--> ... <!--<![endif]-->` presente para el resto
- [ ] `mso-hide:all` en el `<a>` del bloque no-MSO

### Imágenes CDN

- [ ] Base URL: `https://cdn.loteriamanises.com/emails/`
- [ ] Todos los `<img>` tienen `width=""` como atributo HTML y `style="width:Xpx"`
- [ ] `alt=""` (vacío para iconos decorativos, descriptivo para imágenes de contenido)
- [ ] `border="0"` en todos los `<img>`
- [ ] `display:block` en todos los `<img>` (evita espacio blanco en bottom)

### Variables

- [ ] Todas las variables `{{NOMBRE}}` del template están documentadas en el bloque de comentario en `<head>`
- [ ] Las variables coinciden con las que el BE enviará (ver `COMUNICACIONES-EMAIL-BE.md`)
- [ ] El script de preview `gen_email_preview5.py` tiene valores demo para todas las variables del template

### Accesibilidad / compatibilidad

- [ ] `role="presentation"` en todas las tablas de layout
- [ ] `lang="es"` en `<html>`
- [ ] Caracteres especiales como entidades HTML (`&iacute;`, `&eacute;`, `&ntilde;`, `&ordm;`, `&middot;`…)
- [ ] `id="body"` en `<body>` (necesario para la regla de links de Apple Mail)

---

## 6. Variables disponibles por template

### Variables comunes (todos los templates)

```
{{NOMBRE_USUARIO}}    — Nombre del destinatario
{{URL_VERSION_WEB}}   — Enlace "ver en navegador"
{{URL_APP_STORE}}     — Enlace App Store
{{URL_GOOGLE_PLAY}}   — Enlace Google Play
```

Los enlaces sociales del footer son fijos:

```
Facebook   — https://www.facebook.com/LoteriaManises/
Instagram  — https://www.instagram.com/loteriamanises/
X          — https://x.com/loteriamanises
```

### juegos-recepcion-pedido

```
{{NOMBRE_JUEGO}} {{HERO_COLOR}} {{HERO_IMAGE_URL}}
{{NUM_SORTEOS}} {{NUM_APUESTAS}} {{IMPORTE_TOTAL}}
{{BLOQUE_APUESTAS}} {{BLOQUE_SORTEOS}} {{NUMERO_PEDIDO}}
{{FECHA_RECEPCION}}
```

### juegos-confirmacion-pedido

```
{{NOMBRE_JUEGO}} {{HERO_COLOR}} {{HERO_IMAGE_URL}}
{{NUM_SORTEOS}} {{NUM_APUESTAS}} {{IMPORTE_TOTAL}}
{{BLOQUE_APUESTAS}} {{NUMERO_PEDIDO}}
{{FECHA_RECEPCION}} {{FECHA_CONFIRMACION}}
{{URL_COMPRA_CERTIFICADA}}
```

### juegos-escrutado

```
{{NOMBRE_JUEGO}} {{HERO_COLOR}} {{HERO_IMAGE_URL}}
{{ESTADO_ESCRUTINIO}}           — "premiado" | "sin_premio"
{{PREMIO_LABEL}}                — "PREMIO" | "RESULTADO"
{{PREMIO_IMPORTE}}              — "1.250,00 €" | "Sin premio"
{{NOMBRE_SORTEO}} {{FECHA_SORTEO}}
{{BLOQUE_APUESTAS_PREMIADAS}}   — HTML de filas de apuestas (puede ser vacío)
{{NUMERO_PEDIDO}} {{FECHA_COMPRA}}
```

### juegos-cancelacion-pedido

```
{{NOMBRE_JUEGO}} {{HERO_COLOR}} {{HERO_IMAGE_URL}}
{{NUMERO_PEDIDO}} {{FECHA_PEDIDO}} {{IMPORTE_CANCELADO}}
{{MOTIVO_CANCELACION}}
```

### nacional-recepcion-solicitud

```
{{TIPO_LOTERIA}}                — "Navidad" | "El Niño" | "Primitiva"…
{{HERO_COLOR}} {{HERO_IMAGE_URL}}
{{NUMERO_PEDIDO}} {{FECHA_SOLICITUD}} {{IMPORTE_TOTAL}}
{{BLOQUE_NUMEROS}}              — HTML de filas de números
```

### nacional-confirmacion-pedido

```
{{TIPO_LOTERIA}} {{HERO_COLOR}} {{HERO_IMAGE_URL}}
{{NUMERO_PEDIDO}} {{FECHA_CONFIRMACION}} {{IMPORTE_TOTAL}}
{{BLOQUE_NUMEROS}}
{{URL_COMPRA_CERTIFICADA}}
```

### recarga-transferencia

```
{{NUMERO_SOLICITUD}} {{IMPORTE}}
{{BENEFICIARIO}} {{BANCO}} {{IBAN}}
{{URL_COPIAR_IBAN}} {{PLAZO_ESTIMADO}}
```

---

## 7. Errores conocidos y sus causas

### Iconos circulares "achatados" (cuadrados)

**Causa**: `table { border-collapse:collapse !important }` en el CSS global impide
que `border-radius:50%` se aplique en `<td>`.

**Fix**: La tabla que envuelve el `<td>` del círculo debe tener
`style="border-collapse:separate !important;"` en su atributo inline.

### Icono de cabecera "lavado" / apenas visible

**Causa**: la insignia translúcida (`background-color:rgba(255,255,255,0.15)`)
está pensada para leerse sobre un degradado de color. Si el `<td>` de la
cabecera tiene `bgcolor:#FFFFFF` (o cualquier fondo claro), la insignia se
vuelve casi invisible y el icono blanco interior queda sin contraste.

**Fix**: la cabecera nunca lleva fondo blanco — usar siempre uno de los 3
degradados de la paleta de mensaje (ver §2 "Cabecera: un único patrón, 3
colores de mensaje"). No intentar arreglarlo oscureciendo solo la caja del
icono; el problema es el fondo del `<td>` padre, no la insignia.

### Hero box / recuadro con borde visible no deseado

**Causa**: Algún `border:1px solid rgba(...)` en la `<td>` del recuadro.

**Fix**: Eliminar la propiedad `border:` y, si es necesario, reducir levemente
la opacidad del `background-color` (ej. de `0.18` a `0.13`) para mantener
la delimitación visual sin borde explícito.

### Estructura rota: etiquetas de cierre huérfanas o CTA dentro de info-box

**Causa**: Manipulación con regex (`re.search` con `re.DOTALL`) que extrae bloques
incorrectamente al reformatear el HTML.

**Fix**: Editar el HTML quirúrgicamente, línea a línea, verificando el balance
de `<table>`/`</table>` antes y después. Nunca usar scripts de reemplazo por regex
en bloques de HTML anidado sin verificar el conteo de etiquetas.

### `{{VARIABLE}}` aparece sin sustituir en el email enviado

**Causa**: La variable no está en el payload JSON que el backend envía al motor
de plantillas, o el nombre no coincide exactamente (mayúsculas/guiones bajos).

**Fix**: Verificar en `COMUNICACIONES-EMAIL-BE.md` que la variable está documentada
y que el backend la incluye con el nombre exacto.

### `{{VARIABLE}}` no aparece en la preview generada por `gen_email_preview5.py`

**Causa**: La variable no está en el dict `TEMPLATE_VARS["nombre-template"]`
del script.

**Fix**: Añadir la clave `"{{VARIABLE}}": "valor demo"` al dict correspondiente.

### Fondo blanco de body visible alrededor del email en clientes que usan dark mode

**Causa**: El `<body>` tiene `background-color:#EEF2FF` pero algunos clientes
en dark mode sobreescriben esto.

**Fix**: No hay solución 100% universal. El wrapper exterior `table` también
tiene `bgcolor="#EEF2FF"` para reducir el problema en la mayoría de clientes.

---

## 8. Generar previews y JPGs

Los scripts viven en `emails/scripts/` (Node + Playwright, requiere
`npm install` una vez en la raíz del repo). A diferencia de versiones
anteriores de esta guía, **no dependen de un script en `/tmp`** — son
parte del repo y reproducibles por cualquiera.

```bash
# 1) (solo si se añaden filenames CDN nuevos que nunca se hayan usado)
node emails/scripts/extract-assets.cjs

# 2) Regenerar *-preview.html a partir del .html base — sobrescribe en sitio
node emails/scripts/build-previews.cjs                      # los 34
node emails/scripts/build-previews.cjs --only=nombre-template  # solo uno

# 3) Renderizar los *-preview.html a JPG recortado — sobrescribe en sitio
node emails/scripts/render-jpgs.cjs
node emails/scripts/render-jpgs.cjs --only=nombre-template
```

`build-previews.cjs` hace tres cosas con el `.html` base:
1. Quita los bloques `<!--[if mso]>...<![endif]-->` (solo hacen falta en
   Outlook, no en un JPG) y desenvuelve `<!--[if !mso]><!-->...<!--<![endif]-->`.
2. Resuelve toda imagen CDN a un `data:` URI usando
   `emails/scripts/asset-map.json` (o el archivo real en `emails/assets/`
   cuando existe localmente); si un filename no está mapeado, genera un
   icono de sustitución simple en vez de dejar la imagen rota.
3. Sustituye `{{VARIABLE}}` por un valor de ejemplo (diccionario genérico
   en el propio script, con overrides por template cuando un mismo
   `{{TOKEN}}` debe repetirse con valores distintos en un email).

Importante: `emails/templates/transaccional/*-preview.html` está en
`.gitignore` — son artefactos generados, nunca la fuente de verdad. La
fuente de verdad es siempre el `.html` base. Si algo se ve mal en un
preview, el fix va en el `.html` base y se regenera el preview, nunca al
revés.

### `asset-map.json` — cuándo tocarlo

Contiene el mapeo `filename-cdn.png → data URI` usado para los previews.
Si añades un icono nuevo:
- Si ya existe como archivo real en `emails/assets/`, no necesitas tocar
  el mapa — `build-previews.cjs` lo detecta solo por nombre de archivo.
- Si no existe como archivo real (solo se referencia por URL CDN),
  añade una entrada manual en `asset-map.json` con un SVG simple en
  base64 (ver las entradas existentes como plantilla), en vez de dejar
  que caiga en el icono de sustitución genérico.

### Añadir una nueva variable demo

Edita el diccionario `GENERIC` en `emails/scripts/build-previews.cjs`
(un patrón de regex por familia de variable), o añade un override
específico del template en el objeto `OVERRIDES` del mismo archivo
cuando el valor por defecto no sea el adecuado.

---

## Estructura de carpetas de referencia

```
emails/
├── assets/                       — Imágenes locales reales + ASSETS_LIST.md
├── scripts/                      — build-previews.cjs, render-jpgs.cjs, extract-assets.cjs, asset-map.json
├── templates/
│   ├── shared/
│   │   ├── _header.html          — Cabecera + hero, patrón único de color (referencia)
│   │   ├── _footer-contact.html  — Footer contacto (3 columnas)
│   │   └── _footer-legal.html    — Footer legal (1 línea)
│   └── transaccional/            — 34 templates .html (fuente de verdad) + *-preview.html (generados, gitignored)
├── delivery/                     — Carpeta de entrega para el cliente (gitignored, se regenera entera)
│   ├── loteria-manises-email-templates-be-20260814/  — copia BE-ready de templates + previews + assets
│   └── previews-jpg-cropped-20260817/                — 34 JPG, uno por template
├── COMUNICACIONES-EMAIL-BE.md    — Spec de integración con el backend
├── README.md                     — Visión general del sistema de emails
└── EMAIL-DESIGN-GUIDE.md         — ← ESTE ARCHIVO
```
