import type { TicketDto } from '../../contracts/tickets.contracts';

/**
 * HTTP Tickets Adapter (Stub)
 */

export async function getUserTicketsHttp(userId: string): Promise<TicketDto[]> {
  console.warn('getUserTicketsHttp: Not implemented yet, returning empty array.');
  return [];
}

export async function getTicketByIdHttp(id: string): Promise<TicketDto | null> {
  return null;
}
