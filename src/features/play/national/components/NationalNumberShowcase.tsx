import { cn } from '@/shared/lib/utils';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
import type { NationalCartLine, NationalShowcaseItem } from '../contracts/national-play.contract';

interface NationalNumberShowcaseProps {
  items: NationalShowcaseItem[];
  cartLines: NationalCartLine[];
  onToggle: (item: NationalShowcaseItem) => void;
  onIncrement: (number: string, drawId: NationalCartLine['drawId']) => void;
  onDecrement: (number: string, drawId: NationalCartLine['drawId']) => void;
}

export function NationalNumberShowcase({
  items,
  cartLines,
  onToggle,
  onIncrement,
  onDecrement,
}: NationalNumberShowcaseProps) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
          <p className="text-sm font-bold text-slate-400">No hay números con este stock demo</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Prueba con un filtro menor</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const activeLine = cartLines.find(l => l.number === item.number && l.drawId === item.drawId);
            const active = activeLine !== undefined;
            const qty = activeLine?.quantity ?? 1;
            const availabilityText = item.available <= 1 ? 'Último' : `Quedan ${item.available}`;

            return (
              <button
                key={`${item.drawId}-${item.number}`}
                type="button"
                onClick={() => onToggle(item)}
                className={cn(
                  'group w-full relative overflow-hidden rounded-2xl border-2 p-2.5 text-left transition-all',
                  active
                    ? 'border-manises-blue bg-manises-blue/[0.04] shadow-sm'
                    : 'border-slate-100 bg-white hover:border-manises-blue/20'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Mini ticket thumbnail */}
                  <NationalTicketThumbnail
                    drawId={item.drawId}
                    number={item.number}
                    serie={item.serie}
                    fraccion={item.fraccion}
                    className="w-[88px] shadow-sm"
                  />

                  {/* Number + meta */}
                  <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <div>
                      <p className={cn(
                        'text-xl font-black tracking-widest leading-none',
                        active ? 'text-manises-blue' : 'text-manises-blue'
                      )}>
                        {item.number}
                      </p>
                      <p className={cn(
                        'mt-1 text-[9px] font-semibold leading-none',
                        active
                          ? 'text-manises-blue/60'
                          : item.available <= 1
                            ? 'text-amber-600'
                            : item.available <= 4
                              ? 'text-red-500'
                              : 'text-slate-400'
                      )}>
                        {active ? `${availabilityText} · máx. ${item.available}` : availabilityText}
                      </p>
                    </div>

                    {/* Stepper (selected) or badge (not selected) */}
                    <div className="shrink-0">
                      {active ? (
                        <div
                          className="flex items-center gap-0.5 rounded-lg border border-manises-blue/20 bg-white p-0.5 shadow-sm"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onDecrement(item.number, item.drawId)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-black text-manises-blue transition-colors hover:bg-manises-blue/10"
                            aria-label="Restar décimo"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-[13px] font-black leading-none text-manises-blue">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onIncrement(item.number, item.drawId)}
                            disabled={qty >= item.available}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-black text-manises-blue transition-colors hover:bg-manises-blue/10 disabled:opacity-30"
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
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
