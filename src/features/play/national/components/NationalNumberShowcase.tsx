import { motion } from 'motion/react';
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
        <div className="space-y-1">
          {items.map((item) => {
            const activeLine = cartLines.find(l => l.number === item.number && l.drawId === item.drawId);
            const active = activeLine !== undefined;
            const qty = activeLine?.quantity ?? 0;
            const availabilityText = item.available <= 1 ? 'Último décimo' : `${item.available} disponibles`;

            return (
              <motion.div
                key={`${item.drawId}-${item.number}`}
                layout
                whileTap={{ scale: 0.97 }}
                transition={{ layout: { type: 'spring', stiffness: 400, damping: 30 } }}
                className={cn(
                  'w-full relative overflow-hidden rounded-xl border-2 px-3 py-1.5 transition-all',
                  active
                    ? 'border-manises-blue bg-manises-blue/[0.04] shadow-sm'
                    : 'border-slate-100 bg-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <NationalTicketThumbnail
                    drawId={item.drawId}
                    className="w-14 shadow-sm"
                  />

                  <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <div>
                      <p className="text-[1.2rem] font-black tracking-widest leading-none text-manises-blue tabular-nums">
                        {item.number}
                      </p>
                      <p className={cn(
                        'mt-0.5 text-[8px] font-semibold leading-none',
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

                    <div
                      className={cn(
                        'flex items-center gap-0.5 rounded-lg border p-0.5 shadow-sm',
                        active ? 'border-manises-blue/20 bg-white' : 'border-slate-200 bg-slate-50'
                      )}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => active && onDecrement(item.number, item.drawId)}
                        disabled={!active}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-black text-manises-blue transition-colors hover:bg-manises-blue/10 disabled:opacity-30"
                        aria-label="Restar décimo"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-[13px] font-black leading-none text-manises-blue">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => active ? onIncrement(item.number, item.drawId) : onToggle(item)}
                        disabled={active && qty >= item.available}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-sm font-black text-manises-blue transition-colors hover:bg-manises-blue/10 disabled:opacity-30"
                        aria-label="Sumar décimo"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
