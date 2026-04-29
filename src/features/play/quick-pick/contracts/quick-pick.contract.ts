import type { LotteryGame } from '@/shared/types/domain';
import type { GameSelection } from '@/features/session/types/session.types';

export interface QuickPickCombination {
  id: string;
  numbers: number[];
  stars: number[];
  selection: GameSelection;
}

export interface QuickPickState {
  count: number;
  combinations: QuickPickCombination[];
  isRegenerating: boolean;
}

export interface QuickPickDraftIntent {
  game: LotteryGame;
  combinations: QuickPickCombination[];
  drawDates: string[];
  isSubscription: boolean;
}
