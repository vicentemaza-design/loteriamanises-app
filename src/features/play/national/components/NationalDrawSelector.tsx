import { cn } from '@/shared/lib/utils';

interface NationalDrawSelectorProps {
  availableNationalDates: string[];
  effectiveSelectedDrawDates: string[];
  onSelectDate: (dateIso: string) => void;
}

function formatChipContext(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const hasTime = iso.includes('T') && !iso.endsWith('T00:00:00');
  if (!hasTime) return weekday;
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${weekday} · ${time}`;
}

function formatChipDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  return `${day} ${month}`;
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
              'shrink-0 flex flex-col items-center rounded-xl border px-3 py-2 transition-all min-w-[64px]',
              isSelected
                ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <span className={cn(
              'text-[9px] font-semibold leading-tight',
              isSelected ? 'text-white/70' : 'text-slate-400'
            )}>
              {formatChipContext(dateIso)}
            </span>
            <span className={cn(
              'text-[11px] font-black leading-tight mt-0.5',
              isSelected ? 'text-white' : 'text-slate-700'
            )}>
              {formatChipDate(dateIso)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
