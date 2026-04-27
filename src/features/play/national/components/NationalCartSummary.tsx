import { formatCurrency } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import type { NationalCartLine, NationalOrderBreakdown } from '../contracts/national-play.contract';

interface NationalCartSummaryProps {
  lines: NationalCartLine[];
  breakdown: NationalOrderBreakdown;
  onRemove: (number: string, drawId: NationalCartLine['drawId']) => void;
  onClear: () => void;
  onPersistToSession?: () => void;
  isPersisting?: boolean;
}

export function NationalCartSummary({
  lines,
  breakdown,
  onRemove,
  onClear,
  onPersistToSession,
  isPersisting,
}: NationalCartSummaryProps) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.8rem] border border-manises-blue/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Cesta demo nacional</p>
          <h3 className="mt-1 text-lg font-black text-manises-blue">
            {breakdown.lineCount} {breakdown.lineCount === 1 ? 'línea' : 'líneas'} · {breakdown.totalDecimos} décimos
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl text-slate-500" onClick={onClear}>
          Limpiar cesta
        </Button>
      </div>

      <div className="mt-4 space-y-2.5">
        {lines.map((line) => (
          <div
            key={`${line.drawId}-${line.number}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-black text-manises-blue">
                Nº {line.number} · {line.quantity} {line.quantity === 1 ? 'décimo' : 'décimos'}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {line.drawLabel} · {line.drawDates.length} {line.drawDates.length === 1 ? 'sorteo' : 'sorteos'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-black text-manises-blue">{formatCurrency(line.totalPrice)}</p>
              <button
                type="button"
                onClick={() => onRemove(line.number, line.drawId)}
                className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-rose-600"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Subtotal</p>
          <p className="mt-1 text-base font-black text-manises-blue">{formatCurrency(breakdown.subtotal)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Total demo</p>
          <p className="mt-1 text-base font-black text-manises-blue">{formatCurrency(breakdown.total)}</p>
        </div>
      </div>

      <div className="mt-5">
        <Button
          className="w-full rounded-2xl bg-manises-blue text-white font-bold py-3 shadow-lg active:scale-[0.98] transition-all"
          onClick={onPersistToSession}
          disabled={isPersisting}
        >
          {isPersisting ? 'Añadiendo...' : 'Añadir selección simulada a la sesión'}
        </Button>
      </div>
    </section>
  );
}
