import type { GameType } from '@/shared/types/domain';
import type { ApiResponseDto } from './common.contracts';

/**
 * Results API Contracts
 * Definitions for game draws and winning combinations.
 */

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
  drawId?: string;
}

export type GetResultsResponseDto = ApiResponseDto<ResultDto[]>;
export type GetResultByIdResponseDto = ApiResponseDto<ResultDto>;
