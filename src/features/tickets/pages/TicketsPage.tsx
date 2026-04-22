import { useMemo, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { NumberBall } from '@/shared/ui/NumberBall';
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
              Todavía no existe un resultado compatible o un escrutinio detallado asociado a esta jugada en el modelo actual.
            </p>
            <p className="mt-3 text-[11px] font-semibold text-slate-500">
              Fecha del sorteo: {formatDate(state.ticket.drawDate)}
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
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
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
  const displayed = tab === 'activos' ? activeTickets : historyTickets;

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
      <div className="flex min-h-full flex-col gap-4 overflow-x-hidden bg-background" ref={containerRef}>
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
                  onClick={() => setTab(currentTab)}
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
            <div className="flex flex-col gap-2.5">
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

                return (
                  <PremiumTouchInteraction key={ticket.id} scale={0.985}>
                    <div className="ticket-card relative overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all">
                      <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: game.color }} />

                      <div className="p-3.5 pl-4">
                        <div className="flex items-start gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-2.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md" style={{ backgroundColor: game.color }}>
                              <GameBadge game={game} size="sm" variant="white" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="truncate text-[13px] font-black uppercase leading-tight text-manises-blue">{identity.shortName}</h3>
                                {ticket.isSubscription && <Sparkles className="h-3 w-3 shrink-0 fill-current text-manises-gold" />}
                                {ticket.hasInsurance && <Shield className="h-3 w-3 shrink-0 text-manises-gold" />}
                              </div>

                              <div className="mt-1">
                                <span
                                  className="inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em]"
                                  style={{ backgroundColor: identity.chipBackground, color: identity.chipText }}
                                >
                                  {identity.badgeLabel}
                                </span>
                              </div>

                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{formatDate(ticket.drawDate)}</p>
                                <span className="text-slate-300">·</span>
                                <p className="text-[11px] font-black text-manises-blue">{formatCurrency(ticket.price ?? 0)}</p>
                              </div>

                              {nationalTicket && (
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                  <span className="inline-flex items-center rounded-full border border-manises-blue/10 bg-manises-blue/[0.04] px-2 py-0.5 text-[10px] font-black text-manises-blue">
                                    Nº {ticketDisplayNumber}
                                  </span>
                                  {nationalQuantity && (
                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black text-slate-600">
                                      {nationalQuantity} {nationalQuantity === 1 ? 'décimo' : 'décimos'}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black text-slate-600">
                                    {orderDates.length} {orderDates.length === 1 ? 'sorteo' : 'sorteos'}
                                  </span>
                                </div>
                              )}

                              {nationalTicket && (
                                <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500">
                                  {orderDrawLabel}: {orderDatesSummary}
                                </p>
                              )}

                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <StatusBadge status={ticket.status} className="px-2 py-0.5 text-[9px]" />
                                {hasResolvedDraw && totalHits > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-red-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {totalHits} {totalHits === 1 ? 'acierto' : 'aciertos'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedIds((current) => current.includes(ticket.id) ? current.filter((id) => id !== ticket.id) : [...current, ticket.id])}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-manises-blue transition-all hover:border-manises-blue/20 hover:bg-manises-blue/[0.04]"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Ocultar detalle' : 'Mostrar detalle'}
                          >
                            <ChevronDown className={cn('h-4.5 w-4.5 transition-transform', isExpanded && 'rotate-180')} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1 overflow-hidden">
                            {nationalTicket ? (
                              <div className="rounded-2xl border border-manises-blue/10 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-3 py-2.5">
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Compra reservada</p>
                                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                  <span className="text-lg font-black tracking-[0.18em] text-manises-blue">{ticketDisplayNumber}</span>
                                  {nationalQuantity && (
                                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                      {nationalQuantity} {nationalQuantity === 1 ? 'décimo' : 'décimos'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                {ticket.numbers.map((value, index) => {
                                  const isHit = matched.numbers.includes(value);
                                  return (
                                    <div key={index} className="relative">
                                      <NumberBall
                                        number={value}
                                        variant="default"
                                        size="sm"
                                        className={cn(
                                          'h-7 w-7 text-[11px]',
                                          isHit && 'border-red-200 bg-red-50 text-red-700 ring-1 ring-red-300'
                                        )}
                                      />
                                      {isHit && (
                                        <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-black leading-none text-white">
                                          A
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                                {ticket.stars?.map((value, index) => {
                                  const isHit = matched.stars.includes(value);
                                  return (
                                    <div key={`s-${index}`} className="relative">
                                      <NumberBall
                                        number={value}
                                        variant="gold"
                                        size="sm"
                                        className={cn(
                                          'h-7 w-7 text-[11px]',
                                          isHit && 'border-red-200 bg-red-50 text-red-700 ring-1 ring-red-300 shadow-none'
                                        )}
                                      />
                                      {isHit && (
                                        <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-black leading-none text-white">
                                          A
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {ticket.status === 'won' && ticket.prize != null && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-right">
                              <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-emerald-600">Premio</span>
                              <span className="block text-xs font-black leading-none text-emerald-700">{formatCurrency(ticket.prize)}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <QuickActionButton
                            icon={Repeat2}
                            label="Volver"
                            onClick={() => navigate(`/play/${ticket.gameId}`)}
                          />
                          <QuickActionButton
                            icon={Sparkles}
                            label="Abonarse"
                            onClick={() => {
                              toast.message('Acceso rápido al abono', {
                                description: 'Te llevamos al flujo de juego para activarlo desde la compra.',
                              });
                              navigate(`/play/${ticket.gameId}`);
                            }}
                          />
                          <QuickActionButton
                            icon={Archive}
                            label="Archivar"
                            tone="danger"
                            onClick={() => {
                              setArchivedIds((current) => current.includes(ticket.id) ? current : [...current, ticket.id]);
                              toast.success('Jugada archivada en esta sesión');
                            }}
                          />
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
                              <div className="mt-3 rounded-2xl border border-gray-100 bg-slate-50/85 p-3">
                                <div className="grid grid-cols-2 gap-2.5">
                                  {nationalTicket && (
                                    <div className="rounded-xl border border-white bg-white/90 p-2.5">
                                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Número</p>
                                      <p className="mt-1 text-[12px] font-black tracking-[0.18em] text-manises-blue">{ticketDisplayNumber}</p>
                                    </div>
                                  )}
                                  {nationalTicket && nationalQuantity && (
                                    <div className="rounded-xl border border-white bg-white/90 p-2.5">
                                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Cantidad</p>
                                      <p className="mt-1 text-[12px] font-black text-manises-blue">{nationalQuantity} {nationalQuantity === 1 ? 'décimo' : 'décimos'}</p>
                                    </div>
                                  )}
                                  <div className="rounded-xl border border-white bg-white/90 p-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Código</p>
                                    <p className="mt-1 text-[12px] font-black text-manises-blue">{getTicketCode(ticket.id)}</p>
                                  </div>
                                  <div className="rounded-xl border border-white bg-white/90 p-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Sorteo</p>
                                    <p className="mt-1 text-[12px] font-black text-manises-blue">{formatDate(ticket.drawDate)}</p>
                                  </div>
                                  <div className="rounded-xl border border-white bg-white/90 p-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Importe</p>
                                    <p className="mt-1 text-[12px] font-black text-manises-blue">{formatCurrency(ticket.price ?? 0)}</p>
                                  </div>
                                  <div className="rounded-xl border border-white bg-white/90 p-2.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Pedido</p>
                                    <p className="mt-1 truncate text-[12px] font-black text-manises-blue">{ticket.orderId ? ticket.orderId.slice(-8).toUpperCase() : 'Individual'}</p>
                                  </div>
                                </div>

                                <div className="mt-2.5 rounded-xl border border-white bg-white/90 p-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Detalle técnico</p>
                                    {hasResolvedDraw && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-700">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Sorteo resuelto
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2 space-y-1.5 text-[11px] font-medium text-slate-600">
                                    <p><span className="font-black text-manises-blue">Combinación:</span> {nationalTicket ? `Número ${ticketDisplayNumber}` : `${ticket.numbers.join(', ')}${ticket.stars?.length ? ` · Estrellas ${ticket.stars.join(', ')}` : ''}`}</p>
                                    {nationalTicket && (
                                      <p><span className="font-black text-manises-blue">Producto:</span> {identity.shortName}{ticket.metadata?.nationalDrawLabel ? ` · Sorteo de ${ticket.metadata.nationalDrawLabel}` : ''}</p>
                                    )}
                                    {nationalTicket && (
                                      <p><span className="font-black text-manises-blue">{orderDrawLabel}:</span> {orderDates.map((date) => formatDate(date)).join(' · ')}</p>
                                    )}
                                    {nationalTicket && (
                                      <p><span className="font-black text-manises-blue">Total del pedido:</span> {formatCurrency(orderTotal)}</p>
                                    )}
                                    <p><span className="font-black text-manises-blue">Columnas:</span> 1 combinación registrada en el modelo actual</p>
                                    <p><span className="font-black text-manises-blue">Creada:</span> {formatDate(ticket.createdAt)}</p>
                                    {(ticket.hasInsurance || ticket.isSubscription) && (
                                      <p><span className="font-black text-manises-blue">Extras:</span> {ticket.hasInsurance ? 'Seguro' : ''}{ticket.hasInsurance && ticket.isSubscription ? ' · ' : ''}{ticket.isSubscription ? 'Abono' : ''}</p>
                                    )}
                                  </div>
                                </div>

                                {hasResolvedDraw && totalHits > 0 && (
                                  <div className="mt-2.5 rounded-xl border border-red-200 bg-red-50 p-2.5">
                                    <div className="flex items-center gap-2">
                                      <ReceiptText className="h-4 w-4 text-red-700" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-700">Aciertos detectados</p>
                                    </div>
                                    <p className="mt-1 text-[11px] font-semibold text-red-800">
                                      Esta jugada marca {totalHits} {totalHits === 1 ? 'acierto' : 'aciertos'} sobre el resultado disponible.
                                    </p>
                                  </div>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 rounded-xl border-manises-blue/15 bg-white px-3 text-[11px] font-black uppercase tracking-[0.12em] text-manises-blue"
                                    onClick={() => setScrutinyState({ ticket, result: matchingResult })}
                                  >
                                    <ScrollText className="mr-1.5 h-3.5 w-3.5" />
                                    Escrutinio
                                  </Button>
                                  {ticket.status === 'won' && ticket.prize != null && (
                                    <div className="inline-flex h-10 items-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">
                                      Premio {formatCurrency(ticket.prize)}
                                    </div>
                                  )}
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
    </>
  );
}
