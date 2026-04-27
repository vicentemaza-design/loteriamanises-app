import { formatCurrency } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import type { MulticolumnSummary as SummaryType } from '../contracts/multicolumn-play.contract';

interface MulticolumnSummaryProps {
  summary: SummaryType;
  onReview?: () => void;
  activeColor: string;
}

/**
 * Resumen de totales para el flujo multi-columna.
 * Muestra el conteo de apuestas e importe total acumulado.
 */
export function MulticolumnSummary({
  summary,
  onReview,
  activeColor,
}: MulticolumnSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Apuestas</p>
          <p className="mt-1 text-base font-black text-manises-blue">{summary.totalBets}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Total acumulado</p>
          <p className="mt-1 text-base font-black text-manises-blue">{formatCurrency(summary.totalPrice)}</p>
        </div>
      </div>

      <Button
        className="w-full rounded-2xl text-white font-bold py-3 shadow-lg active:scale-[0.98] transition-all"
        style={{ backgroundColor: activeColor }}
        onClick={onReview}
        disabled={!summary.isValid}
      >
        Revisar columnas ({summary.completeColumns})
      </Button>
    </div>
  );
}
