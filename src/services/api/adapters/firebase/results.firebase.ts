import { db } from '@/shared/config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { ResultDto } from '../../contracts/results.contracts';

/**
 * Firebase Results Adapter
 * Implementation for a real Firebase datasource with defensive error handling.
 */

export async function getLatestResultsFirebase(): Promise<ResultDto[]> {
  try {
    const q = query(
      collection(db, 'results'), // Default collection name as per plan
      orderBy('date', 'desc'),
      limit(20)
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as ResultDto[];
  } catch (error) {
    console.warn('[Firebase Results Adapter] Could not fetch results from collection "results". Falling back to empty array.', error);
    return [];
  }
}

export async function getResultByIdFirebase(id: string): Promise<ResultDto | null> {
  // Defensive stub for specific ID fetch
  return null;
}
