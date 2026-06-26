import type { TicketDto } from '../../contracts/tickets.contracts';

/**
 * Mock Tickets Adapter
 */

const INITIAL_MOCK_TICKETS_DATA: TicketDto[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    gameId: 'euromillones',
    gameType: 'euromillones',
    numbers: [7, 14, 23, 38, 47],
    stars: [3, 9],
    drawDate: '2026-04-11',
    status: 'pending',
    price: 3.00,
    hasInsurance: true,
    isSubscription: true,
    metadata: {
      playStatus: 'confirmed',
      orderDrawDates: ['2026-04-11', '2026-04-15'],
      orderTotalPrice: 6.00,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-1b',
    userId: 'demo-user',
    gameId: 'loteria-nacional-jueves',
    gameType: 'loteria-nacional',
    numbers: [3, 1, 4, 2, 5],
    drawDate: '2026-04-23',
    status: 'pending',
    price: 6.00,
    hasInsurance: true,
    orderId: 'mock-order-national',
    metadata: {
      nationalNumber: '31425',
      nationalQuantity: 2,
      nationalDrawLabel: 'Jueves',
      orderDrawDates: ['2026-04-23', '2026-04-30'],
      orderTotalPrice: 12.00,
      drawsCount: 2,
      scheduleMode: 'custom_weeks',
      weeksCount: 2,
      drawIndex: 0,
      playStatus: 'processing',
      deliveryMode: 'custody',
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'demo-national-confirmed',
    userId: 'demo-user',
    gameId: 'loteria-nacional-sabado',
    gameType: 'loteria-nacional',
    numbers: [6, 9, 8, 4, 4],
    drawDate: '2026-04-25',
    status: 'pending',
    price: 18.00,
    hasInsurance: false,
    orderId: 'mock-order-national-confirmed',
    metadata: {
      nationalNumber: '69844',
      nationalQuantity: 3,
      nationalDrawLabel: 'Sábado',
      orderDrawDates: ['2026-04-25'],
      orderTotalPrice: 18.00,
      playStatus: 'confirmed',
      confirmedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      holderName: 'Juan Pérez Demo',
      deliveryMode: 'custody',
      seriesFractions: [
        { serie: '024', fraccion: '3' },
        { serie: '025', fraccion: '4' },
        { serie: '026', fraccion: '5' },
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-national-shipping-won',
    userId: 'demo-user',
    gameId: 'loteria-nacional-jueves',
    gameType: 'loteria-nacional',
    numbers: [1, 5, 4, 3, 2],
    drawDate: '2026-04-16',
    status: 'won',
    prize: 30,
    price: 11.00,
    hasInsurance: false,
    orderId: 'mock-order-national-shipping',
    metadata: {
      nationalNumber: '15432',
      nationalQuantity: 2,
      nationalDrawLabel: 'Jueves',
      orderDrawDates: ['2026-04-16'],
      orderTotalPrice: 11.00,
      playStatus: 'scrutinized',
      confirmedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      holderName: 'Juan Pérez Demo',
      deliveryMode: 'shipping',
      shippingStatus: 'En reparto demo',
      shippingAddress: {
        name: 'Juan',
        surnames: 'Pérez Demo',
        address: 'Calle Mayor, 1',
        postalCode: '46940',
        municipality: 'Manises',
        province: 'Valencia',
        phone: '600 000 000',
      },
      seriesFractions: [
        { serie: '011', fraccion: '7' },
        { serie: '012', fraccion: '8' },
      ],
    },
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [5, 12, 21, 30, 44, 49],
    drawDate: '2026-04-08',
    status: 'lost',
    price: 1.00,
    metadata: {
      playStatus: 'scrutinized',
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-rejected',
    userId: 'demo-user',
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    numbers: [1, 8, 16, 22, 37, 41],
    drawDate: '2026-04-14',
    status: 'lost',
    price: 0.50,
    metadata: {
      playStatus: 'rejected',
      rejectionReason: 'No se pudo tramitar antes del cierre demo.',
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
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
      resolve(ticket || null);
    }, 300);
  });
}
