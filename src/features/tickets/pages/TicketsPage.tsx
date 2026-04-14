import { useEffect, useRef, useState } from 'react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { NumberBall } from '@/shared/ui/NumberBall';
import { GameBadge } from '@/shared/ui/GameBadge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatDate, formatCurrency } from '@/shared/lib/utils';
import { 
  Ticket as TicketIcon, 
  Clock, 
  Search, 
  Shield, 
  RefreshCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { db } from '@/shared/config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { Ticket } from '@/shared/types/domain';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { getGameTheme } from '@/shared/lib/game-theme';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

type Tab = 'activos' | 'historial';

// Tickets de muestra para el modo demo
const DEMO_TICKETS: Ticket[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    gameId: 'euromillones',
    gameType: 'euromillones',
    numbers: [7, 14, 23, 38, 47],
    stars: [3, 9],
    drawDate: '2026-04-11',
    status: 'pending',
    price: 3.00,
    hasInsurance: true,
    isSubscription: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-1b',
    userId: 'demo-user',
    gameId: 'loteria-nacional',
    gameType: 'loteria-nacional',
    numbers: [3, 14, 25, 41, 59, 73],
    drawDate: '2026-04-13',
    status: 'pending',
    price: 6.00,
    hasInsurance: true,
    isSubscription: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    gameId: 'primitiva',
    gameType: 'primitiva',
    numbers: [5, 12, 21, 30, 44, 49],
    drawDate: '2026-04-08',
    status: 'lost',
    price: 1.00,
    hasInsurance: false,
    isSubscription: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    gameId: 'bonoloto',
    gameType: 'bonoloto',
    numbers: [2, 9, 18, 27, 33, 41],
    drawDate: '2026-04-06',
    status: 'won',
    prize: 15.40,
    price: 0.50,
    hasInsurance: false,
    isSubscription: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'demo-4',
    userId: 'demo-user',
    gameId: 'quiniela',
    gameType: 'quiniela',
    numbers: [1, 2, 1, 0, 2, 1],
    drawDate: '2026-04-05',
    status: 'won',
    prize: 128.00,
    price: 2.00,
    hasInsurance: false,
    isSubscription: false,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const LEGACY_GAME_ID_MAP: Record<string, string> = {
  'loteria-sabado': 'loteria-nacional',
};

function normalizeTicketGameId(ticket: Ticket): Ticket {
  const normalizedGameId = LEGACY_GAME_ID_MAP[ticket.gameId] ?? ticket.gameId;
  return normalizedGameId === ticket.gameId
    ? ticket
    : { ...ticket, gameId: normalizedGameId };
}

export function TicketsPage() {
  const { user, isDemo } = useAuth();
  const navigate  = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>('activos');
  const [search, setSearch]   = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDemo) {
      setTickets(DEMO_TICKETS);
      setLoading(false);
      return;
    }
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, snap => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Ticket[];
      const normalized = fetched.map(normalizeTicketGameId);
      const valid = normalized.filter((ticket) =>
        LOTTERY_GAMES.some((game) => game.id === ticket.gameId)
      );

      // Si no hay jugadas válidas, mostramos ejemplos demo para evitar pantalla vacía.
      if (valid.length === 0) {
        setTickets(DEMO_TICKETS.map(t => ({ ...t, userId: user.uid })));
      } else {
        setTickets(valid);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firebase query failed, using fallback.', error);
      setTickets(DEMO_TICKETS.map(t => ({ ...t, userId: user.uid })));
      setLoading(false);
    });
    return () => unsub();
  }, [user, isDemo]);

  const filteredTickets = tickets.filter(ticket => {
    const game = LOTTERY_GAMES.find(g => g.id === ticket.gameId);
    if (!game) return false;
    const searchTerm = search.toLowerCase();
    const nameMatch = game.name.toLowerCase().includes(searchTerm);
    const numberMatch = ticket.numbers.some(n => n.toString() === search);
    return search === '' || nameMatch || numberMatch;
  });

  const activeTickets    = filteredTickets.filter(t => t.status === 'pending');
  const historyTickets   = filteredTickets.filter(t => t.status !== 'pending');
  const displayed        = tab === 'activos' ? activeTickets : historyTickets;

  useGSAP(() => {
    if (loading) return;

    // Intro animation for header and tabs using fromTo to avoid React 18 Strict Mode opacity 0 bugs
    gsap.fromTo('.tickets-header > *', 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
    );

    gsap.fromTo('.tabs-container', 
      { scale: 0.98, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2, clearProps: 'all' }
    );

    // Staggered entrance for tickets
    const cards = gsap.utils.toArray('.ticket-card');
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, { scope: containerRef, dependencies: [tab, loading, displayed.length] });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-manises-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-28 bg-background min-h-dvh overflow-x-hidden" ref={containerRef}>
      {/* Search & Intro */}
      <section className="px-5 pt-4 space-y-4 tickets-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-manises-blue uppercase tracking-widest mb-1">Mis Jugadas</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gestiona tus apuestas activas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-manises-blue/5 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-manises-blue" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-manises-blue/40" />
          <Input 
            placeholder="Buscar por juego o número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-white border-gray-100 shadow-sm focus:ring-manises-blue/20"
          />
        </div>
      </section>

      {/* Premium Tabs */}
      <section className="px-5 tabs-container">
        <div className="flex bg-gray-100/50 backdrop-blur-md rounded-2xl p-1.5 gap-1.5 border border-gray-100/50">
          {(['activos', 'historial'] as Tab[]).map(t => (
            <PremiumTouchInteraction key={t} scale={0.96} className="flex-1">
              <button
                onClick={() => setTab(t)}
                className={cn(
                  'w-full text-[11px] font-black py-2.5 rounded-xl transition-all uppercase tracking-wider',
                  tab === t
                    ? 'bg-white text-manises-blue shadow-md scale-[1.02]'
                    : 'text-manises-blue/40 hover:text-manises-blue'
                )}
              >
                {t === 'activos' ? `Activos (${activeTickets.length})` : `Historial (${historyTickets.length})`}
              </button>
            </PremiumTouchInteraction>
          ))}
        </div>
      </section>

      {/* Content List */}
      <section className="px-5 flex-1 min-h-[400px]">
        {displayed.length === 0 ? (
          <div
            className="pt-12"
          >
            <EmptyState
              icon={<TicketIcon className="w-10 h-10 text-manises-blue/20" />}
              title={search ? 'Sin coincidencias' : `Sin jugadas ${tab}`}
              description={
                search 
                  ? `No hemos encontrado apuestas para "${search}".`
                  : tab === 'activos'
                    ? 'Tus próximas apuestas aparecerán aquí en cuanto las realices.'
                    : 'Todavía no tienes sorteos resueltos en tu historial.'
              }
              action={(!search && tab === 'activos') ? { label: 'Empezar a jugar', onClick: () => navigate('/games') } : undefined}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
              {displayed.map((ticket, index) => {
                const game = LOTTERY_GAMES.find(g => g.id === ticket.gameId);
                if (!game) return null;
                const theme = getGameTheme(game);
                
                return (
                  <PremiumTouchInteraction key={ticket.id} scale={0.98}>
                    <div
                      className="ticket-card relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm transition-all group active:scale-[0.98]"
                    >
                      {/* Lateral Game Color Accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: game.color }} />
                      
                      <div className="p-5 pl-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: game.color }}>
                              <GameBadge game={game} size="sm" variant="white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-black text-manises-blue uppercase">{game.name}</h3>
                                {ticket.isSubscription && <Sparkles className="w-3 h-3 text-manises-gold fill-current" />}
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                {formatDate(ticket.drawDate)}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={ticket.status} />
                        </div>

                        {/* Números Premium */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {ticket.numbers.map((n, i) => (
                            <NumberBall key={i} number={n} variant="default" size="sm" />
                          ))}
                          {ticket.stars?.map((s, i) => (
                            <NumberBall key={`s-${i}`} number={s} variant="gold" size="sm" />
                          ))}
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Importe</span>
                               <span className="text-xs font-black text-manises-blue">{formatCurrency(ticket.price ?? 0)}</span>
                             </div>
                             
                             {(ticket.hasInsurance || ticket.isSubscription) && (
                               <div className="flex gap-1.5">
                                 {ticket.hasInsurance && (
                                   <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-manises-gold border border-amber-100/50">
                                     <Shield className="w-3 h-3 fill-current" />
                                   </div>
                                 )}
                                 {ticket.isSubscription && (
                                   <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-manises-blue border border-blue-100/50">
                                     <RefreshCcw className="w-3 h-3" />
                                   </div>
                                 )}
                               </div>
                             )}
                          </div>

                          {ticket.status === 'won' && ticket.prize != null ? (
                            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex flex-col items-end">
                              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">¡PREMIO!</span>
                              <span className="text-sm font-black text-emerald-700 leading-none">
                                 {formatCurrency(ticket.prize)}
                              </span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-manises-blue/5 flex items-center justify-center text-manises-blue opacity-30 group-hover:opacity-100 group-hover:bg-manises-blue group-hover:text-white transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </PremiumTouchInteraction>
                );
              })}
            </div>
          )}
      </section>

      <div className="px-6 mt-4 opacity-50">
        <p className="text-center text-[8px] text-manises-blue/20 font-black uppercase tracking-[0.2em]">
          Juego Responsable · +18 · Lotería Manises
        </p>
      </div>
    </div>
  );
}
