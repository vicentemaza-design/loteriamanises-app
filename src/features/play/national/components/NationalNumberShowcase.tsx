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
    <div className="grid grid-cols-2 gap-3">
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
  );
}
