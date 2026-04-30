import { cn } from '@/shared/lib/utils';

interface MulticolumnColumnSliderProps {
  columnsCount: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  activeColor: string;
  columnStatus?: Record<number, { isComplete: boolean }>;
}

/**
 * Slider horizontal para navegar entre las columnas del boleto.
 * Muestra el número de columna e indicadores de completitud.
 */
export function MulticolumnColumnSlider({
  columnsCount,
  activeIndex,
  onSelect,
  activeColor,
  columnStatus = {},
}: MulticolumnColumnSliderProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {Array.from({ length: columnsCount }).map((_, i) => {
        const isActive = activeIndex === i;
        const isComplete = columnStatus[i]?.isComplete;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "relative flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all border-2",
              isActive
                ? "bg-white border-transparent shadow-md scale-110 z-10"
                : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
            )}
            style={isActive ? { borderColor: activeColor, color: activeColor } : undefined}
          >
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
              Blq
            </span>
            <span className="text-sm font-black leading-none">
              {i + 1}
            </span>
            {isComplete && !isActive && (
              <div 
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ backgroundColor: activeColor }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
