import { AnimatePresence, motion } from 'motion/react';
import { NavArrowRight } from 'iconoir-react/regular';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionSummary } from '../hooks/usePlaySessionSummary';
import { PlayDraftItem } from './PlayDraftItem';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';

export function PlaySessionTray() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { drafts, status, errorMessage, closeReview, openReview, removeDraft } = usePlaySession();
  const summary = usePlaySessionSummary();
  const { confirm, isSubmitting } = usePlaySessionConfirm();

  const isOpen = status === 'reviewing' || status === 'confirming' || status === 'failed';
  const availableBalance = profile?.balance ?? 0;
  const remainingBalance = Math.max(availableBalance - summary.totalAmount, 0);
  const isOverBalance = availableBalance < summary.totalAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReview}
            className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[2px]"
            aria-label="Cerrar resumen de jugadas"
          />

          <motion.section
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-[80] mx-auto flex max-h-[82vh] w-full max-w-screen-sm flex-col rounded-t-[2rem] bg-slate-50 shadow-[0_-28px_60px_rgba(15,23,42,0.28)]"
          >
            <div className="px-5 pb-safe pt-4">
              <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Revisión final</p>
                  <h2 className="mt-1 text-2xl font-black text-manises-blue">Resumen de jugadas</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {summary.draftCount} jugadas acumuladas · {formatCurrency(summary.totalAmount)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl" onClick={closeReview}>
                  Cerrar
                </Button>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="mt-5 flex max-h-[44vh] flex-col gap-3 overflow-y-auto pr-1">
                {drafts.map((draft) => (
                  <PlayDraftItem
                    key={draft.id}
                    draft={draft}
                    onEdit={() => {
                      closeReview();
                      navigate(`/play/${draft.gameId}`, { state: { playDraftId: draft.id } });
                    }}
                    onRemove={() => removeDraft(draft.id)}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-[1.6rem] border border-manises-blue/10 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Saldo disponible</p>
                    <p className="mt-1 text-lg font-black text-manises-blue">{formatCurrency(availableBalance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                      {isOverBalance ? 'Déficit actual' : 'Saldo restante'}
                    </p>
                    <p className={`mt-1 text-lg font-black ${isOverBalance ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {isOverBalance ? formatCurrency(summary.totalAmount - availableBalance) : formatCurrency(remainingBalance)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Total sesión</p>
                    <p className="mt-1 text-2xl font-black text-manises-blue">{formatCurrency(summary.totalAmount)}</p>
                  </div>
                  <Button
                    className="h-12 rounded-2xl bg-manises-blue px-5 text-white"
                    disabled={!summary.canConfirm || isOverBalance || isSubmitting}
                    onClick={() => {
                      if (status !== 'reviewing' && status !== 'failed') {
                        openReview();
                        return;
                      }
                      void confirm();
                    }}
                  >
                    {isSubmitting ? 'Procesando...' : `Participar · ${formatCurrency(summary.totalAmount)}`}
                    {!isSubmitting && <NavArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
