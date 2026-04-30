import { formatCurrency, cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import type { NationalCartLine, NationalOrderBreakdown } from '../contracts/national-play.contract';

import { NationalShippingForm } from './NationalShippingForm';

interface NationalCartSummaryProps {
  lines: NationalCartLine[];
  breakdown: NationalOrderBreakdown;
  onRemove: (number: string, drawId: NationalCartLine['drawId']) => void;
  onUpdateQuantity: (number: string, drawId: NationalCartLine['drawId'], delta: number) => void;
  onClear: () => void;
  onPersistToSession?: () => void;
  isPersisting?: boolean;
}

export function NationalCartSummary({
  lines,
  breakdown,
  onRemove,
  onUpdateQuantity,
  onClear,
  onPersistToSession,
  isPersisting,
}: NationalCartSummaryProps) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.55rem] border border-manises-blue/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Cesta demo nacional</p>
          <h3 className="mt-1 text-lg font-black text-manises-blue">
            {breakdown.totalDecimos} {breakdown.totalDecimos === 1 ? 'décimo' : 'décimos'}
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50" onClick={onClear}>
          Vaciar
        </Button>
      </div>

      <div className="mt-3 space-y-2.5">
        {lines.map((line) => (
          <div
            key={`${line.drawId}-${line.number}`}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-2.5"
          >
            {/* Numero */}
            <div className="flex min-w-[3.25rem] flex-col items-center justify-center rounded-xl bg-manises-blue py-1.5 text-white shadow-sm">
              <p className="text-[8px] font-black uppercase opacity-60">Número</p>
              <p className="text-sm font-black tracking-widest">{line.number}</p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-manises-blue truncate">
                {line.drawLabel}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-200/50 text-slate-500">
                  {line.drawDates.length} {line.drawDates.length === 1 ? 'sorteo' : 'sorteos'}
                </span>
                <span className={cn(
                  'text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md',
                  line.deliveryMode === 'custody' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200'
                )}>
                  {line.deliveryMode === 'custody' ? 'Custodia demo' : 'Mensajería demo'}
                </span>
              </div>
            </div>

            {/* Controles Cantidad */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(line.number, line.drawId, -1)}
                      className="flex h-[26px] w-[26px] items-center justify-center text-slate-400 transition-colors hover:text-manises-blue disabled:opacity-30"
                    disabled={line.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-[12px] font-black text-manises-blue">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(line.number, line.drawId, 1)}
                    className="flex h-[26px] w-[26px] items-center justify-center text-slate-400 transition-colors hover:text-manises-blue disabled:opacity-30"
                    disabled={line.quantity >= line.maxQuantity}
                  >
                    +
                  </button>
                </div>
                <p className="text-[8px] font-black uppercase tracking-tighter text-slate-400">
                  Máx. {line.maxQuantity} demo
                </p>
              </div>
              
              <div className="min-w-[3rem] text-right">
                <p className="text-[12px] font-black text-manises-blue">{formatCurrency(line.totalPrice)}</p>
                <button
                  type="button"
                  onClick={() => onRemove(line.number, line.drawId)}
                  className="text-[9px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Formulario de envío si aplica */}
      {breakdown.hasShipping && (
        <div className="mt-4">
          <NationalShippingForm />
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal décimos</p>
          <p className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.subtotal)}</p>
        </div>
        
        {breakdown.hasShipping && (
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Envío demo</p>
            <p className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.shippingCost)}</p>
          </div>
        )}

        <div className="flex items-center justify-between px-1 pt-1 border-t border-slate-50">
          <p className="text-[11px] font-black text-manises-blue uppercase tracking-widest">Importe total demo</p>
          <p className="text-lg font-black text-manises-blue">{formatCurrency(breakdown.total)}</p>
        </div>
      </div>

      {onPersistToSession && (
        <div className="mt-4">
          <Button
            className="w-full rounded-2xl bg-manises-blue py-3 text-white shadow-lg transition-all active:scale-[0.98]"
            onClick={onPersistToSession}
            disabled={isPersisting}
          >
            {isPersisting ? 'Añadiendo...' : 'Añadir selección simulada a la sesión'}
          </Button>
        </div>
      )}
    </section>
  );
}
