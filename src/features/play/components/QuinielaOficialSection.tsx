import { useState, useCallback, useEffect, useRef } from 'react';
import { Trash2, Lock, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import {
  makeInitialOficialMatches,
  OFICIAL_REDUCTIONS,
  type QuinielaOficialMatch,
  type QuinielaResult,
} from '../lib/quiniela-data';
import type { QuinielaFixture } from '../lib/quiniela-fixtures';

const PRICE_PER_BET = 1.0;
const REGULAR_SIGNS = ['1', 'X', '2'] as const;
const PLENA_SIGNS   = ['0', '1', '2', 'M'] as const;

export interface QuinielaOficialSummary {
  matches:    QuinielaOficialMatch[];
  plenaHome:  QuinielaResult;
  plenaAway:  QuinielaResult;
  reductionId: string;
  bets:       number;
  price:      number;
  isValid:    boolean;
}

interface Props {
  fixtures:        QuinielaFixture[];
  drawDate:        Date;
  onSummaryChange: (s: QuinielaOficialSummary) => void;
}

/* ── Guarantee detail (collapsible under selected pill) ──────────────────── */
function GuaranteeCard({ table, totalCols }: {
  table: typeof OFICIAL_REDUCTIONS[0]['table'];
  totalCols: number;
}) {
  return (
    <div className="space-y-3 px-4 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-manises-blue/70">{table.title}</p>
      <div className="rounded-xl overflow-hidden border border-manises-blue/10">
        <div className="bg-manises-blue/5 px-2 pt-2 pb-1">
          <div className="flex">
            <div className="w-14 shrink-0" />
            <p className="flex-1 text-center text-[7px] font-black uppercase tracking-[0.12em] text-slate-400">Aciertos garantizados</p>
          </div>
          <div className="flex mt-0.5">
            <div className="w-14 shrink-0 text-[7px] font-bold text-slate-400 uppercase">Prob.</div>
            {table.cols.map(col => (
              <div key={col} className="flex-1 text-center text-[7px] font-black text-manises-blue uppercase">{col}</div>
            ))}
          </div>
        </div>
        {table.rows.map((row, i) => (
          <div key={i} className={cn('flex items-center px-2 py-1.5', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60')}>
            <div className="w-14 shrink-0 text-[8px] font-bold text-slate-500">{row.prob}</div>
            {row.values.map((v, j) => (
              <div key={j} className="flex-1 text-center text-[8px] font-black text-slate-700">{v}</div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <p className="mb-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">Desarrollo (primeras columnas)</p>
        <div className="space-y-1">
          {table.development.map((row, i) => {
            const signs = row.trim().split(/\s+/).filter(Boolean);
            return (
              <div key={i} className="flex items-center gap-1 w-full">
                <span className="w-10 shrink-0 text-[8px] font-bold text-slate-400">Col.&nbsp;{i + 1}</span>
                <div className="flex flex-1 justify-between">
                  {signs.map((s, j) => (
                    <span key={j} className={cn('text-[9px] font-black text-center leading-none',
                      s === '—' ? 'text-slate-300' : 'text-slate-600 font-mono')}>{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" className="mt-2 text-[9px] font-black text-manises-blue underline underline-offset-2">
          Ver todas las columnas ({totalCols})
        </button>
      </div>
    </div>
  );
}

/* ── Sección principal ───────────────────────────────────────────────────── */
export function QuinielaOficialSection({ fixtures, drawDate, onSummaryChange }: Props) {
  const drawDateLabel = (() => {
    const s = drawDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  const [matches, setMatches]     = useState<QuinielaOficialMatch[]>(() => makeInitialOficialMatches(fixtures.filter(f => f.id !== 15)));
  const [plenaHome, setPlenaHome] = useState<QuinielaResult>(null);
  const [plenaAway, setPlenaAway] = useState<QuinielaResult>(null);
  const [reductionId, setReductionId] = useState<string>('7D_13');
  const [showGuarantee, setShowGuarantee] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);

  const plenaFixture    = fixtures.find(f => f.id === 15);
  const regularFixtures = fixtures.filter(f => f.id !== 15);

  const doublesCount = matches.filter(m => m.result && m.result.length === 2).length;
  const triplesCount = matches.filter(m => m.result === '1X2').length;
  const allSelected  = matches.every(m => m.result !== null) && plenaHome !== null && plenaAway !== null;

  const selectedReduction = OFICIAL_REDUCTIONS.find(r => r.id === reductionId);
  const bets  = selectedReduction?.bets ?? 0;
  const price = bets * PRICE_PER_BET;

  const emitSummary = useCallback((
    m: QuinielaOficialMatch[], ph: QuinielaResult, pa: QuinielaResult, rid: string
  ) => {
    const red = OFICIAL_REDUCTIONS.find(r => r.id === rid);
    const b   = red?.bets ?? 0;
    const all = m.every(x => x.result !== null) && ph !== null && pa !== null;
    onSummaryChange({ matches: m, plenaHome: ph, plenaAway: pa, reductionId: rid, bets: b, price: b * PRICE_PER_BET, isValid: all });
  }, [onSummaryChange]);

  useEffect(() => { emitSummary(matches, plenaHome, plenaAway, reductionId); }, [matches, plenaHome, plenaAway, reductionId, emitSummary]);

  const toggleSign = (matchId: number, sign: string) => {
    const order = '1X2';
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const cur = m.result;
      let next: QuinielaResult = null;
      if (!cur) { next = sign; }
      else if (cur === sign) { next = null; }
      else {
        const parts = new Set<string>(cur.split(''));
        parts.has(sign) ? parts.delete(sign) : parts.add(sign);
        const sorted = [...parts].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join('');
        next = sorted || null;
      }
      return { ...m, result: next };
    }));
  };

  const togglePlena = (side: 'home' | 'away', sign: string) => {
    const order = '012M';
    const setter = side === 'home' ? setPlenaHome : setPlenaAway;
    const current = side === 'home' ? plenaHome : plenaAway;
    if (!current) { setter(sign); return; }
    const parts = new Set<string>(current.split(''));
    parts.has(sign) ? parts.delete(sign) : parts.add(sign);
    const sorted = [...parts].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join('');
    setter(sorted || null);
  };

  const toggleReducido = (matchId: number) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, isReducido: !m.isReducido } : m));
  };

  const clearAll = () => {
    setMatches(makeInitialOficialMatches(fixtures.filter(f => f.id !== 15)));
    setPlenaHome(null);
    setPlenaAway(null);
  };

  return (
    <div className="space-y-2.5">

      {/* ── Fecha + Borrar boleto ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-black text-manises-blue leading-tight">
          {drawDateLabel}
        </h2>
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-red-500 active:scale-95 transition-transform"
        >
          <Trash2 className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wide">Borrar boleto</span>
        </button>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
        {[
          { label: 'Dobles',   value: String(doublesCount), color: 'text-manises-blue' },
          { label: 'Triples',  value: String(triplesCount), color: 'text-violet-600' },
          { label: 'Apuestas', value: allSelected ? String(bets) : '—', color: 'text-slate-600' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={cn('text-[12px] font-black leading-tight', s.color)}>{s.value}</p>
            <p className="mt-0.5 text-[7px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Reduction pills (horizontal scroll) ──────────────────── */}
      <div className="space-y-1.5">
        <p className="px-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Reducción oficial</p>
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {OFICIAL_REDUCTIONS.map(red => {
            const isSelected = reductionId === red.id;
            return (
              <button
                key={red.id}
                type="button"
                disabled={red.locked}
                onClick={() => {
                  if (red.locked) return;
                  if (reductionId === red.id) { setShowGuarantee(v => !v); }
                  else { setReductionId(red.id); setShowGuarantee(false); }
                }}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black whitespace-nowrap transition-all active:scale-95',
                  red.locked
                    ? 'border-slate-100 bg-slate-50 text-slate-300 opacity-60'
                    : isSelected
                      ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500'
                )}
              >
                {red.locked && <Lock className="h-2.5 w-2.5" />}
                {red.label}
                {!red.locked && (
                  <span className={cn(
                    'text-[8px] font-bold',
                    isSelected ? 'text-white/70' : 'text-slate-400'
                  )}>
                    {formatCurrency(red.bets * PRICE_PER_BET)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected reduction guarantee (collapsible) */}
        {selectedReduction && (
          <div className="overflow-hidden rounded-2xl border border-manises-blue/15 bg-white">
            <button
              type="button"
              onClick={() => setShowGuarantee(v => !v)}
              className="flex w-full items-center justify-between px-3 py-2.5"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-700">{selectedReduction.label}</p>
                <p className="text-[9px] text-slate-400">
                  {selectedReduction.bets} apuestas · {formatCurrency(selectedReduction.bets * PRICE_PER_BET)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-manises-blue">
                  {showGuarantee ? 'Ocultar garantías' : 'Ver garantías'}
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', showGuarantee && 'rotate-180')} />
              </div>
            </button>
            <AnimatePresence>
              {showGuarantee && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-manises-blue/10 bg-[#eef3ff]">
                    <GuaranteeCard table={selectedReduction.table} totalCols={selectedReduction.bets} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Match grid (partidos 1–14, filas compactas) ──────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-50">
        {regularFixtures.map((template, idx) => {
          const match = matches[idx];
          return (
            <div key={template.id} className="flex items-center gap-2 py-1.5 px-3">
              <span className="w-4 shrink-0 text-[10px] font-black text-slate-300 text-right tabular-nums">
                {template.id}
              </span>
              <p className="flex-1 min-w-0 text-[10.5px] font-semibold text-slate-600 truncate">
                {template.home} <span className="text-slate-300 font-normal">·</span> {template.away}
              </p>
              <div className="flex gap-1 shrink-0">
                {REGULAR_SIGNS.map(sign => {
                  const isActive = match?.result?.includes(sign);
                  return (
                    <button
                      key={sign}
                      type="button"
                      onClick={() => match && toggleSign(match.id, sign)}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-all active:scale-90',
                        isActive ? 'bg-manises-blue text-white shadow-sm' : 'bg-slate-50 text-slate-400'
                      )}
                    >
                      {sign}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => match && toggleReducido(match.id)}
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all active:scale-90',
                  match?.isReducido
                    ? 'bg-amber-500 text-white'
                    : 'bg-manises-blue text-white'
                )}
              >
                {match?.isReducido ? 'R' : 'D'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Pleno al 15 (por goles) ────────────────────────────────── */}
      {plenaFixture && (
        <div className="overflow-hidden rounded-2xl border border-amber-100/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-50 bg-amber-50/60 px-3 py-1.5">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
              <span className="text-[8px] font-black leading-none">15</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">
              Pleno al 15 (por goles)
            </p>
          </div>
          {/* Home row */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-amber-50/60">
            <span className="w-4 shrink-0 text-[9px] font-black text-amber-300 text-right">L</span>
            <p className="flex-1 min-w-0 text-[10.5px] font-semibold text-slate-600 truncate">{plenaFixture.home}</p>
            <div className="flex gap-1 shrink-0">
              {PLENA_SIGNS.map(sign => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => togglePlena('home', sign)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-all active:scale-90',
                    plenaHome?.includes(sign)
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-500'
                  )}
                >
                  {sign}
                </button>
              ))}
            </div>
          </div>
          {/* Away row */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="w-4 shrink-0 text-[9px] font-black text-amber-300 text-right">V</span>
            <p className="flex-1 min-w-0 text-[10.5px] font-semibold text-slate-600 truncate">{plenaFixture.away}</p>
            <div className="flex gap-1 shrink-0">
              {PLENA_SIGNS.map(sign => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => togglePlena('away', sign)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-all active:scale-90',
                    plenaAway?.includes(sign)
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-500'
                  )}
                >
                  {sign}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Leyenda doble/triple ─────────────────────────────────── */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-[34px] items-center justify-center rounded-md bg-manises-blue/10 text-[8px] font-black text-manises-blue">Doble</span>
          <span className="text-[9px] font-medium text-slate-400">2 signos en un partido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-[34px] items-center justify-center rounded-md bg-violet-100 text-[8px] font-black text-violet-600">Triple</span>
          <span className="text-[9px] font-medium text-slate-400">1X2 en un partido</span>
        </div>
      </div>
    </div>
  );
}
