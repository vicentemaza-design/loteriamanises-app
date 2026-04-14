import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import type { GameType } from '@/shared/types/domain';

export interface PlaceBetParams {
  userId: string;
  gameId: string;
  gameType: GameType;
  numbers: number[];
  stars?: number[];
  drawDate: string;
  price: number;
  hasInsurance?: boolean;
  isSubscription?: boolean;
}

export interface PlaceBetResult {
  success: boolean;
  ticketId?: string;
  error?: string;
}

/**
 * Crea un ticket en Firestore y descuenta el saldo del usuario.
 * Desacoplado completamente de la vista (antes estaba inline en GamePlayPage).
 */
export async function placeBet(params: PlaceBetParams): Promise<PlaceBetResult> {
  try {
    const ticketRef = await addDoc(collection(db, 'tickets'), {
      userId: params.userId,
      gameId: params.gameId,
      gameType: params.gameType,
      numbers: params.numbers,
      stars: params.stars ?? [],
      drawDate: params.drawDate,
      status: 'pending',
      price: params.price,
      hasInsurance: params.hasInsurance ?? false,
      isSubscription: params.isSubscription ?? false,
      createdAt: new Date().toISOString(),
    });

    await updateDoc(doc(db, 'users', params.userId), {
      balance: increment(-params.price),
    });

    return { success: true, ticketId: ticketRef.id };
  } catch (error) {
    console.error('[play.service] Error placing bet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Genera una combinación aleatoria de números para un juego dado.
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
