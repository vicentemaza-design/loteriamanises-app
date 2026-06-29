import { useMemo, useState } from 'react';
import { NavArrowLeft, NavArrowDown, NavArrowUp } from 'iconoir-react/regular';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import type { LotteryGame } from '@/shared/types/domain';
import type { NationalCartLine, NationalOrderBreakdown } from '../contracts/national-play.contract';
import { NationalShippingForm } from './NationalShippingForm';

interface NationalCheckoutReviewProps {
  game: LotteryGame;
  lines: NationalCartLine[];
  breakdown: NationalOrderBreakdown;
  availableBalance: number;
  onBack: () => void;
  onViewTicket: (line: NationalCartLine) => void;
  onContinueToPayment: () => void;
}

interface ReviewLine {
  key: string;
  line: NationalCartLine;
  drawDate: string;
  amount: number;
}

function groupReviewLines(lines: NationalCartLine[]) {
  const expanded: ReviewLine[] = lines.flatMap((line) => {
    const dates = line.drawDates.length > 0 ? line.drawDates : [new Date().toISOString()];
    return dates.map((drawDate) => ({
      key: `${line.drawId}-${line.number}-${drawDate}`,
      line,
      drawDate,
      amount: line.unitPrice * line.quantity,
    }));
  });

  return expanded.reduce<Record<string, ReviewLine[]>>((groups, item) => {
    const key = item.drawDate;
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}

function totalDecimosForGroup(items: ReviewLine[]): number {
  return items.reduce((sum, { line }) => sum + line.quantity, 0);
}

export function NationalCheckoutReview({
  game,
  lines,
  breakdown,
  availableBalance,
  onBack,
  onViewTicket,
  onContinueToPayment,
}: NationalCheckoutReviewProps) {
  const hasShipping = breakdown.hasShipping;
  const groupedLines: Record<string, ReviewLine[]> = useMemo(() => groupReviewLines(lines), [lines]);
  const groupEntries = Object.entries(groupedLines).sort(([left], [right]) => left.localeCompare(right));

  const [expandedDates, setExpandedDates] = useState<Set<string>>(
    () => new Set(groupEntries.slice(0, 1).map(([date]) => date))
  );

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  return (
    <div className="space-y-3 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-manises-blue transition-colors hover:text-manises-blue/70"
        >
          <NavArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider',
          hasShipping
            ? 'border border-amber-200 bg-amber-50 text-amber-700'
            : 'bg-emerald-50 text-emerald-700'
        )}>
          {hasShipping ? 'Envío a domicilio' : 'Décimos digitales'}
        </span>
      </div>

      {/* Título */}
      <div className="px-0.5">
        <h2 className="text-xl font-black text-manises-blue">Mi cesta</h2>
        <p className="mt-0.5 text-[11px] font-medium text-slate-400">
          {breakdown.totalDecimos} {breakdown.totalDecimos === 1 ? 'décimo seleccionado' : 'décimos seleccionados'}
        </p>
      </div>

      {/* Grupos por fecha */}
      {groupEntries.map(([drawDate, items], groupIdx) => {
        const isExpanded = expandedDates.has(drawDate);
        const groupTotal = totalDecimosForGroup(items);
        const isFirst = groupIdx === 0;

        return (
          <section
            key={drawDate}
            className="overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleDate(drawDate)}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/60',
                isFirst && 'border-b border-slate-50'
              )}
            >
              <div className="min-w-0 text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Sorteo</p>
                <p className="mt-0.5 text-[13px] font-black leading-tight text-manises-blue">
                  {formatDate(drawDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[11px] font-black text-manises-blue/60">
                  {groupTotal} {groupTotal === 1 ? 'décimo' : 'décimos'}
                </span>
                {isExpanded
                  ? <NavArrowUp className="h-3.5 w-3.5 text-slate-400" />
                  : <NavArrowDown className="h-3.5 w-3.5 text-slate-400" />
                }
              </div>
            </button>

            {isExpanded && (
              <div className="divide-y divide-slate-50 px-4">
                {items.map(({ key, line, amount }) => (
                  <div key={key} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[1.35rem] font-black tracking-[0.16em] text-manises-blue">
                        {line.number}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        {line.quantity} {line.quantity === 1 ? 'décimo' : 'décimos'} · {formatCurrency(amount)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                      {!hasShipping && (
                        <button
                          type="button"
                          disabled
                          className="text-[10px] font-black uppercase tracking-wider text-manises-blue/40 transition-colors hover:text-manises-blue disabled:cursor-default"
                          title="Próximamente"
                        >
                          Abonarme
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onViewTicket(line)}
                        className="text-[10px] font-bold text-manises-blue/50 transition-colors hover:text-manises-blue"
                      >
                        {hasShipping ? 'Ver ticket azul' : 'Ver décimo'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Dirección de envío */}
      {hasShipping && (
        <section className="rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Dirección de envío
          </p>
          <NationalShippingForm />
        </section>
      )}

      {/* Desglose */}
      <section className="rounded-[1.35rem] border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Décimos</span>
            <span className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.subtotal)}</span>
          </div>
          {breakdown.hasShipping && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Envío MRW (48/72 h)</span>
              <span className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.shippingCost)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[12px] font-black uppercase tracking-widest text-manises-blue">Total</span>
            <span className="text-xl font-black text-manises-blue">{formatCurrency(breakdown.total)}</span>
          </div>
        </div>
      </section>

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={breakdown.total}
        canContinue={breakdown.totalDecimos > 0}
        ctaLabel="Pagar"
        onContinue={onContinueToPayment}
        activeColor={game.color}
        validationText="Revisa tu resumen antes de continuar"
      />
    </div>
  );
}
