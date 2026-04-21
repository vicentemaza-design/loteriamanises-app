import { db } from '@/shared/config/firebase';
import { collection, query, where, orderBy, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { WalletMovementDto } from '../../contracts/wallet.contracts';

/**
 * Firebase Wallet Adapter
 * Implements atomic top-up and transactional history fetch.
 */

export async function getBalanceFirebase(userId: string): Promise<number> {
  const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
  if (userSnap.empty) return 0;
  return userSnap.docs[0].data().balance || 0;
}

export async function getMovementsFirebase(userId: string): Promise<WalletMovementDto[]> {
  const q = query(
    collection(db, 'movements'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as WalletMovementDto[];
}

export async function topUpFirebase(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  try {
    const userRef = doc(db, 'users', userId);
    const movementsCollection = collection(db, 'movements');
    const newMovementRef = doc(movementsCollection);

    let finalBalance = 0;

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('El perfil de usuario no existe.');

      const currentBalance = userSnap.data().balance || 0;
      finalBalance = currentBalance + amount;

      // 1. Update user balance
      transaction.update(userRef, { balance: finalBalance });

      // 2. Create the movement record
      transaction.set(newMovementRef, {
        userId,
        type: 'deposit',
        amount,
        description: 'Recarga de saldo',
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      });
    });

    return { success: true, newBalance: finalBalance };
  } catch (error) {
    console.error('[Firebase Wallet] Top up failed:', error);
    throw error;
  }
}
