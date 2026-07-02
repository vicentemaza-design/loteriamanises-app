import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2, Eye, Lock, Ticket, Edit3, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionSummary } from '../hooks/usePlaySessionSummary';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NationalTicketVisual } from '@/features/play/components/NationalTicketVisual';
import { InsufficientBalanceModal } from '@/features/play/components/InsufficientBalanceModal';
import { TopUpModal } from '@/features/profile/components/TopUpModal';
import type { PlayDraft } from '../types/session.types';

export function PlaySessionTray() {
  const navigate = useNavigate();
  const { user, isDemo, profile } = useAuth();
  const { topUp } = useWallet();
  const { drafts, status, errorMessage, openReview, closeReview, removeDraft, updateDraft } = usePlaySession();
  const summary = usePlaySessionSummary();
  const { confirm, isSubmitting } = usePlaySessionConfirm();

  const [previewDraft, setPreviewDraft] = useState<PlayDraft | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({});
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const isOpen = status === 'reviewing' || status === 'confirming' || status === 'failed';
  const canAttemptCheckout = Boolean(user || isDemo);
  const availableBalance = profile?.balance ?? 0;
  const remainingBalance = Math.max(availableBalance - summary.totalAmount, 0);
  const isOverBalance = canAttemptCheckout && availableBalance < summary.totalAmount;

  // Toggle expanded state for a date accordion
  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Toggle expanded state for list overflow
  const toggleListOverflow = (listKey: string) => {
    setExpandedLists((prev) => ({
      ...prev,
      [listKey]: !prev[listKey],
    }));
  };

  const toggleAbono = (draft: PlayDraft) => {
    updateDraft(draft.id, {
      ...draft,
      isSubscription: !draft.isSubscription,
    });
  };

  // Helper for selection formatting
  const getSelectionDisplay = (draft: PlayDraft) => {
    if (draft.selection.type === 'national') {
      return draft.selection.number;
    }
    if (draft.selection.type === 'quiniela') {
      return `${draft.selection.matches.length} partidos`;
    }
    if ('numbers' in draft.selection) {
      const numbersLabel = draft.selection.numbers.join(' ');
      const starsLabel = 'stars' in draft.selection ? ` + ${draft.selection.stars.join(' ')}` : '';
      return `${numbersLabel}${starsLabel}`;
    }
    return 'Apuesta';
  };

  // Helper to format date header in accordions
  const formatDateHeader = (isoDate: string) => {
    const d = new Date(isoDate);
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
    const day = d.getDate();
    const month = d.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
    const year = d.getFullYear();
    return `${dayName} ${day} ${month} ${year}`;
  };

  // Count unique games and unique dates in the cart
  const uniqueDrawDatesCount = useMemo(() => {
    const dates = new Set(drafts.map((d) => `${d.gameId}-${d.drawDate}`));
    return dates.size;
  }, [drafts]);

  // Grouping logic
  const groupedGames = useMemo(() => {
    const gameMap: Record<string, PlayDraft[]> = {};
    drafts.forEach((draft) => {
      if (!gameMap[draft.gameId]) {
        gameMap[draft.gameId] = [];
      }
      gameMap[draft.gameId].push(draft);
    });

    return Object.entries(gameMap).map(([gameId, gameDrafts]) => {
      const firstDraft = gameDrafts[0];
      const game = LOTTERY_GAMES.find((g) => g.id === gameId);
      const gameName = game?.name ?? firstDraft.gameName;
      const gameColor = game?.color ?? '#0a4792';

      // Group by date
      const dateMap: Record<string, PlayDraft[]> = {};
      gameDrafts.forEach((draft) => {
        const dateKey = draft.drawDate;
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = [];
        }
        dateMap[dateKey].push(draft);
      });

      const datesList = Object.entries(dateMap).map(([date, dateDrafts]) => {
        return {
          date,
          drafts: dateDrafts,
        };
      });

      const totalDecimos = gameDrafts.reduce((acc, d) => acc + (d.quantity || 1), 0);

      return {
        gameId,
        gameName,
        gameColor,
        totalDecimos,
        dates: datesList,
      };
    });
  }, [drafts]);

  // Render a single draft item card/row
  const renderDraftRow = (draft: PlayDraft) => {
    const isNational = draft.gameType === 'loteria-nacional' || draft.gameType === 'navidad' || draft.gameType === 'nino';
    
    return (
      <div key={draft.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-black text-manises-blue leading-none">
              {getSelectionDisplay(draft)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {isNational ? `${draft.quantity} d.` : `${draft.betsCount ?? 1} ap.`} · {formatCurrency(draft.totalPrice)}
            </span>
          </div>
          
          <div className="mt-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
            {isNational && (
              <>
                <button
                  onClick={() => toggleAbono(draft)}
                  className={cn(
                    "font-black uppercase tracking-wider px-2 py-0.5 rounded transition-all active:scale-95 border",
                    draft.isSubscription
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                      : "border-slate-200 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {draft.isSubscription ? 'Abonado' : 'Abonarme'}
                </button>
                <span className="text-slate-300">·</span>
              </>
            )}
            <button
              onClick={() => setPreviewDraft(draft)}
              className="font-black uppercase tracking-wider text-manises-blue/70 hover:text-manises-blue hover:bg-slate-100 transition-all px-2 py-0.5 rounded"
            >
              Ver
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              closeReview();
              navigate(`/play/${draft.gameId}`, { state: { playDraftId: draft.id } });
            }}
            className="p-2 text-slate-400 hover:text-manises-blue hover:bg-slate-100 rounded-xl transition-all"
            title="Editar jugada"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeDraft(draft.id)}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
            title="Eliminar jugada"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

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
            className="fixed inset-x-0 bottom-0 z-[80] mx-auto flex max-h-[86vh] w-full max-w-screen-sm flex-col rounded-t-[2.5rem] bg-slate-50 shadow-[0_-28px_60px_rgba(15,23,42,0.28)]"
          >
            <div className="px-5 pt-4" style={{ paddingBottom: 'max(1.5rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))' }}>
              <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
              
              {/* Header */}
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Revisión antes de pagar</p>
                  <h2 className="mt-1 text-2xl font-black text-manises-blue uppercase tracking-tight">Resumen de jugadas</h2>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200/50" onClick={closeReview}>
                  Cerrar
                </Button>
              </div>

              {/* Tab selector mock */}
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-manises-blue/[0.06] border border-manises-blue/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-manises-blue">
                  <Ticket className="w-3.5 h-3.5 text-manises-blue" /> Décimos digitales
                </span>
              </div>

              {errorMessage && (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* Scrollable Container with Accordions */}
              <div className="mt-4 flex-1 overflow-y-auto max-h-[48vh] pr-1 space-y-4">
                {uniqueDrawDatesCount <= 1 ? (
                  // --- CASO 1: UN SÓLO SORTEO SELECCIONADO (Listado plano) ---
                  groupedGames.map((gameGroup) => {
                    const dateGroup = gameGroup.dates[0];
                    if (!dateGroup) return null;
                    
                    const isListExpanded = expandedLists[gameGroup.gameId] ?? false;
                    const itemsToShow = isListExpanded ? dateGroup.drafts : dateGroup.drafts.slice(0, 5);
                    const remainingCount = dateGroup.drafts.length - 5;

                    return (
                      <div key={gameGroup.gameId} className="rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-2.5">
                          <div>
                            <h3 className="text-[12px] font-black text-manises-blue uppercase tracking-tight">
                              {gameGroup.gameName}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                              {formatDate(dateGroup.date)}
                            </p>
                          </div>
                          <span className="rounded-full bg-manises-blue/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-manises-blue">
                            {gameGroup.totalDecimos} {gameGroup.totalDecimos === 1 ? 'décimo' : 'décimos'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {itemsToShow.map(renderDraftRow)}
                        </div>

                        {remainingCount > 0 && (
                          <button
                            onClick={() => toggleListOverflow(gameGroup.gameId)}
                            className="w-full mt-3 text-center text-[10px] font-black uppercase tracking-widest text-manises-blue hover:text-manises-blue-soft transition-colors py-1 bg-slate-50 rounded-xl"
                          >
                            {isListExpanded 
                              ? '▲ Contraer listado' 
                              : `▼ Ver los ${remainingCount} restantes`
                            }
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // --- CASO 2: MÚLTIPLES SORTEOS (Agrupados con acordeones) ---
                  groupedGames.map((gameGroup) => (
                    <div key={gameGroup.gameId} className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                      {/* Cabecera del juego */}
                      <div className="bg-slate-100/50 px-4 py-3 border-b border-slate-200/60 flex items-center justify-between">
                        <div>
                          <h3 className="text-[11px] font-black text-manises-blue uppercase tracking-widest">
                            {gameGroup.gameName}
                          </h3>
                          <p className="text-[9px] font-medium text-slate-400 mt-0.5">Varios sorteos seleccionados</p>
                        </div>
                        <span className="rounded-full bg-manises-blue/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-manises-blue">
                          {gameGroup.totalDecimos} {gameGroup.totalDecimos === 1 ? 'décimo' : 'décimos'}
                        </span>
                      </div>

                      {/* Acordeones de fechas internas */}
                      <div className="divide-y divide-slate-100">
                        {gameGroup.dates.map((dateGroup, dateIdx) => {
                          const dateKey = `${gameGroup.gameId}-${dateGroup.date}`;
                          // Expanded by default for first item
                          const isExpanded = expandedDates[dateKey] !== undefined 
                            ? expandedDates[dateKey] 
                            : dateIdx === 0;

                          const totalDateDecimos = dateGroup.drafts.reduce((acc, d) => acc + (d.quantity || 1), 0);
                          const isListExpanded = expandedLists[dateKey] ?? false;
                          const itemsToShow = isListExpanded ? dateGroup.drafts : dateGroup.drafts.slice(0, 5);
                          const remainingCount = dateGroup.drafts.length - 5;

                          return (
                            <div key={dateGroup.date} className="p-1">
                              <button
                                onClick={() => toggleDate(dateKey)}
                                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50/50 rounded-2xl transition-all"
                              >
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-manises-blue" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                                  {formatDateHeader(dateGroup.date)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 leading-none">
                                  {totalDateDecimos} {totalDateDecimos === 1 ? 'décimo' : 'décimos'}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="px-3 pb-2 pt-1 divide-y divide-slate-100">
                                  {itemsToShow.map(renderDraftRow)}

                                  {remainingCount > 0 && (
                                    <button
                                      onClick={() => toggleListOverflow(dateKey)}
                                      className="w-full mt-2 text-center text-[9px] font-black uppercase tracking-widest text-manises-blue hover:text-manises-blue-soft transition-colors py-1.5 bg-slate-50 rounded-xl"
                                    >
                                      {isListExpanded 
                                        ? '▲ Contraer listado' 
                                        : `▼ Ver los ${remainingCount} restantes`
                                      }
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer: balance + pago */}
              <div className="mt-3 overflow-hidden rounded-[2rem] border border-manises-blue/10 bg-white shadow-manises">
                {/* Fila saldo — compacta */}
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <div className="flex-1">
                    <p className="mb-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Saldo disponible</p>
                    <p className="text-[13px] font-black leading-none text-manises-blue">
                      {canAttemptCheckout ? formatCurrency(availableBalance) : '—'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-300">→</span>
                  <div className="flex-1 text-right">
                    <p className="mb-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                      {isOverBalance ? 'Déficit' : 'Saldo restante'}
                    </p>
                    <p className={cn('text-[13px] font-black leading-none', isOverBalance ? 'text-rose-600' : 'text-emerald-600')}>
                      {canAttemptCheckout
                        ? (isOverBalance ? formatCurrency(summary.totalAmount - availableBalance) : formatCurrency(remainingBalance))
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Total + CTA */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Total sesión</p>
                    <p className="mt-0.5 text-2xl font-black leading-none text-manises-blue">{formatCurrency(summary.totalAmount)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Button
                      className="h-12 rounded-2xl bg-manises-blue px-8 text-sm font-black uppercase tracking-widest text-white shadow-manises transition-transform active:scale-[0.98]"
                      disabled={!summary.canConfirm || isSubmitting}
                      onClick={async () => {
                        if (canAttemptCheckout && isOverBalance) {
                          setShowInsufficientBalance(true);
                          return;
                        }
                        if (status !== 'reviewing' && status !== 'failed') {
                          openReview();
                          return;
                        }
                        const result = await confirm();
                        if (result.needsAuth) {
                          closeReview();
                          navigate('/');
                        }
                      }}
                    >
                      {isSubmitting ? 'Procesando...' : canAttemptCheckout ? 'Pagar >' : 'Accede'}
                    </Button>
                    <span className="flex select-none items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Pago 100% seguro
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.section>
        </>
      )}

      {/* Visualizer Modal for the décimo/bet */}
      <AnimatePresence>
        {previewDraft && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-200/80 shadow-2xl p-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-xs font-black text-manises-blue uppercase tracking-widest">Vista previa</h3>
                <button onClick={() => setPreviewDraft(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cerrar
                </button>
              </div>

              {previewDraft.selection.type === 'national' ? (
                <div className="flex justify-center p-1.5 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                  <NationalTicketVisual
                    number={previewDraft.selection.number}
                    drawLabel={previewDraft.metadata?.nationalDrawLabel ?? previewDraft.gameName}
                    drawDate={previewDraft.drawDate}
                    price={previewDraft.unitPrice}
                    gameId={previewDraft.gameId}
                    drawType={previewDraft.gameId === 'loteria-navidad' ? 'navidad' : previewDraft.gameId === 'loteria-nino' ? 'nino' : 'ordinary'}
                  />
                </div>
              ) : (
                <div className="p-5 rounded-3xl text-white shadow-manises" style={{ background: `linear-gradient(135deg, ${LOTTERY_GAMES.find(g => g.id === previewDraft.gameId)?.color ?? '#0a4792'}, ${LOTTERY_GAMES.find(g => g.id === previewDraft.gameId)?.colorEnd ?? '#0a4792'})` }}>
                  <div className="flex items-center gap-2">
                    <GameBadge game={LOTTERY_GAMES.find(g => g.id === previewDraft.gameId) ?? (previewDraft as any)} size="sm" className="bg-white/10 shadow-none text-white w-8 h-8 rounded-lg" />
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{previewDraft.gameName}</h4>
                      <p className="text-[10px] text-white/60 font-medium">{formatDate(previewDraft.drawDate)}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {'numbers' in previewDraft.selection && previewDraft.selection.numbers.map((n) => (
                      <span key={n} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-manises-blue font-black text-xs shadow-sm">
                        {n}
                      </span>
                    ))}
                    {'stars' in previewDraft.selection && previewDraft.selection.stars.map((s) => (
                      <span key={s} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-manises-gold text-manises-blue font-black text-xs shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 text-center text-[9px] font-black uppercase tracking-[0.16em] text-white/50">
                    Resguardo de Apuesta Oficial
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal saldo insuficiente */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalance}
        missingAmount={summary.totalAmount - availableBalance}
        onClose={() => setShowInsufficientBalance(false)}
        onAddBalance={() => {
          setShowInsufficientBalance(false);
          setIsTopUpOpen(true);
        }}
      />

      {/* Modal añadir saldo */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={availableBalance}
        onSuccess={async (amount) => {
          const result = await topUp(amount);
          if (!result?.success) throw new Error('Top-up failed');
        }}
      />
    </AnimatePresence>
  );
}
