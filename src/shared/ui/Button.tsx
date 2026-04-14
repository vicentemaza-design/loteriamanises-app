import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground shadow-manises hover:brightness-[1.03] active:scale-[0.98]',
  destructive: 'bg-destructive text-white shadow-manises hover:brightness-[1.03] active:scale-[0.98]',
  outline: 'border border-border bg-white/5 text-foreground shadow-inner-soft hover:bg-accent/10 active:scale-[0.98]',
  ghost: 'hover:bg-accent/10 hover:shadow-inner-soft transition-colors',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-11 px-6 py-2.5',
  sm: 'h-9 px-4',
  lg: 'h-12 px-10 text-base',
  icon: 'h-11 w-11',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Botón base con soporte para todas las variantes del sistema de diseño Manises.
 * Utiliza tokens de radio y sombra definidos en index.css.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
