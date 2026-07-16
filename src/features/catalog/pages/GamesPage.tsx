import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import type { Key } from 'react';
import {
  ChevronRight,
  Clock,
  Trophy,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { GameBadge } from '@/shared/ui/GameBadge';
import { formatJackpot, formatCurrency, formatDrawTime } from '@/shared/lib/utils';
import { useLotteryGames } from '@/shared/hooks/useLotteryGames';
import type { LotteryGame } from '@/shared/types/domain';
import { getGameIdentity } from '@/shared/lib/game-identity';

// Assets
import adminManises from '@/assets/images/administracion_manises.webp';
import joySecondary from '@/assets/images/joy_secondary.png';
import primitivaJoy from '@/assets/images/primitiva_joy.png';
import loteriaNacionalHero from '@/assets/images/loteria_nacional.jpg';
import loteriaJuevesLuck from '@/assets/images/loteria_jueves_luck.jpg';
import loteriaNavidadHero from '@/assets/images/loteria_navidad_hero.jpg';
import headerWinner from '@/assets/images/header_winner.jpg';
import primitivaJoyV2 from '@/assets/images/primitiva_joy_v2.jpg';

// ─── Sub-component: Notice Ticker ───────────────────────────────────────────
const NOTICES = [
  "Hemos repartido un premio de Bonoloto de 33.495,59 € - ¡Enhorabuena al ganador! 🏆",
  "¡El bote de Euromillones alcanza ya los 105.000.000 €! Juega tu apuesta sencilla 🍀",
  "Ya está disponible la Lotería de Navidad 2026. ¡Consigue tu décimo oficial! 🎄"
];

function NoticeTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef(0);
  const sep = ' '.repeat(20) + '·' + ' '.repeat(20);
  const combined = NOTICES.join(sep);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const step = () => {
      posRef.current -= 1;
      // Reset when we've scrolled exactly one copy's width
      if (-posRef.current >= track.scrollWidth / 2) {
        posRef.current = 0;
      }
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="w-full bg-[#f8fafc] border-y border-slate-100 py-2.5 px-4 flex items-center gap-3 overflow-hidden min-h-[40px] shadow-sm">
      <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
      <div className="flex-1 overflow-hidden">
        <div ref={trackRef} style={{ display: 'flex', width: 'max-content' }}>
          <span className="whitespace-nowrap text-[11px] font-bold text-manises-blue tracking-wide" style={{ paddingRight: '5rem' }}>
            {combined}
          </span>
          <span className="whitespace-nowrap text-[11px] font-bold text-manises-blue tracking-wide" style={{ paddingRight: '5rem' }} aria-hidden>
            {combined}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Christmas Featured Card ──────────────────────────────────
function ChristmasCard({ onClick }: { onClick: () => void }) {
  const year = new Date().getFullYear();
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-[#0c0e17] via-[#111827] to-[#020617] border border-amber-500/10 p-6 flex justify-between items-center cursor-pointer shadow-xl h-44 group"
    >
      <img
        src={loteriaNavidadHero}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-65 transition-transform duration-[2000ms] group-hover:scale-105 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e17] via-[#0c0e17]/50 to-transparent" />

      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-2 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <div className="absolute top-12 left-1/3 w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-6 right-1/4 w-2 h-2 bg-white rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute bottom-8 left-10 w-1 h-1 bg-white rounded-full" />
        <div className="absolute bottom-12 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-duration:4s]" />
      </div>

      <div className="relative flex flex-col justify-between h-full z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="text-[9px] font-black text-amber-400 tracking-[0.2em] uppercase">Lotería de</span>
          </div>
          <h3 className="text-2xl font-black text-white leading-none tracking-tight mb-2">
            NAVIDAD
          </h3>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-sm font-extrabold tracking-tight">400.000 € <span className="text-slate-400 text-xs font-normal">al décimo</span></span>
            <span className="text-amber-400/90 text-[10px] font-bold uppercase tracking-wider">Ya disponible</span>
          </div>
        </div>

        <button className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-[11px] font-black text-slate-950 px-4 py-2 rounded-xl mt-3 w-fit shadow-[0_4px_12px_rgba(245,158,11,0.25)] border border-yellow-300/20 group-hover:scale-[1.03] duration-200">
          COMPRAR
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

      <div className="relative flex items-center justify-center h-full w-24 shrink-0 z-10 select-none">
        <div className="flex flex-col items-center group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
          {/* Capuchón */}
          <div className="flex flex-col items-center">
            <div className="w-1.5 h-2 rounded-t-sm" style={{ background: 'linear-gradient(to right, #e5e7eb, #9ca3af, #e5e7eb)' }} />
            <div className="w-5 h-1.5 rounded-sm" style={{ background: 'linear-gradient(to bottom, #9ca3af, #6b7280)' }} />
          </div>
          {/* Bola */}
          <div
            className="w-14 h-14 rounded-full shadow-xl flex flex-col items-center justify-center p-1 text-center relative overflow-hidden border border-yellow-300/60"
            style={{ background: 'radial-gradient(circle at 35% 28%, #fef9c3, #fbbf24 48%, #92400e 100%)' }}
          >
            <div className="absolute top-1.5 left-2.5 w-4 h-2 rounded-full bg-white/45 rotate-[-20deg]" />
            <span className="text-[15px] font-black text-slate-950 leading-none relative z-10">22</span>
            <span className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none mt-0.5 relative z-10">DIC</span>
            <span className="text-[7.5px] font-bold text-slate-800 leading-none mt-0.5 relative z-10">{year}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-component: El Niño Featured Card ─────────────────────────────────────
function NinoCard({ onClick }: { onClick: () => void }) {
  const year = (() => {
    const now = new Date();
    return now.getMonth() === 0 && now.getDate() <= 6 ? now.getFullYear() : now.getFullYear() + 1;
  })();
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-[#0d1b3e] via-[#1e3a8a] to-[#0c1a35] border border-blue-400/15 p-6 flex justify-between items-center cursor-pointer shadow-xl h-44 group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b3e] via-[#0d1b3e]/60 to-transparent" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-8 w-28 h-28 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Stars decoration */}
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        <div className="absolute top-3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-10 left-1/2 w-1.5 h-1.5 bg-white rounded-full" />
        <div className="absolute top-5 right-1/3 w-1 h-1 bg-yellow-200 rounded-full animate-ping [animation-duration:3.5s]" />
        <div className="absolute bottom-10 left-12 w-1 h-1 bg-white rounded-full" />
        <div className="absolute bottom-6 right-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce [animation-duration:4.5s]" />
        <div className="absolute top-8 right-12 w-1 h-1 bg-white rounded-full" />
      </div>

      <div className="relative flex flex-col justify-between h-full z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 fill-current" />
            <span className="text-[9px] font-black text-blue-300 tracking-[0.2em] uppercase">Lotería de</span>
          </div>
          <h3 className="text-2xl font-black text-white leading-none tracking-tight mb-2">
            EL NIÑO
          </h3>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-sm font-extrabold tracking-tight">200.000 € <span className="text-slate-400 text-xs font-normal">al décimo</span></span>
            <span className="text-blue-300/90 text-[10px] font-bold uppercase tracking-wider">Ya disponible</span>
          </div>
        </div>

        <button className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-400 text-[11px] font-black text-white px-4 py-2 rounded-xl mt-3 w-fit shadow-[0_4px_12px_rgba(59,130,246,0.25)] border border-blue-300/20 group-hover:scale-[1.03] duration-200">
          COMPRAR
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

      {/* Crown + date ball */}
      <div className="relative flex items-center justify-center h-full w-24 shrink-0 z-10 select-none">
        <div className="flex flex-col items-center group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
          {/* Crown */}
          <div className="flex items-end justify-center gap-[2px] mb-0.5">
            <div className="w-1.5 h-3 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm" />
            <div className="w-1.5 h-4 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-t-sm" />
            <div className="w-1.5 h-3 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm" />
          </div>
          {/* Date ball */}
          <div
            className="w-14 h-14 rounded-full shadow-xl flex flex-col items-center justify-center p-1 text-center relative overflow-hidden border border-blue-300/60"
            style={{ background: 'radial-gradient(circle at 35% 28%, #dbeafe, #3b82f6 48%, #1e3a8a 100%)' }}
          >
            <div className="absolute top-1.5 left-2.5 w-4 h-2 rounded-full bg-white/40 rotate-[-20deg]" />
            <span className="text-[15px] font-black text-white leading-none relative z-10">6</span>
            <span className="text-[8px] font-black text-blue-100 uppercase tracking-tight leading-none mt-0.5 relative z-10">ENE</span>
            <span className="text-[7.5px] font-bold text-blue-200 leading-none mt-0.5 relative z-10">{year}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sub-component: Euromillions Featured Card ────────────────────────────────
function EuromillionsCard({ jackpot, nextDraw, onClick }: { jackpot: number; nextDraw: string; onClick: () => void }) {
  const formatMillions = (value: number) => {
    const millions = Math.round(value / 1_000_000);
    return `${millions}M €`;
  };

  const getDrawDayText = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    let dayStr = "";
    if (d.toDateString() === today.toDateString()) {
      dayStr = "Hoy";
    } else if (d.toDateString() === tomorrow.toDateString()) {
      dayStr = "Mañana";
    } else {
      dayStr = d.toLocaleDateString('es-ES', { weekday: 'long' });
      dayStr = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
    }
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${dayStr} - ${timeStr}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 border border-blue-500/20 p-5 flex justify-between items-center cursor-pointer shadow-xl h-36 group"
    >
      <img
        src={headerWinner}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-65 transition-transform duration-[2000ms] group-hover:scale-105 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_70%)]" />

      <div className="relative flex flex-col justify-between h-full z-10">
        <div>
          <span className="text-[8px] font-black text-blue-300 tracking-[0.2em] uppercase mb-1 block">
            BOTE ESPECIAL
          </span>
          <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">
            EUROMILLONES
          </h3>
          <p className="text-[1.7rem] font-black text-white tracking-tight drop-shadow-md leading-none">
            {formatMillions(jackpot)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-blue-200/80 mt-2">
          <Clock className="w-3.5 h-3.5 text-blue-300" />
          <span className="text-[10px] font-bold tracking-wide uppercase">
            {getDrawDayText(nextDraw)}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-end h-full w-32 shrink-0 z-10 select-none">
        <div
          className="absolute right-12 bottom-4 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border border-white/40 rotate-[-12deg] group-hover:translate-y-[-2px] transition-transform duration-300 overflow-hidden"
          style={{ background: 'radial-gradient(circle at 33% 28%, #ffffff, #e2e8f0 50%, #94a3b8 100%)' }}
        >
          <span className="text-xs font-black text-slate-700 relative z-10">12</span>
          <div className="absolute top-1 left-1.5 w-3 h-1.5 bg-white/75 rounded-full rotate-[-15deg]" />
        </div>
        <div
          className="absolute right-4 top-2 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border border-white/50 rotate-[15deg] z-10 group-hover:translate-x-[2px] transition-transform duration-300 overflow-hidden"
          style={{ background: 'radial-gradient(circle at 33% 28%, #dbeafe, #60a5fa 52%, #1e3a8a 100%)' }}
        >
          <span className="text-sm font-black text-white relative z-10">07</span>
          <div className="absolute top-1 left-2 w-4 h-2 bg-white/75 rounded-full rotate-[-15deg]" />
        </div>
        <div
          className="absolute right-0 bottom-2 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center border border-yellow-200/50 rotate-[-5deg] z-20 group-hover:scale-105 transition-transform duration-300 overflow-hidden"
          style={{ background: 'radial-gradient(circle at 33% 28%, #fef08a, #f59e0b 52%, #78350f 100%)' }}
        >
          <span className="text-[10px] font-black text-amber-950 relative z-10">★</span>
          <div className="absolute top-0.5 left-1.5 w-2.5 h-1 bg-white/75 rounded-full rotate-[-15deg]" />
        </div>

        <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" />
        <div className="absolute bottom-6 right-2 w-1 h-1 bg-blue-300 rounded-full" />
      </div>
    </motion.div>
  );
}

// ─── Sub-component: Game Card Row (Original Style) ──────────────────────────
function GameCardRow({ game, onClick }: { key?: Key; game: LotteryGame; onClick: () => void }) {
  const identity = getGameIdentity(game);
  const imageMap: Record<string, string> = {
    primitiva: primitivaJoy,
    bonoloto: joySecondary,
    gordo: primitivaJoyV2,
    quiniela: headerWinner,
    'loteria-nacional-jueves': loteriaJuevesLuck,
    'loteria-nacional-sabado': loteriaNacionalHero,
    'loteria-navidad': loteriaNavidadHero,
    'loteria-nino': primitivaJoyV2,
  };
  const image = imageMap[game.id] ?? joySecondary;
  const isNationalGame = game.id === 'loteria-nacional-jueves' || game.id === 'loteria-nacional-sabado';
  const imageFilter = isNationalGame
    ? 'grayscale(0.34) brightness(0.56) contrast(1.02)'
    : 'grayscale(0.82) brightness(0.5)';
  return (
    <PremiumTouchInteraction scale={0.97} className="w-full">
      <button
        onClick={onClick}
        className="weekly-game-card relative w-full overflow-hidden rounded-[1.35rem] border border-white/10 p-2.5 text-left shadow-md transition-all group"
      >
        <img
          src={image}
          alt={game.name}
          className="absolute inset-0 h-full w-full object-cover opacity-[0.15] transition-transform duration-700 group-hover:scale-105 pointer-events-none"
          style={{ filter: imageFilter }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: game.color, mixBlendMode: 'multiply', opacity: isNationalGame ? 0.74 : 0.8 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/18 to-transparent" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <GameBadge game={game} size="sm" tone="ghost" className="border-white/15 bg-white/10 shadow-[0_14px_28px_rgba(0,0,0,0.2)]" />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black leading-none text-white">{identity.shortName}</h3>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/68">
                {formatDrawTime(game.nextDraw)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="text-right">
              <p className="text-[15px] font-black leading-none text-manises-gold">
                {formatJackpot(game.jackpot, game.isMonthly)}
              </p>
              <p className="mt-0.5 text-[9.5px] font-semibold text-white/70">{formatCurrency(game.price)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2 shadow-[0_4px_12px_rgba(245,158,11,0.25)]">
              <span className="text-[9.5px] font-black uppercase tracking-wide text-slate-950">Jugar</span>
              <ChevronRight className="h-3 w-3 stroke-[3] text-slate-950" />
            </div>
          </div>
        </div>
      </button>
    </PremiumTouchInteraction>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const listAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemAnimation = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } }
};

export function GamesPage() {
  const navigate = useNavigate();
  const { games } = useLotteryGames();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter Christmas/Niño out of the main list as they are highlighted/seasonal
  const listGames = games.filter(g => g.id !== 'loteria-navidad' && g.id !== 'loteria-nino');

  // Hardcoded ordering corresponding to the mockup hierarchy
  const gameOrder = [
    'bonoloto',
    'eurodreams',
    'euromillones',
    'primitiva',
    'gordo',
    'quiniela',
    'loteria-nacional-jueves',
    'loteria-nacional-sabado'
  ];

  const sortedListGames = [...listGames].sort((a, b) => {
    return gameOrder.indexOf(a.id) - gameOrder.indexOf(b.id);
  });

  const euromillonesGame = games.find(g => g.id === 'euromillones');

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-background pb-8" ref={containerRef}>
      {/* 1. Ticker de avisos */}
      <NoticeTicker />

      {/* Main page content layout */}
      <motion.div
        variants={listAnimation}
        initial="hidden"
        animate="show"
        className="px-5 pt-4 flex flex-col gap-5"
      >
        {/* 2. Christmas Featured Banner */}
        <motion.div variants={itemAnimation}>
          <ChristmasCard onClick={() => navigate('/play/loteria-navidad')} />
        </motion.div>

        {/* 3. El Niño Featured Banner */}
        <motion.div variants={itemAnimation}>
          <NinoCard onClick={() => navigate('/play/loteria-nino')} />
        </motion.div>

        {/* 4. Euromillions Featured Banner */}
        {euromillonesGame && (
          <motion.div variants={itemAnimation}>
            <EuromillionsCard
              jackpot={euromillonesGame.jackpot}
              nextDraw={euromillonesGame.nextDraw}
              onClick={() => navigate('/play/euromillones')}
            />
          </motion.div>
        )}

        {/* 5. Todos los sorteos Title & Separator */}
        <motion.div variants={itemAnimation} className="mt-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-manises-blue/40 tracking-[0.25em] uppercase whitespace-nowrap">
              Todos los sorteos
            </span>
            <div className="h-[1px] bg-slate-100 flex-1" />
          </div>
        </motion.div>

        {/* 6. Todos los sorteos List (Original Card Grid style) */}
        <motion.div
          variants={listAnimation}
          className="grid grid-cols-1 gap-2"
        >
          {sortedListGames.map((game) => (
            <motion.div
              key={game.id}
              variants={itemAnimation}
            >
              <GameCardRow
                game={game}
                onClick={() => navigate(`/play/${game.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-center text-[9px] text-manises-blue/20 font-black uppercase tracking-[0.3em] mt-8 mb-4">
        Juego Responsable · +18 · Lotería Manises
      </p>
    </div>
  );
}
