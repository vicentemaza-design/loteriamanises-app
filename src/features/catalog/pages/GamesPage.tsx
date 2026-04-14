import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import type { Key } from 'react';
import { 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  Zap,
  Clock
} from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { GameIcon } from '@/shared/ui/GameIcon';
import { formatJackpot, formatCurrency, formatDrawTime, getCountdown } from '@/shared/lib/utils';
import { useLotteryGames } from '@/shared/hooks/useLotteryGames';
import type { LotteryGame } from '@/shared/types/domain';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Assets
import adminManises from '@/assets/images/administracion_manises.webp';
import joySecondary from '@/assets/images/joy_secondary.png';
import primitivaJoy from '@/assets/images/primitiva_joy.png';

gsap.registerPlugin(useGSAP);

// ─── Sub-component: TodayGameCard ─────────────────────────────────────────────
function TodayGameCard({ game, onClick }: { key?: Key; game: LotteryGame; onClick: () => void }) {
  const image = game.id === 'primitiva' ? primitivaJoy : joySecondary;

  return (
    <PremiumTouchInteraction scale={0.98}>
      <button
        onClick={onClick}
        className="today-game-card relative w-full h-32 rounded-[1.75rem] overflow-hidden group shadow-lg transition-all text-left"
      >
        <img
          src={image}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-1000 group-hover:scale-105"
          style={{ filter: 'grayscale(1) brightness(0.5)' }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: game.color, mixBlendMode: 'multiply', opacity: 0.8 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative h-full p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl shrink-0">
              <GameIcon gameType={game.type} variant="white" className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-white text-xl font-black tracking-tight leading-none mb-1">{game.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-manises-gold uppercase tracking-widest">Bote</span>
                <span className="text-lg font-black text-white tabular-nums">
                  {formatJackpot(game.jackpot, game.isMonthly)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex flex-col items-center shrink-0">
            <Clock className="w-3.5 h-3.5 text-white/60 mb-1" />
            <span className="text-[9px] font-black text-white uppercase">{formatDrawTime(game.nextDraw)}</span>
          </div>
        </div>
      </button>
    </PremiumTouchInteraction>
  );
}

// ─── Sub-component: UpcomingGameRow ──────────────────────────────────────────
function UpcomingGameRow({ game, onClick }: { key?: Key; game: LotteryGame; onClick: () => void }) {
  return (
    <PremiumTouchInteraction scale={0.97}>
      <button
        onClick={onClick}
        className="weekly-game-card w-full bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"
            style={{ backgroundColor: game.color }}
          >
            <GameIcon gameType={game.type} variant="white" className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-manises-blue text-sm truncate">{game.name}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {formatDrawTime(game.nextDraw)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-black text-manises-gold leading-none">
              {formatJackpot(game.jackpot, game.isMonthly)}
            </p>
            <p className="text-[9px] font-medium text-muted-foreground mt-0.5">{formatCurrency(game.price)}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-manises-blue/5 flex items-center justify-center text-manises-blue group-hover:bg-manises-blue group-hover:text-white transition-all shadow-inner shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    </PremiumTouchInteraction>
  );
}

// ─── Sub-component: EmptyToday ────────────────────────────────────────────────
function EmptyTodaySection() {
  return (
    <div className="bg-manises-blue/5 border border-manises-blue/10 rounded-2xl p-5 text-center">
      <Sparkles className="w-6 h-6 text-manises-blue/30 mx-auto mb-2" />
      <p className="text-[11px] font-black text-manises-blue/40 uppercase tracking-widest">
        No hay sorteos hoy
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">
        Consulta los próximos sorteos más abajo
      </p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function GamesPage() {
  const navigate = useNavigate();
  const { todayGames, upcomingGames } = useLotteryGames();
  const containerRef = useRef<HTMLDivElement>(null);

  // Los "próximos" excluyen los de hoy
  const futureGames = upcomingGames.filter(g => {
    const cd = getCountdown(g.nextDraw);
    return cd.days > 0;
  });

  useGSAP(() => {
    const sectionTitles = gsap.utils.toArray<HTMLElement>('.section-title');
    const todayCards = gsap.utils.toArray<HTMLElement>('.today-game-card');
    const weeklyCards = gsap.utils.toArray<HTMLElement>('.weekly-game-card');
    const banners = gsap.utils.toArray<HTMLElement>('.banner-info');

    gsap.set(sectionTitles, { y: 10, autoAlpha: 0 });
    gsap.set(todayCards, { y: 14, autoAlpha: 0 });
    gsap.set(weeklyCards, { y: 16, autoAlpha: 0 });
    gsap.set(banners, { y: 10, autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl
      .to(sectionTitles, { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.07 })
      .to(todayCards, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06 }, '-=0.16')
      .to(weeklyCards, { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.065 }, '-=0.12')
      .to(banners, { y: 0, autoAlpha: 1, duration: 0.36 }, '-=0.1');
  }, { scope: containerRef });

  return (
    <div className="flex flex-col gap-6 pb-28 bg-background min-h-full overflow-x-hidden" ref={containerRef}>

      {/* ── Sorteos de Hoy ──────────────────────────────────── */}
      <section className="px-5 pt-4 space-y-3">
        <div className="flex items-center gap-2 px-1 section-title">
          <div className="w-8 h-8 rounded-xl bg-manises-blue/5 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-manises-blue" />
          </div>
          <h2 className="text-sm font-black text-manises-blue uppercase tracking-widest">Sorteos de Hoy</h2>
        </div>

        {todayGames.length > 0 ? (
          <div className="flex flex-col gap-3">
            {todayGames.map(game => (
              <TodayGameCard
                key={game.id}
                game={game}
                onClick={() => navigate(`/play/${game.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyTodaySection />
        )}
      </section>

      {/* ── Próximos Sorteos ────────────────────────────────── */}
      {futureGames.length > 0 && (
        <section className="px-5 space-y-3">
          <div className="flex items-center justify-between px-1 section-title">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-manises-blue/5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-manises-blue" />
              </div>
              <h2 className="text-sm font-black text-manises-blue uppercase tracking-widest">Próximos Sorteos</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {futureGames.map(game => (
              <UpcomingGameRow
                key={game.id}
                game={game}
                onClick={() => navigate(`/play/${game.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Banner Emocional ─────────────────────────────────── */}
      <section className="px-5">
        <div className="banner-info relative h-44 rounded-3xl overflow-hidden shadow-2xl bg-manises-blue">
          <img
            src={adminManises}
            alt="Administración Manises"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-manises-blue/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-manises-gold fill-current" />
              <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Punto de Venta Oficial</span>
            </div>
            <h4 className="text-xl font-black text-white leading-tight tracking-tight">
              Administración nº 3 de Manises
            </h4>
            <p className="text-white/60 text-[10px] font-medium mt-1">
              Más de 20 años repartiendo sueños y botes millonarios.
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-[9px] text-manises-blue/20 font-black uppercase tracking-[0.3em] mt-2">
        Juego Responsable · +18 · Lotería Manises
      </p>
    </div>
  );
}
