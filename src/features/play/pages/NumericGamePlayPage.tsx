import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBusinessDate } from '@/shared/lib/timezone';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import {
  RefreshCircle,
  Spark,
  WarningTriangle,
  ControlSlider,
} from 'iconoir-react/regular';
import { toast } from 'sonner';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn, formatCurrency } from '@/shared/lib/utils';
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
import { GameModeSelector } from '../components/GameModeSelector';
import type { LotteryGame } from '@/shared/types/domain';

interface GamePlayLocationState { playDraftId?: string; }

const DEFAULT_CUSTOM_WEEKS = 2;

function formatChipContext(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${weekday} · ${time}`;
}

function formatDrawChip(iso: string): { weekday: string; day: string; time: string } {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
    day: String(d.getDate()),
    time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

interface NumericGamePlayPageProps {
  game: LotteryGame;
}

export function NumericGamePlayPage({ game }: NumericGamePlayPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { drafts, addDrafts, updateDraft } = usePlaySession();

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
  const [manualBetCount, setManualBetCount] = useState(1);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
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
    setIsConfigPanelOpen(false);
  }, [game.id, editingDraftId]);

  const currentModeDefinition = getModeDefinition(game.id, mode);
  const currentSelection = currentModeDefinition?.selection ?? game.selectionRange!;
  const reductionSystems = getReductionSystemsForMode(game.id, mode);
  const currentReductionSystem = mode === 'reduced' ? getReductionSystem(game.id, selectedReductionSystemId) : null;
  const range = currentSelection || { numbers: { min: 1, max: 1, total: 1 } };
  const minNums = range.numbers?.min ?? 1;
  const maxNums = range.numbers?.max ?? 1;
  const totalNums = range.numbers?.total ?? 1;
  const minStars = range.stars?.min ?? 0;
  const maxStars = range.stars?.max ?? minStars;
  const totalStars = range.stars?.total ?? 0;
  const starValues = game.type === 'gordo'
    ? Array.from({ length: totalStars }, (_, i) => i)
    : Array.from({ length: totalStars }, (_, i) => i + 1);
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
  const isOverBalance = profile ? profile.balance < totalPrice : false;

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
    if (supportsQuickPick && mode === 'simple' && betMethod === null) return false;
    if (isMulticolumnMode) return false;
    return selectedNumbers.length > 0;
  })();
  // MANUAL → ocultar setup (grid a pantalla completa). ALEATORIO o sin elegir → mostrar setup.
  const shouldShowInlineSetup = !supportsQuickPick || mode !== 'simple' || betMethod !== 'manual';

  const drawTimeSummary = useMemo(() => {
    const d = new Date(drawStatus.drawDate);
    const cutoff = new Date(drawStatus.salesCloseAt);
    const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const cutoffTime = cutoff.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const countLabel = drawsCount === 1 ? 'Próximo sorteo' : `${drawsCount} sorteos`;
    const cutoffKey = drawStatus.isDemoCutoff ? 'Límite demo' : 'Límite';
    return `${countLabel} · ${weekday} ${time} · ${cutoffKey} ${cutoffTime}`;
  }, [drawStatus, drawsCount]);

  const configMainLine = useMemo(() => {
    const parts: string[] = [];
    if (availableModes.length > 1) {
      const labels: Record<PlayMode, string> = { simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' };
      parts.push(labels[mode]);
    }
    if (mode === 'simple') {
      if (isQuickPickMode) parts.push('Rápida');
      else if (isMulticolumnMode) parts.push('Varias apuestas');
      else parts.push('Manual');
    }
    return parts.length > 0 ? parts.join(' · ') : 'Jugada';
  }, [availableModes.length, isMulticolumnMode, isQuickPickMode, mode]);

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
        active: isConfigPanelOpen,
        onClick: () => setIsConfigPanelOpen((open) => !open),
      },
      {
        id: 'type',
        label: 'Tipo',
        value: modeLabels[mode],
        icon: ControlSlider,
        active: mode !== 'simple',
        onClick: () => setIsConfigPanelOpen((open) => !open),
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
          setIsConfigPanelOpen(false);
        },
      },
    ];
  }, [betMethod, drawsCount, isConfigPanelOpen, mode, supportsQuickPick]);

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
      game.type === 'gordo' ? 10 : totalStars,
      mode === 'reduced' ? minStars : maxStars
    );
    setSelectedNumbers(numbers);
    setSelectedStars(game.type === 'gordo' ? stars.map((v) => v - 1) : stars);
    toast.success('¡Combinación aleatoria generada!');
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setSelectedStars([]);
  };

  const handlePersistQuickPick = () => {
    const quickDrafts = buildQuickPickDrafts({
      game,
      combinations: quickPick.combinations,
      drawDates: effectiveSelectedDrawDates,
      isSubscription,
    });
    const result = addDrafts(quickDrafts);
    if (result.addedCount > 0 && result.duplicateCount === 0) {
      toast.success(result.addedCount === 1 ? 'Jugada añadida.' : `${result.addedCount} jugadas añadidas.`);
    } else if (result.addedCount > 0 && result.duplicateCount > 0) {
      toast.success(`${result.addedCount} añadidas (${result.duplicateCount} duplicadas).`);
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
      if (result.addedCount > 0 && result.duplicateCount === 0) {
        toast.success(result.addedCount === 1 ? 'Jugada añadida.' : `${result.addedCount} jugadas añadidas.`);
      } else if (result.addedCount > 0 && result.duplicateCount > 0) {
        toast.success(`${result.addedCount} añadidas (${result.duplicateCount} duplicadas).`);
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
      toast.success(result.addedCount === 1 ? 'Jugada reducida añadida.' : `${result.addedCount} jugadas añadidas.`);
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
      toast.success(result.addedCount === 1 ? 'Jugada añadida.' : `${result.addedCount} jugadas añadidas.`);
      setSelectedNumbers([]);
      setSelectedStars([]);
    }
    if (result.duplicateCount > 0) {
      toast.error(result.duplicateCount === 1 ? 'Ya tenías esa jugada en la sesión.' : `${result.duplicateCount} jugadas duplicadas no se añadieron.`);
    }
  };

  const ctaLabel = (() => {
    if (canPlay) {
      if (drawsCount > 1) return `Añadir ${drawsCount} jugadas`;
      return editingDraft ? 'Actualizar' : 'Añadir jugada';
    }
    if (supportsQuickPick && mode === 'simple' && betMethod === null) return 'Elige cómo quieres jugar';
    if (isMulticolumnMode) return 'Añadir boleto';
    if (mode === 'reduced' && !isSupportedReducedSelection) return 'Completa la reducida';
    const numsLeft = minNums - selectedNumbers.length;
    const starsLeft = minStars - selectedStars.length;
    if (numsLeft > 0 && starsLeft > 0) return `Elige ${numsLeft} números y ${starsLeft} ${starsLeft === 1 ? 'estrella' : 'estrellas'}`;
    if (numsLeft > 0) return `Elige ${numsLeft} ${numsLeft === 1 ? 'número' : 'números'}`;
    if (starsLeft > 0) return `Elige ${starsLeft} ${starsLeft === 1 ? 'estrella' : 'estrellas'}`;
    return 'Completa la jugada';
  })();

  const ctaValidationText = supportsQuickPick && mode === 'simple' && betMethod === null
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

        {/* Config bar — oculta cuando el grid de números está activo */}
        {!isConfigPanelOpen && !isMulticolumnMode && !isQuickPickMode && (
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
                  <span className="text-[12px] font-black text-manises-blue leading-tight">{configMainLine}</span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 truncate pl-3">{drawTimeSummary}</p>
              </div>
              <span className="shrink-0 rounded-xl bg-manises-blue/[0.06] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-manises-blue/60 group-hover:bg-manises-blue/10 group-hover:text-manises-blue transition-colors">
                Cambiar
              </span>
            </div>
          </button>
        )}

        {/* Config panel — expandido (también oculto cuando el grid está activo) */}
        {isConfigPanelOpen && !isMulticolumnMode && !isQuickPickMode && (
          <motion.div variants={sectionFadeUp} initial="hidden" animate="visible">
            <div className="space-y-3 rounded-[1.2rem] border border-manises-blue/10 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-manises-blue/[0.06]">
                    <ControlSlider className="w-3.5 h-3.5 text-manises-blue/60" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-manises-blue">Configurar jugada</span>
                </div>
                <button
                  onClick={() => setIsConfigPanelOpen(false)}
                  className="flex h-9 items-center justify-center rounded-xl px-3 text-[10px] font-bold uppercase tracking-widest text-manises-blue/60 hover:bg-manises-blue/[0.06] hover:text-manises-blue transition-colors"
                >
                  Cerrar
                </button>
              </div>

              <DrawStatusPill drawStatus={drawStatus} selectedDrawsCount={drawsCount} />

              {availableModes.length > 1 && (
                <div>
                  <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Tipo de jugada</p>
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
                      handleClear();
                      if (m !== 'simple') setBetMethod('manual');
                      setIsConfigPanelOpen(false);
                    }}
                  />
                </div>
              )}

              {mode === 'simple' && (
                <div>
                  <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">¿Cómo quieres jugar?</p>
                  <div className="flex p-1 bg-slate-100/70 rounded-xl border border-slate-200/50">
                    <button
                      onClick={() => { setBetMethod('random'); setIsConfigPanelOpen(false); }}
                      className={cn(
                        'flex-1 py-2.5 px-3 rounded-[0.55rem] text-[9px] font-black uppercase tracking-widest transition-all',
                        betMethod === 'random' ? 'bg-white text-manises-blue shadow-sm' : 'text-slate-400'
                      )}
                    >
                      Aleatorio
                    </button>
                    <button
                      onClick={() => setBetMethod('manual')}
                      className={cn(
                        'flex-1 py-2.5 px-3 rounded-[0.55rem] text-[9px] font-black uppercase tracking-widest transition-all',
                        betMethod === 'manual' ? 'bg-white text-manises-blue shadow-sm' : 'text-slate-400'
                      )}
                    >
                      Manual
                    </button>
                  </div>
                </div>
              )}

              {supportsTimeSelection && (
                <div>
                  <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Sorteo</p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5 px-0.5">
                      {[
                        { id: 'next_draw', label: 'Próximo' },
                        { id: 'full_week', label: 'Esta semana' },
                        { id: 'next_week', label: 'Próxima semana' },
                        { id: 'two_weeks', label: '2 semanas' },
                      ].map((opt) => {
                        let isActive = false;
                        if (opt.id === 'next_draw') isActive = timeMode === 'next_draw';
                        else if (opt.id === 'full_week') isActive = timeMode === 'full_week' || areDatesEqual(effectiveSelectedDrawDates, currentWeekDates);
                        else if (opt.id === 'next_week') isActive = areDatesEqual(effectiveSelectedDrawDates, nextWeekDates);
                        else if (opt.id === 'two_weeks') isActive = timeMode === 'two_weeks' || areDatesEqual(effectiveSelectedDrawDates, twoWeeksDates);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              if (opt.id === 'next_week') { setTimeMode('specific_days'); setSelectedDrawDates(nextWeekDates); }
                              else if (opt.id === 'two_weeks') { setTimeMode('specific_days'); setSelectedDrawDates(twoWeeksDates); }
                              else { setTimeMode(opt.id as ScheduleMode); setSelectedDrawDates([]); }
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border',
                              isActive ? 'bg-manises-blue text-white border-manises-blue shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => { setTimeMode('specific_days'); setSelectedDrawDates([]); }}
                        className="ml-auto px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300"
                      >
                        Limpiar
                      </button>
                    </div>

                    <div className="custom-scrollbar max-h-[220px] space-y-3 overflow-y-auto pr-1">
                      {(Object.entries(groupedAllDraws) as [string, ScheduledDraw[]][]).map(([weekLabel, draws], index) => {
                        const displayLabel = index === 0 ? 'Esta semana' : index === 1 ? 'Próxima semana' : weekLabel;
                        return (
                          <div key={weekLabel} className="space-y-2">
                            <p className="pl-1 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">{displayLabel}</p>
                            <div className="flex flex-wrap gap-2">
                              {draws.map((draw) => {
                                const isSelected = effectiveSelectedDrawDates.includes(draw.drawDate);
                                return (
                                  <button
                                    key={draw.drawDate}
                                    onClick={() => {
                                      setTimeMode('specific_days');
                                      setSelectedDrawDates((prev) =>
                                        prev.includes(draw.drawDate)
                                          ? prev.filter((d) => d !== draw.drawDate)
                                          : [...prev, draw.drawDate].sort()
                                      );
                                    }}
                                    className={cn(
                                      'relative flex min-w-[60px] flex-col items-center justify-center rounded-xl border px-2.5 py-2 transition-all',
                                      isSelected ? 'bg-manises-blue/10 border-manises-blue shadow-[0_4px_12px_rgba(10,71,146,0.14)]' : 'bg-white border-slate-100 hover:border-slate-200'
                                    )}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        layoutId="selected-draw-indicator"
                                        className="absolute inset-0 rounded-xl border-2 border-manises-blue z-0"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                      />
                                    )}
                                    <span className={cn('relative z-10 text-[9px] font-semibold leading-tight', isSelected ? 'text-manises-blue/80' : 'text-slate-400')}>
                                      {formatChipContext(draw.drawDate)}
                                    </span>
                                    <span className={cn('relative z-10 text-[12px] font-black leading-tight mt-0.5', isSelected ? 'text-manises-blue' : 'text-slate-700')}>
                                      {new Date(draw.drawDate).getDate()} {new Date(draw.drawDate).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="px-1 text-[10px] font-medium italic text-slate-400">
                      * Puedes combinar días sueltos de distintas semanas
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Flujo secuencial — fechas, tipo, método, cantidad */}
        {shouldShowInlineSetup && (
        <div className="space-y-2.5">

          {supportsTimeSelection && game.type !== 'gordo' && (
            <div className="rounded-[1.2rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
              <div className="flex items-start justify-between gap-2 px-3.5 pt-2.5 pb-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">Sorteos abiertos</p>
                  <p className="mt-0.5 text-[9px] font-medium text-slate-400 leading-tight">
                    {'Próximo: '}
                    {new Date(drawStatus.drawDate).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                    {' '}
                    {new Date(drawStatus.drawDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    {' · '}
                    {drawStatus.isDemoCutoff ? 'Límite demo' : 'Límite'}
                    {' '}
                    {new Date(drawStatus.salesCloseAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
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
                  onClick={() => { setTimeMode('full_week'); setSelectedDrawDates([]); }}
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
                      }}
                      className={cn(
                        'flex shrink-0 items-center self-center rounded-lg border px-2 py-1.5 text-[8px] font-black uppercase tracking-wider transition-all',
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
                        }}
                        className={cn(
                          'relative flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border min-w-[52px] px-1.5 py-2 transition-all',
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
                        <span className={cn('relative z-10 text-[8px] font-semibold leading-none', isSelected ? 'text-manises-blue/70' : 'text-slate-400')}>{chip.weekday}</span>
                        <span className={cn('relative z-10 text-[13px] font-black leading-none', isSelected ? 'text-manises-blue' : 'text-slate-700')}>{chip.day}</span>
                        <span className={cn('relative z-10 text-[7px] font-semibold leading-none tabular-nums', isSelected ? 'text-manises-blue/70' : 'text-slate-400')}>{chip.time}</span>
                      </button>
                    );
                  });

                  return [separator, ...chips];
                })}
              </div>
            </div>
          )}

          {(!supportsTimeSelection || game.type === 'gordo') && (
            <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Sorteo</p>
                <DrawStatusPill drawStatus={drawStatus} selectedDrawsCount={1} />
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
            <div
              className="rounded-[1.2rem] border-2 border-slate-200 bg-white px-3.5 py-2.5 shadow-sm"
            >
              <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue">¿Cómo quieres jugar?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBetMethod('random')}
                  className="flex items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500 transition-all active:scale-[0.97] hover:border-slate-300"
                >
                  <Spark className="w-3.5 h-3.5 shrink-0 text-manises-gold" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Aleatorio</p>
                    <p className="text-[8px] font-semibold mt-0.5 leading-none text-slate-400">Rápido</p>
                  </div>
                </button>
                <button
                  onClick={() => setBetMethod('manual')}
                  className="flex items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 transition-all active:scale-[0.97] hover:border-slate-300"
                >
                  <ControlSlider className="w-3.5 h-3.5 shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Manual</p>
                    <p className="text-[8px] font-semibold mt-0.5 leading-none text-slate-400">Tus números</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Toggle compacto tras elegir ALEATORIO — sin ocupar espacio extra */}
          {mode === 'simple' && betMethod === 'random' && (
            <div className="flex overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100/70 p-1">
              <button
                onClick={() => setBetMethod('random')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[0.5rem] py-2 text-[9px] font-black uppercase tracking-widest bg-white text-manises-blue shadow-sm"
              >
                <Spark className="w-3 h-3 text-manises-gold" /> Aleatorio
              </button>
              <button
                onClick={() => setBetMethod('manual')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[0.5rem] py-2 text-[9px] font-black uppercase tracking-widest text-slate-400"
              >
                <ControlSlider className="w-3 h-3" /> Manual
              </button>
            </div>
          )}

          {mode === 'simple' && betMethod === 'manual' && (
            <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Número de apuestas</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setManualBetCount((c) => Math.max(1, c - 1))}
                    disabled={manualBetCount <= 1}
                    className={cn(
                      'w-8 h-8 rounded-lg border flex items-center justify-center text-base font-bold transition-all active:scale-95',
                      manualBetCount <= 1 ? 'border-slate-100 text-slate-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >−</button>
                  <span className="text-base font-black text-manises-blue w-6 text-center tabular-nums">{manualBetCount}</span>
                  <button
                    onClick={() => setManualBetCount((c) => Math.min(15, c + 1))}
                    disabled={manualBetCount >= 15}
                    className={cn(
                      'w-8 h-8 rounded-lg border flex items-center justify-center text-base font-bold transition-all active:scale-95',
                      manualBetCount >= 15 ? 'border-slate-100 text-slate-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >+</button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Aviso saldo insuficiente */}
        {isOverBalance && (
          <motion.div variants={sectionFadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-[linear-gradient(180deg,#fff5f5_0%,#fff1f2_100%)] p-3.5 shadow-sm">
            <WarningTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-normal">
              Saldo insuficiente ({formatCurrency(profile?.balance ?? 0)}). <br />
              Necesitas {formatCurrency(totalPrice)} para jugar esta variante.
            </p>
          </motion.div>
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
            ) : (supportsQuickPick && mode === 'simple' && betMethod === null) ? null : (
              <>
                {/* Selección visual */}
                <div className="surface-neo-soft flex flex-col items-center gap-2 rounded-[1.2rem] border border-white/70 p-2 shadow-sm" style={theme.surface}>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {(mode === 'reduced'
                      ? Array.from({ length: Math.max(minNums, selectedNumbers.length || minNums) })
                      : Array.from({ length: maxNums })
                    ).map((_, i) => (
                      <motion.div
                        key={`slot-${i}`}
                        animate={{ scale: selectedNumbers[i] ? 1 : 0.95 }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black transition-colors ${selectedNumbers[i] ? 'shadow-sm' : 'bg-white border-dashed border-gray-200 text-gray-200'}`}
                        style={selectedNumbers[i] ? theme.selectedNumber : undefined}
                      >
                        {selectedNumbers[i] ?? ''}
                      </motion.div>
                    ))}
                    {maxStars > 0 && (
                      <div className="ml-0.5 flex gap-1.5 border-l-2 border-gray-200 pl-2">
                        {Array.from({ length: mode === 'reduced' ? minStars : maxStars }).map((_, i) => (
                          <motion.div
                            key={`star-slot-${i}`}
                            animate={{ scale: selectedStars[i] ? 1 : 0.95 }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black transition-colors ${selectedStars[i] ? 'bg-manises-gold border-manises-gold text-manises-blue shadow-gold' : 'bg-white border-dashed border-yellow-200 text-yellow-200'}`}
                          >
                            {selectedStars[i] ?? ''}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="outline" size="sm"
                      className="h-7 rounded-lg border-manises-gold/50 px-3 text-[9px] font-bold uppercase tracking-wider text-manises-gold hover:bg-manises-gold/5"
                      onClick={handleRandom}
                    >
                      <Spark className="w-3 h-3 mr-1" /> Aleatorio
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className="h-7 rounded-lg border-gray-200 px-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50"
                      onClick={handleClear}
                    >
                      <RefreshCircle className="w-3 h-3 mr-1" /> Limpiar
                    </Button>
                  </div>
                </div>

                {/* Boleto */}
                {totalStars > 0 ? (
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 min-w-0">
                      <NumbersGrid
                        compact
                        columns={5}
                        totalNums={totalNums}
                        selectedNumbers={selectedNumbers}
                        maxNumbersLimit={mode === 'reduced' && supportedReducedNumbers.length > 0 ? supportedReducedNumbers[supportedReducedNumbers.length - 1] : maxNums}
                        onToggle={toggleNumber}
                        theme={theme}
                      />
                    </div>
                    <div className="w-px self-stretch bg-gray-100 shrink-0 mt-5" />
                    <div className="w-[76px] shrink-0">
                      <StarsGrid
                        compact
                        gridCols={2}
                        starValues={starValues}
                        selectedStars={selectedStars}
                        maxStarsLimit={maxStars}
                        onToggle={toggleStar}
                        theme={theme}
                        title={game.type === 'gordo' ? 'Clave' : 'Estrellas'}
                        labelPrefix={game.type === 'gordo' ? 'Clave' : 'Estrella'}
                      />
                    </div>
                  </div>
                ) : (
                  <NumbersGrid
                    totalNums={totalNums}
                    selectedNumbers={selectedNumbers}
                    maxNumbersLimit={mode === 'reduced' && supportedReducedNumbers.length > 0 ? supportedReducedNumbers[supportedReducedNumbers.length - 1] : maxNums}
                    onToggle={toggleNumber}
                    theme={theme}
                  />
                )}

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

        {/* Abono semanal — solo en modo manual clásico (no quick pick ni multicolumn que tienen su propio toggle) */}
        {(!supportsQuickPick || betMethod !== null) && !isMulticolumnMode && !isQuickPickMode && (
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
