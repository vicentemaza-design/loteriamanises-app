import type { TicketDto } from '../../contracts/tickets.contracts';

const INITIAL_MOCK_TICKETS_DATA: TicketDto[] = [
  // ── Primitiva escrutada (4 apuestas, con premio) ──────────────────────────
  {
    id: 'demo-primitiva',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [1, 5, 15, 26, 37, 41],
    bets: [
      [1,  5, 15, 26, 37, 41],
      [3, 12, 21, 28, 35, 44],
      [6, 11, 22, 31, 39, 48],
      [2,  9, 18, 27, 36, 45],
    ],
    drawDate: '2026-05-08',
    status: 'won',
    prize: 2.00,
    price: 4.00,
    metadata: {
      playStatus: 'scrutinized',
      orderTotalPrice: 4.00,
      betsCount: 4,
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },

  // ── Lotería del Jueves confirmada, mensajería, 4 décimos, premio ──────────
  {
    id: 'demo-lotjueves-shipping',
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
    drawDate: '2026-05-05',
    status: 'pending',
    prize: 5.00,
    price: 3.00,
    metadata: {
      playStatus: 'confirmed',
      orderTotalPrice: 3.00,
      betsCount: 5,
      orderDrawDates: [
        '2026-05-05', '2026-05-06', '2026-05-07',
        '2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11',
      ],
      holderName: 'Rafael Sanchis Penadés',
      holderNif: '25252925Z',
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },

  // ── Bonoloto pendiente (1 sorteo, 2 apuestas) ─────────────────────────────
  {
    id: 'demo-bonoloto-pending',
    userId: 'demo-user',
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    numbers: [3, 17, 24, 31, 42, 48],
    bets: [
      [3, 17, 24, 31, 42, 48],
      [5, 11, 22, 30, 39, 47],
    ],
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

  // ── El Gordo pendiente ────────────────────────────────────────────────────
  {
    id: 'demo-gordo-pending',
    userId: 'demo-user',
    gameId: 'gordo',
    gameType: 'gordo',
    numbers: [5, 14, 22, 31, 49],
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

  // ── Euromillones abono, confirmado ────────────────────────────────────────
  {
    id: 'demo-euro-subscription',
    userId: 'demo-user',
    gameId: 'euromillones',
    gameType: 'euromillones',
    numbers: [7, 14, 23, 38, 47],
    stars: [3, 9],
    bets: [[7, 14, 23, 38, 47]],
    betStars: [[3, 9]],
    drawDate: '2026-04-11',
    status: 'pending',
    price: 3.00,
    isSubscription: true,
    metadata: {
      playStatus: 'confirmed',
      orderDrawDates: ['2026-04-11', '2026-04-15'],
      orderTotalPrice: 6.00,
      betsCount: 1,
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },

  // ── Lotería Jueves en trámite (mensajería, sin confirmar) ─────────────────
  {
    id: 'demo-lotjueves-processing',
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
