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

/**
 * Selector horizontal de bloques con estados visual completo/incompleto/vacío y botón "+".
 */
export function MulticolumnColumnSlider({
  columnsCount,
  activeIndex,
  onSelect,
  activeColor,
  columnStatus = {},
  onAddColumn,
}: MulticolumnColumnSliderProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
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
              'relative flex-shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all border-2',
              isActive
                ? 'bg-white border-transparent shadow-md scale-110 z-10'
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
            )}
            style={isActive ? { borderColor: activeColor, color: activeColor } : undefined}
          >
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
              Blq
            </span>
            <span className="text-sm font-black leading-none">{i + 1}</span>

            {/* Dot de estado: completo = color del juego, incompleto = ámbar, vacío = sin dot */}
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

      {/* Botón añadir bloque */}
      {onAddColumn && (
        <button
          onClick={onAddColumn}
          aria-label="Añadir bloque"
          title="Añadir bloque"
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all bg-white"
        >
          <span className="text-lg font-light leading-none">+</span>
        </button>
      )}
    </div>
  );
}
