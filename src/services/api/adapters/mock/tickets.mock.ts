import type { TicketDto } from '../../contracts/tickets.contracts';

const INITIAL_MOCK_TICKETS_DATA: TicketDto[] = [
  // ── Primitiva escrutada (18 columnas · 3 boletos · con Joker) ────────────
  {
    id: 'demo-primitiva',
    selaeTicketId: 'SEL-90234871',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [5, 12, 21, 30, 49, 6],
    bets: [
      [ 5, 12, 21, 30, 49,  6],
      [ 3, 11, 22, 31, 48, 19],
      [ 2,  9, 18, 27, 41, 46],
      [ 7, 14, 33, 32, 46, 25],
      [ 1,  8, 23, 28, 48, 12],
      [ 4, 13, 20, 34, 43, 38],
      [ 6, 10, 16, 36, 45, 40],
      [15, 19, 25, 33, 41, 48],
      [ 5, 13, 21, 31, 42, 47],
      [ 2,  9, 17, 32, 41, 22],
      [ 3, 11, 20, 29, 22, 27],
      [ 7, 15, 23, 28, 40, 33],
      [ 1,  8, 16, 24, 34, 12],
      [ 6, 12, 19, 25, 38, 10],
      [ 4, 10, 18, 27, 49, 16],
      [14, 22, 33, 47, 40, 29],
      [ 5, 12, 21, 31, 42, 49],
      [ 8, 16, 24, 34, 19, 44],
    ],
    betReintegros: [3, 7, 1, 8, 0, 5, 2, 9, 4, 6, 1, 7, 3, 5, 8, 2, 6, 0],
    drawDate: '2026-05-08',
    status: 'won',
    prize: 2.00,
    price: 18.00,
    metadata: {
      playStatus: 'scrutinized',
      orderTotalPrice: 18.00,
      betsCount: 18,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      jokerEnabled: true,
      jokerBoletos: [
        { jokerNumber: '1234567' },
        { jokerNumber: '7654321' },
        { jokerNumber: '2468101' },
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },

  // ── Lotería del Jueves confirmada, mensajería, 4 décimos, premio ──────────
  {
    id: 'demo-lotjueves-shipping',
    selaeTicketId: 'SEL-90234872',
    userId: 'demo-user',
    gameId: 'loteria-nacional-jueves',
    gameType: 'loteria-nacional',
    numbers: [3, 1, 4, 2, 5],
    drawDate: '2026-04-23',
    status: 'won',
    prize: 120.00,
    price: 12.00,
    metadata: {
      nationalNumber: '31425',
      nationalQuantity: 4,
      nationalDrawLabel: 'Jueves',
      orderDrawDates: ['2026-04-23'],
      orderTotalPrice: 24.00,
      playStatus: 'confirmed',
      confirmedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      deliveryMode: 'shipping',
      shippingStatus: 'En reparto',
      shippingAddress: {
        name: 'Rafael',
        surnames: 'Sanchis Penadés',
        address: 'C/ Valencia, 45, 2ºB',
        postalCode: '46940',
        municipality: 'Manises',
        province: 'Valencia',
        phone: '634 810 501',
      },
      seriesFractions: [
        { serie: '102', fraccion: '22' },
        { serie: '103', fraccion: '22' },
        { serie: '104', fraccion: '22' },
        { serie: '105', fraccion: '22' },
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },

  // ── Bonoloto Semanal confirmada (7 sorteos · 5 apuestas) ─────────────────
  {
    id: 'demo-bonoloto-semanal',
    selaeTicketId: 'SEL-90234873',
    userId: 'demo-user',
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    numbers: [7, 17, 20, 22, 32, 44],
    bets: [
      [ 7, 17, 20, 22, 32, 44],
      [ 3,  8, 15, 17, 38, 44],
      [ 1,  8, 24, 42, 43, 46],
      [ 4,  5, 27, 29, 30, 40],
      [ 4, 16, 19, 24, 35, 41],
    ],
    betReintegros: [4, 8, 1, 9, 3],
    drawDate: '2026-05-05',
    status: 'lost',
    prize: 31.40,
    price: 3.00,
    metadata: {
      playStatus: 'scrutinized',
      orderTotalPrice: 3.00,
      betsCount: 5,
      orderDrawDates: [
        '2026-05-05', '2026-05-06', '2026-05-07',
        '2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11',
      ],
      dayPrizes: {
        '2026-05-05': 4.00,
        '2026-05-06': 16.40,
        '2026-05-07': 4.00,
        '2026-05-08': 4.00,
        '2026-05-09': 0,
        '2026-05-10': 3.00,
        '2026-05-11': 0,
      },
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },

  // ── Bonoloto pendiente (1 sorteo, 2 apuestas) ─────────────────────────────
  {
    id: 'demo-bonoloto-pending',
    selaeTicketId: 'SEL-90234874',
    userId: 'demo-user',
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    numbers: [3, 17, 24, 31, 42, 48],
    bets: [
      [3, 17, 24, 31, 42, 48],
      [5, 11, 22, 30, 39, 47],
    ],
    betReintegros: [5, 2],
    drawDate: '2026-05-07',
    status: 'pending',
    price: 1.00,
    metadata: {
      playStatus: 'pending',
      orderTotalPrice: 1.00,
      betsCount: 2,
      orderDrawDates: ['2026-05-07'],
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },

  // ── Bonoloto reducida pendiente — 20 números, sistema "Reducida al 5" ────
  // DEMO — `bets` aquí contiene solo una MUESTRA de 12 columnas estáticas
  // escritas a mano (igual que el resto de fixtures de este archivo), NO las
  // 1336 columnas reales del sistema. Sirve únicamente para validar
  // visualmente cómo se representará el desarrollo cuando BE entregue el
  // desarrollo completo real — el frontend nunca genera columnas por sí
  // mismo. `metadata.betsCount` (1336) es el total real del sistema; al no
  // coincidir con `bets.length` (12), TicketDetailPage muestra tanto la
  // selección original como el desarrollo parcial, sin confundir ambos.
  // Ver docs/be-handoff/ticket-bet-columns.md.
  {
    id: 'demo-bonoloto-reducida',
    selaeTicketId: 'SEL-90234875',
    userId: 'demo-user',
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    numbers: [1, 3, 7, 10, 11, 14, 15, 18, 20, 21, 23, 26, 30, 32, 33, 35, 37, 38, 42, 45],
    bets: [
      [1, 3, 7, 10, 11, 14],
      [1, 3, 7, 10, 15, 18],
      [1, 3, 7, 11, 20, 21],
      [1, 3, 10, 14, 23, 26],
      [1, 7, 11, 15, 30, 32],
      [3, 10, 14, 18, 33, 35],
      [1, 3, 20, 23, 37, 38],
      [7, 11, 15, 21, 42, 45],
      [1, 10, 14, 26, 32, 37],
      [3, 7, 18, 30, 35, 42],
      [11, 15, 21, 23, 38, 45],
      [1, 14, 20, 26, 33, 42],
    ],
    drawDate: '2026-08-20',
    status: 'pending',
    price: 668.00,
    metadata: {
      playStatus: 'pending',
      orderTotalPrice: 668.00,
      betsCount: 1336,
      orderDrawDates: ['2026-08-20'],
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },

  // ── Primitiva pendiente (12 columnas · 2 boletos · con Joker) ─────────────
  {
    id: 'demo-primitiva-12',
    selaeTicketId: 'SEL-90234876',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [10, 12, 15, 23, 34, 41],
    bets: [
      [10, 12, 15, 23, 34, 41],
      [ 5, 11, 19, 27, 36, 45],
      [ 8, 14, 21, 29, 38, 49],
      [ 3,  9, 18, 26, 35, 48],
      [ 7, 13, 20, 28, 37, 47],
      [ 2,  8, 17, 25, 33, 46],
      [ 6, 12, 16, 24, 32, 44],
      [ 1, 10, 18, 27, 40, 43],
      [ 4, 11, 22, 30, 39, 48],
      [ 9, 15, 23, 31, 42, 49],
      [ 3, 13, 19, 29, 36, 45],
      [ 7, 14, 24, 32, 41, 47],
    ],
    betReintegros: [2, 6, 4, 1, 7, 5, 3, 8, 0, 9, 2, 4],
    drawDate: '2026-08-18',
    status: 'pending',
    price: 12.00,
    metadata: {
      playStatus: 'pending',
      orderTotalPrice: 14.00,
      betsCount: 12,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      jokerEnabled: true,
      jokerBoletos: [
        { jokerNumber: '5832473' },
        { jokerNumber: '9183641' },
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },

  // ── Primitiva sistema — 11 números en 1 columna (jugada múltiple) ─────────
  {
    id: 'demo-primitiva-sistema',
    selaeTicketId: 'SEL-90234877',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [5, 12, 21, 30, 41, 47, 8, 16, 25, 33, 44],
    bets: [[5, 12, 21, 30, 41, 47, 8, 16, 25, 33, 44]],
    betReintegros: [4],
    drawDate: '2026-05-08',
    status: 'won',
    prize: 2.00,
    price: 462.00,
    metadata: {
      playStatus: 'scrutinized',
      orderTotalPrice: 462.00,
      betsCount: 1,
      orderDrawDates: ['2026-05-08'],
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },

  // ── El Gordo múltiple — 10 números + clave en 1 apuesta ──────────────────
  {
    id: 'demo-gordo-multiple',
    selaeTicketId: 'SEL-90234878',
    userId: 'demo-user',
    gameId: 'gordo',
    gameType: 'gordo',
    numbers: [5, 14, 22, 31, 49, 7, 16, 23, 34, 45],
    stars: [7],
    drawDate: '2026-05-09',
    status: 'pending',
    price: 3.00,
    metadata: {
      playStatus: 'pending',
      orderTotalPrice: 3.00,
      betsCount: 1,
      orderDrawDates: ['2026-05-09'],
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },

  // ── El Gordo escrutado con premio ────────────────────────────────────────
  {
    id: 'demo-gordo-won',
    selaeTicketId: 'SEL-90234879',
    userId: 'demo-user',
    gameId: 'gordo',
    gameType: 'gordo',
    numbers: [2, 17, 28, 40, 45],
    stars: [7],
    drawDate: '2026-05-31',
    status: 'won',
    prize: 23,
    price: 1.50,
    metadata: {
      playStatus: 'scrutinized',
      orderTotalPrice: 1.50,
      betsCount: 1,
      orderDrawDates: ['2026-05-31'],
      dayPrizes: { '2026-05-31': 23 },
    },
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },

  // ── El Gordo pendiente ────────────────────────────────────────────────────
  {
    id: 'demo-gordo-pending',
    selaeTicketId: 'SEL-90234880',
    userId: 'demo-user',
    gameId: 'gordo',
    gameType: 'gordo',
    numbers: [5, 14, 22, 31, 49],
    stars: [3],
    drawDate: '2026-05-09',
    status: 'pending',
    price: 1.50,
    metadata: {
      playStatus: 'pending',
      orderTotalPrice: 1.50,
      betsCount: 1,
      orderDrawDates: ['2026-05-09'],
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },

  // ── Lotería Sábado confirmada, custodia, sin premio ───────────────────────
  {
    id: 'demo-lotsabado-custody',
    selaeTicketId: 'SEL-90234881',
    userId: 'demo-user',
    gameId: 'loteria-nacional-sabado',
    gameType: 'loteria-nacional',
    numbers: [8, 7, 2, 1, 4],
    drawDate: '2026-05-09',
    status: 'pending',
    price: 6.00,
    metadata: {
      nationalNumber: '87214',
      nationalQuantity: 2,
      nationalDrawLabel: 'Sábado',
      orderDrawDates: ['2026-05-09'],
      orderTotalPrice: 6.00,
      playStatus: 'confirmed',
      confirmedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      deliveryMode: 'custody',
      seriesFractions: [
        { serie: '041', fraccion: '7' },
        { serie: '041', fraccion: '8' },
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },

  // ── Euromillones confirmado (25 columnas · 5 boletos · con El Millón) ────
  {
    id: 'demo-euro-subscription',
    selaeTicketId: 'SEL-90234882',
    userId: 'demo-user',
    gameId: 'euromillones',
    gameType: 'euromillones',
    numbers: [7, 14, 23, 38, 47],
    stars: [3, 9],
    bets: [
      [ 7, 14, 23, 38, 47], [12, 18, 22, 31, 44], [ 2,  9, 17, 27, 36], [ 4, 15, 26, 33, 41], [10, 21, 28, 45, 50],
      [ 1, 11, 23, 29, 46], [ 3, 13, 24, 32, 48], [ 6, 19, 27, 35, 50], [ 8, 20, 22, 34, 42], [ 5, 16, 25, 30, 49],
      [ 9, 17, 28, 37, 44], [12,  2, 39, 21, 31], [ 4, 15, 26, 33, 41], [ 7, 18, 23, 29, 48], [15,  1, 11, 20, 34],
      [ 6, 14, 25, 36, 50], [ 3, 10, 22, 30, 42], [ 8, 16, 24, 32, 45], [ 5, 13, 21, 28, 40], [26, 34, 41, 46, 50],
      [ 1, 12, 23, 33, 46], [ 2, 14, 27, 31, 43], [ 4, 19, 29, 37, 49], [11, 20, 35, 44, 10], [18, 24, 30, 47, 49],
    ],
    betStars: [
      [3,9],[5,11],[1,7],[6,8],[2,10],
      [4,12],[7,9],[3,8],[1,5],[2,9],
      [3,8],[6,10],[2,7],[5,12],[1,9],
      [4,11],[7,9],[2,10],[6,8],[3,12],
      [5,7],[8,11],[1,12],[2,9],[3,6],
    ],
    drawDate: '2026-04-15',
    status: 'won',
    prize: 25.00,
    price: 75.00,
    metadata: {
      playStatus: 'scrutinized',
      orderDrawDates: ['2026-04-11', '2026-04-15'],
      orderTotalPrice: 75.00,
      betsCount: 25,
      millonBoletos: [
        { codeFrom: 'MFA12341', codeTo: 'MFA12345' },
        { codeFrom: 'MFA12518', codeTo: 'MFA12522' },
        { codeFrom: 'MFA12795', codeTo: 'MFA12799' },
        { codeFrom: 'MFA13072', codeTo: 'MFA13076' },
        { codeFrom: 'MFA13349', codeTo: 'MFA13353' },
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },

  // ── EuroDreams escrutado — 5ª categoría (3 aciertos, sin sueño) — 10 € ───
  {
    id: 'demo-eurodreams-won',
    selaeTicketId: 'SEL-90234883',
    userId: 'demo-user',
    gameId: 'eurodreams',
    gameType: 'eurodreams',
    numbers: [3, 15, 23, 31, 38, 40],
    stars: [3],
    drawDate: '2026-07-13',
    status: 'won',
    prize: 10.00,
    price: 2.00,
    metadata: {
      playStatus: 'scrutinized',
      confirmedAt: new Date('2026-07-12T10:00:00.000Z').toISOString(),
      orderTotalPrice: 2.00,
      betsCount: 1,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
    },
    createdAt: new Date('2026-07-12T10:00:00.000Z').toISOString(),
  },

  // ── EuroDreams pendiente — próximo sorteo jue 17 jul 2026 ─────────────────
  {
    id: 'demo-eurodreams-pending',
    selaeTicketId: 'SEL-90234884',
    userId: 'demo-user',
    gameId: 'eurodreams',
    gameType: 'eurodreams',
    numbers: [7, 19, 24, 33, 36, 40],
    stars: [4],
    drawDate: '2026-07-17',
    status: 'pending',
    prize: 0,
    price: 2.00,
    metadata: {
      playStatus: 'confirmed',
      confirmedAt: new Date('2026-07-16T09:15:00.000Z').toISOString(),
      orderTotalPrice: 2.00,
      betsCount: 1,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
    },
    createdAt: new Date('2026-07-16T09:15:00.000Z').toISOString(),
  },

  // ── Quiniela escrutada (columna sencilla) ─────────────────────────────────
  {
    id: 'demo-quiniela-sencilla',
    selaeTicketId: 'SEL-90234885',
    userId: 'demo-user',
    gameId: 'quiniela',
    gameType: 'quiniela',
    numbers: [],
    drawDate: '2026-05-31',
    status: 'lost',
    prize: 0,
    price: 0.75,
    metadata: {
      playStatus: 'scrutinized',
      orderTotalPrice: 0.75,
      betsCount: 1,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      quinielaSystem: 'simple',
      // Picks de los 14 partidos + P15 codificado como "golesLocal/golesVisitante"
      // Resultado del sorteo: [1,2,1,'X',2,1,1,'X',1,2,1,1,'X',2,'M-1']
      // → 10 aciertos regulares de 14 + fallo en P15
      picks: ['1', 'X', '2', '1', 'X', '1', '1', 'X', '1', '2', '1', '1', 'X', '2', '2/1'],
      quinielaFixtures: [
        { id: 1,  home: 'Real Madrid',     away: 'Osasuna' },
        { id: 2,  home: 'FC Barcelona',    away: 'Villarreal' },
        { id: 3,  home: 'Atlético Madrid', away: 'Athletic Club' },
        { id: 4,  home: 'Real Sociedad',   away: 'Rayo Vallecano' },
        { id: 5,  home: 'Real Betis',      away: 'Celta de Vigo' },
        { id: 6,  home: 'Valencia CF',     away: 'Las Palmas' },
        { id: 7,  home: 'Girona',          away: 'Getafe' },
        { id: 8,  home: 'Alavés',          away: 'Espanyol' },
        { id: 9,  home: 'Sevilla',         away: 'Mallorca' },
        { id: 10, home: 'Valladolid',      away: 'Almería' },
        { id: 11, home: 'Levante',         away: 'Eibar' },
        { id: 12, home: 'Zaragoza',        away: 'Huesca' },
        { id: 13, home: 'Rapid Viena',     away: 'RB Salzburg' },
        { id: 14, home: 'Ajax',            away: 'PSV Eindhoven' },
        { id: 15, home: 'Feyenoord',       away: 'AZ Alkmaar' },
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },

  // ── Quiniela escrutada (Reducidas Manises al 13, 96 apuestas, C2 premiada) ─
  {
    id: 'demo-quiniela-manises',
    selaeTicketId: 'SEL-90234886',
    userId: 'demo-user',
    gameId: 'quiniela',
    gameType: 'quiniela',
    numbers: [],
    drawDate: '2026-07-12',
    status: 'won',
    prize: 148.00,
    price: 72.00,
    metadata: {
      playStatus: 'scrutinized',
      confirmedAt: new Date('2026-07-12T09:00:00.000Z').toISOString(),
      orderTotalPrice: 72.00,
      betsCount: 96,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      quinielaSystem: 'manises',
      quinielaModalidad: 'al_13',
      picks: ['1X', '2', '1', 'X2', '1X2', '1', '2', 'X', '1', 'X2', '1', '1X', 'X', '2', '1/M'],
      // 6 columnas representativas de las 96 generadas por la reducción
      generatedColumns: [
        ['1','2','1','X','1','1','2','X','1','X','1','1','X','2','1/M'], // C1 — 13 ac
        ['1','2','1','X','1','1','2','X','1','2','1','1','X','2','1/M'], // C2 — 14 ac 🏆
        ['1','2','1','X','X','1','2','X','1','X','1','1','X','2','1/M'], // C3 — 12 ac
        ['X','2','1','X','1','1','2','X','1','X','1','1','X','2','1/M'], // C4 — 12 ac
        ['X','2','1','2','2','1','2','X','1','X','1','X','X','2','1/M'], // C5 —  9 ac
        ['X','2','1','2','2','1','2','X','1','2','1','X','X','2','1/M'], // C6 — 10 ac
      ],
      columnPrizes: [0, 148, 0, 0, 0, 0],
      quinielaFixtures: [
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
      ],
    },
    createdAt: new Date('2026-07-10T11:00:00.000Z').toISOString(),
  },

  // ── Quiniela pendiente (Reducidas Manises al 12, 24 apuestas, jornada 61) ──
  {
    id: 'demo-quiniela-pendiente',
    selaeTicketId: 'SEL-90234887',
    userId: 'demo-user',
    gameId: 'quiniela',
    gameType: 'quiniela',
    numbers: [],
    drawDate: '2026-07-19',
    status: 'pending',
    prize: 0,
    price: 18.00,
    metadata: {
      playStatus: 'confirmed',
      confirmedAt: new Date('2026-07-13T10:30:00.000Z').toISOString(),
      orderTotalPrice: 18.00,
      betsCount: 24,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      quinielaSystem: 'manises',
      quinielaModalidad: 'al_12',
      picks: ['1X', '2', '1X', 'X', '1', '2', 'X2', '1', 'X', '2', '1', 'X2', '1', '2', '2/1'],
      generatedColumns: [
        ['1','2','1','X','1','2','X','1','X','2','1','X','1','2','2/1'],
        ['1','2','1','X','1','2','X','1','X','2','1','2','1','2','2/1'],
        ['1','2','1','X','1','2','2','1','X','2','1','X','1','2','2/1'],
        ['1','2','1','X','1','2','2','1','X','2','1','2','1','2','2/1'],
        ['X','2','1','X','1','2','X','1','X','2','1','X','1','2','2/1'],
        ['X','2','1','X','1','2','2','1','X','2','1','2','1','2','2/1'],
      ],
      quinielaFixtures: [
        { id: 1,  home: 'Barcelona',       away: 'Real Madrid' },
        { id: 2,  home: 'Sevilla',         away: 'Valencia' },
        { id: 3,  home: 'Real Betis',      away: 'Villarreal' },
        { id: 4,  home: 'Real Sociedad',   away: 'Athletic Club' },
        { id: 5,  home: 'Getafe',          away: 'Atlético Madrid' },
        { id: 6,  home: 'Osasuna',         away: 'Las Palmas' },
        { id: 7,  home: 'Espanyol',        away: 'Celta' },
        { id: 8,  home: 'Mallorca',        away: 'Alavés' },
        { id: 9,  home: 'Girona',          away: 'Rayo' },
        { id: 10, home: 'Almería',         away: 'Granada' },
        { id: 11, home: 'Sporting',        away: 'Zaragoza' },
        { id: 12, home: 'Eibar',           away: 'Levante' },
        { id: 13, home: 'HamKam',          away: 'Sandefjord' },
        { id: 14, home: 'Stabaek',         away: 'Brann' },
        { id: 15, home: 'Hamkam IL',       away: 'Sandefjord Fotball' },
      ],
    },
    createdAt: new Date('2026-07-13T10:30:00.000Z').toISOString(),
  },

  // ── Lotería Jueves en trámite (mensajería, sin confirmar) ─────────────────
  {
    id: 'demo-lotjueves-processing',
    selaeTicketId: 'SEL-90234888',
    userId: 'demo-user',
    gameId: 'loteria-nacional-jueves',
    gameType: 'loteria-nacional',
    numbers: [0, 6, 3, 2, 1],
    drawDate: '2026-05-23',
    status: 'pending',
    price: 12.00,
    metadata: {
      nationalNumber: '06321',
      nationalQuantity: 4,
      nationalDrawLabel: 'Jueves',
      orderDrawDates: ['2026-05-23'],
      orderTotalPrice: 24.00,
      playStatus: 'processing',
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
      deliveryMode: 'shipping',
      shippingAddress: {
        name: 'Rafael',
        surnames: 'Sanchis Penadés',
        address: 'C/ Valencia, 45, 2ºB',
        postalCode: '46940',
        municipality: 'Manises',
        province: 'Valencia',
        phone: '634 810 501',
      },
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const mockTicketsStore: TicketDto[] = [...INITIAL_MOCK_TICKETS_DATA];

export function appendMockTickets(tickets: TicketDto[]) {
  mockTicketsStore.unshift(...tickets);
}

export async function getUserTicketsMock(userId: string): Promise<TicketDto[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTicketsStore.filter((ticket) => ticket.userId === userId));
    }, 500);
  });
}

export async function getTicketByIdMock(id: string): Promise<TicketDto | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ticket = mockTicketsStore.find(t => t.id === id);
      resolve(ticket ?? null);
    }, 300);
  });
}
