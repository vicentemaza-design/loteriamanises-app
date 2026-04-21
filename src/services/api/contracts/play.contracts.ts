import type { GameType } from '@/shared/types/domain';
import type { ApiResponseDto } from './common.contracts';

/**
 * Play API Contracts
 */

export interface CreateBetRequestDto {
  gameId: string;
  gameType: GameType;
  numbers?: number[];
  stars?: number[];
  // For special games like Quiniela
  selections?: Array<{ id: number; val: string | null }>;
  systemId?: string; // For reduced systems
  
  mode: string; // 'simple' | 'multiple' | 'reduced' | 'nacional'
  price: number;
  drawDate: string;
  betsCount: number;
  hasInsurance: boolean;
  isSubscription: boolean;
  metadata?: Record<string, any>;
}

export interface CreateBetResponseDto {
  success: boolean;
  ticketId?: string;
  error?: string;
}

export interface QuotePlayRequestDto {
  gameId: string;
  selection: {
    numbersCount: number;
    starsCount?: number;
    reducedSystemId?: string;
  };
  mode: string;
}

export interface QuotePlayResponseDto {
  totalPrice: number;
  betsCount: number;
}

export type PlaceBetResponseDto = ApiResponseDto<CreateBetResponseDto>;
export type QuotePlayApiResponseDto = ApiResponseDto<QuotePlayResponseDto>;
