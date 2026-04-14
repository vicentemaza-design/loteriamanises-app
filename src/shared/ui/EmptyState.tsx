import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Estado vacío para listas sin contenido (Resultados, Tickets, etc.).
 * Utiliza tokens de radio 2xl y el sistema de elevación Manises.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-muted surface-neo-soft',
          className
        )}
        {...props}
      >
        <div className="p-4 bg-muted/30 rounded-full mb-4 text-muted-foreground">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-manises-blue mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-[240px]">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="outline" size="sm">
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
