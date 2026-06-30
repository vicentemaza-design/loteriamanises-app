import type { ElementType } from 'react';
import { cn, formatCurrency } from '@/shared/lib/utils';

export interface GamePlayBottomMenuItem {
  id: string;
  label: string;
  value?: string;
  icon?: ElementType;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface GamePlayBottomMenuProps {
  availableBalance: number;
  totalPrice: number;
  canContinue: boolean;
  ctaLabel: string;
  onContinue: () => void;
  activeColor: string;
  drawsCount?: number;
  validationText?: string;
  summaryText?: string;
  menuItems?: GamePlayBottomMenuItem[];
  className?: string;
}

export function GamePlayBottomMenu({
  availableBalance,
  totalPrice,
  canContinue,
  ctaLabel,
  onContinue,
  activeColor,
  className,
}: GamePlayBottomMenuProps) {
  const isOverBalance = availableBalance < totalPrice;
  // El saldo insuficiente ya no bloquea el botón: se muestra el importe que falta junto al precio.
  const canSubmit = canContinue;

  const splitCurrency = (amount: number) => {
    const [euros = '0', cents = '00'] = amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).split(',');
    return { euros, cents };
  };

  const balance = splitCurrency(availableBalance);
  const total = splitCurrency(totalPrice);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0a4792]/88 shadow-[0_-8px_32px_rgba(0,0,0,0.25)] backdrop-blur-3xl',
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white">
        <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
          <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
          <p className={cn('relative text-[1.05rem] font-black leading-none tracking-normal', isOverBalance ? 'text-red-300' : 'text-manises-gold')}>
            {balance.euros}
            <sup className="ml-0.5 align-super text-[0.5rem] font-black">,{balance.cents}</sup>
          </p>
          <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">Saldo €</p>
        </div>

        <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
          <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
          <p className="relative text-[1.05rem] font-black leading-none tracking-normal text-white">
            {total.euros}
            <sup className="ml-0.5 align-super text-[0.5rem] font-black">,{total.cents}</sup>
          </p>
          <p className={cn('relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none', isOverBalance ? 'text-red-300' : 'text-white/58')}>
            {isOverBalance ? `Faltan ${formatCurrency(totalPrice - availableBalance)}` : 'Importe €'}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!canSubmit}
          className={cn(
            'relative m-1.5 flex h-auto min-w-0 items-center justify-center overflow-hidden rounded-xl bg-manises-gold px-4 text-[1rem] font-black leading-none tracking-normal text-manises-blue transition-all active:scale-[0.985]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14),0_0_14px_rgba(245,197,24,0.14)]',
            !canSubmit && 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
          )}
        >
          <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
          <span className="relative">
            {ctaLabel.charAt(0).toUpperCase() + ctaLabel.slice(1).toLowerCase()}
          </span>
        </button>
      </div>
    </div>
  );
}
