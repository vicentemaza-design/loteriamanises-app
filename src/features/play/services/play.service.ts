import { createApiClient } from '@/services/api/factory/createApiClient';
import type { CreateBetRequestDto, CreateBetResponseDto } from '@/services/api/contracts/play.contracts';

export type PlaceBetParams = CreateBetRequestDto & { userId: string };
export type PlaceBetResult = CreateBetResponseDto;

/**
 * @deprecated Use usePlay() hook or createApiClient().play.placeBet() instead.
 * Provided for backward compatibility during migration.
 */
export async function placeBet(params: PlaceBetParams): Promise<PlaceBetResult> {
  console.warn('[DEPRECATED] placeBet in play.service.ts is deprecated. Use the modular API.');
  const client = await createApiClient();
  return client.play.placeBet(params);
}

/**
 * Genera una combinación aleatoria de números para un juego dado.
 * (Keep this utility here for now as it doesn't depend on persistence)
 */
export function generateRandomPlay(
  totalNumbers: number,
  pickCount: number,
  totalStars: number,
  starCount: number
): { numbers: number[]; stars: number[] } {
  const pickFrom = (total: number, count: number): number[] => {
    const pool = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count).sort((a, b) => a - b);
  };

  return {
    numbers: pickFrom(totalNumbers, pickCount),
    stars: starCount > 0 ? pickFrom(totalStars, starCount) : [],
  };
}

export type GenerationPreset = 'random' | 'odd' | 'even';

export function generateWithPreset(
  totalNumbers: number,
  pickCount: number,
  totalStars: number,
  starCount: number,
  preset: GenerationPreset
): { numbers: number[]; stars: number[] } {
  const pickFrom = (pool: number[], count: number): number[] => {
    const arr = [...pool];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count).sort((a, b) => a - b);
  };

  const fullPool = Array.from({ length: totalNumbers }, (_, i) => i + 1);

  let numbers: number[];
  if (preset === 'odd') {
    const oddPool = fullPool.filter(n => n % 2 !== 0);
    numbers = oddPool.length >= pickCount ? pickFrom(oddPool, pickCount) : pickFrom(fullPool, pickCount);
  } else if (preset === 'even') {
    const evenPool = fullPool.filter(n => n % 2 === 0);
    numbers = evenPool.length >= pickCount ? pickFrom(evenPool, pickCount) : pickFrom(fullPool, pickCount);
  } else {
    numbers = pickFrom(fullPool, pickCount);
  }

  const starPool = Array.from({ length: totalStars }, (_, i) => i + 1);
  const stars = starCount > 0 ? pickFrom(starPool, starCount) : [];
  return { numbers, stars };
}
