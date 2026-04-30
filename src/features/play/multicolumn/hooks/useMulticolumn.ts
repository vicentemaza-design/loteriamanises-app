import { useState, useMemo, useCallback } from 'react';
import type { LotteryGame } from '@/shared/types/domain';
import type { MulticolumnState, MulticolumnColumn } from '../contracts/multicolumn-play.contract';
import { createMulticolumnState, createEmptyColumn } from '../application/create-multicolumn-state';
import { updateMulticolumnColumn } from '../application/update-multicolumn-column';
import { buildMulticolumnSummary } from '../application/build-multicolumn-summary';
import { generateRandomPlay } from '@/features/play/services/play.service';

/**
 * Hook para gestionar el estado de un boleto multi-columna.
 * Centraliza la lógica de navegación entre columnas, validación y generación aleatoria.
 */
export function useMulticolumn(
  game: LotteryGame, 
  initialColumnsCount: number = 8,
  drawsCount: number = 1
) {
  const [state, setState] = useState<MulticolumnState>(() => 
    createMulticolumnState(game, initialColumnsCount)
  );

  /** Resumen calculado del boleto (apuestas, precio, validez) */
  const summary = useMemo(
    () => buildMulticolumnSummary(state, game, drawsCount), 
    [state, game, drawsCount]
  );

  /** Cambia la columna activa en el slider/editor */
  const setActiveColumn = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      activeColumnIndex: Math.max(0, Math.min(index, prev.columns.length - 1)),
    }));
  }, []);

  /** Actualiza los números/estrellas de la columna activa */
  const updateActiveColumn = useCallback((numbers: number[], stars: number[] = []) => {
    setState((prev) => {
      const nextColumns = [...prev.columns];
      const activeIdx = prev.activeColumnIndex;
      
      nextColumns[activeIdx] = updateMulticolumnColumn(
        nextColumns[activeIdx],
        game,
        numbers,
        stars
      );

      return { ...prev, columns: nextColumns };
    });
  }, [game]);

  /** Limpia la selección de la columna activa */
  const clearActiveColumn = useCallback(() => {
    updateActiveColumn([], []);
  }, [updateActiveColumn]);

  /** Limpia todas las columnas del boleto */
  const clearAllColumns = useCallback(() => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map(() => createEmptyColumn()),
    }));
  }, []);

  /** Rellena la columna activa con una jugada aleatoria */
  const randomizeActiveColumn = useCallback(() => {
    const range = game.selectionRange;
    if (!range) return;

    const { numbers, stars } = generateRandomPlay(
      range.numbers?.total ?? 49,
      range.numbers?.min ?? 6,
      range.stars?.total ?? 0,
      range.stars?.min ?? 0
    );

    updateActiveColumn(numbers, stars);
  }, [game, updateActiveColumn]);

  /** Rellena todas las columnas visibles con jugadas aleatorias */
  const randomizeAllColumns = useCallback(() => {
    const range = game.selectionRange;
    if (!range) return;

    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        const { numbers, stars } = generateRandomPlay(
          range.numbers?.total ?? 49,
          range.numbers?.min ?? 6,
          range.stars?.total ?? 0,
          range.stars?.min ?? 0
        );
        return updateMulticolumnColumn(col, game, numbers, stars);
      }),
    }));
  }, [game]);

  /** Añade una nueva columna al final del boleto */
  const addColumn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, createEmptyColumn()],
      visibleColumnsCount: prev.visibleColumnsCount + 1,
    }));
  }, []);

  /** Elimina la columna en el índice dado. No actúa si solo queda 1 columna. */
  const removeColumn = useCallback((index: number) => {
    setState((prev) => {
      if (prev.columns.length <= 1) return prev;
      const nextColumns = prev.columns.filter((_, i) => i !== index);
      const nextActive = Math.min(prev.activeColumnIndex, nextColumns.length - 1);
      return {
        ...prev,
        columns: nextColumns,
        activeColumnIndex: nextActive,
        visibleColumnsCount: prev.visibleColumnsCount - 1,
      };
    });
  }, []);

  return {
    state,
    summary,
    setActiveColumn,
    updateActiveColumn,
    clearActiveColumn,
    clearAllColumns,
    randomizeActiveColumn,
    randomizeAllColumns,
    addColumn,
    removeColumn,
  };
}
