import { useState, useEffect, useCallback } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { walletMapper } from '@/services/api/mappers/wallet.mapper';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { WalletMovement } from '@/shared/types/domain';
import { FEATURE_FLAGS } from '@/config/featureFlags';

/**
 * useMovements Hook
 * Fetches and manages the transactional history of the user's wallet.
 */
export function useMovements() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<WalletMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!user && !FEATURE_FLAGS.enableDemoMode) {
      setMovements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = await createApiClient();
      const userId = user?.uid || 'demo-user';
      const dtos = await client.wallet.getMovements(userId);
      
      const domainMovements = walletMapper.toDomainList(dtos);
      setMovements(domainMovements);
    } catch (err) {
      console.error('[useMovements] Error:', err);
      setError('No se pudo cargar el historial de movimientos.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    isLoading,
    error,
    refresh: fetchMovements
  };
}
