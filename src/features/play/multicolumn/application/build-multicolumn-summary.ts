import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnState, MulticolumnSummary } from '../contracts/multicolumn-play.contract';
import { resolvePlayPricing } from '@/features/play/application/resolve-play-pricing';
import { inferMulticolumnPlayMode } from './infer-multicolumn-play-mode';

/**
 * Calcula el resumen total del boleto multi-columna.
 * 
 * DECISIÓN TÉCNICA:
 * Una columna incompleta NO cuenta para el total de apuestas ni el precio.
 * El resumen solo refleja las columnas que cumplen los requisitos mínimos del juego.
 */
export function buildMulticolumnSummary(
  state: MulticolumnState,
  game: LotteryGame,
  drawsCount: number = 1
): MulticolumnSummary {
  let totalBets = 0;
  let totalPrice = 0;
  let completeColumns = 0;

  state.columns.forEach((col) => {
    if (col.isComplete && col.isValid) {
      // Usamos el resolver de precios existente para garantizar consistencia
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
        drawsCount,
      });

      totalBets += pricing.betsCount;
      totalPrice += pricing.totalPrice;
      completeColumns += 1;
    }
  });

  return {
    totalColumns: state.columns.length,
    completeColumns,
    totalBets,
    totalPrice,
    isValid: completeColumns > 0,
  };
}
