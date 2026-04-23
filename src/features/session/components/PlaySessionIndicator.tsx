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
        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-3 py-2 text-white shadow-lg backdrop-blur-md"
        aria-label={`Tus jugadas: ${summary.draftCount} jugadas, ${formatCurrency(summary.totalAmount)}`}
      >
        <ShoppingBagArrowUp className="h-4 w-4" />
        <div className="text-left leading-none">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/65">Tus jugadas</p>
          <p className="mt-1 text-[12px] font-black text-white">
            {summary.draftCount} · {formatCurrency(summary.totalAmount)}
          </p>
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
        'fixed bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full',
        'border border-manises-blue/15 bg-white/96 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.24)] backdrop-blur-2xl'
      )}
      aria-label={`Abrir tus jugadas: ${summary.draftCount} jugadas, ${formatCurrency(summary.totalAmount)}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-manises-blue text-white">
        <ShoppingBagArrowUp className="h-5 w-5" />
      </div>
      <div className="text-left leading-none">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Tus jugadas</p>
        <p className="mt-1 text-sm font-black text-manises-blue">
          {summary.draftCount} jugadas · {formatCurrency(summary.totalAmount)}
        </p>
      </div>
    </motion.button>
  );
}
