// ============================================================
// QUINIELA — CALENDARIO DE JORNADAS
// ============================================================
// Añade una entrada por cada DOMINGO de jornada con la clave
// en formato YYYY-MM-DD. El partido 15 siempre es "Pleno al 15".
//
// Para integración con BE: sustituye `getFixturesForDate` por
// una llamada a tu API → fetch(`/api/quiniela/fixtures?date=${key}`)
// ============================================================

export interface QuinielaFixture {
  id: number;
  home: string;
  away: string; // vacío para "Pleno al 15"
}

// ── TEMPORADA 2026-27 ────────────────────────────────────────

const QUINIELA_CALENDAR: Record<string, QuinielaFixture[]> = {

  // Jornada 1 — 12 Jul 2026
  '2026-07-12': [
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
  ],

  // Jornada 2 — 19 Jul 2026
  '2026-07-19': [
    { id: 1,  home: 'FC Barcelona',    away: 'Valencia' },
    { id: 2,  home: 'Sevilla',         away: 'Real Madrid' },
    { id: 3,  home: 'Real Betis',      away: 'Athletic Club' },
    { id: 4,  home: 'Real Sociedad',   away: 'Atlético Madrid' },
    { id: 5,  home: 'Getafe',          away: 'Villarreal' },
    { id: 6,  home: 'Osasuna',         away: 'Las Palmas' },
    { id: 7,  home: 'Espanyol',        away: 'Rayo' },
    { id: 8,  home: 'Mallorca',        away: 'Alavés' },
    { id: 9,  home: 'Girona',          away: 'Celta' },
    { id: 10, home: 'Almería',         away: 'Levante' },
    { id: 11, home: 'Sporting',        away: 'Granada' },
    { id: 12, home: 'Eibar',           away: 'Zaragoza' },
    { id: 13, home: 'HamKam',          away: 'Brann' },
    { id: 14, home: 'Stabaek',         away: 'Sandefjord' },
    { id: 15, home: 'Pleno al 15',     away: '' },
  ],

  // Jornada 3 — 26 Jul 2026
  '2026-07-26': [
    { id: 1,  home: 'Atlético Madrid', away: 'Real Madrid' },
    { id: 2,  home: 'Real Sociedad',   away: 'FC Barcelona' },
    { id: 3,  home: 'Villarreal',      away: 'Sevilla' },
    { id: 4,  home: 'Celta',           away: 'Valencia' },
    { id: 5,  home: 'Athletic Club',   away: 'Getafe' },
    { id: 6,  home: 'Las Palmas',      away: 'Real Betis' },
    { id: 7,  home: 'Rayo',            away: 'Osasuna' },
    { id: 8,  home: 'Girona',          away: 'Espanyol' },
    { id: 9,  home: 'Alavés',          away: 'Mallorca' },
    { id: 10, home: 'Granada',         away: 'Eibar' },
    { id: 11, home: 'Zaragoza',        away: 'Almería' },
    { id: 12, home: 'Levante',         away: 'Sporting' },
    { id: 13, home: 'Sandefjord',      away: 'Stabaek' },
    { id: 14, home: 'HamKam',          away: 'Brann' },
    { id: 15, home: 'Pleno al 15',     away: '' },
  ],

  // Jornada 4 — 2 Ago 2026
  '2026-08-02': [
    { id: 1,  home: 'Real Madrid',     away: 'Atlético Madrid' },
    { id: 2,  home: 'FC Barcelona',    away: 'Real Sociedad' },
    { id: 3,  home: 'Sevilla',         away: 'Athletic Club' },
    { id: 4,  home: 'Valencia',        away: 'Villarreal' },
    { id: 5,  home: 'Getafe',          away: 'Las Palmas' },
    { id: 6,  home: 'Real Betis',      away: 'Celta' },
    { id: 7,  home: 'Osasuna',         away: 'Girona' },
    { id: 8,  home: 'Espanyol',        away: 'Alavés' },
    { id: 9,  home: 'Mallorca',        away: 'Rayo' },
    { id: 10, home: 'Eibar',           away: 'Zaragoza' },
    { id: 11, home: 'Almería',         away: 'Levante' },
    { id: 12, home: 'Sporting',        away: 'Granada' },
    { id: 13, home: 'Brann',           away: 'HamKam' },
    { id: 14, home: 'Stabaek',         away: 'Sandefjord' },
    { id: 15, home: 'Pleno al 15',     away: '' },
  ],

  // Jornada 5 — 9 Ago 2026
  '2026-08-09': [
    { id: 1,  home: 'FC Barcelona',    away: 'Atlético Madrid' },
    { id: 2,  home: 'Real Madrid',     away: 'Villarreal' },
    { id: 3,  home: 'Sevilla',         away: 'Valencia' },
    { id: 4,  home: 'Real Betis',      away: 'Real Sociedad' },
    { id: 5,  home: 'Athletic Club',   away: 'Rayo' },
    { id: 6,  home: 'Osasuna',         away: 'Getafe' },
    { id: 7,  home: 'Las Palmas',      away: 'Girona' },
    { id: 8,  home: 'Celta',           away: 'Mallorca' },
    { id: 9,  home: 'Alavés',          away: 'Espanyol' },
    { id: 10, home: 'Zaragoza',        away: 'Granada' },
    { id: 11, home: 'Levante',         away: 'Almería' },
    { id: 12, home: 'Eibar',           away: 'Sporting' },
    { id: 13, home: 'HamKam',          away: 'Sandefjord' },
    { id: 14, home: 'Brann',           away: 'Stabaek' },
    { id: 15, home: 'Pleno al 15',     away: '' },
  ],

  // ── Añade aquí las siguientes jornadas ──
  // 'YYYY-MM-DD': [ { id: 1, home: '...', away: '...' }, ... ]

};

// Fallback cuando no hay datos para la fecha solicitada
const FALLBACK_FIXTURES: QuinielaFixture[] = QUINIELA_CALENDAR['2026-07-12'];

/**
 * Devuelve los 15 partidos del domingo indicado.
 * Si no hay datos en el calendario, usa el fallback.
 *
 * Para integración BE, reemplaza esta función por:
 *   await fetch(`/api/quiniela/fixtures?date=${key}`)
 */
export function getFixturesForDate(date: Date): QuinielaFixture[] {
  const key = date.toISOString().slice(0, 10);
  return QUINIELA_CALENDAR[key] ?? FALLBACK_FIXTURES;
}
