import { useState, useCallback } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { playMapper } from '@/services/api/mappers/play.mapper';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FEATURE_FLAGS } from '@/config/featureFlags';

/**
 * usePlay Hook
 * Manages the transactional lifecycle of a bet/purchase.
 * Handles loading, success, and error states.
 */
export function usePlay() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Places a bet using the modular API architecture.
   * @param rawParams Raw selection and game data from the view.
   */
  const placeBet = useCallback(async (rawParams: any) => {
    if (!user && !FEATURE_FLAGS.enableDemoMode) {
      setError('Debes iniciar sesión para realizar una apuesta.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      if (FEATURE_FLAGS.enableVerboseApiLogs) {
        console.log('[usePlay] Preparing bet submission...', rawParams);
      }

      // 1. Standardize the payload using the mapper
      const dto = playMapper.toCreateBetDto(rawParams);
      
      // 2. Get the API Client and place the bet
      const client = await createApiClient();
      
      // We pass the userId explicitly for the Firebase transaction if needed
      // Most adapters will extract it or use the authenticated context
      const result = await client.play.placeBet({ 
        ...dto, 
        userId: user?.uid || 'demo-user' 
      });

      if (result.success) {
        setShowSuccess(true);
      } else {
        setError(result.error || 'Error al procesar la apuesta.');
      }
    } catch (err) {
      console.error('[usePlay] Unexpected error:', err);
      setError('Ocurrió un problema inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setShowSuccess(false);
    setError(null);
  }, []);

  return {
    placeBet,
    reset,
    isSubmitting,
    showSuccess,
    error,
  };
}
