import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import type { Ticket } from '@/shared/types/domain';

export type TicketStatus = Ticket['status'];

const config: Record<TicketStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  won: {
    label: '¡Ganador!',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse',
  },
  lost: {
    label: 'No premiado',
    className: 'bg-gray-50 text-gray-400 border-gray-200',
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TicketStatus;
}

/**
 * Badge de estado de un ticket — Pendiente / Ganador / No premiado.
 * Utiliza el token de radio circular (pill) del sistema de diseño Manises.
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const { label, className: variantClass } = config[status];
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-wider border select-none',
          variantClass,
          className
        )}
        {...props}
      >
        {label}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
