import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

interface StarsGridProps {
  starValues: number[];
  selectedStars: number[];
  maxStarsLimit: number;
  onToggle: (n: number) => void;
  /** Estilos derivados del tema del juego */
  theme: {
    title: CSSProperties;
  };
  title?: string;
  labelPrefix?: string;
  gridCols?: number;
  subtitle?: string;
  /** Renderiza celdas más pequeñas para bloques secundarios */
  compact?: boolean;
}

/**
 * Grid de selección de estrellas o números clave (Gordo).
 * Extraído de GamePlayPage en Fase 2D.2A para permitir su reutilización.
 */
export function StarsGrid({
  starValues,
  selectedStars,
  maxStarsLimit,
  onToggle,
  theme,
  title = "Estrellas",
  labelPrefix = "Estrella",
  gridCols,
  subtitle,
  compact = false,
}: StarsGridProps) {
  const finalGridCols = gridCols ?? (starValues.length <= 9 ? 5 : 6);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2 className={compact ? 'font-semibold text-xs' : 'font-bold text-sm'} style={theme.title}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          {selectedStars.length}/{maxStarsLimit}
        </span>
      </div>
      <div className={cn(
        'grid',
        compact
          ? `gap-1.5 justify-items-center ${finalGridCols === 5 ? 'grid-cols-5' : 'grid-cols-6'}`
          : `gap-2 ${finalGridCols === 5 ? 'grid-cols-5' : 'grid-cols-6'}`
      )}>
        {starValues.map(n => {
          const isSelected = selectedStars.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onToggle(n)}
              className={cn(
                'flex items-center justify-center border font-bold transition-all active:scale-90',
                compact
                  ? 'w-10 h-10 rounded-lg text-xs font-semibold'
                  : 'aspect-square rounded-xl text-sm',
                isSelected
                  ? 'border-transparent bg-manises-gold text-manises-blue shadow-gold scale-95'
                  : 'border-amber-100 bg-white text-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-amber-300 hover:bg-amber-50'
              )}
              aria-pressed={isSelected}
              aria-label={`${labelPrefix} ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
