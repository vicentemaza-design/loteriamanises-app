import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Xmark, Trash, NavArrowDown, NavArrowUp, Lock, WarningTriangle, NavArrowLeft } from 'iconoir-react/regular';
import { CreditCard, Check, Loader2, CheckCircle2 } from 'lucide-react';
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

  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [inlineStep, setInlineStep] = useState<'warning' | 'recharge'>('warning');
  const INLINE_AMOUNTS = [5, 10, 20, 50, 100, 200];
  const [inlineAmt, setInlineAmt] = useState(20);
  const [inlineMethod, setInlineMethod] = useState<'apple' | 'bizum' | 'card'>('apple');
  const [isRechargingInline, setIsRechargingInline] = useState(false);
  const [isCustomAmt, setIsCustomAmt] = useState(false);
  const [customAmt, setCustomAmt] = useState('');
  const [balanceBoost, setBalanceBoost] = useState(0);
  const [justRecharged, setJustRecharged] = useState(false);

  const isOpen = reviewTarget === 'games' && (status === 'reviewing' || status === 'confirming' || status === 'failed');
  if (!isOpen) return null;

  const total = gameDrafts.reduce((s, d) => s + d.totalPrice, 0);
  const balance = profile?.balance ?? 0;
  const effectiveBalance = balance + balanceBoost;
  const isOverBalance = effectiveBalance < total;
  const hasBonoloto = gameDrafts.some((d) => d.selection.type === 'bonoloto');

  const handleInlineRecharge = async () => {
    setIsRechargingInline(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRechargingInline(false);
    setBalanceBoost(prev => prev + (isCustomAmt ? (parseFloat(customAmt) || 0) : inlineAmt));
    setJustRecharged(true);
    setShowInsufficientBalance(false);
  };

  const handlePagar = () => {
    if (isOverBalance) {
      const shortfall = total - effectiveBalance;
      setInlineAmt(INLINE_AMOUNTS.find(a => a >= shortfall) ?? 20);
      setIsCustomAmt(false);
      setCustomAmt('');
      setInlineStep('warning');
      setShowInsufficientBalance(true);
      return;
    }
    setJustRecharged(false);
    confirm();
  };

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
              <p className="text-[18px] font-black text-manises-blue">{formatCurrency(effectiveBalance)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Importe de la compra</p>
              <p className={`text-[18px] font-black ${isOverBalance ? 'text-red-500' : 'text-manises-blue'}`}>{formatCurrency(total)}</p>
            </div>
          </div>
          {isOverBalance && (
            <p className="mb-2 text-center text-[10px] font-semibold text-red-400">Faltan {formatCurrency(total - effectiveBalance)} para completar el pago</p>
          )}
          {justRecharged && !isOverBalance && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <p className="text-[11px] font-black text-emerald-700">Saldo listo · Pulsa Pagar para confirmar</p>
            </motion.div>
          )}
          <button type="button" onClick={handlePagar} disabled={isSubmitting || gameDrafts.length === 0}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
              justRecharged && !isOverBalance
                ? 'bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.22)]'
                : 'bg-manises-blue'
            }`}>
            <Lock className="h-4 w-4" />
            {isSubmitting ? 'Procesando...' : 'Pagar'}
          </button>
        </div>
      </motion.div>

      {/* Modal saldo insuficiente — aviso + recarga inline */}
      <AnimatePresence>
        {showInsufficientBalance && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowInsufficientBalance(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-[310] mx-auto max-w-screen-sm rounded-t-[2rem] bg-white px-5 pb-8 pt-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

              <AnimatePresence mode="wait">
                {inlineStep === 'warning' ? (
                  <motion.div key="warning" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                          <WarningTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-manises-blue">Saldo insuficiente</p>
                          <p className="text-[11px] font-medium text-slate-500">Te faltan {formatCurrency(total - effectiveBalance)} para confirmar</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowInsufficientBalance(false)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
                        <Xmark className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 border-b border-slate-100 bg-manises-blue/[0.04] p-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-manises-blue text-[12px] font-black text-white">1</div>
                        <div className="flex-1">
                          <p className="text-[12px] font-black text-manises-blue">Recargar saldo</p>
                          <p className="text-[10px] font-medium text-slate-500">Añadir {formatCurrency(total - effectiveBalance)} o más</p>
                        </div>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">Siguiente</span>
                      </div>
                      <div className="flex items-center gap-3 p-4 opacity-50">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-black text-slate-500">2</div>
                        <div className="flex-1">
                          <p className="text-[12px] font-black text-slate-600">Pulsar "Pagar"</p>
                          <p className="text-[10px] font-medium text-slate-400">El botón se activará en verde al volver</p>
                        </div>
                        <Lock className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>

                    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                      <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="text-[11px] font-semibold leading-relaxed text-amber-800">
                        Recargar saldo <span className="font-black">no confirma tu jugada</span>. Después de recargar, el botón <span className="font-black">"Pagar"</span> se activará en verde para confirmarlo.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button type="button" onClick={() => setInlineStep('recharge')}
                        className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98]">
                        Recargar saldo
                      </button>
                      <button type="button" onClick={() => setShowInsufficientBalance(false)}
                        className="w-full rounded-xl py-3 text-[12px] font-bold text-slate-400">
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="recharge" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <button type="button" onClick={() => setInlineStep('warning')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                        <NavArrowLeft className="h-4 w-4" />
                      </button>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recargar saldo</p>
                        <p className="text-sm font-black text-manises-blue">Te faltan {formatCurrency(total - effectiveBalance)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Importe</p>
                      <div className="grid grid-cols-3 gap-2">
                        {INLINE_AMOUNTS.map(a => (
                          <button key={a} type="button" onClick={() => { setInlineAmt(a); setIsCustomAmt(false); }}
                            className={`rounded-xl border-2 py-2.5 text-sm font-black transition-all ${
                              !isCustomAmt && inlineAmt === a ? 'border-manises-blue bg-manises-blue text-white' : 'border-slate-200 bg-white text-manises-blue hover:border-manises-blue/30'
                            }`}>
                            {formatCurrency(a)}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => { setIsCustomAmt(true); setCustomAmt(''); }}
                        className={`w-full rounded-xl border-2 py-2.5 text-sm font-black transition-all ${
                          isCustomAmt ? 'border-manises-blue bg-manises-blue/5 text-manises-blue' : 'border-slate-200 bg-white text-slate-400'
                        }`}>
                        {isCustomAmt ? 'Importe personalizado' : 'Otro importe'}
                      </button>
                      {isCustomAmt && (
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue font-black text-lg">€</span>
                          <input
                            type="number" inputMode="decimal" min="1" max="500" placeholder="0.00"
                            value={customAmt}
                            onChange={(e) => setCustomAmt(e.target.value)}
                            className="w-full h-14 pl-9 pr-4 rounded-2xl border-2 border-manises-blue bg-manises-blue/5 text-manises-blue font-black text-xl outline-none focus:ring-2 focus:ring-manises-gold/50 tabular-nums"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Método de pago</p>
                      {([
                        { id: 'apple' as const, label: 'Apple Pay', sub: 'Biometría · instantáneo',
                          icon: <svg viewBox="0 0 814 1000" className="h-4 w-4 fill-current"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.8-105.9C115.1 715.6 81 568.9 81 439.1c0-184.7 120.4-282.3 238-282.3 63.4 0 116.5 41.5 156.3 41.5 37.9 0 97.5-44 171.8-44 27.6 0 130.3 2.6 198.3 99.4zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg> },
                        { id: 'bizum' as const, label: 'Bizum', sub: 'Tu número de teléfono',
                          icon: <span className="text-sm font-black italic text-[#00c4b3]">bz</span> },
                        { id: 'card' as const, label: 'Tarjeta guardada', sub: '•••• 4242',
                          icon: <CreditCard className="h-4 w-4" /> },
                      ]).map(m => (
                        <button key={m.id} type="button" onClick={() => setInlineMethod(m.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 transition-all ${
                            inlineMethod === m.id ? 'border-manises-blue bg-manises-blue/[0.04]' : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">{m.icon}</div>
                          <div className="text-left flex-1">
                            <p className="text-[11px] font-black text-manises-blue">{m.label}</p>
                            <p className="text-[9px] font-medium text-slate-400">{m.sub}</p>
                          </div>
                          {inlineMethod === m.id && (
                            <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-manises-blue">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <button type="button" onClick={handleInlineRecharge}
                      disabled={isRechargingInline || (isCustomAmt && (parseFloat(customAmt) || 0) <= 0)}
                      className="w-full rounded-2xl bg-manises-blue py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60">
                      {isRechargingInline
                        ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</span>
                        : `Recargar ${formatCurrency(isCustomAmt ? (parseFloat(customAmt) || 0) : inlineAmt)} · demo`
                      }
                    </button>
                    <p className="text-center text-[9px] font-medium text-slate-400">Simulación demo · sin cargo real</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
