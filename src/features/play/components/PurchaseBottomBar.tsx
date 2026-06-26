import { Button } from '@/shared/ui/Button';
import { cn, formatCurrency } from '@/shared/lib/utils';

interface PurchaseBottomBarProps {
  availableBalance: number;
  totalPrice: number;
  canContinue: boolean;
  ctaLabel: string;
  onContinue: () => void;
  activeColor: string;
  drawsCount?: number;
  validationText?: string;
  summaryText?: string;
  className?: string;
}

export function PurchaseBottomBar({
  availableBalance,
  totalPrice,
  canContinue,
  ctaLabel,
  onContinue,
  activeColor,
  drawsCount,
  validationText,
  summaryText,
  className,
}: PurchaseBottomBarProps) {
  const isOverBalance = availableBalance < totalPrice;
  const remainingBalance = Math.max(availableBalance - totalPrice, 0);

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe', className)}>
      <div className={cn(
        'mx-auto flex max-w-screen-sm flex-col gap-2 rounded-[1.5rem] border p-2.5 shadow-[0_-10px_30px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all',
        isOverBalance ? 'border-red-200 bg-red-50/95' : 'border-white/80 bg-white/95'
      )}>
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-manises-blue/40">Saldo:</span>
              <span className="text-[11px] font-black text-manises-blue">{formatCurrency(availableBalance)}</span>
              <span className="mx-0.5 text-slate-300">·</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-manises-blue/40">Total:</span>
              <span className="text-[13px] font-black text-manises-blue" style={{ color: activeColor }}>
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <p className={cn(
                'text-[9px] font-bold uppercase tracking-tight',
                isOverBalance ? 'text-red-600' : 'text-emerald-600'
              )}>
                {isOverBalance
                  ? `Faltan ${formatCurrency(totalPrice - availableBalance)}`
                  : `Quedarán ${formatCurrency(remainingBalance)}`
                }
              </p>
              {drawsCount && drawsCount > 1 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-500">
                  {drawsCount} sorteos
                </span>
              )}
            </div>
          </div>

          <Button
            className={cn(
              'h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-[0.14em] shadow-sm transition-all active:scale-[0.98]',
              canContinue && !isOverBalance
                ? 'text-white'
                : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400 shadow-none'
            )}
            style={canContinue && !isOverBalance ? { backgroundColor: activeColor } : undefined}
            onClick={onContinue}
            disabled={!canContinue || isOverBalance}
          >
            {ctaLabel}
          </Button>
        </div>

        {(summaryText || (validationText && (!canContinue || isOverBalance))) && (
          <div className="border-t border-slate-100/50 px-1 pt-1.5">
            <p className="text-center text-[9px] font-bold uppercase leading-tight text-slate-400">
              {summaryText ?? validationText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
