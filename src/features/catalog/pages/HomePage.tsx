import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Key } from 'react';
import {
  ArrowRight,
  Group as Users,
  Shield,
  Wallet as CreditCard,
  Lock,
  Sparks as Sparkles,
  Timer as Clock,
  Suitcase as BriefcaseBusiness,
  Safe as Landmark,
  ShieldCheck as BadgeCheck,
  Download,
  Flash as Zap,
  Calendar,
  Trophy,
} from 'iconoir-react/regular';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { getDeliveredPrizeHighlights, getDeliveredPrizesTotalAmount } from '../data/delivered-prizes.mock';
import { formatJackpot, formatDrawTime, formatCurrency, getCountdown } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import { GameIcon } from '@/shared/ui/GameIcon';
import { ScannerModal } from '@/shared/ui/ScannerModal';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useInstallPrompt } from '@/shared/hooks/useInstallPrompt';
import { useLotteryGames } from '@/shared/hooks/useLotteryGames';
import { getGameIdentity } from '@/shared/lib/game-identity';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useMemo, useRef, useState } from 'react';

// Assets
import headerWinner from '@/assets/images/header_winner.jpg';
import primitivaJoy from '@/assets/images/primitiva_joy.png';
import primitivaJoyV2 from '@/assets/images/primitiva_joy_v2.jpg';
import joySecondary from '@/assets/images/joy_secondary.png';
import loteriaNacionalHero from '@/assets/images/loteria_nacional.jpg';
import loteriaJuevesLuck from '@/assets/images/loteria_jueves_luck.jpg';
import loteriaNavidadHero from '@/assets/images/loteria_navidad_hero.jpg';
import quinielaHero from '@/assets/quiniela_hero.jpg';
import adminFacade from '@/assets/images/administracion_manises.webp';

/**
 * ⚠️ BACKEND INTEGRATION POINT: FEATURED_PENAS
 * Reemplazar por: GET /api/penas → Pena[]
 */
const FEATURED_PENAS = [
  { id: 'pena-euro', name: 'Peña Euromillones', jackpot: '130M €', price: 10, color: '#2563eb' },
  { id: 'pena-prim', name: 'Peña Primitiva', jackpot: '12M €', price: 5, color: '#16a34a' },
];

const TRUST_ITEMS = [
  { icon: Shield, label: 'Pago Seguro\n100% SSL' },
  { icon: CreditCard, label: 'Sin\nComisiones' },
  { icon: Lock, label: 'Privacidad\nProtegida' },
];

// ─── Sub-component: HeroTimeChip ─────────────────────────────────────────────
function HeroTimeChip({ iso }: { iso: string }) {
  const cd = getCountdown(iso);

  if (cd.isPast) {
    return (
      <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span className="w-1.5 h-1.5 bg-manises-gold rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-white uppercase tracking-tighter">En curso</span>
      </div>
    );
  }

  const label = cd.days > 0
    ? `${cd.days}d ${cd.hours}h`
    : cd.hours > 0
    ? `${cd.hours}h ${cd.minutes}m`
    : `${cd.minutes}m`;

  return (
    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
      <Clock className="w-3 h-3 text-white/70" />
      <span className="text-[10px] font-black text-white uppercase tracking-tighter">{label}</span>
    </div>
  );
}

// ─── Sub-component: HeroJackpot ──────────────────────────────────────────────
function HeroJackpot({ jackpot, isMonthly }: { jackpot: number; isMonthly?: boolean }) {
  if (isMonthly) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-black text-manises-gold tracking-tighter">
          {jackpot.toLocaleString('es-ES')}
        </span>
        <span className="text-lg font-black text-manises-gold">€/mes</span>
      </div>
    );
  }

  if (jackpot >= 1_000_000) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-6xl font-black text-manises-gold tracking-tighter">
          {Math.floor(jackpot / 1_000_000)}
        </span>
        <span className="text-xl font-black text-manises-gold">Millones €</span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-5xl font-black text-manises-gold tracking-tighter">
        {jackpot.toLocaleString('es-ES')}
      </span>
      <span className="text-lg font-black text-manises-gold">€</span>
    </div>
  );
}

// ─── Sub-component: BentoGameCard ────────────────────────────────────────────
function BentoGameCard({ game, onClick }: { key?: Key; game: ReturnType<typeof useLotteryGames>['games'][0]; onClick: () => void }) {
  const identity = getGameIdentity(game);
  const imageByGameId: Record<string, string> = {
    primitiva: primitivaJoy,
    bonoloto: joySecondary,
    'loteria-nacional-jueves': loteriaJuevesLuck,
    'loteria-nacional-sabado': loteriaNacionalHero,
    quiniela: quinielaHero,
    gordo: primitivaJoyV2,
    'loteria-navidad': loteriaNavidadHero,
    'loteria-nino': primitivaJoyV2,
  };
  const image = imageByGameId[game.id] ?? joySecondary;
  const cd = getCountdown(game.nextDraw);
  const isNationalLottery = game.id.includes('loteria-nacional') || game.type === 'navidad' || game.type === 'nino';
  const imageStyle = isNationalLottery
    ? { filter: 'grayscale(0.1) brightness(0.7) contrast(1.06)' }
    : { filter: 'grayscale(0.44) brightness(0.52) contrast(1.03)' };
  const imageOpacity = isNationalLottery ? 0.46 : 0.34;
  const colorOverlayOpacity = isNationalLottery ? 0.54 : 0.66;

  return (
    <PremiumTouchInteraction scale={0.96}>
      <button
        onClick={onClick}
        className="game-card relative h-48 rounded-[1.75rem] overflow-hidden group shadow-md transition-all text-left w-full"
      >
        <img
          src={image}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-30"
          style={{ ...imageStyle, opacity: imageOpacity }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: game.color, mixBlendMode: 'multiply', opacity: colorOverlayOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/32 to-transparent" />

        <div className="relative h-full p-4.5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <GameIcon
              gameType={game.type}
              variant="white"
              className="w-7 h-7 opacity-85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
            />
            {cd.isPast ? (
              <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/42 backdrop-blur-sm whitespace-nowrap">
                Pasado
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm whitespace-nowrap">
                {formatDrawTime(game.nextDraw).replace(' · ', ' ')}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-[1.12rem] font-black text-white tracking-tight leading-none mb-1.5">{identity.shortName}</h3>
            <div className="flex items-end gap-2.5 text-[11px]">
              <p className="font-black text-manises-gold tabular-nums leading-none">
                {formatJackpot(game.jackpot, game.isMonthly)}
              </p>
              <span className="pb-[1px] text-white/24">·</span>
              <p className="pb-[1px] font-semibold text-white/74">{formatCurrency(game.price)}</p>
            </div>
          </div>
        </div>
      </button>
    </PremiumTouchInteraction>
  );
}

// ─── Sub-component: PenaCompactCard ──────────────────────────────────────────
interface PenaCompactProps {
  key?: string | number;
  title: string;
  jackpot: string;
  price: number;
  color: string;
  onClick: () => void | Promise<void>;
}

function PenaCompactCard({ title, jackpot, price, color, onClick }: PenaCompactProps) {
  return (
    <PremiumTouchInteraction scale={0.98}>
      <article 
        onClick={onClick}
        className="flex min-w-[280px] items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100 cursor-pointer group hover:border-manises-blue/20 transition-all font-sans"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: color }}>
            <Users className="w-5 h-5 fill-current/20" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-tight">{title}</h3>
            <span className="mt-1 inline-block rounded-md bg-manises-gold/15 px-2 py-0.5 text-[10px] font-black text-amber-700 uppercase tracking-wider">
              BOTE: {jackpot}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Participa</span>
            <span className="text-base font-black text-manises-blue">{formatCurrency(price)}</span>
          </div>
          <button className="text-[10px] font-black text-manises-blue/40 uppercase tracking-widest flex items-center gap-1 group-hover:text-manises-blue transition-colors">
            Jugar <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </article>
    </PremiumTouchInteraction>
  );
}

function DeliveredPrizeHighlightCard({
  title,
  amount,
  label,
  description,
  onClick,
}: {
  key?: Key;
  title: string;
  amount: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <PremiumTouchInteraction scale={0.985}>
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-[1.45rem] border border-emerald-100 bg-white p-3.5 text-left shadow-sm transition-all hover:border-emerald-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
              {label}
            </span>
            <h3 className="mt-2 truncate text-[15px] font-black text-manises-blue">
              {title}
            </h3>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Trophy className="h-4.5 w-4.5 text-emerald-600" />
          </div>
        </div>

        <p className="mt-2.5 text-[17px] font-black tracking-tight text-emerald-600">
          {amount}
        </p>
        <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500 line-clamp-2">
          {description}
        </p>
      </button>
    </PremiumTouchInteraction>
  );
}

function PremiumEditorialCard({
  badge,
  title,
  description,
  cta,
  image,
  imageAlt,
  onClick,
  accent = 'gold',
  icon: Icon,
  stats,
}: {
  badge: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  imageAlt: string;
  onClick: () => void;
  accent?: 'gold' | 'blue' | 'indigo';
  icon: typeof BriefcaseBusiness;
  stats: string[];
}) {
  const accentClasses =
    accent === 'gold'
      ? {
          badge: 'bg-manises-gold text-manises-blue',
          cta: 'bg-manises-gold/90 text-manises-blue backdrop-blur-md border border-white/20',
          glow: 'rgba(245,197,24,0.16)',
          border: 'border-manises-gold/20',
          overlay: 'bg-[linear-gradient(135deg,rgba(68,38,0,0.92)_0%,rgba(100,56,0,0.70)_48%,rgba(245,197,24,0.07)_100%)]'
        }
      : accent === 'blue'
      ? {
          badge: 'bg-sky-500/20 text-sky-100 border border-sky-400/30',
          cta: 'bg-white/10 text-white backdrop-blur-md border border-white/20',
          glow: 'rgba(56,189,248,0.12)',
          border: 'border-sky-400/20',
          overlay: 'bg-[linear-gradient(135deg,rgba(10,71,146,0.96)_0%,rgba(8,63,132,0.85)_40%,rgba(10,71,146,0.3)_100%)]'
        }
      : {
          badge: 'bg-indigo-500/20 text-indigo-100 border border-indigo-400/30',
          cta: 'bg-indigo-500 text-white',
          glow: 'rgba(99,102,241,0.12)',
          border: 'border-indigo-400/20',
          overlay: 'bg-[linear-gradient(135deg,rgba(10,71,146,0.98)_0%,rgba(8,63,132,0.88)_40%,rgba(10,71,146,0.4)_100%)]'
        };

  return (
    <PremiumTouchInteraction scale={0.985}>
      <button
        type="button"
        onClick={onClick}
        className={`premium-editorial-card group relative overflow-hidden rounded-[2rem] border ${accentClasses.border} text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.32)] transition-all duration-500`}
      >
        <div className="absolute inset-0">
          <img
            src={image}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
          />
          <div className={`absolute inset-0 ${accentClasses.overlay}`} />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 82% 18%, ${accentClasses.glow} 0%, rgba(255,255,255,0) 45%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0.02)_100%)]" />
        </div>

        <div className="relative flex min-h-[210px] xs:min-h-[230px] md:min-h-[280px] flex-col justify-between p-4.5 md:p-7 text-white">
          <div className="space-y-3.5 md:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md shadow-inner ${accentClasses.badge}`}>
                <Icon className="h-3.5 w-3.5" />
                {badge}
              </span>
            </div>

            <div className="max-w-[19rem] space-y-1.5 md:space-y-2.5">
              <h3 className="text-[1.35rem] xs:text-[1.65rem] font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-sm">
                {title}
              </h3>
              <p className="text-[11px] xs:text-[12px] font-medium leading-relaxed text-white/70 line-clamp-2">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {stats.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-lg"
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-2">
              <span className={`inline-flex h-10 items-center gap-2 rounded-2xl px-5 text-[13px] font-extrabold shadow-lg transition-all active:scale-95 ${accentClasses.cta}`}>
                {cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
      </button>
    </PremiumTouchInteraction>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function HomePage() {
  const navigate = useNavigate();
  const { featuredGame, upcomingGames } = useLotteryGames();
  const { profile } = useAuth();
  const { canInstall, isInstalled, shouldShowIosHint, promptInstall } = useInstallPrompt();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const deliveredPrizeHighlights = useMemo(() => getDeliveredPrizeHighlights(2), []);
  const deliveredPrizesTotalAmount = useMemo(() => getDeliveredPrizesTotalAmount(), []);

  // Los juegos destacados en el bento (priorizamos los nacionales e inmediatos)
  const bentoGames = useMemo(() => {
    const baseGames = upcomingGames.filter((game) => game.id !== featuredGame.id);
    
    // Priorizamos Primitiva y Bonoloto primero, luego los nacionales
    const priorityIds = ['primitiva', 'bonoloto', 'loteria-nacional-jueves', 'loteria-nacional-sabado', 'loteria-navidad', 'loteria-nino'];
    const priorityGames = baseGames.filter(g => priorityIds.includes(g.id))
      .sort((a, b) => priorityIds.indexOf(a.id) - priorityIds.indexOf(b.id));
    const otherGames = baseGames.filter(g => !priorityIds.includes(g.id));
    
    // Combinamos mostrando primero los de prioridad
    return [...priorityGames, ...otherGames].slice(0, 6); // Ampliamos a 6 para dar cabida a la nueva oferta
  }, [upcomingGames, featuredGame]);

  useGSAP(() => {
    const sections = gsap.utils.toArray<HTMLElement>('section, .home-greeting');
    gsap.set(sections, { y: 15, autoAlpha: 0 });
    gsap.to(sections, { 
      y: 0, 
      autoAlpha: 1, 
      duration: 0.5, 
      stagger: 0.08, 
      ease: 'power3.out',
      delay: 0.1 
    });
  }, { scope: containerRef });

  return (
    <div className="flex min-h-full flex-col gap-4.5" ref={containerRef}>

      {/* ── Greeting ────────────────────────────────────────────── */}
      <section className="home-greeting px-5 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.45rem] font-black leading-none tracking-tight text-manises-blue">
              {profile ? `Hola, ${profile.displayName.split(' ')[0]} 👋` : 'Lotería Manises 🍀'}
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {profile ? '¡Que tengas mucha suerte hoy!' : 'Tu administración en demo'}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white text-manises-blue shadow-sm">
            <BadgeCheck className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* ── Announcement Banner ───────────────────────────────── */}
      <AnnouncementBanner />

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="px-4">
        <div className="hero-card group relative h-[448px] overflow-hidden rounded-[2.15rem] shadow-xl shadow-manises/10 transition-all duration-500">
          <div className="absolute inset-0">
            <img
              src={headerWinner}
              alt="Lotería Manises"
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            {/* Overlay para contraste - Solución sugerida en auditoría */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,71,146,0.92)_0%,rgba(10,71,146,0.5)_40%,transparent_100%)]" />
          </div>
 
          <div className="relative flex h-full flex-col px-5 pb-5 pt-5.5">
            <div className="flex items-start justify-between gap-3">
              <span className="hero-badge flex items-center gap-2 rounded-full bg-manises-gold px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-manises-blue shadow-lg">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Sorteo destacado
              </span>
              <HeroTimeChip iso={featuredGame.nextDraw} />
            </div>
 
            <div className="mt-9 max-w-[15rem] space-y-3">
              <h1 className="hero-title text-[2.2rem] font-black leading-[0.9] tracking-tighter text-white drop-shadow-md">
                {featuredGame.name}
              </h1>
              <p className="hero-tagline max-w-[14rem] text-[12px] font-bold leading-[1.4] tracking-tight text-white/78">
                {featuredGame.description ?? 'El bote que puede cambiar tu vida para siempre.'}
              </p>
            </div>
 
            <div className="hero-box mt-auto max-w-[20rem] rounded-[1.7rem] border border-white/16 bg-white/8 p-4 shadow-2xl backdrop-blur-2xl">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/56">Bote Estimado</p>
              <div className="mt-2">
                <HeroJackpot jackpot={featuredGame.jackpot} isMonthly={featuredGame.isMonthly} />
              </div>
              <PremiumTouchInteraction scale={0.97} className="mt-4 w-full">
                <Button
                  onClick={() => navigate(`/play/${featuredGame.id}`)}
                  className="h-12 w-full gap-2 rounded-2xl bg-white text-sm font-black text-manises-blue shadow-xl transition-all hover:bg-manises-gold hover:text-white"
                >
                  Jugar Ahora <ArrowRight className="w-5 h-5" />
                </Button>
              </PremiumTouchInteraction>
            </div>
          </div>
        </div>
      </section>

      {/* ── Peñas Destacadas ─────────────────────────────────── */}
      <section className="space-y-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-manises-blue/5 p-1.5 rounded-lg">
              <Users className="w-4 h-4 text-manises-blue" />
            </div>
            <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Peñas destacadas</h2>
          </div>
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ver todas</button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          {FEATURED_PENAS.map(pena => (
            <PenaCompactCard
              key={pena.id}
              title={pena.name}
              jackpot={pena.jackpot}
              price={pena.price}
              color={pena.color}
              onClick={() => navigate(`/play/${pena.id}`)}
            />
          ))}
        </div>
      </section>

      {/* ── Premios Destacados ──────────────────────────────── */}
      {deliveredPrizeHighlights.length > 0 && (
        <section className="space-y-3 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-50 p-1.5 rounded-lg">
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Premios destacados</h2>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Contenido informativo demo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/premios-entregados')}
              className="text-[10px] font-black text-emerald-700 uppercase tracking-widest"
            >
              Ver más
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {deliveredPrizeHighlights.map((prize) => (
              <DeliveredPrizeHighlightCard
                key={prize.id}
                title={prize.game}
                amount={formatCurrency(prize.amount)}
                label={prize.highlightLabel}
                description={prize.description}
                onClick={() => navigate('/premios-entregados')}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Bento: Próximos Sorteos ───────────────────────────── */}
      {bentoGames.length > 0 && (
        <section className="space-y-3 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-manises-blue/5 p-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-manises-blue" />
              </div>
              <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Próximos Sorteos</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {bentoGames.map(game => (
              <BentoGameCard
                key={game.id}
                game={game}
                onClick={() => navigate(`/play/${game.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Editorial Premium ─────────────────────────────────── */}
      <section className="space-y-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-manises-blue/5 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-manises-blue" />
            </div>
            <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Servicios Premium</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <PremiumEditorialCard
            badge="PARA EMPRESAS"
            title="Lotería de Navidad para empresas"
            description="Gestiona participaciones y reparto interno con una experiencia pensada para equipos."
            cta="Módulo empresas"
            image={adminFacade}
            imageAlt="Servicio premium para empresas"
            icon={BriefcaseBusiness}
            accent="blue"
            stats={['Digital', 'Soporte']}
            onClick={() => navigate('/profile/companies')}
          />
          <PremiumEditorialCard
            badge="Número Fiel"
            title="Abónate a tu número"
            description="Convierte tu número favorito en un abono estable y olvídate de renovar cada semana."
            cta="Ver abonos"
            image={loteriaNacionalHero}
            imageAlt="Abonos a número de lotería"
            icon={Landmark}
            accent="gold"
            stats={['Persistente', 'Semanal']}
            onClick={() => navigate('/profile/subscriptions')}
          />
        </div>
      </section>

      {/* ── Premios Entregados Widget ─────────────────────────── */}
      <section className="px-5">
        <PremiumTouchInteraction scale={0.98}>
          <button
            type="button"
            onClick={() => navigate('/premios-entregados')}
            className="group flex w-full items-center gap-3 rounded-[1.45rem] border border-emerald-100 bg-emerald-50 p-3.5 text-left transition-all hover:border-emerald-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
              <Trophy className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Premios entregados
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-emerald-900">
                {(deliveredPrizesTotalAmount / 1_000_000).toFixed(1)}M € en premios destacados
              </p>
              <p className="text-[10px] text-emerald-700/60 font-medium">
                Abrir módulo demo e informativo
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600/50 group-hover:text-emerald-600 transition-colors" />
          </button>
        </PremiumTouchInteraction>
      </section>

      {/* ── Footer Info ───────────────────────────────────────── */}
      <footer className="mt-2 px-8 pb-10 text-center">
        <div className="mb-6 flex justify-center gap-5 opacity-40">
          <Shield className="w-5 h-5 text-manises-blue" />
          <CreditCard className="w-5 h-5 text-manises-blue" />
          <Lock className="w-5 h-5 text-manises-blue" />
        </div>
        <p className="text-[10px] text-manises-blue/25 font-black uppercase tracking-[0.35em]">
          Contenido Demo · Lotería Manises
        </p>
      </footer>

      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}
