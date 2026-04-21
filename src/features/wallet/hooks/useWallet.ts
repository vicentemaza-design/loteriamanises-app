import { useState, useCallback } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FEATURE_FLAGS } from '@/config/featureFlags';

/**
 * useWallet Hook
 * Manages balance fetching and top-up actions.
 */
export function useWallet() {
  const { user, profile, refreshProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Top up the user wallet balance.
   */
  const topUp = useCallback(async (amount: number) => {
    if (!user) {
      setError('Debes iniciar sesión para recargar saldo.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const client = await createApiClient();
      const result = await client.wallet.topUp(user.uid, amount);

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
  }, [user, refreshProfile]);

  return {
    balance: profile?.balance ?? 0,
    topUp,
    isProcessing,
    error,
    refresh: refreshProfile
  };
}
