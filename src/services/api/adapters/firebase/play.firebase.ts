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
    const newTicketRef = doc(ticketsCollection);

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

      // 2. Prepare the ticket data
      const ticketData = {
        userId: dto.userId,
        gameId: dto.gameId,
        gameType: dto.gameType,
        numbers: dto.numbers || [],
        stars: dto.stars || [],
        selections: dto.selections || null, // For Quiniela
        systemId: dto.systemId || null,     // For Reduced
        drawDate: dto.drawDate,
        status: 'pending',
        price: dto.price,
        betsCount: dto.betsCount,
        hasInsurance: dto.hasInsurance,
        isSubscription: dto.isSubscription,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
        metadata: dto.metadata || {}
      };

      // 3. Subtract balance and create ticket atomically
      transaction.update(userRef, {
        balance: currentBalance - dto.price
      });

      transaction.set(newTicketRef, ticketData);
    });

    return { 
      success: true, 
      ticketId: newTicketRef.id 
    };

  } catch (error) {
    console.error('[Firebase Play Adapter] Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno al procesar el pago'
    };
  }
}
