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
} from 'iconoir-react/regular';
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
import loteriaJuevesLuck from '@/assets/images/loteria_jueves_luck.jpg';
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
    'loteria-nacional-jueves': loteriaJuevesLuck,
    'loteria-nacional-sabado': loteriaNacionalHero,
    quiniela: quinielaHero,
    gordo: primitivaJoyV2,
    'loteria-navidad': headerWinner,
    'loteria-nino': primitivaJoyV2,
  };
  const image = imageByGameId[game.id] ?? joySecondary;
  const cd = getCountdown(game.nextDraw);
  const isNationalLottery = game.id.includes('loteria-nacional') || game.type === 'navidad' || game.type === 'nino';
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
          overlay: 'bg-[linear-gradient(135deg,rgba(10,71,146,0.92)_0%,rgba(8,63,132,0.75)_50%,rgba(213,227,242,0.12)_100%)]'
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

        <div className="relative flex min-h-[240px] xs:min-h-[260px] md:min-h-[300px] flex-col justify-between p-5 md:p-8 text-white">
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-md shadow-inner ${accentClasses.badge}`}>
                <Icon className="h-3.5 w-3.5" />
                {badge}
              </span>
            </div>

            <div className="max-w-[19rem] space-y-2 md:space-y-3">
              <h3 className="text-[1.5rem] xs:text-[1.8rem] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm">
                {title}
              </h3>
              <p className="text-[12px] xs:text-[13px] font-medium leading-relaxed text-white/70 line-clamp-2">
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

  // Los juegos destacados en el bento (priorizamos los nacionales e inmediatos)
  const bentoGames = useMemo(() => {
    const baseGames = upcomingGames.filter((game) => game.id !== featuredGame.id);
    
    // Priorizamos Jueves, Sábado, Navidad y Niño para que siempre aparezcan si están activos
    const priorityIds = ['loteria-nacional-jueves', 'loteria-nacional-sabado', 'loteria-navidad', 'loteria-nino'];
    const priorityGames = baseGames.filter(g => priorityIds.includes(g.id));
    const otherGames = baseGames.filter(g => !priorityIds.includes(g.id));
    
    // Combinamos mostrando primero los de prioridad (hasta 4 o más si queremos expandir la rejilla)
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
    <div className="flex min-h-full flex-col gap-6" ref={containerRef}>

      {/* ── Greeting ────────────────────────────────────────────── */}
      <section className="px-6 pt-6 home-greeting">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.75rem] font-black text-manises-blue tracking-tight leading-none">
              {profile ? `Hola, ${profile.displayName.split(' ')[0]} 👋` : 'Lotería Manises 🍀'}
            </h1>
            <p className="text-[13px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
              {profile ? '¡Que tengas mucha suerte hoy!' : 'Tu administración de lotería oficial'}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm text-manises-blue">
            <BadgeCheck className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="px-4">
        <div className="hero-card relative h-[440px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-manises/10 group transition-all duration-500">
          <div className="absolute inset-0">
            <img
              src={headerWinner}
              alt="Lotería Manises"
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            {/* Overlay para contraste - Solución sugerida en auditoría */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,71,146,0.92)_0%,rgba(10,71,146,0.5)_40%,transparent_100%)]" />
          </div>

          <div className="relative h-full p-8 flex flex-col">
            <div className="flex items-start justify-between mb-auto">
              <span className="hero-badge px-3.5 py-2 rounded-full bg-manises-gold text-manises-blue text-[10px] font-black uppercase tracking-[0.18em] flex items-center gap-2 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Sorteo Maestre
              </span>
              <HeroTimeChip iso={featuredGame.nextDraw} />
            </div>

            <div className="mb-6">
              <h1 className="hero-title text-[2.5rem] font-black text-white tracking-tighter leading-[0.9] mb-3 drop-shadow-md">
                {featuredGame.name}
              </h1>
              <p className="hero-tagline text-white/80 text-[14px] font-bold tracking-tight max-w-[240px] leading-snug">
                {featuredGame.description ?? 'El bote que puede cambiar tu vida para siempre.'}
              </p>
            </div>

            <div className="hero-box bg-white/10 backdrop-blur-2xl rounded-[2.25rem] p-7 border border-white/20 shadow-2xl flex flex-col items-center text-center">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Bote Estimado</p>
              <div className="mb-7">
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

      {/* ── Peñas Oficiales (Rediseño Compacto sugerido) ──────── */}
      <section className="space-y-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-manises-blue/5 p-1.5 rounded-lg">
              <Users className="w-4 h-4 text-manises-blue" />
            </div>
            <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Peñas Oficiales</h2>
          </div>
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ver todas</button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          {OFFICIAL_PENAS.map(pena => (
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

      {/* ── Bento: Próximos Sorteos ───────────────────────────── */}
      {bentoGames.length > 0 && (
        <section className="px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-manises-blue/5 p-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-manises-blue" />
              </div>
              <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Próximos Sorteos</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
      <section className="space-y-5 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-manises-blue/5 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-manises-blue" />
            </div>
            <h2 className="text-xs font-extrabold text-manises-blue uppercase tracking-[0.16em]">Servicios Premium</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PremiumEditorialCard
            badge="B2B Navidad"
            title="Loteria de Navidad Empresas"
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
            badge="Numero Fiel"
            title="Abonarte a un numero"
            description="Convierte tu numero favorito en un abono estable y olvídate de renovar."
            cta="Ver abonos"
            image={loteriaNacionalHero}
            imageAlt="Abonos a numero de loteria"
            icon={Landmark}
            accent="gold"
            stats={['Persistente', 'Semanal']}
            onClick={() => navigate('/profile/subscriptions')}
          />
        </div>
      </section>

      {/* ── Footer Info ───────────────────────────────────────── */}
      <footer className="mt-4 px-8 pb-12 text-center">
        <div className="flex justify-center gap-6 mb-8 opacity-40">
          <Shield className="w-5 h-5 text-manises-blue" />
          <CreditCard className="w-5 h-5 text-manises-blue" />
          <Lock className="w-5 h-5 text-manises-blue" />
        </div>
        <p className="text-[10px] text-manises-blue/25 font-black uppercase tracking-[0.35em]">
          Administración Oficial · Lotería Manises
        </p>
      </footer>

      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}
