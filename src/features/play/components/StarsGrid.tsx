import { motion } from 'motion/react';
import type { CSSProperties } from 'react';

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
  gridCols
}: StarsGridProps) {
  // Lógica de columnas original de GamePlayPage
  const finalGridCols = gridCols ?? (starValues.length <= 9 ? 5 : 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-bold text-sm" style={theme.title}>
          {title}
        </h2>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          {selectedStars.length}/{maxStarsLimit}
        </span>
      </div>
      <div className={`grid gap-2 ${finalGridCols === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
        {starValues.map(n => {
          const isSelected = selectedStars.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onToggle(n)}
              className={`aspect-square rounded-xl flex items-center justify-center border font-bold text-sm transition-all active:scale-90 ${
                isSelected
                  ? 'border-transparent bg-manises-gold text-manises-blue shadow-gold scale-95'
                  : 'border-amber-100 bg-white text-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-amber-300 hover:bg-amber-50'
              }`}
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
