import { cn } from '@/shared/lib/utils';

interface NationalDrawSelectorProps {
  availableNationalDates: string[];
  effectiveSelectedDrawDates: string[];
  onSelectDate: (dateIso: string) => void;
}

function formatChipDate(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const day = d.getDate();
  const month = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  return `${weekday} ${day} ${month}`;
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
        return (
          <button
            key={dateIso}
            type="button"
            onClick={() => onSelectDate(dateIso)}
            className={cn(
              'shrink-0 rounded-xl border px-3 py-2 text-[11px] font-black tracking-tight transition-all',
              isSelected
                ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            )}
          >
            {formatChipDate(dateIso)}
          </button>
        );
      })}
    </div>
  );
}
