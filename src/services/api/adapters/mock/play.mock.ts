import type { CreateBetRequestDto, CreateBetResponseDto } from '../../contracts/play.contracts';
import type { TicketDto } from '../../contracts/tickets.contracts';
import { appendMockTickets } from './tickets.mock';

/**
 * Mock Play Adapter
 */

function splitAmountAcrossDraws(totalAmount: number, drawsCount: number): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / drawsCount);
  let remainder = totalCents - (baseCents * drawsCount);

  return Array.from({ length: drawsCount }, () => {
    const cents = baseCents + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return cents / 100;
  });
}

export async function placeBetMock(dto: CreateBetRequestDto): Promise<CreateBetResponseDto> {
  return new Promise((resolve) => {
    console.log('[MockAdapter] Placing bet:', dto);
    
    // Simulate network delay
    setTimeout(() => {
      const drawDates = dto.drawDates && dto.drawDates.length > 0 ? dto.drawDates : [dto.drawDate];
      const orderId = `mock-order-${Math.random().toString(36).slice(2, 10)}`;
      const distributedPrices = splitAmountAcrossDraws(dto.price, drawDates.length);
      const createdAt = new Date().toISOString();

      const tickets: TicketDto[] = drawDates.map((drawDate, index) => ({
        id: `mock-ticket-${Math.random().toString(36).slice(2, 11)}`,
        orderId,
        userId: 'demo-user',
        gameId: dto.gameId,
        gameType: dto.gameType,
        numbers: dto.numbers ?? [],
        stars: dto.stars ?? [],
        drawDate,
        status: 'pending',
        price: distributedPrices[index] ?? distributedPrices[0] ?? dto.price,
        hasInsurance: dto.hasInsurance,
        isSubscription: dto.isSubscription,
        createdAt,
      }));

      appendMockTickets(tickets);

      resolve({
        success: true,
        ticketId: tickets[0]?.id,
      });
    }, 1500);
  });
}
