import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

interface NumbersGridProps {
  totalNums: number;
  selectedNumbers: number[];
  maxNumbersLimit: number;
  onToggle: (n: number) => void;
  theme: {
    title: CSSProperties;
    selectedAccent: CSSProperties;
  };
  title?: string;
  subtitle?: string;
  /** Celdas más pequeñas para layout side-by-side */
  compact?: boolean;
  /** Número de columnas del grid (default: 7 normal, 8 compact) */
  columns?: number;
}

export function NumbersGrid({
  totalNums,
  selectedNumbers,
  maxNumbersLimit,
  onToggle,
  theme,
  title = 'Números',
  subtitle,
  compact = false,
  columns,
}: NumbersGridProps) {
  const gridCols = columns ?? (compact ? 8 : 7);

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2
            className={compact ? 'font-semibold text-xs' : 'font-bold text-sm'}
            style={theme.title}
          >
            {title}
          </h2>
          {subtitle && !compact && (
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          {selectedNumbers.length}/{maxNumbersLimit}
        </span>
      </div>

      <div
        className={compact ? 'grid gap-1' : 'grid grid-cols-7 gap-2'}
        style={compact ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : undefined}
      >
        {Array.from({ length: totalNums }, (_, i) => i + 1).map(n => {
          const isSelected = selectedNumbers.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onToggle(n)}
              className={cn(
                'flex items-center justify-center border font-bold transition-all active:scale-90',
                compact
                  ? 'h-[38px] rounded-lg text-sm'
                  : 'aspect-square rounded-xl text-sm',
                isSelected
                  ? 'scale-95 border-transparent shadow-[0_10px_20px_rgba(10,71,146,0.14)]'
                  : 'border-gray-100 bg-white/80 text-manises-blue/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-manises-blue/30 hover:bg-manises-blue/5'
              )}
              style={isSelected ? theme.selectedAccent : undefined}
              aria-pressed={isSelected}
              aria-label={`Número ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
