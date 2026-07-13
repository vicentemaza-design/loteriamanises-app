import type { BetMode, GameType } from '@/shared/types/domain';
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
  
  mode: BetMode;
  price: number;
  drawDate: string;
  drawDates?: string[];
  scheduleMode?: ScheduleMode;
  weeksCount?: number;
  betsCount: number;
  hasInsurance: boolean;
  isSubscription: boolean;
  metadata?: Record<string, unknown>;
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
  /** Serie del décimo (lotería nacional). Necesario para trazabilidad física del décimo. */
  serie?: string;
  /** Fracción del décimo (lotería nacional). Necesario para trazabilidad física del décimo. */
  fraccion?: string;
}

export interface SubmitPlaySessionRequestDto {
  sessionId: string;
  userId: string;
  paymentMethod: 'wallet' | 'card';
  /** COF card token (Redsys Ds_Merchant_Identifier) — required when paymentMethod = 'card'. */
  cardToken?: string;
  totalAmount: number;
  items: SubmitPlaySessionItemDto[];
}

export interface SubmitPlaySessionResponseDto {
  success: boolean;
  confirmedDraftIds?: string[];
  ticketIds?: string[];
  failures?: Array<{ draftId: string; reason: string }>;
  error?: string;
  /**
   * SELAE CRAPI confirmation ID for Lotería Nacional transmissions.
   * Returned by SELAE when the sale is successfully registered in their central system.
   * Required for legal traceability of preprinted décimos.
   */
  selaeTransmissionId?: string;
  /**
   * SELAE resguardo ID for non-Nacional bets (Primitiva, Euromillones, Quiniela…).
   * Issued by SELAE when the bet is officially registered.
   * This is the legally valid proof of participation.
   */
  selaeResguardoId?: string;
}

export interface QuotePlayRequestDto {
  gameId: string;
  selection: {
    numbersCount: number;
    starsCount?: number;
    reducedSystemId?: string;
  };
  mode: BetMode;
}

export interface QuotePlayResponseDto {
  totalPrice: number;
  betsCount: number;
}

export type PlaceBetResponseDto = ApiResponseDto<CreateBetResponseDto>;
export type QuotePlayApiResponseDto = ApiResponseDto<QuotePlayResponseDto>;
export type SubmitPlaySessionApiResponseDto = ApiResponseDto<SubmitPlaySessionResponseDto>;
