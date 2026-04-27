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
  CheckCircle,
  InfoCircle,
  WarningTriangle,
  Calendar,
} from 'iconoir-react/regular';
import { toast } from 'sonner';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { usePlay } from '../hooks/usePlay';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn, formatCurrency, formatDate, formatDrawTime } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { MOTION_EASE_OUT, panelSwap, sectionFadeUp } from '@/shared/lib/motion';
import { QUINIELA_REDUCED_TABLES, QuinielaReducedType } from '../lib/bet-calculator';
import { getGameHelpContent } from '../lib/game-help';
import { getAvailableModesForGame, getModeDefinition, getReductionSystem, getReductionSystemsForMode, type PlayMode } from '../lib/play-matrix';
import { GameModeSelector } from '../components/GameModeSelector';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { QuinielaProfessionalSelector } from '../components/QuinielaProfessionalSelector';
import { ReductionSystemSelector } from '../components/ReductionSystemSelector';
import { NumbersGrid } from '../components/NumbersGrid';
import { StarsGrid } from '../components/StarsGrid';
import { NationalAdvancedFlow } from '../national/components/NationalAdvancedFlow';
import { NationalDrawSelector } from '../national/components/NationalDrawSelector';
import { MulticolumnTicketFlow } from '../multicolumn/components/MulticolumnTicketFlow';
import { getDrawScheduleConfig, type ScheduleMode } from '@/features/play/config/draw-schedule.config';
import { getDrawsForCurrentWeek, groupDrawsByWeek } from '../lib/draw-schedule';
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
} from '@/features/play/national/mocks/national-showcase.mock';
import type { NationalDrawId } from '@/features/play/national/contracts/national-play.contract';
import { useNationalShowcase } from '@/features/play/national/hooks/useNationalShowcase';
import { useNationalCart } from '@/features/play/national/hooks/useNationalCart';
import { buildNationalCartDraftIntent } from '@/features/play/national/application/build-national-cart-intent';
import type { PlayDraft } from '@/features/session/types/session.types';


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
  const [isTimeSelectorExpanded, setIsTimeSelectorExpanded] = useState(true);

  // Features Laguinda Style
  const [isSubscription, setIsSubscription] = useState(false);
  const [isMulticolumnMode, setIsMulticolumnMode] = useState(false);
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
    clearCart: clearNationalCart,
    breakdown: nationalCartBreakdown,
  } = useNationalCart();

  // Resetear estados cuando cambia el juego para evitar arrastrar selecciones o precios incorrectos
  useEffect(() => {
    setSelectedNumbers([]);
    setSelectedStars([]);
    setSelectedNationalNumber(null);
    setSelectedNationalQuantity(1);

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
  const groupedSelectedDraws = groupDrawsByWeek(
    effectiveSelectedDrawDates.map((drawDate) => ({
      gameId: game.type,
      drawDate,
      label: new Date(drawDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }),
      weekLabel: new Date(drawDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      isClosed: false,
    }))
  );

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
    setIsTimeSelectorExpanded(true);
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
  const hasSufficientReducedForecast = selectedNumbers.length >= minNums && (minStars === 0 || selectedStars.length >= minStars);

  const canPlay = !isMulticolumnMode && (isNationalLottery
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

  // Lógica computada para el selector temporal simplificado
  const currentWeekDraws = useMemo(() => getDrawsForCurrentWeek(game.type, new Date()), [game.type]);
  const currentWeekDates = useMemo(() => currentWeekDraws.map(d => d.drawDate), [currentWeekDraws]);
  const isFullWeekSelected = useMemo(() => 
    effectiveSelectedDrawDates.length === currentWeekDates.length && 
    effectiveSelectedDrawDates.every(d => currentWeekDates.includes(d)),
    [effectiveSelectedDrawDates, currentWeekDates]
  );
  
  const showSmartBanner = timeMode === 'specific_days' && 
                          !isFullWeekSelected && 
                          effectiveSelectedDrawDates.length >= 2 &&
                          effectiveSelectedDrawDates.length < currentWeekDates.length;

  const timeSelectionSummary = useMemo(() => {
    if (isNationalLottery) {
      return `${drawsCount} ${drawsCount === 1 ? 'sorteo' : 'sorteos'}`;
    }

    if (timeMode === 'next_draw') {
      return 'Próximo sorteo';
    }

    if (timeMode === 'full_week') {
      return `Toda la semana · ${drawsCount} ${drawsCount === 1 ? 'sorteo' : 'sorteos'}`;
    }

    const selectedDays = effectiveSelectedDrawDates
      .slice(0, 3)
      .map((drawDate) => new Date(drawDate).toLocaleDateString('es-ES', { weekday: 'short' }))
      .map((label) => label.replace('.', ''));

    if (effectiveSelectedDrawDates.length > 3) {
      return `Días concretos · ${selectedDays.join(', ')} +${effectiveSelectedDrawDates.length - 3}`;
    }

    return `Días concretos · ${selectedDays.join(', ')}`;
  }, [drawsCount, effectiveSelectedDrawDates, isNationalLottery, timeMode]);

  const handleAddSelectedNationalToDemoCart = () => {
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
      
      if (!drawCfg) {
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
        totalPrice: line.quantity * drawCfg.decimoPrice * line.drawDates.length,
        unitPrice: drawCfg.decimoPrice,
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

  return (
    <div
      className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] pb-36"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}
    >
      <div
        className="fixed top-0 left-0 right-0 z-40 text-white pt-safe shadow-lg h-[calc(env(safe-area-inset-top,0px)+64px)] flex flex-col justify-end"
        style={{ background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})` }}
      >
        <div className="flex items-center justify-between px-3 py-3">
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

      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-5 p-4 pt-3">
        {/* Draw time strip — hora del sorteo visible en el cuerpo de la página */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-2.5 shadow-sm backdrop-blur-sm">
          <Calendar className="w-4 h-4 text-manises-blue/50 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Próximo sorteo</p>
            <p className="text-[12px] font-bold text-manises-blue">
              {formatDrawTime(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw)}
            </p>
          </div>
          {/* salesCloseAt: pendiente de BE — mostrar hora límite de compra cuando el campo esté disponible */}
        </div>

        {supportsTimeSelection && (
          <motion.div variants={sectionFadeUp} initial="hidden" animate="visible">
            <div className="rounded-[1.4rem] border border-slate-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3.5 px-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Planificación</span>
                <span className="text-[9px] font-bold text-manises-blue/60 uppercase">{drawsCount} {drawsCount === 1 ? 'sorteo' : 'sorteos'}</span>
              </div>

              {isNationalLottery ? (
                <NationalDrawSelector
                  availableNationalDates={availableNationalDates}
                  effectiveSelectedDrawDates={effectiveSelectedDrawDates}
                  onSelectDate={(dateIso) => setSelectedDrawDates([dateIso])}
                />
              ) : !isTimeSelectorExpanded ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Selección activa</p>
                    <p className="mt-1 truncate text-[12px] font-black text-manises-blue">
                      {timeSelectionSummary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTimeSelectorExpanded(true)}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  {/* SELECTOR BINARIO PRINCIPAL */}
                  <div className="relative flex rounded-xl border border-slate-200/60 bg-slate-100/40 p-1">
                    {SCHEDULE_OPTIONS.filter((option) => option.id !== 'specific_days').map((option) => {
                      const active = timeMode === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setTimeMode(option.id);
                            setIsTimeSelectorExpanded(false);
                          }}
                          className={cn(
                            'relative flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all z-10',
                            active ? 'text-manises-blue' : 'text-slate-500'
                          )}
                        >
                          {active && (
                            <motion.div
                              layoutId="activeTimeMode"
                              className="absolute inset-0 rounded-lg bg-white shadow-sm border border-slate-200/50"
                              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                            />
                          )}
                          <span className="relative z-20">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ACCIÓN SECUNDARIA: PERSONALIZAR */}
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => {
                        if (timeMode === 'specific_days') {
                          setTimeMode('next_draw');
                          setIsTimeSelectorExpanded(false);
                          return;
                        }

                        setTimeMode('specific_days');
                        setIsTimeSelectorExpanded(true);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition-all px-3.5 py-1.5 rounded-full border",
                        timeMode === 'specific_days'
                          ? "text-manises-blue border-manises-blue/25 bg-manises-blue/5"
                          : "text-slate-500 border-slate-200 bg-slate-50/80 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {timeMode !== 'specific_days' && <Calendar className="w-3 h-3" />}
                      {timeMode === 'specific_days' ? '← Volver a selección rápida' : 'Elegir días concretos'}
                    </button>
                  </div>

                  {/* GRID DE DÍAS REFINADO (TÁCTIL Y CLARO) */}
                  <AnimatePresence>
                    {timeMode === 'specific_days' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 grid grid-cols-7 gap-1.5 px-1 pt-1 pb-2">
                          {currentWeekDraws.map((draw) => {
                            const isSelected = selectedDrawDates.includes(draw.drawDate);
                            const dayNumber = new Date(draw.drawDate).getDate();
                            return (
                              <button
                                key={draw.drawDate}
                                onClick={() => {
                                  setSelectedDrawDates(prev => {
                                    if (prev.includes(draw.drawDate)) {
                                      if (prev.length === 1) return prev;
                                      return prev.filter(d => d !== draw.drawDate);
                                    }
                                    return [...prev, draw.drawDate].sort();
                                  });
                                }}
                                className="flex flex-col items-center gap-2"
                              >
                                <div
                                  className={cn(
                                    "relative w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all border",
                                    isSelected
                                      ? "text-white scale-105"
                                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                  )}
                                  style={isSelected ? {
                                    background: `linear-gradient(145deg, ${game.color}dd 0%, ${game.color} 100%)`,
                                    borderColor: game.color,
                                    boxShadow: `0 3px 10px -1px ${game.color}44`,
                                  } : undefined}
                                >
                                  <span className={cn("text-[9px] font-black uppercase leading-none mb-0.5", isSelected ? "text-white/70" : "text-slate-300")}>
                                    {draw.label.substring(0, 1)}
                                  </span>
                                  <span className="text-[13px] font-black leading-none">
                                    {dayNumber}
                                  </span>
                                </div>
                                <span
                                  className={cn("text-[8px] font-bold uppercase tracking-tighter", isSelected ? "" : "text-slate-400")}
                                  style={isSelected ? { color: game.color } : undefined}
                                >
                                  {draw.label.substring(0, 3)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-end px-1 pb-1">
                          <button
                            type="button"
                            onClick={() => setIsTimeSelectorExpanded(false)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
                          >
                            Listo
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* RESUMEN ULTRA-LIGERO */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  Jugando: <span className="text-manises-blue">{drawsCount} sorteos</span>
                </p>
                <div className="flex gap-1">
                  {effectiveSelectedDrawDates.slice(0, 3).map(date => (
                    <span key={date} className="w-1.5 h-1.5 rounded-full bg-manises-blue/20" />
                  ))}
                  {effectiveSelectedDrawDates.length > 3 && <span className="text-[8px] font-black text-manises-blue/40">+</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Selector de Modo (Solo si hay varios disponibles) */}
        {!isNationalLottery && (
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
              handleClear(); // Limpiar al cambiar de modo para evitar estados inconsistentes
              if (m !== 'simple') setIsMulticolumnMode(false);
            }}
          />
        )}

        {/* Toggle Multi-columna (Opcional para juegos de bolas en modo simple) */}
        {!isNationalLottery && !isQuiniela && mode === 'simple' && (
          <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setIsMulticolumnMode(false)}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                !isMulticolumnMode ? "bg-white text-manises-blue shadow-sm" : "text-slate-400"
              )}
            >
              Selección clásica
            </button>
            <button
              onClick={() => setIsMulticolumnMode(true)}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isMulticolumnMode ? "bg-white text-manises-blue shadow-sm" : "text-slate-400"
              )}
            >
              Multi-columna
            </button>
          </div>
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
                {isMulticolumnMode ? (
                  <MulticolumnTicketFlow 
                    game={game} 
                    drawsCount={effectiveSelectedDrawDates.length} 
                  />
                ) : (
                  <>
                    {/* ---- Selección visual ---- */}
                    <div className="flex flex-col items-center gap-4 rounded-[1.6rem] border border-white/70 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] surface-neo-soft" style={theme.surface}>
                  {/* Números seleccionados */}
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {(mode === 'reduced'
                      ? Array.from({ length: Math.max(minNums, selectedNumbers.length || minNums) })
                      : Array.from({ length: maxNums })
                    ).map((_, i) => (
                      <motion.div
                        key={`slot-${i}`}
                        animate={{ scale: selectedNumbers[i] ? 1 : 0.95 }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base border-2 transition-colors ${selectedNumbers[i]
                            ? 'shadow-sm'
                            : 'bg-white border-dashed border-gray-200 text-gray-200'
                          }`}
                        style={selectedNumbers[i] ? theme.selectedNumber : undefined}
                      >
                        {selectedNumbers[i] ?? ''}
                      </motion.div>
                    ))}

                    {maxStars > 0 && (
                      <div className="flex gap-2.5 border-l-2 border-gray-200 pl-3 ml-1">
                        {Array.from({ length: mode === 'reduced' ? minStars : maxStars }).map((_, i) => (
                          <motion.div
                            key={`star-slot-${i}`}
                            animate={{ scale: selectedStars[i] ? 1 : 0.95 }}
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base border-2 transition-colors ${selectedStars[i]
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

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm"
                      className="rounded-lg font-semibold text-xs px-4 border-gray-200 text-gray-500 hover:bg-gray-50"
                      onClick={handleClear}
                    >
                      <RefreshCircle className="w-3.5 h-3.5 mr-1.5" /> Limpiar
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className="rounded-lg font-semibold text-xs px-4 border-manises-gold/50 text-manises-gold hover:bg-manises-gold/5"
                      onClick={handleRandom}
                    >
                      <Spark className="w-3.5 h-3.5 mr-1.5" /> Aleatorio
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

                {mode === 'reduced' && reductionSystems.length > 0 && (
                  <motion.div variants={sectionFadeUp} initial="hidden" animate="visible" className="space-y-3">
                    {!hasSufficientReducedForecast ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3.5">
                        <InfoCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="text-[12px] font-medium text-slate-500 leading-snug">
                          Selecciona primero tu pronóstico para ver las opciones de reducida disponibles.
                        </p>
                      </div>
                    ) : (
                      <>
                        <ReductionSystemSelector
                          systems={reductionSystems}
                          currentSystemId={selectedReductionSystemId}
                          onChange={(systemId) => setSelectedReductionSystemId(systemId)}
                        />

                        <div className="rounded-2xl border border-manises-blue/10 bg-white px-4 py-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Selección actual</p>
                              <h3 className="mt-1 text-sm font-black text-manises-blue">{currentReductionSystem?.label ?? 'Reducida'}</h3>
                              <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                                {currentReductionSystem?.guaranteeCondition}
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
                            {selectedNumbers.length > 0 && (
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${isSupportedReducedSelection
                                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                                    : 'border border-amber-200 bg-amber-50 text-amber-900'
                                  }`}
                              >
                                {isSupportedReducedSelection ? 'Fila válida' : 'Ajusta la fila'}
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
                            Soporta {supportedReducedNumbers[0]} a {supportedReducedNumbers[supportedReducedNumbers.length - 1]} números, según la tabla oficial disponible.
                          </p>
                        </div>
                      </>
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

                {mode === 'reduced' && selectedNumbers.length > 0 && !isSupportedReducedSelection && (
                  <motion.div
                    variants={sectionFadeUp}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-900">
                      Selección no compatible con esta reducida
                    </p>
                    <p className="mt-1 text-[12px] font-medium leading-relaxed text-amber-800">
                      Ajusta el total de números para que coincida con una fila soportada por la tabla del sistema.
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
                {isSubscription ? 'Abono activado en esta compra' : 'Actívalo con un toque'}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                Sin permanencia
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ---- Barra de confirmación ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
        <div className="mx-auto flex max-w-screen-sm flex-col gap-3 rounded-[2.2rem] border border-white/80 bg-white/95 p-4 shadow-[0_-12px_40px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
          {/* Resumen de saldo */}
          <div className="flex items-center justify-between gap-4 px-1">
            <div className="flex flex-col">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Tu saldo actual</p>
              <p className="mt-1 text-base font-black text-manises-blue">{formatCurrency(availableBalance)}</p>
            </div>
            <div className={cn(
              'flex flex-col items-end rounded-2xl border px-3 py-1.5',
              isOverBalance
                ? 'border-red-200 bg-red-50'
                : 'border-emerald-200 bg-emerald-50'
            )}>
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                {isOverBalance ? 'Te falta saldo' : 'Te quedará saldo'}
              </p>
              <p className={cn(
                'mt-1 text-base font-black',
                isOverBalance ? 'text-red-700' : 'text-emerald-700'
              )}>
                {isOverBalance ? formatCurrency(totalPrice - availableBalance) : formatCurrency(remainingBalance)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Importe Total
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground leading-tight">
                {isNationalLottery
                  ? `${selectedNationalQuantity} ${selectedNationalQuantity === 1 ? 'décimo' : 'décimos'} x ${drawsCount} ${drawsCount === 1 ? 'sorteo' : 'sorteos'}`
                  : `${formatCurrency(drawPrice)} x ${drawsCount} ${drawsCount === 1 ? 'sorteo' : 'sorteos'}`
                }
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <p className="text-[1.35rem] font-black tabular-nums leading-none" style={theme.title}>
                  {formatCurrency(totalPrice)}
                </p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <Button
                className={`h-12 flex-1 rounded-2xl font-bold text-sm shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition-all active:scale-[0.98] ${canPlay
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                style={canPlay ? theme.cta : undefined}
                onClick={handlePlay}
                disabled={!canPlay}
              >
                {canPlay
                  ? drawsCount > 1
                    ? `Añadir ${drawsCount} jugadas`
                    : isNationalLottery
                      ? editingDraft
                        ? `Actualizar ${selectedNationalQuantity} décimo${selectedNationalQuantity === 1 ? '' : 's'}`
                        : `Añadir ${selectedNationalQuantity} décimo${selectedNationalQuantity === 1 ? '' : 's'}`
                      : editingDraft
                        ? 'Actualizar jugada'
                        : `Añadir ${betsCount} ${betsCount === 1 ? 'jugada' : 'jugadas'}`
                  : isMulticolumnMode
                    ? 'Revisa las columnas para añadir'
                    : isNationalLottery
                      ? 'Elige un décimo'
                      : isQuiniela
                        ? 'Completa los 15 partidos'
                        : `Elige ${maxNums - selectedNumbers.length > 0 ? maxNums - selectedNumbers.length + ' nums' : ''} ${maxStars - selectedStars.length > 0 ? '+ ' + (maxStars - selectedStars.length) + ' estrellas' : ''}`.trim()
                }
              </Button>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
