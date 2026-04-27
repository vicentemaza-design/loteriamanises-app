import type { LotteryGame } from '@/shared/types/domain';
import type { 
  MulticolumnDraftIntent, 
  MulticolumnDraftPreviewSummary,
  MulticolumnDraftPreview 
} from '../contracts/multicolumn-play.contract';
import { resolvePlayPricing } from '@/features/play/application/resolve-play-pricing';
import { inferMulticolumnPlayMode } from './infer-multicolumn-play-mode';

/**
 * Mapea una intención multi-columna a una previsualización detallada.
 * Calcula apuestas y precios de forma individual por columna para transparencia.
 */
export function mapMulticolumnIntentToPreview(
  intent: MulticolumnDraftIntent,
  game: LotteryGame
): MulticolumnDraftPreviewSummary {
  const previews: MulticolumnDraftPreview[] = [];
  let totalBets = 0;
  let totalPrice = 0;

  intent.columns.forEach((col, index) => {
    // Reutilizamos la lógica de pricing canónica
    const pricing = resolvePlayPricing({
      game,
      isNationalLottery: false,
      isQuiniela: game.id === 'quiniela',
      mode: inferMulticolumnPlayMode(game, col),
      selectedNumbersCount: col.numbers.length,
      selectedStarsCount: col.stars.length,
      selectedReductionSystemId: '',
      selectedNationalQuantity: 0,
      selectedNationalDraw: {},
      drawsCount: intent.drawDates.length, // Multiplicador de sorteos
    });

    previews.push({
      columnId: `col-${index + 1}`,
      numbers: col.numbers,
      stars: col.stars,
      betsCount: pricing.betsCount,
      totalPrice: pricing.totalPrice,
    });

    totalBets += pricing.betsCount;
    totalPrice += pricing.totalPrice;
  });

  return {
    items: previews,
    totalBets,
    totalPrice,
    validColumnsCount: intent.columns.length,
  };
}
