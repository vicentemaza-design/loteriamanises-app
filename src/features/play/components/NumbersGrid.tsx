import { motion } from 'motion/react';
import type { CSSProperties } from 'react';

interface NumbersGridProps {
  totalNums: number;
  selectedNumbers: number[];
  /** El límite superior de selección (puede variar según el modo) */
  maxNumbersLimit: number;
  onToggle: (n: number) => void;
  /** Estilos derivados del tema del juego */
  theme: {
    title: CSSProperties;
    selectedAccent: CSSProperties;
  };
  title?: string;
  subtitle?: string;
}

/**
 * Grid de selección de números para juegos de lotería.
 * Extraído de GamePlayPage en Fase 2D.2A para permitir su reutilización.
 */
export function NumbersGrid({
  totalNums,
  selectedNumbers,
  maxNumbersLimit,
  onToggle,
  theme,
  title = "Números",
  subtitle
}: NumbersGridProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2 className="font-bold text-sm" style={theme.title}>{title}</h2>
          {subtitle && (
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          {selectedNumbers.length}/{maxNumbersLimit}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: totalNums }, (_, i) => i + 1).map(n => {
          const isSelected = selectedNumbers.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onToggle(n)}
              className={`aspect-square rounded-xl flex items-center justify-center border font-bold text-sm transition-all active:scale-90 ${
                isSelected
                  ? 'scale-95 border-transparent shadow-[0_10px_20px_rgba(10,71,146,0.14)]'
                  : 'border-gray-100 bg-white/80 text-manises-blue/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-manises-blue/30 hover:bg-manises-blue/5'
              }`}
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
