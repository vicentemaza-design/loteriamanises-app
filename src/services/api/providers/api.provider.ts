import type { UserProfile } from '@/shared/types/domain';
import type { ResultDto } from '../contracts/results.contracts';
import type { CreateBetRequestDto, CreateBetResponseDto, SubmitPlaySessionRequestDto, SubmitPlaySessionResponseDto } from '../contracts/play.contracts';
import type { TicketDto } from '../contracts/tickets.contracts';
import type { WalletBalanceDto, WalletMovementDto } from '../contracts/wallet.contracts';
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
} from '../contracts/subscriptions.contracts';

/**
 * IApiProvider
 * The common interface for all data providers (Mock, Firebase, HTTP).
 * This ensures the UI remains agnostic to the data source.
 *
 * IMPORTANT — Auth is intentionally NOT routed through this interface.
 * Firebase Auth (Google Sign-In) is handled directly by AuthProvider via
 * the Firebase SDK, which manages token lifecycle automatically. When
 * migrating to a custom HTTP backend, implement JWT attachment in the HTTP
 * adapter's request layer and update AuthProvider accordingly.
 */
export interface IApiProvider {
  // Auth — reserved for future HTTP adapter integration (see note above).
  auth: {
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<UserProfile | null>;
  };

  // Results
  results: {
    getLatest: () => Promise<ResultDto[]>;
    getById: (id: string) => Promise<ResultDto | null>;
  };

  // Tickets
  tickets: {
    getUserTickets: (userId: string) => Promise<TicketDto[]>;
    getTicketById: (id: string) => Promise<TicketDto | null>;
  };

  // Play
  play: {
    placeBet: (betData: CreateBetRequestDto & { userId: string }) => Promise<CreateBetResponseDto>;
    submitPlaySession: (payload: SubmitPlaySessionRequestDto) => Promise<SubmitPlaySessionResponseDto>;
    /** STUB — price calculation must be authoritative on the server before go-live. */
    calculatePrice: (gameId: string, selection: Record<string, unknown>) => Promise<number>;
  };

  // Wallet
  wallet: {
    getBalance: (userId: string) => Promise<WalletBalanceDto>;
    getMovements: (userId: string) => Promise<WalletMovementDto[]>;
    topUp: (userId: string, amount: number) => Promise<{ success: boolean; newBalance: number }>;
  };

  // Subscriptions — abonos de Lotería Nacional
  // Full endpoint spec: src/services/api/contracts/subscriptions.contracts.ts
  subscriptions: {
    getAvailableNumbers: () => Promise<GetAvailableNumbersResponseDto>;
    create: (dto: CreateSubscriptionRequestDto) => Promise<CreateSubscriptionResponseDto>;
    getAll: () => Promise<GetSubscriptionsResponseDto>;
    update: (id: string, dto: UpdateSubscriptionRequestDto) => Promise<UpdateSubscriptionResponseDto>;
    cancel: (id: string) => Promise<void>;
    getReservations: () => Promise<GetReservationsResponseDto>;
    payReservations: (dto: PayReservationsRequestDto) => Promise<PayReservationsResponseDto>;
    confirmFirstDraw: (dto: ConfirmFirstDrawRequestDto) => Promise<ConfirmFirstDrawResponseDto>;
  };
}
