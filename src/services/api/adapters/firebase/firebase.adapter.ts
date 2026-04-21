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
      // Logic managed in AuthProvider
      throw new Error('Sign in must be called from AuthContext');
    },
    logout: async () => {
      // Logic managed in AuthProvider
      throw new Error('Logout must be called from AuthContext');
    },
    getCurrentUser: async () => null, // Placeholder
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
