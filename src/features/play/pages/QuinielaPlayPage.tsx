import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { WarningTriangle, ControlSlider } from 'iconoir-react/regular';
import { RefreshCircle } from 'iconoir-react/regular';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { panelSwap, sectionFadeUp } from '@/shared/lib/motion';
import { QUINIELA_REDUCED_TABLES, type QuinielaReducedType } from '../lib/bet-calculator';
import { getGameHelpContent } from '../lib/game-help';
import {
  getAvailableModesForGame,
  getReductionSystemsForMode,
  type PlayMode,
} from '../lib/play-matrix';
import { resolvePlayPricing } from '../application/resolve-play-pricing';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import { resolveDrawDates, inferScheduleModeFromDrawDates } from '../application/resolve-draw-dates';
import { resolveDrawStatus } from '../draw-status/application/resolve-draw-status';
import { getBusinessDate } from '@/shared/lib/timezone';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { GameModeSelector } from '../components/GameModeSelector';
import { ReductionSystemSelector } from '../components/ReductionSystemSelector';
import { PurchaseBottomBar } from '../components/PurchaseBottomBar';
import { DrawStatusPill } from '../draw-status/components/DrawStatusPill';
import { QuinielaProfessionalSelector } from '../components/QuinielaProfessionalSelector';
import type { LotteryGame } from '@/shared/types/domain';

interface GamePlayLocationState { playDraftId?: string; }

interface QuinielaMatch {
  id: number;
  home: string;
  away: string;
  result: string | null;
}

interface QuinielaPlayPageProps {
  game: LotteryGame;
}

export function QuinielaPlayPage({ game }: QuinielaPlayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { drafts, addDrafts, updateDraft, openReview } = usePlaySession();

  const editingDraftId = (location.state as GamePlayLocationState | null)?.playDraftId;
  const editingDraft = useMemo(
    () => drafts.find((d) => d.id === editingDraftId),
    [drafts, editingDraftId]
  );

  const availableModes: PlayMode[] = getAvailableModesForGame(game.id);

  const [mode, setMode] = useState<PlayMode>(availableModes[0]);
  const [quinielaMatches, setQuinielaMatches] = useState<QuinielaMatch[]>([]);
  const [selectedReductionSystemId, setSelectedReductionSystemId] = useState<string>('reducida_1');
  const [isSubscription, setIsSubscription] = useState(false);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Restore editing draft
  useEffect(() => {
    if (!editingDraft || editingDraft.gameId !== game.id) return;
    if (editingDraft.selection.type !== 'quiniela') return;
    setMode((editingDraft.mode as PlayMode) ?? availableModes[0]);
    setIsSubscription(editingDraft.isSubscription);
    setSelectedReductionSystemId(editingDraft.selection.systemId ?? 'reducida_1');
    setQuinielaMatches((current) =>
      current.map((match) => {
        const found =
          editingDraft.selection.type === 'quiniela'
            ? editingDraft.selection.matches.find((item) => item.id === match.id)
            : undefined;
        return { ...match, result: found?.value ?? null };
      })
    );
  }, [availableModes, editingDraft, game.id]);

  useEffect(() => {
    setIsConfigPanelOpen(false);
  }, [game.id, editingDraftId]);

  const reductionSystems = getReductionSystemsForMode(game.id, mode);

  const drawStatus = useMemo(
    () => resolveDrawStatus({ drawDate: getBusinessDate(game.nextDraw) }),
    [game.nextDraw]
  );

  const { betsCount, drawPrice, totalPrice } = resolvePlayPricing({
    game,
    isNationalLottery: false,
    isQuiniela: true,
    mode,
    selectedNumbersCount: 0,
    selectedStarsCount: 0,
    selectedReductionSystemId,
    selectedNationalQuantity: 0,
    selectedNationalDraw: {},
    drawsCount: 1,
  });

  const availableBalance = profile?.balance ?? 0;
  const isOverBalance = profile ? profile.balance < totalPrice : false;

  const helpContent = getGameHelpContent({ game, mode, betsCount, totalPrice });

  const isQuinielaValid =
    quinielaMatches.every((m) => m.result !== null) &&
    (mode !== 'reduced' ||
      (quinielaMatches.filter((m) => ['1X', '12', 'X2'].includes(m.result!)).length ===
        QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType].dobles &&
        quinielaMatches.filter((m) => m.result === '1X2').length ===
          QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType].triples));

  const canPlay = isQuinielaValid;
  const shouldShowStickyCta = quinielaMatches.some((m) => m.result !== null);

  const handlePlay = async () => {
    if (!canPlay) {
      if (mode === 'reduced') {
        const config = QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType];
        toast.error(`Requisitos: ${config.dobles}D y ${config.triples}T`);
      } else {
        toast.error('Completa el pronóstico');
      }
      return;
    }

    const draftSelection = buildGameSelection({
      game,
      isNationalLottery: false,
      isQuiniela: true,
      mode,
      selectedNumbers: [],
      selectedStars: [],
      quinielaMatches,
      selectedReductionSystemId,
      selectedNationalNumber: null,
      selectedNationalDraw: { label: '' },
    });

    if (!draftSelection) {
      toast.error('No se ha podido construir la jugada.');
      return;
    }

    const drawDate = getBusinessDate(game.nextDraw);
    const resolution = resolveDrawDates({
      gameType: game.type,
      gameNextDraw: game.nextDraw,
      isNationalLottery: false,
      isExplicitNationalProduct: false,
      supportsTimeSelection: false,
      scheduleMode: 'next_draw',
      selectedDrawDates: [],
      selectedWeeksCount: 1,
      selectedNationalDrawNextDraw: game.nextDraw,
      availableNationalDates: [],
    });
    const drawDates = resolution.drawDates.length > 0 ? resolution.drawDates : [drawDate];

    if (editingDraft && drawDates.length !== 1) {
      toast.error('La edición de una jugada existente solo admite un sorteo.');
      return;
    }

    const nextDrafts = buildPlayDrafts({
      game,
      selection: draftSelection,
      drawDates,
      totalPrice,
      unitPrice: drawPrice,
      quantity: 1,
      mode,
      betsCount,
      isSubscription,
      supportsTimeSelection: false,
      timeMode: resolution.scheduleMode,
      weeksCount: resolution.weeksCount,
      selectedNationalNumber: null,
      selectedNationalQuantity: 0,
      selectedNationalDraw: { label: '' },
      selectedReductionSystemId,
      editingDraft: editingDraft
        ? { id: editingDraft.id, addedAt: editingDraft.addedAt }
        : undefined,
    });

    if (editingDraft) {
      const result = updateDraft(editingDraft.id, nextDrafts[0]);
      if (result.duplicate) {
        toast.error('Ya tienes esta jugada añadida.');
        return;
      }
      navigate(location.pathname, { replace: true, state: null });
      toast.success('Jugada actualizada.');
      return;
    }

    const result = addDrafts(nextDrafts);
    if (result.addedCount > 0) {
      notifyAddedToCart(result, openReview);
      setQuinielaMatches((prev) => prev.map((m) => ({ ...m, result: null })));
    }
    if (result.duplicateCount > 0 && result.addedCount === 0) {
      toast.error('Ya tenías esa jugada en la sesión.');
    }
  };

  const ctaLabel = canPlay
    ? editingDraft
      ? 'Actualizar'
      : 'Añadir jugada'
    : 'Completa el pronóstico de los 15 partidos';

  return (
    <div
      className={cn(
        'flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] transition-[padding]',
        shouldShowStickyCta ? 'pb-32' : 'pb-6'
      )}
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <GamePlayHeader
        game={game}
        drawTime={game.nextDraw}
        onBack={() => navigate(-1)}
        onInfo={() => setIsInfoOpen(true)}
      />

      <GameInfoSheet
        game={game}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        content={helpContent}
      />

      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-2.5 p-4 pt-2">
        {/* Config bar — colapsado */}
        {!isConfigPanelOpen && (
          <button
            onClick={() => setIsConfigPanelOpen(true)}
            className="group w-full text-left rounded-[1.2rem] border border-slate-200/60 bg-white px-3.5 py-3 shadow-sm hover:border-manises-blue/20 hover:shadow-md transition-all active:scale-[0.99]"
            aria-expanded={false}
            aria-label="Abrir configuración de jugada"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                drawStatus.state === 'open' ? 'bg-emerald-50 text-emerald-600' :
                drawStatus.state === 'closingSoon' ? 'bg-amber-50 text-amber-600' :
                'bg-slate-100 text-slate-400',
              )}>
                <ControlSlider className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    drawStatus.state === 'open' ? 'bg-emerald-400' :
                    drawStatus.state === 'closingSoon' ? 'bg-amber-400' :
                    'bg-slate-300',
                  )} />
                  <span className="text-[12px] font-black text-manises-blue leading-tight">
                    {availableModes.length > 1
                      ? ({ simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' } as Record<PlayMode, string>)[mode]
                      : 'Jugada'}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 truncate pl-3">
                  {new Date(game.nextDraw).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' · Cierre '}
                  {new Date(drawStatus.salesCloseAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-manises-blue/[0.06] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-manises-blue/60 group-hover:bg-manises-blue/10 group-hover:text-manises-blue transition-colors">
                Cambiar
              </span>
            </div>
          </button>
        )}

        {/* Config panel — expandido */}
        {isConfigPanelOpen && (
          <motion.div variants={sectionFadeUp} initial="hidden" animate="visible">
            <div className="space-y-3 rounded-[1.2rem] border border-manises-blue/10 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-manises-blue/[0.06]">
                    <ControlSlider className="w-3.5 h-3.5 text-manises-blue/60" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-manises-blue">
                    Configurar jugada
                  </span>
                </div>
                <button
                  onClick={() => setIsConfigPanelOpen(false)}
                  className="flex h-9 items-center justify-center rounded-xl px-3 text-[10px] font-bold uppercase tracking-widest text-manises-blue/60 hover:bg-manises-blue/[0.06] hover:text-manises-blue transition-colors"
                  aria-label="Cerrar configuración"
                >
                  Cerrar
                </button>
              </div>

              <DrawStatusPill drawStatus={drawStatus} selectedDrawsCount={1} />

              {availableModes.length > 1 && (
                <div>
                  <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    Tipo de jugada
                  </p>
                  <GameModeSelector
                    gameType={game.type}
                    availableModes={availableModes}
                    currentMode={mode}
                    onModeChange={(m) => {
                      setMode(m);
                      const nextSystems = getReductionSystemsForMode(game.id, m);
                      if (m === 'reduced' && nextSystems.length > 0) {
                        setSelectedReductionSystemId(nextSystems[0].id);
                      }
                      setQuinielaMatches((prev) => prev.map((match) => ({ ...match, result: null })));
                      setIsConfigPanelOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Aviso saldo insuficiente */}
        {isOverBalance && (
          <motion.div
            variants={sectionFadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-[linear-gradient(180deg,#fff5f5_0%,#fff1f2_100%)] p-3.5 shadow-sm"
          >
            <WarningTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-normal">
              Saldo insuficiente ({formatCurrency(profile?.balance ?? 0)}).<br />
              Necesitas {formatCurrency(totalPrice)} para jugar esta variante.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`quiniela-${mode}`}
            variants={panelSwap}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mode === 'reduced' && (
                <motion.div
                  key={`quiniela-reduced-${selectedReductionSystemId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.16 } }}
                  className="space-y-3"
                >
                  <ReductionSystemSelector
                    systems={reductionSystems}
                    currentSystemId={selectedReductionSystemId}
                    onChange={(systemId) => setSelectedReductionSystemId(systemId)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <QuinielaProfessionalSelector
              mode={mode}
              reducedType={mode === 'reduced' ? (selectedReductionSystemId as QuinielaReducedType) : undefined}
              onSelectionChange={(m) => setQuinielaMatches(m)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Abono semanal */}
        <div className="mt-2 space-y-3">
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            initial="hidden"
            animate="visible"
            whileTap={{ scale: 0.985 }}
            onClick={() => setIsSubscription(!isSubscription)}
            className={cn(
              'relative overflow-hidden rounded-[1.65rem] border p-4 transition-all cursor-pointer',
              isSubscription
                ? 'border-manises-blue bg-[linear-gradient(135deg,rgba(10,71,146,0.08)_0%,rgba(10,71,146,0.14)_100%)] shadow-[0_18px_40px_rgba(10,71,146,0.14)]'
                : 'border-manises-blue/10 bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] shadow-[0_12px_28px_rgba(15,23,42,0.06)] hover:border-manises-blue/20'
            )}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-manises-gold/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                  isSubscription ? 'bg-manises-blue text-white' : 'bg-manises-blue/8 text-manises-blue'
                )}>
                  <RefreshCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-manises-blue">Abono semanal</h3>
                    <span className="rounded-full border border-manises-gold/30 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-900">
                      Recomendado
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">
                    Repite esta jugada automáticamente en próximos sorteos para no quedarte fuera si sube el bote.
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-manises-blue/72">
                    Puedes pausar o dar de baja tu abono desde{' '}
                    <span className="font-black">Mi cuenta &gt; Mis abonos</span>.
                  </p>
                </div>
              </div>
              <div className={cn(
                'mt-1 flex h-7 w-12 shrink-0 rounded-full transition-colors relative',
                isSubscription ? 'bg-manises-blue' : 'bg-gray-200'
              )}>
                <motion.div
                  animate={{ x: isSubscription ? 24 : 4 }}
                  className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap gap-2">
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]',
                isSubscription
                  ? 'border border-manises-blue/15 bg-white/80 text-manises-blue'
                  : 'border border-manises-blue/10 bg-manises-blue/[0.05] text-manises-blue/80'
              )}>
                {isSubscription ? 'Abono activado en esta simulación' : 'Actívalo con un toque'}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                Sin permanencia
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {shouldShowStickyCta && (
        <PurchaseBottomBar
          availableBalance={availableBalance}
          totalPrice={totalPrice}
          canContinue={canPlay}
          ctaLabel={ctaLabel}
          onContinue={handlePlay}
          activeColor={game.color}
          validationText="Completa el pronóstico de los 15 partidos"
        />
      )}
    </div>
  );
}
