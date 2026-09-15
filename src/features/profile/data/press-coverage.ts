// Fotografías propias. Se eligen a propósito distintas de las que usa
// "Quiénes somos", para que los dos apartados no se repitan.
//
// OJO: no usar src/assets/images/gordos/gordo-navidad-{2012,2013,2018,2023}.jpg
// — pese a la extensión son documentos HTML, descargas fallidas. La única
// válida de esa carpeta es gordo-navidad-2022.jpg, y esa ya la usa
// "Quiénes somos".
import ganadorImg from '@/assets/images/header_winner.jpg';
import celebracionImg from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';
import decimoImg from '@/assets/images/decimo.jpg';
import arteImg from '@/assets/images/quienes-somos/manises-el-arte.jpg';
import fachadaImg from '@/assets/images/administracion_manises.webp';

/**
 * "En los medios" — cobertura de prensa y televisión.
 *
 * Todo lo que se muestra sale de aquí: la pantalla de listado y la de
 * detalle no llevan contenido propio. Añadir una noticia es añadir una
 * entrada a PRESS_COVERAGE.
 *
 * DE DÓNDE SALEN LOS DATOS
 * Titular, fecha y entradilla están tomados del propio artículo
 * publicado (metadatos Open Graph del medio), no redactados por
 * nosotros. `summary` sí es un resumen propio. Las citas son literales
 * del artículo. Al añadir una noticia nueva conviene hacer lo mismo:
 * copiar el titular tal cual y enlazar siempre al original.
 *
 * SOBRE LAS IMÁGENES
 * Se usan fotografías propias, no capturas ni material de los medios.
 * `outlet` se pinta como rótulo tipográfico; si algún día se dispone de
 * los logotipos con permiso de uso, se añaden en `outletLogo` y la
 * tarjeta los prefiere automáticamente.
 */
export interface PressHighlight {
  text: string;
}

export interface PressArticle {
  /** Identificador de la ruta: /profile/press/:id */
  id: string;
  /** Nombre del medio, tal y como se muestra. */
  outlet: string;
  /** Logotipo del medio, si alguna vez se dispone de él con permiso. */
  outletLogo?: string;
  /** ISO 8601. Se formatea al mostrar. */
  date: string;
  /** Titular literal del artículo publicado. */
  headline: string;
  /** Entradilla del propio medio. */
  standfirst: string;
  /** Resumen propio, para la pantalla de detalle. */
  summary: string[];
  /** Cita literal destacada del artículo. */
  quote?: { text: string; source: string };
  /** Puntos clave, opcionales. */
  highlights?: string[];
  /** Cifras destacadas, opcionales. */
  figures?: { value: string; label: string }[];
  image: string;
  imageAlt: string;
  /** Enlace al artículo original. Obligatorio: siempre se atribuye. */
  sourceUrl: string;
}

export const PRESS_COVERAGE: PressArticle[] = [
  {
    id: 'el-espanol-2025',
    outlet: 'El Español',
    date: '2025-12-22',
    headline: 'Rafa, el lotero que vuelve a repartir suerte en Manises con el tercero, un cuarto y dos quintos premios',
    standfirst: '«Un no parar»',
    summary: [
      'El Español recoge los cuatro grandes premios que repartió Lotería Manises en el Sorteo de Navidad de 2025: el tercer premio, un cuarto y dos quintos.',
      'El artículo incluye el testimonio de Rafa Sanchis y recuerda la trayectoria de la administración, con cinco Gordos repartidos.',
    ],
    quote: { text: 'Esto es una fiesta, un no parar', source: 'Rafa, lotero de Manises' },
    figures: [
      { value: '1', label: 'Tercer premio' },
      { value: '1', label: 'Cuarto premio' },
      { value: '2', label: 'Quintos premios' },
    ],
    highlights: [
      'Los números premiados: 90693, 25508, 23112 y 77715.',
      '766.000 euros repartidos en total.',
      'Cinco Gordos repartidos a lo largo de la trayectoria de la administración.',
    ],
    image: ganadorImg,
    imageAlt: 'Celebración de un premio en Lotería Manises',
    sourceUrl: 'https://www.elespanol.com/valencia/20251222/rafa-lotero-vuelve-repartir-suerte-manises-tercero-cuarto-quintos-premios-no-parar-trt/1003744065728_0.html',
  },
  {
    id: 'telecinco-2025',
    outlet: 'Telecinco',
    date: '2025-12-08',
    headline: 'El pueblo con más suerte de España: siete veces ha caído «El Gordo» de la Lotería de Navidad',
    standfirst: 'Manises ha repartido el primer premio del Sorteo de Navidad en siete ocasiones desde 1971.',
    summary: [
      'Telecinco dedica un reportaje a Manises para contar la trayectoria de la localidad, que ha visto caer el Gordo de Navidad en siete ocasiones.',
      'El reportaje repasa la tradición del municipio, la ilusión que genera y el impacto de sus premios en la comarca y en toda España.',
    ],
    quote: {
      text: 'Este municipio valenciano se ha convertido en un lugar de peregrinación para todos aquellos que buscan cada año dar con el décimo premiado',
      source: 'Telecinco',
    },
    highlights: [
      'Siete veces ha caído el Gordo de Navidad en Manises desde 1971.',
      'Más de 350 millones de euros repartidos en premios.',
      'El volumen de ventas y la repercusión en los medios atraen compradores de toda España.',
    ],
    image: celebracionImg,
    imageAlt: 'Celebración del Gordo de Navidad en Manises',
    sourceUrl: 'https://www.telecinco.es/noticias/loterias/loteria-de-navidad/20251208/pueblo-con-mas-suerte-espana-siete-veces-el-gordo-loteria-navidad_18_017650656.html',
  },
  {
    id: 'valencia-plaza-2025',
    outlet: 'Valencia Plaza',
    date: '2025-12-14',
    headline: 'La «Doña Manolita valenciana»: la administración que más veces ha repartido el Gordo está en Manises',
    standfirst: 'La fama de esta administración creció tras una racha insólita de premios que ha consolidado al municipio de l\'Horta Sud como referente del Sorteo de Navidad a escala nacional.',
    summary: [
      'Valencia Plaza sitúa a Lotería Manises como la administración que más veces ha repartido el Gordo de Navidad, con siete ocasiones desde 1971.',
      'El reportaje recoge el crecimiento de las ventas y la afluencia de visitantes que llegan cada diciembre buscando un número de Manises, y compara el fenómeno con el de Doña Manolita en Madrid.',
    ],
    quote: {
      text: 'Hay administraciones que venden muchísimo más que nosotros y no han repartido tantas veces El Gordo. Yo creo en la magia de Manises',
      source: 'Rafa, lotero de Manises',
    },
    highlights: [
      'Siete Gordos de Navidad repartidos desde 1971.',
      'Un fenómeno de peregrinación comparable al de Doña Manolita.',
      'Manises, consolidado como referente del Sorteo de Navidad a escala nacional.',
    ],
    image: fachadaImg,
    imageAlt: 'Fachada de la administración de Lotería Manises',
    sourceUrl: 'https://valenciaplaza.com/valenciaplaza/comarca-y-empresa/la-dona-manolita-valenciana-loteria-manises-la-administracion-que-mas-veces-ha-repartido-el-gordo',
  },
  {
    id: 'abc-2021',
    outlet: 'ABC',
    date: '2021-12-22',
    headline: 'El lotero de Manises que se codea con Doña Manolita dando premios en el Sorteo de Navidad',
    standfirst: 'La administración número 3 de la localidad valenciana ha repartido cinco de los principales premios de este año.',
    summary: [
      'ABC sitúa a Lotería Manises junto a las administraciones de referencia del Sorteo de Navidad en España.',
      'El artículo destaca los cinco premios principales repartidos por la administración número 3 de Manises en el sorteo de 2021.',
    ],
    highlights: [
      'Cinco de los principales premios del sorteo, repartidos en una sola administración.',
      'Manises, entre las administraciones de referencia del Sorteo de Navidad.',
    ],
    image: decimoImg,
    imageAlt: 'Reparto de premios en la administración de Manises',
    sourceUrl: 'https://www.abc.es/espana/comunidad-valenciana/abci-lotero-manises-codea-dona-manolita-sorteo-navidad-202112221141_noticia.html',
  },
  {
    id: 'cadena-ser-2019',
    outlet: 'Cadena SER',
    date: '2019-12-19',
    headline: 'Lotería Manises es la administración de lotería más afortunada de España',
    standfirst: 'Ha repartido más de 300 millones de euros en premios, entre ellos tres Gordos de Navidad y un segundo premio.',
    summary: [
      'La Cadena SER repasa en Radio Valencia la trayectoria de Lotería Manises y la sitúa como la administración más afortunada de España.',
      'El reportaje detalla los premios repartidos: los Gordos de 2012, 2013 y 2018, y el segundo premio de 2011.',
    ],
    highlights: [
      'Más de 300 millones de euros repartidos en premios.',
      'Gordos de Navidad en 2012, 2013 y 2018.',
      'Segundo premio del Sorteo de Navidad en 2011.',
    ],
    image: arteImg,
    imageAlt: 'Celebración de un Gordo de Navidad en Manises',
    sourceUrl: 'https://cadenaser.com/emisora/2019/12/19/radio_valencia/1576746325_277770.html',
  },
];

export function getPressArticle(id: string): PressArticle | undefined {
  return PRESS_COVERAGE.find(article => article.id === id);
}

/** Más recientes primero. */
export function getPressCoverage(): PressArticle[] {
  return [...PRESS_COVERAGE].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatPressDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}
