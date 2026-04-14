import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import { GameIcon } from '@/shared/ui/GameIcon';

export interface GameBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  game: LotteryGame;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-9 h-9 text-base rounded-xl',
  md: 'w-12 h-12 text-xl rounded-2xl',
  lg: 'w-16 h-16 text-2xl rounded-[1.25rem]',
};

/**
 * Badge visual de un juego con color e icono propio.
 * Componente de dominio reutilizable en catálogo, tickets, resultados.
 * Cumple con los estándares de diseño Manises y soporta atributos HTML nativos.
 */
export const GameBadge = React.forwardRef<HTMLDivElement, GameBadgeProps>(
  ({ game, size = 'md', className, style, ...props }, ref) => {
    const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7';

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center text-white font-black shadow-md shrink-0 select-none transition-transform active:scale-95',
          sizeMap[size],
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color}dd)`,
          ...style,
        }}
        {...props}
      >
        <GameIcon gameType={game.type} variant="white" className={iconSize} />
      </div>
    );
  }
);

GameBadge.displayName = 'GameBadge';
