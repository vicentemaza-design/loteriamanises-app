import type {
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
  UpdateSubscriptionRequestDto,
  UpdateSubscriptionResponseDto,
  GetSubscriptionsResponseDto,
  GetReservationsResponseDto,
  PayReservationsRequestDto,
  PayReservationsResponseDto,
  GetAvailableNumbersResponseDto,
  ConfirmFirstDrawRequestDto,
  ConfirmFirstDrawResponseDto,
} from '../../contracts/subscriptions.contracts';

/**
 * Mock Subscriptions Adapter
 * Returns minimal in-memory stubs. The subscription UI state is currently
 * managed by useSubscriptions (local demo data). These stubs satisfy the
 * IApiProvider contract so the mock adapter compiles cleanly.
 */

export const subscriptionsMock = {
  getAvailableNumbers: async (): Promise<GetAvailableNumbersResponseDto> => ({
    numbers: [],
    total: 0,
  }),

  create: async (_dto: CreateSubscriptionRequestDto): Promise<CreateSubscriptionResponseDto> => ({
    subscription: {
      id: `mock-sub-${Date.now()}`,
      userId: 'demo-user',
      number: _dto.number,
      quantity: _dto.quantity,
      drawTypes: _dto.drawTypes,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reservations: [],
  }),

  getAll: async (): Promise<GetSubscriptionsResponseDto> => ({
    subscriptions: [],
    pendingReservations: [],
    pendingTotal: 0,
  }),

  update: async (_id: string, dto: UpdateSubscriptionRequestDto): Promise<UpdateSubscriptionResponseDto> => ({
    subscription: {
      id: _id,
      userId: 'demo-user',
      number: '00000',
      quantity: dto.quantity ?? 1,
      drawTypes: dto.drawTypes ?? [],
      status: dto.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reservations: [],
  }),

  cancel: async (_id: string): Promise<void> => {},

  getReservations: async (): Promise<GetReservationsResponseDto> => ({
    reservations: [],
    total: 0,
  }),

  payReservations: async (_dto: PayReservationsRequestDto): Promise<PayReservationsResponseDto> => ({
    paidReservationIds: _dto.reservationIds,
    newWalletBalance: 0,
  }),

  confirmFirstDraw: async (dto: ConfirmFirstDrawRequestDto): Promise<ConfirmFirstDrawResponseDto> => ({
    subscriptionId: dto.subscriptionId,
    firstReservationId: `mock-res-${Date.now()}`,
    amount: 0,
    drawDate: new Date().toISOString(),
    drawLabel: 'Mock draw',
    status: 'confirmed',
  }),
};
