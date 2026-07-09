import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Hash, User, CreditCard, ChevronDown, ChevronRight, Truck, Lock, Trophy } from 'lucide-react';
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

// ── Boleto grouping constants ──────────────────────────────────────────────

const BOLETO_SIZE: Partial<Record<string, number>> = {
  euromillones: 5,
  primitiva: 8,
};

function groupIntoBoletos<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

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

const STATUS_BADGE_CLASS: Record<PlayStatus, string> = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  processing:  'bg-blue-50 text-blue-700 border-blue-200',
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  scrutinized: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
};

function formatCompact(date: string) {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatFullDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();
}

// ── sub-components ─────────────────────────────────────────────────────────

type MatchResult = {
  gameId: string;
  date: string;
  numbers: (number | string)[];
  stars?: number[];
  reintegro?: number;
} | null;

function getBets(ticket: Ticket): Array<{ numbers: number[]; stars?: number[]; reintegro?: number }> {
  if (ticket.bets && ticket.bets.length > 0) {
    return ticket.bets.map((nums, i) => ({
      numbers: nums,
      stars: ticket.betStars?.[i],
      reintegro: ticket.betReintegros?.[i],
    }));
  }
  return [{ numbers: ticket.numbers, stars: ticket.stars }];
}

// ── Game detail header ─────────────────────────────────────────────────────

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

  const displayName = identity.shortName + (isSemanal ? ' Semanal' : '');

  const dateLabel = isSemanal
    ? `${formatCompact(dates[0])} → ${formatCompact(dates[dates.length - 1])} ${new Date(dates[dates.length - 1]).getFullYear()}`
    : new Date(ticket.drawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      {/* Identity row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: game.color }}
        >
          <GameBadge game={game} size="md" variant="white" />
        </div>
        <div>
          <p className="text-[14px] font-black uppercase tracking-[0.04em] text-manises-blue leading-tight">
            {displayName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider',
              STATUS_BADGE_CLASS[status]
            )}>
              {statusCfg.label}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-400">{dateLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {(() => {
        const isEuro = ticket.gameType === 'euromillones';
        const isPrim = ticket.gameType === 'primitiva';
        const jokerBoletos = (ticket.metadata?.jokerBoletos as Array<{ jokerNumber: string }> | undefined) ?? [];
        const hasJoker = jokerBoletos.length > 0;
        const fourCols = isEuro || (isPrim && hasJoker);
        const prizeCell = (
          <div className={cn('flex flex-col items-center py-3 px-1', isScrutinized && prize > 0 ? 'bg-emerald-50' : '')}>
            <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400 text-center leading-tight">Premio total</p>
            <p className={cn('mt-1 font-black leading-none', fourCols ? 'text-[15px]' : 'text-[18px]', isScrutinized && prize > 0 ? 'text-emerald-600' : 'text-slate-300')}>
              {isScrutinized ? formatCurrency(prize) : '—'}
            </p>
          </div>
        );
        if (fourCols) {
          return (
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-y border-slate-100 bg-white">
              <div className="flex flex-col items-center py-3 px-1">
                <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400 text-center leading-tight">Importe jugada</p>
                <p className="mt-1 text-[15px] font-black text-manises-blue leading-none">{formatCurrency(orderTotal)}</p>
              </div>
              <div className="flex flex-col items-center py-3 px-1">
                <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400 text-center leading-tight">Nº columnas</p>
                <p className="mt-1 text-[15px] font-black text-manises-blue leading-none">{betsCount}</p>
              </div>
              {isEuro && (
                <div className="flex flex-col items-center py-3 px-1">
                  <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400 text-center leading-tight">Sorteos</p>
                  <p className="mt-1 text-[15px] font-black text-manises-blue leading-none">{isSemanal ? dates.length : 1}</p>
                </div>
              )}
              {isPrim && hasJoker && (
                <div className="flex flex-col items-center py-3 px-1">
                  <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400 text-center leading-tight">Joker</p>
                  <p className="mt-1 text-[15px] font-black text-emerald-600 leading-none">🍀 {jokerBoletos.length}</p>
                </div>
              )}
              {prizeCell}
            </div>
          );
        }
        return (
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 bg-white">
            <div className="flex flex-col items-center py-3 px-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">Importe jugada</p>
              <p className="mt-1 text-[18px] font-black text-manises-blue leading-none">{formatCurrency(orderTotal)}</p>
            </div>
            <div className="flex flex-col items-center py-3 px-2">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">{isSemanal ? 'Sorteos' : 'Apuesta'}</p>
              <p className="mt-1 text-[18px] font-black text-manises-blue leading-none">{isSemanal ? dates.length : betsCount}</p>
            </div>
            <div className={cn('flex flex-col items-center py-3 px-2', isScrutinized && prize > 0 ? 'bg-emerald-50' : '')}>
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">{isSemanal ? 'Premio total' : 'Premio'}</p>
              <p className={cn('mt-1 text-[18px] font-black leading-none', isScrutinized && prize > 0 ? 'text-emerald-600' : 'text-slate-300')}>
                {isScrutinized ? formatCurrency(prize) : '—'}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Boleto grid (shared between single-draw and multi-draw views) ───────────

function BoletosGrid({
  bets,
  boletosSize,
  result,
  game,
  millonBoletos,
  jokerBoletos,
}: {
  bets: Array<{ numbers: number[]; stars?: number[]; reintegro?: number }>;
  boletosSize: number;
  result: MatchResult;
  game: (typeof LOTTERY_GAMES)[number];
  millonBoletos: Array<{ codeFrom: string; codeTo: string }>;
  jokerBoletos: Array<{ jokerNumber: string }>;
}) {
  const hasJoker = jokerBoletos.length > 0;
  const boletoGroups = groupIntoBoletos(bets, boletosSize);

  return (
    <div className="flex flex-col gap-3">
      {boletoGroups.map((groupBets, boletoIdx) => {
        const colFrom = boletoIdx * boletosSize + 1;
        const colTo = colFrom + groupBets.length - 1;
        const millonData = millonBoletos[boletoIdx];
        const jokerData = jokerBoletos[boletoIdx];

        return (
          <div key={boletoIdx} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* Cabecera del boleto */}
            <div className="flex items-center justify-between border-b border-slate-50 bg-manises-blue/[0.035] px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.06em] text-manises-blue">
                Boleto {boletoIdx + 1}
                <span className="ml-1.5 font-semibold normal-case text-slate-400">
                  (Col. {colFrom}{colTo > colFrom ? `–${colTo}` : ''})
                </span>
              </p>
              {hasJoker && jokerData && (
                <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600">
                  🍀 {jokerData.jokerNumber}
                </span>
              )}
            </div>

            {/* Filas de columnas */}
            <div className="divide-y divide-slate-50 px-3">
              {groupBets.map((bet, betIdx) => {
                const colNum = colFrom + betIdx;
                const matchedNums = result ? bet.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
                const matchedStars = result && bet.stars ? bet.stars.filter(s => result.stars?.includes(s)) : [];
                return (
                  <div key={betIdx} className="flex items-center gap-2 py-2">
                    <span className="w-5 shrink-0 text-right text-[9px] font-black text-slate-300">{colNum}</span>
                    <BallSelection
                      numbers={bet.numbers}
                      stars={bet.stars}
                      matchedNumbers={matchedNums}
                      matchedStars={matchedStars}
                      type={game.type}
                    />
                  </div>
                );
              })}
            </div>

            {/* Códigos de El Millón (Euromillones) */}
            {millonData && (
              <div className="border-t border-amber-100/60 bg-amber-50/40 px-4 py-2.5">
                <p className="text-[7px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Códigos de El Millón (asignados)
                </p>
                <p className="mt-0.5 font-mono text-[12px] font-black tracking-[0.05em] text-manises-blue">
                  {millonData.codeFrom}{' '}
                  <span className="text-[10px] font-semibold text-slate-400">A</span>{' '}
                  {millonData.codeTo}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Boleto groups view (Euromillones + Primitiva, single draw) ──────────────

function BoletoGroupsView({
  ticket,
  result,
  game,
}: {
  ticket: Ticket;
  result: MatchResult;
  game: (typeof LOTTERY_GAMES)[number];
}) {
  const status = getPlayStatus(ticket);
  const isScrutinized = status === 'scrutinized';
  const bets = getBets(ticket);
  const prize = ticket.prize ?? 0;

  const boletosSize = BOLETO_SIZE[ticket.gameType] ?? bets.length;
  const millonBoletos = (ticket.metadata?.millonBoletos as Array<{ codeFrom: string; codeTo: string }> | undefined) ?? [];
  const jokerBoletos = (ticket.metadata?.jokerBoletos as Array<{ jokerNumber: string }> | undefined) ?? [];
  const hasJoker = jokerBoletos.length > 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Resultado oficial */}
      {isScrutinized && result && (
        <div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            Resultado oficial
          </p>
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <BallSelection
              numbers={result.numbers.map(Number).filter(Boolean)}
              stars={result.stars}
              type={game.type}
              large
            />
          </div>
        </div>
      )}

      {/* Mis jugadas — agrupadas por boletos */}
      <div>
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Mis jugadas
        </p>
        <BoletosGrid
          bets={bets}
          boletosSize={boletosSize}
          result={result}
          game={game}
          millonBoletos={millonBoletos}
          jokerBoletos={jokerBoletos}
        />
      </div>

      {/* Nota Joker (solo Primitiva) */}
      {hasJoker && ticket.gameType === 'primitiva' && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <span className="text-base leading-tight">🍀</span>
          <p className="text-[10px] font-medium leading-relaxed text-slate-500">
            El Joker no es por columna, es por boleto. Cada boleto tiene un solo Joker, independientemente del número de columnas que contenga.
          </p>
        </div>
      )}

      {/* Premio */}
      {isScrutinized && (
        <div className={cn(
          'flex items-center justify-between rounded-2xl border px-4 py-3',
          prize > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'
        )}>
          <div className="flex items-center gap-2">
            <Trophy className={cn('h-4 w-4', prize > 0 ? 'text-emerald-500' : 'text-slate-300')} />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Premio del día</span>
          </div>
          <span className={cn('text-[16px] font-black', prize > 0 ? 'text-emerald-600' : 'text-slate-400')}>
            {formatCurrency(prize)}
          </span>
        </div>
      )}
      {!isScrutinized && (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="text-[10px] font-semibold text-slate-400">Pendiente de escrutinio</span>
        </div>
      )}
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
  // Euromillones and Primitiva use boleto-grouped display
  if (BOLETO_SIZE[ticket.gameType]) {
    return <BoletoGroupsView ticket={ticket} result={result} game={game} />;
  }

  const status = getPlayStatus(ticket);
  const isScrutinized = status === 'scrutinized';
  const bets = getBets(ticket);
  const prize = ticket.prize ?? 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Official result */}
      {isScrutinized && result && (
        <div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            Resultado oficial
          </p>
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <BallSelection
              numbers={result.numbers.map(Number).filter(Boolean)}
              stars={result.stars}
              type={game.type}
              large
            />
            {result.reintegro != null && (
              <p className="mt-2 text-[9px] font-bold text-slate-400">
                R: <span className="font-black text-manises-blue">{result.reintegro}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* My bets */}
      <div>
        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Mi apuesta ({bets.length})
        </p>
        <div className="space-y-2">
          {bets.map((bet, i) => {
            const matchedNums = result ? bet.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
            const matchedStars = result && bet.stars ? bet.stars.filter(s => result.stars?.includes(s)) : [];
            const reintegroMatches = bet.reintegro != null && result?.reintegro != null && bet.reintegro === result.reintegro;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <BallSelection
                  numbers={bet.numbers}
                  stars={bet.stars}
                  matchedNumbers={matchedNums}
                  matchedStars={matchedStars}
                  type={game.type}
                  large
                />
                {bet.reintegro != null && (
                  <p className="mt-2 text-[9px] font-bold text-slate-400">
                    R: <span className={reintegroMatches ? 'font-black text-emerald-600' : 'font-black text-manises-blue'}>{bet.reintegro}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prize — shown ONCE at bottom */}
      {isScrutinized && (
        <div className={cn(
          'flex items-center justify-between rounded-2xl border px-4 py-3',
          prize > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'
        )}>
          <div className="flex items-center gap-2">
            <Trophy className={cn('h-4 w-4', prize > 0 ? 'text-emerald-500' : 'text-slate-300')} />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Premio del día</span>
          </div>
          <span className={cn('text-[16px] font-black', prize > 0 ? 'text-emerald-600' : 'text-slate-400')}>
            {formatCurrency(prize)}
          </span>
        </div>
      )}

      {!isScrutinized && (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="text-[10px] font-semibold text-slate-400">Pendiente de escrutinio</span>
        </div>
      )}
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
  const bets = getBets(ticket);
  const totalPrize = ticket.prize ?? 0;
  const boletosSize = BOLETO_SIZE[ticket.gameType];
  const millonBoletos = (ticket.metadata?.millonBoletos as Array<{ codeFrom: string; codeTo: string }> | undefined) ?? [];
  const jokerBoletos = (ticket.metadata?.jokerBoletos as Array<{ jokerNumber: string }> | undefined) ?? [];

  // First draw open by default
  const [openDays, setOpenDays] = useState<string[]>([dayResults[0]?.date ?? '']);

  function toggleDay(date: string) {
    setOpenDays(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  }

  const dayPrizes = ticket.metadata?.dayPrizes ?? {};

  return (
    <div className="flex flex-col gap-2 px-4 pt-4">
      {dayResults.map(({ date, result }) => {
        const isOpen = openDays.includes(date);
        const hasResult = !!result;
        const dayPrize = dayPrizes[date] ?? 0;

        return (
          <div key={date} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* Row header — always tappable */}
            <button
              type="button"
              onClick={() => toggleDay(date)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate text-[10px] font-black uppercase text-manises-blue">
                  {formatFullDate(date)}
                </span>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                {/* Prize label: shown always (open or collapsed) when relevant */}
                {!hasResult && (
                  <span className="text-[9px] font-black text-amber-500">Pendiente</span>
                )}
                {hasResult && dayPrize > 0 && (
                  <span className="text-[9px] font-black text-emerald-600">
                    Premio: {formatCurrency(dayPrize)}
                  </span>
                )}
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="space-y-3 border-t border-slate-50 px-4 pb-4 pt-3">
                {hasResult && (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Resultado oficial
                    </p>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                      <BallSelection
                        numbers={result.numbers.map(Number).filter(Boolean)}
                        stars={result.stars}
                        type={game.type}
                        large
                      />
                      {result.reintegro != null && (
                        <p className="mt-1.5 text-[9px] font-bold text-slate-400">
                          R: <span className="font-black text-manises-blue">{result.reintegro}</span>
                        </p>
                      )}
                    </div>
                  </>
                )}

                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Mi apuesta ({bets.length})
                </p>
                {boletosSize ? (
                  <BoletosGrid
                    bets={bets}
                    boletosSize={boletosSize}
                    result={result}
                    game={game}
                    millonBoletos={millonBoletos}
                    jokerBoletos={jokerBoletos}
                  />
                ) : (
                  bets.map((bet, betIdx) => {
                    const matchedNums = result ? bet.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
                    const matchedStars = result && bet.stars ? bet.stars.filter(s => result.stars?.includes(s)) : [];
                    const reintegroMatches = bet.reintegro != null && result?.reintegro != null && bet.reintegro === result.reintegro;
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={betIdx} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                        <BallSelection
                          numbers={bet.numbers}
                          stars={bet.stars}
                          matchedNumbers={matchedNums}
                          matchedStars={matchedStars}
                          type={game.type}
                          large
                        />
                        {bet.reintegro != null && (
                          <p className="mt-1.5 text-[9px] font-bold text-slate-400">
                            R: <span className={reintegroMatches ? 'font-black text-emerald-600' : 'font-black text-manises-blue'}>{bet.reintegro}</span>
                          </p>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Day prize — reads from dayPrizes metadata */}
                {hasResult ? (
                  <div className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-2.5',
                    dayPrize > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'
                  )}>
                    <div className="flex items-center gap-2">
                      <Trophy className={cn('h-3.5 w-3.5', dayPrize > 0 ? 'text-emerald-500' : 'text-slate-300')} />
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Premio del día</span>
                    </div>
                    <span className={cn('text-[13px] font-black', dayPrize > 0 ? 'text-emerald-600' : 'text-slate-400')}>
                      {formatCurrency(dayPrize)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                    <span className="text-[10px] font-semibold text-slate-400">Pendiente de escrutinio</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Accumulated total prize */}
      {totalPrize > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Premio acumulado</p>
          </div>
          <p className="text-[16px] font-black text-emerald-600">{formatCurrency(totalPrize)}</p>
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

  type LucideIcon = typeof Calendar;
  const items: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: Hash,         label: 'Nº pedido',           value: `TLJ-${code}` },
    { icon: Calendar,     label: 'Fecha de compra',       value: formatDate(ticket.createdAt) },
    { icon: CheckCircle2, label: 'Fecha confirmación',    value: confirmedAt ? formatDate(confirmedAt) : '—' },
    { icon: User,         label: 'Titular',                value: holderName ?? '—' },
    { icon: CreditCard,   label: 'NIF',                    value: holderNif ?? '—' },
    { icon: CreditCard,   label: 'Forma de pago',           value: '—' },
  ];

  return (
    <div className="mx-4 mt-4 mb-6 overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-50 px-4 py-3">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Resumen del pedido</p>
      </div>

      <div className="grid grid-cols-2">
        {items.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            className={cn(
              'flex items-start gap-2.5 px-4 py-3',
              i % 2 === 1 && 'border-l border-slate-50',
              i < 4 && 'border-b border-slate-50'
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-manises-blue/[0.06]">
              <Icon className="h-3.5 w-3.5 text-manises-blue/60" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{label}</p>
              <p className="break-all text-[10px] font-black text-manises-blue">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {isNational && deliveryMode && (
        <div className="flex items-center gap-2 border-t border-slate-50 px-4 py-2.5">
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

  const dayResults = drawDates.map(date => ({
    date,
    result: results.find(r =>
      r.gameId === ticket.gameId && getBusinessDate(r.date) === date
    ) as MatchResult ?? null,
  }));

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <ProfileSubHeader
        title={isNational ? 'Detalle de compra' : 'Detalle de jugada'}
        onBack={() => navigate(-1)}
      />

      {!isNational && <DetailHeader ticket={ticket} game={game} />}

      {isNational ? (
        <NationalDetailContent ticket={ticket} />
      ) : isSemanal ? (
        <SemanalDetail ticket={ticket} dayResults={dayResults} game={game} />
      ) : (
        <SingleDrawDetail ticket={ticket} result={dayResults[0]?.result ?? null} game={game} />
      )}

      {!isNational && <PedidoResumen ticket={ticket} />}
    </div>
  );
}
