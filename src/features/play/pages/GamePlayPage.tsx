import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { Button } from '@/shared/ui/Button';
import { GameBadge } from '@/shared/ui/GameBadge';
import { 
  ChevronLeft, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  ArrowRight,
  Ticket as TicketIcon,
  ShieldCheck,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { placeBet, generateRandomPlay } from '@/features/play/services/play.service';
import { formatCurrency, formatDrawTime } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { calculateMultipleBets, calculateTotalPrice, QUINIELA_REDUCED_TABLES, QuinielaReducedType } from '../lib/bet-calculator';
import { validatePlaySelection } from '../lib/game-rules';
import { GameModeSelector } from '../components/GameModeSelector';
import { QuinielaProfessionalSelector } from '../components/QuinielaProfessionalSelector';
import { Wallet, Info, AlertTriangle } from 'lucide-react';
import loteriaTicketVisual from '@/assets/images/loteria_sorteos_2016554_dec_1_21.jpg';

// Config de juego por tipo
const GAME_CONFIG = {
  euromillones: { numbers: 5, totalNums: 50, stars: 2, totalStars: 12 },
  primitiva:    { numbers: 6, totalNums: 49, stars: 0, totalStars: 0 },
  bonoloto:     { numbers: 6, totalNums: 49, stars: 0, totalStars: 0 },
  gordo:        { numbers: 5, totalNums: 54, stars: 1, totalStars: 9 },
  eurodreams:   { numbers: 6, totalNums: 40, stars: 1, totalStars: 5 },
  quiniela:     { numbers: 0, totalNums: 0,  stars: 0, totalStars: 0 }, // tipo diferente
  'loteria-nacional': { numbers: 0, totalNums: 0, stars: 0, totalStars: 0 },
} as const;

const INSURANCE_PRICE = 0.50;

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
  const { user, profile } = useAuth();
  const game = LOTTERY_GAMES.find(g => g.id === gameId);

  // Determinar modos disponibles desde la matriz
  const availableModes: Array<'simple' | 'multiple' | 'reduced'> = 
    game?.technicalMode === 'reduced_official' 
      ? ['simple', 'reduced'] 
      : game?.technicalMode === 'multiple_direct' || game?.technicalMode === 'multiple'
        ? ['simple', 'multiple'] 
        : ['simple'];

  const [mode, setMode] = useState<'simple' | 'multiple' | 'reduced'>(availableModes[0]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedStars, setSelectedStars]     = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);
  
  // Quiniela & Nacional Específico
  const [quinielaMatches, setQuinielaMatches] = useState<QuinielaMatch[]>([]);
  const [reducedType, setReducedType] = useState<QuinielaReducedType>('reducida_1');
  const [selectedNationalDrawId, setSelectedNationalDrawId] = useState<NationalDrawId>('sabado');
  const [selectedNationalNumber, setSelectedNationalNumber] = useState<string | null>(null);
  const [selectedNationalQuantity, setSelectedNationalQuantity] = useState(1);

  // Features Laguinda Style
  const [hasInsurance, setHasInsurance] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);

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

  // Límites dinámicos basados en el MODO y la MATRIZ
  const range = game.selectionRange!;
  const maxNums = mode === 'multiple' ? range.numbers.max : range.numbers.min;
  const totalNums = range.numbers.total;
  const maxStars = mode === 'multiple' ? (range.stars?.max ?? range.stars?.min ?? 0) : (range.stars?.min ?? 0);
  const totalStars = range.stars?.total ?? 0;

  const theme = getGameTheme(game);
  const isNationalLottery = game.id === 'loteria-nacional';
  const isQuiniela = game.id === 'quiniela';

  // --- CÁLCULO DE APUESTAS (NÚCLEO MATEMÁTICO) ---
  let betsCount = 1;
  if (isQuiniela && mode === 'reduced') {
    betsCount = QUINIELA_REDUCED_TABLES[reducedType].bets;
  } else if (!isNationalLottery && !isQuiniela) {
    if (mode === 'multiple' || selectedNumbers.length > range.numbers.min || (range.stars && selectedStars.length > range.stars.min)) {
      betsCount = calculateMultipleBets(selectedNumbers.length, selectedStars.length, game.type);
    }
  }

  const basePrice = isNationalLottery 
    ? (NATIONAL_DRAW_CONFIG.find(d => d.id === selectedNationalDrawId)?.decimoPrice ?? 3) * selectedNationalQuantity 
    : calculateTotalPrice(game.price, betsCount, false);
  
  const totalPrice = basePrice + (hasInsurance ? INSURANCE_PRICE : 0);
  const isOverBalance = profile ? profile.balance < totalPrice : false;

  const nationalDraws = NATIONAL_DRAW_CONFIG.map((draw) => ({
    ...draw,
    nextDraw: nextWeekdayIso(draw.weekday, draw.hour),
  }));
  const selectedNationalDraw = nationalDraws.find((draw) => draw.id === selectedNationalDrawId) ?? nationalDraws[0];
  const selectedNationalTicket = NATIONAL_NUMBER_POOL.find((ticket) => ticket.number === selectedNationalNumber);
  const maxNationalQuantity = selectedNationalTicket?.available ?? 1;
  const nationalPotentialFirstPrize = selectedNationalDraw.firstPrize * selectedNationalQuantity;

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

    const { numbers, stars } = generateRandomPlay(totalNums, maxNums, totalStars, maxStars);
    setSelectedNumbers(numbers);
    setSelectedStars(stars);
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
          quinielaMatches.filter(m => ['1X', '12', 'X2'].includes(m.result)).length === QUINIELA_REDUCED_TABLES[reducedType].dobles &&
          quinielaMatches.filter(m => m.result === '1X2').length === QUINIELA_REDUCED_TABLES[reducedType].triples
        )
      )
    : false;

  const canPlay = isNationalLottery
    ? selectedNationalNumber !== null
    : isQuiniela
      ? isQuinielaValid
      : selectedNumbers.length >= range.numbers.min && selectedNumbers.length <= range.numbers.max && selectedStars.length === maxStars;

  const handlePlay = async () => {
    if (!user || !profile) { toast.error('Sesión requerida'); return; }
    if (!canPlay)           { 
      if (isQuiniela && !isQuinielaValid && mode === 'reduced') {
        const config = QUINIELA_REDUCED_TABLES[reducedType];
        toast.error(`Requisitos: ${config.dobles}D y ${config.triples}T`);
      } else {
        toast.error('Completa tu apuesta'); 
      }
      return; 
    }
    if (isOverBalance) { toast.error('Saldo insuficiente'); return; }

    setIsSubmitting(true);
    const drawDate = new Date(isNationalLottery ? selectedNationalDraw.nextDraw : game.nextDraw).toISOString().split('T')[0];
    
    // Payload Profesional para el BE
    const payload: any = {
      userId: user.uid,
      gameId: game.id,
      gameType: game.type,
      mode,
      drawDate,
      price: totalPrice,
      betsCount,
      hasInsurance,
      isSubscription,
      metadata: {
        technicalMode: game.technicalMode,
        systemFamily: game.systemFamily,
      }
    };

    if (isNationalLottery && selectedNationalNumber) {
      payload.numbers = selectedNationalNumber.split('').map(Number);
      payload.stars = [];
    } else if (isQuiniela) {
      payload.selections = quinielaMatches.map(m => ({ id: m.id, val: m.result }));
      if (mode === 'reduced') payload.systemId = reducedType;
    } else {
      payload.numbers = selectedNumbers;
      payload.stars = selectedStars;
    }

    const result = await placeBet(payload);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
    } else {
      toast.error('Error al procesar la apuesta. Inténtalo de nuevo.');
    }
  };

  return (
    <div 
      className="flex flex-col bg-white min-h-full pb-36"
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
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
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
                <Share2 className="w-5 h-5" /> Compartir con amigos
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/tickets')}
                className="w-full h-14 border-2 border-manises-blue/10 text-manises-blue font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                <TicketIcon className="w-5 h-5" /> Ver mis jugadas
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
              <ChevronLeft className="w-5 h-5" />
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
            aria-label="Información del juego"
          >
            <Info className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-5 p-4 pt-2">
        {/* Selector de Modo (Solo si hay varios disponibles) */}
        {!isNationalLottery && (
          <GameModeSelector 
            gameType={game.type}
            availableModes={availableModes}
            currentMode={mode}
            onModeChange={(m) => {
              setMode(m);
              handleClear(); // Limpiar al cambiar de modo para evitar estados inconsistentes
            }}
          />
        )}

        {/* Advertencia de Saldo Insuficiente */}
        {isOverBalance && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-normal">
              Saldo insuficiente ({formatCurrency(profile?.balance ?? 0)}). <br/>
              Necesitas {formatCurrency(totalPrice)} para jugar esta variante.
            </p>
          </motion.div>
        )}

        {isQuiniela ? (
          /* VISTA PROFESIONAL DE QUINIELA */
          <div className="space-y-6">
            {mode === 'reduced' && (
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(QUINIELA_REDUCED_TABLES) as QuinielaReducedType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setReducedType(t)}
                    className={`p-2 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${
                      reducedType === t ? 'bg-manises-blue text-white border-manises-blue shadow-md' : 'bg-white text-slate-400 border-slate-100'
                    }`}
                  >
                    {QUINIELA_REDUCED_TABLES[t].dobles > 0 ? `${QUINIELA_REDUCED_TABLES[t].dobles}D` : `${QUINIELA_REDUCED_TABLES[t].triples}T`}
                  </button>
                ))}
              </div>
            )}
            
            <QuinielaProfessionalSelector 
              mode={mode} 
              reducedType={mode === 'reduced' ? reducedType : undefined}
              onSelectionChange={(m) => setQuinielaMatches(m)}
            />
          </div>
        ) : !isNationalLottery ? (
          <>
            {/* ---- Selección visual ---- */}
            <div className="rounded-xl p-4 flex flex-col items-center gap-4 border shadow-manises surface-neo-soft" style={theme.surface}>
              {/* Números seleccionados */}
              <div className="flex flex-wrap justify-center gap-2.5">
                {Array.from({ length: maxNums }).map((_, i) => (
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
                    {Array.from({ length: maxStars }).map((_, i) => (
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
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Limpiar
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="rounded-lg font-semibold text-xs px-4 border-manises-gold/50 text-manises-gold hover:bg-manises-gold/5"
                  onClick={handleRandom}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Aleatorio
                </Button>
              </div>
            </div>

            {/* ---- Grid de números ---- */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-bold text-sm" style={theme.title}>Números</h2>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {selectedNumbers.length}/{maxNums}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: totalNums }, (_, i) => i + 1).map(n => {
                  const isSelected = selectedNumbers.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNumber(n)}
                      className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all active:scale-90 ${
                        isSelected
                          ? 'scale-95'
                          : 'bg-gray-50 text-manises-blue/70 border border-gray-100 hover:border-manises-blue/30 hover:bg-manises-blue/5'
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
                  {Array.from({ length: totalStars }, (_, i) => i + 1).map(n => {
                    const isSelected = selectedStars.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => toggleStar(n)}
                        className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all active:scale-90 ${
                          isSelected
                            ? 'bg-manises-gold text-manises-blue shadow-gold scale-95'
                            : 'bg-amber-50 text-amber-400 border border-amber-100 hover:border-amber-300'
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
          <>
            <div className="rounded-xl p-4 border shadow-manises surface-neo-soft space-y-4" style={theme.surface}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base text-manises-blue">Tu Selección</h2>
                  <p className="text-[11px] font-semibold text-manises-blue/70 uppercase tracking-[0.14em] mt-0.5">
                    Sorteo y décimos
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-manises-blue/12 bg-white p-3.5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-manises-blue/60">Administración oficial</p>
                  <p className="text-sm font-black text-manises-blue mt-0.5">Décimos disponibles para compra online</p>
                  <p className="text-[10px] font-semibold text-muted-foreground mt-1">Juego responsable +18</p>
                </div>
                <div className="w-[108px] h-[64px] rounded-xl overflow-hidden border border-manises-blue/15 shadow-sm shrink-0">
                  <img
                    src={loteriaTicketVisual}
                    alt="Billete de lotería nacional"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {nationalDraws.map((draw) => {
                  const active = draw.id === selectedNationalDrawId;
                  return (
                    <button
                      key={draw.id}
                      onClick={() => setSelectedNationalDrawId(draw.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-manises-blue bg-[linear-gradient(160deg,#0a4792_0%,#083d7d_100%)] shadow-[0_10px_20px_rgba(10,71,146,0.25)]'
                          : 'border-gray-200 bg-white/90 hover:border-manises-blue/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-black ${active ? 'text-white' : 'text-manises-blue'}`}>{draw.label}</p>
                        {active && (
                          <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] font-medium mt-0.5 ${active ? 'text-white/75' : 'text-muted-foreground'}`}>{formatDrawTime(draw.nextDraw)}</p>
                      <p className={`text-xs font-black mt-1 ${active ? 'text-[#F2CD74]' : 'text-[#B8860B]'}`}>
                        {formatCurrency(draw.decimoPrice)} / décimo
                      </p>
                      {active && (
                        <p className="text-[10px] font-semibold text-white/80 mt-1">
                          1º: {formatCurrency(draw.firstPrize)} · 2º: {formatCurrency(draw.secondPrize)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  className="rounded-lg font-semibold text-xs px-4 border-gray-200 text-gray-500 hover:bg-gray-50"
                  onClick={handleClear}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Limpiar
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="rounded-lg font-semibold text-xs px-4 border-manises-blue/20 bg-manises-blue/5 text-manises-blue hover:bg-manises-blue/10"
                  onClick={handleRandom}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Número aleatorio
                </Button>
              </div>

              <p className="text-[10px] font-semibold text-manises-blue/70">
                Terminaciones y reintegro se comprueban automáticamente en resultados.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-black text-sm" style={theme.title}>Décimos disponibles</h2>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {selectedNationalNumber ? `Seleccionado: ${selectedNationalNumber}` : 'Elige tu número'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {NATIONAL_NUMBER_POOL.map((ticket) => {
                  const active = ticket.number === selectedNationalNumber;
                  const demandLabel = ticket.available <= 4 ? 'Alta demanda' : ticket.available <= 7 ? 'Demanda media' : 'Disponible';
                  const demandClass = ticket.available <= 4
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : ticket.available <= 7
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  return (
                    <button
                      key={ticket.number}
                      onClick={() => {
                        setSelectedNationalNumber(ticket.number);
                        setSelectedNationalQuantity((qty) => Math.min(qty, ticket.available));
                      }}
                      className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all ${
                        active
                          ? 'border-manises-blue bg-manises-blue text-white shadow-lg'
                          : 'border-gray-200 bg-white hover:border-manises-blue/30'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-lg font-black tracking-wider ${active ? 'text-white' : 'text-manises-blue'}`}>{ticket.number}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${active ? 'border-white/25 bg-white/15 text-white' : demandClass}`}>
                            {demandLabel}
                          </span>
                        </div>
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-white/80' : 'text-muted-foreground'}`}>
                          Stock: {ticket.available} décimos
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedNationalTicket && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-manises-blue uppercase tracking-wider">Ticket seleccionado</p>
                    <p className="text-2xl font-black tracking-[0.10em] text-manises-blue mt-0.5">{selectedNationalTicket.number}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">
                      Máximo disponible: {selectedNationalTicket.available} décimos
                    </p>
                  </div>
                  <div className="rounded-2xl bg-manises-blue text-white px-3 py-2 text-right min-w-[92px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Total</p>
                    <p className="text-lg font-black leading-none">{formatCurrency(selectedNationalDraw.decimoPrice * selectedNationalQuantity)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2.5">
                  <p className="text-[11px] font-black text-manises-blue uppercase tracking-wider">Cantidad</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl"
                      onClick={() => setSelectedNationalQuantity((qty) => Math.max(1, qty - 1))}
                      disabled={selectedNationalQuantity <= 1}
                    >
                      -
                    </Button>
                    <span className="min-w-10 text-center font-black text-lg text-manises-blue">{selectedNationalQuantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl"
                      onClick={() => setSelectedNationalQuantity((qty) => Math.min(maxNationalQuantity, qty + 1))}
                      disabled={selectedNationalQuantity >= maxNationalQuantity}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <p className="text-[10px] font-semibold text-manises-blue/70">
                  Si este número fuera 1º premio: cobrarías {formatCurrency(nationalPotentialFirstPrize)}.
                </p>
              </div>
            )}
          </>
        )}

        {/* ---- SECCIÓN LAGUINDA: Seguro y Abono ---- */}
        <div className="mt-2 space-y-3">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setHasInsurance(!hasInsurance)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              hasInsurance 
                ? 'border-manises-gold bg-amber-50 shadow-md' 
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
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
                <Zap className="w-3 h-3 text-manises-gold fill-manises-gold" />
              </div>
            )}
          </motion.div>

          <div 
            onClick={() => setIsSubscription(!isSubscription)}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSubscription ? 'bg-manises-blue text-white' : 'bg-white text-gray-400'
              }`}>
                <RefreshCcw className={`w-5 h-5 ${isSubscription ? 'animate-spin-slow' : ''}`} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-manises-blue">Abonarse</h3>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Juega cada semana automáticamente</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${isSubscription ? 'bg-manises-blue' : 'bg-gray-200'}`}>
              <motion.div 
                animate={{ x: isSubscription ? 24 : 4 }}
                className="w-4 h-4 bg-white rounded-full absolute top-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Barra de confirmación ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
        <div className="flex items-center justify-between rounded-[1.8rem] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-5 py-3 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Importe Total
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-black tabular-nums" style={theme.title}>
                {formatCurrency(totalPrice)}
              </p>
              {hasInsurance && (
                <span className="text-[10px] font-bold text-manises-gold underline decoration-2 underline-offset-2">Protegido</span>
              )}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <Button
              className={`flex-1 h-12 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.98] ${
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
                ? isNationalLottery
                  ? 'Reservar décimos'
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
  );
}
