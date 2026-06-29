import { formatCurrency, cn } from '@/shared/lib/utils';
import type { NationalCartLine, NationalOrderBreakdown } from '../contracts/national-play.contract';
import { MAX_NATIONAL_DECIMOS } from '../hooks/useNationalCart';

interface NationalCartSummaryProps {
  lines: NationalCartLine[];
  breakdown: NationalOrderBreakdown;
  onRemove: (number: string, drawId: NationalCartLine['drawId']) => void;
  onUpdateQuantity: (number: string, drawId: NationalCartLine['drawId'], delta: number) => void;
  onClear: () => void;
  availableBalance?: number;
  activeColor?: string;
}

export function NationalCartSummary({
  lines,
  breakdown,
  onRemove,
  onUpdateQuantity,
  onClear,
}: NationalCartSummaryProps) {
  if (lines.length === 0) return null;

  const isAtCap = breakdown.totalDecimos >= MAX_NATIONAL_DECIMOS;

  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-manises-blue/10 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Números seleccionados
          </p>
          <p className="mt-0.5 text-[13px] font-black text-manises-blue">
            {breakdown.totalDecimos} {breakdown.totalDecimos === 1 ? 'décimo' : 'décimos'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[9px] font-black uppercase tracking-wider text-slate-400 transition-colors hover:text-rose-500"
        >
          Limpiar todo
        </button>
      </div>

      {isAtCap && (
        <div className="mx-3 mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-amber-600">
          Máximo de {MAX_NATIONAL_DECIMOS} décimos alcanzado
        </div>
      )}

      {/* Lista de números */}
      <div className="divide-y divide-slate-50 px-4">
        {lines.map((line) => (
          <div
            key={`${line.drawId}-${line.number}`}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="font-mono text-[1.25rem] font-black tracking-[0.16em] text-manises-blue">
                {line.number}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={cn(
                  'text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md',
                  line.deliveryMode === 'custody'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'border border-amber-200 bg-amber-50 text-amber-700'
                )}>
                  {line.deliveryMode === 'custody' ? 'Digital' : 'Mensajería'}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Controles cantidad */}
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (line.quantity <= 1) {
                      onRemove(line.number, line.drawId);
                    } else {
                      onUpdateQuantity(line.number, line.drawId, -1);
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center text-[13px] font-black text-manises-blue transition-colors hover:bg-slate-50 disabled:text-slate-200"
                >
                  −
                </button>
                <span className="w-6 text-center text-[13px] font-black tabular-nums text-manises-blue">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(line.number, line.drawId, 1)}
                  disabled={line.quantity >= line.maxQuantity || isAtCap}
                  className="flex h-8 w-8 items-center justify-center text-[13px] font-black text-manises-blue transition-colors hover:bg-slate-50 disabled:text-slate-200"
                >
                  +
                </button>
              </div>

              {/* Precio + quitar */}
              <div className="min-w-[3.5rem] text-right">
                <p className="text-[12px] font-black text-manises-blue">
                  {formatCurrency(line.totalPrice)}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(line.number, line.drawId)}
                  className="text-[9px] font-bold uppercase tracking-wider text-rose-400 transition-colors hover:text-rose-600"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="space-y-1.5 border-t border-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subtotal</p>
          <p className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.subtotal)}</p>
        </div>
        {breakdown.hasShipping && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Envío MRW
            </p>
            <p className="text-[12px] font-black text-manises-blue">
              {formatCurrency(breakdown.shippingCost)}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-50 pt-1.5">
          <p className="text-[11px] font-black uppercase tracking-widest text-manises-blue">Total</p>
          <p className="text-[17px] font-black text-manises-blue">{formatCurrency(breakdown.total)}</p>
        </div>
      </div>
    </section>
  );
}
