import type { GameType } from '@/shared/types/domain';
import type { ApiResponseDto } from './common.contracts';
import type { ScheduleMode } from '@/features/play/config/draw-schedule.config';

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
  drawDates?: string[];
  scheduleMode?: ScheduleMode;
  weeksCount?: number;
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

export interface SubmitPlaySessionItemDto extends CreateBetRequestDto {
  draftId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SubmitPlaySessionRequestDto {
  sessionId: string;
  userId: string;
  paymentMethod: 'wallet';
  totalAmount: number;
  items: SubmitPlaySessionItemDto[];
}

export interface SubmitPlaySessionResponseDto {
  success: boolean;
  confirmedDraftIds?: string[];
  ticketIds?: string[];
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
export type SubmitPlaySessionApiResponseDto = ApiResponseDto<SubmitPlaySessionResponseDto>;
