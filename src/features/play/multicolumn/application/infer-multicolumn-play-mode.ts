import type { LotteryGame } from '@/shared/types/domain';
import type { PlayMode } from '@/features/play/lib/play-matrix';

/**
 * Interfaz mínima requerida para inferir el modo de juego.
 */
interface SelectionData {
  numbers: number[];
  stars?: number[];
}

/**
 * Infiere si una selección debe ser tratada como 'simple' o 'multiple' 
 * basándose en los mínimos de selección del juego.
 */
export function inferMulticolumnPlayMode(game: LotteryGame, data: SelectionData): PlayMode {
  const minNumbers = game.selectionRange?.numbers?.min ?? 0;
  const minStars = game.selectionRange?.stars?.min ?? 0;

  // Es múltiple si supera el mínimo en números O en estrellas/claves
  const isMultiple =
    (minNumbers > 0 && data.numbers.length > minNumbers) ||
    (minStars > 0 && (data.stars?.length ?? 0) > minStars);

  return isMultiple ? 'multiple' : 'simple';
}
