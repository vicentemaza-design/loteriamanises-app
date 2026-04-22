import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ShareAndroid,
  ArrowRight,
  JournalPage,
  ShieldCheck,
  BrightStar,
  InfoCircle,
  WarningTriangle
} from 'iconoir-react/regular';
import { toast } from 'sonner';
import { generateRandomPlay } from '@/features/play/services/play.service';
import { usePlay } from '../hooks/usePlay';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn, formatCurrency, formatDate, formatDrawTime } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { MOTION_EASE_OUT, panelSwap, sectionFadeUp } from '@/shared/lib/motion';
import { calculateMultipleBets, calculateTotalPrice, QUINIELA_REDUCED_TABLES, QuinielaReducedType } from '../lib/bet-calculator';
import { getGameHelpContent } from '../lib/game-help';
import { getAvailableModesForGame, getModeDefinition, getReductionSystem, getReductionSystemsForMode, quotePlay, type PlayMode } from '../lib/play-matrix';
import { GameModeSelector } from '../components/GameModeSelector';
import { GameInfoSheet } from '../components/GameInfoSheet';
import { QuinielaProfessionalSelector } from '../components/QuinielaProfessionalSelector';
import { ReductionSystemSelector } from '../components/ReductionSystemSelector';
import loteriaTicketVisual from '@/assets/images/loteria_sorteos_2016554_dec_1_21.jpg';
import { NationalTicketVisual, type NationalDrawType } from '../components/NationalTicketVisual';
import { Trophy as TrophyIcon } from 'lucide-react';
import { getDrawScheduleConfig, type ScheduleMode } from '@/features/play/config/draw-schedule.config';
import { getDrawsForCurrentWeek, getUpcomingDraws, groupDrawsByWeek } from '../lib/draw-schedule';

const INSURANCE_PRICE = 0.50;
const DEFAULT_CUSTOM_WEEKS = 2;

const SCHEDULE_OPTIONS: Array<{ id: ScheduleMode; label: string }> = [
  { id: 'next_draw', label: 'Próximo sorteo' },
  { id: 'current_week', label: 'Semana en curso' },
  { id: 'two_weeks', label: 'Dos semanas' },
  { id: 'custom_weeks', label: 'Varias semanas' },
];

type NationalDrawId = 'jueves' | 'sabado';

const NATIONAL_DRAW_CONFIG: Array<{
  id: NationalDrawId;
  label: string;
  weekday: number;
  hour: number;
  decimoPrice: number;
  firstPrize: number;
  secondPrize: number;
}> = [
  { id: 'jueves', label: 'Jueves', weekday: 4, hour: 21, decimoPrice: 3, firstPrize: 30_000, secondPrize: 6_000 },
  { id: 'sabado', label: 'Sábado', weekday: 6, hour: 13, decimoPrice: 6, firstPrize: 60_000, secondPrize: 12_000 },
];

const NATIONAL_NUMBER_POOL = [
  { number: '69844', available: 8 },
  { number: '15432', available: 12 },
  { number: '90877', available: 5 },
  { number: '44501', available: 10 },
  { number: '77123', available: 3 },
  { number: '23019', available: 7 },
  { number: '58264', available: 9 },
  { number: '11038', available: 6 },
];

function nextWeekdayIso(targetWeekday: number, hour: number): string {
  const now = new Date();
  const currentWeekday = now.getDay();
  const delta = (targetWeekday - currentWeekday + 7) % 7;
  const date = new Date(now);
  date.setDate(now.getDate() + delta);
  date.setHours(hour, 0, 0, 0);

  if (date <= now) {
    date.setDate(date.getDate() + 7);
  }

  return date.toISOString();
}

interface QuinielaMatch {
  id: number;
  home: string;
  away: string;
  result: string | null;
}

export function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, profile, isDemo } = useAuth();
  const { placeBet, isSubmitting, showSuccess, error, reset } = usePlay();
  const game = LOTTERY_GAMES.find(g => g.id === gameId);

  const availableModes: PlayMode[] = game ? getAvailableModesForGame(game.id) : ['simple'];

  const [mode, setMode] = useState<PlayMode>(availableModes[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedStars, setSelectedStars]     = useState<number[]>([]);
  
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

  // Features Laguinda Style
  const [hasInsurance, setHasInsurance] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
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

  // Próximas 5 fechas para lotería nacional
  const availableNationalDates = useMemo(() => {
    if (!isNationalLottery || !isExplicitNationalProduct) return [];
    
    // Usamos el primer sorteo disponible como base
    const baseDraw = (gameId === 'loteria-nacional-jueves') 
      ? nextWeekdayIso(4, 21) // Jueves 21:00
      : nextWeekdayIso(6, 13); // Sábado 13:00
      
    const dates = [baseDraw];
    for (let i = 1; i < 5; i++) {
      const d = new Date(baseDraw);
      d.setDate(d.getDate() + (i * 7));
      dates.push(d.toISOString());
    }
    return dates;
  }, [isExplicitNationalProduct, isNationalLottery, gameId]);

  const effectiveSelectedDrawDates = useMemo(() => {
    if (!isExplicitNationalProduct) return selectedDrawDates;

    const validDates = selectedDrawDates.filter((drawDate) => availableNationalDates.includes(drawDate));
    if (validDates.length > 0) return validDates;

    return availableNationalDates.length > 0 ? [availableNationalDates[0]] : [];
  }, [availableNationalDates, isExplicitNationalProduct, selectedDrawDates]);

  // Resetear estados cuando cambia el juego para evitar arrastrar selecciones o precios incorrectos
  useEffect(() => {
    setSelectedNumbers([]);
    setSelectedStars([]);
    setSelectedNationalNumber(null);
    setSelectedNationalQuantity(1);
    setHasInsurance(false);
    
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
    if (!isExplicitNationalProduct) return;

    setSelectedDrawDates((current) => {
      const validDates = current.filter((drawDate) => availableNationalDates.includes(drawDate));
      const nextDates = validDates.length > 0
        ? validDates
        : availableNationalDates.length > 0
          ? [availableNationalDates[0]]
          : [];

      return current.length === nextDates.length && current.every((drawDate, index) => drawDate === nextDates[index])
        ? current
        : nextDates;
    });
  }, [availableNationalDates, isExplicitNationalProduct]);

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

  // --- CÁLCULO DE APUESTAS (NÚCLEO MATEMÁTICO) ---
  let betsCount = 1;
  if (isQuiniela && mode === 'reduced') {
    betsCount = QUINIELA_REDUCED_TABLES[selectedReductionSystemId as QuinielaReducedType].bets;
  } else if (!isNationalLottery && !isQuiniela) {
    betsCount = quotePlay({
      game,
      mode,
      numbersCount: selectedNumbers.length,
      starsCount: selectedStars.length,
      reducedSystemId: mode === 'reduced' ? selectedReductionSystemId : undefined,
    }).betsCount;

    if (mode === 'multiple' && betsCount === 0) {
      betsCount = calculateMultipleBets(selectedNumbers.length, selectedStars.length, game.type);
    }
  }




  const nationalDraws = (game.id === 'loteria-nacional-jueves' || game.id === 'loteria-nacional-sabado')
    ? NATIONAL_DRAW_CONFIG.filter(d => {
        if (game.id === 'loteria-nacional-jueves') return d.id === 'jueves';
        if (game.id === 'loteria-nacional-sabado') return d.id === 'sabado';
        return true;
      }).map((draw) => ({
        ...draw,
        nextDraw: nextWeekdayIso(draw.weekday, draw.hour),
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
  
  const drawPrice = isNationalLottery
    ? (selectedNationalDraw?.decimoPrice ?? game.price ?? 3) * selectedNationalQuantity
    : calculateTotalPrice(game.price, betsCount, false);
  
  const drawsCount = Math.max(effectiveSelectedDrawDates.length, 1);
  const basePrice = drawPrice * drawsCount;
  const totalPrice = basePrice + (hasInsurance ? INSURANCE_PRICE : 0);
  const isOverBalance = profile ? profile.balance < totalPrice : false;
  const availableBalance = profile?.balance ?? 0;
  const remainingBalance = Math.max(availableBalance - totalPrice, 0);
  
  const selectedNationalTicket = NATIONAL_NUMBER_POOL.find((ticket) => ticket.number === selectedNationalNumber);
  const maxNationalQuantity = selectedNationalTicket?.available ?? 1;
  const nationalPotentialFirstPrize = selectedNationalDraw.firstPrize * selectedNationalQuantity;
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
    const fallbackDrawDate = getBusinessDate(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw);

    if (!supportsTimeSelection) {
      setSelectedDrawDates([fallbackDrawDate]);
      return;
    }

    if (isExplicitNationalProduct) {
      setSelectedDrawDates((current) => {
        const validDates = current.filter((drawDate) => availableNationalDates.includes(drawDate));
        return validDates.length > 0
          ? validDates
          : availableNationalDates.length > 0
            ? [availableNationalDates[0]]
            : [fallbackDrawDate];
      });
      return;
    }

    let resolvedDraws = getUpcomingDraws(game.type, new Date(), 1);

    if (timeMode === 'current_week') {
      resolvedDraws = getDrawsForCurrentWeek(game.type, new Date());
    }

    if (timeMode === 'two_weeks') {
      resolvedDraws = getUpcomingDraws(game.type, new Date(), 2);
    }

    if (timeMode === 'custom_weeks') {
      resolvedDraws = getUpcomingDraws(game.type, new Date(), selectedWeeksCount);
    }

    const nextDrawDates = resolvedDraws.map((draw) => draw.drawDate);
    setSelectedDrawDates(nextDrawDates.length > 0 ? nextDrawDates : [fallbackDrawDate]);
  }, [
    game.nextDraw,
    game.type,
    availableNationalDates,
    isExplicitNationalProduct,
    isNationalLottery,
    selectedNationalDraw.nextDraw,
    selectedWeeksCount,
    supportsTimeSelection,
    timeMode,
  ]);

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
      const randomTicket = NATIONAL_NUMBER_POOL[Math.floor(Math.random() * NATIONAL_NUMBER_POOL.length)];
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
      } catch (err) {
        console.log('Error al compartir:', err);
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

  const canPlay = isNationalLottery
    ? selectedNationalNumber !== null
    : isQuiniela
      ? isQuinielaValid
      : selectedNumbers.length >= minNums && selectedNumbers.length <= maxNums && hasValidStarSelection && isSupportedReducedSelection && betsCount > 0;

  // Manejo de errores del hook
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handlePlay = async () => {
    if (!user && !isDemo) { 
      toast.error('Sesión requerida'); 
      return; 
    }
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
    if (isOverBalance) { toast.error('Saldo insuficiente'); return; }

    const drawDates = effectiveSelectedDrawDates.length > 0 
      ? effectiveSelectedDrawDates 
      : [getBusinessDate(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw)];
    const drawDate = drawDates[0];
    
    // 321: Preparamos la selección para el hook
    const selection = {
      gameId: game.id,
      gameType: game.type,
      mode,
      drawDate,
      drawDates,
      scheduleMode: supportsTimeSelection ? timeMode : 'next_draw',
      weeksCount: supportsTimeSelection ? (timeMode === 'custom_weeks' ? selectedWeeksCount : timeMode === 'two_weeks' ? 2 : 1) : 1,
      price: totalPrice,
      betsCount,
      hasInsurance,
      isSubscription,
      metadata: {
        technicalMode: game.technicalMode,
        systemFamily: game.systemFamily,
        drawsCount: drawDates.length,
        orderDrawDates: drawDates,
        orderTotalPrice: totalPrice,
      }
    };
    if (isNationalLottery && selectedNationalNumber) {
      Object.assign(selection, {
        numbers: selectedNationalNumber.split('').map(Number),
        stars: []
      });
      Object.assign(selection.metadata, {
        nationalNumber: selectedNationalNumber,
        nationalQuantity: selectedNationalQuantity,
        nationalDrawLabel: selectedNationalDraw.label,
      });
    } else if (isQuiniela) {
      Object.assign(selection, {
        selections: quinielaMatches.map(m => ({ id: m.id, val: m.result })),
        systemId: mode === 'reduced' ? selectedReductionSystemId : undefined
      });
    } else {
      Object.assign(selection, {
        numbers: selectedNumbers,
        stars: selectedStars
      });
    }

    await placeBet(selection);
  };

  return (
    <div 
      className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_12%,#f8fafc_100%)] pb-36"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}
    >
      {/* Success Overlay - MEJORA MILOTO: Feedback visual y compartir */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
            
            <h2 className="text-2xl font-black text-manises-blue uppercase tracking-tight mb-2">¡Apuesta Confirmada!</h2>
            <p className="text-sm text-muted-foreground font-medium mb-8 max-w-[280px]">
              Tu jugada para la {game.name} ha sido procesada correctamente. ¡Mucha suerte!
            </p>

            <div className="w-full max-w-sm flex flex-col gap-3">
              <Button 
                onClick={handleShare}
                className="w-full h-14 bg-manises-blue text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-manises"
              >
                <ShareAndroid className="w-5 h-5" /> Compartir con amigos
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/tickets')}
                className="w-full h-14 border-2 border-manises-blue/10 text-manises-blue font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                <JournalPage className="w-5 h-5" /> Ver mis jugadas
              </Button>

              <button 
                onClick={() => navigate('/')}
                className="mt-4 text-[11px] font-black text-manises-blue/40 uppercase tracking-widest hover:text-manises-blue flex items-center justify-center gap-1 transition-colors"
              >
                Volver al inicio <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <GameInfoSheet
        game={game}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        content={helpContent}
      />
      
      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-5 p-4 pt-3">
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
            }}
          />
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
              Saldo insuficiente ({formatCurrency(profile?.balance ?? 0)}). <br/>
              Necesitas {formatCurrency(totalPrice)} para jugar esta variante.
            </p>
          </motion.div>
        )}

        {!isNationalLottery && !isQuiniela && mode === 'reduced' && reductionSystems.length > 0 && (
          <motion.div variants={sectionFadeUp} initial="hidden" animate="visible" className="space-y-3">
            <ReductionSystemSelector
              systems={reductionSystems}
              currentSystemId={selectedReductionSystemId}
              onChange={(systemId) => {
                setSelectedReductionSystemId(systemId);
                handleClear();
              }}
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
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                      isSupportedReducedSelection
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border border-amber-200 bg-amber-50 text-amber-900'
                    }`}
                  >
                    {isSupportedReducedSelection ? 'Fila válida' : 'Ajusta la fila'}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedNumbers.length > 0 ? (
                  selectedNumbers.map((number) => (
                    <span
                      key={number}
                      className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-manises-blue/12 bg-manises-blue/[0.06] px-3 text-sm font-black text-manises-blue"
                    >
                      {number}
                    </span>
                  ))
                ) : (
                  <p className="text-[12px] font-medium text-slate-400">
                    Añade números hasta encajar en una fila válida del sistema.
                  </p>
                )}
              </div>

              <p className="mt-3 text-[11px] font-semibold text-slate-500">
                Soporta {supportedReducedNumbers[0]} a {supportedReducedNumbers[supportedReducedNumbers.length - 1]} números, según la tabla oficial disponible.
              </p>
            </div>
          </motion.div>
        )}

        {!isNationalLottery && !isQuiniela && mode === 'reduced' && selectedNumbers.length > 0 && isSupportedReducedSelection && betsCount > 0 && (
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

        {!isNationalLottery && !isQuiniela && mode === 'reduced' && selectedNumbers.length > 0 && !isSupportedReducedSelection && (
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
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base border-2 transition-colors ${
                      selectedNumbers[i]
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
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base border-2 transition-colors ${
                          selectedStars[i]
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
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-bold text-sm" style={theme.title}>Números</h2>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {selectedNumbers.length}/{mode === 'reduced' && supportedReducedNumbers.length > 0 ? supportedReducedNumbers[supportedReducedNumbers.length - 1] : maxNums}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: totalNums }, (_, i) => i + 1).map(n => {
                  const isSelected = selectedNumbers.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n)}
                      className={`aspect-square rounded-xl flex items-center justify-center border font-bold text-sm transition-all active:scale-90 ${
                        isSelected
                          ? 'scale-95 border-transparent shadow-[0_10px_20px_rgba(10,71,146,0.14)]'
                          : 'border-gray-100 bg-white/80 text-manises-blue/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-manises-blue/30 hover:bg-manises-blue/5'
                      }`}
                      style={isSelected ? theme.selectedAccent : undefined}
                      aria-pressed={isSelected}
                      aria-label={`Número ${n}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---- Grid de estrellas ---- */}
            {maxStars > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-bold text-sm" style={theme.title}>
                    {game.type === 'gordo' ? 'Clave' : 'Estrellas'}
                  </h2>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {selectedStars.length}/{maxStars}
                  </span>
                </div>
                <div className={`grid gap-2 ${totalStars <= 9 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                  {starValues.map(n => {
                    const isSelected = selectedStars.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => toggleStar(n)}
                        className={`aspect-square rounded-xl flex items-center justify-center border font-bold text-sm transition-all active:scale-90 ${
                          isSelected
                            ? 'border-transparent bg-manises-gold text-manises-blue shadow-gold scale-95'
                            : 'border-amber-100 bg-white text-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-amber-300 hover:bg-amber-50'
                        }`}
                        aria-pressed={isSelected}
                        aria-label={game.type === 'gordo' ? `Clave ${n}` : `Estrella ${n}`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            {/* Cabecera Informativa con Visual del Décimo */}
            <section className="flex flex-col gap-6">
              <div>
                <h2 className="font-black text-base text-manises-blue">Configuración de tu jugada</h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-manises-blue/70">
                  Visualiza y personaliza tu décimo
                </p>
              </div>

              {/* TICKET VISUAL - EL CORAZÓN DE LA EXPERIENCIA NACIONAL */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="stagger-item"
              >
                <NationalTicketVisual
                  number={selectedNationalNumber}
                  drawLabel={selectedNationalDraw.label}
                  drawDate={selectedNationalDraw.nextDraw}
                  price={selectedNationalDraw.decimoPrice}
                  gameId={game.id}
                  drawType={
                    game.id === 'loteria-navidad' ? 'navidad' :
                    game.id === 'loteria-nino' ? 'nino' :
                    'ordinary'
                  }
                />
              </motion.div>
            </section>


            {/* Selector de Números */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-black text-sm text-manises-blue">Números en administración</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost" size="sm"
                    className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest text-slate-400"
                    onClick={handleClear}
                  >
                    Limpiar
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest border-manises-gold/40 text-manises-gold bg-manises-gold/5"
                    onClick={handleRandom}
                  >
                    Aleatorio
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {NATIONAL_NUMBER_POOL.map((ticket) => {
                  const active = ticket.number === selectedNationalNumber;
                  const isLowStock = ticket.available <= 4;
                  
                  return (
                    <button
                      key={ticket.number}
                      onClick={() => {
                        setSelectedNationalNumber(ticket.number);
                        setSelectedNationalQuantity((qty) => Math.min(qty, ticket.available));
                      }}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all",
                        active
                          ? "border-manises-blue bg-manises-blue text-white shadow-manises"
                          : "border-slate-100 bg-white hover:border-manises-blue/20"
                      )}
                    >
                      <p className={cn(
                        "text-2xl font-black tracking-widest",
                        active ? "text-white" : "text-manises-blue"
                      )}>
                        {ticket.number}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                          active 
                            ? "bg-white/15 border-white/20 text-white" 
                            : isLowStock ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}>
                          {isLowStock ? 'Últimos' : 'Disponibles'}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          active ? "text-white/60" : "text-slate-400"
                        )}>
                          Stock: {ticket.available}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Cantidad y Resumen */}
            {selectedNationalNumber && (
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="rounded-[2rem] border border-manises-blue/10 bg-white p-6 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tu compra</p>
                    <h3 className="text-xl font-black text-manises-blue mt-1">
                      {selectedNationalQuantity} {selectedNationalQuantity === 1 ? 'décimo' : 'décimos'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</p>
                    <p className="text-2xl font-black text-manises-blue mt-1">
                      {formatCurrency(selectedNationalDraw.decimoPrice * selectedNationalQuantity)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl">
                  <div className="ml-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ajustar cantidad</span>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      Máximo {maxNationalQuantity} {maxNationalQuantity === 1 ? 'décimo disponible' : 'décimos disponibles'} para el número {selectedNationalNumber}.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost" size="icon"
                      className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm"
                      onClick={() => setSelectedNationalQuantity(q => Math.max(1, q - 1))}
                      disabled={selectedNationalQuantity <= 1}
                      aria-label="Restar un décimo"
                    >
                      -
                    </Button>
                    <span className="w-6 text-center font-black text-lg text-manises-blue">{selectedNationalQuantity}</span>
                    <Button
                      variant="ghost" size="icon"
                      className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm"
                      onClick={() => setSelectedNationalQuantity(q => Math.min(maxNationalQuantity, q + 1))}
                      disabled={selectedNationalQuantity >= maxNationalQuantity}
                      aria-label="Sumar un décimo"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                  <TrophyIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-[11px] font-semibold text-emerald-800 leading-snug">
                    Si este número resulta premiado con el <span className="font-black">Gordo</span>, cobrarías un total de <span className="font-black">{formatCurrency(nationalPotentialFirstPrize)}</span>.
                  </p>
                </div>
              </motion.section>
            )}
          </div>
        )}
          </motion.div>
        </AnimatePresence>

        {supportsTimeSelection && (
          <motion.div variants={sectionFadeUp} initial="hidden" animate="visible" className="space-y-3">
            <div className="rounded-[1.6rem] border border-manises-blue/10 bg-[linear-gradient(180deg,#ffffff_0%,#f5f8ff_100%)] p-4 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Planificación</p>
                  <h3 className="mt-1 text-sm font-black text-manises-blue">¿Cuándo quieres jugar?</h3>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                    Elige el próximo sorteo o agrupa varios sorteos futuros sin cambiar tu selección actual.
                  </p>
                </div>
                <div className="rounded-xl border border-manises-blue/10 bg-white/80 px-3 py-2 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Sorteos</p>
                  <p className="mt-0.5 text-lg font-black text-manises-blue">{drawsCount}</p>
                </div>
              </div>

              {/* UI Específica para Lotería Nacional: Selección explícita de sorteos */}
              {isNationalLottery ? (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 mb-2">Sorteos Disponibles (Próximas 5 semanas)</p>
                  <div className="grid grid-cols-1 gap-2">
                    {availableNationalDates.map((dateIso) => {
                      const isSelected = effectiveSelectedDrawDates.includes(dateIso);
                      const dateObj = new Date(dateIso);
                      return (
                        <button
                          key={dateIso}
                          onClick={() => {
                            setSelectedDrawDates(prev => {
                              if (prev.includes(dateIso)) {
                                if (prev.length === 1) return prev; // Al menos uno seleccionado
                                return prev.filter(d => d !== dateIso);
                              }
                              return [...prev, dateIso].sort();
                            });
                          }}
                          className={cn(
                            'flex items-center justify-between rounded-2xl border px-4 py-3 transition-all',
                            isSelected
                              ? 'border-manises-blue bg-manises-blue/[0.03] shadow-sm'
                              : 'border-slate-100 bg-white/50'
                          )}
                        >
                          <div className="flex flex-col items-start">
                            <span className={cn("text-xs font-black", isSelected ? "text-manises-blue" : "text-slate-700")}>
                              {dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              Sorteo Ordinario
                            </span>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-manises-blue border-manises-blue" : "border-slate-200 bg-white"
                          )}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {SCHEDULE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTimeMode(option.id)}
                        className={cn(
                          'rounded-2xl border px-3 py-3 text-left transition-all',
                          timeMode === option.id
                            ? 'border-manises-blue bg-[linear-gradient(180deg,rgba(10,71,146,0.06)_0%,rgba(10,71,146,0.10)_100%)] shadow-[0_12px_24px_rgba(10,71,146,0.10)]'
                            : 'border-white bg-white/90 shadow-[0_8px_18px_rgba(15,23,42,0.04)] hover:border-manises-blue/20'
                        )}
                      >
                        <p className={cn(
                          'text-[11px] font-black uppercase tracking-[0.12em]',
                          timeMode === option.id ? 'text-manises-blue' : 'text-slate-500'
                        )}>
                          {option.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  {timeMode === 'custom_weeks' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Array.from({ length: maxWeeksSelectable - 1 }, (_, index) => index + 2).map((weeks) => (
                        <button
                          key={weeks}
                          onClick={() => setSelectedWeeksCount(weeks)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all',
                            selectedWeeksCount === weeks
                              ? 'border-manises-gold bg-amber-50 text-manises-blue shadow-[0_8px_18px_rgba(184,134,11,0.10)]'
                              : 'border-white bg-white text-slate-500 shadow-[0_6px_14px_rgba(15,23,42,0.04)] hover:border-manises-gold/40'
                          )}
                        >
                          {weeks} semanas
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 rounded-2xl border border-manises-blue/10 bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-manises-blue">Sorteos incluidos</p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {formatCurrency(drawPrice)} x {drawsCount} sorteos
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {Object.entries(groupedSelectedDraws).map(([weekLabel, draws]) => (
                    <div key={weekLabel}>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{weekLabel}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {draws.map((draw) => (
                          <span
                            key={draw.drawDate}
                            className="inline-flex items-center rounded-full border border-manises-blue/12 bg-manises-blue/[0.05] px-2.5 py-1 text-[10px] font-bold text-manises-blue"
                          >
                            {formatDate(draw.drawDate)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---- SECCIÓN LAGUINDA: Seguro y Abono ---- */}
        <div className="mt-2 space-y-3">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setHasInsurance(!hasInsurance)}
            className={`relative overflow-hidden rounded-[1.55rem] border-2 p-4 transition-all cursor-pointer ${
              hasInsurance 
                ? 'border-manises-gold bg-[linear-gradient(180deg,#fff9e9_0%,#fff4cf_100%)] shadow-[0_16px_34px_rgba(184,134,11,0.16)]' 
                : 'border-white bg-white/85 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                hasInsurance ? 'bg-manises-gold text-manises-blue' : 'bg-gray-100 text-gray-400'
              }`}>
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-manises-blue">Seguro de Lotería</h3>
                  <span className={`text-xs font-black ${hasInsurance ? 'text-manises-blue' : 'text-gray-400'}`}>
                    + {formatCurrency(INSURANCE_PRICE)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mt-0.5">
                  Recupera el 100% de tu premio (20% de impuestos de Hacienda) si ganas más de 40.000€.
                </p>
              </div>
            </div>
            {hasInsurance && (
              <div className="absolute top-0 right-0 p-1">
                <BrightStar className="h-3 w-3 text-manises-gold" />
              </div>
            )}
          </motion.div>

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
              className={`h-12 flex-1 rounded-2xl font-bold text-sm shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition-all active:scale-[0.98] ${
                canPlay
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              style={canPlay ? theme.cta : undefined}
              onClick={handlePlay}
              disabled={isSubmitting || !canPlay}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : canPlay
                ? drawsCount > 1
                  ? `Confirmar ${drawsCount} sorteos`
                  : isNationalLottery
                  ? `Reservar ${selectedNationalQuantity} décimo${selectedNationalQuantity === 1 ? '' : 's'}`
                  : `Confirmar ${betsCount} ${betsCount === 1 ? 'apuesta' : 'apuestas'}`
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
