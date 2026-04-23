import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import { GameIcon } from '@/shared/ui/GameIcon';
import { getGameIdentity } from '@/shared/lib/game-identity';

export interface GameBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  game: LotteryGame;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'solid' | 'soft' | 'ghost';
}

const sizeMap = {
  xs: 'h-9 w-9 rounded-[0.95rem]',
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
    const identity = getGameIdentity(game);
    const iconSize = size === 'xs' ? 'w-4.5 h-4.5' : size === 'sm' ? 'w-5.5 h-5.5' : size === 'md' ? 'w-7 h-7' : 'w-8.5 h-8.5';
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
          'relative flex items-center justify-center shrink-0 overflow-hidden select-none transition-transform active:scale-95',
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
        {tone !== 'ghost' && (
          <div
            className="absolute inset-[1px] rounded-[inherit] opacity-80"
            style={{
              background: `radial-gradient(circle at top, ${identity.surfaceTint} 0%, rgba(255,255,255,0) 72%)`,
            }}
          />
        )}

        <div className="relative flex h-full w-full items-center justify-center">
          <GameIcon gameType={game.type} variant={iconVariant} className={cn(iconSize, 'drop-shadow-[0_4px_12px_rgba(15,23,42,0.12)]')} />
        </div>
      </div>
    );
  }
);

GameBadge.displayName = 'GameBadge';
