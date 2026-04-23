import { useMemo } from 'react';
import { usePlaySession } from './usePlaySession';
import type { PlaySessionSummary } from '../types/session.types';

export function usePlaySessionSummary(): PlaySessionSummary {
  const { drafts, status } = usePlaySession();

  return useMemo(() => {
    const validDrafts = drafts.filter((draft) => draft.status === 'valid' || draft.status === 'editing');
    const staleCount = drafts.filter((draft) => draft.status === 'stale').length;
    const unavailableCount = drafts.filter((draft) => draft.status === 'unavailable').length;

    return {
      draftCount: drafts.length,
      validCount: validDrafts.length,
      staleCount,
      unavailableCount,
      totalAmount: validDrafts.reduce((sum, draft) => sum + draft.totalPrice, 0),
      canConfirm: validDrafts.length > 0 && status !== 'confirming',
    };
  }, [drafts, status]);
}
