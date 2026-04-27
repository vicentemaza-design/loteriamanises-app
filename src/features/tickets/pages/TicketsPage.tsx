import { useMemo, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { GameBadge } from '@/shared/ui/GameBadge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatDate, formatCurrency, cn } from '@/shared/lib/utils';
import { getBusinessDate } from '@/shared/lib/timezone';
import {
  Ticket as TicketIcon,
  Search,
  Shield,
  Sparkles,
  ChevronDown,
  Repeat2,
  Archive,
  ScrollText,
  CheckCircle2,
  CalendarDays,
  ReceiptText,
  Hash,
  Wallet,
  Target,
  Maximize2,
  FileCheck2,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { TicketCardSkeleton } from '@/shared/ui/Skeleton';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useResults } from '@/features/results/hooks/useResults';
import { ComparisonModal } from '@/features/results/components/ComparisonModal';
import { toast } from 'sonner';
import type { Ticket } from '@/shared/types/domain';
import { getGameIdentity } from '@/shared/lib/game-identity';

gsap.registerPlugin(useGSAP);

type Tab = 'activos' | 'historial';

type ScrutinyState =
  | { ticket: Ticket; result: any }
  | { ticket: Ticket; result: null }
  | null;

function getTicketCode(ticketId: string) {
  return ticketId.slice(-8).toUpperCase();
}

function getTicketResultMatch(ticket: Ticket, results: any[]) {
  return results.find((result) => (
    result.gameId === ticket.gameId &&
    ticket.drawDate === getBusinessDate(result.date)
  )) ?? null;
}

function getMatchedValues(ticket: Ticket, result: any | null) {
  if (!result || ticket.gameType === 'loteria-nacional' || ticket.gameType === 'navidad' || ticket.gameType === 'nino') {
    return { numbers: [] as number[], stars: [] as number[] };
  }

  return {
    numbers: ticket.numbers.filter((value) => result.numbers?.includes(value)),
    stars: ticket.stars?.filter((value) => result.stars?.includes(value)) ?? [],
  };
}

function isNationalTicket(ticket: Ticket) {
  return ticket.gameType === 'loteria-nacional' || ticket.gameType === 'navidad' || ticket.gameType === 'nino';
}

function getTicketDisplayNumber(ticket: Ticket) {
  if (ticket.metadata?.nationalNumber) return ticket.metadata.nationalNumber;
  if (isNationalTicket(ticket)) return ticket.numbers.join('');
  return ticket.numbers.join(', ');
}

function getOrderDrawDates(ticket: Ticket) {
  return Array.isArray(ticket.metadata?.orderDrawDates) ? ticket.metadata.orderDrawDates : [ticket.drawDate];
}

function formatCompactDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function getOrderDatesSummary(ticket: Ticket) {
  const dates = getOrderDrawDates(ticket);
  if (dates.length === 1) return formatDate(dates[0]);

  const visibleDates = dates.slice(0, 3).map(formatCompactDate).join(', ');
  return dates.length > 3 ? `${visibleDates} y ${dates.length - 3} más` : visibleDates;
}

function getNationalQuantity(ticket: Ticket) {
  return typeof ticket.metadata?.nationalQuantity === 'number' ? ticket.metadata.nationalQuantity : undefined;
}

function getOrderTotal(ticket: Ticket) {
  return typeof ticket.metadata?.orderTotalPrice === 'number' ? ticket.metadata.orderTotalPrice : ticket.price;
}

function getCompactSelectionSummary(ticket: Ticket) {
  if (isNationalTicket(ticket)) {
    const number = getTicketDisplayNumber(ticket);
    const quantity = getNationalQuantity(ticket);
    const drawCount = getOrderDrawDates(ticket).length;
    const quantityLabel = quantity
      ? `${quantity} ${quantity === 1 ? 'décimo' : 'décimos'}`
      : null;
    const drawLabel = drawCount > 1 ? `${drawCount} sorteos` : null;

    return [number ? `Nº ${number}` : null, quantityLabel, drawLabel].filter(Boolean).join(' · ');
  }

  const starsLabel = ticket.stars && ticket.stars.length > 0 ? ` + ${ticket.stars.join(', ')}` : '';
  return `${ticket.numbers.join(', ')}${starsLabel}`;
}

function getScrutinyTone(ticket: Ticket, result: any | null) {
  if (!result) {
    return {
      label: 'Sin resumen',
      helper: 'Detalle completo pendiente de integración',
    };
  }

  if (ticket.status === 'pending') {
    return {
      label: 'Resumen disponible',
      helper: 'Resultado cargado, escrutinio completo pendiente',
    };
  }

  return {
    label: 'Ver resumen',
    helper: 'Lectura disponible con el modelo actual',
  };
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all active:scale-[0.97]',
        tone === 'danger'
          ? 'border-red-100 bg-red-50 text-red-700 hover:border-red-200'
          : 'border-gray-100 bg-white text-manises-blue hover:border-manises-blue/20 hover:bg-manises-blue/[0.04]'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

/**
 * Visualización de bolas y aciertos para juegos de azar.
 */
function BallSelection({ 
  numbers, 
  stars, 
  matchedNumbers = [], 
  matchedStars = [], 
  gameColor,
  type
}: { 
  numbers: number[]; 
  stars?: number[]; 
  matchedNumbers?: number[]; 
  matchedStars?: number[]; 
  gameColor: string;
  type?: string;
}) {
  const isGordo = type === 'gordo';
  const isEuroDreams = type === 'eurodreams';

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-wrap gap-1.5">
        {numbers.map((n) => (
          <div
            key={n}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-all",
              matchedNumbers.includes(n)
                ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "border-slate-200 bg-white text-slate-600"
            )}
          >
            {n}
          </div>
        ))}
      </div>
      {stars && stars.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-l border-slate-100 pl-2">
          {stars.map((s) => (
            <div
              key={s}
              className={cn(
                "relative flex h-7 w-7 items-center justify-center text-[10px] font-bold transition-all",
                isGordo ? "rounded-lg border" : "star-shape",
                matchedStars.includes(s)
                  ? isGordo 
                    ? "border-amber-500 bg-amber-500 text-white shadow-md"
                    : "text-white drop-shadow-md"
                  : isGordo
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "text-amber-500"
              )}
              style={!isGordo && matchedStars.includes(s) ? { 
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                backgroundColor: '#f59e0b'
              } : !isGordo ? {
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                backgroundColor: '#fef3c7'
              } : {}}
            >
              <span className="relative z-10">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Previsualización mock de un décimo de Lotería Nacional.
 */
function NationalDecimoCard({ ticket }: { ticket: Ticket }) {
  const number = getTicketDisplayNumber(ticket);
  const series = '167'; // Mock
  const fraction = '4'; // Mock
  
  return (
    <div className="relative overflow-hidden rounded-2xl border border-manises-blue/10 bg-[#fffdf5] shadow-inner">
      <div className="absolute right-0 top-0 rounded-bl-xl bg-manises-gold/10 px-2 py-1 text-[8px] font-black uppercase text-manises-gold">
        DEMO · No real
      </div>
      
      <div className="flex p-4">
        {/* Imagen del décimo (Placeholder premium) */}
        <div className="mr-4 flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-manises-blue/5 bg-white p-2 shadow-sm">
          <div className="h-full w-full rounded bg-manises-blue/5 flex items-center justify-center">
            <Target className="h-8 w-8 text-manises-blue/20" />
          </div>
          <p className="mt-1 text-[6px] font-bold text-slate-300">ADMIN. 6</p>
        </div>
        
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-manises-blue/40">Lotería Nacional</p>
            <h4 className="text-sm font-black text-manises-blue">Sorteo del Jueves</h4>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="block text-[28px] font-black leading-none tracking-tighter text-manises-blue">
                {number.padStart(5, '0')}
              </span>
              <div className="flex gap-2 text-[9px] font-bold text-slate-400">
                <span>SERIE {series}</span>
                <span>FRACCIÓN {fraction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-dashed border-manises-blue/10 bg-manises-blue/[0.02] p-2 text-center">
        <p className="text-[8px] font-bold uppercase tracking-widest text-manises-blue/30">
          Custodiado en Administración Nº 6 · Manises
        </p>
      </div>
    </div>
  );
}

/**
 * Modal tipo resguardo térmico (Thermal Receipt Mock).
 */
function TicketReceiptModal({ ticket, onClose }: { ticket: Ticket | null; onClose: () => void }) {
  if (!ticket) return null;
  const game = LOTTERY_GAMES.find(g => g.id === ticket.gameId);
  const code = getTicketCode(ticket.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-2xl"
        >
          <div className="rounded-[2.2rem] border-2 border-slate-50 bg-white p-6 pt-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-manises-blue/5 text-manises-blue">
                <ReceiptText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-manises-blue uppercase tracking-tight">Resguardo de Apuesta</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lotería Manises · Admin. Nº 6</p>
            </div>

            <div className="space-y-4 font-mono text-[11px] text-slate-600">
              <div className="border-y border-dashed border-slate-200 py-3 space-y-2">
                <div className="flex justify-between">
                  <span>JUEGO:</span>
                  <span className="font-bold text-manises-blue">{game?.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>FECHA SORTEO:</span>
                  <span className="font-bold text-manises-blue">{formatDate(ticket.drawDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CÓDIGO:</span>
                  <span className="font-bold text-manises-blue">{code}</span>
                </div>
              </div>

              <div className="py-2">
                <p className="mb-2 text-center text-[10px] font-bold text-slate-400">COMBINACIÓN</p>
                <div className="text-center text-sm font-bold text-manises-blue tracking-wider">
                  {ticket.numbers.join('  ')}
                  {ticket.stars && ticket.stars.length > 0 && `  +  ${ticket.stars.join('  ')}`}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>IMPORTE TOTAL:</span>
                  <span className="font-bold">{formatCurrency(ticket.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EMITIDO:</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="h-10 w-full rounded-lg bg-slate-50 flex items-center justify-center opacity-30">
                {/* Mock barcode */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="bg-slate-900" style={{ width: i % 3 === 0 ? '2px' : '1px', height: '24px' }} />
                  ))}
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">DEMO · SIN VALIDEZ OFICIAL</p>
              <Button variant="outline" className="w-full rounded-2xl h-12" onClick={onClose}>
                Cerrar resguardo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ScrutinyFallbackModal({
  state,
  onClose,
}: {
  state: ScrutinyState;
  onClose: () => void;
}) {
  if (!state || state.result) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%', opacity: 0.96 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0.96 }}
          className="relative flex w-full max-w-md flex-col gap-4 rounded-t-[2rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_24px_50px_rgba(10,25,47,0.28)] sm:rounded-[2rem]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Escrutinio</p>
              <h3 className="mt-1 text-base font-black text-manises-blue">Detalle no disponible todavía</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={onClose}>
              <ChevronDown className="h-5 w-5 rotate-180" />
            </Button>
          </div>

          <div className="rounded-2xl border border-manises-blue/10 bg-white/90 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-manises-blue">
              Jugada {getTicketCode(state.ticket.id)}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
              No hay un resultado compatible para esta jugada o el detalle de escrutinio todavía no está integrado en el frontend actual.
            </p>
            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              Resumen disponible: código, fecha, importe y estado de la jugada.
            </p>
          </div>

          <Button className="rounded-2xl" onClick={onClose}>
            Entendido
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function TicketsPage() {
  const navigate = useNavigate();
  const { tickets, isLoading, error } = useTickets();
  const { results } = useResults();
  const [tab, setTab] = useState<Tab>('activos');
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [receiptTicket, setReceiptTicket] = useState<Ticket | null>(null);
  const [scrutinyState, setScrutinyState] = useState<ScrutinyState>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTickets = tickets.filter((ticket) => {
    const game = LOTTERY_GAMES.find((g) => g.id === ticket.gameId);
    if (!game) return false;
    const searchTerm = search.toLowerCase();
    const nameMatch = game.name.toLowerCase().includes(searchTerm);
    const numberMatch = getTicketDisplayNumber(ticket).includes(search);
    return search === '' || nameMatch || numberMatch;
  });

  const visibleTickets = filteredTickets.filter((ticket) => !archivedIds.includes(ticket.id));
  const activeTickets = visibleTickets.filter((ticket) => ticket.status === 'pending');
  const historyTickets = visibleTickets.filter((ticket) => ticket.status !== 'pending');
  
  const tabTickets = tab === 'activos' 
    ? activeTickets 
    : historyTickets.filter((t) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'won') return t.status === 'won';
        if (statusFilter === 'lost') return t.status === 'lost';
        return true;
      });

  const availableGames = useMemo(() => {
    const seen = new Set<string>();
    return tabTickets.reduce<Array<{ id: string; name: string }>>((acc, t) => {
      if (!seen.has(t.gameId)) {
        seen.add(t.gameId);
        const g = LOTTERY_GAMES.find((x) => x.id === t.gameId);
        if (g) acc.push({ id: g.id, name: getGameIdentity(g).shortName });
      }
      return acc;
    }, []);
  }, [tabTickets]);

  const displayed = gameFilter === 'all'
    ? tabTickets
    : tabTickets.filter((t) => t.gameId === gameFilter);

  const resultMap = useMemo(() => {
    return new Map(displayed.map((ticket) => [ticket.id, getTicketResultMatch(ticket, results)]));
  }, [displayed, results]);

  useGSAP(() => {
    if (isLoading) return;

    gsap.fromTo(
      '.tickets-header > *',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
    );

    gsap.fromTo(
      '.tabs-container',
      { scale: 0.98, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2, clearProps: 'all' }
    );

    const cards = gsap.utils.toArray('.ticket-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, { scope: containerRef, dependencies: [tab, isLoading, displayed.length] });

  return (
    <>
      <div className="flex min-h-full flex-col gap-4 overflow-x-hidden bg-background pb-24" ref={containerRef}>
        <section className="tickets-header space-y-4 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-sm font-black uppercase tracking-widest text-manises-blue">Mis Jugadas</h2>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vista compacta para operativa intensiva</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-manises-blue/5">
              <TicketIcon className="h-5 w-5 text-manises-blue" />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-manises-blue/40" />
            <Input
              placeholder="Buscar por juego o número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-2xl border-gray-100 bg-white pl-11 shadow-sm focus:ring-manises-blue/20"
            />
          </div>
        </section>

        <section className="tabs-container px-5">
          <div className="flex gap-1.5 rounded-2xl border border-gray-100/50 bg-gray-100/50 p-1.5 backdrop-blur-md">
            {(['activos', 'historial'] as Tab[]).map((currentTab) => (
              <PremiumTouchInteraction key={currentTab} scale={0.96} className="flex-1">
                <button
                  onClick={() => { setTab(currentTab); setGameFilter('all'); }}
                  className={cn(
                    'w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider transition-all',
                    tab === currentTab
                      ? 'scale-[1.02] bg-white text-manises-blue shadow-md'
                      : 'text-manises-blue/40 hover:text-manises-blue'
                  )}
                >
                  {currentTab === 'activos' ? `Activos (${activeTickets.length})` : `Historial (${historyTickets.length})`}
                </button>
              </PremiumTouchInteraction>
            ))}
          </div>
        </section>

        {availableGames.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-0 px-5">
            <button
              onClick={() => setGameFilter('all')}
              className={cn(
                'shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all',
                gameFilter === 'all'
                  ? 'bg-manises-blue text-white border-manises-blue shadow-sm'
                  : 'bg-white text-manises-blue/55 border-manises-blue/10 hover:border-manises-blue/25'
              )}
            >
              Todos
            </button>
            {availableGames.map((g) => (
              <button
                key={g.id}
                onClick={() => setGameFilter(g.id)}
                className={cn(
                  'shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all',
                  gameFilter === g.id
                    ? 'bg-manises-blue text-white border-manises-blue shadow-sm'
                    : 'bg-white text-manises-blue/55 border-manises-blue/10 hover:border-manises-blue/25'
                )}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {tab === 'historial' && (
          <div className="flex gap-2 px-5">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all',
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('won')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all',
                statusFilter === 'won'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-white text-emerald-500/60 border-emerald-100 hover:border-emerald-200'
              )}
            >
              <Trophy className="h-3 w-3" />
              Premiados
            </button>
            <button
              onClick={() => setStatusFilter('lost')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all',
                statusFilter === 'lost'
                  ? 'bg-slate-200 text-slate-700 border-slate-200 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              )}
            >
              <XCircle className="h-3 w-3" />
              No premiados
            </button>
          </div>
        )}

        <section className="min-h-[400px] flex-1 px-5">
          {isLoading ? (
            <div className="flex flex-col gap-3.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <TicketCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="pt-12">
              <EmptyState
                icon={<TicketIcon className="h-10 w-10 text-manises-blue/20" />}
                title={search ? 'Sin coincidencias' : `Sin jugadas ${tab}`}
                description={
                  search
                    ? `No hemos encontrado apuestas para "${search}".`
                    : tab === 'activos'
                      ? 'Tus próximas apuestas aparecerán aquí en cuanto las realices.'
                      : 'Todavía no tienes sorteos resueltos en tu historial.'
                }
                action={!search && tab === 'activos' ? { label: 'Empezar a jugar', onClick: () => navigate('/games') } : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {displayed.map((ticket) => {
                const game = LOTTERY_GAMES.find((entry) => entry.id === ticket.gameId);
                if (!game) return null;

                const isExpanded = expandedIds.includes(ticket.id);
                const matchingResult = resultMap.get(ticket.id) ?? null;
                const matched = getMatchedValues(ticket, matchingResult);
                const totalHits = matched.numbers.length + matched.stars.length;
                const hasResolvedDraw = ticket.status !== 'pending' && Boolean(matchingResult);
                const nationalTicket = isNationalTicket(ticket);
                const ticketDisplayNumber = getTicketDisplayNumber(ticket);
                const nationalQuantity = getNationalQuantity(ticket);
                const orderDates = getOrderDrawDates(ticket);
                const orderDatesSummary = getOrderDatesSummary(ticket);
                const orderTotal = getOrderTotal(ticket);
                const orderDrawLabel = orderDates.length === 1 ? 'Fecha' : 'Fechas';
                const identity = getGameIdentity(game);
                const scrutinyTone = getScrutinyTone(ticket, matchingResult);
                const matchedValuesSummary = [
                  matched.numbers.length > 0 ? matched.numbers.join(', ') : '',
                  matched.stars.length > 0 ? `Estrellas ${matched.stars.join(', ')}` : '',
                ].filter(Boolean).join(' · ');

                return (
                  <PremiumTouchInteraction key={ticket.id} scale={0.985}>
                    <div className="ticket-card relative overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all">
                      <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: game.color }} />

                      <div className="p-3 pl-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="flex min-w-0 flex-1 items-start gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md" style={{ backgroundColor: game.color }}>
                              <GameBadge game={game} size="sm" variant="white" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="truncate text-[12px] font-black uppercase leading-tight text-manises-blue">{identity.shortName}</h3>
                                {ticket.isSubscription && <Sparkles className="h-3 w-3 shrink-0 fill-current text-manises-gold" />}
                                {ticket.hasInsurance && <Shield className="h-3 w-3 shrink-0 text-manises-gold" />}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{formatDate(ticket.drawDate)}</p>
                                <span className="text-slate-300">·</span>
                                <p className="text-[11px] font-black text-manises-blue">{formatCurrency(ticket.price ?? 0)}</p>
                                <span className="text-slate-300">·</span>
                                <StatusBadge status={ticket.status} className="px-1.5 py-0 text-[9px]" />
                              </div>

                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedIds((current) => current.includes(ticket.id) ? current.filter((id) => id !== ticket.id) : [...current, ticket.id])}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-manises-blue transition-all hover:border-manises-blue/20 hover:bg-manises-blue/[0.04]"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Ocultar detalle' : 'Mostrar detalle'}
                          >
                            <ChevronDown className={cn('h-4.5 w-4.5 transition-transform', isExpanded && 'rotate-180')} />
                          </button>
                        </div>

                        <div className="mt-2.5 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-black text-manises-blue">
                              {getCompactSelectionSummary(ticket)}
                            </p>
                            {hasResolvedDraw && totalHits > 0 && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                                  <Target className="h-3 w-3" />
                                  {totalHits} {totalHits === 1 ? 'acierto' : 'aciertos'}
                                </span>
                                {matchedValuesSummary && (
                                  <span className="truncate text-[10px] font-semibold text-emerald-700">
                                    {matchedValuesSummary}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {ticket.status === 'won' && ticket.prize != null && (
                            <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-right">
                              <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-emerald-600">Premio</span>
                              <span className="block text-xs font-black leading-none text-emerald-700">{formatCurrency(ticket.prize)}</span>
                            </div>
                          )}
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-3">
                                {nationalTicket ? (
                                  <NationalDecimoCard ticket={ticket} />
                                ) : (
                                  <div className="rounded-xl border border-white bg-white/90 p-3">
                                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Combinación</p>
                                    <BallSelection 
                                      numbers={ticket.numbers} 
                                      stars={ticket.stars} 
                                      matchedNumbers={matched.numbers}
                                      matchedStars={matched.stars}
                                      gameColor={game.color}
                                      type={game.type}
                                    />
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="rounded-xl border border-white/50 bg-white/40 p-2">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <Hash className="h-3 w-3" />
                                      <p className="text-[8px] font-black uppercase tracking-[0.14em]">Código</p>
                                    </div>
                                    <p className="mt-0.5 text-[11px] font-black text-manises-blue">{getTicketCode(ticket.id)}</p>
                                  </div>
                                  <div className="rounded-xl border border-white/50 bg-white/40 p-2">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <ReceiptText className="h-3 w-3" />
                                      <p className="text-[8px] font-black uppercase tracking-[0.14em]">Pedido</p>
                                    </div>
                                    <p className="mt-0.5 truncate text-[11px] font-black text-manises-blue">
                                      {ticket.orderId ? ticket.orderId.slice(-8).toUpperCase() : 'Individual'}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-white/50 bg-white/40 p-2">
                                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Creada</p>
                                    <p className="mt-0.5 text-[11px] font-black text-manises-blue">{formatDate(ticket.createdAt)}</p>
                                  </div>
                                  <div className="rounded-xl border border-white/50 bg-white/40 p-2">
                                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Extras</p>
                                    <p className="mt-0.5 text-[11px] font-black text-manises-blue">
                                      {[
                                        ticket.hasInsurance ? 'Seguro' : null,
                                        ticket.isSubscription ? 'Abono' : null,
                                        !ticket.hasInsurance && !ticket.isSubscription ? 'Ninguno' : null
                                      ].filter(Boolean).join(' · ')}
                                    </p>
                                  </div>
                                </div>

                                {hasResolvedDraw && totalHits > 0 && (
                                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
                                    <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-emerald-700" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Aciertos detectados</p>
                                    </div>
                                    <p className="mt-1 text-[11px] font-semibold text-emerald-800">
                                      {totalHits} {totalHits === 1 ? 'acierto' : 'aciertos'} en total.
                                    </p>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <QuickActionButton
                                    icon={Repeat2}
                                    label="Repetir"
                                    onClick={() => navigate(`/play/${ticket.gameId}`)}
                                  />
                                  <QuickActionButton
                                    icon={Maximize2}
                                    label={nationalTicket ? "Ver Décimo" : "Ver Resguardo"}
                                    onClick={() => setReceiptTicket(ticket)}
                                  />
                                  <QuickActionButton
                                    icon={Archive}
                                    label="Archivar"
                                    tone="danger"
                                    onClick={() => {
                                      setArchivedIds((current) => current.includes(ticket.id) ? current : [...current, ticket.id]);
                                      toast.success('Jugada archivada');
                                    }}
                                  />
                                  <div className="h-4 w-px bg-slate-200 mx-1" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      'h-9 rounded-xl px-2.5 text-[10px] font-black uppercase tracking-[0.12em]',
                                      matchingResult
                                        ? 'bg-manises-blue/[0.04] text-manises-blue'
                                        : 'text-slate-400'
                                    )}
                                    onClick={() => setScrutinyState({ ticket, result: matchingResult })}
                                  >
                                    <ScrollText className="mr-1.5 h-3.5 w-3.5" />
                                    {scrutinyTone.label}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </PremiumTouchInteraction>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-4 px-6 opacity-50">
          <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-manises-blue/20">
            Juego Responsable · +18 · Lotería Manises
          </p>
        </div>
      </div>

      <ComparisonModal
        isOpen={!!scrutinyState?.result}
        onClose={() => setScrutinyState(null)}
        result={scrutinyState?.result || { numbers: [], date: '', gameId: '' }}
        userTickets={scrutinyState?.ticket ? [scrutinyState.ticket] : []}
      />

      <ScrutinyFallbackModal
        state={scrutinyState}
        onClose={() => setScrutinyState(null)}
      />

      <TicketReceiptModal
        ticket={receiptTicket}
        onClose={() => setReceiptTicket(null)}
      />
    </>
  );
}
