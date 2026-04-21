import type { ApiResponseDto } from './common.contracts';

/**
 * Wallet API Contracts
 */

export interface WalletMovementDto {
  id: string;
  userId: string;
  type: 'deposit' | 'bet' | 'prize';
  amount: number;
  description: string;
  createdAt: string; // ISO Date
}

export interface WalletBalanceDto {
  balance: number;
  userId: string;
}

export type GetBalanceResponseDto = ApiResponseDto<WalletBalanceDto>;
export type GetMovementsResponseDto = ApiResponseDto<WalletMovementDto[]>;
export type TopUpResponseDto = ApiResponseDto<{ success: boolean; newBalance: number }>;
