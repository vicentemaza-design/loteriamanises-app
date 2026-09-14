import rafaImg from '@/assets/images/quienes-somos/rafa-2023.jpg';
import manisesAfortunadoImg from '@/assets/images/quienes-somos/manises-afortunado.jpg';
import gordo2023Img from '@/assets/images/quienes-somos/gordo2023-celebracion.webp';
import mostradorImg from '@/assets/images/quienes-somos/mostrador.webp';

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
    image: rafaImg,
    imageAlt: 'Rafa, lotero de Lotería Manises',
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
    image: manisesAfortunadoImg,
    imageAlt: 'Manises, el pueblo con más suerte de España',
    sourceUrl: 'https://www.telecinco.es/noticias/loterias/loteria-de-navidad/20251208/pueblo-con-mas-suerte-espana-siete-veces-el-gordo-loteria-navidad_18_017650656.html',
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
    image: gordo2023Img,
    imageAlt: 'Celebración de un premio en Lotería Manises',
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
    image: mostradorImg,
    imageAlt: 'Mostrador de Lotería Manises',
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
