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
