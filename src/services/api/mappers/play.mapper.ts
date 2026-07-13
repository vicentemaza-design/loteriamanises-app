import type { BetMode, GameType, SelaeGameCode } from '@/shared/types/domain';
import type { ScheduleMode } from '@/features/play/config/draw-schedule.config';
import type { CreateBetRequestDto } from '../contracts/play.contracts';

/**
 * Play Mapper
 * Translates UI selection and game state into a standardized Purchase DTO.
 */

export interface BuildBetDtoInput {
  gameId: string;
  gameType: GameType;
  selaeGameCode: SelaeGameCode;
  numbers?: number[];
  stars?: number[];
  selections?: Array<{ id: number; val: string | null }>;
  systemId?: string;
  mode: BetMode;
  price: number;
  drawDate: string;
  drawDates?: string[];
  scheduleMode?: ScheduleMode;
  weeksCount?: number;
  betsCount?: number;
  hasInsurance?: boolean;
  isSubscription?: boolean;
  metadata?: Record<string, unknown>;
}

export const playMapper = {
  toCreateBetDto(params: BuildBetDtoInput): CreateBetRequestDto {
    return {
      gameId: params.gameId,
      gameType: params.gameType,
      selaeGameCode: params.selaeGameCode,
      numbers: params.numbers,
      stars: params.stars,
      selections: params.selections,
      systemId: params.systemId,

      mode: params.mode,
      price: params.price,
      drawDate: params.drawDate,
      drawDates: params.drawDates,
      scheduleMode: params.scheduleMode,
      weeksCount: params.weeksCount,
      betsCount: params.betsCount ?? 1,
      hasInsurance: params.hasInsurance ?? false,
      isSubscription: params.isSubscription ?? false,
      metadata: params.metadata ?? {},
    };
  }
};
