import { useState, useCallback, useEffect } from 'react';
import type { LotteryGame } from '@/shared/types/domain';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { buildGameSelection } from '@/features/play/application/build-game-selection';
import type { QuickPickCombination } from '../contracts/quick-pick.contract';
import { toast } from 'sonner';

export function useQuickPick(game: LotteryGame, enabled: boolean = true) {
  const [count, setCount] = useState<number>(3);
  const [combinations, setCombinations] = useState<QuickPickCombination[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const generate = useCallback(() => {
    if (!enabled || !game.selectionRange?.numbers) {
      setCombinations([]);
      return;
    }

    setIsRegenerating(true);
    const newCombinations: QuickPickCombination[] = [];
    
    for (let i = 0; i < count; i++) {
      const random = generateRandomPlay(
        game.selectionRange.numbers.total,
        game.selectionRange.numbers.min,
        game.selectionRange.stars?.total ?? 0,
        game.selectionRange.stars?.min ?? 0
      );
      const selection = buildGameSelection({
        game,
        isNationalLottery: false,
        isQuiniela: false,
        mode: 'simple',
        selectedNumbers: random.numbers,
        selectedStars: random.stars,
        quinielaMatches: [],
        selectedReductionSystemId: '',
        selectedNationalNumber: null,
        selectedNationalDraw: { label: '' },
      });

      if (selection) {
        newCombinations.push({
          id: Math.random().toString(36).substring(2, 9),
          numbers: random.numbers,
          stars: random.stars,
          selection,
        });
      }
    }

    setCombinations(newCombinations);
    setTimeout(() => setIsRegenerating(false), 300);
  }, [game, count, enabled]);

  useEffect(() => {
    if (enabled) {
      generate();
    }
  }, [count, generate, enabled]);

  return {
    count,
    setCount,
    combinations,
    isRegenerating,
    regenerate: generate,
  };
}
