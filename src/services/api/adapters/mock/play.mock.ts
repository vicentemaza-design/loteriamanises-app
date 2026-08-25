import type {
  CreateBetRequestDto,
  CreateBetResponseDto,
  SubmitPlaySessionItemDto,
  SubmitPlaySessionRequestDto,
  SubmitPlaySessionResponseDto,
} from '../../contracts/play.contracts';
import type { TicketDto } from '../../contracts/tickets.contracts';
import type { WalletMovementDto } from '../../contracts/wallet.contracts';
import { splitAmountAcrossDraws } from '../../shared/play.utils';
import { appendMockTickets } from './tickets.mock';
import { appendMockMovement, deductDemoWalletBalance, getDemoWalletBalanceSync } from './wallet.mock';

/**
 * Mock Play Adapter
 */

function buildTicketsForBet(dto: CreateBetRequestDto, userId: string, orderIdOverride?: string): TicketDto[] {
  const drawDates = dto.drawDates && dto.drawDates.length > 0 ? dto.drawDates : [dto.drawDate];
  const orderId = orderIdOverride ?? `mock-order-${Math.random().toString(36).slice(2, 10)}`;
  const distributedPrices = splitAmountAcrossDraws(dto.price, drawDates.length);
  const createdAt = new Date().toISOString();
  // DEMO only: BE aún no puebla selaeTicketId en ningún adapter real (firebase/http
  // siguen sin generarlo — ver mappers/tickets.mapper.ts). Se genera aquí solo para
  // que la demo no muestre "—"; cada jugada tiene su propio consecutivo (nunca
  // comparte selaeTicketId con otra), aunque varias compartan el mismo orderId.
  const selaeBase = Math.floor(10000000 + Math.random() * 90000000);

  return drawDates.map((drawDate, index) => ({
    id: `mock-ticket-${Math.random().toString(36).slice(2, 11)}`,
    orderId,
    selaeTicketId: `SEL-${selaeBase + index}`,
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
      // Already computed by resolvePlayPricing() and carried on the DTO
      // (see mapSessionItemToBetDto/CreateBetRequestDto.betsCount) — just
      // wasn't being copied into the ticket's metadata, which is what
      // TicketDetailPage.getBetsCount() reads. No combinatorics here, only
      // reusing a count that already exists on `dto`.
      betsCount: dto.betsCount,
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
    selaeGameCode: item.selaeGameCode,
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

// Un pedido de Lotería Nacional puede agrupar varios décimos/números distintos
// bajo el mismo orderId (misma sesión) — el movimiento de "Mis movimientos"
// debe representar esa compra como UNA sola línea que a su vez detalla todos
// los décimos, no un movimiento por décimo. Detectamos los items nacionales
// por `metadata.nationalNumber`, que mapDraftToDto (usePlaySessionConfirm)
// ya rellena para draft.selection.type === 'national'.
function buildNationalMovementForSession(
  items: SubmitPlaySessionItemDto[],
  userId: string,
  orderId: string,
  shippingCost: number,
): WalletMovementDto | null {
  const nationalItems = items.filter((item) => item.metadata?.nationalNumber !== undefined);
  if (nationalItems.length === 0) return null;

  // drawDate/drawLabel se copian tal cual de cada item — nunca se fabrican ni
  // se sustituyen por una única fecha de pedido: si dos líneas pertenecen a
  // sorteos distintos, cada una conserva la suya para poder desglosarse por
  // sorteo real en el detalle del movimiento (ver MovementsPage.tsx).
  const numbers = nationalItems.map((item) => ({
    number: String(item.metadata?.nationalNumber),
    quantity: item.quantity,
    drawDate: item.drawDate,
    drawLabel: item.metadata?.nationalDrawLabel as string | undefined,
  }));
  // El envío pertenece al PEDIDO, no a cada línea/décimo — se suma una sola
  // vez aquí, nunca por número/ticket.
  const totalAmount = nationalItems.reduce((sum, item) => sum + item.totalPrice, 0) + shippingCost;
  const gameId = nationalItems[0].gameType;
  const drawLabels = new Set(nationalItems.map((item) => item.metadata?.nationalDrawLabel));
  const drawLabel = drawLabels.size === 1
    ? (nationalItems[0].metadata?.nationalDrawLabel as string | undefined) ?? 'Lotería Nacional'
    : undefined;
  const description = drawLabel
    ? gameId === 'loteria-nacional' ? `Compra Lotería Nacional ${drawLabel}` : `Compra ${drawLabel}`
    : 'Compra Lotería Nacional';
  const deliveryMode = shippingCost > 0 ? 'shipping' : 'custody';

  return {
    id: `mock-movement-${orderId}`,
    userId,
    type: 'bet',
    amount: -totalAmount,
    description,
    createdAt: new Date().toISOString(),
    orderId,
    details: {
      gameId,
      gameLabel: drawLabel ?? 'Lotería Nacional',
      numbers,
      number: numbers[0]?.number,
      quantity: numbers.reduce((sum, n) => sum + n.quantity, 0),
      deliveryMode,
      shippingCost: shippingCost > 0 ? shippingCost : undefined,
    },
  };
}

export async function submitPlaySessionMock(payload: SubmitPlaySessionRequestDto): Promise<SubmitPlaySessionResponseDto> {
  return new Promise((resolve) => {
    console.log('[MockAdapter] Submitting play session:', payload);

    setTimeout(() => {
      // Importe real del pedido: se calcula sumando el propio payload.items
      // (ya viene filtrado por draftFilter en usePlaySessionConfirm — solo
      // los borradores que se están confirmando en ESTA llamada), no
      // payload.totalAmount, que agrega TODA la sesión y podría incluir
      // borradores todavía pendientes en el otro carrito (juegos/lotería).
      // El envío (si lo hay) pertenece al PEDIDO, se suma UNA sola vez, nunca
      // por línea/décimo — ver LotteryCartPanel::handleComprar.
      const shippingCost = payload.shippingCost ?? 0;
      const decimosTotal = payload.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const orderTotal = decimosTotal + shippingCost;

      // Defensa adicional además del gate del cliente (isOverBalance en
      // GamesCartPanel/LotteryCartPanel): el mock nunca debe dejar el saldo
      // en negativo ni confirmar un pedido que no se puede pagar (envío incluido).
      if (orderTotal > getDemoWalletBalanceSync()) {
        resolve({ success: false, error: 'Saldo insuficiente para confirmar el pedido.' });
        return;
      }

      // Una sesión debe comportarse como una única operación atómica: mismo orderId en todos los tickets.
      const sessionOrderId = `mock-session-${payload.sessionId.slice(0, 10)}`;
      // El modo de entrega se elige UNA vez para todo el pedido (toggle de
      // LotteryCartPanel, nunca por línea) — así que se aplica por igual a
      // TODOS los tickets del pedido, no solo al primero. Antes solo se
      // anotaba en tickets[0], dejando el resto sin `metadata.deliveryMode`
      // (Mis Jugadas/TicketDetailPage lo leen por ticket, así que esas líneas
      // aparecían silenciosamente como "custodia" o sin sección de entrega).
      // El envío en sí NUNCA se sube al precio de un ticket individual — es
      // un coste del pedido, visible una sola vez en el movimiento
      // (buildNationalMovementForSession), nunca prorrateado por número.
      const deliveryMode: 'custody' | 'shipping' = shippingCost > 0 ? 'shipping' : 'custody';
      const tickets = payload.items
        .flatMap((item) => buildTicketsForBet(mapSessionItemToBetDto(item), payload.userId, sessionOrderId))
        .map((ticket) => ({ ...ticket, metadata: { ...ticket.metadata, deliveryMode } }));
      appendMockTickets(tickets);

      const movement = buildNationalMovementForSession(payload.items, payload.userId, sessionOrderId, shippingCost);
      if (movement) appendMockMovement(movement);

      // Se descuenta UNA sola vez por pedido, por el importe real agregado
      // (orderTotal, décimos + envío) — nunca por ticket individual (un
      // pedido con 5 números genera 5 tickets pero un único descuento).
      deductDemoWalletBalance(orderTotal);

      resolve({
        success: true,
        confirmedDraftIds: payload.items.map((item) => item.draftId),
        ticketIds: tickets.map((ticket) => ticket.id),
      });
    }, 1500);
  });
}
