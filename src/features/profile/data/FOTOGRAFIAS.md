# Las fotografías de "En los medios"

## Cómo funciona el apartado

Cada noticia se presenta con **la imagen de la propia noticia**. Es lo
que hace una sección de prensa: se reproduce un extracto —titular,
entradilla e imagen—, se cita al medio con su logotipo y se enlaza
siempre al artículo original.

Las nueve noticias llevan foto.

---

## Lo único que no se puede fallar: el crédito

`imageCredit` se pinta como pie bajo la imagen y dice de quién es la
foto. **Tiene que ser verdad.**

| Valor | Cuándo |
|---|---|
| `'Lotería Manises'` | Solo si la foto es de la administración |
| El nombre del medio | Si viene de su artículo o de su emisión |

Poner `'Lotería Manises'` en una foto que es de un medio es atribuirse
algo ajeno. **Ante la duda, el medio.**

### Cómo está ahora

| Noticia | Fotografía | Crédito |
|---|---|---|
| El Español · 2025 | `equipo-premios-2025.jpg` | Lotería Manises |
| Antena 3 · comprar online | `interior-administracion.webp` | Lotería Manises |
| Valencia Plaza · 2025 | `administracion_manises.webp` | Lotería Manises |
| Telecinco · 2025 | `telecinco-gordo-2013.jpg` | Telecinco |
| RTVE · 2025 | `rtve-reportaje.jpg` | RTVE |
| Antena 3 · el Gordo | `antena3-informativo.webp` | Antena 3 |
| ABC · 2021 | `abc-quinto-2021.jpg` | ABC |
| Antena 3 · Espejo Público | `antena3-espejo.webp` | Antena 3 |
| Cadena SER · 2019 | `cadena-ser-rafa.jpg` | Cadena SER |

> **La de RTVE no es de Manises.** El reportaje va sobre varias
> administraciones y su imagen de apertura es de otra. Por eso su
> `imageAlt` no dice Manises: describe lo que se ve, una celebración
> dentro de ese reportaje. Si alguna vez se cambia por una foto de la
> administración, hay que cambiar también el pie.

---

## Dónde va cada cosa

```
assets/images/medios/
├── rtve.png, abc.png, telecinco.png…    logotipos de los medios
└── noticias/                            fotografías de las noticias
```

Están separados a propósito: un logotipo y una fotografía no se usan
igual ni tienen el mismo dueño.

---

## Añadir o cambiar una foto

No hace falta tocar ninguna pantalla. En la entrada de la noticia, en
`press-coverage.ts`, tres líneas:

```ts
import telecincoFoto from '@/assets/images/medios/noticias/telecinco-equipo.jpg';

{
  id: 'telecinco-2025',
  // …
  image: telecincoFoto,
  imageAlt: 'El equipo de Lotería Manises con los décimos premiados',
  imageCredit: 'Lotería Manises',   // ← el dueño real de la foto
}
```

**Cómo debe ser:** JPG o WEBP, 1200 px de ancho mínimo, apaisada. Se
recorta a lo ancho, así que lo importante conviene que esté centrado y no
pegado a los bordes.

`image` es opcional. Una noticia sin foto se presenta con **cabecera de
marca** —fondo azul con el logotipo del medio en grande—, que está
resuelta para verse bien. Hoy no la usa ninguna, pero el día que entre una
noticia sin imagen no habrá que tocar nada.

---

## Dos cosas de fuera de este apartado

Se anotan aquí porque salieron al revisarlo. Ninguna rompe nada:

- **`assets/images/gordos/gordo-navidad-{2012,2013,2018,2023}.jpg` no son
  imágenes**: son documentos HTML de 4.817 bytes, descargas que fallaron.
  La única válida de esa carpeta es la de 2022. No las usa ninguna
  pantalla.
- **`quienes-somos/manises-el-arte.jpg` lleva la marca de agua de
  "Check-in"**, un sitio de viajes. La usa `DeliveredPrizesPage.tsx`.
