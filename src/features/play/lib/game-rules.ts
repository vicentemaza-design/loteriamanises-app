import { LotteryGame } from '@/shared/types/domain';

/**
 * Reglas de negocio y validación de jugadas (Matrix-Driven).
 */

export type PlayValidationResult = {
  isValid: boolean;
  message?: string;
  betsCount: number;
};

/**
 * Valida si una selección cumple con los requisitos del modo y el juego.
 */
export function validatePlaySelection(
  game: LotteryGame,
  mode: 'simple' | 'multiple' | 'reduced',
  selection: { numbers: number[], stars: number[], systemId?: string }
): PlayValidationResult {
  const { numbers, stars } = selection;
  const range = game.selectionRange;

  if (mode === 'simple') {
    const isNumsOk = numbers.length === range.minNumbers;
    const isStarsOk = stars.length === (range.minStars ?? 0);
    
    if (!isNumsOk) return { isValid: false, message: `Selecciona exactamente ${range.minNumbers} números`, betsCount: 0 };
    if (!isStarsOk) return { isValid: false, message: `Selecciona exactamente ${range.minStars} estrellas`, betsCount: 0 };
    
    return { isValid: true, betsCount: 1 };
  }

  if (mode === 'multiple') {
    if (numbers.length < range.minNumbers) {
      return { isValid: false, message: `Mínimo ${range.minNumbers} números para múltiple`, betsCount: 0 };
    }
    if (numbers.length > range.maxNumbers) {
      return { isValid: false, message: `Máximo ${range.maxNumbers} números permitidos`, betsCount: 0 };
    }
    if (range.maxStars && stars.length > range.maxStars) {
      return { isValid: false, message: `Máximo ${range.maxStars} estrellas permitidas`, betsCount: 0 };
    }

    // Aquí llamaríamos a calculateMultipleBets si fuera necesario, 
    // pero el componente visual lo suele calcular al vuelo.
    return { isValid: true, betsCount: 0 }; // betsCount se calcula dinámicamente en el componente
  }

  return { isValid: false, message: 'Modo no soportado', betsCount: 0 };
}
