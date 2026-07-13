import type { IApiProvider } from '../../providers/api.provider';
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
