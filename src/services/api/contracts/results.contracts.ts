import type { GameType } from '@/shared/types/domain';
import type { ApiResponseDto } from './common.contracts';

/**
 * Results API Contracts
 * Definitions for game draws and winning combinations.
 */

export interface ScrutinyCategory {
  category: string;
  winners: number;
  prizePerWinner: number;
  isMonthly?: boolean;
}

export interface ResultDto {
  gameId: string;
  gameType: GameType;
  date: string; // ISO Date
  numbers: Array<number | string>;
  stars?: number[];
  complementario?: number;
  reintegro?: number;
  firstPrizeNumber?: string;
  secondPrizeNumber?: string;
  reintegros?: number[];
  decimoPrice?: number;
  jackpotNext?: number;
  /** Internal app draw identifier. */
  drawId?: string;
  /** SELAE's official draw identifier — used to cross-reference with SELAE systems and CRAPI. */
  selaeDrawId?: string;
  scrutiny?: ScrutinyCategory[];
  nextDrawDate?: string;
  ultimas4cifras?: string[];
  ultimas3cifras?: string[];
  ultimas2cifras?: string[];
  // Navidad extended prizes
  thirdPrizeNumber?: string;
  fourthPrizeNumbers?: string[];
  fifthPrizeNumbers?: string[];
  // El Niño: two 2nd prizes
  secondPrizeNumbers?: string[];
  // Primitiva: Joker number (7 digits) + its own scrutiny
  joker?: string;
  jokerScrutiny?: ScrutinyCategory[];
  // Euromillones: El Millón code (e.g. 'KQT27854') + its own scrutiny
  elMillon?: string;
  elMillonScrutiny?: ScrutinyCategory[];
}

export type GetResultsResponseDto = ApiResponseDto<ResultDto[]>;
export type GetResultByIdResponseDto = ApiResponseDto<ResultDto>;
