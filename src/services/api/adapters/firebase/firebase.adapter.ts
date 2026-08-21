import type { IApiProvider } from '../../providers/api.provider';
import { AuthError } from '@/features/auth/lib/authErrors';
import { placeBetFirebase, submitPlaySessionFirebase } from './play.firebase';
import { getLatestResultsFirebase, getResultByIdFirebase } from './results.firebase';
import { getUserTicketsFirebase, getTicketByIdFirebase } from './tickets.firebase';
import { getBalanceFirebase, getMovementsFirebase, topUpFirebase } from './wallet.firebase';
import type {
  CreateSubscriptionRequestDto,
  UpdateSubscriptionRequestDto,
  PayReservationsRequestDto,
  ConfirmFirstDrawRequestDto,
} from '../../contracts/subscriptions.contracts';

/**
 * FirebaseAdapter
 * Implements IApiProvider using direct Firestore integration.
 * This is the production-ready implementation of the data layer.
 */
export class FirebaseAdapter implements IApiProvider {
  // Auth - Minimal implementation for now as it's handled by AuthContext
  auth = {
    signInWithGoogle: async () => {
      console.warn('FirebaseAdapter.auth.signInWithGoogle: Stub called. Use AuthContext for auth logic.');
    },
    logout: async () => {
      console.warn('FirebaseAdapter.auth.logout: Stub called. Use AuthContext for auth logic.');
    },
    getCurrentUser: async () => null,
    // Deliberately NOT wired to Firebase signInWithEmailAndPassword — not
    // authorized for this phase. See docs/be-handoff/auth-registration-recovery.md.
    loginWithEmail: async () => {
      console.warn('FirebaseAdapter.auth.loginWithEmail: not implemented — email/password auth is out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
    // Deliberately NOT wired to Firebase sendPasswordResetEmail — not
    // authorized for this phase.
    requestPasswordReset: async () => {
      console.warn('FirebaseAdapter.auth.requestPasswordReset: not implemented — out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
    // Deliberately NOT wired to Firebase createUserWithEmailAndPassword — not
    // authorized for this phase. Google Sign-Up is unaffected, see auth.service.ts.
    register: async () => {
      console.warn('FirebaseAdapter.auth.register: not implemented — email/password registration is out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
    // Deliberately NOT wired to Firebase sendEmailVerification — not
    // authorized for this phase.
    resendVerificationEmail: async () => {
      console.warn('FirebaseAdapter.auth.resendVerificationEmail: not implemented — out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
    // Deliberately NOT wired to Firebase updateEmail — not authorized for this phase.
    changePendingEmail: async () => {
      console.warn('FirebaseAdapter.auth.changePendingEmail: not implemented — out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
    // Deliberately NOT wired to Firebase applyActionCode/checkActionCode —
    // not authorized for this phase.
    verifyEmail: async () => {
      console.warn('FirebaseAdapter.auth.verifyEmail: not implemented — out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
  };

  // Deliberately NOT implemented against Firestore — sending/validating a
  // real email OTP requires a mail provider + server-side rate limiting and
  // expiry, not client-writable Firestore documents. Stub only, out of scope
  // for this phase. See docs/be-handoff/profile-change-verification.md.
  profile = {
    requestProfileChangeVerification: async () => {
      console.warn('FirebaseAdapter.profile.requestProfileChangeVerification: not implemented — out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
    confirmProfileChangeVerification: async () => {
      console.warn('FirebaseAdapter.profile.confirmProfileChangeVerification: not implemented — out of scope for this phase.');
      throw new AuthError('service_unavailable');
    },
  };

  // Results
  results = {
    getLatest: getLatestResultsFirebase,
    getById: getResultByIdFirebase,
  };

  // Tickets
  tickets = {
    getUserTickets: getUserTicketsFirebase,
    getTicketById: getTicketByIdFirebase,
  };

  // Play
  play = {
    placeBet: placeBetFirebase,
    submitPlaySession: submitPlaySessionFirebase,
    calculatePrice: async (_gameId: string, _selection: Record<string, unknown>) => 0, // Must move to server before go-live
  };

  // Wallet
  wallet = {
    getBalance: getBalanceFirebase,
    getMovements: getMovementsFirebase,
    topUp: topUpFirebase,
    // Deliberately NOT implemented against Firestore — bank account
    // verification requires a real banking provider, not Firestore reads/writes.
    // Stub only, out of scope for this phase. Firestore itself is untouched.
    bankAccounts: {
      list: async () => { throw new Error('FirebaseAdapter: wallet.bankAccounts.list — not implemented, out of scope for this phase'); },
      add: async () => { throw new Error('FirebaseAdapter: wallet.bankAccounts.add — not implemented, out of scope for this phase'); },
      verifyOwnership: async () => { throw new Error('FirebaseAdapter: wallet.bankAccounts.verifyOwnership — not implemented, out of scope for this phase'); },
    },
    // Deliberately NOT implemented against Firestore — a real withdrawal
    // requires authoritative balance/ledger logic that must live server-side,
    // not in a client-writable Firestore document. Stub only. Firestore
    // itself and its rules are untouched.
    createWithdrawal: async () => { throw new Error('FirebaseAdapter: wallet.createWithdrawal — not implemented, out of scope for this phase'); },
  };

  // Subscriptions — not implemented in Firestore adapter.
  // Subscriptions are managed via REST API (VITE_API_PROVIDER=http).
  subscriptions = {
    getAvailableNumbers: async () => ({ numbers: [], total: 0 }),
    create: async (_dto: CreateSubscriptionRequestDto) => { throw new Error('FirebaseAdapter: subscriptions.create — use HTTP adapter'); },
    getAll: async () => ({ subscriptions: [], pendingReservations: [], pendingTotal: 0 }),
    update: async (_id: string, _dto: UpdateSubscriptionRequestDto) => { throw new Error('FirebaseAdapter: subscriptions.update — use HTTP adapter'); },
    cancel: async (_id: string) => { throw new Error('FirebaseAdapter: subscriptions.cancel — use HTTP adapter'); },
    getReservations: async () => ({ reservations: [], total: 0 }),
    payReservations: async (_dto: PayReservationsRequestDto) => { throw new Error('FirebaseAdapter: subscriptions.payReservations — use HTTP adapter'); },
    confirmFirstDraw: async (_dto: ConfirmFirstDrawRequestDto) => { throw new Error('FirebaseAdapter: subscriptions.confirmFirstDraw — use HTTP adapter'); },
  };
}
