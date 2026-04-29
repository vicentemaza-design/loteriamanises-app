import { CheckCircle } from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';

interface NationalDrawSelectorProps {
  availableNationalDates: string[];
  effectiveSelectedDrawDates: string[];
  onSelectDate: (dateIso: string) => void;
}

/**
 * Selector de sorteos para Lotería Nacional (Fase 2B.3B).
 * Renderiza la lista de fechas disponibles para Nacional.
 */
export function NationalDrawSelector({
  availableNationalDates,
  effectiveSelectedDrawDates,
  onSelectDate,
}: NationalDrawSelectorProps) {
  return (
    <div className="space-y-1.5">
      {availableNationalDates.map((dateIso) => {
        const isSelected = effectiveSelectedDrawDates.includes(dateIso);
        return (
          <button
            key={dateIso}
            onClick={() => onSelectDate(dateIso)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-all',
              isSelected ? 'border-manises-blue bg-manises-blue/[0.03]' : 'border-slate-100 bg-slate-50/50'
            )}
          >
            <span className={cn('text-[11px] font-black tracking-tight', isSelected ? 'text-manises-blue' : 'text-slate-600')}>
              {new Date(dateIso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center', isSelected ? 'bg-manises-blue border-manises-blue' : 'border-slate-300 bg-white')}>
              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
