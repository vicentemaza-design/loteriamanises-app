import { motion, AnimatePresence } from 'motion/react';
import { NavArrowRight } from 'iconoir-react/regular';
import { formatCurrency } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';

export function CartBottomBar() {
  const { gameDrafts, lotteryDrafts, openGameReview, openLotteryReview } = usePlaySession();

  const gamesTotal = gameDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const lotteryTotal = lotteryDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const hasGames = gameDrafts.length > 0;
  const hasLottery = lotteryDrafts.length > 0;

  if (!hasGames && !hasLottery) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cart-bottom-bar"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
        className="fixed left-0 right-0 z-[65] bg-[#0a4792]/80 backdrop-blur-3xl border-t border-white/8"
        style={{ bottom: 'var(--nav-height)' }}
      >
        <div className={`grid gap-2 px-2 py-2 ${hasGames && hasLottery ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {hasGames && (
            <button
              type="button"
              onClick={openGameReview}
              className="flex items-center justify-between gap-2 rounded-xl bg-[#1d7a47] px-3.5 py-2.5 text-white transition-all active:scale-[0.98]"
            >
              <div className="min-w-0 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Juegos</p>
                <p className="text-[15px] font-black leading-tight">{formatCurrency(gamesTotal)}</p>
                <p className="text-[9px] font-semibold text-white/60">
                  {gameDrafts.length} {gameDrafts.length === 1 ? 'jugada' : 'jugadas'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 text-white/80">
                <span className="text-[10px] font-black uppercase tracking-widest">Pagar</span>
                <NavArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          )}

          {hasLottery && (
            <button
              type="button"
              onClick={openLotteryReview}
              className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-white transition-all active:scale-[0.98] border border-white/15"
            >
              <div className="min-w-0 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Lotería</p>
                <p className="text-[15px] font-black leading-tight">{formatCurrency(lotteryTotal)}</p>
                <p className="text-[9px] font-semibold text-white/60">
                  {lotteryDrafts.length} {lotteryDrafts.length === 1 ? 'décimo' : 'décimos'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 text-white/80">
                <span className="text-[10px] font-black uppercase tracking-widest">Pagar</span>
                <NavArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
