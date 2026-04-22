import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NumberBall, NumberBallLabeled } from '@/shared/ui/NumberBall';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/shared/lib/utils';
import { getBusinessDate } from '@/shared/lib/timezone';
import { Trophy, TrendingUp, CheckSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { ComparisonModal } from '../components/ComparisonModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Ticket } from '@/shared/types/domain';
import { useResults } from '../hooks/useResults';
import { ResultCardSkeleton } from '@/shared/ui/Skeleton';
import { useTickets } from '@/features/tickets/hooks/useTickets';
import type { ResultDto } from '@/services/api/contracts/results.contracts';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

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

const GAME_FILTERS = ['Todos', ...LOTTERY_GAMES.map(g => g.name)];

export function ResultsPage() {
  const { user, isDemo } = useAuth();
  const { results, isLoading, error } = useResults();
  const { tickets: hookTickets, isLoading: isLoadingTickets } = useTickets();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [comparingResult, setComparingResult] = useState<ResultDto | null>(null);

  // Usamos los tickets del hook useTickets
  const tickets = hookTickets;

  const filtered = results.filter(r => {
    if (activeFilter === 'Todos') return true;
    const game = LOTTERY_GAMES.find(g => g.id === r.gameId);
    return game?.name === activeFilter;
  });

  const openComparison = (result: ResultDto) => {
    setComparingResult(result);
  };

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
      <div className="relative z-10 flex flex-col gap-4 p-4">
        <section className="px-1 pt-0.5 flex items-center justify-between results-header">
          <div>
            <h2 className="text-sm font-black text-manises-blue uppercase tracking-widest mb-1">Resultados</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Últimos sorteos oficiales registrados</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-manises-gold/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-manises-gold" />
          </div>
        </section>

      {/* Filtros horizontales — Limpio y Funcional */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
        {GAME_FILTERS.map(f => (
          <PremiumTouchInteraction key={f} scale={0.95}>
            <button
              onClick={() => setActiveFilter(f)}
              className={cn(
                'filter-chip text-[11px] font-bold px-5 py-2.5 rounded-xl whitespace-nowrap border transition-all shrink-0 uppercase tracking-widest',
                activeFilter === f
                  ? 'bg-manises-blue text-white border-manises-blue shadow-md'
                  : 'bg-white text-manises-blue/60 border-manises-blue/5 hover:border-manises-blue/20'
              )}
            >
              {f}
            </button>
          </PremiumTouchInteraction>
        ))}
      </div>

      {/* Resultados */}
      <div className="flex flex-col gap-3">
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

        {!isLoading && !error && filtered.map((result, index) => {
          const game = LOTTERY_GAMES.find(g => g.id === result.gameId);
          if (!game) return null;
          const theme = getGameTheme(game);
          
          const userTicketsForSort = tickets.filter(t => 
            t.gameId === result.gameId && 
            t.drawDate === getBusinessDate(result.date)
          );

          return (
            <div
              key={`${result.gameId}-${result.date}`}
              className="result-card bg-card rounded-2xl border border-white/80 overflow-hidden surface-neo-soft"
            >
              <div className="h-1" style={{ backgroundColor: game.color }} />

              <div className="p-4" style={theme.surface}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <GameBadge game={game} size="sm" />
                    <div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-pill border text-[9px] font-bold uppercase tracking-wider mb-1" style={theme.chip}>
                        {game.name}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {formatDate(result.date)}
                      </p>
                    </div>
                  </div>
                  <PremiumTouchInteraction scale={0.94}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 rounded-lg text-[10px] font-bold text-manises-blue bg-manises-blue/5 hover:bg-manises-blue/10"
                      onClick={() => openComparison(result)}
                    >
                      <CheckSquare className="w-3.5 h-3.5 mr-1" />
                      Comparar {userTicketsForSort.length > 0 && `(${userTicketsForSort.length})`}
                    </Button>
                  </PremiumTouchInteraction>
                </div>

                {LOTTERY_GAMES.find(g => g.id === result.gameId)?.type !== 'loteria-nacional' ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.numbers.map((n: any, i: number) => (
                      <NumberBall key={i} number={n} variant="default" size="sm" />
                    ))}
                    {result.stars?.map((s: any, i: number) => (
                      <NumberBall key={`s-${i}`} number={s} variant="gold" size="sm" />
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
                  <div className="mb-3 rounded-2xl border border-manises-blue/15 bg-[linear-gradient(135deg,rgba(10,25,47,0.06)_0%,rgba(227,182,87,0.09)_100%)] p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1º Premio</p>
                      <p className="font-black text-manises-blue text-lg tracking-[0.08em]">
                        {Array.isArray(result.numbers) ? result.numbers.join('') : result.numbers}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reintegros</p>
                      <div className="flex gap-2">
                        {result.reintegros?.map((digit: number) => (
                          <span key={digit} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-manises-blue/10 px-2 text-[10px] font-black text-manises-blue">
                            {digit}
                          </span>
                        )) ?? result.numbers.slice(0, 3).map((digit: number) => (
                          <span key={digit} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-manises-blue/10 px-2 text-[10px] font-black text-manises-blue">
                            {digit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {LOTTERY_GAMES.find(g => g.id === result.gameId)?.type === 'loteria-nacional' ? 'Premio principal por décimo: ' : 'Siguiente sorteo: '}
                    <span className="font-bold" style={theme.title}>
                      {(result.jackpotNext || 0) >= 1_000_000
                        ? `${((result.jackpotNext || 0) / 1_000_000).toFixed(0)}M €`
                        : `${(result.jackpotNext || 0).toLocaleString('es-ES')} €`}
                    </span>
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
    </div>
  );
}
