import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Hash, User, CreditCard, ChevronDown, ChevronRight, Truck, Lock, Trophy, Repeat2, Bell, ScrollText } from 'lucide-react';
import { useTicket } from '../hooks/useTicket';
import { useResults } from '@/features/results/hooks/useResults';
import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';
import { TicketCardSkeleton } from '@/shared/ui/Skeleton';
import { GameBadge } from '@/shared/ui/GameBadge';
import { BallSelection } from '../components/BallSelection';
import { NationalDetailContent } from '../components/NationalDetailContent';
import { RepeatDrawSheet } from '../components/RepeatDrawSheet';
import { AbonarseDrawSheet } from '../components/AbonarseDrawSheet';
import { TicketReceiptModal } from '../components/TicketReceiptModal';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { getGameIdentity } from '@/shared/lib/game-identity';
import { getBusinessDate } from '@/shared/lib/timezone';
import { formatDate, formatCurrency, cn } from '@/shared/lib/utils';
import type { Ticket, QuinielaFixtureItem } from '@/shared/types/domain';
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

// ── helpers ────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const NUMBERS_PER_ROW: Record<string, number> = {
  primitiva: 6, bonoloto: 6, gordo: 5, euromillones: 5, eurodreams: 6,
};

// ── sub-components ─────────────────────────────────────────────────────────

type MatchResult = {
  gameId: string;
  date: string;
  numbers: (number | string)[];
  stars?: number[];
  complementario?: number;
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
        const jokerBoletos = ticket.metadata?.jokerBoletos ?? [];
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
  largeBalls = false,
}: {
  bets: Array<{ numbers: number[]; stars?: number[]; reintegro?: number }>;
  boletosSize: number;
  result: MatchResult;
  game: (typeof LOTTERY_GAMES)[number];
  millonBoletos: Array<{ codeFrom: string; codeTo: string }>;
  jokerBoletos: Array<{ jokerNumber: string }>;
  largeBalls?: boolean;
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
            <div className="flex items-center justify-between border-b border-slate-50 bg-manises-blue/[0.035] px-3 py-2">
              <p className="text-[9px] font-black uppercase tracking-[0.06em] text-manises-blue">
                Boleto {boletoIdx + 1}
                <span className="ml-1.5 font-semibold normal-case text-slate-400">
                  (Columnas {colFrom}{colTo > colFrom ? ` - ${colTo}` : ''})
                </span>
              </p>
              {hasJoker && jokerData && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                  🍀 {jokerData.jokerNumber}
                </span>
              )}
            </div>

            {/* Filas de columnas */}
            <div className="divide-y divide-slate-50 px-2">
              {groupBets.map((bet, betIdx) => {
                const colNum = colFrom + betIdx;
                const allMatchedNums = result ? bet.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
                const matchedStars = result && bet.stars ? bet.stars.filter(s => result.stars?.includes(s)) : [];
                const reintegroMatch = bet.reintegro != null && result?.reintegro != null && bet.reintegro === result.reintegro;
                const perRow = NUMBERS_PER_ROW[game.type] ?? 6;
                const rows = largeBalls && bet.numbers.length > perRow
                  ? chunkArray(bet.numbers, perRow)
                  : [bet.numbers];
                return (
                  <div key={betIdx} className="py-1.5">
                    {rows.map((rowNums, rowIdx) => {
                      const isLast = rowIdx === rows.length - 1;
                      const rowMatchedNums = allMatchedNums.filter(n => rowNums.includes(n));
                      return (
                        <div key={rowIdx} className={cn('flex items-center gap-1.5', rowIdx > 0 && 'mt-1')}>
                          <span className="w-5 shrink-0 text-right text-[9px] font-black text-slate-300 tabular-nums">
                            {rowIdx === 0 ? colNum : ''}
                          </span>
                          <BallSelection
                            numbers={rowNums}
                            stars={isLast ? bet.stars : undefined}
                            matchedNumbers={rowMatchedNums}
                            matchedStars={isLast ? matchedStars : []}
                            type={game.type}
                            large={largeBalls}
                          />
                          {isLast && bet.reintegro != null && (
                            <span className={cn(
                              'ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black',
                              reintegroMatch ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-manises-blue'
                            )}>
                              R:{bet.reintegro}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Códigos de El Millón (Euromillones) — al final de cada boleto */}
            {millonData && (
              <div className="border-t border-amber-100/60 bg-amber-50/40 px-3 py-2">
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
  const millonBoletos = ticket.metadata?.millonBoletos ?? [];
  const jokerBoletos = ticket.metadata?.jokerBoletos ?? [];
  const hasJoker = jokerBoletos.length > 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Resultado oficial */}
      {isScrutinized && result && (
        <div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            Resultado oficial
          </p>
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <BallSelection
                numbers={result.numbers.map(Number).filter(Boolean)}
                stars={result.stars}
                type={game.type}
                large={!result.stars?.length}
                medium={!!result.stars?.length}
              />
              {(result.complementario != null || result.reintegro != null) && (
                <div className="flex items-center gap-4 pl-0.5">
                  {result.complementario != null && (
                    <p className="text-[10px] text-slate-500">
                      Complementario: <span className="font-black text-slate-700">{result.complementario}</span>
                    </p>
                  )}
                  {result.reintegro != null && (
                    <p className="text-[10px] text-slate-500">
                      Reintegro: <span className="font-black text-slate-700">{result.reintegro}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
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
          largeBalls
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

// ── Quiniela detail ────────────────────────────────────────────────────────

function QuinielaDetailView({
  ticket,
  result,
}: {
  ticket: Ticket;
  result: MatchResult;
}) {
  const status        = getPlayStatus(ticket);
  const isScrutinized = status === 'scrutinized';
  const prize         = ticket.prize ?? 0;
  const picks         = ticket.metadata?.picks ?? [];
  const fixtures      = ticket.metadata?.quinielaFixtures ?? [];
  const system        = ticket.metadata?.quinielaSystem ?? 'simple';
  const modalidad     = ticket.metadata?.quinielaModalidad;
  const betsCount     = getBetsCount(ticket);
  const resultNums    = result?.numbers ?? [];

  // Columnas expandidas (sistema de reducción) o columna única (simple)
  const generatedColumns = ticket.metadata?.generatedColumns;
  const columnPrizes     = ticket.metadata?.columnPrizes ?? [];
  const columns: string[][] = generatedColumns ?? [picks];
  const numCols = columns.length;

  function resultSign(idx: number): string | null {
    const r = resultNums[idx];
    return r != null ? String(r) : null;
  }

  // Aciertos en las 14 columnas regulares para cada columna de juego
  const colAciertos = columns.map(col =>
    col.slice(0, 14).filter((pick, i) => {
      const r = resultSign(i);
      return isScrutinized && r != null && pick === r;
    }).length
  );
  const bestAciertos = colAciertos.length > 0 ? Math.max(...colAciertos) : 0;

  const p15Fixture   = fixtures.find(f => f.id === 15);
  const p15ResultRaw = result ? String(resultNums[14] ?? '') : '';
  const [p15ResHome, p15ResAway] = p15ResultRaw ? p15ResultRaw.split('-') : [null, null];

  const systemLabel = system === 'simple'
    ? 'Columna sencilla'
    : system === 'manises' && modalidad
      ? `Reducción Manises ${modalidad === 'al_13' ? 'al 13' : modalidad === 'al_12' ? 'al 12' : 'al 11'}`
      : system === 'oficial' ? 'Reducción oficial' : 'Múltiple';

  const signColor = (s: string) =>
    s === '1' ? 'text-manises-blue' : s === 'X' ? 'text-slate-500' : 'text-violet-600';

  // Anchos de columnas sticky (px)
  const W_NUM     = 28;
  const W_PARTIDO = 138;
  const W_OFIC    = 52;
  const W_COL     = 56;

  // Colores de fila alternos (necesitan ser sólidos para las celdas sticky)
  const rowBgClass = (idx: number) => idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4">

      {/* ── Resumen ── */}
      <div className="flex divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex-1 px-4 py-3">
          <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">{systemLabel}</p>
          <p className="mt-0.5 text-[13px] font-bold text-manises-blue">
            <span className="text-[20px] font-black">{betsCount}</span>{' '}
            {betsCount === 1 ? 'columna' : 'columnas'}
          </p>
        </div>
        {isScrutinized ? (
          <>
            <div className="px-4 py-3 text-center">
              <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                {numCols > 1 ? 'Mejor res.' : 'Resultado'}
              </p>
              <p className={cn('mt-0.5 text-[20px] font-black leading-none', bestAciertos >= 10 ? 'text-emerald-600' : 'text-slate-700')}>
                {bestAciertos}
                <span className="text-[11px] font-bold text-slate-400 ml-0.5">ac.</span>
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">
                {numCols > 1 ? 'Premio total' : 'Premio'}
              </p>
              <p className={cn('mt-0.5 text-[16px] font-black leading-none', prize > 0 ? 'text-emerald-600' : 'text-slate-300')}>
                {prize > 0 ? formatCurrency(prize) : '—'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 px-4">
            <Clock className="h-3 w-3 text-slate-300" />
            <span className="text-[9px] font-semibold text-slate-400">Pendiente</span>
          </div>
        )}
      </div>

      {/* Hint scroll */}
      {numCols > 1 && (
        <div className="flex items-center justify-center gap-2 text-[9px] font-semibold text-manises-blue/70">
          <span>←</span>
          <span>Desliza para ver todas tus columnas</span>
          <span>→</span>
        </div>
      )}

      {/* ── Tabla con scroll horizontal ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' } as never}>
          <table
            className="border-collapse"
            style={{ minWidth: W_NUM + W_PARTIDO + W_OFIC + numCols * W_COL }}
          >
            {/* Cabecera */}
            <thead>
              <tr className="border-b-2 border-slate-100 bg-slate-50">
                <th
                  className="bg-slate-50 py-3 pl-3 text-center text-[8px] font-black uppercase tracking-wider text-slate-300"
                  style={{ width: W_NUM, position: 'sticky', left: 0, zIndex: 20 }}
                >
                  #
                </th>
                <th
                  className="bg-slate-50 py-3 pl-2 text-left text-[8px] font-black uppercase tracking-wider text-slate-400"
                  style={{ minWidth: W_PARTIDO, position: 'sticky', left: W_NUM, zIndex: 20 }}
                >
                  Partido
                </th>
                <th
                  className="bg-slate-50 py-3 text-center text-[8px] font-black uppercase tracking-wider text-slate-400"
                  style={{ width: W_OFIC, position: 'sticky', left: W_NUM + W_PARTIDO, zIndex: 20 }}
                >
                  Oficial
                </th>
                {columns.map((_, ci) => {
                  const ac    = isScrutinized ? colAciertos[ci] : null;
                  const cpriz = columnPrizes[ci] ?? 0;
                  const isWin = cpriz > 0;
                  return (
                    <th
                      key={ci}
                      className={cn('py-1.5 text-center', isWin ? 'bg-emerald-50 border-l-2 border-r-2 border-emerald-200' : 'bg-slate-50')}
                      style={{ width: W_COL, minWidth: W_COL }}
                    >
                      <p className={cn('text-[9px] font-black', isWin ? 'text-emerald-700' : 'text-manises-blue')}>
                        C{ci + 1}{isWin ? ' 🏆' : ''}
                      </p>
                      {ac != null && (
                        <p className={cn('text-[7.5px] font-bold leading-tight mt-0.5', ac >= 10 ? 'text-emerald-600' : 'text-slate-400')}>
                          {ac} aciertos
                        </p>
                      )}
                      {isWin && (
                        <p className="text-[7.5px] font-black text-emerald-600 leading-tight">
                          {formatCurrency(cpriz)}
                        </p>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Partidos 1–14 */}
            <tbody>
              {Array.from({ length: 14 }, (_, idx) => {
                const fix   = fixtures.find(f => f.id === idx + 1);
                const rSign = resultSign(idx);
                const bg    = rowBgClass(idx);

                return (
                  <tr key={idx} className={bg}>
                    {/* Nº sticky */}
                    <td
                      className={cn('py-2.5 pl-3 text-center text-[9px] font-bold text-slate-300 tabular-nums align-middle', bg)}
                      style={{ position: 'sticky', left: 0, zIndex: 10 }}
                    >
                      {idx + 1}
                    </td>

                    {/* Partido sticky */}
                    <td
                      className={cn('py-2 pl-2 pr-2 align-middle', bg)}
                      style={{ position: 'sticky', left: W_NUM, zIndex: 10 }}
                    >
                      <p className="text-[10px] font-semibold leading-snug text-slate-700">
                        {fix?.home ?? `Partido ${idx + 1}`}
                      </p>
                      <p className="text-[10px] font-normal leading-snug text-slate-500">
                        – {fix?.away ?? ''}
                      </p>
                    </td>

                    {/* Oficial sticky */}
                    <td
                      className={cn('py-2.5 text-center align-middle', bg)}
                      style={{ position: 'sticky', left: W_NUM + W_PARTIDO, zIndex: 10 }}
                    >
                      {rSign ? (
                        <span className={cn('text-[14px] font-black', signColor(rSign))}>
                          {rSign}
                        </span>
                      ) : (
                        <span className="text-[12px] text-slate-200">·</span>
                      )}
                    </td>

                    {/* Columnas de pronóstico */}
                    {columns.map((col, ci) => {
                      const pick = col[idx] ?? '?';
                      const hit  = isScrutinized && rSign != null && pick === rSign;
                      const miss = isScrutinized && rSign != null && !hit;
                      const cpriz = columnPrizes[ci] ?? 0;
                      return (
                        <td
                          key={ci}
                          className={cn(
                            'py-2.5 text-center align-middle text-[14px] font-black',
                            hit  ? 'bg-emerald-100 text-emerald-700' :
                            miss ? (idx % 2 === 0 ? 'text-slate-300' : 'text-slate-300') :
                            cpriz > 0 ? 'bg-emerald-50' : '',
                            miss && cpriz > 0 ? 'bg-emerald-50 text-slate-300' : ''
                          )}
                        >
                          {miss ? (
                            <span className={cn(signColor(pick), 'opacity-30')}>{pick}</span>
                          ) : (
                            <span className={hit ? '' : signColor(pick)}>{pick}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Pleno al 15 */}
              {columns.some(col => col[14]) && (
                <tr className="border-t-2 border-amber-200 bg-amber-50">
                  <td
                    className="py-3 pl-3 align-middle bg-amber-50"
                    style={{ position: 'sticky', left: 0, zIndex: 10 }}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-white mx-auto">
                      15
                    </span>
                  </td>
                  <td
                    className="py-2.5 pl-2 pr-2 align-middle bg-amber-50"
                    style={{ position: 'sticky', left: W_NUM, zIndex: 10 }}
                  >
                    <p className="text-[10px] font-semibold leading-snug text-slate-700">
                      {p15Fixture?.home ?? 'Pleno al 15'}
                    </p>
                    <p className="text-[10px] font-normal leading-snug text-slate-500">
                      – {p15Fixture?.away ?? ''}
                    </p>
                  </td>
                  <td
                    className="py-3 text-center align-middle bg-amber-50"
                    style={{ position: 'sticky', left: W_NUM + W_PARTIDO, zIndex: 10 }}
                  >
                    {p15ResultRaw ? (
                      <span className="text-[13px] font-black text-slate-700">{p15ResultRaw}</span>
                    ) : (
                      <span className="text-[12px] text-slate-200">·</span>
                    )}
                  </td>
                  {columns.map((col, ci) => {
                    const p15Pick = col[14];
                    if (!p15Pick) return <td key={ci} className="bg-amber-50" />;
                    const [pickHome, pickAway] = p15Pick.split('/');
                    const p15Hit = isScrutinized && pickHome === p15ResHome && pickAway === p15ResAway;
                    const p15Miss = isScrutinized && p15ResultRaw && !p15Hit;
                    const cpriz = columnPrizes[ci] ?? 0;
                    return (
                      <td
                        key={ci}
                        className={cn(
                          'py-3 text-center align-middle text-[13px] font-black',
                          p15Hit  ? 'bg-emerald-100 text-emerald-700' :
                          p15Miss ? (cpriz > 0 ? 'bg-emerald-50 text-slate-400' : 'bg-amber-50 text-slate-400') :
                          cpriz > 0 ? 'bg-emerald-50 text-amber-600' : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {p15Pick.replace('/', '-')}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Leyenda */}
        {isScrutinized && (
          <div className="flex items-center gap-5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded-sm bg-emerald-100 border border-emerald-300" />
              <span className="text-[8.5px] font-semibold text-slate-500">Acierto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded-sm bg-white border border-slate-200" />
              <span className="text-[8.5px] font-semibold text-slate-500">No acierto</span>
            </div>
            {numCols > 1 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[8.5px] font-semibold text-slate-400">
                  {numCols} de {betsCount} col. mostradas
                </span>
              </div>
            )}
          </div>
        )}
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
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <BallSelection
                  numbers={result.numbers.map(Number).filter(Boolean)}
                  stars={game.type === 'gordo' ? undefined : result.stars}
                  type={game.type}
                  large
                />
                {game.type === 'gordo' && result.stars?.[0] != null && (
                  <span className="ml-auto text-[13px] font-black text-amber-600">
                    Clave: {result.stars[0]}
                  </span>
                )}
              </div>
              {(result.complementario != null || (game.type !== 'gordo' && result.reintegro != null)) && (
                <div className="flex items-center gap-4 pl-0.5">
                  {result.complementario != null && (
                    <p className="text-[10px] text-slate-500">
                      Complementario: <span className="font-black text-slate-700">{result.complementario}</span>
                    </p>
                  )}
                  {result.reintegro != null && (
                    <p className="text-[10px] text-slate-500">
                      Reintegro: <span className="font-black text-slate-700">{result.reintegro}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
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
            const allMatchedNums = result ? bet.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
            const matchedStars = result && bet.stars ? bet.stars.filter(s => result.stars?.includes(s)) : [];
            const reintegroMatches = bet.reintegro != null && result?.reintegro != null && bet.reintegro === result.reintegro;
            const claveMatches = game.type === 'gordo' && bet.stars?.[0] != null && result?.stars?.includes(bet.stars[0]);
            const perRow = NUMBERS_PER_ROW[game.type] ?? 6;
            const rows = bet.numbers.length > perRow
              ? chunkArray(bet.numbers, perRow)
              : [bet.numbers];
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
                <div className="flex flex-col gap-1">
                  {rows.map((rowNums, rowIdx) => {
                    const isLast = rowIdx === rows.length - 1;
                    const rowMatchedNums = allMatchedNums.filter(n => rowNums.includes(n));
                    return (
                      <div key={rowIdx} className="flex items-center gap-2">
                        <BallSelection
                          numbers={rowNums}
                          stars={isLast && game.type !== 'gordo' ? bet.stars : undefined}
                          matchedNumbers={rowMatchedNums}
                          matchedStars={isLast && game.type !== 'gordo' ? matchedStars : []}
                          type={game.type}
                          large
                        />
                        {isLast && game.type === 'gordo' && bet.stars?.[0] != null && (
                          <span className={cn(
                            'ml-auto text-[13px] font-black',
                            claveMatches ? 'text-emerald-600' : 'text-amber-600'
                          )}>
                            Clave: {bet.stars[0]}
                          </span>
                        )}
                        {isLast && game.type !== 'gordo' && bet.reintegro != null && (
                          <span className={cn(
                            'ml-auto shrink-0 rounded-lg px-2 py-1 text-[13px] font-black',
                            reintegroMatches ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-manises-blue'
                          )}>
                            R:{bet.reintegro}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
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
  const millonBoletos = ticket.metadata?.millonBoletos ?? [];
  const jokerBoletos = ticket.metadata?.jokerBoletos ?? [];

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
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                      <div className="flex flex-col gap-1.5">
                        <BallSelection
                          numbers={result.numbers.map(Number).filter(Boolean)}
                          stars={result.stars}
                          type={game.type}
                          medium
                        />
                        {(result.complementario != null || result.reintegro != null) && (
                          <div className="flex items-center gap-4 pl-0.5">
                            {result.complementario != null && (
                              <p className="text-[10px] text-slate-500">
                                Complementario: <span className="font-black text-slate-700">{result.complementario}</span>
                              </p>
                            )}
                            {result.reintegro != null && (
                              <p className="text-[10px] text-slate-500">
                                Reintegro: <span className="font-black text-slate-700">{result.reintegro}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
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
                    const allMatchedNums = result ? bet.numbers.filter(n => result.numbers.map(Number).includes(n)) : [];
                    const matchedStars = result && bet.stars ? bet.stars.filter(s => result.stars?.includes(s)) : [];
                    const reintegroMatches = bet.reintegro != null && result?.reintegro != null && bet.reintegro === result.reintegro;
                    const perRow = NUMBERS_PER_ROW[game.type] ?? 6;
                    const rows = bet.numbers.length > perRow
                      ? chunkArray(bet.numbers, perRow)
                      : [bet.numbers];
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={betIdx} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                        <div className="flex flex-col gap-1">
                          {rows.map((rowNums, rowIdx) => {
                            const isLast = rowIdx === rows.length - 1;
                            const rowMatchedNums = allMatchedNums.filter(n => rowNums.includes(n));
                            return (
                              <div key={rowIdx} className="flex items-center gap-2">
                                <BallSelection
                                  numbers={rowNums}
                                  stars={isLast ? bet.stars : undefined}
                                  matchedNumbers={rowMatchedNums}
                                  matchedStars={isLast ? matchedStars : []}
                                  type={game.type}
                                  large
                                />
                                {isLast && bet.reintegro != null && (
                                  <span className={cn(
                                    'ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-black',
                                    reintegroMatches ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-manises-blue'
                                  )}>
                                    R:{bet.reintegro}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
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

// ── Receipt helpers ────────────────────────────────────────────────────────

function getReceiptCode(ticket: Ticket) { return ticket.id.slice(-8).toUpperCase(); }

function getReceiptDatesSummary(ticket: Ticket) {
  const dates = getOrderDrawDates(ticket);
  if (dates.length === 1) return formatDate(dates[0]);
  return `${formatCompact(dates[0])} → ${formatCompact(dates[dates.length - 1])}`;
}

function getReceiptSelectionSummary(ticket: Ticket): string {
  if (isNationalTicket(ticket)) {
    return (ticket.metadata?.nationalNumber ?? ticket.numbers.join('')).padStart(5, '0');
  }
  const starsLabel = ticket.stars && ticket.stars.length > 0
    ? ` + ${ticket.stars.map(s => String(s).padStart(2, '0')).join(' ')}`
    : '';
  const reintegroLabel = ticket.betReintegros?.[0] != null
    ? ` · R:${ticket.betReintegros[0]}`
    : '';
  return `${ticket.numbers.map(n => String(n).padStart(2, '0')).join(' ')}${starsLabel}${reintegroLabel}`;
}

// ── Page ───────────────────────────────────────────────────────────────────

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { ticket, isLoading, error } = useTicket(ticketId);
  const { results } = useResults();

  const [repeatTicket, setRepeatTicket]     = useState<Ticket | null>(null);
  const [abonarseTicket, setAbonarseTicket] = useState<Ticket | null>(null);
  const [receiptTicket, setReceiptTicket]   = useState<Ticket | null>(null);

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
      ) : ticket.gameType === 'quiniela' ? (
        <QuinielaDetailView ticket={ticket} result={dayResults[0]?.result ?? null} />
      ) : isSemanal ? (
        <SemanalDetail ticket={ticket} dayResults={dayResults} game={game} />
      ) : (
        <SingleDrawDetail ticket={ticket} result={dayResults[0]?.result ?? null} game={game} />
      )}

      {/* Quick actions */}
      <div className="mx-4 mt-2 mb-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {([
            { icon: Repeat2,    label: 'Repetir',     action: () => setRepeatTicket(ticket) },
            { icon: Bell,       label: 'Abonarme',    action: () => setAbonarseTicket(ticket) },
            { icon: ScrollText, label: 'Certificado', action: () => setReceiptTicket(ticket) },
          ] as const).map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className="flex flex-col items-center gap-1.5 py-3.5 text-center active:bg-slate-50"
            >
              <Icon className="h-4 w-4 text-manises-blue" />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {!isNational && <PedidoResumen ticket={ticket} />}

      <RepeatDrawSheet   ticket={repeatTicket}   onClose={() => setRepeatTicket(null)} />
      <AbonarseDrawSheet ticket={abonarseTicket} onClose={() => setAbonarseTicket(null)} />
      <TicketReceiptModal
        ticket={receiptTicket}
        onClose={() => setReceiptTicket(null)}
        ticketCode={receiptTicket ? getReceiptCode(receiptTicket) : ''}
        orderDatesSummary={receiptTicket ? getReceiptDatesSummary(receiptTicket) : ''}
        selectionSummary={receiptTicket ? getReceiptSelectionSummary(receiptTicket) : ''}
      />
    </div>
  );
}
