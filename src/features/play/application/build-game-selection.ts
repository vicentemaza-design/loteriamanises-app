import type { GameSelection } from '@/features/session/types/session.types';
import type { LotteryGame } from '@/shared/types/domain';
import type { PlayMode } from '@/features/play/lib/play-matrix';

interface QuinielaMatchInput {
  id: number;
  result: string | null;
}

interface SelectedNationalDrawInput {
  label: string;
}

export interface BuildGameSelectionOptions {
  game: LotteryGame;
  isNationalLottery: boolean;
  isQuiniela: boolean;
  mode: PlayMode;
  selectedNumbers: number[];
  selectedStars: number[];
  quinielaMatches: QuinielaMatchInput[];
  selectedReductionSystemId: string;
  selectedNationalNumber: string | null;
  selectedNationalDraw: SelectedNationalDrawInput;
}

export function buildGameSelection({
  game,
  isNationalLottery,
  isQuiniela,
  mode,
  selectedNumbers,
  selectedStars,
  quinielaMatches,
  selectedReductionSystemId,
  selectedNationalNumber,
  selectedNationalDraw,
}: BuildGameSelectionOptions): GameSelection | null {
  if (isNationalLottery) {
    if (!selectedNationalNumber) {
      return null;
    }

    return {
      type: 'national',
      number: selectedNationalNumber,
      drawLabel: selectedNationalDraw.label,
    };
  }

  if (isQuiniela) {
    return {
      type: 'quiniela',
      matches: quinielaMatches.map((match) => ({ id: match.id, value: match.result })),
      systemId: mode === 'reduced' ? selectedReductionSystemId : undefined,
    };
  }

  if (game.type === 'euromillones') {
    return { type: 'euromillones', numbers: selectedNumbers, stars: selectedStars };
  }

  if (game.type === 'gordo') {
    return { type: 'gordo', numbers: selectedNumbers, key: selectedStars[0] ?? 0 };
  }

  if (game.type === 'eurodreams') {
    return { type: 'eurodreams', numbers: selectedNumbers, dream: selectedStars[0] ?? 0 };
  }

  if (game.type === 'bonoloto') {
    return { type: 'bonoloto', numbers: selectedNumbers };
  }

  return { type: 'primitiva', numbers: selectedNumbers };
}
