export type QuinielaResult = '1' | 'X' | '2' | '1X' | '12' | 'X2' | '1X2' | null;

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
  { id: 15, home: 'Pleno al 15',     away: '' },
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

export function getMatchTypeBadge(result: QuinielaResult): 'Simple' | 'Doble' | 'Triple' | null {
  if (!result) return null;
  const count = result.length === 3 ? 3 : result.length === 2 ? 2 : 1;
  if (count === 1) return 'Simple';
  if (count === 2) return 'Doble';
  return 'Triple';
}

/** Calculates direct bets for a Manises multiple (Directo modalidad) */
export function calcDirectBets(matches: QuinielaMatch[]): number {
  return matches.reduce((acc, m) => {
    if (!m.result) return 0; // Not all selected → invalid
    const len = m.result === '1X2' ? 3 : m.result.length === 2 ? 2 : 1;
    return acc * len;
  }, 1);
}

/** Upcoming Thursdays from a reference date */
export function getUpcomingThursdays(from: Date, count: number): Date[] {
  const result: Date[] = [];
  const d = new Date(from);
  d.setHours(18, 0, 0, 0);
  // Advance to next Thursday (4 = Thursday)
  const day = d.getDay();
  const daysUntilThursday = day <= 4 ? 4 - day : 7 - day + 4;
  d.setDate(d.getDate() + daysUntilThursday);
  for (let i = 0; i < count; i++) {
    result.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return result;
}

export interface GuaranteeTable {
  title: string;
  cols: string[];
  rows: { prob: string; values: string[] }[];
  development: string[];
  totalCols: number;
}

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
      rows: [
        { prob: '16,67 %', values: ['0–3', '8–14', '1–4', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['4–10', '0–6', '3–6', '1–2', '—'] },
      ],
      development: [
        '1  X  2  1  X  2  2  2  1  1  1  1  X  2  1',
        '1  X  1  X  X  2  1  2  1  2  1  X  1  2  1',
        'X  1  X  2  X  X  1  X  X  1  2  X  1  X  X',
      ],
      totalCols: 96,
    },
  },
  {
    id: 'al_12',
    label: 'Reducción al 12',
    bets: 48,
    table: {
      title: 'GARANTÍAS DE PREMIOS (REDUCCIÓN AL 12)',
      cols: ['de 9', 'de 10', 'de 11', 'de 12', 'de 13'],
      rows: [
        { prob: '16,67 %', values: ['0–3', '5–12', '1–3', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['4–8', '0–4', '2–5', '1–2', '—'] },
      ],
      development: [
        '1  X  2  1  X  2  2  1  1  X  1  1  X  2  1',
        'X  1  X  2  X  1  X  2  X  1  2  X  1  X  X',
        '1  2  X  X  2  X  X  1  2  1  X  2  1  X  1',
      ],
      totalCols: 48,
    },
  },
  {
    id: 'al_11',
    label: 'Reducción al 11',
    bets: 18,
    table: {
      title: 'GARANTÍAS DE PREMIOS (REDUCCIÓN AL 11)',
      cols: ['de 8', 'de 9', 'de 10', 'de 11', 'de 12'],
      rows: [
        { prob: '16,67 %', values: ['0–2', '3–9', '1–3', '1–2', '—'] },
        { prob: '100 %',   values: ['3–7', '0–2', '1–3', '1–2', '—'] },
      ],
      development: [
        'X  2  1  X  2  X  X  1  X  1  X  2  1  X  1',
        '1  X  2  1  X  1  X  2  1  X  X  1  X  2  X',
        '2  1  X  2  1  2  1  X  2  2  1  X  2  1  X',
      ],
      totalCols: 18,
    },
  },
];

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
    bets: 16,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (4 TRIPLES AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
      rows: [
        { prob: '16,67 %', values: ['0–2', '5–12', '1–4', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['3–9', '0–4', '2–4', '1–2', '—'] },
      ],
      development: [
        'X  2  1  2  X  1  X  2  1  X  1  X  2  X  1',
        '1  X  2  X  1  2  X  1  2  1  X  2  1  X  2',
        '2  1  X  1  2  X  2  X  1  2  X  1  X  2  X',
      ],
      totalCols: 16,
    },
  },
  {
    id: '7D_13',
    label: '7 Dobles (al 13)',
    reqDobles: 7,
    reqTriples: 0,
    bets: 32,
    locked: false,
    table: {
      title: 'GARANTÍAS DE PREMIOS (7 DOBLES AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
      rows: [
        { prob: '16,67 %', values: ['0–3', '8–14', '1–4', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['4–10', '0–6', '3–6', '1–2', '—'] },
      ],
      development: [
        '1  X  2  X  X  X  2  1  1  2  2  X  2  X  1',
        '1  X  2  X  X  1  X  2  X  X  X  2  X  1  1',
        '1  2  1  2  X  X  X  X  2  X  1  2  X  2  1',
      ],
      totalCols: 32,
    },
  },
  {
    id: '3D3T_13',
    label: '3 Dobles + 3 Triples (al 13)',
    reqDobles: 3,
    reqTriples: 3,
    bets: 32,
    locked: true,
    table: {
      title: 'GARANTÍAS DE PREMIOS (3D+3T AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
      rows: [
        { prob: '16,67 %', values: ['0–3', '7–13', '1–4', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['4–9', '0–5', '2–5', '1–2', '—'] },
      ],
      development: ['—', '—', '—'],
      totalCols: 32,
    },
  },
  {
    id: '6D2T_13',
    label: '6 Dobles + 2 Triples (al 13)',
    reqDobles: 6,
    reqTriples: 2,
    bets: 32,
    locked: true,
    table: {
      title: 'GARANTÍAS DE PREMIOS (6D+2T AL 13)',
      cols: ['de 10', 'de 11', 'de 12', 'de 13', 'de 14'],
      rows: [
        { prob: '16,67 %', values: ['0–3', '8–14', '1–4', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['4–10', '0–6', '3–6', '1–2', '—'] },
      ],
      development: ['—', '—', '—'],
      totalCols: 32,
    },
  },
  {
    id: '8D_12',
    label: '8 Dobles (al 12)',
    reqDobles: 8,
    reqTriples: 0,
    bets: 64,
    locked: true,
    table: {
      title: 'GARANTÍAS DE PREMIOS (8 DOBLES AL 12)',
      cols: ['de 9', 'de 10', 'de 11', 'de 12', 'de 13'],
      rows: [
        { prob: '16,67 %', values: ['0–3', '6–13', '1–3', '1–2', '1(*)'] },
        { prob: '100 %',   values: ['4–9', '0–5', '2–5', '1–2', '—'] },
      ],
      development: ['—', '—', '—'],
      totalCols: 64,
    },
  },
  {
    id: '11D_11',
    label: '11 Dobles (al 11)',
    reqDobles: 11,
    reqTriples: 0,
    bets: 128,
    locked: true,
    table: {
      title: 'GARANTÍAS DE PREMIOS (11 DOBLES AL 11)',
      cols: ['de 8', 'de 9', 'de 10', 'de 11', 'de 12'],
      rows: [
        { prob: '16,67 %', values: ['0–2', '4–10', '1–3', '1–2', '—'] },
        { prob: '100 %',   values: ['3–8', '0–3', '1–4', '1–2', '—'] },
      ],
      development: ['—', '—', '—'],
      totalCols: 128,
    },
  },
];
