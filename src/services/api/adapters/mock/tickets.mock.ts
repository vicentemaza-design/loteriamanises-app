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
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
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
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
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
