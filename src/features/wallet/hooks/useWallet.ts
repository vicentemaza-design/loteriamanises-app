import { useState, useCallback } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { RUNTIME_CONFIG } from '@/config/runtime';
import { getFunctionalUserId } from '@/shared/lib/getFunctionalUserId';

/**
 * useWallet Hook
 * Manages balance fetching and top-up actions.
 */
export function useWallet() {
  const { user, profile, isDemo, refreshProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Top up the user wallet balance.
   */
  const topUp = useCallback(async (amount: number) => {
    // `isDemo` es un flag 100% cliente (sessionStorage) — nunca es prueba de
    // autorización por sí solo. Sin usuario real de Firebase, solo se acepta
    // como identidad válida cuando el adapter activo es el mock: ahí "recargar"
    // no escribe nada real, es puro estado local. Si el proveedor activo es
    // firebase/http, isDemo NUNCA sustituye a un usuario real — de lo
    // contrario un simple `sessionStorage.setItem('manises_demo_mode','1')`
    // en cualquier deploy podría alcanzar una escritura real como 'demo-user'
    // (ver topUpFirebase, que sí es una transacción real, a diferencia del
    // stub de submitPlaySessionFirebase). Mismo criterio de "identidad
    // demo únicamente válida en mock" que ya aplica implícitamente al resto
    // del flujo de compra vía el propio mock adapter.
    const isMockProvider = RUNTIME_CONFIG.apiProvider === 'mock';
    if (!user && !(isDemo && isMockProvider)) {
      setError('Debes iniciar sesión para recargar saldo.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const client = await createApiClient();
      const result = await client.wallet.topUp(getFunctionalUserId(user), amount);

      if (result.success) {
        // Refresh the global auth profile to update balance across the app
        await refreshProfile();
        return { success: true, newBalance: result.newBalance };
      } else {
        setError('No se pudo procesar la recarga.');
        return { success: false };
      }
    } catch (err) {
      console.error('[useWallet] Top up error:', err);
      setError('Error de comunicación con el servicio de pagos.');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [user, isDemo, refreshProfile]);

  return {
    balance: profile?.balance ?? 0,
    topUp,
    isProcessing,
    error,
    refresh: refreshProfile
  };
}
