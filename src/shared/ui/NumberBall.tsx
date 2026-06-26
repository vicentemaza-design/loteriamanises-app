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

export interface StarNumberBallProps extends React.HTMLAttributes<HTMLDivElement> {
  number: number;
  size?: NumberSize;
}

export const StarNumberBall = React.forwardRef<HTMLDivElement, StarNumberBallProps>(
  ({ number, size = 'md', className, ...rest }, ref) => {
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]';
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center shrink-0 select-none font-black text-amber-950',
          sizeClasses,
          className
        )}
        {...rest}
      >
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full fill-manises-gold stroke-amber-500/25 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]">
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
        </svg>
        <span className="relative z-10 font-black mb-[1.5px]">{number}</span>
      </div>
    );
  }
);
StarNumberBall.displayName = 'StarNumberBall';
