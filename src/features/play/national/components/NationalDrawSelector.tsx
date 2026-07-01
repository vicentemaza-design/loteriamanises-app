import { cn } from '@/shared/lib/utils';

interface NationalDrawSelectorProps {
  availableNationalDates: string[];
  effectiveSelectedDrawDates: string[];
  onSelectDate: (dateIso: string) => void;
}

function formatChip(iso: string): { weekday: string; day: string; month: string } {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
    day: String(d.getDate()),
    month: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
  };
}

export function NationalDrawSelector({
  availableNationalDates,
  effectiveSelectedDrawDates,
  onSelectDate,
}: NationalDrawSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-0.5 px-0.5">
      {availableNationalDates.map((dateIso) => {
        const isSelected = effectiveSelectedDrawDates.includes(dateIso);
        const chip = formatChip(dateIso);
        return (
          <button
            key={dateIso}
            type="button"
            onClick={() => onSelectDate(dateIso)}
            className={cn(
              'relative shrink-0 flex flex-col items-center justify-center gap-0.5 rounded-xl border min-w-[62px] px-2 py-2.5 transition-all',
              isSelected
                ? 'border-manises-blue bg-manises-blue shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <span className={cn(
              'text-[12px] font-semibold leading-none uppercase',
              isSelected ? 'text-white/70' : 'text-slate-400'
            )}>
              {chip.weekday}
            </span>
            <span className={cn(
              'text-[20px] font-bold leading-none',
              isSelected ? 'text-white' : 'text-slate-700'
            )}>
              {chip.day}
            </span>
            <span className={cn(
              'text-[12px] font-semibold leading-none uppercase',
              isSelected ? 'text-white/70' : 'text-slate-400'
            )}>
              {chip.month}
            </span>
          </button>
        );
      })}
    </div>
  );
}
