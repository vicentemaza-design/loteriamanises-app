import { useState } from 'react';
import { motion } from 'motion/react';
import { Xmark, Trash, NavArrowDown, NavArrowUp, Lock } from 'iconoir-react/regular';
import { formatCurrency } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GameBadge } from '@/shared/ui/GameBadge';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { serializeSelection } from '../lib/session.utils';
import type { PlayDraft } from '../types/session.types';

const INITIAL_VISIBLE = 3;
const GAME_COLORS: Record<string, string> = {
  euromillones: '#2563eb', primitiva: '#16a34a', bonoloto: '#0891b2',
  gordo: '#ea580c', eurodreams: '#7c3aed', quiniela: '#dc2626',
};

// ── Burbujas de números ──────────────────────────────────────────────────────

const numBubble = (n: number, color: string) => (
  <span key={String(n)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ backgroundColor: color }}>{n}</span>
);
const starBubble = (n: number, color: string) => (
  <span key={`s${String(n)}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-black" style={{ borderColor: color, color }}>{n}</span>
);
const reintegroBubble = (reintegro: number | null, color: string) =>
  reintegro === null
    ? <span key="r" className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-[9px] font-black text-slate-400">R</span>
    : <span key="r" className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-black" style={{ borderColor: color, color }}>{reintegro}</span>;

function DraftNumbers({ draft, gameColor }: { draft: PlayDraft; gameColor: string }) {
  const { selection } = draft;
  const sep = <span key="sep" className="mx-0.5 text-slate-200">|</span>;

  if (selection.type === 'bonoloto') return (
    <div className="flex flex-wrap items-center gap-1">
      {selection.numbers.map((n) => numBubble(n, gameColor))}
      {reintegroBubble(null, gameColor)}
    </div>
  );
  if (selection.type === 'primitiva') return (
    <div className="flex flex-wrap items-center gap-1">
      {selection.numbers.map((n) => numBubble(n, gameColor))}
      {reintegroBubble(selection.reintegro, gameColor)}
    </div>
  );
  if (selection.type === 'euromillones') return (
    <div className="flex flex-wrap items-center gap-1">
      {selection.numbers.map((n) => numBubble(n, gameColor))}{sep}
      {selection.stars.map((s) => starBubble(s, '#f59e0b'))}
    </div>
  );
  if (selection.type === 'gordo') return (
    <div className="flex flex-wrap items-center gap-1">
      {selection.numbers.map((n) => numBubble(n, gameColor))}{sep}
      {starBubble(selection.key, gameColor)}
    </div>
  );
  if (selection.type === 'eurodreams') return (
    <div className="flex flex-wrap items-center gap-1">
      {selection.numbers.map((n) => numBubble(n, gameColor))}{sep}
      {starBubble(selection.dream, gameColor)}
    </div>
  );
  if (selection.type === 'quiniela') return (
    <div className="flex flex-wrap gap-0.5">
      {selection.matches.slice(0, 15).map((m) => (
        <span key={String(m.id)} className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-black text-slate-600">
          {m.value ?? '—'}
        </span>
      ))}
    </div>
  );
  return null;
}

// ── Formato de fechas compacto ───────────────────────────────────────────────

function formatComboDrawDates(drawDates: string[]): string {
  if (drawDates.length === 0) return '';
  const sorted = [...drawDates].sort();
  const parsed = sorted.map((d) => new Date(d));
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (sorted.length === 1) {
    const d = parsed[0];
    return cap(d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, ''));
  }

  // Comprueba si todos comparten el mismo mes
  const months = parsed.map((d) => d.getMonth());
  const sameMonth = months.every((m) => m === months[0]);
  const monthLabel = cap(parsed[0].toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));

  const dayParts = parsed.map((d) => {
    const wd = cap(d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
    return `${wd} ${d.getDate()}`;
  });

  return sameMonth
    ? `${dayParts.join(' · ')} ${monthLabel}`
    : parsed.map((d, i) => {
        const wd = cap(d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''));
        const mo = cap(d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''));
        return `${wd} ${d.getDate()} ${mo}`;
      }).join(' · ');
}

// ── Agrupación interna: por combinación ─────────────────────────────────────

interface ComboGroup {
  selectionKey: string;
  representative: PlayDraft;       // primer draft para mostrar los números
  draftIds: string[];              // todos los ids (uno por sorteo)
  drawDates: string[];
  totalPrice: number;
}

interface GroupData { name: string; color: string; drafts: PlayDraft[] }

function buildCombos(drafts: PlayDraft[]): ComboGroup[] {
  const map: Record<string, ComboGroup> = {};
  for (const draft of drafts) {
    const key = serializeSelection(draft.selection);
    if (!map[key]) {
      map[key] = { selectionKey: key, representative: draft, draftIds: [], drawDates: [], totalPrice: 0 };
    }
    map[key].draftIds.push(draft.id);
    map[key].drawDates.push(draft.drawDate);
    map[key].totalPrice += draft.totalPrice;
  }
  return Object.values(map);
}

// ── GameGroup ────────────────────────────────────────────────────────────────

function GameGroup({ data, onDeleteCombo }: { data: GroupData; onDeleteCombo: (ids: string[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { name, color, drafts } = data;

  const combos = buildCombos(drafts);
  const visibleCombos = expanded ? combos : combos.slice(0, INITIAL_VISIBLE);
  const hidden = combos.length - INITIAL_VISIBLE;

  const total = drafts.reduce((s, d) => s + d.totalPrice, 0);
  const uniqueDates = Array.from(new Set(drafts.map((d) => d.drawDate))).sort();

  const game = LOTTERY_GAMES.find((g) => g.id === drafts[0]?.gameId);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Cabecera del juego */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        {game
          ? <GameBadge game={game} size="xs" tone="soft" className="shrink-0" />
          : <div className="h-9 w-9 shrink-0 rounded-xl" style={{ backgroundColor: `${color}18` }} />}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black text-manises-blue">{name}</p>
          {/* Días en que se juegan las combinaciones */}
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{formatComboDrawDates(uniqueDates)}</p>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
          {combos.length} {combos.length === 1 ? 'combinación' : 'combinaciones'}
        </span>
      </div>

      {/* Lista de combinaciones únicas */}
      <div className="divide-y divide-slate-50 px-4">
        {visibleCombos.map((combo) => (
          <div key={combo.selectionKey} className="flex items-start gap-2 py-2.5">
            <div className="flex-1 min-w-0">
              <DraftNumbers draft={combo.representative} gameColor={color} />
              {/* Si juega en varios sorteos, muestra los días en pequeño */}
              {combo.drawDates.length > 1 && (
                <p className="mt-1 text-[9px] font-semibold text-slate-400">
                  {formatComboDrawDates(combo.drawDates)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDeleteCombo(combo.draftIds)}
              className="shrink-0 mt-0.5 rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
              aria-label="Eliminar combinación"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <button type="button" onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1 px-4 py-2.5 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors">
          {expanded
            ? <><NavArrowUp className="h-3.5 w-3.5" /> Mostrar menos</>
            : <><NavArrowDown className="h-3.5 w-3.5" /> Ver {hidden} combinación{hidden !== 1 ? 'es' : ''} más</>}
        </button>
      )}

      <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2.5">
        <span className="text-[11px] font-semibold text-slate-400">
          {combos.length} combinación{combos.length !== 1 ? 'es' : ''} · {uniqueDates.length} sorteo{uniqueDates.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[13px] font-black text-manises-blue">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

// ── Panel principal ──────────────────────────────────────────────────────────

export function GamesCartPanel() {
  const { gameDrafts, reviewTarget, removeDrafts, status, errorMessage, closeReview } = usePlaySession();
  const { confirm, isSubmitting } = usePlaySessionConfirm({ draftFilter: 'games' });
  const { profile } = useAuth();

  const isOpen = reviewTarget === 'games' && (status === 'reviewing' || status === 'confirming' || status === 'failed');
  if (!isOpen) return null;

  const total = gameDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const balance = profile?.balance ?? 0;
  const isOverBalance = balance < total;
  const hasBonoloto = gameDrafts.some((d) => d.selection.type === 'bonoloto');

  const groups = gameDrafts.reduce<Record<string, GroupData>>((acc, draft) => {
    const key = draft.gameId;
    if (!acc[key]) acc[key] = { name: draft.gameName, color: GAME_COLORS[draft.gameType] ?? '#0a4792', drafts: [] };
    acc[key].drafts.push(draft);
    return acc;
  }, {} as Record<string, GroupData>);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeReview} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative mt-auto flex max-h-[92vh] flex-col rounded-t-3xl bg-[#f6f8fb] shadow-2xl">

        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <button type="button" onClick={closeReview} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <Xmark className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[15px] font-black text-manises-blue">Resumen de jugadas</p>
            <p className="text-[11px] font-medium text-slate-400">Revisa tus jugadas antes de pagar</p>
          </div>
          <div className="h-8 w-8" />
        </div>

        <div className="mx-5 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
            🎮 Juegos activos
          </span>
        </div>

        {errorMessage && (
          <div className="mx-5 mb-3 rounded-xl bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-600">{errorMessage}</div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
          {(Object.entries(groups) as Array<[string, GroupData]>).map(([gameId, data]) => (
            <div key={gameId}>
              <GameGroup data={data} onDeleteCombo={removeDrafts} />
            </div>
          ))}
          {hasBonoloto && (
            <p className="text-center text-[10px] font-semibold text-slate-400">
              R Reintegro pendiente · Se asigna al confirmar la compra
            </p>
          )}
        </div>

        <div className="border-t border-slate-200/60 bg-white px-5 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saldo disponible</p>
              <p className="text-[18px] font-black text-manises-blue">{formatCurrency(balance)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Importe de la compra</p>
              <p className={`text-[18px] font-black ${isOverBalance ? 'text-red-500' : 'text-manises-blue'}`}>{formatCurrency(total)}</p>
            </div>
          </div>
          {isOverBalance && (
            <p className="mb-2 text-center text-[10px] font-semibold text-red-400">Faltan {formatCurrency(total - balance)} para completar el pago</p>
          )}
          <button type="button" onClick={() => confirm()} disabled={isSubmitting || gameDrafts.length === 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-manises-blue py-4 text-[14px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
            <Lock className="h-4 w-4" />
            {isSubmitting ? 'Procesando...' : 'Pagar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
