import { useState } from 'react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NumberBall, StarNumberBall } from '@/shared/ui/NumberBall';
import { getBusinessDate } from '@/shared/lib/timezone';
import { Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ComparisonModal } from '../components/ComparisonModal';
import { ResultDetailModal } from '../components/ResultDetailModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useResults } from '../hooks/useResults';
import { ResultCardSkeleton } from '@/shared/ui/Skeleton';
import { useTickets } from '@/features/tickets/hooks/useTickets';
import type { ResultDto } from '@/services/api/contracts/results.contracts';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { getGameIdentity } from '@/shared/lib/game-identity';
import type { LotteryGame } from '@/shared/types/domain';

gsap.registerPlugin(useGSAP);

// Full game name mapping for card headers (more formal than shortName)
const CARD_FULL_NAMES: Record<string, string> = {
  'euromillones':           'Euromillones',
  'primitiva':              'La Primitiva',
  'bonoloto':               'Bonoloto',
  'gordo':                  'El Gordo de la Primitiva',
  'eurodreams':             'EuroDreams',
  'quiniela':               'La Quiniela',
  'quinigol':               'Quinigol',
  'loteria-nacional-jueves':'Lotería del Jueves',
  'loteria-nacional-sabado':'Lotería del Sábado',
  'loteria-navidad':        'Lotería de Navidad',
  'loteria-nino':           'Lotería del Niño',
};

function getCardFullName(gameId: string, gameName: string): string {
  return CARD_FULL_NAMES[gameId] ?? gameName;
}

function formatCardDate(iso: string, gameType: string): string {
  const d = new Date(iso);
  const noWeekday = gameType === 'navidad' || gameType === 'nino';
  if (noWeekday) {
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      .replace(/ de /g, ' ');
  }
  const str = d.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).replace(/ de /g, ' ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const GAME_FILTERS = [
  { key: 'Todos', label: 'Todos' },
  ...LOTTERY_GAMES.map((game) => ({
    key: game.name,
    label: getGameIdentity(game).shortName,
    game,
  })),
];

function hasGameFilter(filter: (typeof GAME_FILTERS)[number]): filter is Extract<(typeof GAME_FILTERS)[number], { game: NonNullable<unknown> }> {
  return 'game' in filter;
}

// ── Card body: game-specific prize/number layout ──────────────────────────────
function ResultCardBody({ result, game }: { result: ResultDto; game: LotteryGame }) {
  const { numbers, stars, complementario, reintegro, reintegros, firstPrizeNumber, secondPrizeNumber } = result;
  const t = game.type;
  const isNational = t === 'loteria-nacional';
  const isNavidad  = t === 'navidad';
  const isNino     = t === 'nino';

  // ── Lotería Nacional (Jueves / Sábado): 3-col prize grid ──
  if (isNational) {
    return (
      <div className="grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-blue-50/20">
        <div className="px-2.5 py-2.5 text-center">
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1.5">1º Premio</p>
          <p className="text-[15px] font-black text-manises-blue tracking-wider leading-none">
            {firstPrizeNumber ?? '—'}
          </p>
        </div>
        <div className="px-2.5 py-2.5 text-center">
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1.5">2º Premio</p>
          <p className="text-[15px] font-black text-manises-blue tracking-wider leading-none">
            {secondPrizeNumber ?? '—'}
          </p>
        </div>
        <div className="px-2.5 py-2.5 text-center">
          <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Reintegros</p>
          <p className="text-[13px] font-black text-purple-600 tracking-wide leading-none">
            {reintegros ? reintegros.join(' · ') : '—'}
          </p>
        </div>
      </div>
    );
  }

  // ── Navidad / Niño: trophy header + reintegro + 2nd prize ──
  if (isNavidad || isNino) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 divide-x divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-none">
                {isNavidad ? '1º Premio (Gordo)' : '1º Premio'}
              </p>
              <p className="text-[19px] font-black text-manises-blue tracking-wider leading-none mt-1">
                {firstPrizeNumber ?? '—'}
              </p>
            </div>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-none">
              {isNino ? 'Reintegros' : 'Reintegro'}
            </p>
            <p className="text-[14px] font-black text-purple-600 tracking-wide mt-1 leading-none">
              {isNino && reintegros ? reintegros.join(' · ') : (reintegro ?? '—')}
            </p>
          </div>
        </div>
        {secondPrizeNumber && (
          <div className="border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-3 bg-slate-50/40">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">2º Premio</span>
            <span className="text-[13px] font-black text-manises-blue tracking-wider">{secondPrizeNumber}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Euromillones: numbers + stars + El Millón ──
  if (t === 'euromillones') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex flex-wrap gap-1">
            {numbers.map((n, i) => (
              <NumberBall key={i} number={n as number} variant="default" size="sm" />
            ))}
          </div>
          {stars && stars.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200">
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Estrellas</span>
              {stars.map((s, i) => (
                <StarNumberBall key={i} number={s} size="sm" />
              ))}
            </div>
          )}
        </div>
        {result.drawId && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-1.5">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">El Millón</span>
            <span className="text-[10.5px] font-black text-amber-600 tracking-wider">{result.drawId}</span>
          </div>
        )}
      </div>
    );
  }

  // ── El Gordo: numbers + número clave ──
  if (t === 'gordo') {
    return (
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {numbers.map((n, i) => (
            <NumberBall key={i} number={n as number} variant="default" size="sm" />
          ))}
        </div>
        {stars && stars.length > 0 && (
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Núm. Clave</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-black text-amber-700">
              {stars[0]}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── EuroDreams: numbers + número sueño ──
  if (t === 'eurodreams') {
    return (
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {numbers.map((n, i) => (
            <NumberBall key={i} number={n as number} variant="default" size="sm" />
          ))}
        </div>
        {stars && stars.length > 0 && (
          <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Núm. Sueño</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-[11px] font-black text-purple-700">
              {stars[0]}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Bonoloto / Primitiva: balls + complementario + reintegro ──
  if (t === 'bonoloto' || t === 'primitiva') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {numbers.map((n, i) => (
            <NumberBall key={i} number={n as number} variant="default" size="sm" />
          ))}
        </div>
        {(complementario !== undefined || reintegro !== undefined) && (
          <div className="flex gap-4 border-t border-slate-100 pt-2">
            {complementario !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Complementario</span>
                <NumberBall number={complementario} variant="complementario" size="sm" />
              </div>
            )}
            {reintegro !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Reintegro</span>
                <NumberBall number={reintegro} variant="reintegro" size="sm" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Quiniela / Quinigol: results inline ──
  if (t === 'quiniela' || game.id === 'quinigol') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1">
          {numbers.map((n, i) => (
            <span
              key={i}
              className={cn(
                'inline-flex h-6 min-w-[1.4rem] px-1 items-center justify-center rounded font-black text-[10px] border',
                n === '1' || n === 1
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : n === '2' || n === 2
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
              )}
            >
              {n}
            </span>
          ))}
        </div>
        {complementario !== undefined && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-1.5">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">
              {game.id === 'quinigol' ? 'Pleno al 7' : 'Pleno al 15'}
            </span>
            <span className="text-[11px] font-black text-manises-blue">{complementario}</span>
          </div>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-wrap gap-1">
      {numbers.map((n, i) => (
        <NumberBall key={i} number={n as number} variant="default" size="sm" />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ResultsPage() {
  const { user, isDemo } = useAuth();
  const { results, isLoading, error } = useResults();
  const { tickets: hookTickets } = useTickets();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [comparingResult, setComparingResult] = useState<ResultDto | null>(null);
  const [detailResult, setDetailResult] = useState<ResultDto | null>(null);

  const tickets = hookTickets;

  const sorted = [...results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = sorted.filter(r => {
    if (activeFilter === 'Todos') return true;
    const game = LOTTERY_GAMES.find(g => g.id === r.gameId);
    return game?.name === activeFilter;
  });

  useGSAP(() => {
    gsap.from('.results-header > *', {
      y: -20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    });
    gsap.from('.result-card', {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out', clearProps: 'all',
    });
  }, [activeFilter, filtered.length, isLoading]);

  return (
    <div className="relative min-h-full overflow-x-hidden bg-background">
      <div className="relative z-10 flex flex-col gap-3 p-4">

        {/* Page header */}
        <section className="px-1 pt-0.5 flex items-center justify-between results-header">
          <div>
            <h2 className="text-sm font-black text-manises-blue uppercase tracking-widest mb-1">Resultados</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Últimos sorteos oficiales · ~3 meses</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-manises-gold/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-manises-gold" />
          </div>
        </section>

        {/* Filtros horizontales */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4">
          {GAME_FILTERS.map((filter) => {
            const identity = hasGameFilter(filter) ? getGameIdentity(filter.game) : null;
            const isActive = activeFilter === filter.key;
            return (
              <PremiumTouchInteraction key={filter.key} scale={0.95}>
                <button
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    'filter-chip inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-lg whitespace-nowrap border transition-all shrink-0 uppercase tracking-widest',
                    isActive
                      ? 'bg-manises-blue text-white border-manises-blue shadow-sm'
                      : 'bg-white text-manises-blue/60 border-manises-blue/5 hover:border-manises-blue/20'
                  )}
                >
                  {identity ? (
                    <>
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                        style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.55)' : identity.chipBackground }}
                      />
                      {filter.label}
                    </>
                  ) : filter.label}
                </button>
              </PremiumTouchInteraction>
            );
          })}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2.5">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => <ResultCardSkeleton key={i} />)}
            </div>
          )}

          {error && (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
              <p className="text-xs text-red-600 font-bold">{error}</p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-xs text-muted-foreground font-medium">No hay resultados para este filtro.</p>
            </div>
          )}

          {!isLoading && !error && filtered.map((result) => {
            const game = LOTTERY_GAMES.find(g => g.id === result.gameId);
            if (!game) return null;

            const userTicketsForSort = tickets.filter(t =>
              t.gameId === result.gameId &&
              t.drawDate === getBusinessDate(result.date)
            );
            const hasUserTickets = userTicketsForSort.length > 0;

            return (
              <div
                key={`${result.gameId}-${result.date}`}
                onClick={() => setDetailResult(result)}
                className="result-card bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition-all select-none hover:shadow-md hover:border-slate-200/80"
              >
                {/* Top color accent */}
                <div className="h-[3px]" style={{ backgroundColor: game.color }} />

                <div className="px-4 pt-3 pb-3.5">
                  {/* Header row: game icon + name + "Premios y escrutinio >" */}
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <GameBadge game={game} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-black text-manises-blue leading-tight uppercase tracking-tight truncate">
                          {getCardFullName(game.id, game.name)}
                        </p>
                        {/* Date directly under name, aligned with text */}
                        <p
                          className="text-[9px] font-semibold mt-0.5 capitalize"
                          style={{ color: game.color }}
                        >
                          {formatCardDate(result.date, game.type)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDetailResult(result); }}
                      className="shrink-0 flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide pt-0.5"
                      style={{ color: game.color }}
                    >
                      Premios y escrutinio
                      <ChevronRight className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Game-specific prize/number content */}
                  <div className="mt-2.5">
                    <ResultCardBody result={result} game={game} />
                  </div>

                  {/* User tickets badge (subtle, no compare button) */}
                  {hasUserTickets && (
                    <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[8.5px] font-bold text-emerald-600 uppercase tracking-wider">
                        Tienes {userTicketsForSort.length} apuesta{userTicketsForSort.length > 1 ? 's' : ''} en este sorteo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[9px] text-muted-foreground pb-1">
          Resultados orientativos. Datos oficiales en loteriamanises.com
        </p>
      </div>

      {/* Detail modal */}
      <ResultDetailModal
        isOpen={!!detailResult}
        onClose={() => setDetailResult(null)}
        result={detailResult}
      />

      {/* Comparison modal */}
      <ComparisonModal
        isOpen={!!comparingResult}
        onClose={() => setComparingResult(null)}
        result={comparingResult || { numbers: [], date: '', gameId: '' }}
        userTickets={comparingResult ? tickets.filter(t =>
          t.gameId === comparingResult.gameId &&
          t.drawDate === getBusinessDate(comparingResult.date)
        ) : []}
      />
    </div>
  );
}
