import { cn } from '@/shared/lib/utils';

type BlockStatus = { isComplete: boolean; hasData: boolean };

interface MulticolumnColumnSliderProps {
  columnsCount: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  activeColor: string;
  columnStatus?: Record<number, BlockStatus>;
  onAddColumn?: () => void;
}

export function MulticolumnColumnSlider({
  columnsCount,
  activeIndex,
  onSelect,
  activeColor,
  columnStatus = {},
  onAddColumn,
}: MulticolumnColumnSliderProps) {
  return (
    // Outer div: solo gestiona el scroll horizontal. No clip vertical.
    <div className="overflow-x-auto no-scrollbar">
      {/* Inner div: padding real que evita que los chips y dots queden recortados */}
      <div className="flex items-center gap-2 px-2 py-2 w-max">
        {Array.from({ length: columnsCount }).map((_, i) => {
          const isActive = activeIndex === i;
          const status = columnStatus[i];
          const isComplete = status?.isComplete ?? false;
          const hasData = status?.hasData ?? false;

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                'relative flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all border-2',
                isActive
                  ? 'bg-white shadow-md'
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
              )}
              style={isActive
                ? { borderColor: activeColor, color: activeColor }
                : undefined}
            >
              <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Ap</span>
              <span className="text-sm font-black leading-none">{i + 1}</span>

              {!isActive && isComplete && (
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: activeColor }}
                />
              )}
              {!isActive && !isComplete && hasData && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-amber-400" />
              )}
            </button>
          );
        })}

        {onAddColumn && (
          <button
            onClick={onAddColumn}
            aria-label="Añadir apuesta"
            title="Añadir apuesta"
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all bg-white"
          >
            <span className="text-lg font-light leading-none">+</span>
          </button>
        )}
      </div>
    </div>
  );
}
