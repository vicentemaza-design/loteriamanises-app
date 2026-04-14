import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type NumberVariant = 'default' | 'gold' | 'complementario' | 'reintegro' | 'empty';
export type NumberSize    = 'sm' | 'md';

export interface NumberBallProps extends React.HTMLAttributes<HTMLDivElement> {
  number: number;
  variant?: NumberVariant;
  size?: NumberSize;
}

const variantClasses: Record<NumberVariant, string> = {
  default:        'bg-white border border-gray-100 text-manises-blue shadow-inner-soft',
  gold:           'bg-manises-gold text-manises-blue shadow-gold border border-manises-gold-dark/20',
  complementario: 'bg-blue-50 text-blue-700 border border-blue-100',
  reintegro:      'bg-red-50 text-red-600 border border-red-100',
  empty:          'bg-gray-50 border-2 border-dashed border-gray-200 text-gray-300',
};

const sizeClasses: Record<NumberSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
};

/**
 * Bola de número de lotería — reutilizable en Results, Tickets y GamePlay.
 * Utiliza tokens de radio circular (pill) y sombras premium del sistema de diseño Manises.
 * Soporta todas las variantes de sorteos nacionales y europeos.
 */
export const NumberBall = React.forwardRef<HTMLDivElement, NumberBallProps>(
  ({ number, variant = 'default', size = 'md', className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-pill flex items-center justify-center font-black shrink-0 transition-all select-none',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...rest}
  >
    {variant !== 'empty' ? number : ''}
  </div>
));
NumberBall.displayName = 'NumberBall';

export interface NumberBallLabeledProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  number: number;
  variant?: NumberVariant;
  size?: NumberSize;
}

/**
 * NumberBall con etiqueta encima (C = complementario, R = reintegro)
 * Mantiene la consistencia tipográfica del sistema de diseño.
 */
export const NumberBallLabeled = React.forwardRef<HTMLDivElement, NumberBallLabeledProps>(
  ({ label, number, variant = 'complementario', size = 'md', className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("flex flex-col items-center gap-1", className)}
        {...props}
      >
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">
          {label}
        </span>
        <NumberBall number={number} variant={variant} size={size} />
      </div>
    );
  }
);
NumberBallLabeled.displayName = 'NumberBallLabeled';
