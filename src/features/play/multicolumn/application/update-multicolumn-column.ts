import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnColumn } from '../contracts/multicolumn-play.contract';

/**
 * Actualiza una columna validando su estado según las reglas del juego.
 */
export function updateMulticolumnColumn(
  column: MulticolumnColumn,
  game: LotteryGame,
  newNumbers: number[],
  newStars: number[] = []
): MulticolumnColumn {
  const range = game.selectionRange;
  
  if (!range) {
    return { ...column, numbers: newNumbers, stars: newStars, isComplete: true, isValid: true };
  }

  const minNums = range.numbers?.min ?? 0;
  const maxNums = range.numbers?.max ?? 0;
  const minStars = range.stars?.min ?? 0;
  const maxStars = range.stars?.max ?? 0;

  const isComplete = newNumbers.length >= minNums && newStars.length >= minStars;
  const isValid = newNumbers.length <= maxNums && newStars.length <= maxStars;

  return {
    ...column,
    numbers: newNumbers,
    stars: newStars,
    isComplete,
    isValid,
  };
}
