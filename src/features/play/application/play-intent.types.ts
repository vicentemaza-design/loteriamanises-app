import type { ScheduleMode } from '@/features/play/config/draw-schedule.config';
import type { PlayMode } from '@/features/play/lib/play-matrix';
import type { GameType, LotteryGame } from '@/shared/types/domain';

export type Game = LotteryGame;

export type PlayIntentNationalDrawId = 'jueves' | 'sabado' | 'especial';

export interface PlayIntentQuinielaMatch {
  id: number;
  result: string | null;
}

export interface PlayIntentState {
  mode: PlayMode;
  selectedNumbers: number[];
  selectedStars: number[];
  quinielaMatches: PlayIntentQuinielaMatch[];
  selectedReductionSystemId: string;
  selectedNationalDrawId: PlayIntentNationalDrawId;
  selectedNationalNumber: string | null;
  selectedNationalQuantity: number;
  scheduleMode: ScheduleMode;
  selectedWeeksCount: number;
  selectedDrawDates: string[];
  isSubscription: boolean;
}

export interface CreateDefaultPlayIntentOptions {
  availableModes: PlayMode[];
  gameId?: string;
  defaultCustomWeeks?: number;
  defaultReductionSystemId?: string;
}

export interface HydratePlayIntentOptions extends CreateDefaultPlayIntentOptions {
  gameType: GameType;
  availableQuinielaMatches?: PlayIntentQuinielaMatch[];
}

export function createDefaultPlayIntentState({
  availableModes,
  gameId,
  defaultCustomWeeks = 2,
  defaultReductionSystemId = 'reducida_1',
}: CreateDefaultPlayIntentOptions): PlayIntentState {
  return {
    mode: availableModes[0] ?? 'simple',
    selectedNumbers: [],
    selectedStars: [],
    quinielaMatches: [],
    selectedReductionSystemId: defaultReductionSystemId,
    selectedNationalDrawId: gameId === 'loteria-nacional-jueves'
      ? 'jueves'
      : gameId === 'loteria-nacional-sabado'
        ? 'sabado'
        : 'especial',
    selectedNationalNumber: null,
    selectedNationalQuantity: 1,
    scheduleMode: 'next_draw',
    selectedWeeksCount: defaultCustomWeeks,
    selectedDrawDates: [],
    isSubscription: false,
  };
}
