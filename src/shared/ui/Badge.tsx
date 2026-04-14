import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground shadow-sm',
  destructive: 'border-transparent bg-destructive text-white',
  outline: 'text-foreground border-border bg-white/5 shadow-inner-soft',
};

export interface BadgeProps extends React.ComponentPropsWithoutRef<'div'> {
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Badge base para indicadores de estado o etiquetas.
 * Utiliza tokens de radio circular (pill).
 */
export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors select-none',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
