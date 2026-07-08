import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Trophy,
  Star,
  Shield,
  Users,
  Heart,
  Award,
  Banknote,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import gordo2012Img from '@/assets/images/quienes-somos/manises-afortunado.jpg';
import gordo2013Img from '@/assets/images/quienes-somos/historia-digital.jpg';
import gordo2018Img from '@/assets/images/quienes-somos/historia-premios.jpg';
import gordo2022Img from '@/assets/images/gordos/gordo-navidad-2022.jpg';
import gordo2023Img from '@/assets/images/quienes-somos/gordo2023-celebracion.webp';
import manisesElArteImg from '@/assets/images/quienes-somos/manises-el-arte.jpg';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { GameIcon } from '@/shared/ui/GameIcon';
import type { GameType } from '@/shared/types/domain';
import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';
import {
  GORDOS_NAVIDAD,
  MANISES_GORDO_YEARS,
  MANISES_OWN_GORDOS,
  MOCK_DELIVERED_PRIZES,
  type PrizeGameType,
  type DeliveredPrize,
} from '../data/delivered-prizes.mock';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'navidad' | 'nino' | 'nacional' | 'bonoloto';

// ── Config ────────────────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'navidad', label: 'Navidad' },
  { key: 'nino', label: 'El Niño' },
  { key: 'nacional', label: 'Nac. y Otros' },
  { key: 'bonoloto', label: 'Bonoloto' },
];

const GAME_CONFIG: Record<PrizeGameType, { solidBg: string; label: string }> = {
  navidad:            { solidBg: '#991b1b', label: 'Navidad'          },
  nino:               { solidBg: '#1e40af', label: 'El Niño'          },
  primitiva:          { solidBg: '#166534', label: 'La Primitiva'     },
  bonoloto:           { solidBg: '#0f766e', label: 'Bonoloto'         },
  euromillones:       { solidBg: '#1d4ed8', label: 'Euromillones'     },
  'loteria-nacional': { solidBg: '#0a4792', label: 'Lotería Nacional' },
  quiniela:           { solidBg: '#b91c1c', label: 'La Quiniela'      },
};

const KEY_STATS: { Icon: LucideIcon; value: string; label: string; color: string }[] = [
  { Icon: Trophy,   value: '5',     label: 'Gordos de\nNavidad',  color: '#F5C518' },
  { Icon: Award,    value: '50+',   label: 'Grandes\npremios',    color: '#0a4792' },
  { Icon: Banknote, value: '350M€', label: 'Premios\nrepartidos', color: '#15803d' },
  { Icon: Calendar, value: 'DESDE', label: '2000',                color: '#b91c1c' },
];

const GORDO_PHOTOS: Record<number, string> = {
  2012: gordo2012Img,
  2013: gordo2013Img,
  2018: gordo2018Img,
  2022: gordo2022Img,
  2023: gordo2023Img,
};

const GORDO_POSITIONS: Record<number, string> = {
  2012: 'center 30%',
  2013: 'center 25%',
  2018: 'center 25%',
  2022: 'center 18%',
  2023: 'center 25%',
};

const INITIAL_VISIBLE = 8;
const CARD_W = 176;
const CARD_GAP = 12;
const SCROLL_STEP = CARD_W + CARD_GAP;

// ── Helpers ───────────────────────────────────────────────────────────────────

function filterPrizes(prizes: DeliveredPrize[], tab: FilterTab): DeliveredPrize[] {
  if (tab === 'all')      return prizes;
  if (tab === 'navidad')  return prizes.filter((p) => p.gameType === 'navidad');
  if (tab === 'nino')     return prizes.filter((p) => p.gameType === 'nino');
  if (tab === 'bonoloto') return prizes.filter((p) => p.gameType === 'bonoloto');
  return prizes.filter((p) =>
    p.gameType === 'euromillones' ||
    p.gameType === 'primitiva'    ||
    p.gameType === 'loteria-nacional' ||
    p.gameType === 'quiniela',
  );
}

function formatPrizeDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(dateStr));
}

// ── Gordo card ────────────────────────────────────────────────────────────────

function GordoCard({ gordo, active }: { gordo: typeof GORDOS_NAVIDAD[number]; active: boolean }) {
  const photo = GORDO_PHOTOS[gordo.year];
  const position = GORDO_POSITIONS[gordo.year] ?? 'center';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-300',
        active
          ? 'shadow-2xl shadow-manises-blue/35 scale-[1.03]'
          : 'opacity-60 scale-[0.97] shadow-md',
      )}
      style={{ minHeight: '17rem' }}
    >
      <img
        src={photo}
        alt={`El Gordo de Navidad ${gordo.year}`}
        className="absolute inset-0 w-full h-full object-cover select-none"
        style={{ objectPosition: position }}
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.60) 70%, rgba(0,0,0,0.92) 100%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-3.5">
        <div>
          <span className="inline-flex items-center gap-1 bg-manises-gold text-manises-blue text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md leading-none">
            <Star className="w-2 h-2 fill-manises-blue text-manises-blue shrink-0" />
            El Gordo · {gordo.year}
          </span>
        </div>
        <div className="space-y-2">
          <div
            className="rounded-xl px-3 py-1.5 text-center"
            style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.28)' }}
          >
            <p className="text-white font-black tracking-[0.2em] leading-none" style={{ fontSize: '14px' }}>
              {gordo.ticketNumber}
            </p>
            <p className="text-white/50 text-[7px] font-bold uppercase tracking-widest mt-0.5">Décimo ganador</p>
          </div>
          <div className="flex items-center justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-manises-gold text-manises-gold" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────────

function GordosCarousel() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * SCROLL_STEP, behavior: 'smooth' });
    setActive(index);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / SCROLL_STEP);
    setActive(Math.max(0, Math.min(idx, GORDOS_NAVIDAD.length - 1)));
  };

  const canPrev = active > 0;
  const canNext = active < GORDOS_NAVIDAD.length - 1;

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-3 snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {GORDOS_NAVIDAD.map((gordo, i) => (
          <div key={gordo.year} className="w-44 shrink-0 snap-start">
            <GordoCard gordo={gordo} active={i === active} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={!canPrev}
          aria-label="Gordo anterior"
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90',
            canPrev
              ? 'border-manises-blue/20 text-manises-blue bg-white shadow-sm'
              : 'border-slate-100 text-slate-300 bg-white/50',
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[13px] font-black text-manises-blue tracking-tight">
            {GORDOS_NAVIDAD[active].year}
          </p>
          <div className="flex items-center gap-1.5">
            {GORDOS_NAVIDAD.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver ${GORDOS_NAVIDAD[i].year}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-5 bg-manises-blue' : 'w-1.5 bg-slate-300',
                )}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={!canNext}
          aria-label="Gordo siguiente"
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90',
            canNext
              ? 'border-manises-blue/20 text-manises-blue bg-white shadow-sm'
              : 'border-slate-100 text-slate-300 bg-white/50',
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Prize row ─────────────────────────────────────────────────────────────────

function PrizeRow({ prize, isLast }: { prize: DeliveredPrize; isLast: boolean }) {
  const cfg = GAME_CONFIG[prize.gameType];
  const isGordo = prize.prizeRank === 'EL GORDO';

  return (
    <div className="flex gap-0">
      <div className="flex flex-col items-center pl-4 pt-4 pb-0 w-16 shrink-0">
        <div
          className="w-10 h-10 rounded-[0.85rem] flex items-center justify-center shrink-0 z-10"
          style={{ backgroundColor: cfg.solidBg }}
        >
          <GameIcon gameType={prize.gameType as GameType} variant="white" className="w-5 h-5" />
        </div>
        {!isLast && <div className="w-px flex-1 mt-1.5" style={{ background: 'rgb(241 245 249)' }} />}
      </div>
      <div className={cn('flex-1 min-w-0 pr-4 py-4', !isLast && 'pb-4')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {prize.isNew && (
                <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md leading-none">
                  NUEVO
                </span>
              )}
              <p className="text-[13px] font-black text-manises-blue leading-none uppercase tracking-wide">
                {prize.gameName}
              </p>
            </div>
            <p className="text-[11.5px] text-slate-400 font-medium mt-1">{formatPrizeDate(prize.date)}</p>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5 leading-tight">{prize.category}</p>
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
            {prize.prizeRank && (
              <span
                className={cn(
                  'text-[8px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md',
                  isGordo
                    ? 'bg-manises-gold text-manises-blue'
                    : 'bg-manises-blue text-white',
                )}
              >
                {prize.prizeRank}
              </span>
            )}
            <p
              className={cn(
                'font-black leading-none',
                isGordo
                  ? 'text-manises-gold text-base'
                  : prize.amount >= 300_000
                    ? 'text-manises-blue text-[15px]'
                    : 'text-emerald-600 text-sm',
              )}
            >
              {formatCurrency(prize.amount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DeliveredPrizesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = filterPrizes(MOCK_DELIVERED_PRIZES, activeFilter);
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hasMore = !showAll && filtered.length > INITIAL_VISIBLE;

  const handleFilterChange = (key: FilterTab) => {
    setActiveFilter(key);
    setShowAll(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#f5f7fa] pb-24">
      <ProfileSubHeader
        title="Premios entregados"
        subtitle="Nuestra historia, tu confianza"
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-col gap-6 pt-5 pb-4">

        {/* ── 1. GORDOS DE NAVIDAD — impacto inmediato ─────────────────── */}
        <section className="px-4">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nuestros</p>
            <h2 className="text-xl font-black text-manises-blue leading-none">5 Gordos de Navidad</h2>
          </div>
          <GordosCarousel />
        </section>

        {/* ── 2. STATS ─────────────────────────────────────────────────── */}
        <section className="px-4">
          <div className="grid grid-cols-4 gap-2">
            {KEY_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-1 py-3 text-center shadow-sm"
              >
                <stat.Icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
                <p className="mt-1 text-base font-black leading-none text-manises-blue">{stat.value}</p>
                <p className="mt-0.5 whitespace-pre-line text-[9px] font-bold leading-tight text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. BLOQUE MANISES ────────────────────────────────────────── */}
        <section className="px-4">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">La ciudad de la suerte</p>
            <h2 className="text-xl font-black text-manises-blue leading-none">Manises, único en España</h2>
          </div>
          <div
            className="relative overflow-hidden rounded-[1.8rem] shadow-xl"
            style={{ background: 'linear-gradient(145deg, #0d56b0 0%, #0a4792 35%, #062354 100%)' }}
          >
            {/* Foto edificio El Arte de Manises — muy transparente */}
            <img
              src={manisesElArteImg}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              style={{ opacity: 0.22, objectPosition: 'center 20%' }}
            />
            <div
              className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 80% 10%, rgba(245,197,24,0.12) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 px-5 pt-6 pb-5">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h3 className="text-lg font-black text-white/70 leading-none tracking-wide">
                    MANISES,
                  </h3>
                  <p
                    className="font-manuscript mt-1 leading-snug"
                    style={{ fontWeight: 700, fontSize: 'clamp(1.45rem, 6vw, 1.9rem)', color: '#F5C518', textShadow: '0 1px 10px rgba(245,197,24,0.25)' }}
                  >
                    el pueblo más afortunado<br />de España
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p
                    className="font-black text-manises-gold leading-none"
                    style={{ fontSize: '5rem', lineHeight: 1, textShadow: '0 0 40px rgba(245,197,24,0.4)' }}
                  >
                    7
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40 leading-tight">
                    Gordos<br />de Navidad
                  </p>
                </div>
              </div>
              <div className="relative mb-5">
                {/* Hilo que conecta las bolas */}
                <div
                  className="absolute left-5 right-5 h-px"
                  style={{ top: 7, background: 'rgba(255,255,255,0.18)' }}
                />
                <div className="flex justify-between">
                  {MANISES_GORDO_YEARS.map((year) => {
                    const isOurs = MANISES_OWN_GORDOS.has(year);
                    return (
                      <div key={year} className="flex flex-col items-center gap-1">
                        {/* Capuchón metálico */}
                        <div
                          className="relative z-10 shrink-0"
                          style={{
                            width: 6,
                            height: 8,
                            borderRadius: '3px 3px 0 0',
                            background: isOurs
                              ? 'linear-gradient(180deg, #fef3c7 0%, #d97706 100%)'
                              : 'rgba(255,255,255,0.18)',
                          }}
                        />
                        {/* Bola */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center relative z-10 overflow-hidden shrink-0"
                          style={isOurs ? {
                            background: 'radial-gradient(circle at 35% 28%, #fef9c3 0%, #F5C518 45%, #92400e 100%)',
                            boxShadow: '0 6px 18px rgba(245,197,24,0.5), inset 0 -2px 5px rgba(0,0,0,0.25)',
                          } : {
                            background: 'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.55) 0%, rgba(120,160,255,0.25) 55%, rgba(0,20,80,0.45) 100%)',
                            border: '1.5px solid rgba(255,255,255,0.35)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          }}
                        >
                          {/* Brillo de esfera */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              top: 4, left: 5, width: 13, height: 8,
                              background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 100%)',
                              borderRadius: '50%',
                            }}
                          />
                          <span className={cn('relative z-10 text-[10px] font-black', isOurs ? 'text-amber-900' : 'text-white/70')}>
                            {String(year).slice(2)}
                          </span>
                        </div>
                        <span className={cn('text-[8px] font-bold leading-none mt-0.5', isOurs ? 'text-manises-gold' : 'text-white/50')}>
                          {year}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[11.5px] font-semibold text-white/55 leading-relaxed">
                De los 7 Gordos repartidos en Manises,{' '}
                <span className="text-manises-gold font-black">5 vendidos por Lotería Manises.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. HISTORIAL COMPLETO ────────────────────────────────────── */}
        <section className="px-4">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verificados y oficiales</p>
            <h2 className="text-xl font-black text-manises-blue leading-tight">Historial completo<br/>de premios</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFilterChange(key)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-[11.5px] font-bold transition-all active:scale-95',
                  activeFilter === key
                    ? 'bg-manises-blue text-white shadow-md shadow-manises-blue/25'
                    : 'bg-white border border-slate-200 text-slate-500',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
            {visible.length > 0 ? (
              visible.map((prize, i) => (
                <Fragment key={prize.id}>
                  <PrizeRow prize={prize} isLast={i === visible.length - 1} />
                </Fragment>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-slate-400">No hay premios en esta categoría</p>
              </div>
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-4 rounded-[1.3rem] bg-white border border-slate-200 text-manises-blue text-[13px] font-bold shadow-sm active:scale-[0.98] transition-transform"
            >
              Ver más premios
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </section>

        {/* ── 5. BLOQUE DE CONFIANZA ───────────────────────────────────── */}
        <section className="px-4">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Por qué elegirnos</p>
            <h2 className="text-xl font-black text-manises-blue leading-none">Garantía y confianza</h2>
          </div>
          <div className="rounded-[1.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
            {[
              {
                Icon: Shield,
                color: '#0a4792',
                bg: '#dbeafe',
                title: 'Premios oficiales y verificados',
                desc: 'Todos nuestros premios están verificados por Loterías y Apuestas del Estado.',
              },
              {
                Icon: Users,
                color: '#7c3aed',
                bg: '#ede9fe',
                title: 'Más de 25 años repartiendo ilusión',
                desc: 'Desde el año 2000, miles de clientes confían en Lotería Manises.',
              },
              {
                Icon: Heart,
                color: '#dc2626',
                bg: '#fee2e2',
                title: 'Tu suerte, nuestra ilusión',
                desc: 'Seguimos trabajando para que la próxima historia ganadora seas tú.',
              },
            ].map(({ Icon, color, bg, title, desc }, i, arr) => (
              <div
                key={title}
                className={cn(
                  'flex items-start gap-3.5 px-4 py-4',
                  i < arr.length - 1 && 'border-b border-slate-50',
                )}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-manises-blue leading-tight">{title}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. CTA ───────────────────────────────────────────────────── */}
        <section className="px-4">
          <div
            className="overflow-hidden rounded-[1.8rem] p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #062d6b 0%, #0a4792 100%)' }}
          >
            <Trophy className="mx-auto h-8 w-8 text-white/30" />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
              La suerte que buscas ya espera.
            </p>
            <p
              className="font-manuscript mt-2 text-2xl leading-tight"
              style={{ fontWeight: 700, color: '#F5C518', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
            >
              El próximo gordo puede ser tuyo.
            </p>
            <p className="mt-2 text-sm font-semibold text-white/70">
              Compra tu décimo en Lotería Manises.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-5 w-full rounded-xl py-3.5 text-sm font-black uppercase tracking-wider text-[#062d6b] shadow-lg transition-transform active:scale-95"
              style={{ background: '#F5C518' }}
            >
              Comprar lotería
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
