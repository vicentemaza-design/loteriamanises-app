import { useState, useEffect, useCallback } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { resultsMapper } from '@/services/api/mappers/results.mapper';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import type { ResultDto } from '@/services/api/contracts/results.contracts';

/**
 * useResults Hook
 * Custom hook to fetch and manage lottery results.
 * Abstracts the data source and provides loading/error states.
 */
export function useResults() {
  const [results, setResults] = useState<ResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (FEATURE_FLAGS.enableVerboseApiLogs) {
        console.log('[useResults] Fetching latest results...');
      }

      const client = await createApiClient();
      const dtos = await client.results.getLatest();
      
      // Transform DTOs to Domain Models
      const domainResults = resultsMapper.toDomainList(dtos);
      
      setResults(domainResults);
    } catch (err) {
      console.error('[useResults] Error fetching results:', err);
      setError('No se pudieron cargar los resultados. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    results,
    isLoading,
    error,
    refresh: fetchResults,
  };
}
