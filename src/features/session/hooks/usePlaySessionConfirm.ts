import { useState } from 'react';
import { toast } from 'sonner';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from './usePlaySession';
import { usePlaySessionSummary } from './usePlaySessionSummary';
import type { PlayDraft } from '../types/session.types';

function mapDraftToDto(draft: PlayDraft) {
  const base = {
    draftId: draft.id,
    gameId: draft.gameId,
    gameType: draft.gameType,
    mode: draft.mode,
    price: draft.totalPrice,
    drawDate: draft.drawDate,
    betsCount: draft.betsCount,
    hasInsurance: draft.hasInsurance,
    isSubscription: draft.isSubscription,
    quantity: draft.quantity,
    unitPrice: draft.unitPrice,
    totalPrice: draft.totalPrice,
    metadata: draft.metadata ?? {},
  };

  switch (draft.selection.type) {
    case 'national':
      return {
        ...base,
        numbers: draft.selection.number.split('').map(Number),
        metadata: {
          ...base.metadata,
          nationalNumber: draft.selection.number,
          nationalDrawLabel: draft.selection.drawLabel,
          nationalQuantity: draft.quantity,
        },
      };
    case 'quiniela':
      return {
        ...base,
        selections: draft.selection.matches.map((match) => ({ id: match.id, val: match.value })),
        systemId: draft.selection.systemId,
      };
    case 'euromillones':
      return {
        ...base,
        numbers: draft.selection.numbers,
        stars: draft.selection.stars,
      };
    case 'gordo':
      return {
        ...base,
        numbers: draft.selection.numbers,
        stars: [draft.selection.key],
      };
    case 'eurodreams':
      return {
        ...base,
        numbers: draft.selection.numbers,
        stars: [draft.selection.dream],
      };
    case 'primitiva':
    case 'bonoloto':
      return {
        ...base,
        numbers: draft.selection.numbers,
      };
    default:
      return base;
  }
}

export function usePlaySessionConfirm() {
  const { user } = useAuth();
  const { session, drafts, closeReview, markConfirming, resolveConfirmFailure, resolveConfirmSuccess } = usePlaySession();
  const summary = usePlaySessionSummary();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirm = async () => {
    const validDrafts = drafts.filter((draft) => draft.status === 'valid' || draft.status === 'editing');
    if (validDrafts.length === 0) {
      resolveConfirmFailure('No hay jugadas válidas para confirmar.');
      return false;
    }

    try {
      setIsSubmitting(true);
      markConfirming();

      const client = await createApiClient();
      const response = await client.play.submitPlaySession({
        sessionId: session.id,
        userId: user?.uid || 'demo-user',
        paymentMethod: 'wallet',
        totalAmount: summary.totalAmount,
        items: validDrafts.map(mapDraftToDto),
      });

      if (!response.success) {
        resolveConfirmFailure(response.error || 'No se pudo confirmar la sesión.');
        return false;
      }

      resolveConfirmSuccess(response.confirmedDraftIds ?? validDrafts.map((draft) => draft.id));
      closeReview();
      toast.success(`Jugadas confirmadas: ${validDrafts.length}`);
      return true;
    } catch (error) {
      console.error('[usePlaySessionConfirm] Unexpected error:', error);
      resolveConfirmFailure('Ocurrió un problema inesperado al confirmar tus jugadas.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    confirm,
    isSubmitting,
  };
}
