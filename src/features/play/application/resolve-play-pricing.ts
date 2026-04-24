import type { PlayMode } from '@/features/play/lib/play-matrix';
import { quotePlay } from '@/features/play/lib/play-matrix';
import {
  calculateMultipleBets,
  calculateTotalPrice,
  QUINIELA_REDUCED_TABLES,
  type QuinielaReducedType,
} from '@/features/play/lib/bet-calculator';
import type { LotteryGame } from '@/shared/types/domain';

interface SelectedNationalDrawPricingInput {
  decimoPrice?: number;
}

export interface ResolvePlayPricingOptions {
  game: LotteryGame;
  isNationalLottery: boolean;
  isQuiniela: boolean;
  mode: PlayMode;
  selectedNumbersCount: number;
  selectedStarsCount: number;
  selectedReductionSystemId: string;
  selectedNationalQuantity: number;
  selectedNationalDraw: SelectedNationalDrawPricingInput;
  drawsCount: number;
}

export interface ResolvedPlayPricing {
  betsCount: number;
  drawPrice: number;
  totalPrice: number;
}

function isQuinielaReducedType(value: string): value is QuinielaReducedType {
  return value in QUINIELA_REDUCED_TABLES;
}

function resolveBetsCount({
  game,
  isNationalLottery,
  isQuiniela,
  mode,
  selectedNumbersCount,
  selectedStarsCount,
  selectedReductionSystemId,
}: Omit<ResolvePlayPricingOptions, 'selectedNationalQuantity' | 'selectedNationalDraw' | 'drawsCount'>): number {
  if (isQuiniela && mode === 'reduced') {
    if (!isQuinielaReducedType(selectedReductionSystemId)) {
      return 1;
    }

    return QUINIELA_REDUCED_TABLES[selectedReductionSystemId].bets;
  }

  if (isNationalLottery || isQuiniela) {
    return 1;
  }

  const quotedPlay = quotePlay({
    game,
    mode,
    numbersCount: selectedNumbersCount,
    starsCount: selectedStarsCount,
    reducedSystemId: mode === 'reduced' ? selectedReductionSystemId : undefined,
  });

  if (mode === 'multiple' && quotedPlay.betsCount === 0) {
    return calculateMultipleBets(selectedNumbersCount, selectedStarsCount, game.type);
  }

  return quotedPlay.betsCount;
}

export function resolvePlayPricing(options: ResolvePlayPricingOptions): ResolvedPlayPricing {
  const betsCount = resolveBetsCount(options);

  const drawPrice = options.isNationalLottery
    ? (options.selectedNationalDraw.decimoPrice ?? options.game.price ?? 3) * options.selectedNationalQuantity
    : calculateTotalPrice(options.game.price, betsCount, false);

  return {
    betsCount,
    drawPrice,
    totalPrice: drawPrice * options.drawsCount,
  };
}
