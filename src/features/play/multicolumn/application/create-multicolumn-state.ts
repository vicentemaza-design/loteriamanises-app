import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnState, MulticolumnColumn } from '../contracts/multicolumn-play.contract';

/**
 * Crea una columna vacía con un ID único.
 */
export function createEmptyColumn(): MulticolumnColumn {
  return {
    id: crypto.randomUUID(),
    numbers: [],
    stars: [],
    isComplete: false,
    isValid: true,
  };
}

/**
 * Inicializa el estado multi-columna para un juego específico.
 * Por defecto crea 8 columnas (estándar SELAE) si no se especifica otra cosa.
 */
export function createMulticolumnState(
  game: LotteryGame,
  initialColumnsCount: number = 8
): MulticolumnState {
  const columns: MulticolumnColumn[] = Array.from(
    { length: initialColumnsCount }, 
    () => createEmptyColumn()
  );

  return {
    gameId: game.id,
    gameType: game.type,
    columns,
    activeColumnIndex: 0,
    visibleColumnsCount: initialColumnsCount,
  };
}
