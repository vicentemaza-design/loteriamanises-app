# Material pendiente para "En los medios"

Estado a 15 de septiembre de 2026. Todo se conecta editando
`press-coverage.ts`: una línea por noticia.

---

## 1. Logotipos — completos ✓

Los siete medios tienen logotipo en `src/assets/images/medios/`. Queda un
detalle: **`valencia-plaza.jpg` no tiene fondo transparente**, así que en
el listado se ve como un rectángulo azul en vez de recortado como los
demás. Si aparece una versión PNG con transparencia, se sustituye el
fichero y ya está: el nombre del import no cambia.

---

## 2. Fotografías — faltan 6 de 9

**La regla:** la foto de una noticia es material **propio**. El medio
entra por su logotipo, su titular y el enlace al original.

No valen las fotos de los propios artículos. La imagen de apertura de una
noticia es del medio o de su agencia (EFE, Europa Press…), o es un
fotograma de su emisión. Publicarla en la app es usar material no
licenciado, y **poner el crédito no da derecho de uso**: acreditar y tener
licencia son cosas distintas.

Mientras no haya foto propia, la noticia se presenta con **cabecera de
marca** —fondo azul con el logotipo del medio en grande—. Está pensado
para verse bien así, no como un hueco: el apartado se puede publicar tal
cual y cada foto que llegue lo mejora, una a una.

### Las que ya tienen foto propia

| Noticia | Fichero | |
|---|---|---|
| El Español · 2025 | `equipo-premios-2025.jpg` | Equipo con los cuatro premios de 2025 |
| Antena 3 · comprar online | `interior-administracion.webp` | Interior del local |
| Valencia Plaza · 2025 | `administracion_manises.webp` | Fachada |

> Conviene que Rafa confirme que las dos primeras son suyas y puede
> cederlas. Salen en los artículos porque se las pasó él a los medios,
> que es lo habitual, pero mejor confirmarlo que suponerlo.

### Las que van con cabecera de marca

| Noticia | Qué foto le pega |
|---|---|
| Telecinco · 2025 | El equipo con los décimos, o un plano del pueblo |
| RTVE · 2025 | La cola en la puerta, o el local en campaña |
| Antena 3 · el Gordo | Celebración de uno de los Gordos |
| ABC · 2021 | La celebración de 2021, con los cinco premios |
| Antena 3 · Espejo Público | El equipo de televisión grabando en el local |
| Cadena SER · 2019 | Rafa en la radio, o la administración en 2019 |

**Cómo deben ser:** JPG, **1200 px de ancho mínimo**, apaisadas. Se
recortan a lo ancho, así que lo importante conviene que esté centrado y no
pegado a los bordes.

**Cómo se conectan:** en la entrada de la noticia, dos líneas.

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

---

## 3. Y de paso, dos cosas de fuera de este apartado

**`src/assets/images/gordos/gordo-navidad-{2012,2013,2018,2023}.jpg` no
son imágenes**: son documentos HTML de 4.817 bytes, descargas que
fallaron. La única válida de esa carpeta es la de 2022. No rompen nada
porque no las usa ninguna pantalla, pero si existen las fotos de esos
cuatro Gordos merecen reponerse: son material propio.

**`quienes-somos/manises-el-arte.jpg` lleva la marca de agua de
"Check-in"**, un sitio de viajes. La usa `DeliveredPrizesPage.tsx`, que no
es parte de este apartado, pero conviene cambiarla por una foto propia de
los azulejos de Manises.
