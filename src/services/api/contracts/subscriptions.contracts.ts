import type { ApiResponseDto } from './common.contracts';

/**
 * Subscriptions API Contracts
 * Abonos de Lotería Nacional — reservas preferentes sin cobro automático.
 *
 * Cuando se integre el BE:
 *  POST   /api/subscriptions            → CreateSubscriptionResponseDto
 *  GET    /api/subscriptions            → GetSubscriptionsResponseDto
 *  PATCH  /api/subscriptions/:id        → UpdateSubscriptionResponseDto
 *  DELETE /api/subscriptions/:id        → ApiResponseDto<void>
 *  GET    /api/subscriptions/reservations          → GetReservationsResponseDto
 *  POST   /api/subscriptions/reservations/pay      → PayReservationsResponseDto
 */

// ── Draw types ────────────────────────────────────────────────────────────────

/** Tipos de sorteo de Lotería Nacional soportados por el sistema de abonos. */
export type SubscriptionDrawType = 'JUE' | 'SÁB' | 'NAV' | 'NIÑ';

// ── Request DTOs ──────────────────────────────────────────────────────────────

/** Crear un nuevo abono (POST /api/subscriptions) */
export interface CreateSubscriptionRequestDto {
  /** Número de décimo (5 dígitos, zero-padded). */
  number: string;
  /** Décimos por sorteo. */
  quantity: number;
  /** Sorteos en los que activar el abono. */
  drawTypes: SubscriptionDrawType[];
  /** gameId del juego de origen (e.g. 'loteria-nacional-jueves'). */
  gameId: string;
  /** Identificador del ticket original desde el que se inicia el abono (opcional). */
  sourceTicketId?: string;
}

/** Actualizar cantidad o sorteos de un abono existente (PATCH /api/subscriptions/:id) */
export interface UpdateSubscriptionRequestDto {
  quantity?: number;
  drawTypes?: SubscriptionDrawType[];
  status?: 'active' | 'inactive';
}

/** Pagar reservas seleccionadas (POST /api/subscriptions/reservations/pay) */
export interface PayReservationsRequestDto {
  reservationIds: string[];
  /** Método de pago: saldo de la billetera o tarjeta tokenizada. */
  paymentMethod: 'wallet' | 'card';
  /** Identificador de tarjeta COF (Credentials on File) — solo si paymentMethod = 'card'. */
  cardToken?: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

/** Abono serializado por el BE. */
export interface SubscriptionDto {
  id: string;
  userId: string;
  number: string;
  quantity: number;
  drawTypes: SubscriptionDrawType[];
  status: 'active' | 'inactive';
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** Reserva (slot de pago pendiente) serializada por el BE. */
export interface SubscriptionReservationDto {
  id: string;
  subscriptionId: string;
  drawType: SubscriptionDrawType;
  drawLabel: string;
  /** ISO 8601 */
  drawDate: string;
  number: string;
  quantity: number;
  /** Precio unitario por décimo en €. */
  unitPrice: number;
  /** quantity * unitPrice */
  totalAmount: number;
  isPaid: boolean;
  /** ISO 8601 — cuándo se realizó el pago, si aplica. */
  paidAt?: string;
}

export interface CreateSubscriptionResponseDto {
  subscription: SubscriptionDto;
  /** Reservas generadas automáticamente para los próximos sorteos. */
  reservations: SubscriptionReservationDto[];
}

export interface UpdateSubscriptionResponseDto {
  subscription: SubscriptionDto;
  reservations: SubscriptionReservationDto[];
}

export interface GetSubscriptionsResponseDto {
  subscriptions: SubscriptionDto[];
  pendingReservations: SubscriptionReservationDto[];
  /** Total € pendiente de pago (suma de todas las reservas no pagadas). */
  pendingTotal: number;
}

export interface GetReservationsResponseDto {
  reservations: SubscriptionReservationDto[];
  total: number;
}

export interface PayReservationsResponseDto {
  paidReservationIds: string[];
  /** Saldo restante en la billetera tras el pago. */
  newWalletBalance: number;
}

// ── Available numbers (offered by the administration) ─────────────────────────
// BE: GET /api/subscriptions/available-numbers

/** A lottery number the administration has available for subscription. */
export interface AvailableNumberDto {
  /** 5-digit zero-padded number (e.g. '25874'). */
  number: string;
  /** Draw types the admin has stock for this number. */
  availableDrawTypes: SubscriptionDrawType[];
  /** Maximum décimos per draw the user can subscribe to. */
  maxQuantityPerDraw: number;
  /** Unit price in € per décimo for each draw type. */
  pricing: Partial<Record<SubscriptionDrawType, number>>;
}

export interface GetAvailableNumbersResponseDto {
  numbers: AvailableNumberDto[];
  total: number;
}

// ── First draw confirmation ───────────────────────────────────────────────────
// BE: POST /api/subscriptions/:id/confirm-first-draw

/** Activates a subscription by purchasing the first draw. */
export interface ConfirmFirstDrawRequestDto {
  subscriptionId: string;
  drawType: SubscriptionDrawType;
  quantity: number;
  /** User has accepted the subscription T&C. */
  acceptedTerms: boolean;
  paymentMethod: 'wallet' | 'card';
  /** COF card token — required when paymentMethod = 'card'. */
  cardToken?: string;
}

export interface ConfirmFirstDrawResponseDto {
  subscriptionId: string;
  firstReservationId: string;
  amount: number;
  /** ISO 8601 */
  drawDate: string;
  drawLabel: string;
  /** 'confirmed' when wallet balance is sufficient; 'pending_payment' when card flow is needed. */
  status: 'confirmed' | 'pending_payment';
  /** Remaining wallet balance after payment — present when paymentMethod = 'wallet'. */
  newWalletBalance?: number;
}

// ── Typed API response wrappers ───────────────────────────────────────────────

export type CreateSubscriptionApiResponse   = ApiResponseDto<CreateSubscriptionResponseDto>;
export type UpdateSubscriptionApiResponse   = ApiResponseDto<UpdateSubscriptionResponseDto>;
export type GetSubscriptionsApiResponse     = ApiResponseDto<GetSubscriptionsResponseDto>;
export type GetReservationsApiResponse      = ApiResponseDto<GetReservationsResponseDto>;
export type PayReservationsApiResponse      = ApiResponseDto<PayReservationsResponseDto>;
export type CancelSubscriptionApiResponse   = ApiResponseDto<void>;
