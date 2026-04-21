import { db } from '@/shared/config/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { CreateBetRequestDto, CreateBetResponseDto } from '../../contracts/play.contracts';

/**
 * Firebase Play Adapter
 * Implements atomic transactional purchase logic.
 */

export async function placeBetFirebase(dto: CreateBetRequestDto & { userId: string }): Promise<CreateBetResponseDto> {
  try {
    const userId = dto.userId;
    const userRef = doc(db, 'users', userId);
    const ticketsCollection = collection(db, 'tickets');
    const drawDates = dto.drawDates && dto.drawDates.length > 0 ? dto.drawDates : [dto.drawDate];
    const orderId = drawDates.length > 1 ? `firebase-order-${Date.now()}` : undefined;
    const ticketRefs = drawDates.map(() => doc(ticketsCollection));

    await runTransaction(db, async (transaction) => {
      // 1. Get current user profile for balance check
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error('El perfil de usuario no existe.');
      }

      const currentBalance = userSnap.data().balance || 0;
      if (currentBalance < dto.price) {
        throw new Error('Saldo insuficiente para realizar esta apuesta.');
      }

      // 2. Subtract balance and create ticket atomically
      transaction.update(userRef, {
        balance: currentBalance - dto.price
      });

      drawDates.forEach((drawDate, index) => {
        const ticketData = {
          userId: dto.userId,
          gameId: dto.gameId,
          gameType: dto.gameType,
          numbers: dto.numbers || [],
          stars: dto.stars || [],
          selections: dto.selections || null,
          systemId: dto.systemId || null,
          drawDate,
          status: 'pending',
          price: drawDates.length > 0 ? Number((dto.price / drawDates.length).toFixed(2)) : dto.price,
          betsCount: dto.betsCount,
          hasInsurance: dto.hasInsurance,
          isSubscription: dto.isSubscription,
          createdAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
          metadata: {
            ...(dto.metadata || {}),
            scheduleMode: dto.scheduleMode ?? 'next_draw',
            weeksCount: dto.weeksCount ?? 1,
            drawIndex: index,
          }
        };

        if (orderId) {
          Object.assign(ticketData, { orderId });
        }

        transaction.set(ticketRefs[index], ticketData);
      });
    });

    return { 
      success: true, 
      ticketId: ticketRefs[0]?.id 
    };

  } catch (error) {
    console.error('[Firebase Play Adapter] Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno al procesar el pago'
    };
  }
}
