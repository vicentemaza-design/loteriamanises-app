import { LotteryGame } from '@/shared/types/domain';
import { getModeDefinition, getReductionSystem, type PlayMode } from './play-matrix';

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
  mode: PlayMode,
  selection: { numbers: number[], stars: number[], systemId?: string }
): PlayValidationResult {
  const { numbers, stars } = selection;
  const modeDefinition = getModeDefinition(game.id, mode);
  const range = modeDefinition?.selection ?? game.selectionRange;

  if (!range) return { isValid: true, betsCount: 1 }; // Juegos sin selección manual

  if (mode === 'simple') {
    const isNumsOk = numbers.length === range.numbers.min;
    const isStarsOk = stars.length === (range.stars?.min ?? 0);
    
    if (!isNumsOk) return { isValid: false, message: `Selecciona exactamente ${range.numbers.min} números`, betsCount: 0 };
    if (!isStarsOk) return { isValid: false, message: `Selecciona exactamente ${range.stars?.min ?? 0} estrellas`, betsCount: 0 };
    
    return { isValid: true, betsCount: 1 };
  }

  if (mode === 'multiple') {
    if (numbers.length < range.numbers.min) {
      return { isValid: false, message: `Mínimo ${range.numbers.min} números para múltiple`, betsCount: 0 };
    }
    if (numbers.length > range.numbers.max) {
      return { isValid: false, message: `Máximo ${range.numbers.max} números permitidos`, betsCount: 0 };
    }
    if (range.stars && stars.length > range.stars.max) {
      return { isValid: false, message: `Máximo ${range.stars.max} estrellas permitidas`, betsCount: 0 };
    }

    return { isValid: true, betsCount: 0 };
  }

  if (mode === 'reduced') {
    const reductionSystem = getReductionSystem(game.id, selection.systemId);

    if (reductionSystem?.requiredPattern) {
      return { isValid: false, message: 'La validación de reducidas oficiales se gestiona en el selector especializado.', betsCount: reductionSystem.fixedBetsCount ?? 0 };
    }

    if (numbers.length < range.numbers.min) {
      return { isValid: false, message: `Mínimo ${range.numbers.min} números para reducida`, betsCount: 0 };
    }
    if (numbers.length > range.numbers.max) {
      return { isValid: false, message: `Máximo ${range.numbers.max} números permitidos`, betsCount: 0 };
    }
    if (range.stars && (stars.length < range.stars.min || stars.length > range.stars.max)) {
      return { isValid: false, message: `Selecciona entre ${range.stars.min} y ${range.stars.max} extras`, betsCount: 0 };
    }

    return { isValid: true, betsCount: reductionSystem?.fixedBetsCount ?? 0 };
  }

  return { isValid: false, message: 'Modo no soportado', betsCount: 0 };
}
