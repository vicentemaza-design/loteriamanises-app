# Material pendiente para "En los medios"

Lo que falta para que el apartado deje de tirar de fotos de banco. Todo se
conecta editando `press-coverage.ts`: una línea por noticia.

---

## 1. Logotipos de los medios — faltan los 7

Ninguna noticia tiene logotipo todavía. Mientras tanto se pinta el nombre del
medio como rótulo tipográfico, que funciona pero no es lo mismo.

| Fichero esperado | Medio | Noticias |
|---|---|---|
| `rtve.png` | RTVE | 1 |
| `telecinco.png` | Telecinco | 1 |
| `antena3.png` | Antena 3 | 3 |
| `el-espanol.png` | El Español | 1 |
| `valencia-plaza.png` | Valencia Plaza | 1 |
| `abc.png` | ABC | 1 |
| `cadena-ser.png` | Cadena SER | 1 |

**Cómo deben ser:** PNG con fondo transparente, versión de color, **66 px de
alto mínimo** (se muestran a 22), recortados al logotipo sin márgenes.

**Dónde van:** `src/assets/images/medios/`. Instrucciones completas en el
README de esa carpeta.

> El diseñador que hizo la maqueta ya los tiene: en su propuesta aparecen.

---

## 2. Fotografías — 8 de 9 son de relleno

Solo una noticia lleva una foto real de la administración. El resto son
imágenes de banco o fotos de producto de un décimo, y se nota.

| Noticia | Foto actual | Qué es | Qué le pega |
|---|---|---|---|
| El Español · 2025 | `header_winner.jpg` | Banco | Rafa con el cartel del premio, o el equipo celebrando el tercero de 2025 |
| RTVE · 2025 | `img2.rtve.jpg` | Décimo suelto | La administración por fuera, o la cola en la puerta |
| Antena 3 · comprar online | `loteria_navidad_hero.jpg` | Banco | El mostrador atendiendo, o el local en campaña |
| **Valencia Plaza · 2025** | `administracion_manises.webp` | **Real** ✓ | — |
| Telecinco · 2025 | `group-people-celebrating…jpg` | Banco | Un plano del pueblo, o el equipo con los décimos |
| Antena 3 · el Gordo | `loteria_jueves_luck.jpg` | Banco | Celebración de uno de los Gordos |
| ABC · 2021 | `decimo.jpg` | Décimo suelto | La celebración de 2021, con los cinco premios |
| Antena 3 · Espejo Público | `loteria_de_empresas.jpg` | Banco | El equipo de televisión grabando en la administración |
| Cadena SER · 2019 | `manises-el-arte.jpg` | Azulejos del pueblo | Rafa en la radio, o la administración en 2019 |

**Cómo deben ser:** JPG, **1200 px de ancho mínimo**, apaisadas. Se recortan a
lo ancho, así que lo importante conviene que esté centrado y no pegado a los
bordes.

**Prioridad**, si no se pueden conseguir todas: las cuatro de arriba. Son las
que salen primero al abrir el apartado, y la de El Español además es la
portada.

---

## 3. Y de paso

`src/assets/images/gordos/gordo-navidad-{2012,2013,2018,2023}.jpg` **no son
imágenes**: son documentos HTML de 4.817 bytes, descargas que fallaron. La
única válida de esa carpeta es la de 2022.

No rompen nada porque no las usa ninguna pantalla, pero si existen las fotos de
esos cuatro Gordos merecen reponerse: son material propio y encajarían en
varias de las noticias de arriba.
