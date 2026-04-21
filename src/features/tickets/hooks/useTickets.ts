import { useState, useEffect, useCallback } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { ticketsMapper } from '@/services/api/mappers/tickets.mapper';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Ticket } from '@/shared/types/domain';
import { FEATURE_FLAGS } from '@/config/featureFlags';

/**
 * useTickets Hook
 * Fetches and manages user lottery tickets.
 * Handles loading, error, and domain mapping.
 */
export function useTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user && !FEATURE_FLAGS.enableDemoMode) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (FEATURE_FLAGS.enableVerboseApiLogs) {
        console.log(`[useTickets] Fetching tickets for user: ${user?.uid || 'demo-user'}`);
      }

      const client = await createApiClient();
      const userId = user?.uid || 'demo-user';
      const dtos = await client.tickets.getUserTickets(userId);
      
      // Transform DTOs to Domain Models
      const domainTickets = ticketsMapper.toDomainList(dtos);
      
      setTickets(domainTickets);
    } catch (err) {
      console.error('[useTickets] Error fetching tickets:', err);
      setError('No se pudieron cargar tus jugadas. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    error,
    refresh: fetchTickets,
  };
}
