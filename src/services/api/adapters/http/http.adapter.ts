import type { IApiProvider } from '../../providers/api.provider';
import type { ResultDto } from '../../contracts/results.contracts';
import type { TicketDto } from '../../contracts/tickets.contracts';
import type { WalletBalanceDto, WalletMovementDto } from '../../contracts/wallet.contracts';
import type {
  CreateBetRequestDto,
  CreateBetResponseDto,
  SubmitPlaySessionRequestDto,
  SubmitPlaySessionResponseDto,
} from '../../contracts/play.contracts';
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
import type { UserProfile } from '@/shared/types/domain';
import { apiDelete, apiGet, apiPatch, apiPost } from './http.client';

/**
 * HttpAdapter
 * Production REST adapter — connects to the MySQL backend via VITE_API_BASE_URL.
 *
 * All endpoints follow the spec in src/services/api/contracts/ and are
 * documented in the README under "Endpoints requeridos".
 *
 * To activate: set VITE_API_PROVIDER=http in .env.local
 */
export class HttpAdapter implements IApiProvider {

  // ── Auth ──────────────────────────────────────────────────────────────────
  // Auth flows through Firebase Auth (Google Sign-In) or a custom JWT.
  // See AuthProvider.tsx — these stubs are only called if someone routes
  // auth through the provider interface directly.
  auth = {
    signInWithGoogle: async (): Promise<void> => {
      // TODO: redirect to backend OAuth endpoint or implement PKCE flow
      throw new Error('HttpAdapter: auth.signInWithGoogle — implement in AuthProvider');
    },
    logout: async (): Promise<void> => {
      await apiDelete('/auth/session');
    },
    getCurrentUser: (): Promise<UserProfile | null> => {
      return apiGet<UserProfile | null>('/auth/me');
    },
  };

  // ── Results ───────────────────────────────────────────────────────────────
  results = {
    getLatest: (): Promise<ResultDto[]> =>
      apiGet<ResultDto[]>('/results'),

    getById: (id: string): Promise<ResultDto | null> =>
      apiGet<ResultDto | null>(`/results/${id}`),
  };

  // ── Tickets ───────────────────────────────────────────────────────────────
  tickets = {
    getUserTickets: (userId: string): Promise<TicketDto[]> =>
      apiGet<TicketDto[]>(`/users/${userId}/tickets`),

    getTicketById: (id: string): Promise<TicketDto | null> =>
      apiGet<TicketDto | null>(`/tickets/${id}`),
  };

  // ── Play ──────────────────────────────────────────────────────────────────
  play = {
    placeBet: (dto: CreateBetRequestDto & { userId: string }): Promise<CreateBetResponseDto> =>
      apiPost<CreateBetResponseDto>('/bets', dto),

    submitPlaySession: (payload: SubmitPlaySessionRequestDto): Promise<SubmitPlaySessionResponseDto> =>
      apiPost<SubmitPlaySessionResponseDto>('/play-sessions', payload),

    // TODO: implement server-side pricing — POST /play/quote
    // Price must be validated on the server before charging the user.
    calculatePrice: async (_gameId: string, _selection: Record<string, unknown>): Promise<number> => 0,
  };

  // ── Wallet ────────────────────────────────────────────────────────────────
  wallet = {
    getBalance: (userId: string): Promise<WalletBalanceDto> =>
      apiGet<WalletBalanceDto>(`/users/${userId}/wallet/balance`),

    getMovements: (userId: string): Promise<WalletMovementDto[]> =>
      apiGet<WalletMovementDto[]>(`/users/${userId}/wallet/movements`),

    topUp: (userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> =>
      apiPost(`/users/${userId}/wallet/top-up`, { amount }),
  };

  // ── Subscriptions ─────────────────────────────────────────────────────────
  subscriptions = {
    getAvailableNumbers: (): Promise<GetAvailableNumbersResponseDto> =>
      apiGet<GetAvailableNumbersResponseDto>('/subscriptions/available-numbers'),

    create: (dto: CreateSubscriptionRequestDto): Promise<CreateSubscriptionResponseDto> =>
      apiPost<CreateSubscriptionResponseDto>('/subscriptions', dto),

    getAll: (): Promise<GetSubscriptionsResponseDto> =>
      apiGet<GetSubscriptionsResponseDto>('/subscriptions'),

    update: (id: string, dto: UpdateSubscriptionRequestDto): Promise<UpdateSubscriptionResponseDto> =>
      apiPatch<UpdateSubscriptionResponseDto>(`/subscriptions/${id}`, dto),

    cancel: (id: string): Promise<void> =>
      apiDelete(`/subscriptions/${id}`),

    getReservations: (): Promise<GetReservationsResponseDto> =>
      apiGet<GetReservationsResponseDto>('/subscriptions/reservations'),

    payReservations: (dto: PayReservationsRequestDto): Promise<PayReservationsResponseDto> =>
      apiPost<PayReservationsResponseDto>('/subscriptions/reservations/pay', dto),

    confirmFirstDraw: (dto: ConfirmFirstDrawRequestDto): Promise<ConfirmFirstDrawResponseDto> =>
      apiPost<ConfirmFirstDrawResponseDto>(`/subscriptions/${dto.subscriptionId}/confirm-first-draw`, dto),
  };
}
