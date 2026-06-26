import { useState } from 'react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NumberBall, NumberBallLabeled, StarNumberBall } from '@/shared/ui/NumberBall';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/shared/lib/utils';
import { getBusinessDate } from '@/shared/lib/timezone';
import { Trophy, TrendingUp, CheckSquare, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { ComparisonModal } from '../components/ComparisonModal';
import { ResultDetailModal } from '../components/ResultDetailModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Ticket } from '@/shared/types/domain';
import { useResults } from '../hooks/useResults';
import { ResultCardSkeleton } from '@/shared/ui/Skeleton';
import { useTickets } from '@/features/tickets/hooks/useTickets';
import type { ResultDto } from '@/services/api/contracts/results.contracts';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { getGameIdentity } from '@/shared/lib/game-identity';
import loteriaJuevesTicket from '@/assets/images/loteria_jueves_ticket.jpg';
import loteriaSabadoTicket from '@/assets/images/loteria_sabado_ticket.jpg';

gsap.registerPlugin(useGSAP);

function formatListDate(iso: string): string {
  const d = new Date(iso);
  const str = d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const cleaned = str.replace(/\./g, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const NATIONAL_TICKET_IMAGES: Record<string, string> = {
  'loteria-nacional-jueves': loteriaJuevesTicket,
  'loteria-nacional-sabado': loteriaSabadoTicket,
};

// Tickets de muestra para el modo demo (para que funcione el comparador)
// TODO: Mover a tickets.mock.ts en el Sprint 2
const DEMO_TICKETS: Ticket[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    gameId: 'euromillones',
    gameType: 'euromillones',
    numbers: [12, 14, 23, 38, 47],
    stars: [3, 9],
    drawDate: '2026-04-08',
    status: 'won',
    price: 2.5,
    prize: 12.50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [4, 12, 21, 30, 44, 49],
    drawDate: '2026-04-08',
    status: 'lost',
    price: 1.00,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    gameId: 'loteria-nacional-sabado',
    gameType: 'loteria-nacional',
    numbers: [6, 9, 8, 4, 4],
    drawDate: '2026-04-11',
    status: 'won',
    price: 6.00,
    prize: 30_000,
    createdAt: new Date().toISOString(),
  },
];

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

export function ResultsPage() {
  const { user, isDemo } = useAuth();
  const { results, isLoading, error } = useResults();
  const { tickets: hookTickets } = useTickets();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [comparingResult, setComparingResult] = useState<ResultDto | null>(null);
  const [detailResult, setDetailResult] = useState<ResultDto | null>(null);

  const tickets = hookTickets;

  // Sort results chronologically — most recent first
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
      y: -20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });

    gsap.from('.result-card', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, [activeFilter, filtered.length, isLoading]);

  return (
    <div className="relative min-h-full overflow-x-hidden bg-background">
      <div className="relative z-10 flex flex-col gap-3 p-4">
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
                  ) : (
                    filter.label
                  )}
                </button>
              </PremiumTouchInteraction>
            );
          })}
        </div>

        {/* Resultados */}
        <div className="flex flex-col gap-2">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ResultCardSkeleton key={i} />
              ))}
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
            const identity = getGameIdentity(game);
            const theme = getGameTheme(game);

            const userTicketsForSort = tickets.filter(t =>
              t.gameId === result.gameId &&
              t.drawDate === getBusinessDate(result.date)
            );

            return (
              <div
                key={`${result.gameId}-${result.date}`}
                onClick={() => setDetailResult(result)}
                className="result-card relative bg-card rounded-2xl border border-white/80 overflow-hidden surface-neo-soft cursor-pointer hover:border-slate-350 transition-colors select-none"
              >
                <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: game.color }} />

                <div className="px-3.5 py-3 pl-4" style={{ ...theme.surface, backgroundImage: `linear-gradient(to right, ${game.color}0A, transparent 55%)` }}>
                  {/* Header de la tarjeta */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <GameBadge game={game} size="sm" />
                      <p className="text-[11px] font-black leading-tight text-manises-blue uppercase tracking-tight">{identity.shortName}</p>
                    </div>
                    <span className="text-[9.5px] font-bold text-muted-foreground uppercase">{formatListDate(result.date)}</span>
                  </div>

                  {/* Resultado principal en la tarjeta */}
                  {game.type !== 'loteria-nacional' ? (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {result.numbers.map((n: number, i: number) => (
                        <NumberBall key={i} number={n} variant="default" size="sm" />
                      ))}
                      {result.stars?.map((s: number, i: number) => (
                        <StarNumberBall key={`s-${i}`} number={s} size="sm" />
                      ))}
                      {result.complementario !== undefined && (
                        <>
                          <div className="w-px bg-border self-stretch mx-1" />
                          <NumberBallLabeled label="C" number={result.complementario} variant="complementario" size="sm" />
                          {result.reintegro !== undefined && (
                            <NumberBallLabeled label="R" number={result.reintegro} variant="reintegro" size="sm" />
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1.5 pt-0.5 justify-between">
                      <div className="flex items-center gap-2 bg-blue-50/15 border border-blue-100/30 px-3 py-1.5 rounded-xl flex-1 justify-between">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-blue-500 uppercase tracking-widest leading-none">1º Premio</span>
                          <span className="text-sm font-black text-manises-blue tracking-wider mt-0.5">{result.firstPrizeNumber || '—'}</span>
                        </div>
                        <div className="w-px h-5.5 bg-blue-100" />
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-blue-500 uppercase tracking-widest leading-none">2º Premio</span>
                          <span className="text-sm font-black text-manises-blue tracking-wider mt-0.5">{result.secondPrizeNumber || '—'}</span>
                        </div>
                      </div>
                      
                      {result.reintegros && result.reintegros.length > 0 && (
                        <div className="flex flex-col items-center shrink-0 pl-1">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reintegros</span>
                          <div className="flex gap-1">
                            {result.reintegros.map((digit: number) => (
                              <span key={digit} className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-50 border border-purple-100 text-[8px] font-black text-purple-700">
                                {digit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer links / actions */}
                  <div className="flex items-center justify-between mt-1 border-t border-slate-100/50 pt-1.5">
                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparingResult(result);
                        }}
                        className="text-[9px] font-bold uppercase tracking-wider text-manises-blue/50 hover:text-manises-blue flex items-center gap-0.5 cursor-pointer"
                      >
                        <CheckSquare className="w-3 h-3 mr-1 shrink-0" />
                        Comparar{userTicketsForSort.length > 0 ? ` (${userTicketsForSort.length})` : ''}
                      </button>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5" style={{ color: game.color }}>
                      Premios y escrutinio <ChevronRight className="w-2.5 h-2.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[9px] text-muted-foreground pb-1">
          Resultados orientativos. Datos oficiales en loteriamanises.com
        </p>
      </div>

      {/* Modal de detalle */}
      <ResultDetailModal
        isOpen={!!detailResult}
        onClose={() => setDetailResult(null)}
        result={detailResult}
      />

      {/* Modal de comparación */}
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
