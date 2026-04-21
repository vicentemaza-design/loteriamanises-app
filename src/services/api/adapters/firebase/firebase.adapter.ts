import type { IApiProvider } from '../../providers/api.provider';
import { placeBetFirebase } from './play.firebase';
import { getLatestResultsFirebase, getResultByIdFirebase } from './results.firebase';
import { getUserTicketsFirebase, getTicketByIdFirebase } from './tickets.firebase';
import { getBalanceFirebase, getMovementsFirebase, topUpFirebase } from './wallet.firebase';

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
    calculatePrice: async () => 0, // Logic remains in domain services for now
  };

  // Wallet
  wallet = {
    getBalance: getBalanceFirebase,
    getMovements: getMovementsFirebase,
    topUp: topUpFirebase,
  };
}
