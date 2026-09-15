# Logotipos de los medios

Aquí van los logotipos que se muestran en el apartado "En los medios".

## Qué hace falta

Un fichero por medio, con estos nombres:

| Fichero | Medio |
|---|---|
| `el-espanol.png` | El Español |
| `valencia-plaza.jpg` | Valencia Plaza |
| `telecinco.png` | Telecinco |
| `abc.png` | ABC |
| `cadena-ser.png` | Cadena SER |
| `rtve.png` | RTVE |
| `antena3.png` | Antena 3 |

## Cómo deben ser

- **PNG con fondo transparente**, en la versión de color del medio.
- Se muestran a 22 px de alto, así que **66 px de alto como mínimo** (3×).
  El ancho, el que resulte de mantener la proporción.
- Recortados al propio logotipo, sin márgenes sobrantes.

## Cómo se conectan

En `src/features/profile/data/press-coverage.ts`, cada noticia tiene un
campo `outletLogo` opcional:

```ts
import elEspanolLogo from '@/assets/images/medios/el-espanol.png';

{
  outlet: 'El Español',
  outletLogo: elEspanolLogo,
  ...
}
```

Mientras un medio no tenga logotipo, la tarjeta pinta su nombre como
rótulo tipográfico y ocupa el mismo espacio, así que se pueden ir
añadiendo de uno en uno sin que nada se descoloque.

## Las fotos de las noticias NO van aquí como material del medio

En esta carpeta conviven dos cosas distintas:

- **Logotipos** de los medios: `rtve.png`, `abc.png`, `telecinco.png`…
- **Fotografías propias** de la administración que ilustran una noticia:
  `equipo-premios-2025.jpg`, `interior-administracion.webp`.

Lo que **no** puede entrar aquí es la foto de apertura de un artículo
descargada del medio, ni un fotograma de su emisión: eso es material del
medio o de su agencia y no lo tenemos licenciado. Poner el crédito no
arregla nada — acreditar y tener licencia son cosas distintas.

Si una noticia no tiene foto propia, se deja sin `image` y se presenta con
cabecera de marca. Está previsto y se ve bien.

## Sobre los derechos

Son marcas registradas de sus titulares. Se usan para identificar al medio
que ha publicado cada noticia, enlazando siempre al artículo original —
uso nominativo, que es lo habitual en un apartado de "han hablado de
nosotros". La decisión de incluirlos es del cliente.
