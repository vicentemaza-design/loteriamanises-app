import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { GameBadge } from '@/shared/ui/GameBadge';
import { NumberBall, NumberBallLabeled } from '@/shared/ui/NumberBall';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '@/shared/lib/utils';
import { Trophy, TrendingUp, CheckSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { ComparisonModal } from '../components/ComparisonModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { db } from '@/shared/config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Ticket } from '@/shared/types/domain';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Datos de muestra — en producción vendrían de un servicio
const MOCK_RESULTS = [
  {
    gameId: 'euromillones',
    date: '2026-04-08T21:00:00Z',
    numbers: [12, 23, 34, 45, 48],
    stars: [3, 7],
    jackpotNext: 130_000_000,
  },
  {
    gameId: 'primitiva',
    date: '2026-04-08T21:30:00Z',
    numbers: [4, 15, 22, 31, 40, 49],
    complementario: 12,
    reintegro: 5,
    jackpotNext: 12_500_000,
  },
  {
    gameId: 'bonoloto',
    date: '2026-04-09T21:30:00Z',
    numbers: [1, 8, 14, 25, 33, 42],
    complementario: 3,
    reintegro: 0,
    jackpotNext: 1_200_000,
  },
  {
    gameId: 'gordo',
    date: '2026-04-06T13:00:00Z',
    numbers: [2, 17, 28, 35, 51],
    stars: [7],
    jackpotNext: 5_400_000,
  },
  {
    gameId: 'loteria-nacional',
    date: '2026-04-11T12:00:00Z',
    numbers: [6, 9, 8, 4, 4],
    firstPrizeNumber: '69844',
    secondPrizeNumber: '15432',
    reintegros: [4, 7, 9],
    decimoPrice: 6,
    jackpotNext: 60_000,
  },
];

// Tickets de muestra para el modo demo (para que funcione el comparador)
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
    gameId: 'loteria-nacional',
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
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comparingResult, setComparingResult] = useState<any | null>(null);

  useEffect(() => {
    if (isDemo) {
      setTickets(DEMO_TICKETS);
      return;
    }
    if (!user) return;
    const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Ticket[]);
    });
    return () => unsub();
  }, [user]);

  const filtered = MOCK_RESULTS.filter(r => {
    if (activeFilter === 'Todos') return true;
    const game = LOTTERY_GAMES.find(g => g.id === r.gameId);
    return game?.name === activeFilter;
  });

  const openComparison = (result: any) => {
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

    gsap.from('.filter-chip', {
      x: 30,
      opacity: 0,
      stagger: 0.05,
      duration: 0.6,
      ease: 'back.out(1.7)'
    });

    gsap.from('.result-card', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, [activeFilter, filtered.length]);

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

      {/* Filtros horizontales */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 rounded-2xl border border-white/70 bg-white/70 p-2">
        {GAME_FILTERS.map(f => (
          <PremiumTouchInteraction key={f} scale={0.95}>
            <button
              onClick={() => setActiveFilter(f)}
              className={cn(
                'filter-chip text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border transition-all shrink-0',
                activeFilter === f
                  ? 'bg-manises-blue text-white border-manises-blue'
                  : 'bg-white/85 text-muted-foreground border-border hover:border-manises-blue/30'
              )}
            >
              {f}
            </button>
          </PremiumTouchInteraction>
        ))}
      </div>

      {/* Resultados */}
      <div className="flex flex-col gap-3">
        {filtered.map((result, index) => {
          const game = LOTTERY_GAMES.find(g => g.id === result.gameId);
          if (!game) return null;
          const theme = getGameTheme(game);
          
          const userTicketsForSort = tickets.filter(t => 
            t.gameId === result.gameId && 
            t.drawDate === result.date.split('T')[0]
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

                {result.gameId !== 'loteria-nacional' ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.numbers.map((n, i) => (
                      <NumberBall key={i} number={n} variant="default" size="sm" />
                    ))}
                    {result.stars?.map((s, i) => (
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
                      <p className="font-black text-manises-blue text-lg tracking-[0.08em]">{result.firstPrizeNumber}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">2º Premio</p>
                      <p className="font-black text-manises-blue text-base tracking-[0.08em]">{result.secondPrizeNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reintegros</p>
                      {result.reintegros?.map((digit: number) => (
                        <span key={digit} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-manises-blue/10 px-2 text-[10px] font-black text-manises-blue">
                          {digit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {result.gameId === 'loteria-nacional' ? 'Premio principal por décimo: ' : 'Siguiente sorteo: '}
                    <span className="font-bold" style={theme.title}>
                      {result.jackpotNext >= 1_000_000
                        ? `${(result.jackpotNext / 1_000_000).toFixed(0)}M €`
                        : `${result.jackpotNext.toLocaleString('es-ES')} €`}
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
          t.drawDate === comparingResult.date.split('T')[0]
        ) : []}
      />
      </div>
    </div>
  );
}
