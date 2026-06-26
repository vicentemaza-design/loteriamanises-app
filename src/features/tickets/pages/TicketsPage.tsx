import { useMemo, useRef, useState, useEffect, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GameBadge } from '@/shared/ui/GameBadge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatDate, formatCurrency, cn } from '@/shared/lib/utils';
import {
  Ticket as TicketIcon,
  Search,
  Shield,
  Repeat2,
  ScrollText,
  Eye,
  Plus,
  Minus,
  Truck,
  Bell,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { TicketCardSkeleton } from '@/shared/ui/Skeleton';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';
import type { Ticket } from '@/shared/types/domain';
import { getGameIdentity } from '@/shared/lib/game-identity';
import { TicketReceiptModal } from '../components/TicketReceiptModal';

gsap.registerPlugin(useGSAP);

type Tab = 'activos' | 'historial';
type PlayStatus = 'pending' | 'processing' | 'confirmed' | 'scrutinized' | 'rejected';

function getTicketCode(ticketId: string) {
  return ticketId.slice(-8).toUpperCase();
}

function getPlayStatus(ticket: Ticket): PlayStatus {
  const s = ticket.metadata?.playStatus;
  if (s === 'pending' || s === 'processing' || s === 'confirmed' || s === 'scrutinized' || s === 'rejected') return s;
  if (ticket.status === 'won' || ticket.status === 'lost') return 'scrutinized';
  return 'pending';
}

const PLAY_STATUS_CONFIG: Record<PlayStatus, { label: string; className: string }> = {
  pending:     { label: 'Pendiente',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing:  { label: 'Tramitando',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed:   { label: 'Confirmada',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  scrutinized: { label: 'Escrutada',   className: 'bg-slate-100 text-slate-700 border-slate-200' },
  rejected:    { label: 'Rechazada',   className: 'bg-red-50 text-red-700 border-red-200' },
};

function PlayStatusBadge({ status }: { status: PlayStatus }) {
  const { label, className } = PLAY_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex rounded-full border px-1.5 py-0 text-[9px] font-black uppercase tracking-wider', className)}>
      {label}
    </span>
  );
}

function isNationalTicket(ticket: Ticket) {
  return ticket.gameType === 'loteria-nacional' || ticket.gameType === 'navidad' || ticket.gameType === 'nino';
}

function getNationalQuantity(ticket: Ticket) {
  return typeof ticket.metadata?.nationalQuantity === 'number' ? ticket.metadata.nationalQuantity : undefined;
}

function getOrderDrawDates(ticket: Ticket) {
  return Array.isArray(ticket.metadata?.orderDrawDates) ? ticket.metadata.orderDrawDates : [ticket.drawDate];
}

function formatCompactDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getOrderDatesSummary(ticket: Ticket) {
  const dates = getOrderDrawDates(ticket);
  if (dates.length === 1) return formatDate(dates[0]);
  const first = formatCompactDate(dates[0]);
  const last  = formatCompactDate(dates[dates.length - 1]);
  return `${first} → ${last}`;
}

function getOrderTotal(ticket: Ticket) {
  return typeof ticket.metadata?.orderTotalPrice === 'number' ? ticket.metadata.orderTotalPrice : ticket.price;
}

function getPrizeLabel(ticket: Ticket) {
  if (ticket.prize && ticket.prize > 0) return formatCurrency(ticket.prize);
  if (getPlayStatus(ticket) === 'scrutinized') return '0,00 €';
  return '—';
}

function getTicketDisplayNumber(ticket: Ticket) {
  if (ticket.metadata?.nationalNumber) return ticket.metadata.nationalNumber;
  if (isNationalTicket(ticket)) return ticket.numbers.join('');
  return ticket.numbers.join(' ');
}

function getQuantityLabel(ticket: Ticket): string {
  if (isNationalTicket(ticket)) {
    const qty = getNationalQuantity(ticket) ?? 1;
    return `${qty} ${qty === 1 ? 'décimo' : 'décimos'}`;
  }
  const dates = getOrderDrawDates(ticket);
  const betsCount = typeof ticket.metadata?.betsCount === 'number' ? ticket.metadata.betsCount : 1;
  const betsLabel = `${betsCount} ${betsCount === 1 ? 'apuesta' : 'apuestas'}`;
  if (dates.length > 1) return `${dates.length} sorteos · ${betsLabel}`;
  return betsLabel;
}

function getSelectionSummary(ticket: Ticket): string {
  if (isNationalTicket(ticket)) {
    return (ticket.metadata?.nationalNumber ?? ticket.numbers.join('')).padStart(5, '0');
  }
  const starsLabel = ticket.stars && ticket.stars.length > 0
    ? ` + ${ticket.stars.map(s => String(s).padStart(2, '0')).join(', ')}`
    : '';
  return `${ticket.numbers.map(n => String(n).padStart(2, '0')).join(' ')}${starsLabel}`;
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue transition-all active:scale-[0.97] hover:border-manises-blue/20 hover:bg-manises-blue/[0.04]"
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

export function TicketsPage() {
  const navigate = useNavigate();
  const { tickets, isLoading, error } = useTickets();
  const [tab, setTab] = useState<Tab>('activos');
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [receiptTicket, setReceiptTicket] = useState<Ticket | null>(null);

  useEffect(() => { setGameFilter('all'); }, [statusFilter]);

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTickets = tickets.filter((ticket) => {
    const game = LOTTERY_GAMES.find((g) => g.id === ticket.gameId);
    if (!game) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return game.name.toLowerCase().includes(term) || getTicketDisplayNumber(ticket).includes(search);
  });

  const activeTickets = filteredTickets.filter((t) => {
    const s = getPlayStatus(t);
    return s === 'pending' || s === 'processing' || s === 'confirmed';
  });

  const historyTickets = filteredTickets.filter((t) => {
    const s = getPlayStatus(t);
    return s === 'scrutinized' || s === 'rejected';
  });

  const tabTickets = tab === 'activos'
    ? activeTickets
    : historyTickets.filter((t) => {
        if (statusFilter === 'won') return t.status === 'won';
        if (statusFilter === 'lost') return t.status === 'lost' || getPlayStatus(t) === 'rejected';
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

  const displayed = gameFilter === 'all' ? tabTickets : tabTickets.filter((t) => t.gameId === gameFilter);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  useGSAP(() => {
    if (isLoading) return;
    gsap.fromTo('.tickets-header > *', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all' });
    gsap.fromTo('.tabs-container', { scale: 0.98, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2, clearProps: 'all' });
    const cards = gsap.utils.toArray('.ticket-card');
    if (cards.length > 0) {
      gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power2.out', clearProps: 'all' });
    }
  }, { scope: containerRef, dependencies: [tab, isLoading, displayed.length] });

  return (
    <>
      <div className="flex min-h-full flex-col gap-3 overflow-x-hidden bg-background pb-24" ref={containerRef}>

        {/* Header */}
        <section className="tickets-header px-4 pt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-manises-blue/[0.06]">
                <TicketIcon className="h-3.5 w-3.5 text-manises-blue/70" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-manises-blue">Mis Jugadas</h2>
            </div>
            <button
              onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearch(''); }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                searchOpen ? 'bg-manises-blue text-white' : 'bg-manises-blue/[0.06] text-manises-blue/60 hover:bg-manises-blue/10 hover:text-manises-blue'
              )}
              aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar jugadas'}
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
          {searchOpen && (
            <div className="relative mt-2">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-manises-blue/40" />
              <Input
                placeholder="Buscar por juego o número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="h-10 rounded-xl border-gray-100 bg-white pl-10 text-sm shadow-sm focus:ring-manises-blue/20"
              />
            </div>
          )}
        </section>

        {/* Tabs */}
        <section className="tabs-container px-4">
          <div className="flex gap-1 rounded-xl border border-gray-100/60 bg-gray-50/90 p-1">
            {(['activos', 'historial'] as Tab[]).map((t) => (
              <PremiumTouchInteraction key={t} scale={0.97} className="flex-1">
                <button
                  onClick={() => { setTab(t); setGameFilter('all'); }}
                  className={cn(
                    'w-full rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wider transition-all',
                    tab === t ? 'bg-white text-manises-blue shadow-sm' : 'text-manises-blue/40 hover:text-manises-blue'
                  )}
                >
                  {t === 'activos' ? `Activos (${activeTickets.length})` : `Historial (${historyTickets.length})`}
                </button>
              </PremiumTouchInteraction>
            ))}
          </div>
        </section>

        {/* Filter chips */}
        {(availableGames.length > 1 || tab === 'historial') && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 py-0.5">
            {availableGames.length > 1 && (
              <>
                <button
                  onClick={() => setGameFilter('all')}
                  className={cn('shrink-0 inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all', gameFilter === 'all' ? 'bg-manises-blue text-white border-manises-blue shadow-sm' : 'bg-white text-manises-blue/55 border-manises-blue/10 hover:border-manises-blue/25')}
                >Todos</button>
                {availableGames.map((g) => (
                  <button key={g.id} onClick={() => setGameFilter(g.id)} className={cn('shrink-0 inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all', gameFilter === g.id ? 'bg-manises-blue text-white border-manises-blue shadow-sm' : 'bg-white text-manises-blue/55 border-manises-blue/10 hover:border-manises-blue/25')}>
                    {g.name}
                  </button>
                ))}
              </>
            )}
            {tab === 'historial' && (
              <>
                {availableGames.length > 1 && <div className="h-5 w-px shrink-0 self-center bg-slate-200/80 mx-0.5" />}
                <button onClick={() => setStatusFilter('all')} className={cn('shrink-0 inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all', statusFilter === 'all' ? 'bg-slate-700 text-white border-slate-700 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200')}>Todos</button>
                <button onClick={() => setStatusFilter('won')} className={cn('shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all', statusFilter === 'won' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white text-emerald-600/60 border-emerald-100 hover:border-emerald-200')}>
                  <Trophy className="h-2.5 w-2.5" />Premiados
                </button>
                <button onClick={() => setStatusFilter('lost')} className={cn('shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all', statusFilter === 'lost' ? 'bg-slate-200 text-slate-700 border-slate-200 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200')}>
                  <XCircle className="h-2.5 w-2.5" />Sin premio
                </button>
              </>
            )}
          </div>
        )}

        {/* List */}
        <section className="min-h-[400px] flex-1 px-4">
          {isLoading ? (
            <div className="flex flex-col gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => <TicketCardSkeleton key={i} />)}
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
                description={search ? `No hemos encontrado apuestas para "${search}".` : tab === 'activos' ? 'Tus próximas apuestas aparecerán aquí en cuanto las realices.' : 'Todavía no tienes sorteos resueltos en tu historial.'}
                action={!search && tab === 'activos' ? { label: 'Empezar a jugar', onClick: () => navigate('/games') } : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {tab === 'activos' && displayed.length > 0 && displayed.length < 4 && (
                <div className="order-last mt-1 rounded-[1.5rem] border border-dashed border-manises-blue/15 bg-manises-blue/[0.02] p-4 text-center">
                  <p className="text-[12px] font-black text-manises-blue/50">¿Quieres añadir otra jugada?</p>
                  <button type="button" onClick={() => navigate('/games')} className="mt-2.5 inline-flex items-center gap-1.5 rounded-2xl bg-manises-blue px-5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                    Ir a juegos
                  </button>
                </div>
              )}

              {displayed.map((ticket) => {
                const game = LOTTERY_GAMES.find((g) => g.id === ticket.gameId);
                if (!game) return null;

                const isExpanded = expandedIds.includes(ticket.id);
                const nationalTicket = isNationalTicket(ticket);
                const playStatus = getPlayStatus(ticket);
                const identity = getGameIdentity(game);
                const orderTotal = getOrderTotal(ticket);
                const orderDatesSummary = getOrderDatesSummary(ticket);
                const quantityLabel = getQuantityLabel(ticket);
                const selectionSummary = getSelectionSummary(ticket);
                const prize = getPrizeLabel(ticket);
                const hasMessaging = nationalTicket && ticket.metadata?.deliveryMode === 'shipping';

                return (
                  <div key={ticket.id} className="ticket-card relative overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    {/* Game color bar */}
                    <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: game.color }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to right, ${game.color}12, transparent 55%)` }} />

                    <div className="relative px-3 py-3 pl-4">
                      {/* Row 1: icon + name + price + status + expand button */}
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: game.color }}>
                          <GameBadge game={game} size="sm" variant="white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-[12px] font-black uppercase leading-tight text-manises-blue">{identity.shortName}</h3>
                            <span className="text-[11px] font-black text-manises-blue">{formatCurrency(orderTotal ?? 0)}</span>
                            <PlayStatusBadge status={playStatus} />
                            {ticket.isSubscription && <Repeat2 className="h-3 w-3 shrink-0 text-manises-gold" />}
                            {ticket.hasInsurance && <Shield className="h-3 w-3 shrink-0 text-manises-gold" />}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(ticket.id)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-manises-blue transition-all hover:border-manises-blue/20 hover:bg-manises-blue/[0.04]"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? 'Ocultar acciones' : 'Ver acciones'}
                        >
                          {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Rows 2–6: always visible info */}
                      <div className="mt-2 space-y-0.5 pl-[calc(2rem+0.625rem)]">
                        {/* Numbers */}
                        <p className={cn('font-black text-manises-blue leading-snug', nationalTicket ? 'text-[20px] tracking-wider' : 'text-[11px]')}>
                          {selectionSummary}
                        </p>

                        {/* Date */}
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{orderDatesSummary}</p>

                        {/* Quantity */}
                        <p className="text-[10px] font-semibold text-slate-500">{quantityLabel}</p>

                        {/* Delivery type */}
                        {hasMessaging && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <Truck className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-semibold text-slate-500">Mensajería</span>
                          </div>
                        )}

                        {/* Prize */}
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[10px] font-bold text-slate-400">Premio:</span>
                          <span className={cn('text-[11px] font-black', ticket.prize && ticket.prize > 0 ? 'text-emerald-600' : 'text-slate-400')}>
                            {prize}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (expanded only) */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-50 pt-3 pl-[calc(2rem+0.625rem)]">
                              <QuickActionButton
                                icon={Repeat2}
                                label="Repetir"
                                onClick={() => navigate(`/play/${ticket.gameId}`)}
                              />
                              <QuickActionButton
                                icon={Bell}
                                label="Abonarse"
                                onClick={() => toast.info('Abono pendiente de integración desde Mis jugadas.')}
                              />
                              <QuickActionButton
                                icon={Eye}
                                label="Ver números"
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                              />
                              <QuickActionButton
                                icon={ScrollText}
                                label="Certificado"
                                onClick={() => setReceiptTicket(ticket)}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
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

      <TicketReceiptModal
        ticket={receiptTicket}
        onClose={() => setReceiptTicket(null)}
        ticketCode={receiptTicket ? getTicketCode(receiptTicket.id) : ''}
        orderDatesSummary={receiptTicket ? getOrderDatesSummary(receiptTicket) : ''}
        selectionSummary={receiptTicket ? getSelectionSummary(receiptTicket) : ''}
      />
    </>
  );
}
