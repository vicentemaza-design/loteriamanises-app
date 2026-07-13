import type { ResultDto } from '../../contracts/results.contracts';

/**
 * Mock Results Adapter
 * ~3 months of historical data with scrutiny per draw.
 */

function past(daysAgo: number, hour = 21, minute = 0): string {
  const d = new Date('2026-06-23T00:00:00');
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_RESULTS_DATA: ResultDto[] = [
  // 1. BONOLOTO (Miércoles, 10 de junio de 2026)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-06-10T21:30:00.000Z',
    numbers: [10, 12, 13, 15, 20, 28],
    complementario: 44,
    reintegro: 3,
    drawId: 'Sorteo 3.247',
    jackpotNext: 2900000,
    nextDrawDate: '2026-06-11T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2900000 },
      { category: '5 aciertos + Complementario', winners: 1, prizePerWinner: 78241.15 },
      { category: '5 aciertos', winners: 95, prizePerWinner: 1045.22 },
      { category: '4 aciertos', winners: 3890, prizePerWinner: 31.40 },
      { category: '3 aciertos', winners: 69230, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 412050, prizePerWinner: 0.50 },
    ],
  },

  // 2. EUROMILLONES (Martes, 9 de junio de 2026)
  {
    gameId: 'euromillones',
    gameType: 'euromillones',
    date: '2026-06-09T21:00:00.000Z',
    numbers: [12, 23, 34, 45, 48],
    stars: [4, 7],
    elMillon: 'KQT27854',
    drawId: 'Sorteo 1789',
    jackpotNext: 105000000,
    nextDrawDate: '2026-06-12T21:00:00.000Z',
    scrutiny: [
      { category: '1ª (5 + 2)', winners: 0, prizePerWinner: 105000000 },
      { category: '2ª (5 + 1)', winners: 4, prizePerWinner: 483114.25 },
      { category: '3ª (5 + 0)', winners: 8, prizePerWinner: 74808.49 },
      { category: '4ª (4 + 2)', winners: 38, prizePerWinner: 1203.57 },
      { category: '5ª (4 + 1)', winners: 761, prizePerWinner: 121.37 },
      { category: '6ª (3 + 2)', winners: 1539, prizePerWinner: 52.21 },
      { category: '7ª (4 + 0)', winners: 1829, prizePerWinner: 31.12 },
      { category: '8ª (2 + 2)', winners: 20406, prizePerWinner: 17.30 },
      { category: '9ª (3 + 1)', winners: 28098, prizePerWinner: 13.43 },
      { category: '10ª (3 + 0)', winners: 55158, prizePerWinner: 8.95 },
      { category: '11ª (1 + 2)', winners: 102465, prizePerWinner: 8.41 },
      { category: '12ª (2 + 1)', winners: 450453, prizePerWinner: 6.75 },
      { category: '13ª (2 + 0)', winners: 945158, prizePerWinner: 4.61 },
    ],
    elMillonScrutiny: [
      { category: 'Ganador', winners: 1, prizePerWinner: 1000000 },
    ],
  },

  // 3. BONOLOTO (Martes, 9 de junio de 2026)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-06-09T21:30:00.000Z',
    numbers: [2, 8, 14, 21, 32, 45],
    complementario: 12,
    reintegro: 6,
    drawId: 'Sorteo 3.246',
    jackpotNext: 2600000,
    nextDrawDate: '2026-06-10T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2600000 },
      { category: '5 aciertos + Complementario', winners: 2, prizePerWinner: 62450.12 },
      { category: '5 aciertos', winners: 88, prizePerWinner: 1120.40 },
      { category: '4 aciertos', winners: 4012, prizePerWinner: 29.50 },
      { category: '3 aciertos', winners: 72150, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 421800, prizePerWinner: 0.50 },
    ],
  },

  // 4. PRIMITIVA (Lunes, 8 de junio de 2026)
  {
    gameId: 'primitiva',
    gameType: 'primitiva',
    date: '2026-06-08T21:30:00.000Z',
    numbers: [1, 6, 16, 17, 37, 43],
    complementario: 5,
    reintegro: 7,
    joker: '3847291',
    drawId: 'Sorteo 46/26',
    jackpotNext: 14000000,
    nextDrawDate: '2026-06-11T21:30:00.000Z',
    scrutiny: [
      { category: '6 Aciertos', winners: 0, prizePerWinner: 14000000 },
      { category: '5 Aciertos + Complementario', winners: 1, prizePerWinner: 198425.40 },
      { category: '5 Aciertos', winners: 10, prizePerWinner: 3890.15 },
      { category: '4 Aciertos', winners: 480, prizePerWinner: 65.40 },
      { category: '3 Aciertos', winners: 14210, prizePerWinner: 8.00 },
      { category: 'Reintegro', winners: 215430, prizePerWinner: 1.00 },
    ],
    jokerScrutiny: [
      { category: 'Joker (7 cifras)', winners: 0, prizePerWinner: 1200000 },
      { category: '6 primeras cifras', winners: 1, prizePerWinner: 6000 },
      { category: '5 primeras cifras', winners: 4, prizePerWinner: 2000 },
      { category: '4 primeras cifras', winners: 38, prizePerWinner: 200 },
      { category: '3 primeras cifras', winners: 421, prizePerWinner: 20 },
      { category: '2 primeras cifras', winners: 4190, prizePerWinner: 6 },
      { category: '1 primera cifra', winners: 41832, prizePerWinner: 3 },
    ],
  },

  // 5. PRIMITIVA (Sábado, 6 de junio de 2026) - Mapped to Saturday
  {
    gameId: 'primitiva',
    gameType: 'primitiva',
    date: '2026-06-06T21:30:00.000Z',
    numbers: [6, 11, 20, 21, 31, 47],
    complementario: 2,
    reintegro: 8,
    joker: '5612847',
    drawId: 'Sorteo 45/26',
    jackpotNext: 12500000,
    nextDrawDate: '2026-06-08T21:30:00.000Z',
    scrutiny: [
      { category: '6 Aciertos', winners: 0, prizePerWinner: 12500000 },
      { category: '5 Aciertos + Complementario', winners: 1, prizePerWinner: 234567.00 },
      { category: '5 Aciertos', winners: 7, prizePerWinner: 4234.00 },
      { category: '4 Aciertos', winners: 523, prizePerWinner: 67.00 },
      { category: '3 Aciertos', winners: 15432, prizePerWinner: 8.00 },
      { category: 'Reintegro', winners: 234567, prizePerWinner: 1.00 },
    ],
    jokerScrutiny: [
      { category: 'Joker (7 cifras)', winners: 0, prizePerWinner: 1200000 },
      { category: '6 primeras cifras', winners: 0, prizePerWinner: 6000 },
      { category: '5 primeras cifras', winners: 7, prizePerWinner: 2000 },
      { category: '4 primeras cifras', winners: 51, prizePerWinner: 200 },
      { category: '3 primeras cifras', winners: 498, prizePerWinner: 20 },
      { category: '2 primeras cifras', winners: 4823, prizePerWinner: 6 },
      { category: '1 primera cifra', winners: 47210, prizePerWinner: 3 },
    ],
  },

  // 6. LOTERÍA NACIONAL SÁBADO (Sábado, 6 de junio de 2026)
  {
    gameId: 'loteria-nacional-sabado',
    gameType: 'loteria-nacional',
    date: '2026-06-06T13:00:00.000Z',
    numbers: [5, 8, 2, 4, 7],
    firstPrizeNumber: '58247',
    secondPrizeNumber: '13680',
    reintegros: [7, 4, 1],
    decimoPrice: 6,
    drawId: 'Sorteo 46/26',
    jackpotNext: 60000,
    nextDrawDate: '2026-06-13T13:00:00.000Z',
    scrutiny: [
      { category: '1er Premio', winners: 1, prizePerWinner: 60000 },
      { category: '2º Premio', winners: 1, prizePerWinner: 24000 },
      { category: 'Aproximación 1er Premio (anterior/posterior)', winners: 2, prizePerWinner: 18000 },
      { category: 'Aproximación 2º Premio (anterior/posterior)', winners: 2, prizePerWinner: 4000 },
      { category: 'Centenas 1er Premio', winners: 700, prizePerWinner: 800 },
      { category: 'Terminaciones 3 cifras 1er Premio', winners: 7000, prizePerWinner: 200 },
      { category: 'Terminaciones 2 cifras', winners: 70000, prizePerWinner: 40 },
      { category: 'Reintegros', winners: 100000, prizePerWinner: 6 },
    ],
  },

  // 7. EUROMILLONES (Viernes, 5 de junio de 2026)
  {
    gameId: 'euromillones',
    gameType: 'euromillones',
    date: '2026-06-05T21:00:00.000Z',
    numbers: [5, 10, 18, 26, 33],
    stars: [1, 11],
    elMillon: 'PPT54812',
    drawId: 'Sorteo 1788',
    jackpotNext: 85000000,
    nextDrawDate: '2026-06-09T21:00:00.000Z',
    scrutiny: [
      { category: '1ª (5 + 2)', winners: 0, prizePerWinner: 85000000 },
      { category: '2ª (5 + 1)', winners: 1, prizePerWinner: 312500 },
      { category: '3ª (5 + 0)', winners: 5, prizePerWinner: 62100 },
      { category: '4ª (4 + 2)', winners: 12, prizePerWinner: 2340 },
      { category: '5ª (4 + 1)', winners: 298, prizePerWinner: 132 },
      { category: '6ª (3 + 2)', winners: 478, prizePerWinner: 72 },
      { category: '7ª (4 + 0)', winners: 1654, prizePerWinner: 45 },
      { category: '8ª (2 + 2)', winners: 5876, prizePerWinner: 17 },
      { category: '9ª (3 + 1)', winners: 7890, prizePerWinner: 13 },
      { category: '10ª (3 + 0)', winners: 19876, prizePerWinner: 9 },
      { category: '11ª (1 + 2)', winners: 11234, prizePerWinner: 9 },
      { category: '12ª (2 + 1)', winners: 61234, prizePerWinner: 6 },
      { category: '13ª (2 + 0)', winners: 167890, prizePerWinner: 4 },
    ],
    elMillonScrutiny: [
      { category: 'Ganador', winners: 0, prizePerWinner: 1000000 },
    ],
  },

  // 8. LOTERÍA NACIONAL JUEVES (Jueves, 4 de junio de 2026)
  {
    gameId: 'loteria-nacional-jueves',
    gameType: 'loteria-nacional',
    date: '2026-06-04T21:00:00.000Z',
    numbers: [9, 9, 2, 4, 2],
    firstPrizeNumber: '99242',
    secondPrizeNumber: '69176',
    reintegros: [0, 2, 7],
    decimoPrice: 3,
    drawId: 'Sorteo 45/26',
    jackpotNext: 30000,
    nextDrawDate: '2026-06-11T21:00:00.000Z',
    scrutiny: [
      { category: '1er Premio', winners: 1, prizePerWinner: 30000 },
      { category: '2º Premio', winners: 1, prizePerWinner: 6000 },
    ],
    ultimas4cifras: ['1630', '2703', '3755', '7565'],
    ultimas3cifras: ['079', '081', '084', '292', '406', '690', '926'],
    ultimas2cifras: ['20', '48', '54', '66', '69', '77', '90', '94'],
  },

  // Older reference draws
  // BONOLOTO (Miércoles, 3 de junio de 2026) - matches the third column detail
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-06-03T21:30:00.000Z',
    numbers: [7, 14, 22, 31, 41, 48],
    complementario: 12,
    reintegro: 3,
    drawId: 'Sorteo 3.245',
    jackpotNext: 2300000,
    nextDrawDate: '2026-06-04T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2300000 },
      { category: '5 aciertos + Complementario', winners: 1, prizePerWinner: 84512.34 },
      { category: '5 aciertos', winners: 82, prizePerWinner: 1102.56 },
      { category: '4 aciertos', winners: 4123, prizePerWinner: 28.31 },
      { category: '3 aciertos', winners: 77584, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 432105, prizePerWinner: 0.50 },
    ],
  },
  {
    gameId: 'gordo',
    gameType: 'gordo',
    date: '2026-05-31T13:00:00.000Z',
    numbers: [2, 17, 28, 35, 51],
    stars: [7],
    jackpotNext: 5400000,
    nextDrawDate: '2026-06-07T13:00:00.000Z',
    scrutiny: [
      { category: '5 + Clave', winners: 0, prizePerWinner: 5400000 },
      { category: '5', winners: 4, prizePerWinner: 16234 },
      { category: '4 + Clave', winners: 23, prizePerWinner: 1234 },
      { category: '4', winners: 456, prizePerWinner: 78 },
      { category: '3 + Clave', winners: 2345, prizePerWinner: 23 },
      { category: '3', winners: 12456, prizePerWinner: 8 },
      { category: '2 + Clave', winners: 18234, prizePerWinner: 5 },
      { category: 'Reintegro', winners: 45678, prizePerWinner: 1.5 },
    ],
  },
  {
    gameId: 'eurodreams',
    gameType: 'eurodreams',
    date: '2026-06-01T21:00:00.000Z',
    numbers: [4, 15, 22, 31, 38, 42],
    stars: [5],
    jackpotNext: 20000,
    nextDrawDate: '2026-06-04T21:00:00.000Z',
    scrutiny: [
      { category: '6 + 1 (El Sueño)', winners: 0, prizePerWinner: 20000, isMonthly: true },
      { category: '6', winners: 0, prizePerWinner: 2000, isMonthly: true },
      { category: '5 + 1', winners: 3, prizePerWinner: 2000 },
      { category: '5', winners: 23, prizePerWinner: 50 },
      { category: '4 + 1', winners: 234, prizePerWinner: 20 },
      { category: '4', winners: 2345, prizePerWinner: 10 },
      { category: '3 + 1', winners: 12345, prizePerWinner: 6 },
      { category: '3', winners: 67890, prizePerWinner: 4 },
      { category: '2 + 1', winners: 234567, prizePerWinner: 4 },
    ],
  },
  {
    gameId: 'quiniela',
    gameType: 'quiniela',
    date: '2026-05-31T18:00:00.000Z',
    numbers: [1, 2, 1, 'X', 2, 1, 1, 'X', 1, 2, 1, 1, 'X', 2, 'M-1'],
    jackpotNext: 4700000,
    nextDrawDate: '2026-06-07T18:00:00.000Z',
    scrutiny: [
      { category: '15 Resultados', winners: 0, prizePerWinner: 4700000 },
      { category: '14 Resultados', winners: 2, prizePerWinner: 45678 },
      { category: '13 Resultados', winners: 234, prizePerWinner: 567 },
      { category: '12 Resultados', winners: 8765, prizePerWinner: 12 },
      { category: 'Especial Pleno al 15', winners: 0, prizePerWinner: 45000 },
    ],
  },

  // ── RESULTADOS PARA DEMO DE ACIERTOS ──────────────────────────────────────

  // PRIMITIVA — 8 May 2026 (coincide con demo-primitiva status:'won')
  // Apuesta 1 del ticket: [5,12,21,30,49,6] → acierta 5, 12, 21 (3 aciertos)
  {
    gameId: 'primitiva',
    gameType: 'primitiva',
    date: '2026-05-08T21:30:00.000Z',
    numbers: [5, 12, 21, 33, 41, 47],
    complementario: 30,
    reintegro: 4,
    joker: '7294513',
    drawId: 'Sorteo 37/26',
    jackpotNext: 9000000,
    nextDrawDate: '2026-05-11T21:30:00.000Z',
    scrutiny: [
      { category: '6 Aciertos', winners: 0, prizePerWinner: 9000000 },
      { category: '5 Aciertos + Complementario', winners: 0, prizePerWinner: 0 },
      { category: '5 Aciertos', winners: 12, prizePerWinner: 2890.15 },
      { category: '4 Aciertos', winners: 612, prizePerWinner: 52.40 },
      { category: '3 Aciertos', winners: 18430, prizePerWinner: 8.00 },
      { category: 'Reintegro', winners: 198200, prizePerWinner: 1.00 },
    ],
    jokerScrutiny: [
      { category: 'Joker (7 cifras)', winners: 1, prizePerWinner: 1200000 },
      { category: '6 primeras cifras', winners: 2, prizePerWinner: 6000 },
      { category: '5 primeras cifras', winners: 11, prizePerWinner: 2000 },
      { category: '4 primeras cifras', winners: 44, prizePerWinner: 200 },
      { category: '3 primeras cifras', winners: 389, prizePerWinner: 20 },
      { category: '2 primeras cifras', winners: 3921, prizePerWinner: 6 },
      { category: '1 primera cifra', winners: 39104, prizePerWinner: 3 },
    ],
  },

  // BONOLOTO — 5 May 2026 (día 1 de demo-bonoloto-semanal)
  // Apuesta 1: [7,17,20,22,32,44] → acierta 7, 17, 20 (3 aciertos)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-05T21:30:00.000Z',
    numbers: [7, 17, 20, 26, 38, 48],
    complementario: 22,
    reintegro: 5,
    drawId: 'Sorteo 3.219',
    jackpotNext: 1800000,
    nextDrawDate: '2026-05-06T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 1800000 },
      { category: '5 aciertos + Complementario', winners: 1, prizePerWinner: 45210.50 },
      { category: '5 aciertos', winners: 62, prizePerWinner: 890.20 },
      { category: '4 aciertos', winners: 2810, prizePerWinner: 28.50 },
      { category: '3 aciertos', winners: 58900, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 389100, prizePerWinner: 0.50 },
    ],
  },

  // BONOLOTO — 6 May 2026 (día 2 de demo-bonoloto-semanal)
  // Apuesta 2: [3,8,15,17,38,44] → acierta 3, 8, 15, 38, 44 (5 aciertos!) + complementario 17
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-06T21:30:00.000Z',
    numbers: [3, 8, 15, 38, 44, 49],
    complementario: 17,
    reintegro: 2,
    drawId: 'Sorteo 3.220',
    jackpotNext: 2100000,
    nextDrawDate: '2026-05-07T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2100000 },
      { category: '5 aciertos + Complementario', winners: 1, prizePerWinner: 31200.80 },
      { category: '5 aciertos', winners: 74, prizePerWinner: 960.10 },
      { category: '4 aciertos', winners: 3120, prizePerWinner: 30.20 },
      { category: '3 aciertos', winners: 64200, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 401200, prizePerWinner: 0.50 },
    ],
  },

  // BONOLOTO — 7 May 2026 (día 3)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-07T21:30:00.000Z',
    numbers: [2, 11, 19, 30, 39, 47],
    complementario: 8,
    reintegro: 9,
    drawId: 'Sorteo 3.221',
    jackpotNext: 2300000,
    nextDrawDate: '2026-05-08T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2300000 },
      { category: '5 aciertos + Complementario', winners: 0, prizePerWinner: 0 },
      { category: '5 aciertos', winners: 55, prizePerWinner: 1010.50 },
      { category: '4 aciertos', winners: 2900, prizePerWinner: 31.40 },
      { category: '3 aciertos', winners: 61000, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 395000, prizePerWinner: 0.50 },
    ],
  },

  // BONOLOTO — 8 May 2026 (día 4 de demo-bonoloto-semanal)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-08T21:30:00.000Z',
    numbers: [4, 14, 21, 33, 42, 47],
    complementario: 5,
    reintegro: 7,
    drawId: 'Sorteo 3.222',
    jackpotNext: 2500000,
    nextDrawDate: '2026-05-09T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2500000 },
      { category: '5 aciertos + Complementario', winners: 0, prizePerWinner: 0 },
      { category: '5 aciertos', winners: 48, prizePerWinner: 1120.00 },
      { category: '4 aciertos', winners: 2700, prizePerWinner: 30.00 },
      { category: '3 aciertos', winners: 59000, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 392000, prizePerWinner: 0.50 },
    ],
  },

  // BONOLOTO — 9 May 2026 (día 5 de demo-bonoloto-semanal)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-09T21:30:00.000Z',
    numbers: [1, 8, 24, 37, 43, 46],
    complementario: 19,
    reintegro: 1,
    drawId: 'Sorteo 3.223',
    jackpotNext: 2700000,
    nextDrawDate: '2026-05-10T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2700000 },
      { category: '5 aciertos + Complementario', winners: 0, prizePerWinner: 0 },
      { category: '5 aciertos', winners: 61, prizePerWinner: 980.40 },
      { category: '4 aciertos', winners: 3010, prizePerWinner: 29.50 },
      { category: '3 aciertos', winners: 62100, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 398200, prizePerWinner: 0.50 },
    ],
  },

  // BONOLOTO — 10 May 2026 (día 6 de demo-bonoloto-semanal)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-10T21:30:00.000Z',
    numbers: [6, 13, 20, 29, 40, 48],
    complementario: 32,
    reintegro: 4,
    drawId: 'Sorteo 3.224',
    jackpotNext: 2900000,
    nextDrawDate: '2026-05-11T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 2900000 },
      { category: '5 aciertos + Complementario', winners: 0, prizePerWinner: 0 },
      { category: '5 aciertos', winners: 53, prizePerWinner: 1050.00 },
      { category: '4 aciertos', winners: 2850, prizePerWinner: 31.00 },
      { category: '3 aciertos', winners: 60500, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 394500, prizePerWinner: 0.50 },
    ],
  },

  // BONOLOTO — 11 May 2026 (día 7 de demo-bonoloto-semanal)
  {
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    date: '2026-05-11T21:30:00.000Z',
    numbers: [10, 18, 27, 35, 44, 49],
    complementario: 22,
    reintegro: 3,
    drawId: 'Sorteo 3.225',
    jackpotNext: 3200000,
    nextDrawDate: '2026-05-12T21:30:00.000Z',
    scrutiny: [
      { category: '6 aciertos', winners: 0, prizePerWinner: 3200000 },
      { category: '5 aciertos + Complementario', winners: 0, prizePerWinner: 0 },
      { category: '5 aciertos', winners: 70, prizePerWinner: 1090.00 },
      { category: '4 aciertos', winners: 3100, prizePerWinner: 30.50 },
      { category: '3 aciertos', winners: 63000, prizePerWinner: 4.00 },
      { category: 'Reintegro', winners: 401000, prizePerWinner: 0.50 },
    ],
  },

  // EUROMILLONES — 11 Abr 2026 (sorteo 1 de demo-euro-subscription)
  // Apuesta 6: [1,11,23,29,46] estrellas [4,12] → acierta 1, 11, 29 + estrella 4 (3ª+1)
  {
    gameId: 'euromillones',
    gameType: 'euromillones',
    date: '2026-04-11T21:00:00.000Z',
    numbers: [1, 11, 29, 35, 43],
    stars: [4, 7],
    elMillon: 'BKR49201',
    drawId: 'Sorteo 1781',
    jackpotNext: 68000000,
    nextDrawDate: '2026-04-15T21:00:00.000Z',
    scrutiny: [
      { category: '1ª (5 + 2)', winners: 0, prizePerWinner: 68000000 },
      { category: '2ª (5 + 1)', winners: 2, prizePerWinner: 312400.00 },
      { category: '3ª (5 + 0)', winners: 5, prizePerWinner: 51200.00 },
      { category: '4ª (4 + 2)', winners: 22, prizePerWinner: 890.00 },
      { category: '5ª (4 + 1)', winners: 498, prizePerWinner: 98.40 },
      { category: '9ª (3 + 1)', winners: 24100, prizePerWinner: 11.20 },
      { category: '12ª (2 + 1)', winners: 380200, prizePerWinner: 5.80 },
    ],
    elMillonScrutiny: [
      { category: 'Ganador', winners: 1, prizePerWinner: 1000000 },
    ],
  },

  // EUROMILLONES — 15 Abr 2026 (sorteo 2 de demo-euro-subscription)
  // Apuesta 1: [7,14,23,38,47] estrellas [3,9] → acierta 7, 14, 23 + estrella 3 (3ª+1)
  {
    gameId: 'euromillones',
    gameType: 'euromillones',
    date: '2026-04-15T21:00:00.000Z',
    numbers: [7, 14, 23, 31, 50],
    stars: [3, 8],
    elMillon: 'MTP83650',
    drawId: 'Sorteo 1783',
    jackpotNext: 75000000,
    nextDrawDate: '2026-04-18T21:00:00.000Z',
    scrutiny: [
      { category: '1ª (5 + 2)', winners: 0, prizePerWinner: 75000000 },
      { category: '2ª (5 + 1)', winners: 3, prizePerWinner: 289100.00 },
      { category: '3ª (5 + 0)', winners: 7, prizePerWinner: 48900.00 },
      { category: '4ª (4 + 2)', winners: 31, prizePerWinner: 1050.00 },
      { category: '5ª (4 + 1)', winners: 612, prizePerWinner: 104.20 },
      { category: '9ª (3 + 1)', winners: 26800, prizePerWinner: 12.50 },
      { category: '12ª (2 + 1)', winners: 412000, prizePerWinner: 6.20 },
    ],
    elMillonScrutiny: [
      { category: 'Ganador', winners: 1, prizePerWinner: 1000000 },
    ],
  },
];

// Sorted most recent first (mirrors Firebase's orderBy('date', 'desc'))
const sorted = [...MOCK_RESULTS_DATA].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export async function getLatestResultsMock(): Promise<ResultDto[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(sorted), 500);
  });
}

export async function getResultByIdMock(id: string): Promise<ResultDto | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = MOCK_RESULTS_DATA.find(r => r.gameId === id);
      resolve(result || null);
    }, 300);
  });
}
