# Estado de los correos — 14/09/2026

Lee esto antes de tocar una plantilla. Resume qué se corrigió, por qué, qué
está pendiente y de quién, y cómo comprobar que no se rompe nada.

Complementa a `EMAIL-DESIGN-GUIDE.md` (reglas de construcción) y a
`COMUNICACIONES-EMAIL-BE.md` (variables por correo).

---

## 1. De dónde viene esto

El cliente reportó que en Outlook de escritorio los iconos de cabecera salían
cuadrados y de otro color, y que en Outlook web se veían bien. Al investigarlo
aparecieron tres problemas encadenados, dos de ellos mucho mayores que el
reportado.

### 1.1 El repositorio y la entrega aprobada estaban bifurcados

El ZIP aprobado (`loteriamanises-email-templates-outlook`, 24/08 a las 11:25) y
el commit `7df00f3` (24/08 a las 13:00) divergieron. El paquete aplicó las
mejoras de agosto a las 34 plantillas; el commit solo a 11.

Resultado: el ZIP tenía los iconos circulares de 24 px en las 34 y el
repositorio solo en 12, mientras que el repositorio tenía refinamientos
posteriores en esas 11 que el ZIP no. **Ninguno era superconjunto del otro.**

Reconciliado en `a13eb30` tomando de cada sitio lo que iba por delante: 23 del
ZIP y 11 del repositorio. Entró además `auth-verificacion-correo`, que estaba en
la entrega aprobada y nunca se había commiteado.

### 1.2 La mayoría de iconos no se veían en Outlook

**34 de los 37 assets tenían contenido SVG aunque el nombre terminara en
`.png`.** Outlook de escritorio usa el motor de Word, que no renderiza SVG.

No era solo que las insignias salieran cuadradas: **27 de los 34 iconos de
cabecera no se veían en absoluto**. El caso que se reportó mostraba un «!»
porque en esa plantilla concreta el icono es un carácter de texto.

### 1.3 Faltaba arte

19 imágenes que las plantillas referenciaban no existían en ninguna entrega ni
en el repositorio: `icon-solicitud-white` (22 plantillas), `icon-ticket-white`
(19), `icon-package-white` (14), `icon-clock-white` e `icon-importe-white` (13
cada una) y 14 más.

Venían del trabajo de agosto: las plantillas se actualizaron y los assets nunca
llegaron. Se generaron desde Lucide, que es la librería de iconos del propio
proyecto — comprobado que `icon-clock.svg` es exactamente `lucide/clock`, mismo
trazado y mismo círculo.

---

## 2. Cómo está ahora

| | |
|---|---|
| Plantillas | 34 transaccionales + 3 compartidas |
| Assets | 74, **todos PNG o JPG reales** |
| Insignias de cabecera | Imagen autocontenida, **ninguna depende de CSS** |
| VML para insignias | Retirado: ya no hace falta |
| Previsualizaciones | 34, emparejadas y con las imágenes incrustadas |

### Por qué las insignias son una imagen

Antes eran una celda con color de fondo, `rgba()` y `border-radius`, con el
icono dentro. Eso fallaba por tres sitios a la vez en Outlook de escritorio: sin
`border-radius` salía cuadrada, sin `rgba()` cogía el `bgcolor` de respaldo —que
además era el color intenso del estado y no el velo compuesto— y el icono no se
veía por ser SVG.

Un único PNG con el cuadrado redondeado, el velo y el icono ya dentro, con las
esquinas en el canal alfa, resuelve los tres de golpe y se ve igual en todos los
clientes.

---

## 3. Pendiente, y de quién

**De Javi (backend / infraestructura)**

1. Subir las 74 imágenes de `assets/` al CDN como `image/png` (y `hero-bg.jpg`
   como `image/jpeg`). **Si en el CDN quedan versiones antiguas de esos mismos
   nombres con contenido SVG, el problema vuelve.**
2. Decidir el dominio. Las plantillas apuntan a
   `https://cdn.loteriamanises.com/emails/`. Si va a ser otro, lo recomendable
   es apuntar ese subdominio por DNS; si no, `scripts/cambiar-cdn.sh` reescribe
   las 535 referencias.
3. **Probar un par de correos en un Outlook de escritorio real.** Es lo único
   que no se puede verificar desde aquí: el motor de Word no existe fuera de
   Outlook.

**Sin resolver**

- `NUMERO_JUGADA`, el dato añadido en agosto, **no está documentado en
  `COMUNICACIONES-EMAIL-BE.md`**. Tiene valor de muestra para las
  previsualizaciones, pero el backend no sabe su formato ni su origen.
- `INSIGNIA_DEL_MENSAJE.png` en `_header.html` es un marcador **a propósito**:
  ese fichero es el esqueleto del que se parte para crear correos nuevos, no una
  plantilla que se envíe. El verificador lo ignora por eso.

---

## 4. Cómo comprobar que no se rompe nada

```sh
node emails/scripts/verificar.cjs
```

Comprueba las seis cosas que costó encontrar: que ningún `.png` tenga contenido
SVG, que ninguna insignia dependa de CSS, que todo lo referenciado exista, que
las previsualizaciones estén emparejadas y autocontenidas, que los `bgcolor` de
respaldo sean el color compuesto, y que el mapa de assets no traiga SVG. Sale
con código 1 si algo falla.

**Correrlo siempre después de tocar una plantilla o un asset.**

Tras cambiar plantillas, regenerar previsualizaciones:

```sh
node emails/scripts/build-previews.cjs --no-be
```

No debe quedar ningún aviso de token sin regla.

---

## 5. Entregas

| Fecha | Paquete | Qué llevaba |
|---|---|---|
| 14/08/2026 | `loteria-manises-email-templates-be-20260814` | Primera entrega al backend |
| 24/08/2026 | `loteriamanises-email-templates-outlook` | 34 plantillas aprobadas. **Es la base con la que se reconcilió el repositorio** |
| 14/09/2026 | `loteriamanises-emails-20260914` | Plantillas + 74 assets en PNG real + 34 JPG de referencia + documentación |

Los dos primeros están en `emails/delivery/`, que no se versiona.
