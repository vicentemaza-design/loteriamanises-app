import type {
  CreateBetRequestDto,
  CreateBetResponseDto,
  SubmitPlaySessionItemDto,
  SubmitPlaySessionRequestDto,
  SubmitPlaySessionResponseDto,
} from '../../contracts/play.contracts';
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

function buildTicketsForBet(dto: CreateBetRequestDto, userId: string): TicketDto[] {
  const drawDates = dto.drawDates && dto.drawDates.length > 0 ? dto.drawDates : [dto.drawDate];
  const orderId = `mock-order-${Math.random().toString(36).slice(2, 10)}`;
  const distributedPrices = splitAmountAcrossDraws(dto.price, drawDates.length);
  const createdAt = new Date().toISOString();

  return drawDates.map((drawDate, index) => ({
    id: `mock-ticket-${Math.random().toString(36).slice(2, 11)}`,
    orderId,
    userId,
    gameId: dto.gameId,
    gameType: dto.gameType,
    numbers: dto.numbers ?? [],
    stars: dto.stars ?? [],
    drawDate,
    status: 'pending',
    price: distributedPrices[index] ?? distributedPrices[0] ?? dto.price,
    hasInsurance: dto.hasInsurance,
    isSubscription: dto.isSubscription,
    metadata: {
      ...(dto.metadata || {}),
      scheduleMode: dto.scheduleMode ?? 'next_draw',
      weeksCount: dto.weeksCount ?? 1,
      drawIndex: index,
    },
    createdAt,
  }));
}

export async function placeBetMock(dto: CreateBetRequestDto & { userId?: string }): Promise<CreateBetResponseDto> {
  return new Promise((resolve) => {
    console.log('[MockAdapter] Placing bet:', dto);
    
    // Simulate network delay
    setTimeout(() => {
      const tickets = buildTicketsForBet(dto, dto.userId ?? 'demo-user');
      appendMockTickets(tickets);

      resolve({
        success: true,
        ticketId: tickets[0]?.id,
      });
    }, 1500);
  });
}

function mapSessionItemToBetDto(item: SubmitPlaySessionItemDto): CreateBetRequestDto {
  return {
    gameId: item.gameId,
    gameType: item.gameType,
    numbers: item.numbers,
    stars: item.stars,
    selections: item.selections,
    systemId: item.systemId,
    mode: item.mode,
    price: item.totalPrice,
    drawDate: item.drawDate,
    drawDates: item.drawDates,
    scheduleMode: item.scheduleMode,
    weeksCount: item.weeksCount,
    betsCount: item.betsCount,
    hasInsurance: item.hasInsurance,
    isSubscription: item.isSubscription,
    metadata: item.metadata,
  };
}

export async function submitPlaySessionMock(payload: SubmitPlaySessionRequestDto): Promise<SubmitPlaySessionResponseDto> {
  return new Promise((resolve) => {
    console.log('[MockAdapter] Submitting play session:', payload);

    setTimeout(() => {
      const tickets = payload.items.flatMap((item) => buildTicketsForBet(mapSessionItemToBetDto(item), payload.userId));
      appendMockTickets(tickets);

      resolve({
        success: true,
        confirmedDraftIds: payload.items.map((item) => item.draftId),
        ticketIds: tickets.map((ticket) => ticket.id),
      });
    }, 1500);
  });
}
