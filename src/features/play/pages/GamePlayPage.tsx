import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBusinessDate } from '@/shared/lib/timezone';
import { motion, AnimatePresence } from 'motion/react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { Button } from '@/shared/ui/Button';
import { GameBadge } from '@/shared/ui/GameBadge';
import {
  NavArrowLeft,
  RefreshCircle,
  Spark,
  InfoCircle,
  WarningTriangle,
  ControlSlider,
} from 'iconoir-react/regular';
import { toast } from 'sonner';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn, formatCurrency, formatDrawTime } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { MOTION_EASE_OUT, panelSwap, sectionFadeUp } from '@/shared/lib/motion';
import { QUINIELA_REDUCED_TABLES, QuinielaReducedType } from '../lib/bet-calculator';
import { getGameHelpContent } from '../lib/game-help';
import { getAvailableModesForGame, getModeDefinition, getReductionSystem, getReductionSystemsForMode, type PlayMode } from '../lib/play-matrix';
import { GameModeSelector } from '../components/GameModeSelector';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { QuinielaProfessionalSelector } from '../components/QuinielaProfessionalSelector';
import { ReductionSystemSelector } from '../components/ReductionSystemSelector';
import { ReducedModeSummary } from '../reduced/components/ReducedModeSummary';
import { ReducedSystemPicker } from '../reduced/components/ReducedSystemPicker';
import { getCompatibleReducedSystems } from '../reduced/application/get-compatible-reduced-systems';
import { NumbersGrid } from '../components/NumbersGrid';
import { StarsGrid } from '../components/StarsGrid';
import { NationalAdvancedFlow } from '../national/components/NationalAdvancedFlow';
import { MulticolumnTicketFlow } from '../multicolumn/components/MulticolumnTicketFlow';
import type { MulticolumnDraftIntent } from '../multicolumn/contracts/multicolumn-play.contract';
import { inferMulticolumnPlayMode } from '../multicolumn/application/infer-multicolumn-play-mode';
import { getDrawScheduleConfig, type ScheduleMode } from '@/features/play/config/draw-schedule.config';
import { getDrawsForCurrentWeek, groupDrawsByWeek, getUpcomingDraws, type ScheduledDraw } from '../lib/draw-schedule';
import { usePlaySession } from '@/features/session/hooks/usePlaySession';
import { PlaySessionIndicator } from '@/features/session/components/PlaySessionIndicator';
import { buildGameSelection } from '@/features/play/application/build-game-selection';
import { buildPlayDrafts } from '@/features/play/application/build-play-drafts';
import { resolvePlayPricing } from '@/features/play/application/resolve-play-pricing';
import {
  getAvailableNationalDrawDates,
  getNextWeekdayIso,
  inferScheduleModeFromDrawDates,
  resolveDrawDates,
} from '@/features/play/application/resolve-draw-dates';
import {
  NATIONAL_DRAW_CONFIG,
  DEFAULT_NATIONAL_SEARCH_STATE,
} from '@/features/play/national/mocks/national-showcase.mock';
import type { NationalDrawId } from '@/features/play/national/contracts/national-play.contract';
import { useNationalShowcase } from '@/features/play/national/hooks/useNationalShowcase';
import { useNationalCart } from '@/features/play/national/hooks/useNationalCart';
import { buildNationalCartDraftIntent } from '@/features/play/national/application/build-national-cart-intent';
import { useQuickPick } from '../quick-pick/hooks/useQuickPick';
import { buildQuickPickDrafts } from '../quick-pick/application/build-quick-pick-drafts';
import { QuickPickPanel } from '../quick-pick/components/QuickPickPanel';
import type { PlayDraft } from '@/features/session/types/session.types';
import { DrawStatusPill } from '../draw-status/components/DrawStatusPill';
import { resolveDrawStatus } from '../draw-status/application/resolve-draw-status';

interface GamePlayLocationState { playDraftId?: string; }

const DEFAULT_CUSTOM_WEEKS = 2;

const SCHEDULE_OPTIONS: Array<{ id: ScheduleMode; label: string }> = [
  { id: 'next_draw', label: 'Próximo sorteo' },
  { id: 'full_week', label: 'Toda la semana' },
  { id: 'specific_days', label: 'Elegir días' },
];

interface QuinielaMatch {
  id: number;
  home: string;
  away: string;
  result: string | null;
}

function formatChipContext(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${weekday} · ${time}`;
}

export function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isDemo } = useAuth();
  const { drafts, addDrafts, updateDraft } = usePlaySession();
  const game = LOTTERY_GAMES.find(g => g.id === gameId);
  const editingDraftId = (location.state as GamePlayLocationState | null)?.playDraftId;
  const editingDraft = useMemo(
    () => drafts.find((draft) => draft.id === editingDraftId),
    [drafts, editingDraftId]
  );

  const availableModes: PlayMode[] = game ? getAvailableModesForGame(game.id) : ['simple'];

  const [mode, setMode] = useState<PlayMode>(availableModes[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);

  // Quiniela & Nacional Específico
  const [quinielaMatches, setQuinielaMatches] = useState<QuinielaMatch[]>([]);
  const [selectedReductionSystemId, setSelectedReductionSystemId] = useState<string>('reducida_1');
  const [selectedNationalDrawId, setSelectedNationalDrawId] = useState<NationalDrawId>(
    gameId === 'loteria-nacional-jueves' ? 'jueves' : 'sabado'
  );
  const [selectedNationalNumber, setSelectedNationalNumber] = useState<string | null>(null);
  const [selectedNationalQuantity, setSelectedNationalQuantity] = useState(1);
  const [timeMode, setTimeMode] = useState<ScheduleMode>('next_draw');
  const [selectedWeeksCount, setSelectedWeeksCount] = useState(DEFAULT_CUSTOM_WEEKS);
  const [selectedDrawDates, setSelectedDrawDates] = useState<string[]>([]);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);

  // Features Laguinda Style
  const [isSubscription, setIsSubscription] = useState(false);
  const [isMulticolumnMode, setIsMulticolumnMode] = useState(false);
  const [isQuickPickMode, setIsQuickPickMode] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <p className="font-bold text-manises-blue text-lg">Juego no encontrado</p>
        <Button onClick={() => navigate('/games')} className="bg-manises-blue text-white rounded-xl">
          Ver catálogo
        </Button>
      </div>
    );
  }

  const isNationalLottery = game.type === 'loteria-nacional' || game.type === 'navidad' || game.type === 'nino';
  const isQuiniela = game.id === 'quiniela';
  const isExplicitNationalProduct = gameId === 'loteria-nacional-jueves' || gameId === 'loteria-nacional-sabado';

  const supportsQuickPick = !isNationalLottery && !isQuiniela && Boolean(game.selectionRange?.numbers);
  const quickPick = useQuickPick(game, supportsQuickPick);

  const availableNationalDates = useMemo(() => {
    return getAvailableNationalDrawDates(gameId, isNationalLottery, isExplicitNationalProduct);
  }, [isExplicitNationalProduct, isNationalLottery, gameId]);
  const {
    setDrawId: setNationalShowcaseDrawId,
    searchState: nationalSearchState,
    setSearchState: setNationalSearchState,
    items: nationalShowcase,
    totalItems: nationalShowcaseCount,
  } = useNationalShowcase(gameId === 'loteria-nacional-sabado' ? 'sabado' : 'jueves');
  const {
    lines: nationalCartLines,
    addOrUpdateLine: addOrUpdateNationalCartLine,
    removeLine: removeNationalCartLine,
    updateQuantity: updateNationalCartQuantity,
    clearCart: clearNationalCart,
    breakdown: nationalCartBreakdown,
  } = useNationalCart();

  // Resetear estados cuando cambia el juego para evitar arrastrar selecciones o precios incorrectos
  useEffect(() => {
    setSelectedNumbers([]);
    setSelectedStars([]);
    setSelectedNationalNumber(null);
    setSelectedNationalQuantity(1);
    setIsMulticolumnMode(false);

    // Sincronizar sorteo nacional por defecto
    if (gameId === 'loteria-nacional-jueves') setSelectedNationalDrawId('jueves');
    else if (gameId === 'loteria-nacional-sabado') setSelectedNationalDrawId('sabado');
    else setSelectedNationalDrawId('especial');

    // Inicializar fechas de sorteo
    if (isNationalLottery && availableNationalDates.length > 0) {
      setSelectedDrawDates([availableNationalDates[0]]);
    } else {
      setSelectedDrawDates([]);
    }
  }, [gameId, availableNationalDates, isNationalLottery]);

  useEffect(() => {
    if (!editingDraft || editingDraft.gameId !== gameId) {
      return;
    }

    setMode((editingDraft.mode as PlayMode) ?? availableModes[0]);
    setIsSubscription(editingDraft.isSubscription);
    setIsMulticolumnMode(false);
    
    // Reconstrucción inteligente de la intención temporal (UI mapping)
    const draftDates = Array.isArray(editingDraft.metadata?.orderDrawDates)
      ? editingDraft.metadata.orderDrawDates.filter((drawDate): drawDate is string => typeof drawDate === 'string')
      : [editingDraft.drawDate];
    setSelectedDrawDates(draftDates);
    setTimeMode(inferScheduleModeFromDrawDates(draftDates, game.type));
    setSelectedWeeksCount(DEFAULT_CUSTOM_WEEKS);

    if (editingDraft.selection.type === 'national') {
      setSelectedNationalNumber(editingDraft.selection.number);
      setSelectedNationalQuantity(editingDraft.quantity);
      setSelectedNumbers([]);
      setSelectedStars([]);
      return;
    }

    if (editingDraft.selection.type === 'quiniela') {
      setSelectedReductionSystemId(editingDraft.selection.systemId ?? 'reducida_1');
      setQuinielaMatches((current) => current.map((match) => {
        const nextMatch = editingDraft.selection.type === 'quiniela'
          ? editingDraft.selection.matches.find((item) => item.id === match.id)
          : undefined;
        return {
          ...match,
          result: nextMatch?.value ?? null,
        };
      }));
      return;
    }

    if ('numbers' in editingDraft.selection) {
      setSelectedNumbers(editingDraft.selection.numbers);
    }

    if (editingDraft.selection.type === 'euromillones') {
      setSelectedStars(editingDraft.selection.stars);
      return;
    }

    if (editingDraft.selection.type === 'gordo') {
      setSelectedStars([editingDraft.selection.key]);
      return;
    }

    if (editingDraft.selection.type === 'eurodreams') {
      setSelectedStars([editingDraft.selection.dream]);
      return;
    }

    setSelectedStars([]);
  }, [availableModes, editingDraft, gameId]);

  const isStructuredGame = Boolean(game.selectionRange) || isNationalLottery || isQuiniela;
  const drawScheduleConfig = getDrawScheduleConfig(game.type);
  const supportsTimeSelection = (Boolean(drawScheduleConfig?.supportsMultipleDrawSelection) && !isQuiniela) ||
    (isNationalLottery && isExplicitNationalProduct);

  if (!isStructuredGame) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="rounded-3xl border border-manises-blue/10 bg-white px-6 py-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-manises-gold">Próximamente</p>
          <h1 className="mt-2 text-2xl font-black text-manises-blue">{game.name}</h1>
          <p className="mt-3 max-w-[18rem] text-sm font-medium leading-relaxed text-muted-foreground">
            Esta variante todavía no está preparada en la app demo. El juego sigue visible en catálogo, pero su flujo de compra aún no está habilitado.
          </p>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => navigate('/games')} className="rounded-xl bg-manises-blue text-white">
              Ver otros juegos
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentModeDefinition = getModeDefinition(game.id, mode);
  const currentSelection = currentModeDefinition?.selection ?? game.selectionRange!;
  const reductionSystems = game ? getReductionSystemsForMode(game.id, mode) : [];
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
  const isSupportedReducedSelection = isNationalLottery || mode !== 'reduced' || isQuiniela || supportedReducedNumbers.length === 0 || supportedReducedNumbers.includes(selectedNumbers.length);

  const theme = getGameTheme(game);
  const maxWeeksSelectable = drawScheduleConfig?.maxWeeksSelectable ?? DEFAULT_CUSTOM_WEEKS;

  const nationalDraws = (game.id === 'loteria-nacional-jueves' || game.id === 'loteria-nacional-sabado')
    ? NATIONAL_DRAW_CONFIG.filter(d => {
      if (game.id === 'loteria-nacional-jueves') return d.id === 'jueves';
      if (game.id === 'loteria-nacional-sabado') return d.id === 'sabado';
      return true;
    }).map((draw) => ({
      ...draw,
      nextDraw: getNextWeekdayIso(draw.weekday, draw.hour),
    }))
    : [{
      id: 'especial' as NationalDrawId,
      label: game.name,
      weekday: new Date(game.nextDraw).getDay(),
      hour: new Date(game.nextDraw).getHours(),
      decimoPrice: game.price,
      firstPrize: game.jackpot,
      secondPrize: game.jackpot * 0.2, // Fallback
      nextDraw: game.nextDraw
    }];
  const selectedNationalDraw = nationalDraws.find((draw) => draw.id === selectedNationalDrawId) ?? nationalDraws[0];
  const drawDateResolution = useMemo(() => resolveDrawDates({
    gameType: game.type,
    gameNextDraw: game.nextDraw,
    isNationalLottery,
    isExplicitNationalProduct,
    supportsTimeSelection,
    scheduleMode: timeMode,
    selectedDrawDates,
    selectedWeeksCount,
    selectedNationalDrawNextDraw: selectedNationalDraw.nextDraw,
    availableNationalDates,
  }), [
    availableNationalDates,
    game.nextDraw,
    game.type,
    isExplicitNationalProduct,
    isNationalLottery,
    selectedDrawDates,
    selectedNationalDraw.nextDraw,
    selectedWeeksCount,
    supportsTimeSelection,
    timeMode,
  ]);
  const effectiveSelectedDrawDates = drawDateResolution.drawDates;
  const drawsCount = Math.max(effectiveSelectedDrawDates.length, 1);

  const quickPickPricing = useMemo(() => {
    return resolvePlayPricing({
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
    });
  }, [game, effectiveSelectedDrawDates]);

  const quickPickTotalPrice = quickPickPricing.totalPrice * quickPick.count;
  const handlePersistQuickPick = () => {
    const drafts = buildQuickPickDrafts({
      game,
      combinations: quickPick.combinations,
      drawDates: effectiveSelectedDrawDates,
      isSubscription,
    });

    addDrafts(drafts);
    toast.success(`${quickPick.count} jugadas rápidas demo añadidas.`);
    setIsQuickPickMode(false);
  };

  const { betsCount, drawPrice, totalPrice } = resolvePlayPricing({
    game,
    isNationalLottery,
    isQuiniela,
    mode,
    selectedNumbersCount: selectedNumbers.length,
    selectedStarsCount: selectedStars.length,
    selectedReductionSystemId,
    selectedNationalQuantity,
    selectedNationalDraw,
    drawsCount,
  });
  const isOverBalance = profile ? profile.balance < totalPrice : false;
  const availableBalance = profile?.balance ?? 0;
  const remainingBalance = Math.max(availableBalance - totalPrice, 0);

  const selectedNationalTicket = nationalShowcase.find((ticket) => ticket.number === selectedNationalNumber);
  const maxNationalQuantity = selectedNationalTicket?.available ?? 1;

  const helpContent = getGameHelpContent({
    game,
    mode,
    betsCount,
    totalPrice,
    reducedSystemId: mode === 'reduced' ? selectedReductionSystemId : undefined,
  });
  const allAvailableDraws = useMemo(() => {
    if (isNationalLottery) {
      return availableNationalDates.map((date) => ({
        gameId: game.type,
        drawDate: date,
        label: new Date(date).toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        weekLabel: 'Sorteos disponibles',
        isClosed: false,
      }));
    }
    return getUpcomingDraws(game.type, new Date(), 4);
  }, [game.type, isNationalLottery, availableNationalDates]);

  const groupedAllDraws = useMemo(() => groupDrawsByWeek(allAvailableDraws), [allAvailableDraws]);
  const highlightedDrawDate = useMemo(() => {
    const sortedDrawDates = [...effectiveSelectedDrawDates].sort((left, right) => left.localeCompare(right));
    if (sortedDrawDates.length > 0) {
      return sortedDrawDates[0];
    }

    return getBusinessDate(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw);
  }, [effectiveSelectedDrawDates, game.nextDraw, isNationalLottery, selectedNationalDraw.nextDraw]);
  const drawStatus = useMemo(() => resolveDrawStatus({
    drawDate: highlightedDrawDate,
  }), [highlightedDrawDate]);

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

  const configSummary = useMemo(() => {
    const parts: string[] = [];
    if (availableModes.length > 1) {
      const modeLabels: Record<PlayMode, string> = { simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' };
      parts.push(modeLabels[mode]);
    }
    if (!isQuiniela && mode === 'simple') {
      if (isQuickPickMode) parts.push('Rápida');
      else if (isMulticolumnMode) parts.push('Varias apuestas');
      else parts.push('Manual');
    }
    parts.push(drawTimeSummary);
    return parts.join(' · ');
  }, [availableModes.length, drawTimeSummary, isMulticolumnMode, isQuickPickMode, isQuiniela, mode]);

  const configMainLine = useMemo(() => {
    const parts: string[] = [];
    if (availableModes.length > 1) {
      const modeLabels: Record<PlayMode, string> = { simple: 'Simple', multiple: 'Múltiple', reduced: 'Reducida' };
      parts.push(modeLabels[mode]);
    }
    if (!isQuiniela && mode === 'simple') {
      if (isQuickPickMode) parts.push('Rápida');
      else if (isMulticolumnMode) parts.push('Varias apuestas');
      else parts.push('Manual');
    }
    return parts.length > 0 ? parts.join(' · ') : 'Jugada';
  }, [availableModes.length, isMulticolumnMode, isQuickPickMode, isQuiniela, mode]);

  // Auxiliares para botones de acción rápida
  const currentWeekDraws = useMemo(() => getDrawsForCurrentWeek(game.type, new Date()), [game.type]);
  const currentWeekDates = useMemo(() => currentWeekDraws.map(d => d.drawDate), [currentWeekDraws]);
  
  const nextWeekDraws = useMemo(() => {
    const allUpcoming = getUpcomingDraws(game.type, new Date(), 2);
    const currentWeekEnd = new Date();
    currentWeekEnd.setDate(currentWeekEnd.getDate() + (7 - currentWeekEnd.getDay()) % 7);
    currentWeekEnd.setHours(23, 59, 59, 999);
    return allUpcoming.filter(d => new Date(d.drawDate) > currentWeekEnd);
  }, [game.type]);
  const nextWeekDates = useMemo(() => nextWeekDraws.map(d => d.drawDate), [nextWeekDraws]);

  const twoWeeksDates = useMemo(() => [...currentWeekDates, ...nextWeekDates], [currentWeekDates, nextWeekDates]);

  const areDatesEqual = (a: string[], b: string[]) => 
    a.length === b.length && a.every(val => b.includes(val));

  useEffect(() => {
    setTimeMode('next_draw');
    setSelectedWeeksCount(Math.min(DEFAULT_CUSTOM_WEEKS, maxWeeksSelectable));
  }, [game.id, maxWeeksSelectable]);

  useEffect(() => {
    if (!isNationalLottery) {
      return;
    }

    setNationalShowcaseDrawId(isExplicitNationalProduct ? selectedNationalDrawId : 'especial');
  }, [isExplicitNationalProduct, isNationalLottery, selectedNationalDrawId, setNationalShowcaseDrawId]);

  useEffect(() => {
    setIsConfigPanelOpen(false);
  }, [game.id, editingDraftId]);

  const toggleNumber = (n: number) => {
    setSelectedNumbers(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : prev.length < maxNums
          ? [...prev, n].sort((a, b) => a - b)
          : (toast.error(`Máximo ${maxNums} números`), prev)
    );
  };

  const toggleStar = (n: number) => {
    setSelectedStars(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : prev.length < maxStars
          ? [...prev, n].sort((a, b) => a - b)
          : (toast.error(`Máximo ${maxStars} estrellas`), prev)
    );
  };

  const handleRandom = () => {
    if (isNationalLottery) {
      const randomTicket = nationalShowcase[Math.floor(Math.random() * nationalShowcase.length)];
      if (!randomTicket) {
        toast.error('No hay décimos disponibles en el escaparate demo.');
        return;
      }
      setSelectedNationalNumber(randomTicket.number);
      setSelectedNationalQuantity(Math.min(2, randomTicket.available));
      toast.success(`Décimo ${randomTicket.number} seleccionado`);
      return;
    }

    const { numbers, stars } = generateRandomPlay(
      totalNums,
      mode === 'reduced' && supportedReducedNumbers.length > 0 ? supportedReducedNumbers[0] : maxNums,
      game.type === 'gordo' ? 10 : totalStars,
      mode === 'reduced' ? minStars : maxStars
    );
    setSelectedNumbers(numbers);
    setSelectedStars(game.type === 'gordo' ? stars.map((value) => value - 1) : stars);
    toast.success('¡Combinación aleatoria generada!');
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setSelectedStars([]);
    setSelectedNationalNumber(null);
    setSelectedNationalQuantity(1);

    if (isNationalLottery) {
      setNationalSearchState(DEFAULT_NATIONAL_SEARCH_STATE);
    }
  };

  const handleShare = async () => {
    const nationalShare = selectedNationalNumber
      ? `décimo ${selectedNationalNumber} (${selectedNationalQuantity} ud.) para el sorteo de ${selectedNationalDraw.label}`
      : 'un décimo de Lotería Nacional';
    const text = isNationalLottery
      ? `¡Acabo de jugar ${nationalShare} en Lotería Manises! ¡A por el premio!`
      : `¡Acabo de jugar a la ${game.name} en Lotería Manises! Mis números: ${selectedNumbers.join(', ')}${selectedStars.length > 0 ? ' + ' + selectedStars.join(', ') : ''}. ¡A por el bote! 🍀`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi apuesta en Lotería Manises',
          text,
          url: window.location.origin
        });
      } catch {
        // AbortError expected when user cancels the share sheet
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copiado al portapapeles');
    }
  };

  const isQuinielaValid = isQuiniela
    ? quinielaMatches.every(m => m.result !== null) && (
      mode !== 'reduced' || (
        quinielaMatches.filter(m => ['1X', '12', 'X2'].includes(m.result)).length === QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType].dobles &&
        quinielaMatches.filter(m => m.result === '1X2').length === QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType].triples
      )
    )
    : false;

  const hasValidStarSelection = range.stars
    ? selectedStars.length >= minStars && selectedStars.length <= maxStars
    : true;
  // Reduced mode logic
  const compatibleReducedSystems = useMemo(() => {
    if (mode !== 'reduced') return [];
    return getCompatibleReducedSystems({
      game,
      numbersCount: selectedNumbers.length
    });
  }, [game, mode, selectedNumbers.length]);

  const hasSufficientReducedForecast = compatibleReducedSystems.length > 0;

  const canPlay = !isMulticolumnMode && !isQuickPickMode && (isNationalLottery
    ? selectedNationalNumber !== null
    : isQuiniela
      ? isQuinielaValid
      : selectedNumbers.length >= minNums && selectedNumbers.length <= maxNums && hasValidStarSelection && isSupportedReducedSelection && betsCount > 0);

  const handlePlay = async () => {
    if (!canPlay)           { 
      if (isQuiniela && !isQuinielaValid && mode === 'reduced') {
        const config = QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType];
        toast.error(`Requisitos: ${config.dobles}D y ${config.triples}T`);
      } else if (mode === 'reduced' && !isSupportedReducedSelection) {
        toast.error('La selección actual no encaja en una fila válida de la tabla reducida');
      } else {
        toast.error('Completa tu apuesta'); 
      }
      return; 
    }

    const draftSelection = buildGameSelection({
      game,
      isNationalLottery,
      isQuiniela,
      mode,
      selectedNumbers,
      selectedStars,
      quinielaMatches,
      selectedReductionSystemId,
      selectedNationalNumber,
      selectedNationalDraw,
    });
    if (!draftSelection) {
      toast.error('No se ha podido construir la jugada.');
      return;
    }

    const drawDates = effectiveSelectedDrawDates.length > 0
      ? effectiveSelectedDrawDates 
      : [getBusinessDate(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw)];
    if (editingDraft && drawDates.length !== 1) {
      toast.error('La edición de una jugada existente solo admite un sorteo.');
      return;
    }

    const nextDrafts = buildPlayDrafts({
      game,
      selection: draftSelection,
      drawDates,
      totalPrice,
      unitPrice: isNationalLottery ? selectedNationalDraw.decimoPrice : drawPrice,
      quantity: isNationalLottery ? selectedNationalQuantity : 1,
      mode,
      betsCount,
      isSubscription,
      supportsTimeSelection,
      timeMode: drawDateResolution.scheduleMode,
      weeksCount: drawDateResolution.weeksCount,
      selectedNationalNumber,
      selectedNationalQuantity,
      selectedNationalDraw,
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
    }
    if (result.duplicateCount > 0) {
      toast.error(result.duplicateCount === 1 ? 'Ya tenías esa jugada en la sesión.' : `${result.duplicateCount} jugadas duplicadas no se añadieron.`);
    }
  };

  /**
   * Procesa la persistencia de un lote de columnas desde el modo multi-columna.
   * Transforma el intent en múltiples borradores individuales.
   */
  const handleMulticolumnPersist = (intent: MulticolumnDraftIntent) => {
    if (!game) return;

    try {
      const allDrafts: PlayDraft[] = [];

      intent.columns.forEach((col) => {
        // 1. Construir selección individual
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

        // 2. Calcular precio unitario (reutilizando resolvePlayPricing para consistencia)
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

        // 3. Generar borradores
        const drafts = buildPlayDrafts({
          game,
          selection,
          drawDates: intent.drawDates,
          totalPrice: pricing.totalPrice,
          unitPrice: pricing.drawPrice,
          quantity: 1,
          mode: colMode,
          betsCount: pricing.betsCount,
          isSubscription: isSubscription,
          supportsTimeSelection: supportsTimeSelection,
          timeMode: drawDateResolution.scheduleMode,
          weeksCount: drawDateResolution.weeksCount,
          selectedNationalNumber: null,
          selectedNationalQuantity: 0,
          selectedNationalDraw: { label: '' },
        });

        allDrafts.push(...drafts);
      });

      if (allDrafts.length === 0) {
        toast.error('No se han podido procesar las apuestas.');
        return;
      }

      // 4. Persistir
      const result = addDrafts(allDrafts);

      // 5. Feedback refinado
      if (result.addedCount > 0 && result.duplicateCount === 0) {
        toast.success(result.addedCount === 1 ? 'Jugada añadida.' : `${result.addedCount} jugadas añadidas.`);
      } else if (result.addedCount > 0 && result.duplicateCount > 0) {
        toast.success(`${result.addedCount} añadidas (${result.duplicateCount} duplicadas).`);
      } else if (result.addedCount === 0 && result.duplicateCount > 0) {
        toast.error(result.duplicateCount === 1 ? 'Esta jugada ya estaba añadida.' : 'Todas las jugadas ya estaban añadidas.');
      }
    } catch (error) {
      console.error('[handleMulticolumnPersist] Error:', error);
      toast.error('Ocurrió un error al procesar las apuestas.');
    }
  };


  const handleAddSelectedNationalToDemoCart = (deliveryMode: 'custody' | 'shipping' = 'custody') => {
    if (!selectedNationalNumber) {
      toast.error('Selecciona antes un décimo.');
      return;
    }

    addOrUpdateNationalCartLine({
      number: selectedNationalNumber,
      drawId: isExplicitNationalProduct ? selectedNationalDrawId : 'especial',
      drawLabel: selectedNationalDraw.label,
      drawDates: effectiveSelectedDrawDates,
      quantity: selectedNationalQuantity,
      unitPrice: selectedNationalDraw.decimoPrice,
      totalPrice: selectedNationalDraw.decimoPrice * selectedNationalQuantity * drawsCount,
      deliveryMode,
      maxQuantity: maxNationalQuantity,
    });

    toast.success('Añadido a la cesta demo nacional.');
  };
  
  const handlePersistNationalCart = () => {
    if (nationalCartLines.length === 0) return;

    // Nota técnica: Se utiliza buildNationalCartDraftIntent para normalizar la intención.
    // mapNationalCartIntentToPreview queda como referencia para auditoría visual/contratos, 
    // mientras que este handler usa buildPlayDrafts como fuente final de creación.
    const intent = buildNationalCartDraftIntent(game, nationalCartLines);
    const allDrafts: PlayDraft[] = [];
    let hasError = false;

    intent.lines.forEach((line) => {
      // Calculamos drawConfig una sola vez por línea y validamos su existencia
      const drawCfg = NATIONAL_DRAW_CONFIG.find(d => d.id === line.drawId);
      const unitPrice = drawCfg?.decimoPrice ?? line.unitPrice;
      
      if (!drawCfg && line.drawId !== 'especial') {
        toast.error(`Error de configuración: sorteo ${line.drawId} no encontrado.`);
        hasError = true;
        return;
      }

      const draftSelection = buildGameSelection({
        game,
        isNationalLottery: true,
        isQuiniela: false,
        mode: 'simple',
        selectedNumbers: [],
        selectedStars: [],
        quinielaMatches: [],
        selectedReductionSystemId: '',
        selectedNationalNumber: line.number,
        selectedNationalDraw: { label: line.drawLabel },
      });

      if (!draftSelection) return;

      const lineDrafts = buildPlayDrafts({
        game,
        selection: draftSelection,
        drawDates: line.drawDates,
        totalPrice: line.quantity * unitPrice * line.drawDates.length,
        unitPrice,
        quantity: line.quantity,
        mode: 'simple',
        betsCount: 1,
        isSubscription: false,
        supportsTimeSelection: true,
        timeMode: 'specific_days',
        weeksCount: 1,
        selectedNationalNumber: line.number,
        selectedNationalQuantity: line.quantity,
        selectedNationalDraw: { label: line.drawLabel },
      });

      allDrafts.push(...lineDrafts);
    });

    if (allDrafts.length === 0) {
      if (hasError) toast.error('No se han podido añadir borradores debido a errores técnicos.');
      return;
    }

    const result = addDrafts(allDrafts);
    
    if (result.addedCount > 0) {
      toast.success(result.addedCount === 1 ? 'Borrador añadido a tu sesión de prueba.' : `${result.addedCount} borradores añadidos a tu sesión de prueba.`);
    }
    
    if (result.duplicateCount > 0) {
      toast.error(result.duplicateCount === 1 ? '1 décimo ya estaba en tu sesión (omitido).' : `${result.duplicateCount} décimos ya estaban en tu sesión (omitidos).`);
    }
  };

  const ctaLabel = (() => {
    if (canPlay) {
      if (drawsCount > 1) return `Añadir ${drawsCount} jugadas`;
      if (isNationalLottery) return editingDraft ? 'Actualizar' : 'Añadir décimo';
      return editingDraft ? 'Actualizar' : 'Añadir jugada';
    }
    if (isMulticolumnMode) return 'Añadir boleto';
    if (isNationalLottery) return 'Elige un décimo';
    if (isQuiniela) return 'Completa el pronóstico';
    if (mode === 'reduced' && !isSupportedReducedSelection) return 'Completa la reducida';
    const numsLeft = minNums - selectedNumbers.length;
    const starsLeft = minStars - selectedStars.length;
    if (numsLeft > 0 && starsLeft > 0) return `Elige ${numsLeft} números y ${starsLeft} ${starsLeft === 1 ? 'estrella' : 'estrellas'}`;
    if (numsLeft > 0) return `Elige ${numsLeft} ${numsLeft === 1 ? 'número' : 'números'}`;
    if (starsLeft > 0) return `Elige ${starsLeft} ${starsLeft === 1 ? 'estrella' : 'estrellas'}`;
    return 'Completa la jugada';
  })();

  return (
    <div
      className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] pb-32"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <div
        className="fixed top-0 left-0 right-0 z-40 text-white pt-safe shadow-lg h-[calc(env(safe-area-inset-top,0px)+56px)] flex flex-col justify-end"
        style={{ background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})` }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="text-white/80 hover:text-white hover:bg-white/15 w-9 h-9 rounded-xl"
              onClick={() => navigate(-1)}
              aria-label="Volver"
            >
              <NavArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <GameBadge game={game} size="sm" className="w-8 h-8 rounded-lg shadow-none bg-white/10" />
              <div>
                <h1 className="font-bold text-base leading-tight">{game.name}</h1>
                <p className="text-[10px] text-white/60 font-medium">
                  {formatDrawTime(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PlaySessionIndicator variant="header" />
            <Button
              variant="ghost" size="icon"
              className="text-white/70 hover:text-white hover:bg-white/15 w-9 h-9 rounded-xl"
              onClick={() => setIsInfoOpen(true)}
              aria-label="Información del juego"
            >
              <InfoCircle className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>
      </div>

      <GameInfoSheet
        game={game}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        content={helpContent}
      />

      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-2.5 p-4 pt-2">
        {/* Config bar — estado colapsado (solo juegos no-nacionales) */}
        {!isNationalLottery && !isConfigPanelOpen && (
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
                    {configMainLine}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 truncate pl-3">
                  {drawTimeSummary}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-manises-blue/[0.06] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-manises-blue/60 group-hover:bg-manises-blue/10 group-hover:text-manises-blue transition-colors">
                Cambiar
              </span>
            </div>
          </button>
        )}

        {/* Config panel — estado expandido (solo juegos no-nacionales) */}
        {!isNationalLottery && isConfigPanelOpen && (
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
                  aria-label="Cerrar configuración"
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
                      const nextReductionSystems = getReductionSystemsForMode(game.id, m);
                      if (m === 'reduced' && nextReductionSystems.length > 0) {
                        setSelectedReductionSystemId(nextReductionSystems[0].id);
                      }
                      handleClear();
                      if (m !== 'simple') setIsMulticolumnMode(false);
                      setIsConfigPanelOpen(false);
                    }}
                  />
                </div>
              )}

              {!isQuiniela && mode === 'simple' && (
                <div>
                  <p className="mb-2 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Método</p>
                  <div className="flex p-1 bg-slate-100/70 rounded-xl border border-slate-200/50">
                    <button
                      onClick={() => { setIsQuickPickMode(false); setIsMulticolumnMode(false); }}
                      className={cn(
                        "flex-1 py-2.5 px-3 rounded-[0.55rem] text-[9px] font-black uppercase tracking-widest transition-all",
                        !isQuickPickMode && !isMulticolumnMode ? "bg-white text-manises-blue shadow-sm" : "text-slate-400"
                      )}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => { setIsQuickPickMode(true); setIsMulticolumnMode(false); setIsConfigPanelOpen(false); }}
                      className={cn(
                        "flex-1 py-2.5 px-3 rounded-[0.55rem] text-[9px] font-black uppercase tracking-widest transition-all",
                        isQuickPickMode ? "bg-white text-manises-blue shadow-sm" : "text-slate-400"
                      )}
                    >
                      Rápida
                    </button>
                    <button
                      onClick={() => { setIsQuickPickMode(false); setIsMulticolumnMode(true); setIsConfigPanelOpen(false); }}
                      className={cn(
                        "flex-1 py-2.5 px-3 rounded-[0.55rem] text-[9px] font-black uppercase tracking-widest transition-all",
                        isMulticolumnMode ? "bg-white text-manises-blue shadow-sm" : "text-slate-400"
                      )}
                    >
                      Varias apuestas
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
                              if (opt.id === 'next_week') {
                                setTimeMode('specific_days');
                                setSelectedDrawDates(nextWeekDates);
                              } else if (opt.id === 'two_weeks') {
                                setTimeMode('specific_days');
                                setSelectedDrawDates(twoWeeksDates);
                              } else {
                                setTimeMode(opt.id as ScheduleMode);
                                setSelectedDrawDates([]);
                              }
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                              isActive
                                ? "bg-manises-blue text-white border-manises-blue shadow-sm"
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
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
                                      setSelectedDrawDates(prev =>
                                        prev.includes(draw.drawDate)
                                          ? prev.filter(d => d !== draw.drawDate)
                                          : [...prev, draw.drawDate].sort()
                                      );
                                    }}
                                    className={cn(
                                      "relative flex min-w-[60px] flex-col items-center justify-center rounded-xl border px-2.5 py-2 transition-all",
                                      isSelected
                                        ? "bg-manises-blue/10 border-manises-blue shadow-[0_4px_12px_rgba(10,71,146,0.14)]"
                                        : "bg-white border-slate-100 hover:border-slate-200"
                                    )}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        layoutId="selected-draw-indicator"
                                        className="absolute inset-0 rounded-xl border-2 border-manises-blue z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                      />
                                    )}
                                    <span className={cn(
                                      "relative z-10 text-[9px] font-semibold leading-tight",
                                      isSelected ? "text-manises-blue/80" : "text-slate-400"
                                    )}>
                                      {formatChipContext(draw.drawDate)}
                                    </span>
                                    <span className={cn(
                                      "relative z-10 text-[12px] font-black leading-tight mt-0.5",
                                      isSelected ? "text-manises-blue" : "text-slate-700"
                                    )}>
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

        {/* Advertencia de Saldo Insuficiente */}
        {isOverBalance && (
          <motion.div
            variants={sectionFadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-[linear-gradient(180deg,#fff5f5_0%,#fff1f2_100%)] p-3.5 shadow-sm"
          >
            <WarningTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-normal">
              Saldo insuficiente ({formatCurrency(profile?.balance ?? 0)}). <br />
              Necesitas {formatCurrency(totalPrice)} para jugar esta variante.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${game.id}-${isQuiniela ? 'quiniela' : isNationalLottery ? 'nacional' : mode}`}
            variants={panelSwap}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {isQuiniela ? (
              <>
                <AnimatePresence mode="wait" initial={false}>
                  {mode === 'reduced' && (
                    <motion.div
                      key={`quiniela-reduced-${selectedReductionSystemId}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: MOTION_EASE_OUT } }}
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: MOTION_EASE_OUT } }}
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
                  reducedType={mode === 'reduced' ? selectedReductionSystemId as QuinielaReducedType : undefined}
                  onSelectionChange={(m) => setQuinielaMatches(m)}
                />
              </>
            ) : !isNationalLottery ? (
              <>
                    {isQuickPickMode ? (
                  <QuickPickPanel
                    count={quickPick.count}
                    setCount={quickPick.setCount}
                    combinations={quickPick.combinations}
                    isRegenerating={quickPick.isRegenerating}
                    regenerate={quickPick.regenerate}
                    totalPrice={quickPickTotalPrice}
                    availableBalance={profile?.balance ?? 0}
                    drawsCount={effectiveSelectedDrawDates.length || 1}
                    onAdd={handlePersistQuickPick}
                  />
                ) : isMulticolumnMode ? (
                  <MulticolumnTicketFlow 
                    game={game} 
                    drawDates={effectiveSelectedDrawDates}
                    onReviewColumns={handleMulticolumnPersist}
                  />
                ) : (
                  <>
                    {/* ---- Selección visual ---- */}
                    <div className="surface-neo-soft flex flex-col items-center gap-2 rounded-[1.2rem] border border-white/70 p-2 shadow-sm" style={theme.surface}>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(mode === 'reduced'
                          ? Array.from({ length: Math.max(minNums, selectedNumbers.length || minNums) })
                          : Array.from({ length: maxNums })
                        ).map((_, i) => (
                          <motion.div
                            key={`slot-${i}`}
                            animate={{ scale: selectedNumbers[i] ? 1 : 0.95 }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black transition-colors ${selectedNumbers[i]
                                ? 'shadow-sm'
                                : 'bg-white border-dashed border-gray-200 text-gray-200'
                              }`}
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
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black transition-colors ${selectedStars[i]
                                    ? 'bg-manises-gold border-manises-gold text-manises-blue shadow-gold'
                                    : 'bg-white border-dashed border-yellow-200 text-yellow-200'
                                  }`}
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

                    {/* ---- Grid de números ---- */}
                    <NumbersGrid
                      totalNums={totalNums}
                      selectedNumbers={selectedNumbers}
                      maxNumbersLimit={mode === 'reduced' && supportedReducedNumbers.length > 0 ? supportedReducedNumbers[supportedReducedNumbers.length - 1] : maxNums}
                      onToggle={toggleNumber}
                      theme={theme}
                    />

                    {/* ---- Grid de estrellas ---- */}
                    {maxStars > 0 && (
                      <StarsGrid
                        starValues={starValues}
                        selectedStars={selectedStars}
                        maxStarsLimit={maxStars}
                        onToggle={toggleStar}
                        theme={theme}
                        title={game.type === 'gordo' ? 'Clave' : 'Estrellas'}
                        labelPrefix={game.type === 'gordo' ? 'Clave' : 'Estrella'}
                      />
                    )}

                    {mode === 'reduced' && (
                      <motion.div variants={sectionFadeUp} initial="hidden" animate="visible" className="space-y-6">
                        <ReducedModeSummary 
                          hasSelection={selectedNumbers.length > 0}
                          minNumbers={minNums}
                          maxNumbers={maxNums}
                          currentNumbers={selectedNumbers.length}
                          supportedNumbers={supportedReducedNumbers}
                        />

                        <ReducedSystemPicker 
                          systems={compatibleReducedSystems}
                          selectedId={selectedReductionSystemId}
                          onSelect={(id) => setSelectedReductionSystemId(id)}
                        />

                        {selectedReductionSystemId && currentReductionSystem && (
                          <div className="rounded-2xl border border-manises-blue/10 bg-white px-4 py-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Selección actual</p>
                                <h3 className="mt-1 text-sm font-black text-manises-blue">{currentReductionSystem.label}</h3>
                                <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                                  {currentReductionSystem.guaranteeCondition}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Números</p>
                                <p className="mt-0.5 text-lg font-black text-manises-blue">{selectedNumbers.length}</p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full border border-manises-blue/10 bg-manises-blue/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-manises-blue/75">
                                Rango válido: {supportedReducedNumbers[0]}-{supportedReducedNumbers[supportedReducedNumbers.length - 1]}
                              </span>
                              {game.type === 'euromillones' && (
                                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-900">
                                  2 estrellas fijas
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {selectedNumbers.map((number) => (
                                <span
                                  key={number}
                                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-manises-blue/12 bg-manises-blue/[0.06] px-3 text-sm font-black text-manises-blue"
                                >
                                  {number}
                                </span>
                              ))}
                            </div>

                            <p className="mt-3 text-[11px] font-semibold text-slate-500">
                              Basado en tablas demo de Lotería Manises.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {mode === 'reduced' && selectedNumbers.length > 0 && isSupportedReducedSelection && betsCount > 0 && (
                      <motion.div
                        variants={sectionFadeUp}
                        initial="hidden"
                        animate="visible"
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-900">
                          Selección lista para cotizar
                        </p>
                        <p className="mt-1 text-[12px] font-medium leading-relaxed text-emerald-800">
                          Tu selección encaja en la tabla de {currentReductionSystem?.label?.toLowerCase() ?? 'reducida'} y genera {betsCount} columnas para esta variante.
                        </p>
                      </motion.div>
                    )}
                  </>
                )}
              </>
            ) : (
              <NationalAdvancedFlow
                game={game}
                selectedNationalDraw={selectedNationalDraw}
                selectedNationalNumber={selectedNationalNumber}
                selectedNationalQuantity={selectedNationalQuantity}
                maxNationalQuantity={maxNationalQuantity}
                drawsCount={drawsCount}
                drawStatus={drawStatus}
                supportsTimeSelection={supportsTimeSelection}
                availableNationalDates={availableNationalDates}
                effectiveSelectedDrawDates={effectiveSelectedDrawDates}
                onSelectDate={(dateIso) => setSelectedDrawDates([dateIso])}
                nationalShowcase={{
                  items: nationalShowcase,
                  count: nationalShowcaseCount,
                  searchState: nationalSearchState,
                  setSearchState: setNationalSearchState,
                }}
                nationalCart={{
                  lines: nationalCartLines,
                  breakdown: nationalCartBreakdown,
                  removeLine: removeNationalCartLine,
                  updateQuantity: updateNationalCartQuantity,
                  clearCart: clearNationalCart,
                  addSelectedToCart: handleAddSelectedNationalToDemoCart,
                  onPersistToSession: handlePersistNationalCart,
                }}
                onSelectNationalNumber={(ticket) => {
                  setSelectedNationalNumber(ticket.number);
                  setSelectedNationalQuantity((qty) => Math.min(qty, ticket.available));
                }}
                onChangeNationalQuantity={setSelectedNationalQuantity}
                onRandomNationalNumber={handleRandom}
                onClear={handleClear}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ---- SECCIÓN LAGUINDA: Abono ---- */}
        <div className="mt-2 space-y-3">

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
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
                  <RefreshCircle className={cn('w-6 h-6', isSubscription && 'animate-spin-slow')} />
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
                    Puedes pausar o dar de baja tu abono desde <span className="font-black">Mi cuenta &gt; Mis abonos</span>.
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

      {/* ---- Barra de confirmación ---- */}
      {!isQuickPickMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
          <div className={cn(
            "mx-auto flex max-w-screen-sm flex-col gap-2 rounded-[1.5rem] border p-2.5 shadow-[0_-10px_30px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all",
            isOverBalance ? "bg-red-50/95 border-red-200" : "bg-white/95 border-white/80"
          )}>
            {/* Fila Operativa Compacta */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-manises-blue/40 uppercase tracking-wider">Saldo:</span>
                  <span className="text-[11px] font-black text-manises-blue">{formatCurrency(availableBalance)}</span>
                  <span className="text-slate-300 mx-0.5">·</span>
                  <span className="text-[10px] font-black text-manises-blue/40 uppercase tracking-wider">Total:</span>
                  <span className="text-[13px] font-black text-manises-blue" style={theme.title}>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className={cn(
                    "text-[9px] font-bold uppercase tracking-tight",
                    isOverBalance ? "text-red-600" : "text-emerald-600"
                  )}>
                    {isOverBalance 
                      ? `Faltan ${formatCurrency(totalPrice - availableBalance)}` 
                      : `Quedarán ${formatCurrency(remainingBalance)}`
                    }
                  </p>
                  {!isNationalLottery && drawsCount > 1 && (
                    <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">
                      {drawsCount} sorteos
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <Button
                  className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.14em] shadow-sm transition-all active:scale-[0.98] ${canPlay
                      ? 'text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent shadow-none'
                    }`}
                  style={canPlay ? theme.cta : undefined}
                  onClick={handlePlay}
                  disabled={!canPlay}
                >
                  {ctaLabel}
                </Button>
              </AnimatePresence>
            </div>

            {/* Estado de validación detallado solo si no se puede jugar y no estamos en modo rápido */}
            {!canPlay && (
              <div className="border-t border-slate-100/50 px-1 pt-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase text-center leading-tight">
                  {isMulticolumnMode
                    ? 'Completa al menos una apuesta'
                    : isNationalLottery
                      ? 'Elige un décimo del escaparate'
                      : isQuiniela
                        ? 'Completa el pronóstico de los 15 partidos'
                        : `Elige ${maxNums - selectedNumbers.length > 0 ? maxNums - selectedNumbers.length + ' números' : ''} ${maxStars - selectedStars.length > 0 ? '+ ' + (maxStars - selectedStars.length) + ' estrellas' : ''}`.trim()
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
