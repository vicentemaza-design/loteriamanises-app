import type { UserProfile } from '@/shared/types/domain';
import type {
  LoginInput,
  LoginResult,
  RequestPasswordResetInput,
  RequestPasswordResetResult,
  RegisterInput,
  RegisterResult,
  ResendVerificationEmailInput,
  ResendVerificationEmailResult,
  ChangePendingEmailInput,
  ChangePendingEmailResult,
  VerifyEmailInput,
  VerifyEmailResult,
} from '../contracts/auth.contracts';
import type { ResultDto } from '../contracts/results.contracts';
import type { CreateBetRequestDto, CreateBetResponseDto, SubmitPlaySessionRequestDto, SubmitPlaySessionResponseDto } from '../contracts/play.contracts';
import type { TicketDto } from '../contracts/tickets.contracts';
import type { WalletBalanceDto, WalletMovementDto } from '../contracts/wallet.contracts';
import type {
  BankAccountDto,
  AddBankAccountInput,
  AddBankAccountResult,
  VerifyBankAccountInput,
  VerifyBankAccountResult,
} from '../contracts/bank-accounts.contracts';
import type {
  CreateWithdrawalInput,
  CreateWithdrawalResult,
} from '../contracts/withdrawals.contracts';
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
 * IMPORTANT — Google Sign-In is intentionally NOT routed through this
 * interface. It is handled directly by AuthProvider via the Firebase SDK,
 * which manages token lifecycle automatically. When migrating to a custom
 * HTTP backend, implement JWT attachment in the HTTP adapter's request
 * layer and update AuthProvider accordingly.
 *
 * Email/password login and password recovery DO go through this interface
 * (loginWithEmail / requestPasswordReset below) so BE can implement them in
 * HttpAdapter without any UI changes. Neither is implemented against
 * Firebase today — see docs/be-handoff/auth-registration-recovery.md.
 */
export interface IApiProvider {
  auth: {
    // Reserved for future HTTP adapter integration — see note above.
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<UserProfile | null>;
    /** Rejects with an AuthError (see features/auth/lib/authErrors.ts) on failure. */
    loginWithEmail: (input: LoginInput) => Promise<LoginResult>;
    /** Must always resolve the same way regardless of whether the email exists (anti-enumeration). */
    requestPasswordReset: (input: RequestPasswordResetInput) => Promise<RequestPasswordResetResult>;
    /**
     * Manual registration. Rejects with an AuthError on failure (e.g.
     * 'email_already_in_use', 'underage'). Result always has emailVerified: false
     * — no verification flow exists yet (next phase).
     */
    register: (input: RegisterInput) => Promise<RegisterResult>;
    /**
     * Resend the verification email for a pending (unverified) account.
     * Rejects with AuthError on failure (e.g. 'rate_limited', 'service_unavailable').
     * Deliberately no getEmailVerificationStatus()/polling operation exists —
     * emailVerified is exposed naturally via UserProfile/getCurrentUser() once
     * BE implements it. See docs/be-handoff/auth-registration-recovery.md.
     */
    resendVerificationEmail: (input: ResendVerificationEmailInput) => Promise<ResendVerificationEmailResult>;
    /**
     * Change the email address for a not-yet-verified account. Rejects with
     * AuthError on failure (e.g. 'email_already_in_use', 'rate_limited').
     * Never creates a session, never touches the profile in this phase.
     */
    changePendingEmail: (input: ChangePendingEmailInput) => Promise<ChangePendingEmailResult>;
    /**
     * Consume a verification link token (opaque — never decoded by FE).
     * Resolves with an outcome ('verified' | 'expired' | 'invalid') — these
     * are operation outcomes, not persistent user states. Only rejects with
     * AuthError for genuine technical failures (network, rate limit, etc.).
     */
    verifyEmail: (input: VerifyEmailInput) => Promise<VerifyEmailResult>;
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
    /**
     * Bank accounts — destination accounts for withdrawals. This phase only
     * covers listing, adding and the FE-visible outcome of an ownership
     * verification attempt. No real withdrawal, balance change or economic
     * operation is triggered by anything in this namespace.
     */
    bankAccounts: {
      list: () => Promise<BankAccountDto[]>;
      /** BE must re-validate IBAN format/checksum and uniqueness server-side. */
      add: (input: AddBankAccountInput) => Promise<AddBankAccountResult>;
      /**
       * FE never decides the outcome — it only represents whatever the
       * provider returns. Never compare holderName to the profile in FE.
       */
      verifyOwnership: (input: VerifyBankAccountInput) => Promise<VerifyBankAccountResult>;
    };
    /**
     * Creates a DEMO withdrawal request — this phase only. No real transfer,
     * no authoritative balance change, no ledger, no idempotency guarantee.
     * FE sends only { bankAccountId, amount } — never balance, holderName,
     * verificationStatus or a fee it calculated itself; BE must derive/
     * validate all of that server-side. Rejects with WithdrawalError (see
     * features/profile/lib/withdrawalErrors.ts) on technical/transport
     * failure; a business-level rejection is instead a successful resolve
     * with WithdrawalDto.status === 'rejected'.
     */
    createWithdrawal: (input: CreateWithdrawalInput) => Promise<CreateWithdrawalResult>;
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
