import type { LotteryGame, Ticket, UserProfile, WalletMovement } from '@/shared/types/domain';
import type { ResultDto } from '../contracts/results.contracts';
import type { CreateBetRequestDto, CreateBetResponseDto } from '../contracts/play.contracts';

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
    getLatest: () => Promise<ResultDto[]>;
    getById: (id: string) => Promise<ResultDto | null>;
  };

  // Tickets
  tickets: {
    getUserTickets: (userId: string) => Promise<Ticket[]>;
    getTicketById: (id: string) => Promise<Ticket | null>;
  };

  // Play
  play: {
    placeBet: (betData: CreateBetRequestDto & { userId: string }) => Promise<CreateBetResponseDto>;
    calculatePrice: (gameId: string, selection: Record<string, any>) => Promise<number>;
  };

  // Wallet
  wallet: {
    getBalance: (userId: string) => Promise<number>;
    getMovements: (userId: string) => Promise<WalletMovement[]>;
    topUp: (userId: string, amount: number) => Promise<{ success: boolean; newBalance: number }>;
  };
}
