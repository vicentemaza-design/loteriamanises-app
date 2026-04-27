import type { 
  MulticolumnState, 
  MulticolumnDraftIntent 
} from '../contracts/multicolumn-play.contract';

/**
 * Transforma el estado actual del boleto multi-columna en un contrato de intención.
 * Solo incluye las columnas que están completas y son válidas.
 */
export function buildMulticolumnDraftIntent(
  state: MulticolumnState,
  drawDates: string[]
): MulticolumnDraftIntent {
  const validColumns = state.columns
    .filter((col) => col.isComplete && col.isValid)
    .map((col) => ({
      numbers: [...col.numbers],
      stars: [...col.stars],
    }));

  return {
    gameId: state.gameId,
    gameType: state.gameType,
    drawDates: [...drawDates],
    columns: validColumns,
  };
}
