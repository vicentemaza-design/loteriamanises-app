# Las fotografías de "En los medios"

Decisión cerrada el 15 de septiembre de 2026: **las fotos son las que hay
y no se va a pedir más material a nadie.** Este documento explica cómo
queda el apartado con esa decisión, para que nadie lo lea como algo a
medias.

---

## La regla

La fotografía de una noticia es material **propio**. El medio entra por su
logotipo, su titular y el enlace al original.

No valen las fotos de los propios artículos: la imagen de apertura es del
medio o de su agencia (EFE, Europa Press…), o es un fotograma de su
emisión. Publicarla es usar material no licenciado, y **poner el crédito
no da derecho de uso** — acreditar y tener licencia son cosas distintas.

---

## Cómo queda

**Tres noticias con fotografía propia:**

| Noticia | Fichero |
|---|---|
| El Español · 2025 | `equipo-premios-2025.jpg` — el equipo con los cuatro premios |
| Antena 3 · comprar online | `interior-administracion.webp` — el interior del local |
| Valencia Plaza · 2025 | `administracion_manises.webp` — la fachada |

**Seis con cabecera de marca:** Telecinco, RTVE, Antena 3 (el Gordo),
ABC, Antena 3 (Espejo Público) y Cadena SER.

La cabecera de marca es fondo azul con el logotipo del medio en grande y
el soporte debajo (Televisión / Radio / Prensa escrita). **Es una solución
acabada, no un hueco a la espera de una foto.** Se ve deliberada, da
protagonismo al logotipo del medio —que es de lo que va el apartado— y
tiene la ventaja de que ninguna noticia depende de material ajeno.

---

## Si algún día aparece una foto

No hace falta tocar ninguna pantalla. En la entrada de la noticia, en
`press-coverage.ts`, dos líneas:

```ts
import telecincoFoto from '@/assets/images/medios/telecinco-equipo.jpg';

{
  id: 'telecinco-2025',
  // …
  image: telecincoFoto,
  imageAlt: 'El equipo de Lotería Manises con los décimos premiados',
  imageCredit: 'Lotería Manises',
}
```

La ficha pasa sola de cabecera de marca a fotografía. Y al revés: quitar
`image` la devuelve a cabecera de marca.

**Cómo debe ser una foto** que se añada: JPG, 1200 px de ancho mínimo,
apaisada. Se recorta a lo ancho, así que lo importante conviene que esté
centrado y no pegado a los bordes.

---

## Dos cosas de fuera de este apartado

Se anotan aquí porque salieron al revisarlo, pero **no afectan a "En los
medios"** y ninguna rompe nada:

- **`assets/images/gordos/gordo-navidad-{2012,2013,2018,2023}.jpg` no son
  imágenes**: son documentos HTML de 4.817 bytes, descargas que fallaron.
  La única válida de esa carpeta es la de 2022. No las usa ninguna
  pantalla.
- **`quienes-somos/manises-el-arte.jpg` lleva la marca de agua de
  "Check-in"**, un sitio de viajes. La usa `DeliveredPrizesPage.tsx`.
