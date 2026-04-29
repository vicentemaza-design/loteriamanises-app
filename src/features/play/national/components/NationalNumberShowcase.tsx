import { cn } from '@/shared/lib/utils';
import type { NationalShowcaseItem } from '../contracts/national-play.contract';

interface NationalNumberShowcaseProps {
  items: NationalShowcaseItem[];
  selectedNumber: string | null;
  onSelect: (item: NationalShowcaseItem) => void;
}

export function NationalNumberShowcase({
  items,
  selectedNumber,
  onSelect,
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
          {/* DÉCIMO DE LA SUERTE */}
          <button
            type="button"
            onClick={() => {
               // Reutilizar lógica de random de fuera si es posible o simplemente toast demo
               const randomIdx = Math.floor(Math.random() * items.length);
               onSelect(items[randomIdx]);
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-manises-gold bg-manises-gold/5 p-4 text-left transition-all hover:bg-manises-gold/10"
          >
            <div className="absolute right-0 top-0 p-2">
              <div className="w-2 h-2 rounded-full bg-manises-gold animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-manises-gold">Décimo de la suerte</p>
              <p className="text-xl font-black tracking-widest text-manises-blue">? ? ? ? ?</p>
            </div>
            <div className="mt-3">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-manises-gold text-manises-blue">
                Asignación demo aleatoria
              </span>
            </div>
          </button>

          {items.map((item) => {
            const active = item.number === selectedNumber;
            const isLowStock = item.available <= 4;

            return (
              <button
                key={`${item.drawId}-${item.number}`}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all',
                  active
                    ? 'border-manises-blue bg-manises-blue text-white shadow-manises'
                    : 'border-slate-100 bg-white hover:border-manises-blue/20'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    'text-2xl font-black tracking-widest',
                    active ? 'text-white' : 'text-manises-blue'
                  )}>
                    {item.number}
                  </p>
                  {item.badge && (
                    <span className={cn(
                      'rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.14em]',
                      active
                        ? 'border-white/20 bg-white/15 text-white'
                        : item.badge === 'destacado'
                          ? 'border-manises-blue/10 bg-manises-blue/[0.05] text-manises-blue'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                    )}>
                      {item.badge === 'destacado' ? 'Top' : item.badge === 'agotandose' ? 'Queda poco' : 'Último'}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border',
                    active
                      ? 'bg-white/15 border-white/20 text-white'
                      : isLowStock ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                  )}>
                    {item.stockLabel}
                  </span>
                  <span className={cn(
                    'text-[10px] font-bold',
                    active ? 'text-white/60' : 'text-slate-400'
                  )}>
                    Stock demo: {item.available}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
