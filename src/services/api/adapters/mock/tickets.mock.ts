import type { TicketDto } from '../../contracts/tickets.contracts';

/**
 * Mock Tickets Adapter
 */

export const MOCK_TICKETS_DATA: TicketDto[] = [
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
    gameId: 'loteria-nacional',
    gameType: 'loteria-nacional',
    numbers: [31425], // DTO might expect an array or single number, mapping will fix it
    drawDate: '2026-04-13',
    status: 'pending',
    price: 6.00,
    hasInsurance: true,
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

export async function getUserTicketsMock(userId: string): Promise<TicketDto[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TICKETS_DATA);
    }, 500);
  });
}

export async function getTicketByIdMock(id: string): Promise<TicketDto | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ticket = MOCK_TICKETS_DATA.find(t => t.id === id);
      resolve(ticket || null);
    }, 300);
  });
}
