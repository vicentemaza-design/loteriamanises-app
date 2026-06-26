import type { ApiResponseDto } from './common.contracts';

/**
 * Wallet API Contracts
 */

export interface WalletMovementDto {
  id: string;
  userId: string;
  type: 'deposit' | 'bet' | 'prize' | 'withdrawal';
  amount: number;
  description: string;
  createdAt: string; // ISO Date
  orderId?: string;
  balanceAfter?: number;
  details?: {
    gameId?: string;
    gameLabel?: string;
    combinations?: string[];
    number?: string;
    quantity?: number;
    shippingCost?: number;
    deliveryMode?: 'custody' | 'shipping';
    iban?: string;
    bankName?: string;
    recipientName?: string;
  };
}

export interface WalletBalanceDto {
  balance: number;
  userId: string;
}

export type GetBalanceResponseDto = ApiResponseDto<WalletBalanceDto>;
export type GetMovementsResponseDto = ApiResponseDto<WalletMovementDto[]>;
export type TopUpResponseDto = ApiResponseDto<{ success: boolean; newBalance: number }>;
