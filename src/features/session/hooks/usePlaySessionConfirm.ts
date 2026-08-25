import { useState } from 'react';
import { toast } from 'sonner';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { getConnectivityErrorMessage } from '@/services/api/adapters/http/http.client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from './usePlaySession';
import { usePlaySessionSummary } from './usePlaySessionSummary';
import { notifyPurchaseConfirmed } from '../lib/cart-toast';
import type { GameType, SelaeGameCode } from '@/shared/types/domain';
import type { PlayDraft } from '../types/session.types';
import { getFunctionalUserId } from '@/shared/lib/getFunctionalUserId';

const GAME_TYPE_TO_SELAE: Record<GameType, SelaeGameCode> = {
  'primitiva':       'PRIM',
  'bonoloto':        'BONO',
  'euromillones':    'EURO',
  'gordo':           'ELGR',
  'loteria-nacional':'LNAC',
  'navidad':         'LNNA',
  'nino':            'LNNI',
  'eurodreams':      'EDRE',
  'quiniela':        'QUNI',
};

function mapDraftToDto(draft: PlayDraft) {
  const base = {
    draftId: draft.id,
    gameId: draft.gameId,
    gameType: draft.gameType,
    selaeGameCode: GAME_TYPE_TO_SELAE[draft.gameType],
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
        numbers: [parseInt(draft.selection.number, 10)],
        serie: (draft.metadata?.nationalSerie as string | undefined),
        fraccion: (draft.metadata?.nationalFraccion as string | undefined),
        metadata: {
          ...base.metadata,
          nationalNumber: draft.selection.number,
          nationalDrawLabel: draft.selection.drawLabel,
          nationalQuantity: draft.quantity,
          nationalSerie: draft.metadata?.nationalSerie,
          nationalFraccion: draft.metadata?.nationalFraccion,
          deliveryMode: draft.metadata?.deliveryMode,
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
      return {
        ...base,
        numbers: draft.selection.numbers,
        stars: [draft.selection.reintegro],
      };
    case 'bonoloto':
      return {
        ...base,
        numbers: draft.selection.numbers,
      };
    default:
      return base;
  }
}

interface UsePlaySessionConfirmOptions {
  /** Limita la confirmación a un subconjunto de la sesión */
  draftFilter?: 'games' | 'lottery';
}

export function usePlaySessionConfirm({ draftFilter }: UsePlaySessionConfirmOptions = {}) {
  const { user, isDemo, refreshProfile } = useAuth();
  const { session, drafts, closeReview, markConfirming, resolveConfirmFailure, resolveConfirmPartial, resolveConfirmSuccess } = usePlaySession();
  const summary = usePlaySessionSummary();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // `shippingCost`: coste de envío del PEDIDO (Lotería Nacional, Mensajería)
  // — lo calcula y lo conoce solo el carrito que confirma (LotteryCartPanel),
  // nunca los borradores individuales, así que se pasa aquí explícitamente
  // en vez de intentar derivarlo de cada draft. Se cobra una única vez por
  // pedido, nunca por línea/décimo.
  const confirm = async (options?: { shippingCost?: number }) => {
    if (!user && !isDemo) {
      return { ok: false, needsAuth: true };
    }

    const shippingCost = options?.shippingCost ?? 0;

    const scopedDrafts = draftFilter === 'games'
      ? drafts.filter((d) => d.selection.type !== 'national')
      : draftFilter === 'lottery'
        ? drafts.filter((d) => d.selection.type === 'national')
        : drafts;

    const validDrafts = scopedDrafts.filter((draft) => draft.status === 'valid' || draft.status === 'editing');
    if (validDrafts.length === 0) {
      resolveConfirmFailure('No hay jugadas válidas para confirmar.');
      return { ok: false, needsAuth: false };
    }

    try {
      setIsSubmitting(true);
      markConfirming();

      const client = await createApiClient();
      const response = await client.play.submitPlaySession({
        sessionId: session.id,
        userId: getFunctionalUserId(user),
        paymentMethod: 'wallet',
        totalAmount: summary.totalAmount + shippingCost,
        shippingCost,
        items: validDrafts.map(mapDraftToDto),
      });

      if (!response.success) {
        resolveConfirmFailure(response.error || 'No se pudo confirmar la sesión.');
        return { ok: false, needsAuth: false };
      }

      if (response.failures && response.failures.length > 0) {
        const failureMessage = response.failures.length === 1
          ? response.failures[0].reason
          : `${response.failures.length} jugadas no se pudieron confirmar.`;
        resolveConfirmPartial(response.confirmedDraftIds ?? [], failureMessage);
        toast.error(failureMessage);
        // Confirmación parcial: algunas jugadas sí llegaron a cobrarse — el
        // saldo mostrado debe reflejarlo de inmediato (mismo mecanismo que
        // usa TopUpModal/useWallet tras una recarga real).
        await refreshProfile();
        return { ok: false, needsAuth: false };
      }

      resolveConfirmSuccess(response.confirmedDraftIds ?? validDrafts.map((draft) => draft.id));
      closeReview();
      notifyPurchaseConfirmed(validDrafts.length);
      // El saldo se descuenta en el propio backend/mock al confirmar el
      // pedido — refrescamos aquí el mismo `profile.balance` que usa el
      // resto de la app (AuthProvider.refreshProfile), sin crear una
      // segunda fuente de verdad del saldo.
      await refreshProfile();
      return { ok: true, needsAuth: false };
    } catch (error) {
      console.error('[usePlaySessionConfirm] Unexpected error:', error);
      resolveConfirmFailure(getConnectivityErrorMessage(error) ?? 'Ocurrió un problema inesperado al confirmar tus jugadas.');
      return { ok: false, needsAuth: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    confirm,
    isSubmitting,
  };
}
