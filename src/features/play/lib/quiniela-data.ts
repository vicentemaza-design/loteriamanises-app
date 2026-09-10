export type QuinielaResult = string | null;

export interface QuinielaMatch {
  id: number;
  home: string;
  away: string;
  result: QuinielaResult;
}

export interface QuinielaOficialMatch extends QuinielaMatch {
  isReducido: boolean;
}

export const DEFAULT_MATCH_TEMPLATES: Omit<QuinielaMatch, 'result'>[] = [
  { id: 1,  home: 'Real Madrid',     away: 'FC Barcelona' },
  { id: 2,  home: 'Valencia',        away: 'Sevilla' },
  { id: 3,  home: 'Villarreal',      away: 'Real Betis' },
  { id: 4,  home: 'Athletic Club',   away: 'Real Sociedad' },
  { id: 5,  home: 'Atlético Madrid', away: 'Getafe' },
  { id: 6,  home: 'Las Palmas',      away: 'Osasuna' },
  { id: 7,  home: 'Celta',           away: 'Espanyol' },
  { id: 8,  home: 'Alavés',          away: 'Mallorca' },
  { id: 9,  home: 'Rayo',            away: 'Girona' },
  { id: 10, home: 'Granada',         away: 'Almería' },
  { id: 11, home: 'Zaragoza',        away: 'Sporting' },
  { id: 12, home: 'Levante',         away: 'Eibar' },
  { id: 13, home: 'Sandefjord',      away: 'HamKam' },
  { id: 14, home: 'Brann',           away: 'Stabaek' },
  { id: 15, home: 'Sandefjord Fotball', away: 'Hamkam IL' },
];

export function makeInitialMatches(
  fixtures: Pick<QuinielaMatch, 'id' | 'home' | 'away'>[] = DEFAULT_MATCH_TEMPLATES
): QuinielaMatch[] {
  return fixtures.map(m => ({ ...m, result: null }));
}

export function makeInitialOficialMatches(
  fixtures: Pick<QuinielaMatch, 'id' | 'home' | 'away'>[] = DEFAULT_MATCH_TEMPLATES
): QuinielaOficialMatch[] {
  return fixtures.map(m => ({ ...m, result: null, isReducido: false }));
}

export const PLENA_SIGNS = ['0', '1', '2', 'M'] as const;
export const REGULAR_SIGNS = ['1', 'X', '2'] as const;

export function getMatchTypeBadge(result: QuinielaResult): 'Simple' | 'Doble' | 'Triple' | null {
  if (!result) return null;
  if (result.length >= 3) return 'Triple';
  if (result.length === 2) return 'Doble';
  return 'Simple';
}

/** Calculates direct bets for a Manises multiple (Directo modalidad) */
export function calcDirectBets(matches: QuinielaMatch[]): number {
  return matches.reduce((acc, m) => {
    if (!m.result) return 0;
    return acc * m.result.length; // '1X2'.length=3, '0M'.length=2, etc.
  }, 1);
}


export interface GuaranteeTable {
  title: string;
  cols: string[];
  /**
   * Mín.-máx. garantizados por categoría, una fila por porcentaje.
   * Opcional a propósito: hasta que el motor de reducciones no
   * devuelva el desarrollo real, no hay forma de calcularlos, y la
   * UI debe decir que no están en vez de enseñar cifras de relleno
   * (ver el bloque "DATOS RETIRADOS" más abajo).
   */
  rows?: { prob: string; values: string[] }[];
  /** Primeras columnas del desarrollo. Opcional por el mismo motivo. */
  development?: string[];
  totalCols: number;
  plenaHome?: string[];
  plenaAway?: string[];
}

// ============================================================
// DATOS RETIRADOS — GARANTÍAS Y DESARROLLOS DE QUINIELA
// ============================================================
// Las tablas de garantías y los desarrollos que había aquí no
// salían de ninguna fuente: eran de relleno, y además imposibles.
// Lo que se comprobó antes de quitarlos:
//
// · Los desarrollos contradecían su propio pronóstico. En "4
//   Triples" solo 4 partidos pueden cambiar de signo entre
//   columnas; el desarrollo variaba en los 15, con 11 partidos
//   mostrando tres signos distintos. En "7 Dobles" (0 triples)
//   ningún partido puede tener tres signos: había cuatro.
// · Tres reducciones de tamaños distintos —"7 Dobles" (32 ap.),
//   "6 Dobles + 2 Triples" (32 ap.) y "Reducción al 13" (96 ap.)—
//   declaraban exactamente los mismos mínimos y máximos.
// · Las nueve declaraban la misma probabilidad, 16,67 %, fuera cual
//   fuera su tamaño, cuando debería ser apuestas/columnas al
//   directo: 12,5 % para 7 dobles, 11,1 % para 4 triples.
//
// La garantía de una reducción depende de QUÉ columnas juega, no
// solo de cuántas, así que esto no es un dato que falte por
// transcribir: sale del motor de reducciones o no sale. Mientras
// tanto `rows`/`development` van vacíos y la UI lo dice.
//
// Los recuentos de apuestas tampoco cuadran con las reducidas
// oficiales de LAE, pero eso es decisión de producto (qué
// reducciones se venden) y está pendiente de que lo confirme el
// cliente — por eso NO se han tocado aquí.
// ============================================================

export type ManisesModalidad = 'directo' | 'al_13' | 'al_12' | 'al_11';

export const MANISES_REDUCTIONS: {
  id: ManisesModalidad;
  label: string;
  bets: number;
  table: GuaranteeTable;
}[] = [
  {
    id: 'al_13',
    label: 'Reducción al 13',
    bets: 96,
    table: {
      title: 'GARANTÍAS DE PREMIOS (REDUCCIÓN AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
            rows: [],
            development: [],
      totalCols: 96,
      plenaHome: ['2', '1', 'M'],
      plenaAway: ['1', 'M', '0'],
    },
  },
  {
    id: 'al_12',
    label: 'Reducción al 12',
    bets: 48,
    table: {
      title: 'GARANTÍAS DE PREMIOS (REDUCCIÓN AL 12)',
      cols: ['de 9', 'de 10', 'de 11', 'de 12', 'de 13'],
            rows: [],
            development: [],
      totalCols: 48,
      plenaHome: ['1', 'M', '2'],
      plenaAway: ['M', '0', '1'],
    },
  },
  {
    id: 'al_11',
    label: 'Reducción al 11',
    bets: 18,
    table: {
      title: 'GARANTÍAS DE PREMIOS (REDUCCIÓN AL 11)',
      cols: ['de 8', 'de 9', 'de 10', 'de 11', 'de 12'],
            rows: [],
            development: [],
      totalCols: 18,
      plenaHome: ['2', 'M', '1'],
      plenaAway: ['1', '0', '2'],
    },
  },
];

// Las seis reducciones oficiales de LAE.
//
// No son elección nuestra ni del cliente: son producto del Estado, igual
// en todas las administraciones. Contrastadas con tres administraciones
// de loterías que coinciden exactamente, y con doble comprobación: los
// importes que publican cuadran con 0,75 EUR por apuesta (4 triples = 9
// apuestas = 6,75 EUR; 7 dobles = 16 = 12,00 EUR; 3D+3T = 24 = 18,00
// EUR), lo mismo que dice games.ts.
//
// Lo que había antes —16, 32, 32, 32, 64 y 128, todo potencias de dos—
// no correspondía a ningún producto real, se contradecía con
// QUINIELA_REDUCED_TABLES en bet-calculator.ts, y en dos casos tenía
// cambiado hasta el tipo de apuesta ("8 dobles al 12" son en realidad 8
// triples; "11 dobles al 11" es al 12).
//
// `locked` marca cuáles se ofrecen. Las seis están abiertas porque la
// web del propio cliente vende las seis: su plataforma lista "4 Triples,
// 7 Dobles, 3 Dobles 3 Triples, 6 Dobles 2 Triples, 8 Triples y 11
// Dobles". Antes había cuatro bloqueadas sin motivo aparente, y la que
// aquí llamábamos "8 Dobles" aparece allí como "8 Triples", que confirma
// la corrección de arriba.
export const OFICIAL_REDUCTIONS: {
  id: string;
  label: string;
  reqDobles: number;
  reqTriples: number;
  bets: number;
  locked: boolean;
  table: GuaranteeTable;
}[] = [
  {
    id: '4T_13',
    label: '4 Triples (al 13)',
    reqDobles: 0,
    reqTriples: 4,
    bets: 9,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (4 TRIPLES AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
            rows: [],
            development: [],
      totalCols: 9,
    },
  },
  {
    id: '7D_13',
    label: '7 Dobles (al 13)',
    reqDobles: 7,
    reqTriples: 0,
    bets: 16,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (7 DOBLES AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
            rows: [],
            development: [],
      totalCols: 16,
    },
  },
  {
    id: '3D3T_13',
    label: '3 Dobles + 3 Triples (al 13)',
    reqDobles: 3,
    reqTriples: 3,
    bets: 24,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (3D+3T AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
            rows: [],
            development: [],
      totalCols: 24,
    },
  },
  {
    id: '6D2T_13',
    label: '6 Dobles + 2 Triples (al 13)',
    reqDobles: 6,
    reqTriples: 2,
    bets: 64,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (6D+2T AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
            rows: [],
            development: [],
      totalCols: 64,
    },
  },
  {
    id: '8D_12',
    label: '8 Triples (al 12)',
    reqDobles: 0,
    reqTriples: 8,
    bets: 81,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (8 TRIPLES AL 12)',
      cols: ['de 9', 'de 10', 'de 11', 'de 12', 'de 13'],
            rows: [],
            development: [],
      totalCols: 81,
    },
  },
  {
    id: '11D_11',
    label: '11 Dobles (al 12)',
    reqDobles: 11,
    reqTriples: 0,
    bets: 132,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (11 DOBLES AL 12)',
      cols: ['de 8', 'de 9', 'de 10', 'de 11', 'de 12'],
            rows: [],
            development: [],
      totalCols: 132,
    },
  },
];
