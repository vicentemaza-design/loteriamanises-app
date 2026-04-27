import type { GameType } from '@/shared/types/domain';

/**
 * Representa una única columna de un boleto multi-columna.
 */
export interface MulticolumnColumn {
  id: string;
  numbers: number[];
  stars: number[];
  /** Indica si la columna tiene la cantidad mínima requerida para ser jugada */
  isComplete: boolean;
  /** Indica si la columna cumple todas las reglas (min/max) */
  isValid: boolean;
}

/**
 * Estado global de la sesión de juego multi-columna.
 */
export interface MulticolumnState {
  gameId: string;
  gameType: GameType;
  columns: MulticolumnColumn[];
  activeColumnIndex: number;
  /** Cantidad de columnas que se muestran/gestionan en el slider */
  visibleColumnsCount: number;
}

/**
 * Resumen de validación para el boleto completo.
 */
export interface MulticolumnSummary {
  totalColumns: number;
  completeColumns: number;
  totalBets: number;
  totalPrice: number;
  isValid: boolean;
}

/**
 * Acciones posibles sobre el estado multi-columna.
 */
export type MulticolumnAction =
  | { type: 'SET_ACTIVE_COLUMN'; index: number }
  | { type: 'UPDATE_COLUMN'; index: number; numbers: number[]; stars?: number[] }
  | { type: 'CLEAR_COLUMN'; index: number }
  | { type: 'CLEAR_ALL' }
  | { type: 'FILL_RANDOM_COLUMN'; index: number }
  | { type: 'FILL_RANDOM_ALL' }
  | { type: 'ADD_COLUMN' }
  | { type: 'REMOVE_COLUMN'; index: number };
