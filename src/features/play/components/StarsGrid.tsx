import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

interface StarsGridProps {
  starValues: number[];
  selectedStars: number[];
  maxStarsLimit: number;
  onToggle: (n: number) => void;
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

export function StarsGrid({
  starValues,
  selectedStars,
  maxStarsLimit,
  onToggle,
  theme,
  title = 'Estrellas',
  labelPrefix = 'Estrella',
  gridCols,
  subtitle,
  compact = false,
}: StarsGridProps) {
  const finalGridCols = gridCols ?? (starValues.length <= 9 ? 5 : 6);

  // Modo columna lateral: grid de 1-2 columnas dentro de un contenedor estrecho
  const isSideColumn = compact && finalGridCols <= 2;

  return (
    <div className={compact ? (isSideColumn ? 'flex flex-col h-full gap-1.5' : 'space-y-1.5') : 'space-y-2'}>
      {isSideColumn ? (
        // Título apilado para columna estrecha
        <div className="flex flex-col items-center gap-0.5 px-0.5">
          <h2 className="font-semibold text-[10px] leading-none" style={theme.title}>
            {title}
          </h2>
          <span className="text-[9px] text-muted-foreground font-semibold">
            {selectedStars.length}/{maxStarsLimit}
          </span>
        </div>
      ) : (
        // Título normal en fila
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h2
              className={compact ? 'font-semibold text-xs' : 'font-bold text-sm'}
              style={theme.title}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {selectedStars.length}/{maxStarsLimit}
          </span>
        </div>
      )}

      <div
        className={cn(
          'grid',
          compact
            ? isSideColumn
              ? 'gap-1 flex-1'
              : 'gap-1.5 justify-items-center'
            : 'gap-2'
        )}
        style={{
          gridTemplateColumns: `repeat(${finalGridCols}, minmax(0, 1fr))`,
          ...(isSideColumn ? { alignContent: 'space-between' } : {}),
        }}
      >
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
                  ? isSideColumn
                    // Columna lateral: rellena la celda, altura fija
                    ? 'w-full h-[38px] rounded-lg text-sm font-semibold'
                    // Modo compacto estándar (multicolumna, etc.): tamaño fijo cuadrado
                    : 'w-10 h-10 rounded-lg text-xs font-semibold'
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
