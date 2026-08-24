import { useState, useCallback, useEffect, useRef } from 'react';
import type { LotteryGame } from '@/shared/types/domain';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { buildGameSelection } from '@/features/play/application/build-game-selection';
import type { QuickPickCombination } from '../contracts/quick-pick.contract';

/** El reintegro de Primitiva va del 0 al 9, pero generateRandomPlay devuelve valores 1-indexados */
function normalizeStars(game: LotteryGame, stars: number[]): number[] {
  return game.type === 'primitiva' ? stars.map((v) => v - 1) : stars;
}

export function useQuickPick(game: LotteryGame, enabled: boolean = true) {
  const [count, setCount] = useState<number>(12);
  const [combinations, setCombinations] = useState<QuickPickCombination[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const regeneratingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildSingleCombo = useCallback((): QuickPickCombination | null => {
    if (!enabled || !game.selectionRange?.numbers) return null;
    const raw = generateRandomPlay(
      game.selectionRange.numbers.total,
      game.selectionRange.numbers.min,
      game.selectionRange.stars?.total ?? 0,
      game.selectionRange.stars?.min ?? 0
    );
    const stars = normalizeStars(game, raw.stars);
    const selection = buildGameSelection({
      game,
      isNationalLottery: false,
      isQuiniela: false,
      mode: 'simple',
      selectedNumbers: raw.numbers,
      selectedStars: stars,
      quinielaMatches: [],
      selectedReductionSystemId: '',
      selectedNationalNumber: null,
      selectedNationalDraw: { label: '' },
    });
    if (!selection) return null;
    return {
      id: Math.random().toString(36).substring(2, 9),
      numbers: raw.numbers,
      stars,
      selection,
    };
  }, [game, enabled]);

  const generate = useCallback(() => {
    if (!enabled || !game.selectionRange?.numbers) {
      setCombinations([]);
      return;
    }
    setIsRegenerating(true);
    const newCombinations: QuickPickCombination[] = [];
    for (let i = 0; i < count; i++) {
      const combo = buildSingleCombo();
      if (combo) newCombinations.push(combo);
    }
    setCombinations(newCombinations);
    // Evita timers duplicados si generate() se vuelve a llamar (regenerar
    // manual) antes de que termine el anterior.
    if (regeneratingTimeoutRef.current) clearTimeout(regeneratingTimeoutRef.current);
    regeneratingTimeoutRef.current = setTimeout(() => {
      regeneratingTimeoutRef.current = null;
      setIsRegenerating(false);
    }, 300);
  }, [game, count, enabled, buildSingleCombo]);

  const regenerateAt = useCallback((index: number) => {
    const combo = buildSingleCombo();
    if (!combo) return;
    setCombinations((prev: QuickPickCombination[]) => prev.map((c: QuickPickCombination, i: number) => i === index ? combo : c));
  }, [buildSingleCombo]);

  useEffect(() => {
    if (enabled) generate();
  }, [count, generate, enabled]);

  // Limpia el timer pendiente al desmontar para no llamar setState tras unmount.
  useEffect(() => {
    return () => {
      if (regeneratingTimeoutRef.current) clearTimeout(regeneratingTimeoutRef.current);
    };
  }, []);

  return {
    count,
    setCount,
    combinations,
    isRegenerating,
    regenerate: generate,
    regenerateAt,
  };
}
