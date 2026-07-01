import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBusinessDate } from '@/shared/lib/timezone';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import {
  RefreshCircle,
  Spark,
  ControlSlider,
  Calendar,
  EditPencil,
  DiceFive,
} from 'iconoir-react/regular';
import { toast } from 'sonner';
import { notifyAddedToCart } from '@/features/session/lib/cart-toast';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { MOTION_EASE_OUT, panelSwap, sectionFadeUp } from '@/shared/lib/motion';
import { getAvailableModesForGame, getModeDefinition, getReductionSystem, getReductionSystemsForMode, type PlayMode } from '../lib/play-matrix';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { GamePlayHeader } from '../components/GamePlayHeader';
import { PurchaseBottomBar } from '../components/PurchaseBottomBar';
import type { GamePlayBottomMenuItem } from '../components/GamePlayBottomMenu';
import { ReducedSystemList } from '../reduced/components/ReducedSystemList';
import { getCompatibleReducedSystems } from '../reduced/application/get-compatible-reduced-systems';
import { NumbersGrid } from '../components/NumbersGrid';
import { StarsGrid } from '../components/StarsGrid';
import { MulticolumnTicketFlow } from '../multicolumn/components/MulticolumnTicketFlow';
import type { MulticolumnDraftIntent } from '../multicolumn/contracts/multicolumn-play.contract';
import { inferMulticolumnPlayMode } from '../multicolumn/application/infer-multicolumn-play-mode';
import { getDrawScheduleConfig, type ScheduleMode } from '@/features/play/config/draw-schedule.config';
import { getDrawsForCurrentWeek, groupDrawsByWeek, getUpcomingDraws, type ScheduledDraw } from '../lib/draw-schedule';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { buildGameSelection } from '@/features/play/application/build-game-selection';
import { buildPlayDrafts } from '@/features/play/application/build-play-drafts';
import { resolvePlayPricing } from '@/features/play/application/resolve-play-pricing';
import {
  inferScheduleModeFromDrawDates,
  resolveDrawDates,
} from '@/features/play/application/resolve-draw-dates';
import { useQuickPick } from '../quick-pick/hooks/useQuickPick';
import { buildQuickPickDrafts } from '../quick-pick/application/build-quick-pick-drafts';
import { QuickPickPanel } from '../quick-pick/components/QuickPickPanel';
import type { PlayDraft } from '@/features/session/types/session.types';
import { DrawStatusPill } from '../draw-status/components/DrawStatusPill';
import { resolveDrawStatus } from '../draw-status/application/resolve-draw-status';
import { getGameHelpContent } from '../lib/game-help';
import type { LotteryGame } from '@/shared/types/domain';

interface GamePlayLocationState { playDraftId?: string; }

const DEFAULT_CUSTOM_WEEKS = 2;

function formatDrawChip(iso: string): { weekday: string; day: string; month: string } {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
    day: String(d.getDate()),
    month: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
  };
}

interface NumericGamePlayPageProps {
  game: LotteryGame;
}

export function NumericGamePlayPage({ game }: NumericGamePlayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { drafts, addDrafts, updateDraft, openGameReview: openReview } = usePlaySession();

  const editingDraftId = (location.state as GamePlayLocationState | null)?.playDraftId;
  const editingDraft = useMemo(
    () => drafts.find((d) => d.id === editingDraftId),
    [drafts, editingDraftId]
  );

  const availableModes: PlayMode[] = getAvailableModesForGame(game.id);
  const supportsQuickPick = Boolean(game.selectionRange?.numbers);

  const [mode, setMode] = useState<PlayMode>(availableModes[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedReductionSystemId, setSelectedReductionSystemId] = useState<string>('reducida_1');
  const [timeMode, setTimeMode] = useState<ScheduleMode>('next_draw');
  const [selectedWeeksCount, setSelectedWeeksCount] = useState(DEFAULT_CUSTOM_WEEKS);
  const [selectedDrawDates, setSelectedDrawDates] = useState<string[]>([]);
  const [isSubscription, setIsSubscription] = useState(false);
  const [betMethod, setBetMethod] = useState<'random' | 'manual' | null>(null);
  const manualBetCount = 1;
  // Paso 1→2 del flujo progresivo (sin método/tipo resuelto): fecha confirmada antes de mostrar tipo/método.
  // "Cambiar" en cualquier pantalla final pone betMethod a null y esto a false, reabriendo el mismo flujo desde el paso 1.
  const [dateStepConfirmed, setDateStepConfirmed] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const quickPick = useQuickPick(game, supportsQuickPick);

  const drawScheduleConfig = getDrawScheduleConfig(game.type);
  const supportsTimeSelection = Boolean(drawScheduleConfig?.supportsMultipleDrawSelection);
  const maxWeeksSelectable = drawScheduleConfig?.maxWeeksSelectable ?? DEFAULT_CUSTOM_WEEKS;

  // Restore editing draft
  useEffect(() => {
    if (!editingDraft || editingDraft.gameId !== game.id) return;
    if (
      editingDraft.selection.type === 'national' ||
      editingDraft.selection.type === 'quiniela'
    ) return;

    setMode((editingDraft.mode as PlayMode) ?? availableModes[0]);
    setIsSubscription(editingDraft.isSubscription);
    setMultipleCount(
      editingDraft.mode === 'multiple' && 'numbers' in editingDraft.selection
        ? editingDraft.selection.numbers.length
        : null
    );

    const draftDates = Array.isArray(editingDraft.metadata?.orderDrawDates)
      ? editingDraft.metadata.orderDrawDates.filter((d): d is string => typeof d === 'string')
      : [editingDraft.drawDate];
    setSelectedDrawDates(draftDates);
    setTimeMode(inferScheduleModeFromDrawDates(draftDates, game.type));
    setSelectedWeeksCount(DEFAULT_CUSTOM_WEEKS);

    if ('numbers' in editingDraft.selection) {
      setSelectedNumbers(editingDraft.selection.numbers);
    }

    if (editingDraft.selection.type === 'euromillones') {
      setSelectedStars(editingDraft.selection.stars);
    } else if (editingDraft.selection.type === 'gordo') {
      setSelectedStars([editingDraft.selection.key]);
    } else if (editingDraft.selection.type === 'eurodreams') {
      setSelectedStars([editingDraft.selection.dream]);
    } else {
      setSelectedStars([]);
    }
  }, [availableModes, editingDraft, game.id]);

  useEffect(() => {
    setTimeMode('next_draw');
    setSelectedWeeksCount(Math.min(DEFAULT_CUSTOM_WEEKS, maxWeeksSelectable));
  }, [game.id, maxWeeksSelectable]);

  useEffect(() => {
    setDateStepConfirmed(false);
  }, [game.id, editingDraftId]);

  const currentModeDefinition = getModeDefinition(game.id, mode);
  const currentSelection = currentModeDefinition?.selection ?? game.selectionRange!;
  const reductionSystems = getReductionSystemsForMode(game.id, mode);
  const currentReductionSystem = mode === 'reduced' ? getReductionSystem(game.id, selectedReductionSystemId) : null;
  const range = currentSelection || { numbers: { min: 1, max: 1, total: 1 } };
  const baseMinNums = range.numbers?.min ?? 1;
  const baseMaxNums = range.numbers?.max ?? 1;
  const totalNums = range.numbers?.total ?? 1;
  // Modo Múltiple: el usuario elige cuántos números quiere jugar (rango baseMinNums+1..baseMaxNums,
  // ya que jugar exactamente baseMinNums no aporta combinatoria sobre una jugada simple).
  const multiplePillOptions = useMemo(
    () => Array.from({ length: Math.max(baseMaxNums - baseMinNums, 0) }, (_, i) => baseMinNums + 1 + i),
    [baseMinNums, baseMaxNums]
  );
  const defaultMultipleCount = multiplePillOptions.length > 0
    ? Math.round((multiplePillOptions[0] + multiplePillOptions[multiplePillOptions.length - 1]) / 2)
    : baseMaxNums;
  const [multipleCount, setMultipleCount] = useState<number | null>(null);
  const effectiveMultipleCount = multipleCount ?? defaultMultipleCount;
  const minNums = mode === 'multiple' ? effectiveMultipleCount : baseMinNums;
  const maxNums = mode === 'multiple' ? effectiveMultipleCount : baseMaxNums;
  const minStars = range.stars?.min ?? 0;
  const maxStars = range.stars?.max ?? minStars;
  const totalStars = range.stars?.total ?? 0;
  // Reintegro (Primitiva) y Clave (Gordo) son selección única que empieza en 0, no en 1
  const startsAtZero = game.type === 'gordo' || game.type === 'primitiva';
  const starValues = startsAtZero
    ? Array.from({ length: totalStars }, (_, i) => i)
    : Array.from({ length: totalStars }, (_, i) => i + 1);
  const secondarySelectionLabel = game.type === 'gordo' ? 'Clave' : game.type === 'primitiva' ? 'Reintegro' : 'Estrellas';
  const secondarySelectionPrefix = game.type === 'gordo' ? 'Clave' : game.type === 'primitiva' ? 'Reintegro' : 'Estrella';
  const supportedReducedNumbers = currentReductionSystem?.supportedNumbers ?? [];
  const isSupportedReducedSelection = mode !== 'reduced' || supportedReducedNumbers.length === 0 || supportedReducedNumbers.includes(selectedNumbers.length);

  const theme = getGameTheme(game);

  const drawDateResolution = useMemo(() => resolveDrawDates({
    gameType: game.type,
    gameNextDraw: game.nextDraw,
    isNationalLottery: false,
    isExplicitNationalProduct: false,
    supportsTimeSelection,
    scheduleMode: timeMode,
    selectedDrawDates,
    selectedWeeksCount,
    selectedNationalDrawNextDraw: game.nextDraw,
    availableNationalDates: [],
  }), [game.nextDraw, game.type, selectedDrawDates, selectedWeeksCount, supportsTimeSelection, timeMode]);

  const effectiveSelectedDrawDates = drawDateResolution.drawDates;
  const drawsCount = Math.max(effectiveSelectedDrawDates.length, 1);

  const highlightedDrawDate = useMemo(() => {
    const sorted = [...effectiveSelectedDrawDates].sort((a, b) => a.localeCompare(b));
    return sorted[0] ?? getBusinessDate(game.nextDraw);
  }, [effectiveSelectedDrawDates, game.nextDraw]);

  const drawStatus = useMemo(() => resolveDrawStatus({ drawDate: highlightedDrawDate }), [highlightedDrawDate]);

  const quickPickPricing = useMemo(() => resolvePlayPricing({
    game,
    isNationalLottery: false,
    isQuiniela: false,
    mode: 'simple',
    selectedNumbersCount: game.selectionRange.numbers.min,
    selectedStarsCount: game.selectionRange.stars?.min ?? 0,
    selectedReductionSystemId: '',
    selectedNationalQuantity: 1,
    selectedNationalDraw: { decimoPrice: game.price },
    drawsCount: effectiveSelectedDrawDates.length || 1,
  }), [game, effectiveSelectedDrawDates]);

  const quickPickTotalPrice = quickPickPricing.totalPrice * quickPick.count;

  const { betsCount, drawPrice, totalPrice } = resolvePlayPricing({
    game,
    isNationalLottery: false,
    isQuiniela: false,
    mode,
    selectedNumbersCount: selectedNumbers.length,
    selectedStarsCount: selectedStars.length,
    selectedReductionSystemId,
    selectedNationalQuantity: 1,
    selectedNationalDraw: {},
    drawsCount,
  });

  const availableBalance = profile?.balance ?? 0;

  const helpContent = getGameHelpContent({
    game,
    mode,
    betsCount,
    totalPrice,
    reducedSystemId: mode === 'reduced' ? selectedReductionSystemId : undefined,
  });

  const allAvailableDraws = useMemo(() => getUpcomingDraws(game.type, new Date(), 4), [game.type]);
  const groupedAllDraws = useMemo(() => groupDrawsByWeek(allAvailableDraws), [allAvailableDraws]);

  const currentWeekDraws = useMemo(() => getDrawsForCurrentWeek(game.type, new Date()), [game.type]);
  const currentWeekDates = useMemo(() => currentWeekDraws.map((d) => d.drawDate), [currentWeekDraws]);

  const nextWeekDraws = useMemo(() => {
    const allUpcoming = getUpcomingDraws(game.type, new Date(), 2);
    const currentWeekEnd = new Date();
    currentWeekEnd.setDate(currentWeekEnd.getDate() + (7 - currentWeekEnd.getDay()) % 7);
    currentWeekEnd.setHours(23, 59, 59, 999);
    return allUpcoming.filter((d) => new Date(d.drawDate) > currentWeekEnd);
  }, [game.type]);
  const nextWeekDates = useMemo(() => nextWeekDraws.map((d) => d.drawDate), [nextWeekDraws]);
  const twoWeeksDates = useMemo(() => [...currentWeekDates, ...nextWeekDates], [currentWeekDates, nextWeekDates]);

  const areDatesEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v) => b.includes(v));

  const compatibleReducedSystems = useMemo(() => {
    if (mode !== 'reduced') return [];
    return getCompatibleReducedSystems({ game, numbersCount: selectedNumbers.length });
  }, [game, mode, selectedNumbers.length]);

  const isQuickPickMode = supportsQuickPick && mode === 'simple' && betMethod === 'random';
  const isMulticolumnMode = supportsQuickPick && mode === 'simple' && betMethod === 'manual';

  const hasValidStarSelection = range.stars
    ? selectedStars.length >= minStars && selectedStars.length <= maxStars
    : true;

  const canPlay = !isMulticolumnMode && !isQuickPickMode && (
    selectedNumbers.length >= minNums &&
    selectedNumbers.length <= maxNums &&
    hasValidStarSelection &&
    isSupportedReducedSelection &&
    betsCount > 0
  );

  const shouldShowStickyCta = (() => {
    if (isQuickPickMode) return false;
    if (supportsQuickPick && betMethod === null) return false;
    if (isMulticolumnMode) return false;
    return selectedNumbers.length > 0;
  })();
  // Sin método elegido (cualquier modo): mostrar setup. En cuanto hay tipo+método resueltos, solo pantalla final (editable con "Cambiar", que reabre este mismo flujo).
  const shouldShowInlineSetup = !supportsQuickPick || betMethod === null;
  // Dentro del setup: ¿hay selector de fecha con varios sorteos entre los que elegir?
  const hasDateSelector = supportsTimeSelection && game.type !== 'gordo';
  // Paso 1 (elegir fecha) vs paso 2 (tipo de jugada + cómo jugar), según mockup del cliente
  const onDateStep = shouldShowInlineSetup && hasDateSelector && !dateStepConfirmed;

  const drawTimeSummary = useMemo(() => {
    const d = new Date(drawStatus.drawDate);
    const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
    const month = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const countLabel = drawsCount === 1 ? 'Próximo sorteo' : `${drawsCount} sorteos`;
    return `${countLabel} · ${weekday} ${d.getDate()} ${month}`;
  }, [drawStatus, drawsCount]);

  const configMainLine = useMemo(() => {
    const parts: string[] = [];
    if (availableModes.length > 1) {
      const labels: Record<PlayMode, string> = { simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' };
      parts.push(labels[mode]);
    }
    if (mode === 'simple') {
      if (isQuickPickMode) parts.push('Aleatorio');
      else parts.push('Manual');
    }
    return parts.length > 0 ? parts.join(' · ') : 'Jugada';
  }, [availableModes.length, isQuickPickMode, mode]);

  // "Jue 30 Jun · 21:30" — momento del sorteo, usado en las líneas-resumen colapsadas (pasos 2 y 3)
  const collapsedDrawMoment = useMemo(() => {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const dates = effectiveSelectedDrawDates;

    if (dates.length <= 1) {
      const d = new Date(dates[0] ?? drawStatus.drawDate);
      const weekday = cap(d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
      const month = cap(d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));
      const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${weekday} ${d.getDate()} ${month} · ${time}`;
    }

    const parsed = dates.map((s) => new Date(s));

    if (dates.length <= 3) {
      const firstMo = cap(parsed[0].toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));
      const allSameMonth = parsed.every(
        (d) => d.toLocaleDateString('es-ES', { month: 'short' }) === parsed[0].toLocaleDateString('es-ES', { month: 'short' })
      );
      const parts = parsed.map((d) => {
        const wd = cap(d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
        const mo = cap(d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));
        return allSameMonth ? `${wd} ${d.getDate()}` : `${wd} ${d.getDate()} ${mo}`;
      });
      return `${parts.join(', ')}${allSameMonth ? ` ${firstMo}` : ''}`;
    }

    // 4+ fechas: rango compacto
    const first = parsed[0];
    const last = parsed[parsed.length - 1];
    const fWd = cap(first.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
    const fMo = cap(first.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));
    const lWd = cap(last.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
    const lMo = cap(last.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));
    const sameMonth = fMo === lMo;
    return `${dates.length} sorteos · ${fWd} ${first.getDate()}${sameMonth ? '' : ` ${fMo}`} – ${lWd} ${last.getDate()} ${lMo}`;
  }, [drawStatus, effectiveSelectedDrawDates]);

  // Resumen superior editable de la pantalla Aleatorio: "Jue 30 Jun · 21:30 · Simple · Aleatorio"
  const quickPickSummaryLine = useMemo(() => {
    const modeLabel = availableModes.length > 1
      ? ({ simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' } as Record<PlayMode, string>)[mode]
      : 'Simple';
    return `${collapsedDrawMoment} · ${modeLabel} · Aleatorio`;
  }, [collapsedDrawMoment, mode, availableModes.length]);

  const gameBottomMenuItems = useMemo<GamePlayBottomMenuItem[]>(() => {
    const modeLabels: Record<PlayMode, string> = { simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' };
    const methodLabel = mode !== 'simple'
      ? modeLabels[mode]
      : betMethod === 'random'
        ? 'Aleatorio'
        : betMethod === 'manual'
          ? 'Manual'
          : 'Elegir';

    return [
      {
        id: 'draws',
        label: 'Sorteos',
        value: drawsCount === 1 ? '1 sorteo' : `${drawsCount} sorteos`,
        icon: RefreshCircle,
        active: false,
        onClick: () => { setBetMethod(null); setDateStepConfirmed(false); },
      },
      {
        id: 'type',
        label: 'Tipo',
        value: modeLabels[mode],
        icon: ControlSlider,
        active: mode !== 'simple',
        onClick: () => { setBetMethod(null); setDateStepConfirmed(false); },
      },
      {
        id: 'method',
        label: 'Método',
        value: methodLabel,
        icon: Spark,
        active: mode === 'simple' && betMethod !== null,
        disabled: mode !== 'simple' || !supportsQuickPick,
        onClick: () => {
          if (mode !== 'simple' || !supportsQuickPick) return;
          setBetMethod((current) => current === 'random' ? 'manual' : 'random');
        },
      },
    ];
  }, [betMethod, drawsCount, mode, supportsQuickPick]);

  const toggleNumber = (n: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : prev.length < maxNums
          ? [...prev, n].sort((a, b) => a - b)
          : (toast.error(`Máximo ${maxNums} números`), prev)
    );
  };

  const toggleStar = (n: number) => {
    setSelectedStars((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : prev.length < maxStars
          ? [...prev, n].sort((a, b) => a - b)
          : (toast.error(`Máximo ${maxStars} estrellas`), prev)
    );
  };

  const handleRandom = () => {
    const { numbers, stars } = generateRandomPlay(
      totalNums,
      mode === 'reduced' && supportedReducedNumbers.length > 0 ? supportedReducedNumbers[0] : maxNums,
      startsAtZero ? 10 : totalStars,
      mode === 'reduced' ? minStars : maxStars
    );
    setSelectedNumbers(numbers);
    setSelectedStars(startsAtZero ? stars.map((v) => v - 1) : stars);
    toast.success('¡Combinación aleatoria generada!');
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setSelectedStars([]);
  };

  // Selector -/+ del modo Reducida: ajusta la cantidad de números añadiendo/quitando uno al azar,
  // ya que en reducidas lo relevante es la cantidad, no qué números concretos elige el sistema.
  const handleIncrementReduced = () => {
    if (selectedNumbers.length >= maxNums) return;
    const available = Array.from({ length: totalNums }, (_, i) => i + 1).filter((n) => !selectedNumbers.includes(n));
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    setSelectedNumbers((prev) => [...prev, pick].sort((a, b) => a - b));
  };

  const handleDecrementReduced = () => {
    if (selectedNumbers.length === 0) return;
    const idx = Math.floor(Math.random() * selectedNumbers.length);
    setSelectedNumbers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePersistQuickPick = () => {
    const quickDrafts = buildQuickPickDrafts({
      game,
      combinations: quickPick.combinations,
      drawDates: effectiveSelectedDrawDates,
      isSubscription,
    });
    const result = addDrafts(quickDrafts);
    if (result.addedCount > 0) {
      notifyAddedToCart(result, openReview);
    } else {
      toast.error(result.duplicateCount === 1 ? 'Esta jugada ya estaba añadida.' : 'Todas las jugadas ya estaban añadidas.');
    }
  };

  const handleMulticolumnPersist = (intent: MulticolumnDraftIntent) => {
    try {
      const allDrafts: PlayDraft[] = [];

      intent.columns.forEach((col) => {
        const colMode = inferMulticolumnPlayMode(game, col);
        const selection = buildGameSelection({
          game,
          isNationalLottery: false,
          isQuiniela: false,
          mode: colMode,
          selectedNumbers: col.numbers,
          selectedStars: col.stars,
          quinielaMatches: [],
          selectedReductionSystemId: '',
          selectedNationalNumber: null,
          selectedNationalDraw: { label: '' },
        });
        if (!selection) return;

        const pricing = resolvePlayPricing({
          game,
          isNationalLottery: false,
          isQuiniela: false,
          mode: colMode,
          selectedNumbersCount: col.numbers.length,
          selectedStarsCount: col.stars.length,
          selectedReductionSystemId: '',
          selectedNationalQuantity: 0,
          selectedNationalDraw: {},
          drawsCount: intent.drawDates.length,
        });

        const colDrafts = buildPlayDrafts({
          game,
          selection,
          drawDates: intent.drawDates,
          totalPrice: pricing.totalPrice,
          unitPrice: pricing.drawPrice,
          quantity: 1,
          mode: colMode,
          betsCount: pricing.betsCount,
          isSubscription,
          supportsTimeSelection,
          timeMode: drawDateResolution.scheduleMode,
          weeksCount: drawDateResolution.weeksCount,
          selectedNationalNumber: null,
          selectedNationalQuantity: 0,
          selectedNationalDraw: { label: '' },
        });

        allDrafts.push(...colDrafts);
      });

      if (allDrafts.length === 0) {
        toast.error('No se han podido procesar las apuestas.');
        return;
      }

      const result = addDrafts(allDrafts);
      if (result.addedCount > 0) {
        notifyAddedToCart(result, openReview);
      } else {
        toast.error(result.duplicateCount === 1 ? 'Esta jugada ya estaba añadida.' : 'Todas las jugadas ya estaban añadidas.');
      }
    } catch {
      toast.error('Ocurrió un error al procesar las apuestas.');
    }
  };

  const handlePlayReduced = (systemId: string) => {
    if (!selectedNumbers.length || !hasValidStarSelection) {
      toast.error('Completa tu selección de números y estrellas');
      return;
    }

    const draftSelection = buildGameSelection({
      game,
      isNationalLottery: false,
      isQuiniela: false,
      mode: 'reduced',
      selectedNumbers,
      selectedStars,
      quinielaMatches: [],
      selectedReductionSystemId: systemId,
      selectedNationalNumber: null,
      selectedNationalDraw: { label: '' },
    });

    if (!draftSelection) {
      toast.error('No se ha podido construir la jugada.');
      return;
    }

    const drawDates =
      effectiveSelectedDrawDates.length > 0
        ? effectiveSelectedDrawDates
        : [getBusinessDate(game.nextDraw)];

    const systemPricing = resolvePlayPricing({
      game,
      isNationalLottery: false,
      isQuiniela: false,
      mode: 'reduced',
      selectedNumbersCount: selectedNumbers.length,
      selectedStarsCount: selectedStars.length,
      selectedReductionSystemId: systemId,
      selectedNationalQuantity: 1,
      selectedNationalDraw: {},
      drawsCount,
    });

    const nextDrafts = buildPlayDrafts({
      game,
      selection: draftSelection,
      drawDates,
      totalPrice: systemPricing.totalPrice,
      unitPrice: systemPricing.drawPrice,
      quantity: 1,
      mode: 'reduced',
      betsCount: systemPricing.betsCount,
      isSubscription,
      supportsTimeSelection,
      timeMode: drawDateResolution.scheduleMode,
      weeksCount: drawDateResolution.weeksCount,
      selectedNationalNumber: null,
      selectedNationalQuantity: 0,
      selectedNationalDraw: { label: '' },
      selectedReductionSystemId: systemId,
    });

    const result = addDrafts(nextDrafts);
    if (result.addedCount > 0) {
      notifyAddedToCart(result, openReview, 'Jugada reducida');
      setSelectedNumbers([]);
      setSelectedStars([]);
    }
    if (result.duplicateCount > 0) {
      toast.error('Ya tenías esa jugada en la sesión.');
    }
  };

  const handlePlay = async () => {
    if (!canPlay) {
      if (mode === 'reduced' && !isSupportedReducedSelection) {
        toast.error('La selección actual no encaja en una fila válida de la tabla reducida');
      } else {
        toast.error('Completa tu apuesta');
      }
      return;
    }

    const draftSelection = buildGameSelection({
      game,
      isNationalLottery: false,
      isQuiniela: false,
      mode,
      selectedNumbers,
      selectedStars,
      quinielaMatches: [],
      selectedReductionSystemId,
      selectedNationalNumber: null,
      selectedNationalDraw: { label: '' },
    });

    if (!draftSelection) {
      toast.error('No se ha podido construir la jugada.');
      return;
    }

    const drawDates =
      effectiveSelectedDrawDates.length > 0
        ? effectiveSelectedDrawDates
        : [getBusinessDate(game.nextDraw)];

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
      supportsTimeSelection,
      timeMode: drawDateResolution.scheduleMode,
      weeksCount: drawDateResolution.weeksCount,
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
      setSelectedNumbers([]);
      setSelectedStars([]);
    }
    if (result.duplicateCount > 0 && result.addedCount === 0) {
      toast.error(result.duplicateCount === 1 ? 'Ya tenías esa jugada en la sesión.' : `${result.duplicateCount} jugadas duplicadas no se añadieron.`);
    }
  };

  const ctaLabel = (() => {
    if (canPlay) {
      if (drawsCount > 1) return `Añadir ${drawsCount} jugadas`;
      return editingDraft ? 'Actualizar' : 'Añadir jugada';
    }
    if (supportsQuickPick && betMethod === null) return 'Elige cómo quieres jugar';
    if (isMulticolumnMode) return 'Añadir boleto';
    if (mode === 'reduced' && !isSupportedReducedSelection) return 'Completa la reducida';
    const numsLeft = minNums - selectedNumbers.length;
    const starsLeft = minStars - selectedStars.length;
    if (numsLeft > 0 && starsLeft > 0) return `Elige ${numsLeft} números y ${starsLeft} ${starsLeft === 1 ? 'estrella' : 'estrellas'}`;
    if (numsLeft > 0) return `Elige ${numsLeft} ${numsLeft === 1 ? 'número' : 'números'}`;
    if (starsLeft > 0) return `Elige ${starsLeft} ${starsLeft === 1 ? 'estrella' : 'estrellas'}`;
    return 'Completa la jugada';
  })();

  const ctaValidationText = supportsQuickPick && betMethod === null
    ? 'Elige cómo quieres jugar arriba'
    : isMulticolumnMode
      ? 'Completa al menos una apuesta'
      : `Elige ${maxNums - selectedNumbers.length > 0 ? maxNums - selectedNumbers.length + ' números' : ''} ${maxStars - selectedStars.length > 0 ? '+ ' + (maxStars - selectedStars.length) + ' estrellas' : ''}`.trim();

  return (
    <div
      className={cn(
        'flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] transition-[padding]',
        shouldShowStickyCta || isQuickPickMode || isMulticolumnMode ? 'pb-40' : 'pb-6'
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

        {/* Resumen editable — pantallas finales (Múltiple/Reducida, Manual, Aleatorio). "Cambiar" siempre reabre el mismo flujo de configuración (paso 1: fecha) en vez de una pantalla distinta. */}
        {!shouldShowInlineSetup && (
          <button
            onClick={() => { setBetMethod(null); setDateStepConfirmed(false); }}
            className="group flex w-full items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-3 py-2.5 shadow-sm transition-all hover:border-manises-blue/20 hover:shadow-md active:scale-[0.99]"
            aria-label="Editar fecha, tipo de jugada o modo"
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 text-manises-blue/50" />
            <span className="min-w-0 flex-1 truncate text-left text-[11px] font-bold text-manises-blue">
              {isQuickPickMode ? quickPickSummaryLine : `${collapsedDrawMoment} · ${configMainLine}`}
            </span>
            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-manises-blue/50 transition-colors group-hover:text-manises-blue">
              Cambiar
            </span>
            <EditPencil className="h-3.5 w-3.5 shrink-0 text-manises-blue/40 transition-colors group-hover:text-manises-blue" />
          </button>
        )}

        {/* Flujo progresivo: paso 1 (elegir fecha) → paso 2 (tipo de jugada + cómo jugar) */}
        {shouldShowInlineSetup && (
        <div className="space-y-2.5">

          {onDateStep ? (
          <>
            {/* PASO 1 — SELECCIONAR FECHA */}
            <div className="rounded-[1.2rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
              <div className="flex items-start justify-between gap-2 px-3.5 pt-2.5 pb-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">Sorteos abiertos</p>
                  <p className="mt-0.5 text-[9px] font-medium text-slate-400 leading-tight">
                    {'Próximo: '}
                    {new Date(drawStatus.drawDate).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                    {' '}
                    {new Date(drawStatus.drawDate).getDate()}
                    {' '}
                    {new Date(drawStatus.drawDate).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                  </p>
                </div>
                <span className={cn(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider',
                  drawStatus.state === 'open' ? 'bg-emerald-50 text-emerald-600' :
                  drawStatus.state === 'closingSoon' ? 'bg-amber-50 text-amber-600' :
                  'bg-slate-100 text-slate-400'
                )}>
                  {drawStatus.state === 'open' ? 'Abierto' : drawStatus.state === 'closingSoon' ? 'Cerrando' : 'Cerrado'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3.5 pb-2">
                <button
                  onClick={() => { setTimeMode('full_week'); setSelectedDrawDates([]); setDateStepConfirmed(true); }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border',
                    (timeMode === 'full_week' || areDatesEqual(effectiveSelectedDrawDates, currentWeekDates))
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                  )}
                  style={(timeMode === 'full_week' || areDatesEqual(effectiveSelectedDrawDates, currentWeekDates)) ? { backgroundColor: game.color, borderColor: game.color } : undefined}
                >
                  Toda la semana
                </button>
                {effectiveSelectedDrawDates.length > 0 && (
                  <button
                    onClick={() => { setTimeMode('specific_days'); setSelectedDrawDates([]); }}
                    className="ml-auto px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto border-t border-slate-50 px-3.5 pb-3 pt-2.5">
                {(Object.entries(groupedAllDraws) as [string, ScheduledDraw[]][]).flatMap(([weekKey, weekDraws], weekIndex) => {
                  const weekLabel = weekIndex === 0 ? 'Esta sem.' : weekIndex === 1 ? 'Próx. sem.' : `Sem. ${weekIndex + 1}`;
                  const weekDates = weekDraws.map((d: ScheduledDraw) => d.drawDate);
                  const allSelected = weekDates.length > 0 && weekDates.every((d: string) => effectiveSelectedDrawDates.includes(d));
                  const someSelected = weekDates.some((d: string) => effectiveSelectedDrawDates.includes(d));

                  const separator = (
                    <button
                      key={`sep-${weekKey}`}
                      onClick={() => {
                        setTimeMode('specific_days');
                        setSelectedDrawDates((prev: string[]) =>
                          allSelected
                            ? prev.filter((d: string) => !weekDates.includes(d))
                            : Array.from(new Set([...prev, ...weekDates])).sort()
                        );
                        setDateStepConfirmed(true);
                      }}
                      className={cn(
                        'flex shrink-0 items-center self-center rounded-lg border px-2 py-2.5 text-[9px] font-black uppercase tracking-wider transition-all',
                        allSelected ? 'text-white border-transparent shadow-sm' :
                        someSelected ? 'bg-slate-50 border-slate-200 text-slate-500' :
                        'bg-slate-50 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      )}
                      style={allSelected ? { backgroundColor: game.color, borderColor: game.color } : undefined}
                    >
                      {weekLabel}
                    </button>
                  );

                  const chips = weekDraws.map((draw: ScheduledDraw) => {
                    const isSelected = effectiveSelectedDrawDates.includes(draw.drawDate);
                    const chip = formatDrawChip(draw.drawDate);
                    return (
                      <button
                        key={draw.drawDate}
                        onClick={() => {
                          setTimeMode('specific_days');
                          setSelectedDrawDates((prev: string[]) =>
                            prev.includes(draw.drawDate)
                              ? prev.filter((d: string) => d !== draw.drawDate)
                              : [...prev, draw.drawDate].sort()
                          );
                          setDateStepConfirmed(true);
                        }}
                        className={cn(
                          'relative flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border min-w-[62px] px-2 py-2.5 transition-all',
                          isSelected ? 'border-transparent shadow-[0_4px_12px_rgba(10,71,146,0.10)]' : 'bg-white border-slate-100 hover:border-slate-200'
                        )}
                        style={isSelected ? { backgroundColor: `${game.color}12`, borderColor: game.color } : undefined}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="selected-draw-chip"
                            className="absolute inset-0 rounded-xl border-2 z-0"
                            style={{ borderColor: game.color }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className={cn('relative z-10 text-[12px] font-semibold leading-none uppercase', isSelected ? 'text-manises-blue/70' : 'text-slate-400')}>{chip.weekday}</span>
                        <span className={cn('relative z-10 text-[20px] font-bold leading-none', isSelected ? 'text-manises-blue' : 'text-slate-700')}>{chip.day}</span>
                        <span className={cn('relative z-10 text-[12px] font-semibold leading-none uppercase', isSelected ? 'text-manises-blue/70' : 'text-slate-400')}>{chip.month}</span>
                      </button>
                    );
                  });

                  return [separator, ...chips];
                })}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50/40 px-6 pb-2 pt-8 text-center">
              <Calendar className="h-10 w-10 text-slate-300" />
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-manises-blue">Elige la fecha del sorteo</p>
              <p className="max-w-[230px] pb-6 text-[13px] font-medium leading-relaxed text-slate-400">
                Selecciona uno o varios días arriba para ver las opciones de juego disponibles.
              </p>
            </div>
          </>
          ) : (
          <>
            {/* PASO 2 — ELEGIR CÓMO JUGAR (la fecha ya queda colapsada arriba) */}
            {hasDateSelector ? (
              <button
                onClick={() => setDateStepConfirmed(false)}
                className="group flex w-full items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-3 py-2.5 shadow-sm transition-all hover:border-manises-blue/20 hover:shadow-md active:scale-[0.99]"
                aria-label="Editar fecha del sorteo"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-manises-blue/50" />
                <span className="min-w-0 flex-1 truncate text-left text-[11px] font-bold text-manises-blue">
                  {collapsedDrawMoment}
                </span>
                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-manises-blue/50 transition-colors group-hover:text-manises-blue">
                  Cambiar
                </span>
                <EditPencil className="h-3.5 w-3.5 shrink-0 text-manises-blue/40 transition-colors group-hover:text-manises-blue" />
              </button>
            ) : (
              <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Sorteo</p>
                  <DrawStatusPill drawStatus={drawStatus} selectedDrawsCount={1} />
                </div>
                {/* Chip de fecha del próximo sorteo — visual idéntico al selector de otros juegos */}
                <div className="mt-2 flex justify-center">
                  {(() => {
                    const chip = formatDrawChip(highlightedDrawDate);
                    return (
                      <div
                        className="flex flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2"
                        style={{ backgroundColor: `${game.color}12`, borderColor: game.color }}
                      >
                        <span className="text-[12px] font-semibold leading-none uppercase" style={{ color: game.color, opacity: 0.7 }}>{chip.weekday}</span>
                        <span className="text-[20px] font-bold leading-none" style={{ color: game.color }}>{chip.day}</span>
                        <span className="text-[12px] font-semibold leading-none uppercase" style={{ color: game.color, opacity: 0.7 }}>{chip.month}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {availableModes.length > 1 && (
              <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm">
                <p className="mb-1.5 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Tipo de jugada</p>
                <div className={cn('grid gap-1.5', availableModes.length >= 3 ? 'grid-cols-3' : 'grid-cols-2')}>
                  {availableModes.map((m) => {
                    const labels: Record<string, string> = { simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' };
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setMode(m as typeof mode);
                          const nextSystems = getReductionSystemsForMode(game.id, m as typeof mode);
                          if (m === 'reduced' && nextSystems.length > 0) setSelectedReductionSystemId(nextSystems[0].id);
                          handleClear();
                          setMultipleCount(null);
                          if (m !== 'simple') setBetMethod('manual');
                        }}
                        className={cn(
                          'py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all text-center',
                          mode === m ? 'text-white border-transparent shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                        )}
                        style={mode === m ? { backgroundColor: game.color } : undefined}
                      >
                        {labels[m] ?? m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'simple' && betMethod === null && (
              <div className="rounded-[1.2rem] border-2 border-slate-200 bg-white px-3.5 py-4 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBetMethod('random')}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all active:scale-[0.97] hover:border-slate-300"
                  >
                    <Spark className="h-4 w-4 shrink-0 text-manises-gold" />
                    Aleatorio
                  </button>
                  <button
                    onClick={() => setBetMethod('manual')}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all active:scale-[0.97] hover:border-slate-300"
                  >
                    <ControlSlider className="h-4 w-4 shrink-0" />
                    Manual
                  </button>
                </div>

                <div className="flex flex-col items-center gap-1.5 pb-1 pt-6 text-center">
                  <DiceFive className="h-8 w-8 text-slate-300" />
                  <p className="text-[11px] font-black uppercase tracking-[0.08em] text-manises-blue">¿Cómo quieres jugar?</p>
                  <p className="max-w-[230px] text-[13px] font-medium leading-relaxed text-slate-400">
                    Elige si prefieres que generemos las apuestas automáticamente o seleccionar tú los números.
                  </p>
                </div>
              </div>
            )}
          </>
          )}
        </div>
        )}


        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${game.id}-${mode}`}
            variants={panelSwap}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {isQuickPickMode ? (
              <QuickPickPanel
                count={quickPick.count}
                setCount={quickPick.setCount}
                combinations={quickPick.combinations}
                isRegenerating={quickPick.isRegenerating}
                regenerate={quickPick.regenerate}
                regenerateAt={quickPick.regenerateAt}
                totalPrice={quickPickTotalPrice}
                availableBalance={profile?.balance ?? 0}
                drawsCount={effectiveSelectedDrawDates.length || 1}
                activeColor={game.color}
                onAdd={handlePersistQuickPick}
                isSubscription={isSubscription}
                onSubscriptionChange={setIsSubscription}
                menuItems={gameBottomMenuItems}
              />
            ) : isMulticolumnMode ? (
              <motion.div key={manualBetCount} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MulticolumnTicketFlow
                  game={game}
                  drawDates={effectiveSelectedDrawDates}
                  availableBalance={profile?.balance ?? 0}
                  initialColumnsCount={manualBetCount}
                  isSubscription={isSubscription}
                  onSubscriptionChange={setIsSubscription}
                  onReviewColumns={handleMulticolumnPersist}
                  menuItems={gameBottomMenuItems}
                />
              </motion.div>
            ) : (supportsQuickPick && betMethod === null) ? null : (
              <>
                {mode === 'multiple' ? (
                  /* Selector de cantidad de números — el usuario elige cuántos números quiere jugar en el bloque */
                  <div className="space-y-3 rounded-2xl border border-white/70 p-3.5 shadow-sm" style={theme.surface}>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.08em]" style={theme.title}>
                      ¿Cuántos números quieres jugar?
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      {multiplePillOptions.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setMultipleCount(n); handleClear(); }}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-black transition-all active:scale-95',
                            n === effectiveMultipleCount
                              ? 'text-white shadow-md'
                              : 'border border-gray-200 bg-white text-manises-blue/70 hover:border-manises-blue/30'
                          )}
                          style={n === effectiveMultipleCount ? theme.selectedNumber : undefined}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-[10px] font-medium text-slate-400">
                      Se juegan {effectiveMultipleCount} números en un solo bloque.
                    </p>
                    <div className="flex gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={handleRandom}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-manises-gold/60 py-2.5 text-[10px] font-black uppercase tracking-wider text-manises-gold transition-colors active:scale-[0.97] hover:bg-manises-gold/5"
                      >
                        <Spark className="h-3.5 w-3.5" /> Aleatorio
                      </button>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-gray-200 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-500 transition-colors active:scale-[0.97] hover:bg-gray-50"
                      >
                        <RefreshCircle className="h-3.5 w-3.5" /> Limpiar
                      </button>
                    </div>
                  </div>
                ) : mode === 'reduced' ? (
                  /* Selector de cantidad -/+ — en reducidas no hay botón Aleatorio, solo importa cuántos números hay */
                  <div className="space-y-1 rounded-2xl border border-white/70 px-3.5 py-3 text-center shadow-sm" style={theme.surface}>
                    <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Números seleccionados</p>
                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={handleDecrementReduced}
                        disabled={selectedNumbers.length === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-200 text-base font-black text-gray-400 transition-all active:scale-90 disabled:opacity-40"
                        aria-label="Quitar un número"
                      >
                        −
                      </button>
                      <span className="min-w-[2.5ch] text-[28px] font-black leading-none" style={theme.title}>
                        {selectedNumbers.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrementReduced}
                        disabled={selectedNumbers.length >= maxNums}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-manises-gold/60 text-base font-black text-manises-gold transition-all active:scale-90 disabled:opacity-40"
                        aria-label="Añadir un número"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400">Máx. {maxNums} números</p>
                  </div>
                ) : (
                  /* Selección compacta — fila única con burbujas + acciones */
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/70 px-3 py-2 shadow-sm" style={theme.surface}>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                      {Array.from({ length: maxNums }).map((_, i) => (
                        <motion.div
                          key={`slot-${i}`}
                          animate={{ scale: selectedNumbers[i] ? 1 : 0.9 }}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${selectedNumbers[i] ? 'shadow-sm' : 'border-dashed border-gray-200 bg-white/60 text-gray-200'}`}
                          style={selectedNumbers[i] ? theme.selectedNumber : undefined}
                        >
                          {selectedNumbers[i] ?? ''}
                        </motion.div>
                      ))}
                      {maxStars > 0 && (
                        <div className="ml-1 flex gap-1 border-l border-gray-200/80 pl-1.5">
                          {Array.from({ length: maxStars }).map((_, i) => (
                            <motion.div
                              key={`star-slot-${i}`}
                              animate={{ scale: selectedStars[i] ? 1 : 0.9 }}
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${selectedStars[i] ? 'bg-manises-gold border-manises-gold text-manises-blue' : 'border-dashed border-yellow-200 bg-white text-yellow-200'}`}
                            >
                              {selectedStars[i] ?? ''}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={handleRandom}
                        className="flex h-7 items-center gap-1 rounded-lg border border-manises-gold/50 px-2.5 text-[9px] font-bold uppercase tracking-wider text-manises-gold transition-colors hover:bg-manises-gold/5"
                      >
                        <Spark className="h-2.5 w-2.5" /> Aleat.
                      </button>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="flex h-7 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-[9px] font-bold uppercase tracking-wider text-gray-500 transition-colors hover:bg-gray-50"
                      >
                        <RefreshCircle className="h-2.5 w-2.5" /> Limpiar
                      </button>
                    </div>
                  </div>
                )}

                {/* Boleto */}
                <div className="overflow-hidden rounded-2xl" style={theme.surface}>
                  <div className="p-2">
                    {totalStars > 0 ? (
                      <div className="flex gap-2 items-stretch">
                        <div className="flex-1 min-w-0">
                          <NumbersGrid
                            compact
                            columns={5}
                            totalNums={totalNums}
                            selectedNumbers={selectedNumbers}
                            maxNumbersLimit={maxNums}
                            onToggle={toggleNumber}
                            theme={theme}
                            title={mode === 'multiple' ? `Elige ${maxNums} números` : undefined}
                            countLabel={mode === 'multiple' ? `${selectedNumbers.length} / ${maxNums} seleccionados` : undefined}
                          />
                        </div>
                        <div className="w-px self-stretch bg-gray-100/80 shrink-0 mt-5" />
                        <div className="w-[80px] shrink-0">
                          <StarsGrid
                            compact
                            gridCols={game.type === 'primitiva' ? 1 : 2}
                            starValues={starValues}
                            selectedStars={selectedStars}
                            maxStarsLimit={maxStars}
                            onToggle={toggleStar}
                            theme={theme}
                            title={secondarySelectionLabel}
                            labelPrefix={secondarySelectionPrefix}
                          />
                        </div>
                      </div>
                    ) : (
                      <NumbersGrid
                        totalNums={totalNums}
                        selectedNumbers={selectedNumbers}
                        maxNumbersLimit={maxNums}
                        onToggle={toggleNumber}
                        theme={theme}
                        title={mode === 'multiple' ? `Elige ${maxNums} números` : undefined}
                        countLabel={mode === 'multiple' ? `${selectedNumbers.length} / ${maxNums} seleccionados` : undefined}
                      />
                    )}
                  </div>
                </div>

                {mode === 'reduced' && (
                  <motion.div variants={sectionFadeUp} initial="hidden" animate="visible">
                    {compatibleReducedSystems.length > 0 ? (
                      <ReducedSystemList
                        systems={compatibleReducedSystems}
                        game={game}
                        drawsCount={drawsCount}
                        selectedNumbers={selectedNumbers}
                        selectedStars={selectedStars}
                        onPlayWithSystem={handlePlayReduced}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {selectedNumbers.length === 0
                            ? 'Selecciona entre 10 y 30 números para ver las reducciones disponibles.'
                            : 'No hay reducciones compatibles con tu selección actual.'}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Abono semanal — solo en modo manual clásico (no quick pick ni multicolumn que tienen su propio toggle, ni reducida donde casi nadie se abona) */}
        {(!supportsQuickPick || betMethod !== null) && !isMulticolumnMode && !isQuickPickMode && mode !== 'reduced' && (
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
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', isSubscription ? 'bg-manises-blue text-white' : 'bg-manises-blue/8 text-manises-blue')}>
                    <RefreshCircle className={cn('w-6 h-6', isSubscription && 'animate-spin-slow')} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-manises-blue">Jugar todas las semanas</h3>
                    </div>
                    <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">
                      Repite esta jugada automáticamente en próximos sorteos para no quedarte fuera si sube el bote.
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-manises-blue/72">
                      Puedes pausar o dar de baja tu abono desde <span className="font-black">Mi cuenta &gt; Mis abonos</span>.
                    </p>
                  </div>
                </div>
                <div className={cn('mt-1 flex h-7 w-12 shrink-0 rounded-full transition-colors relative', isSubscription ? 'bg-manises-blue' : 'bg-gray-200')}>
                  <motion.div animate={{ x: isSubscription ? 24 : 4 }} className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-2">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]', isSubscription ? 'border border-manises-blue/15 bg-white/80 text-manises-blue' : 'border border-manises-blue/10 bg-manises-blue/[0.05] text-manises-blue/80')}>
                  {isSubscription ? 'Abono activado en esta simulación' : 'Actívalo con un toque'}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500">Sin permanencia</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {shouldShowStickyCta && (
        <PurchaseBottomBar
          availableBalance={availableBalance}
          totalPrice={totalPrice}
          canContinue={canPlay}
          ctaLabel={ctaLabel}
          onContinue={handlePlay}
          activeColor={game.color}
          drawsCount={drawsCount}
          validationText={ctaValidationText}
          menuItems={gameBottomMenuItems}
        />
      )}
    </div>
  );
}
