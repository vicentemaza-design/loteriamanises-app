import { useMemo } from 'react';
import { NavArrowLeft } from 'iconoir-react/regular';
import { Eye, Repeat2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { NationalTicketThumbnail } from '@/features/play/components/NationalTicketThumbnail';
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
  const hasMultipleDraws = groupEntries.length > 1;
  const canShowSubscription = !hasShipping && game.type === 'loteria-nacional';

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-2 text-[10px] font-black uppercase tracking-widest text-manises-blue"
          onClick={onBack}
        >
          <NavArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider',
          hasShipping ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
        )}>
          {hasShipping ? 'Mensajería' : 'Digital'}
        </span>
      </div>

      <section className="rounded-[1.55rem] border border-manises-blue/10 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Resumen de jugadas</p>
        <h2 className="mt-1 text-xl font-black text-manises-blue">
          {breakdown.totalDecimos} {breakdown.totalDecimos === 1 ? 'décimo' : 'décimos'}
        </h2>
        <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
          Revisa números, cantidades e importe antes de continuar.
        </p>
      </section>

      {groupEntries.map(([drawDate, items]) => (
        <section key={drawDate} className="rounded-[1.35rem] border border-slate-100 bg-white p-3 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                {hasMultipleDraws ? 'Sorteo' : 'Listado'}
              </p>
              <h3 className="mt-0.5 text-sm font-black text-manises-blue">{formatDate(drawDate)}</h3>
            </div>
            {hasShipping && (
              <span className="rounded-lg border border-manises-blue/10 bg-manises-blue/[0.04] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-manises-blue">
                Ticket azul
              </span>
            )}
          </div>

          <div className="space-y-2">
            {items.map(({ key, line, amount }) => (
              <div key={key} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-2.5">
                <NationalTicketThumbnail drawId={line.drawId} className="w-[72px] shadow-sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xl font-black tracking-[0.18em] text-manises-blue">{line.number}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    {line.quantity} {line.quantity === 1 ? 'décimo' : 'décimos'} · {formatCurrency(amount)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 bg-white px-2 text-[9px] font-black uppercase tracking-wider text-manises-blue"
                  onClick={() => onViewTicket(line)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {hasShipping ? 'Ver ticket azul' : 'Ver décimo'}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {canShowSubscription && (
        <section className="rounded-[1.15rem] border border-manises-blue/10 bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-blue/[0.06] text-manises-blue">
                <Repeat2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-manises-blue">Abonarme</h3>
                <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-slate-500">
                  Reserva preferente de este número para futuros sorteos. Gestión manual desde Mis abonos.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 rounded-lg border-manises-blue/15 bg-slate-50 px-2.5 text-[9px] font-black uppercase tracking-wider text-slate-400"
              disabled
            >
              Próximamente
            </Button>
          </div>
        </section>
      )}

      {hasShipping && (
        <>
          <section className="rounded-[1.35rem] border border-slate-100 bg-white p-3 shadow-sm">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Dirección de envío</p>
            <NationalShippingForm />
          </section>

          <section className="rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Desglose</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Décimos</span>
                <span className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">Gastos de envío</span>
                <span className="text-[12px] font-black text-manises-blue">{formatCurrency(breakdown.shippingCost)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[12px] font-black uppercase tracking-widest text-manises-blue">Total</span>
                <span className="text-lg font-black text-manises-blue">{formatCurrency(breakdown.total)}</span>
              </div>
            </div>
          </section>
        </>
      )}

      <PurchaseBottomBar
        availableBalance={availableBalance}
        totalPrice={breakdown.total}
        canContinue={breakdown.totalDecimos > 0}
        ctaLabel="Continuar a pago"
        onContinue={onContinueToPayment}
        activeColor={game.color}
        validationText="Revisa tu resumen de jugadas antes de continuar"
      />
    </div>
  );
}
