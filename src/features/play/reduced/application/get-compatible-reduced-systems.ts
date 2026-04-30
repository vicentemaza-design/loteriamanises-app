import type { LotteryGame } from '@/shared/types/domain';
import { getReductionSystemsForMode } from '../../lib/play-matrix';
import { getReducedBetsCount } from '../../lib/reduced-tables';
import { calculateTotalPrice } from '../../lib/bet-calculator';
import type { ReducedSystemUI } from '../contracts/reduced-play.contract';

interface GetCompatibleSystemsOptions {
  game: LotteryGame;
  numbersCount: number;
}

export function getCompatibleReducedSystems({
  game,
  numbersCount,
}: GetCompatibleSystemsOptions): ReducedSystemUI[] {
  const allSystems = getReductionSystemsForMode(game.id, 'reduced');
  
  return allSystems.map((system) => {
    const betsCount = getReducedBetsCount(game.id, system.id, numbersCount);
    const isCompatible = betsCount !== null;
    
    return {
      ...system,
      isCompatible,
      betsCount: betsCount ?? 0,
      totalPrice: calculateTotalPrice(game.price ?? 0, betsCount ?? 0, false),
    };
  }).filter(s => s.isCompatible);
}
