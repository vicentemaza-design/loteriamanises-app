import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Hash, User, CreditCard, ChevronDown, ChevronRight, Truck, Lock } from 'lucide-react';
import { useTicket } from '../hooks/useTicket';
import { useResults } from '@/features/results/hooks/useResults';
import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';
import { TicketCardSkeleton } from '@/shared/ui/Skeleton';
import { GameBadge } from '@/shared/ui/GameBadge';
import { BallSelection } from '../components/BallSelection';
import { NationalDetailContent } from '../components/NationalDetailContent';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { getGameIdentity } from '@/shared/lib/game-identity';
import { getBusinessDate } from '@/shared/lib/timezone';
import { formatDate, formatCurrency, cn } from '@/shared/lib/utils';
import type { Ticket } from '@/shared/types/domain';
import { useState } from 'react';

// ── helpers ────────────────────────────────────────────────────────────────

function isNationalTicket(t: Ticket) {
  return t.gameType === 'loteria-nacional' || t.gameType === 'navidad' || t.gameType === 'nino';
}

function getOrderDrawDates(t: Ticket): string[] {
  return Array.isArray(t.metadata?.orderDrawDates) ? t.metadata.orderDrawDates : [t.drawDate];
}

function getOrderTotal(t: Ticket) {
  return typeof t.metadata?.orderTotalPrice === 'number' ? t.metadata.orderTotalPrice : t.price;
}

function getBetsCount(t: Ticket): number {
  return typeof t.metadata?.betsCount === 'number' ? t.metadata.betsCount : 1;
}

type PlayStatus = 'pending' | 'processing' | 'confirmed' | 'scrutinized' | 'rejected';

function getPlayStatus(t: Ticket): PlayStatus {
  const s = t.metadata?.playStatus;
  if (s === 'pending' || s === 'processing' || s === 'confirmed' || s === 'scrutinized' || s === 'rejected') return s;
  if (t.status === 'won' || t.status === 'lost') return 'scrutinized';
  return 'pending';
}

const STATUS_CONFIG: Record<PlayStatus, { label: string; dot: string; text: string }> = {
  pending:     { label: 'Pendiente',  dot: 'bg-amber-400',   text: 'text-amber-700' },
  processing:  { label: 'Tramitando', dot: 'bg-blue-400',    text: 'text-blue-700' },
  confirmed:   { label: 'Confirmada', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  scrutinized: { label: 'Escrutada',  dot: 'bg-slate-400',   text: 'text-slate-600' },
  rejected:    { label: 'Rechazada',  dot: 'bg-red-400',     text: 'text-red-700' },
};

function formatWeekday(date: string) {
  return new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCompact(date: string) {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ── sub-components ─────────────────────────────────────────────────────────

type MatchResult = {
  gameId: string;
  date: string;
  numbers: (number | string)[];
  stars?: number[];
  reintegro?: number;
} | null;

function ResultBalls({ result, gameType }: { result: MatchResult; gameType: string }) {
  if (!result) return null;
  const nums = result.numbers.map(Number).filter(Boolean);
  const stars = result.stars ?? [];
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Resultado oficial</p>
      <BallSelection numbers={nums} stars={stars} type={gameType} />
      {result.reintegro != null && (
        <p className="mt-1.5 text-[9px] font-bold text-slate-400">
          R: <span className="text-manises-blue font-black">{result.reintegro}</span>
        </p>
      )}
    </div>
  );
}

function MyBetRow({
  index,
  ticket,
  result,
  game,
}: {
  index: number;
  ticket: Ticket;
  result: MatchResult;
  game: (typeof LOTTERY_GAMES)[number];
}) {
  const nums = result ? ticket.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
  const stars = result && ticket.stars ? ticket.stars.filter(s => result.stars?.includes(s)) : [];
  const hits = nums.length + stars.length;
  const isScrutinized = getPlayStatus(ticket) === 'scrutinized';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <span className="shrink-0 text-[10px] font-black text-slate-300">{index}.</span>
      <div className="min-w-0 flex-1">
        <BallSelection
          numbers={ticket.numbers}
          stars={ticket.stars}
          matchedNumbers={nums}
          matchedStars={stars}
          type={game.type}
        />
      </div>
      {isScrutinized && result && (
        <span className={cn('shrink-0 text-[10px] font-black', hits > 0 ? 'text-emerald-600' : 'text-slate-300')}>
          {hits > 0 ? `${hits}✓` : '—'}
        </span>
      )}
    </div>
  );
}

function PrizeRow({ ticket, prize }: { ticket: Ticket; prize?: number | null }) {
  const status = getPlayStatus(ticket);
  const isScrutinized = status === 'scrutinized';
  if (!isScrutinized) return null;
  const amount = prize ?? ticket.prize ?? 0;
  return (
    <div className={cn(
      'flex items-center justify-between rounded-xl px-3 py-2.5 border',
      amount > 0
        ? 'border-emerald-100 bg-emerald-50'
        : 'border-slate-100 bg-slate-50'
    )}>
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Premio del día</span>
      <span className={cn('text-[13px] font-black', amount > 0 ? 'text-emerald-600' : 'text-slate-400')}>
        {amount > 0 ? formatCurrency(amount) : '0,00 €'}
      </span>
    </div>
  );
}

function PendingScrutinyRow() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2.5">
      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
      <span className="text-[10px] font-semibold text-slate-400">Pendiente de escrutinio</span>
    </div>
  );
}

// ── Game header ────────────────────────────────────────────────────────────

function DetailHeader({ ticket, game }: { ticket: Ticket; game: (typeof LOTTERY_GAMES)[number] }) {
  const identity = getGameIdentity(game);
  const status = getPlayStatus(ticket);
  const statusCfg = STATUS_CONFIG[status];
  const dates = getOrderDrawDates(ticket);
  const isSemanal = dates.length > 1 && !isNationalTicket(ticket);
  const betsCount = getBetsCount(ticket);
  const orderTotal = getOrderTotal(ticket);
  const prize = ticket.prize ?? 0;
  const isScrutinized = status === 'scrutinized';

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      {/* Game identity + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: game.color }}>
            <GameBadge game={game} size="md" variant="white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{identity.shortName}</p>
            <p className="text-[11px] font-bold text-slate-500">
              {isSemanal
                ? `${formatCompact(dates[0])} → ${formatCompact(dates[dates.length - 1])}`
                : formatDate(ticket.drawDate)
              }
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <div className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
            <span className={cn('text-[10px] font-black uppercase tracking-wider', statusCfg.text)}>{statusCfg.label}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[1.1rem] border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Importe jugado</p>
          <p className="mt-1 text-[15px] font-black text-manises-blue">{formatCurrency(orderTotal)}</p>
        </div>
        {isSemanal ? (
          <div className="rounded-[1.1rem] border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Sorteos</p>
            <p className="mt-1 text-[15px] font-black text-manises-blue">{dates.length}</p>
          </div>
        ) : (
          <div className="rounded-[1.1rem] border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Apuestas</p>
            <p className="mt-1 text-[15px] font-black text-manises-blue">{betsCount}</p>
          </div>
        )}
        <div className={cn('rounded-[1.1rem] border px-3 py-2.5 shadow-sm', isScrutinized && prize > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white')}>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Premio</p>
          <p className={cn('mt-1 text-[15px] font-black', isScrutinized && prize > 0 ? 'text-emerald-600' : 'text-slate-300')}>
            {isScrutinized ? formatCurrency(prize) : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Single draw detail ─────────────────────────────────────────────────────

function SingleDrawDetail({
  ticket,
  result,
  game,
}: {
  ticket: Ticket;
  result: MatchResult;
  game: (typeof LOTTERY_GAMES)[number];
}) {
  const betsCount = getBetsCount(ticket);
  const status = getPlayStatus(ticket);
  const isScrutinized = status === 'scrutinized';

  return (
    <div className="flex flex-col gap-3 px-4 pt-2">
      {isScrutinized && result && <ResultBalls result={result} gameType={game.type} />}

      <div className="space-y-2">
        <p className="px-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Mis apuestas</p>
        {Array.from({ length: betsCount }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>
            <MyBetRow index={i + 1} ticket={ticket} result={isScrutinized ? result : null} game={game} />
          </div>
        ))}
      </div>

      {isScrutinized && <PrizeRow ticket={ticket} />}
      {!isScrutinized && <PendingScrutinyRow />}
    </div>
  );
}

// ── Semanal (multi-draw) detail ────────────────────────────────────────────

function SemanalDetail({
  ticket,
  dayResults,
  game,
}: {
  ticket: Ticket;
  dayResults: Array<{ date: string; result: MatchResult }>;
  game: (typeof LOTTERY_GAMES)[number];
}) {
  const [openDays, setOpenDays] = useState<string[]>(() => {
    // Open the first scrutinized day automatically
    const first = dayResults.find(d => d.result);
    return first ? [first.date] : [dayResults[0]?.date ?? ''];
  });

  function toggleDay(date: string) {
    setOpenDays(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  }

  const totalPrize = ticket.prize ?? 0;
  const betsCount = getBetsCount(ticket);

  return (
    <div className="flex flex-col gap-2.5 px-4 pt-2">
      <p className="px-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Resultados por día · {betsCount} apuestas</p>

      {dayResults.map(({ date, result }) => {
        const isOpen = openDays.includes(date);
        const hasResult = !!result;
        const nums = hasResult ? ticket.numbers.filter(n => result!.numbers.map(Number).includes(n)) : [];
        const stars = hasResult && ticket.stars ? ticket.stars.filter(s => result!.stars?.includes(s)) : [];
        const hits = nums.length + stars.length;

        return (
          <div key={date} className="overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => toggleDay(date)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-black capitalize text-manises-blue">{formatWeekday(date)}</p>
                  {hasResult && hits > 0 && (
                    <p className="text-[9px] font-black text-emerald-600">{hits} acierto{hits !== 1 ? 's' : ''}</p>
                  )}
                  {hasResult && hits === 0 && (
                    <p className="text-[9px] font-semibold text-slate-400">Sin aciertos</p>
                  )}
                  {!hasResult && (
                    <p className="text-[9px] font-semibold text-slate-300">Pendiente de escrutinio</p>
                  )}
                </div>
              </div>
              {hasResult
                ? <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
                : <ChevronRight className="h-4 w-4 text-slate-200" />
              }
            </button>

            {isOpen && hasResult && (
              <div className="border-t border-slate-50 px-4 pb-4 pt-3 space-y-2">
                <ResultBalls result={result} gameType={game.type} />
                <MyBetRow index={1} ticket={ticket} result={result} game={game} />
                <PrizeRow ticket={ticket} prize={hits > 0 ? undefined : 0} />
              </div>
            )}
          </div>
        );
      })}

      {totalPrize > 0 && (
        <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Premio acumulado</p>
            <p className="text-[15px] font-black text-emerald-600">{formatCurrency(totalPrize)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RESUMEN DEL PEDIDO ─────────────────────────────────────────────────────

function PedidoResumen({ ticket }: { ticket: Ticket }) {
  const code = ticket.id.slice(-8).toUpperCase();
  const confirmedAt = ticket.metadata?.confirmedAt;
  const holderName = ticket.metadata?.holderName;
  const holderNif = ticket.metadata?.holderNif;
  const deliveryMode = ticket.metadata?.deliveryMode;
  const isNational = isNationalTicket(ticket);

  const items = [
    { icon: Hash,          label: 'Nº pedido',    value: `TLJ-${code}` },
    { icon: Calendar,      label: 'Fecha compra',  value: formatDate(ticket.createdAt) },
    { icon: CheckCircle2,  label: 'Confirmación',  value: confirmedAt ? formatDate(confirmedAt) : '—' },
    { icon: User,          label: 'Titular',        value: holderName ?? '—' },
    { icon: CreditCard,    label: 'NIF',            value: holderNif ?? '—' },
  ];

  return (
    <div className="mx-4 mt-4 mb-6 overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-50">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Resumen del pedido</p>
      </div>

      <div className="grid grid-cols-5 gap-0 divide-x divide-slate-50">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 px-1 py-3 text-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-manises-blue/[0.06]">
              <Icon className="h-3.5 w-3.5 text-manises-blue/60" />
            </div>
            <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 leading-none">{label}</p>
            <p className="text-[9px] font-black text-manises-blue leading-tight break-all">{value}</p>
          </div>
        ))}
      </div>

      {isNational && deliveryMode && (
        <div className="border-t border-slate-50 px-4 py-2.5 flex items-center gap-2">
          {deliveryMode === 'shipping'
            ? <Truck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            : <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          }
          <span className="text-[10px] font-semibold text-slate-500">
            {deliveryMode === 'shipping' ? 'Envío por mensajería' : 'Décimo en custodia · Admin. Lotería Manises'}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { ticket, isLoading, error } = useTicket(ticketId);
  const { results } = useResults();

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-col bg-background pb-24">
        <ProfileSubHeader title="Detalle de jugada" onBack={() => navigate(-1)} />
        <div className="flex flex-col gap-3 px-4 pt-4">
          {Array.from({ length: 3 }).map((_, i) => <TicketCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-full flex-col bg-background pb-24">
        <ProfileSubHeader title="Detalle de jugada" onBack={() => navigate(-1)} />
        <div className="flex flex-col items-center justify-center gap-4 px-4 pt-16 text-center">
          <p className="text-sm font-bold text-slate-400">{error ?? 'Jugada no encontrada.'}</p>
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-2xl bg-manises-blue px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const game = LOTTERY_GAMES.find(g => g.id === ticket.gameId);
  if (!game) return null;

  const isNational = isNationalTicket(ticket);
  const drawDates = getOrderDrawDates(ticket);
  const isSemanal = !isNational && drawDates.length > 1;

  // Map each draw date to its result
  const dayResults = drawDates.map(date => ({
    date,
    result: results.find(r =>
      r.gameId === ticket.gameId && getBusinessDate(r.date) === date
    ) as MatchResult ?? null,
  }));

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <ProfileSubHeader title="Detalle de jugada" onBack={() => navigate(-1)} />

      <DetailHeader ticket={ticket} game={game} />

      {isNational ? (
        <NationalDetailContent ticket={ticket} />
      ) : isSemanal ? (
        <SemanalDetail ticket={ticket} dayResults={dayResults} game={game} />
      ) : (
        <SingleDrawDetail ticket={ticket} result={dayResults[0]?.result ?? null} game={game} />
      )}

      <PedidoResumen ticket={ticket} />
    </div>
  );
}
