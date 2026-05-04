import { useState, useCallback, useEffect } from 'react';
import type { LotteryGame } from '@/shared/types/domain';
import { generateWithPreset } from '@/features/play/services/play.service';
import { buildGameSelection } from '@/features/play/application/build-game-selection';
import type { QuickPickCombination, GenerationPreset } from '../contracts/quick-pick.contract';

export function useQuickPick(game: LotteryGame, enabled: boolean = true) {
  const [count, setCount] = useState<number>(3);
  const [generationPreset, setGenerationPreset] = useState<GenerationPreset>('random');
  const [combinations, setCombinations] = useState<QuickPickCombination[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const buildSingleCombo = useCallback((): QuickPickCombination | null => {
    if (!enabled || !game.selectionRange?.numbers) return null;
    const raw = generateWithPreset(
      game.selectionRange.numbers.total,
      game.selectionRange.numbers.min,
      game.selectionRange.stars?.total ?? 0,
      game.selectionRange.stars?.min ?? 0,
      generationPreset
    );
    const selection = buildGameSelection({
      game,
      isNationalLottery: false,
      isQuiniela: false,
      mode: 'simple',
      selectedNumbers: raw.numbers,
      selectedStars: raw.stars,
      quinielaMatches: [],
      selectedReductionSystemId: '',
      selectedNationalNumber: null,
      selectedNationalDraw: { label: '' },
    });
    if (!selection) return null;
    return {
      id: Math.random().toString(36).substring(2, 9),
      numbers: raw.numbers,
      stars: raw.stars,
      selection,
    };
  }, [game, enabled, generationPreset]);

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
    setTimeout(() => setIsRegenerating(false), 300);
  }, [game, count, enabled, buildSingleCombo]);

  const regenerateAt = useCallback((index: number) => {
    const combo = buildSingleCombo();
    if (!combo) return;
    setCombinations((prev: QuickPickCombination[]) => prev.map((c: QuickPickCombination, i: number) => i === index ? combo : c));
  }, [buildSingleCombo]);

  useEffect(() => {
    if (enabled) generate();
  }, [count, generate, enabled]);

  return {
    count,
    setCount,
    combinations,
    isRegenerating,
    regenerate: generate,
    generationPreset,
    setGenerationPreset,
    regenerateAt,
  };
}
