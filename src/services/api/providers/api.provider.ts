import type { ResultDto } from '../contracts/results.contracts';
import type { CreateBetRequestDto, CreateBetResponseDto } from '../contracts/play.contracts';
import type { TicketDto } from '../contracts/tickets.contracts';
import type { WalletBalanceDto, WalletMovementDto } from '../contracts/wallet.contracts';

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
    getUserTickets: (userId: string) => Promise<TicketDto[]>;
    getTicketById: (id: string) => Promise<TicketDto | null>;
  };

  // Play
  play: {
    placeBet: (betData: CreateBetRequestDto & { userId: string }) => Promise<CreateBetResponseDto>;
    calculatePrice: (gameId: string, selection: Record<string, any>) => Promise<number>;
  };

  // Wallet
  wallet: {
    getBalance: (userId: string) => Promise<WalletBalanceDto>;
    getMovements: (userId: string) => Promise<WalletMovementDto[]>;
    topUp: (userId: string, amount: number) => Promise<{ success: boolean; newBalance: number }>;
  };
}
