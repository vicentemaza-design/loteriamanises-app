import type { LotteryGame } from '@/shared/types/domain';
import type { 
  NationalCartLine, 
  NationalCartDraftIntent, 
  NationalCartDraftIntentLine 
} from '../contracts/national-play.contract';

/**
 * Convierte las líneas de la cesta demo nacional en un contrato de intención explícito.
 * Este contrato es el paso previo a la creación de borradores reales en PlaySession.
 */
export function buildNationalCartDraftIntent(
  game: LotteryGame,
  cartLines: NationalCartLine[]
): NationalCartDraftIntent {
  const lines: NationalCartDraftIntentLine[] = cartLines.map((line) => ({
    number: line.number,
    drawId: line.drawId,
    drawLabel: line.drawLabel,
    drawDates: [...line.drawDates],
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    deliveryMode: line.deliveryMode,
    maxQuantity: line.maxQuantity,
  }));

  return {
    lines,
    gameId: game.id,
    gameType: game.type,
  };
}
