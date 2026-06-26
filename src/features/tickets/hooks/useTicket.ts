import { useState, useEffect } from 'react';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { ticketsMapper } from '@/services/api/mappers/tickets.mapper';
import type { Ticket } from '@/shared/types/domain';

export function useTicket(ticketId: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    createApiClient()
      .then((client) => client.tickets.getTicketById(ticketId))
      .then((dto) => {
        if (cancelled) return;
        setTicket(dto ? ticketsMapper.toDomain(dto) : null);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la jugada.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [ticketId]);

  return { ticket, isLoading, error };
}
