import { ShoppingBagArrowUp } from 'iconoir-react/regular';
import { motion } from 'motion/react';
import { formatCurrency } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionSummary } from '../hooks/usePlaySessionSummary';

export function PlaySessionIndicator({ variant = 'fab' }: { variant?: 'fab' | 'header' }) {
  const { openReview } = usePlaySession();
  const summary = usePlaySessionSummary();

  if (summary.draftCount === 0) {
    return null;
  }

  if (variant === 'header') {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={openReview}
        className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-[1.15rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] px-2.5 py-2 text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl"
        aria-label={`Tus jugadas: ${summary.draftCount} jugadas, ${formatCurrency(summary.totalAmount)}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_42%)]" />
        <div className="relative flex h-9 w-9 items-center justify-center rounded-[0.95rem] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <ShoppingBagArrowUp className="h-4 w-4 text-white" />
        </div>
        <div className="relative text-left leading-none">
          <p className="text-[7px] font-black uppercase tracking-[0.16em] text-white/56">Tus jugadas</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="text-[12px] font-black text-white">{formatCurrency(summary.totalAmount)}</p>
            <span className="text-[10px] font-bold text-white/66">{summary.draftCount}</span>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={openReview}
      className={cn(
        'fixed bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 overflow-hidden rounded-[1.65rem]',
        'border border-white/38 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.16)_100%)] px-3.5 py-3 shadow-[0_18px_42px_rgba(15,23,42,0.18)] backdrop-blur-[22px]'
      )}
      aria-label={`Abrir tus jugadas: ${summary.draftCount} jugadas, ${formatCurrency(summary.totalAmount)}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_42%,rgba(255,255,255,0.04)_100%)]" />
      <div className="absolute inset-[1px] rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_36%)]" />
      <div className="absolute -right-8 top-0 h-16 w-16 rounded-full bg-manises-blue/[0.06] blur-2xl" />
      <div className="absolute left-5 top-0 h-10 w-24 rounded-full bg-white/14 blur-2xl" />
      <div className="relative flex h-11 w-11 items-center justify-center rounded-[1rem] border border-manises-blue/12 bg-[linear-gradient(180deg,rgba(10,71,146,0.96)_0%,rgba(13,86,179,0.92)_100%)] text-white shadow-[0_12px_24px_rgba(10,71,146,0.22)]">
        <ShoppingBagArrowUp className="h-[1.15rem] w-[1.15rem]" />
      </div>
      <div className="relative min-w-0 text-left leading-none">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">Tus jugadas</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <p className="text-[0.98rem] font-black text-manises-blue">{formatCurrency(summary.totalAmount)}</p>
          <span className="text-[11px] font-bold text-slate-600/90">
            {summary.draftCount} {summary.draftCount === 1 ? 'jugada' : 'jugadas'}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
