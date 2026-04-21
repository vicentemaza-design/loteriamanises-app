import { db } from '@/shared/config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { TicketDto } from '../../contracts/tickets.contracts';

/**
 * Firebase Tickets Adapter
 */

export async function getUserTicketsFirebase(userId: string): Promise<TicketDto[]> {
  try {
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as TicketDto[];
  } catch (error) {
    console.error('[Firebase] Error fetching user tickets:', error);
    throw error;
  }
}

export async function getTicketByIdFirebase(id: string): Promise<TicketDto | null> {
  // Implementation for fetching a single ticket if needed
  return null;
}
