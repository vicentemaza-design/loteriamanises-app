import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnState, MulticolumnSummary } from '../contracts/multicolumn-play.contract';
import { resolvePlayPricing } from '@/features/play/application/resolve-play-pricing';

/**
 * Calcula el resumen total del boleto multi-columna.
 * 
 * DECISIÓN TÉCNICA:
 * Una columna incompleta NO cuenta para el total de apuestas ni el precio,
 * pero invalida el boleto si se intenta persistir sin estar "limpia" (vacía).
 */
export function buildMulticolumnSummary(
  state: MulticolumnState,
  game: LotteryGame
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
        mode: col.numbers.length > (game.selectionRange?.numbers?.min ?? 5) ? 'multiple' : 'simple',
        selectedNumbersCount: col.numbers.length,
        selectedStarsCount: col.stars.length,
        selectedReductionSystemId: '',
        selectedNationalQuantity: 0,
        selectedNationalDraw: {},
        drawsCount: 1, // El sumario es por un solo sorteo; el multiplicador de fechas se aplica en el draft final
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
