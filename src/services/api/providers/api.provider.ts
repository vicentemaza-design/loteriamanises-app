import type { LotteryGame, Ticket, UserProfile, WalletMovement } from '@/shared/types/domain';

/**
 * IApiProvider
 * The common interface for all data providers (Mock, Firebase, HTTP).
 * This ensures the UI remains agnostic to the data source.
 */
export interface IApiProvider {
  // Auth
  auth: {
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<UserProfile | null>;
  };

  // Results
  results: {
    getLatest: () => Promise<any[]>; // Will refine with contracts later
    getById: (id: string) => Promise<any | null>;
  };

  // Tickets
  tickets: {
    getUserTickets: (userId: string) => Promise<Ticket[]>;
    getTicketById: (id: string) => Promise<Ticket | null>;
  };

  // Play
  play: {
    placeBet: (betData: any) => Promise<{ success: boolean; ticketId?: string; error?: string }>;
    calculatePrice: (gameId: string, selection: any) => Promise<number>;
  };

  // Wallet
  wallet: {
    getBalance: (userId: string) => Promise<number>;
    getMovements: (userId: string) => Promise<WalletMovement[]>;
    topUp: (userId: string, amount: number) => Promise<{ success: boolean; newBalance: number }>;
  };
}
