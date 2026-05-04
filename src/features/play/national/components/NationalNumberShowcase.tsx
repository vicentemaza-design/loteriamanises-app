import { cn } from '@/shared/lib/utils';
import type { NationalShowcaseItem } from '../contracts/national-play.contract';

interface NationalNumberShowcaseProps {
  items: NationalShowcaseItem[];
  selectedNumber: string | null;
  selectedQuantity: number;
  maxQuantity: number;
  onSelect: (item: NationalShowcaseItem) => void;
  onQuantityChange: (qty: number) => void;
}

export function NationalNumberShowcase({
  items,
  selectedNumber,
  selectedQuantity,
  maxQuantity,
  onSelect,
  onQuantityChange,
}: NationalNumberShowcaseProps) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
          <p className="text-sm font-bold text-slate-400">No hay números con este stock demo</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Prueba con un filtro menor</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const active = item.number === selectedNumber;
            const availabilityText = item.available <= 1 ? 'Último' : `Quedan ${item.available}`;

            return (
              <button
                key={`${item.drawId}-${item.number}`}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border-2 p-3.5 text-left transition-all',
                  active
                    ? 'border-manises-blue bg-manises-blue text-white shadow-manises'
                    : 'border-slate-100 bg-white hover:border-manises-blue/20'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    'text-2xl font-black tracking-widest leading-none',
                    active ? 'text-white' : 'text-manises-blue'
                  )}>
                    {item.number}
                  </p>

                  {active ? (
                    // Mini stepper replaces badge when this card is selected
                    <div
                      className="flex items-center gap-0.5 rounded-lg bg-white/15 p-0.5"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onQuantityChange(selectedQuantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-black text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                        aria-label="Restar décimo"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-[13px] font-black leading-none text-white">
                        {selectedQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(Math.min(maxQuantity, selectedQuantity + 1))}
                        disabled={selectedQuantity >= maxQuantity}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-black text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30"
                        aria-label="Sumar décimo"
                      >
                        +
                      </button>
                    </div>
                  ) : item.badge === 'destacado' ? (
                    <span className="rounded-full border border-manises-blue/10 bg-manises-blue/[0.05] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-manises-blue">
                      Top
                    </span>
                  ) : null}
                </div>

                <p className={cn(
                  'mt-1.5 text-[9px] font-semibold leading-none',
                  active
                    ? 'text-white/60'
                    : item.available <= 1
                      ? 'text-amber-600'
                      : item.available <= 4
                        ? 'text-red-500'
                        : 'text-slate-400'
                )}>
                  {active ? `${availabilityText} · máx. ${maxQuantity}` : availabilityText}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
