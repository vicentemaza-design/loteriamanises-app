import { useMemo, useRef, useState } from 'react';
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
  MoreHorizontal,
  Trophy,
  ScrollText,
  Eye,
  Bell,
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

type Tab = 'todas' | 'activas' | 'premiadas' | 'abonos';
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
  pending:     { label: 'Pendiente',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing:  { label: 'Tramitando', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed:   { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  scrutinized: { label: 'Escrutada',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected:    { label: 'Rechazada',  className: 'bg-red-50 text-red-700 border-red-200' },
};

function PlayStatusBadge({ status }: { status: PlayStatus }) {
  const { label, className } = PLAY_STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-md border px-2 py-[3px] text-[8.5px] font-black uppercase tracking-wider', className)}>
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
  if (dates.length > 1) return `${dates.length} sorteos`;
  return `${betsCount} ${betsCount === 1 ? 'apuesta' : 'apuestas'}`;
}

function getSelectionSummary(ticket: Ticket): string {
  if (isNationalTicket(ticket)) {
    return (ticket.metadata?.nationalNumber ?? ticket.numbers.join('')).padStart(5, '0');
  }
  const starsLabel = ticket.stars && ticket.stars.length > 0
    ? ` + ${ticket.stars.map(s => String(s).padStart(2, '0')).join(' ')}`
    : '';
  return `${ticket.numbers.map(n => String(n).padStart(2, '0')).join(' ')}${starsLabel}`;
}

export function TicketsPage() {
  const navigate = useNavigate();
  const { tickets, isLoading, error } = useTickets();
  const [tab, setTab] = useState<Tab>('todas');
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [receiptTicket, setReceiptTicket] = useState<Ticket | null>(null);

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

  const premiatedTickets = filteredTickets.filter((t) => t.status === 'won');
  const abonoTickets = filteredTickets.filter((t) => t.isSubscription);

  const tabTickets =
    tab === 'todas'     ? filteredTickets :
    tab === 'activas'   ? activeTickets :
    tab === 'premiadas' ? premiatedTickets :
                          abonoTickets;

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
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
            {([
              { key: 'todas',     label: 'Todas' },
              { key: 'activas',   label: 'Activas' },
              { key: 'premiadas', label: 'Premiadas' },
              { key: 'abonos',    label: 'Abonos' },
            ] as const).map(({ key, label }) => (
              <PremiumTouchInteraction key={key} scale={0.97} className="flex-1">
                <button
                  onClick={() => { setTab(key); setGameFilter('all'); }}
                  className={cn(
                    'w-full rounded-lg py-1.5 text-[9px] font-black uppercase tracking-wider transition-all',
                    tab === key ? 'bg-white text-manises-blue shadow-sm' : 'text-manises-blue/40 hover:text-manises-blue'
                  )}
                >
                  {label}
                </button>
              </PremiumTouchInteraction>
            ))}
          </div>
        </section>

        {/* Game filter chips */}
        {availableGames.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 py-0.5">
            <button
              onClick={() => setGameFilter('all')}
              className={cn('shrink-0 inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all', gameFilter === 'all' ? 'bg-manises-blue text-white border-manises-blue shadow-sm' : 'bg-white text-manises-blue/55 border-manises-blue/10 hover:border-manises-blue/25')}
            >Todos</button>
            {availableGames.map((g) => (
              <button key={g.id} onClick={() => setGameFilter(g.id)} className={cn('shrink-0 inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all', gameFilter === g.id ? 'bg-manises-blue text-white border-manises-blue shadow-sm' : 'bg-white text-manises-blue/55 border-manises-blue/10 hover:border-manises-blue/25')}>
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <section className="min-h-[400px] flex-1 px-4">
          {isLoading ? (
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
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

                const isExpanded = expandedIds.has(ticket.id);
                const national = isNationalTicket(ticket);
                const playStatus = getPlayStatus(ticket);
                const identity = getGameIdentity(game);
                const orderTotal = getOrderTotal(ticket);
                const orderDatesSummary = getOrderDatesSummary(ticket);
                const quantityLabel = getQuantityLabel(ticket);
                const selectionSummary = getSelectionSummary(ticket);
                const prize = getPrizeLabel(ticket);
                const hasMessaging = national && ticket.metadata?.deliveryMode === 'shipping';
                const hasPrize = ticket.prize != null && ticket.prize > 0;

                return (
                  <div
                    key={ticket.id}
                    className="ticket-card relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.05)]"
                  >
                    {/* Left color accent */}
                    <div className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ backgroundColor: game.color }} />

                    {/* Main row */}
                    <div
                      className="relative flex cursor-pointer items-center gap-3 py-3 pl-4 pr-2 transition-colors active:bg-slate-50/60"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      {/* Col 1 — Icon */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] shadow-sm"
                        style={{ backgroundColor: game.color }}
                      >
                        <GameBadge game={game} size="sm" variant="white" />
                      </div>

                      {/* Col 2 — Main info */}
                      <div className="min-w-0 flex-1">
                        {/* Game name + badges */}
                        <p className="flex items-center gap-1 text-[10px] font-black uppercase leading-none tracking-[0.10em] text-manises-blue">
                          {identity.shortName}
                          {ticket.isSubscription && <Repeat2 className="h-2.5 w-2.5 shrink-0 text-manises-gold" />}
                          {ticket.hasInsurance && <Shield className="h-2.5 w-2.5 shrink-0 text-manises-gold" />}
                        </p>
                        {/* Numbers — prominent */}
                        <p className={cn(
                          'mt-[3px] truncate font-black leading-snug text-manises-blue',
                          national ? 'text-[15px] font-mono tracking-[0.14em]' : 'text-[12px]'
                        )}>
                          {selectionSummary}
                        </p>
                        {/* Meta line: date · qty · [mensajería ·] cost */}
                        <p className="mt-[3px] truncate text-[9px] font-medium leading-none text-slate-400">
                          {orderDatesSummary}
                          {' · '}
                          {quantityLabel}
                          {hasMessaging ? ' · Mensajería' : ''}
                          {' · '}
                          {formatCurrency(orderTotal ?? 0)}
                        </p>
                      </div>

                      {/* Col 3 — Status + Prize (stacked, right-aligned) */}
                      <div className="flex min-w-[82px] shrink-0 flex-col items-end gap-[5px]">
                        <PlayStatusBadge status={playStatus} />
                        {hasPrize ? (
                          <div className="flex items-center gap-0.5">
                            <Trophy className="h-3 w-3 text-emerald-500" />
                            <span className="text-[11px] font-black text-emerald-600">{prize}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] font-bold text-slate-300">—</span>
                        )}
                      </div>

                      {/* Col 4 — Context menu */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpand(ticket.id); }}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                          isExpanded
                            ? 'bg-manises-blue/[0.08] text-manises-blue'
                            : 'text-slate-300 hover:text-slate-400'
                        )}
                        aria-label="Acciones rápidas"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Expandable quick actions */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-1.5 border-t border-gray-50 px-4 py-2.5">
                            {([
                              { icon: Repeat2,    label: 'Repetir',     action: () => navigate(`/play/${ticket.gameId}`) },
                              { icon: Bell,       label: 'Abonarme',    action: () => toast.info('Abono pendiente de integración.') },
                              { icon: Eye,        label: 'Ver',         action: () => navigate(`/tickets/${ticket.id}`) },
                              { icon: ScrollText, label: 'Certificado', action: () => setReceiptTicket(ticket) },
                            ] as const).map(({ icon: Icon, label, action }) => (
                              <button
                                key={label}
                                type="button"
                                onClick={action}
                                className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white py-2 text-[8px] font-black uppercase tracking-wider text-manises-blue transition-colors hover:border-manises-blue/20 hover:bg-manises-blue/[0.04] active:scale-[0.97]"
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
