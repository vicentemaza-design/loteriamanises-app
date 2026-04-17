import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Key } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  CreditCard, 
  Lock,
  Sparkles,
  Clock,
  Calendar,
  BriefcaseBusiness,
  Landmark,
  BadgeCheck,
  Download,
} from 'lucide-react';
import { formatJackpot, formatDrawTime, formatCurrency, getCountdown } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import { GameIcon } from '@/shared/ui/GameIcon';
import { ScannerModal } from '@/shared/ui/ScannerModal';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useInstallPrompt } from '@/shared/hooks/useInstallPrompt';
import { useLotteryGames } from '@/shared/hooks/useLotteryGames';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useMemo, useRef, useState } from 'react';

// Assets
import headerWinner from '@/assets/images/header_winner.jpg';
import primitivaJoy from '@/assets/images/primitiva_joy.png';
import primitivaJoyV2 from '@/assets/images/primitiva_joy_v2.jpg';
import joySecondary from '@/assets/images/joy_secondary.png';
import loteriaNacionalHero from '@/assets/images/loteria_nacional.jpg';
import quinielaHero from '@/assets/quiniela_hero.jpg';
import adminFacade from '@/assets/images/administracion_manises.webp';

/**
 * ⚠️ BACKEND INTEGRATION POINT: OFFICIAL_PENAS
 * Reemplazar por: GET /api/penas → Pena[]
 */
const OFFICIAL_PENAS = [
  { id: 'pena-euro', name: 'Peña Euromillones', jackpot: '130M €', price: 10, color: '#2563eb' },
  { id: 'pena-prim', name: 'Peña Primitiva', jackpot: '12M €', price: 5, color: '#16a34a' },
];

const TRUST_ITEMS = [
  { icon: Shield, label: 'Pago Seguro\n100% SSL' },
  { icon: CreditCard, label: 'Sin\nComisiones' },
  { icon: Lock, label: 'Privacidad\nGarantizada' },
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
  const imageByGameId: Record<string, string> = {
    primitiva: primitivaJoy,
    bonoloto: joySecondary,
    'loteria-nacional': loteriaNacionalHero,
    quiniela: quinielaHero,
    gordo: primitivaJoyV2,
    'loteria-navidad': headerWinner,
    'loteria-nino': primitivaJoyV2,
  };
  const image = imageByGameId[game.id] ?? joySecondary;
  const cd = getCountdown(game.nextDraw);
  const isNationalLottery = game.id === 'loteria-nacional';
  const imageStyle = isNationalLottery
    ? { filter: 'grayscale(0.18) brightness(0.68) contrast(1.08)' }
    : { filter: 'grayscale(0.4) brightness(0.54) contrast(1.04)' };
  const imageOpacity = isNationalLottery ? 0.52 : 0.4;
  const colorOverlayOpacity = isNationalLottery ? 0.5 : 0.62;

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

        <div className="relative h-full p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <GameIcon
              gameType={game.type}
              variant="white"
              className="w-7 h-7 drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]"
            />
            {cd.isPast ? (
              <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Sorteo pasado</span>
            ) : (
              <span className="text-[9px] font-black text-white/60 uppercase tracking-tighter">
                {formatDrawTime(game.nextDraw)}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-black text-white tracking-tight leading-none mb-1">{game.name}</h3>
            <p className="text-[14px] font-black text-manises-gold tabular-nums">
              {formatJackpot(game.jackpot, game.isMonthly)}
            </p>
          </div>
        </div>
      </button>
    </PremiumTouchInteraction>
  );
}

// ─── Sub-component: PenaCard ─────────────────────────────────────────────────
function PenaCard({ pena, onClick }: { key?: Key; pena: typeof OFFICIAL_PENAS[0]; onClick: () => void }) {
  return (
    <PremiumTouchInteraction scale={0.97}>
      <div
        onClick={onClick}
        className="pena-card flex-shrink-0 w-44 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm transition-all group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white mb-3 shadow-md" style={{ backgroundColor: pena.color }}>
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <h3 className="font-black text-manises-blue text-xs mb-0.5">{pena.name}</h3>
        <p className="text-[9px] font-bold text-manises-gold uppercase tracking-wider mb-3">{pena.jackpot}</p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs font-black text-manises-blue">{formatCurrency(pena.price)}</span>
          <ArrowRight className="w-3 h-3 text-manises-blue/30" />
        </div>
      </div>
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
          glow: 'rgba(245,197,24,0.12)',
          border: 'border-manises-gold/20',
          overlay: 'bg-[linear-gradient(135deg,rgba(10,71,146,0.85)_0%,rgba(10,71,146,0.65)_50%,rgba(212,160,23,0.1)_100%)]'
        }
      : accent === 'blue'
      ? {
          badge: 'bg-sky-500/20 text-sky-100 border border-sky-400/30',
          cta: 'bg-white/10 text-white backdrop-blur-md border border-white/20',
          glow: 'rgba(56,189,248,0.12)',
          border: 'border-sky-400/20',
          overlay: 'bg-[linear-gradient(135deg,rgba(8,61,125,0.9)_0%,rgba(10,71,146,0.75)_40%,rgba(13,86,176,0.25)_100%)]'
        }
      : {
          badge: 'bg-indigo-500/20 text-indigo-100 border border-indigo-400/30',
          cta: 'bg-indigo-500 text-white',
          glow: 'rgba(99,102,241,0.12)',
          border: 'border-indigo-400/20',
          overlay: 'bg-[linear-gradient(135deg,rgba(10,71,146,0.95)_0%,rgba(67,56,202,0.75)_40%,rgba(99,102,241,0.3)_100%)]'
        };

  return (
    <PremiumTouchInteraction scale={0.985}>
      <button
        type="button"
        onClick={onClick}
        className={`premium-editorial-card group relative overflow-hidden rounded-[2.25rem] border ${accentClasses.border} text-left shadow-[0_22px_65px_-12px_rgba(0,0,0,0.4)] transition-all duration-500`}
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

        <div className="relative flex min-h-[300px] flex-col justify-between p-7 text-white md:min-h-[260px]">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md shadow-inner ${accentClasses.badge}`}>
                <Icon className="h-3.5 w-3.5" />
                {badge}
              </span>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md md:flex">
                <BadgeCheck className="h-3.5 w-3.5 text-white/50" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/60">
                  Gestion premium
                </span>
              </div>
            </div>

            <div className="max-w-[19rem] space-y-3">
              <h3 className="text-[1.8rem] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm">
                {title}
              </h3>
              <p className="text-[13px] font-medium leading-relaxed text-white/70">
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
            <span className={`inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-extrabold shadow-lg transition-all active:scale-95 ${accentClasses.cta}`}>
              {cta}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
        
        {/* Shine effect overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
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

  // Los 4 juegos del bento (excluye el featured)
  const bentoGames = useMemo(
    () => {
      const baseGames = upcomingGames.filter((game) => game.id !== featuredGame.id);
      const firstFour = baseGames.slice(0, 4);

      const eurodreamsIndex = firstFour.findIndex((game) => game.id === 'eurodreams');
      if (eurodreamsIndex === -1) return firstFour;

      const loteriaNacional = baseGames.find((game) => game.id === 'loteria-nacional');
      if (!loteriaNacional) return firstFour;

      const alreadyIncluded = firstFour.some((game) => game.id === 'loteria-nacional');
      if (alreadyIncluded) {
        return firstFour.filter((game) => game.id !== 'eurodreams');
      }

      const updated = [...firstFour];
      updated[eurodreamsIndex] = loteriaNacional;
      return updated;
    },
    [upcomingGames, featuredGame]
  );

  useGSAP(() => {
    const greeting = gsap.utils.toArray<HTMLElement>('.home-greeting');
    const hero = gsap.utils.toArray<HTMLElement>('.hero-card');
    const heroParts = gsap.utils.toArray<HTMLElement>('.hero-badge, .hero-timer, .hero-title, .hero-tagline, .hero-box');
    const gameCards = gsap.utils.toArray<HTMLElement>('.game-card');
    const editorialCards = gsap.utils.toArray<HTMLElement>('.premium-editorial-card');
    const penaCards = gsap.utils.toArray<HTMLElement>('.pena-card');

    gsap.set(greeting, { y: 12, autoAlpha: 0 });
    gsap.set(hero, { y: 16, scale: 0.985, autoAlpha: 0 });
    gsap.set(heroParts, { y: 10, autoAlpha: 0 });
    gsap.set(gameCards, { y: 12, autoAlpha: 0 });
    gsap.set(editorialCards, { y: 18, autoAlpha: 0 });
    gsap.set(penaCards, { x: 10, autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl
      .to(greeting, { y: 0, autoAlpha: 1, duration: 0.34 })
      .to(hero, { y: 0, scale: 1, autoAlpha: 1, duration: 0.46 }, '-=0.16')
      .to(heroParts, { y: 0, autoAlpha: 1, duration: 0.32, stagger: 0.05 }, '-=0.2')
      .to(gameCards, { y: 0, autoAlpha: 1, duration: 0.32, stagger: 0.055 }, '-=0.16')
      .to(editorialCards, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08 }, '-=0.1')
      .to(penaCards, { x: 0, autoAlpha: 1, duration: 0.32, stagger: 0.055 }, '-=0.14');
  }, { scope: containerRef });

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <div className="flex min-h-full flex-col gap-6 overflow-x-hidden bg-background" ref={containerRef}>

      {/* ── Greeting ────────────────────────────────────────────── */}
      {profile && (
        <section className="px-5 pt-4 home-greeting">
          <h1 className="text-2xl font-black text-manises-blue tracking-tight">
            Hola, {profile.displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            ¡Que tengas mucha suerte hoy!
          </p>
        </section>
      )}

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="px-4 pt-1">
        <div className="hero-card relative h-[460px] rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all duration-500">
          {/* Background — foto de ganadores a sangre completa */}
          <div className="absolute inset-0">
            <img
              src={headerWinner}
              alt="Lotería Manises"
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </div>

          <div className="relative h-full p-8 flex flex-col">

            {/* Top Row */}
            <div className="flex items-start justify-between mb-auto">
              <span className="hero-badge px-3 py-1.5 rounded-full bg-manises-gold text-manises-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                <Sparkles className="w-3 h-3 fill-current" />
                Sorteo Maestre
              </span>
              <div className="hero-timer">
                <HeroTimeChip iso={featuredGame.nextDraw} />
              </div>
            </div>

            {/* Middle — título + tagline */}
            <div className="mb-6">
              <h1 className="hero-title text-4xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-lg">
                {featuredGame.name}
              </h1>
              <p className="hero-tagline text-white/80 text-[13px] font-bold tracking-tight max-w-[200px] leading-tight">
                {featuredGame.description ?? 'El bote que puede cambiar tu vida para siempre.'}
              </p>
            </div>

            {/* Bottom — caja glassmorphism con bote + CTA */}
            <div className="hero-box bg-black/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl flex flex-col items-center text-center">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Bote Estimado</p>
              <div className="mb-6">
                <HeroJackpot jackpot={featuredGame.jackpot} isMonthly={featuredGame.isMonthly} />
              </div>
              <PremiumTouchInteraction scale={0.97} className="w-full">
                <Button
                  onClick={() => navigate(`/play/${featuredGame.id}`)}
                  className="w-full h-14 bg-white text-manises-blue hover:bg-manises-gold hover:text-white font-black rounded-2xl shadow-xl transition-all gap-2 text-base"
                >
                  Jugar Ahora <ArrowRight className="w-5 h-5" />
                </Button>
              </PremiumTouchInteraction>
            </div>
          </div>
        </div>
      </section>

      {!isInstalled && (canInstall || shouldShowIosHint) && (
        <section className="px-4">
          <div className="surface-neo-soft rounded-[2rem] border border-white/70 p-4 shadow-[0_14px_28px_rgba(10,25,47,0.08)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-manises-blue text-white shadow-manises">
                <Download className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-manises-blue/45">
                  Demo PWA
                </p>
                <h2 className="text-base font-black tracking-tight text-manises-blue text-balance">
                  Instala la app para probarla como experiencia móvil real
                </h2>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-muted-foreground">
                  {canInstall
                    ? 'Añádela al inicio para revisar safe areas, navegación inferior y sensación de app instalada.'
                    : 'En iPhone abre Compartir y pulsa “Añadir a pantalla de inicio”.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {canInstall ? (
                <PremiumTouchInteraction scale={0.98}>
                  <Button
                    onClick={handleInstall}
                    className="h-11 rounded-xl bg-manises-blue px-5 font-bold text-white hover:bg-manises-blue/90"
                  >
                    Instalar App
                  </Button>
                </PremiumTouchInteraction>
              ) : (
                <div className="rounded-xl bg-manises-blue/6 px-4 py-2 text-[11px] font-semibold text-manises-blue">
                  Safari → Compartir → Añadir a pantalla de inicio
                </div>
              )}

              <span className="text-[10px] font-bold uppercase tracking-wider text-manises-blue/35">
                Demo sin offline
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Bento: Próximos Sorteos ───────────────────────────── */}
      {bentoGames.length > 0 && (
        <section className="px-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-manises-blue" />
              <h2 className="text-xs font-black text-manises-blue uppercase tracking-widest">Próximos Sorteos</h2>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1"
            >
              Ver todos <TrendingUp className="w-3 h-3" />
            </button>
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
      <section className="space-y-4 px-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-manises-blue" />
            <h2 className="text-xs font-black uppercase tracking-widest text-manises-blue">Servicios Premium</h2>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-manises-blue/40">
            Gestion avanzada
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <PremiumEditorialCard
            badge="B2B Navidad"
            title="Loteria de Navidad para Empresas"
            description="Gestiona participaciones, reparto interno y seguimiento de cobros con una experiencia pensada para equipos, asociaciones y campanas corporativas."
            cta="Abrir modulo empresas"
            image={adminFacade}
            imageAlt="Servicio premium para empresas"
            icon={BriefcaseBusiness}
            accent="blue"
            stats={['Participaciones digitales', 'Seguimiento de cobros', 'Soporte dedicado']}
            onClick={() => navigate('/profile/companies')}
          />

          <PremiumEditorialCard
            badge="Numero Fiel"
            title="Abonarte a un numero de loteria"
            description="Convierte tu numero favorito en un abono estable y deja preparada la renovacion automatica para no perder nunca tu combinacion de referencia."
            cta="Ver abonos disponibles"
            image={loteriaNacionalHero}
            imageAlt="Abonos a numero de loteria"
            icon={Landmark}
            accent="gold"
            stats={['Numero persistente', 'Cobro recurrente', 'Control semanal']}
            onClick={() => navigate('/profile/subscriptions')}
          />
        </div>
      </section>

      {/* ── Peñas Oficiales ───────────────────────────────────── */}
      <section className="space-y-3 px-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-manises-blue" />
            <h2 className="text-xs font-black text-manises-blue uppercase tracking-widest">Peñas Oficiales</h2>
          </div>
          <button className="text-[9px] font-black text-muted-foreground uppercase">Ver todas</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {OFFICIAL_PENAS.map(pena => (
            <PenaCard
              key={pena.id}
              pena={pena}
              onClick={() => navigate(`/play/${pena.id}`)}
            />
          ))}
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────── */}
      <section className="mt-auto px-6 pt-2">
        <div className="flex items-center justify-around gap-4 border-t border-gray-100 pt-5">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center opacity-60">
              <Icon className="w-4 h-4 text-manises-blue" />
              <span className="text-[8px] font-black text-manises-blue uppercase tracking-tighter leading-tight whitespace-pre-line">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-[9px] text-manises-blue/20 font-black uppercase tracking-[0.3em] mt-2">
        Juego Responsable · +18 · Lotería Manises
      </p>

      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}
