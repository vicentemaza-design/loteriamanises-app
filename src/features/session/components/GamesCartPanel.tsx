import { useState } from 'react';
import { motion } from 'motion/react';
import { Xmark, Trash, NavArrowDown, NavArrowUp, Lock } from 'iconoir-react/regular';
import { formatCurrency } from '@/shared/lib/utils';
import { usePlaySession } from '../hooks/usePlaySession';
import { usePlaySessionConfirm } from '../hooks/usePlaySessionConfirm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GameBadge } from '@/shared/ui/GameBadge';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import type { PlayDraft } from '../types/session.types';

const INITIAL_VISIBLE = 3;
const GAME_COLORS: Record<string, string> = {
  euromillones: '#2563eb', primitiva: '#16a34a', bonoloto: '#0891b2',
  gordo: '#ea580c', eurodreams: '#7c3aed', quiniela: '#dc2626',
};

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

interface GroupData { name: string; color: string; drafts: PlayDraft[] }

function GameGroup({ data, onDelete }: { data: GroupData; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { name, color, drafts } = data;
  const visible = expanded ? drafts : drafts.slice(0, INITIAL_VISIBLE);
  const hidden = drafts.length - INITIAL_VISIBLE;
  const total = drafts.reduce((s, d) => s + d.totalPrice, 0);
  const date = new Date(drafts[0].drawDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {(() => {
          const game = LOTTERY_GAMES.find((g) => g.id === data.drafts[0]?.gameId);
          return game
            ? <GameBadge game={game} size="xs" tone="soft" className="shrink-0" />
            : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}><div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} /></div>;
        })()}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-black text-manises-blue capitalize">{name}</p>
          <p className="text-[10px] font-medium text-slate-400 capitalize">{date}</p>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
          {drafts.length} {drafts.length === 1 ? 'jugada' : 'jugadas'}
        </span>
      </div>

      <div className="divide-y divide-slate-50 px-4">
        {visible.map((draft) => (
          <div key={draft.id} className="flex items-start gap-2 py-2">
            <div className="flex-1 min-w-0"><DraftNumbers draft={draft} gameColor={color} /></div>
            <button type="button" onClick={() => onDelete(draft.id)}
              className="shrink-0 mt-0.5 rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors" aria-label="Eliminar jugada">
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
            : <><NavArrowDown className="h-3.5 w-3.5" /> Ver {hidden} jugada{hidden !== 1 ? 's' : ''} más</>}
        </button>
      )}

      <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2.5">
        <span className="text-[11px] font-semibold text-slate-400">{drafts.length} {drafts.length === 1 ? 'jugada' : 'jugadas'}</span>
        <span className="text-[13px] font-black text-manises-blue">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export function GamesCartPanel() {
  const { gameDrafts, reviewTarget, closeReview, removeDraft, status, errorMessage } = usePlaySession();
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
              <GameGroup data={data} onDelete={removeDraft} />
            </div>
          ))}
          {hasBonoloto && (
            <p className="text-center text-[10px] font-semibold text-slate-400">R Reintegro pendiente · Se asigna al confirmar la compra</p>
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
