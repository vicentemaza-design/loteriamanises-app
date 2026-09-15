// Fotografías: SOLO material propio de la administración. Ver la nota de
// abajo sobre por qué esto no es negociable.
import equipoFoto from '@/assets/images/medios/equipo-premios-2025.jpg';
import interiorFoto from '@/assets/images/medios/interior-administracion.webp';
import fachadaImg from '@/assets/images/administracion_manises.webp';

// Logotipos de los medios.
import rtveLogo from '@/assets/images/medios/rtve.png';
import telecincoLogo from '@/assets/images/medios/telecinco.png';
import antena3Logo from '@/assets/images/medios/antena3.png';
import elEspanolLogo from '@/assets/images/medios/el-espanol.png';
import valenciaPlazaLogo from '@/assets/images/medios/valencia-plaza.jpg';
import abcLogo from '@/assets/images/medios/abc.png';
import cadenaSerLogo from '@/assets/images/medios/cadena-ser.png';

/**
 * "En los medios" — cobertura de prensa y televisión.
 *
 * Todo lo que se muestra sale de aquí: la pantalla de listado y la de
 * detalle no llevan contenido propio. Añadir una noticia es añadir una
 * entrada a PRESS_COVERAGE.
 *
 * ── QUÉ ES NUESTRO Y QUÉ ES DEL MEDIO ──────────────────────────────
 * Es la regla que ordena todo el apartado:
 *
 *   Del medio   titular, entradilla, logotipo y enlace al original.
 *               Se reproducen literalmente y siempre enlazados.
 *   Nuestro     el resumen, los puntos clave y la fotografía.
 *
 * Por eso la pantalla de detalle rotula el resumen como resumen nuestro:
 * un texto propio bajo el logotipo de un medio, sin decirlo, se lee como
 * si lo firmara el medio.
 *
 * ── FOTOGRAFÍAS ────────────────────────────────────────────────────
 * `image` es opcional y SOLO admite material propio. Tres noticias
 * llevan foto; las otras seis se presentan con cabecera de marca —fondo
 * azul con el logotipo del medio en grande—, que es una solución
 * acabada y no un hueco a la espera de nada.
 *
 * No se usan las fotos de los medios ni sus fotogramas: la imagen de
 * apertura de un artículo es del medio o de su agencia, no nuestra, y
 * publicarla en la app es usar algo que no tenemos licenciado. Tampoco
 * sirve poner el crédito: acreditar no da derecho de uso.
 *
 * Añadir `image` a una noticia la pasa a fotografía y quitarlo la
 * devuelve a cabecera de marca, sin tocar ninguna pantalla. El detalle
 * está en FOTOGRAFIAS.md, en esta misma carpeta.
 */
export interface PressArticle {
  /** Identificador de la ruta: /profile/press/:id */
  id: string;
  /** Nombre del medio, tal y como se muestra. */
  outlet: string;
  /** Logotipo del medio. */
  outletLogo?: string;
  /** Ámbito del medio. Alimenta las cifras del listado. */
  scope: 'nacional' | 'autonomico';
  /** Soporte, para las cifras del listado. */
  medium: 'prensa' | 'television' | 'radio';
  /** ISO 8601. Se formatea al mostrar. */
  date: string;
  /** Titular literal del artículo publicado. No reescribir. */
  headline: string;
  /** Entradilla literal del propio medio. No reescribir. */
  standfirst: string;
  /** Resumen NUESTRO de la noticia. Se rotula como tal al mostrarlo. */
  summary: string[];
  /**
   * Cita literal del artículo. Si `source` coincide con `outlet`, se
   * entiende que es prosa del medio y la ficha la presenta como tal;
   * si no, es la voz de una persona y lleva el tratamiento manuscrito
   * que la app reserva para las voces propias.
   */
  quote?: { text: string; source: string };
  /** Puntos clave, nuestros. Opcionales. */
  highlights?: string[];
  /** Cifras destacadas, opcionales. */
  figures?: { value: string; label: string }[];
  /** Fotografía PROPIA. Opcional: sin ella se pinta cabecera de marca. */
  image?: string;
  imageAlt?: string;
  /** Quién hizo la foto. Solo material propio, así que 'Lotería Manises'. */
  imageCredit?: string;
  /** Enlace al artículo original. Obligatorio: siempre se atribuye. */
  sourceUrl: string;
}

/**
 * CUIDADO CON EL DATO DE LOS GORDOS. Son dos cifras distintas y los
 * medios las mezclan:
 *
 *   El pueblo de Manises   7 Gordos (1971, 1986, 2012, 2013, 2018,
 *                          2022 y 2023).
 *   Esta administración    5 Gordos (2012, 2013, 2018, 2022 y 2023).
 *                          Los de 1971 y 1986 son anteriores.
 *
 * En `headline` y `standfirst` se respeta lo que escribió el medio,
 * aunque mezcle. En lo que escribimos nosotros —`summary`, `highlights`—
 * se dice siempre cuál de las dos es.
 */
export const PRESS_COVERAGE: PressArticle[] = [
  {
    id: 'el-espanol-2025',
    outlet: 'El Español',
    outletLogo: elEspanolLogo,
    scope: 'nacional',
    medium: 'prensa',
    date: '2025-12-22',
    headline: 'Rafa, el lotero que vuelve a repartir suerte en Manises con el tercero, un cuarto y dos quintos premios',
    standfirst: '«Un no parar»',
    summary: [
      'El Español recoge los cuatro grandes premios que repartió Lotería Manises en el Sorteo de Navidad de 2025: el tercer premio, un cuarto y dos quintos.',
      'El artículo incluye el testimonio de Rafa Sanchis y recuerda la trayectoria de la administración, que ha repartido cinco Gordos de Navidad.',
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
      'Cinco Gordos de Navidad repartidos por esta administración.',
    ],
    image: equipoFoto,
    imageAlt: 'El equipo de Lotería Manises con los números premiados de 2025',
    imageCredit: 'Lotería Manises',
    sourceUrl: 'https://www.elespanol.com/valencia/20251222/rafa-lotero-vuelve-repartir-suerte-manises-tercero-cuarto-quintos-premios-no-parar-trt/1003744065728_0.html',
  },
  {
    id: 'telecinco-2025',
    outlet: 'Telecinco',
    outletLogo: telecincoLogo,
    scope: 'nacional',
    medium: 'television',
    date: '2025-12-08',
    headline: 'El pueblo con más suerte de España: siete veces ha caído «El Gordo» de la Lotería de Navidad',
    standfirst: 'Manises ha repartido el primer premio del Sorteo de Navidad en siete ocasiones desde 1971.',
    summary: [
      'Telecinco dedica un reportaje al municipio de Manises, donde el Gordo de Navidad ha caído siete veces desde 1971. Cinco de esas siete salieron de esta administración.',
      'El reportaje repasa la tradición del pueblo, la ilusión que genera y el impacto de sus premios en la comarca y en toda España.',
    ],
    quote: {
      text: 'Este municipio valenciano se ha convertido en un lugar de peregrinación para todos aquellos que buscan cada año dar con el décimo premiado',
      source: 'Telecinco',
    },
    highlights: [
      'Siete Gordos de Navidad en el pueblo de Manises desde 1971.',
      'Más de 350 millones de euros repartidos por esta administración.',
      'El volumen de ventas y la repercusión en los medios atraen compradores de toda España.',
    ],
    sourceUrl: 'https://www.telecinco.es/noticias/loterias/loteria-de-navidad/20251208/pueblo-con-mas-suerte-espana-siete-veces-el-gordo-loteria-navidad_18_017650656.html',
  },
  {
    id: 'rtve-2025',
    outlet: 'RTVE',
    outletLogo: rtveLogo,
    scope: 'nacional',
    medium: 'television',
    date: '2025-12-17',
    headline: 'Más allá de Doña Manolita y La Bruixa d\'Or: ¿qué hay detrás del éxito de las administraciones revelación?',
    standfirst: 'RTVE analiza qué explica el éxito de las administraciones que se han convertido en referencia del Sorteo de Navidad.',
    summary: [
      'RTVE sitúa a Lotería Manises entre las administraciones revelación del Sorteo de Navidad, y señala que su éxito ha convertido a esta población valenciana de 30.000 habitantes en el municipio más afortunado de los últimos años.',
      'Según los datos que maneja el reportaje, Lotería Manises es la tercera administración en ventas de España desde 2018, y de ella han salido los cinco Gordos más recientes del pueblo.',
    ],
    quote: {
      text: 'Entre ellas está Lotería Manises, cuyo éxito ha situado a esta población valenciana de 30.000 habitantes como el municipio más afortunado en los últimos años',
      source: 'RTVE',
    },
    highlights: [
      'Tercera administración en ventas de España desde 2018.',
      'Desde 2010 repartiendo premios de forma ininterrumpida.',
      'Los cinco Gordos más recientes de Manises salieron de esta administración.',
    ],
    sourceUrl: 'https://www.rtve.es/rtve/20251217/dona-manolita-bruixa-dor-exito-administraciones-revelacion/16856942.shtml',
  },
  {
    id: 'antena3-comprar-2025',
    outlet: 'Antena 3',
    outletLogo: antena3Logo,
    scope: 'nacional',
    medium: 'television',
    date: '2025-12-15',
    headline: 'Cómo comprar Lotería de Navidad 2025 online en la administración de Manises: horarios y cómo pedir cita',
    standfirst: 'Se trata de una de las administraciones más conocidas, que ha llegado a repartir El Gordo de Navidad hasta en 7 ocasiones.',
    summary: [
      'Antena 3 dedica un artículo a explicar cómo comprar en la administración de Manises, con los horarios y las dos formas de hacerlo: en el propio local o por internet.',
      'El texto sitúa a Manises como uno de los pueblos más conocidos del sorteo, con siete Gordos de Navidad repartidos en la localidad desde 1971.',
    ],
    highlights: [
      'Los siete Gordos del pueblo: 1971, 1986, 2012, 2013, 2018, 2022 y 2023.',
      'Dos formas de comprar: en la administración o por internet con envío a domicilio.',
    ],
    image: interiorFoto,
    imageAlt: 'Interior de la administración de Lotería Manises',
    imageCredit: 'Lotería Manises',
    sourceUrl: 'https://www.antena3.com/noticias/loterias/loteria-navidad/como-comprar-loteria-navidad-2025-online-administracion-manises-horarios-como-pedir-cita_20251215693fea3eea66eb735312a872.html',
  },
  {
    id: 'valencia-plaza-2025',
    outlet: 'Valencia Plaza',
    outletLogo: valenciaPlazaLogo,
    scope: 'autonomico',
    medium: 'prensa',
    date: '2025-12-14',
    headline: 'La «Doña Manolita valenciana»: la administración que más veces ha repartido el Gordo está en Manises',
    standfirst: 'La fama de esta administración creció tras una racha insólita de premios que ha consolidado al municipio de l\'Horta Sud como referente del Sorteo de Navidad a escala nacional.',
    summary: [
      'Valencia Plaza dedica un reportaje a Lotería Manises y a la racha de premios que ha hecho de la administración un referente del Sorteo de Navidad.',
      'El texto recoge el crecimiento de las ventas y la afluencia de visitantes que llegan cada diciembre buscando un número de Manises, y compara el fenómeno con el de Doña Manolita en Madrid.',
    ],
    quote: {
      text: 'Hay administraciones que venden muchísimo más que nosotros y no han repartido tantas veces El Gordo. Yo creo en la magia de Manises',
      source: 'Rafa, lotero de Manises',
    },
    highlights: [
      'Cinco Gordos de Navidad repartidos por esta administración.',
      'Un fenómeno de peregrinación comparable al de Doña Manolita.',
      'Manises, consolidado como referente del Sorteo de Navidad a escala nacional.',
    ],
    image: fachadaImg,
    imageAlt: 'Fachada de la administración de Lotería Manises',
    imageCredit: 'Lotería Manises',
    sourceUrl: 'https://valenciaplaza.com/valenciaplaza/comarca-y-empresa/la-dona-manolita-valenciana-loteria-manises-la-administracion-que-mas-veces-ha-repartido-el-gordo',
  },
  {
    id: 'antena3-gordo-2025',
    outlet: 'Antena 3',
    outletLogo: antena3Logo,
    scope: 'nacional',
    medium: 'television',
    date: '2025-12-08',
    headline: 'Manises, la localidad que más veces ha repartido el Gordo de la Lotería de Navidad',
    standfirst: 'Cada español se gastará de media 76 euros en décimos, y Castilla y León vuelve a ser la comunidad donde más se juega a la Lotería de Navidad.',
    summary: [
      'Antena 3 Noticias sitúa a Manises como la localidad que más veces ha repartido el Gordo de la Lotería de Navidad.',
      'El reportaje encuadra el dato dentro del panorama nacional del sorteo: cuánto se gasta de media cada español y dónde más se juega.',
    ],
    sourceUrl: 'https://www.antena3.com/noticias/loterias/manises-localidad-que-mas-veces-repartido-gordo-loteria-navidad_20251208693703b555584d48fb6ec332.html',
  },
  {
    id: 'abc-2021',
    outlet: 'ABC',
    outletLogo: abcLogo,
    scope: 'nacional',
    medium: 'prensa',
    date: '2021-12-22',
    headline: 'El lotero de Manises que se codea con Doña Manolita dando premios en el Sorteo de Navidad',
    standfirst: 'La administración número 3 de la localidad valenciana ha repartido cinco de los principales premios de este año.',
    summary: [
      'ABC sitúa a Lotería Manises junto a las administraciones de referencia del Sorteo de Navidad en España.',
      'El artículo destaca los cinco premios principales repartidos por la administración número 3 de Manises en el sorteo de 2021.',
    ],
    highlights: [
      'Cinco de los principales premios del sorteo de 2021, repartidos en una sola administración.',
      'Manises, entre las administraciones de referencia del Sorteo de Navidad.',
    ],
    sourceUrl: 'https://www.abc.es/espana/comunidad-valenciana/abci-lotero-manises-codea-dona-manolita-sorteo-navidad-202112221141_noticia.html',
  },
  {
    id: 'antena3-espejo-2021',
    outlet: 'Antena 3',
    outletLogo: antena3Logo,
    scope: 'nacional',
    medium: 'television',
    date: '2021-12-22',
    headline: 'La administración de la suerte de Manises (Valencia): vende 4 premios de la Lotería de Navidad',
    standfirst: 'Espejo Público se acerca a la administración valenciana que repartió cuatro premios en el Sorteo de Navidad de 2021.',
    summary: [
      'El programa Espejo Público, de Antena 3, visitó la administración de Manises tras repartir cuatro premios en el Sorteo de Navidad de 2021.',
      'El reportaje recoge el ambiente en la localidad y la trayectoria de una administración que ya entonces era conocida como «la administración de la suerte».',
    ],
    sourceUrl: 'https://www.antena3.com/programas/espejo-publico/noticias/administracion-suerte-manises-valencia-vende-4-premios-loteria-navidad_2021122261c32519192fe40001d33f91.html',
  },
  {
    id: 'cadena-ser-2019',
    outlet: 'Cadena SER',
    outletLogo: cadenaSerLogo,
    scope: 'nacional',
    medium: 'radio',
    date: '2019-12-19',
    headline: 'Lotería Manises es la administración de lotería más afortunada de España',
    standfirst: 'Ha repartido más de 300 millones de euros en premios, entre ellos tres Gordos de Navidad y un segundo premio.',
    summary: [
      'La Cadena SER repasa en Radio Valencia la trayectoria de Lotería Manises y la sitúa como la administración más afortunada de España.',
      'El reportaje detalla los premios repartidos hasta esa fecha: los Gordos de 2012, 2013 y 2018, y el segundo premio de 2011.',
    ],
    highlights: [
      'Más de 300 millones de euros repartidos hasta 2019.',
      'Gordos de Navidad en 2012, 2013 y 2018.',
      'Segundo premio del Sorteo de Navidad en 2011.',
    ],
    sourceUrl: 'https://cadenaser.com/emisora/2019/12/19/radio_valencia/1576746325_277770.html',
  },
];

export interface PressStat {
  icon: 'press' | 'tv' | 'radio';
  value: string;
  label: string;
  color: string;
}

/**
 * Cifras del listado. Se CALCULAN a partir de PRESS_COVERAGE, no se
 * escriben a mano: si mañana se añade una noticia o se retira otra, la
 * tira de cifras se ajusta sola. Antes estaban fijas y bastaba con
 * añadir una entrada para que el número dejara de ser verdad.
 */
export function getPressStats(): PressStat[] {
  const medios = new Set(PRESS_COVERAGE.map(a => a.outlet)).size;
  const desde = PRESS_COVERAGE.reduce(
    (min, a) => (a.date < min ? a.date : min),
    PRESS_COVERAGE[0]?.date ?? '',
  ).slice(0, 4);

  return [
    { icon: 'press', value: String(medios),                 label: 'Medios\nque nos citan', color: '#0a4792' },
    { icon: 'tv',    value: String(PRESS_COVERAGE.length),  label: 'Noticias\npublicadas',   color: '#F5C518' },
    { icon: 'radio', value: desde,                          label: 'Desde\nel año',          color: '#15803d' },
  ];
}

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
