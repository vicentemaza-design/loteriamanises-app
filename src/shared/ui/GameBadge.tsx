import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import { GameIcon } from '@/shared/ui/GameIcon';

export interface GameBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  game: LotteryGame;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'solid' | 'soft' | 'ghost';
}

const sizeMap = {
  sm: 'h-11 w-11 rounded-[1rem]',
  md: 'h-14 w-14 rounded-[1.15rem]',
  lg: 'h-[4.25rem] w-[4.25rem] rounded-[1.35rem]',
};

/**
 * Badge visual de un juego con color e icono propio.
 * Componente de dominio reutilizable en catálogo, tickets, resultados.
 * Cumple con los estándares de diseño Manises y soporta atributos HTML nativos.
 */
export const GameBadge = React.forwardRef<HTMLDivElement, GameBadgeProps>(
  ({ game, size = 'md', tone = 'soft', className, style, ...props }, ref) => {
    const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10';
    const iconVariant = tone === 'solid' || tone === 'ghost' ? 'white' : 'color';
    const toneClassName =
      tone === 'solid'
        ? 'text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]'
        : tone === 'ghost'
          ? 'border border-white/15 bg-white/10 text-white shadow-none backdrop-blur-md'
          : 'border bg-white/96 shadow-[0_10px_24px_rgba(15,23,42,0.08)]';

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center shrink-0 select-none transition-transform active:scale-95',
          sizeMap[size],
          toneClassName,
          className
        )}
        style={{
          ...(tone === 'solid'
            ? { background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color}dd)` }
            : tone === 'soft'
              ? {
                  backgroundColor: '#ffffff',
                  borderColor: `${game.color}1f`,
                  boxShadow: `0 10px 24px ${game.color}14`,
                }
              : {}),
          ...style,
        }}
        {...props}
      >
        <GameIcon gameType={game.type} variant={iconVariant} className={iconSize} />
      </div>
    );
  }
);

GameBadge.displayName = 'GameBadge';
