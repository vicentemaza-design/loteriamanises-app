import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Shield, InfoCircle } from 'iconoir-react/regular';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { getGameHelpContent } from '../lib/game-help';
import { resolveDrawDates } from '../application/resolve-draw-dates';
import { buildGameSelection } from '../application/build-game-selection';
import { buildPlayDrafts } from '../application/build-play-drafts';
import { getBusinessDate } from '@/shared/lib/timezone';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { PurchaseBottomBar } from '../components/PurchaseBottomBar';
import { QuinielaSimpleSection, type QuinielaSimpleSummary } from '../components/QuinielaSimpleSection';
import { QuinielaManisesSection, type QuinielaManisesSummary } from '../components/QuinielaManisesSection';
import { QuinielaOficialSection, type QuinielaOficialSummary } from '../components/QuinielaOficialSection';
import { getUpcomingJornadaDates } from '../lib/quiniela-fixtures';
import { getFixturesForDate } from '../lib/quiniela-fixtures';
import type { LotteryGame } from '@/shared/types/domain';

type QuinielaSystem = 'simple' | 'manises' | 'oficial';
type QuinielaStep = 'pick_system' | 'play';

const SYSTEM_LABEL: Record<QuinielaSystem, string> = {
  simple: 'Columna sencilla',
  manises: 'Manises',
  oficial: 'Oficiales',
};

const SYSTEM_TITLE: Record<QuinielaSystem, string> = {
  simple: 'Quiniela · Columna sencilla',
  manises: 'Quiniela · Manises',
  oficial: 'Quiniela · Oficiales',
};

const SYSTEMS: {
  id: QuinielaSystem;
  title: string;
  description: string;
  color: string;
  isOfficial?: boolean;
}[] = [
  {
    id: 'simple',
    title: 'Columna Sencilla',
    description: 'Apuesta una o varias columnas independientes. Solo puedes marcar un signo por partido.',
    color: 'bg-manises-blue/8',
  },
  {
    id: 'manises',
    title: 'Múltiples y Reducidas Manises',
    description: 'Crea dobles y triples y elige jugar al directo o con las reducciones Manises (al 13, al 12 o al 11).',
    color: 'bg-emerald-50',
  },
  {
    id: 'oficial',
    title: 'Reducciones Oficiales',
    description: 'Utiliza las reducciones oficiales de Loterías y Apuestas del Estado.',
    color: 'bg-red-50',
    isOfficial: true,
  },
];

interface QuinielaPlayPageProps {
  game: LotteryGame;
}

export function QuinielaPlayPage({ game }: QuinielaPlayPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addDrafts, openGameReview: openReview } = usePlaySession();

  const [step, setStep] = useState<QuinielaStep>('pick_system');
  const [system, setSystem] = useState<QuinielaSystem>('simple');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Draw date selection
  const drawDates = useMemo(() => getUpcomingJornadaDates(new Date(), 5), []);
  const [selectedDrawDate, setSelectedDrawDate] = useState<Date>(() => drawDates[0]);

  // Summaries from each section
  const [simpleSummary, setSimpleSummary] = useState<QuinielaSimpleSummary | null>(null);
  const [manisesSummary, setManisesSummary] = useState<QuinielaManisesSummary | null>(null);
  const [oficialSummary, setOficialSummary] = useState<QuinielaOficialSummary | null>(null);

  const helpContent = getGameHelpContent({ game, mode: 'simple', betsCount: 1, totalPrice: 0.75 });

  // Partidos del sorteo seleccionado (cambia al cambiar la fecha)
  const fixtures = useMemo(() => getFixturesForDate(selectedDrawDate), [selectedDrawDate]);

  const activeSummary = system === 'simple' ? simpleSummary : system === 'manises' ? manisesSummary : oficialSummary;
  const totalPrice = activeSummary?.price ?? 0;
  const isValid = activeSummary?.isValid ?? false;
  const availableBalance = profile?.balance ?? 0;

  const playCta = (() => {
    if (isValid) return 'Añadir jugada';
    if (system === 'manises' && manisesSummary?.mode === 'manises') {
      const allDone = manisesSummary.matches.every(m => m.result !== null) && manisesSummary.plenaHome !== null && manisesSummary.plenaAway !== null;
      if (allDone) return 'Necesitas al menos un doble o triple';
    }
    return 'Completa el pronóstico de los 15 partidos';
  })();

  const handleSelectSystem = (s: QuinielaSystem) => {
    setSystem(s);
    setStep('play');
  };

  const handleBack = () => {
    if (step === 'play') {
      setStep('pick_system');
    } else {
      navigate(-1);
    }
  };

  const handlePlay = useCallback(async () => {
    if (!isValid) {
      toast.error('Completa el pronóstico de los 15 partidos');
      return;
    }

    try {
      let matches: Array<{ id: number; value: string }> = [];
      let systemId: string | undefined;

      if (system === 'simple' && simpleSummary) {
        const drawDate = getBusinessDate(selectedDrawDate.toISOString());
        let totalAdded = 0;
        for (let ci = 0; ci < simpleSummary.columns.length; ci++) {
          const col   = simpleSummary.columns[ci];
          const plena = simpleSummary.plenas[ci];
          const colMatches = [
            ...col.map((result, idx) => ({ id: idx + 1, value: result ?? '' })).filter(m => m.value),
            // Match 15 (Pleno al 15): encode as "home/away" goal tally
            ...(plena?.home && plena?.away ? [{ id: 15, value: `${plena.home}/${plena.away}` }] : []),
          ];

          const selection = buildGameSelection({
            game,
            isNationalLottery: false,
            isQuiniela: true,
            mode: 'simple',
            selectedNumbers: [],
            selectedStars: [],
            quinielaMatches: colMatches.map(m => ({
              id: m.id,
              home: '',
              away: '',
              result: m.value as '1' | 'X' | '2',
            })),
            selectedReductionSystemId: undefined,
            selectedNationalNumber: null,
            selectedNationalDraw: { label: '' },
          });
          if (!selection) continue;

          const drafts = buildPlayDrafts({
            game,
            selection,
            drawDates: [drawDate],
            totalPrice: game.price,
            unitPrice: game.price,
            quantity: 1,
            mode: 'simple',
            betsCount: 1,
            isSubscription: false,
            supportsTimeSelection: false,
            timeMode: 'next_draw',
            weeksCount: 1,
            selectedNationalNumber: null,
            selectedNationalQuantity: 0,
            selectedNationalDraw: { label: '' },
            selectedReductionSystemId: undefined,
          });
          const result = addDrafts(drafts);
          totalAdded += result.addedCount;
        }
        if (totalAdded > 0) {
          notifyAddedToCart({ addedCount: totalAdded, duplicateCount: 0 }, openReview);
        }
        return;
      }

      if (system === 'manises' && manisesSummary) {
        matches = [
          ...manisesSummary.matches.map(m => ({ id: m.id, value: m.result ?? '' })),
          ...(manisesSummary.plenaHome && manisesSummary.plenaAway
            ? [{ id: 15, value: `${manisesSummary.plenaHome}/${manisesSummary.plenaAway}` }]
            : []),
        ];
        systemId = manisesSummary.mode === 'multiple' ? undefined : `manises_${manisesSummary.modalidad}`;
      } else if (system === 'oficial' && oficialSummary) {
        matches = [
          ...oficialSummary.matches.map(m => ({ id: m.id, value: m.result ?? '' })),
          ...(oficialSummary.plenaHome && oficialSummary.plenaAway
            ? [{ id: 15, value: `${oficialSummary.plenaHome}/${oficialSummary.plenaAway}` }]
            : []),
        ];
        systemId = oficialSummary.reductionId;
      }

      const selection = buildGameSelection({
        game,
        isNationalLottery: false,
        isQuiniela: true,
        mode: 'reduced',
        selectedNumbers: [],
        selectedStars: [],
        quinielaMatches: matches.map(m => ({
          id: m.id,
          home: '',
          away: '',
          result: m.value as '1' | 'X' | '2',
        })),
        selectedReductionSystemId: systemId,
        selectedNationalNumber: null,
        selectedNationalDraw: { label: '' },
      });

      if (!selection) {
        toast.error('No se ha podido construir la jugada.');
        return;
      }

      const drawDate = getBusinessDate(selectedDrawDate.toISOString());
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
      const drawDatesArr = resolution.drawDates.length > 0 ? resolution.drawDates : [drawDate];

      const bets = activeSummary?.bets ?? 1;
      const nextDrafts = buildPlayDrafts({
        game,
        selection,
        drawDates: drawDatesArr,
        totalPrice,
        unitPrice: totalPrice / bets,
        quantity: 1,
        mode: 'reduced',
        betsCount: bets,
        isSubscription: false,
        supportsTimeSelection: false,
        timeMode: resolution.scheduleMode,
        weeksCount: resolution.weeksCount,
        selectedNationalNumber: null,
        selectedNationalQuantity: 0,
        selectedNationalDraw: { label: '' },
        selectedReductionSystemId: systemId,
      });

      const result = addDrafts(nextDrafts);
      if (result.addedCount > 0) {
        notifyAddedToCart(result, openReview);
      }
      if (result.duplicateCount > 0 && result.addedCount === 0) {
        toast.error('Ya tenías esa jugada en la sesión.');
      }
    } catch {
      toast.error('Error al añadir la jugada.');
    }
  }, [
    isValid, system, simpleSummary, manisesSummary, oficialSummary,
    game, selectedDrawDate, totalPrice, activeSummary, addDrafts, openReview,
  ]);

  const headerTitle = step === 'pick_system' ? game.name : SYSTEM_TITLE[system];

  return (
    <div
      className={cn(
        'flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] transition-[padding]',
        step === 'play' ? 'pb-32' : 'pb-24'
      )}
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <GamePlayHeader
        game={game}
        drawTime={game.nextDraw}
        onBack={handleBack}
        onInfo={() => setIsInfoOpen(true)}
        titleOverride={headerTitle}
      />

      <GameInfoSheet
        game={game}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        content={helpContent}
      />

      {/* Imagen decorativa estadio — fixed, detrás de la bottom bar (z-50) */}
      {step === 'pick_system' && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-72 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/65 to-transparent z-10" />
          <img
            src="/quiniela-stadium.jpeg"
            alt=""
            className="h-full w-full object-cover object-[center_20%] opacity-[0.22]"
            loading="eager"
            draggable={false}
          />
        </div>
      )}

      {/* ── STEP 1: SELECCIÓN DEL SORTEO ──────────────────────────── */}
      {step === 'pick_system' && (
        <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-4 p-4 pt-3">

          {/* Draw date chips */}
          <div>
            <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              1. Elige el sorteo
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {drawDates.map((d, i) => {
                const isSelected = d.toDateString() === selectedDrawDate.toDateString();
                const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
                const day = d.getDate();
                const month = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDrawDate(d)}
                    className={cn(
                      'shrink-0 flex flex-col items-center justify-center gap-0.5 rounded-xl border w-[60px] px-2 py-2.5 transition-all',
                      isSelected
                        ? 'border-manises-blue bg-manises-blue shadow-sm'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold leading-none', isSelected ? 'text-white/70' : 'text-slate-400')}>{weekday}</span>
                    <span className={cn('text-[20px] font-bold leading-none', isSelected ? 'text-white' : 'text-slate-700')}>{day}</span>
                    <span className={cn('text-[10px] font-semibold leading-none', isSelected ? 'text-white/70' : 'text-slate-400')}>{month}</span>
                  </button>
                );
              })}
              <div className="shrink-0 w-2" />
            </div>
          </div>

          {/* System selector */}
          <div>
            <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              2. ¿Cómo quieres jugar?
            </p>
            <div className="space-y-2">
              {SYSTEMS.map(sys => (
                <motion.button
                  key={sys.id}
                  type="button"
                  onClick={() => handleSelectSystem(sys.id)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm"
                >
                  {/* Icon */}
                  <div className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                    sys.color
                  )}>
                    {sys.id === 'simple' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="2" y="4" width="16" height="2.5" rx="1.25" fill="#0a4792" opacity=".7"/>
                        <rect x="2" y="8.75" width="16" height="2.5" rx="1.25" fill="#0a4792" opacity=".5"/>
                        <rect x="2" y="13.5" width="10" height="2.5" rx="1.25" fill="#0a4792" opacity=".3"/>
                      </svg>
                    )}
                    {sys.id === 'manises' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="5" cy="6" r="2" fill="#16a34a" opacity=".8"/>
                        <circle cx="10" cy="6" r="2" fill="#16a34a" opacity=".6"/>
                        <circle cx="15" cy="6" r="2" fill="#16a34a" opacity=".4"/>
                        <circle cx="5" cy="11" r="2" fill="#16a34a" opacity=".8"/>
                        <circle cx="10" cy="11" r="2" fill="#16a34a" opacity=".6"/>
                        <circle cx="15" cy="11" r="2" fill="#16a34a" opacity=".4"/>
                        <circle cx="7.5" cy="16" r="2" fill="#16a34a" opacity=".7"/>
                        <circle cx="12.5" cy="16" r="2" fill="#16a34a" opacity=".5"/>
                      </svg>
                    )}
                    {sys.id === 'oficial' && (
                      <Shield className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[12px] font-black uppercase tracking-wide leading-tight',
                      sys.isOfficial ? 'text-red-600' : 'text-manises-blue'
                    )}>
                      {sys.title}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-400">
                      {sys.description}
                    </p>
                  </div>

                  <ChevronRight className={cn(
                    'h-4 w-4 shrink-0',
                    sys.isOfficial ? 'text-red-400' : 'text-slate-300'
                  )} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-center justify-center gap-1.5">
            <InfoCircle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            <p className="text-[10px] font-medium text-slate-400">
              Elige el sorteo que quieres jugar y después el sistema que prefieras.
            </p>
          </div>

        </div>
      )}

      {/* ── STEP 2: PLAY ──────────────────────────────────────────── */}
      {step === 'play' && (
        <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-3 p-4 pt-3">
          {/* System badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-manises-blue/15 bg-manises-blue/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-manises-blue">
              {SYSTEM_LABEL[system]}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              {selectedDrawDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')}
            </span>
          </div>

          {system === 'simple' && (
            <QuinielaSimpleSection
              fixtures={fixtures}
              onSummaryChange={setSimpleSummary}
            />
          )}

          {system === 'manises' && (
            <QuinielaManisesSection
              fixtures={fixtures}
              onSummaryChange={setManisesSummary}
            />
          )}

          {system === 'oficial' && (
            <QuinielaOficialSection
              fixtures={fixtures}
              onSummaryChange={setOficialSummary}
            />
          )}
        </div>
      )}

      {/* ── BOTTOM BAR ────────────────────────────────────────────── */}
      {step === 'pick_system' ? (
        <PurchaseBottomBar
          availableBalance={availableBalance}
          totalPrice={0}
          canContinue={false}
          ctaLabel="Elige cómo quieres jugar"
          onContinue={() => {}}
          activeColor={game.color}
          validationText="Selecciona el sorteo y el sistema de juego"
        />
      ) : (
        <PurchaseBottomBar
          availableBalance={availableBalance}
          totalPrice={totalPrice}
          canContinue={isValid && totalPrice <= availableBalance}
          ctaLabel={playCta}
          onContinue={handlePlay}
          activeColor={game.color}
          validationText="Completa el pronóstico de los 15 partidos"
          summaryText={
            system === 'simple' && simpleSummary && simpleSummary.columns.length > 1
              ? `${formatCurrency(game.price)} por columna`
              : undefined
          }
        />
      )}
    </div>
  );
}
