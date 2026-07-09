import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn, formatCurrency } from '@/shared/lib/utils';
import {
  makeInitialMatches,
  getMatchTypeBadge,
  MANISES_REDUCTIONS,
  type QuinielaMatch,
  type QuinielaResult,
  type ManisesModalidad,
} from '../lib/quiniela-data';
import type { QuinielaFixture } from '../lib/quiniela-fixtures';

const PRICE_PER_BET = 0.75;
const REGULAR_SIGNS = ['1', 'X', '2'] as const;
const PLENA_SIGNS   = ['0', '1', '2', 'M'] as const;

// ── Types ──────────────────────────────────────────────────────────────────

export type ManisesMode = 'multiple' | 'manises';
type UnifiedOption = 'multiple' | ManisesModalidad;

export interface QuinielaManisesSummary {
  matches:   QuinielaMatch[];
  plenaHome: QuinielaResult;
  plenaAway: QuinielaResult;
  mode:      ManisesMode;
  modalidad: ManisesModalidad;
  bets:      number;
  price:     number;
  isValid:   boolean;
}

interface Props {
  fixtures:        QuinielaFixture[];
  onSummaryChange: (s: QuinielaManisesSummary) => void;
}

// ── GuaranteeTable ─────────────────────────────────────────────────────────

function GuaranteeTable({ table, totalCols, plenaFixture }: {
  table: typeof MANISES_REDUCTIONS[0]['table'];
  totalCols: number;
  plenaFixture?: { home: string; away: string };
}) {
  const parsedCols = table.development
    .filter(s => s.trim() !== '—')
    .map(row => row.trim().split(/\s+/).filter(Boolean).slice(0, 14));

  const hasPlena = !!(plenaFixture && table.plenaHome?.length && table.plenaAway?.length);

  return (
    <div className="space-y-3">
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
        {parsedCols.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-manises-blue/10" style={{ scrollbarWidth: 'none' }}>
            <div className="flex min-w-max bg-manises-blue/5 px-2 py-1.5">
              <span className="w-10 shrink-0" />
              {parsedCols.map((_, i) => (
                <span key={i} className="w-9 text-center text-[7px] font-black uppercase tracking-wide text-manises-blue">
                  Col {i + 1}
                </span>
              ))}
            </div>
            {Array.from({ length: 14 }, (_, r) => (
              <div key={r} className={cn('flex min-w-max items-center px-2 py-1', r % 2 === 0 ? 'bg-white' : 'bg-slate-50/60')}>
                <span className="w-10 shrink-0 text-[8px] font-bold text-slate-400">P{r + 1}</span>
                {parsedCols.map((col, i) => (
                  <span key={i} className={cn('w-9 text-center text-[9px] font-black font-mono leading-none',
                    col[r] === '—' ? 'text-slate-300' : 'text-slate-700')}>
                    {col[r] ?? '—'}
                  </span>
                ))}
              </div>
            ))}
            {hasPlena && (
              <>
                <div className="flex min-w-max items-center border-t border-amber-100/60 bg-amber-50/50 px-2 py-1.5">
                  <span className="w-10 shrink-0 text-[7px] font-bold leading-tight text-amber-600 truncate">
                    {plenaFixture!.home.split(' ')[0]}
                  </span>
                  {(table.plenaHome ?? []).map((v, i) => (
                    <span key={i} className="w-9 text-center text-[9px] font-black text-amber-600">{v}</span>
                  ))}
                </div>
                <div className="flex min-w-max items-center bg-amber-50/30 px-2 py-1.5">
                  <span className="w-10 shrink-0 text-[7px] font-bold leading-tight text-amber-600 truncate">
                    {plenaFixture!.away.split(' ')[0]}
                  </span>
                  {(table.plenaAway ?? []).map((v, i) => (
                    <span key={i} className="w-9 text-center text-[9px] font-black text-amber-600">{v}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-[9px] text-slate-400">—</p>
        )}
        <button type="button" className="mt-2 text-[9px] font-black text-manises-blue underline underline-offset-2">
          Ver todas las columnas ({totalCols})
        </button>
      </div>
    </div>
  );
}

// ── Sección principal ──────────────────────────────────────────────────────

export function QuinielaManisesSection({ fixtures, onSummaryChange }: Props) {
  // ── Core state ────────────────────────────────────────────────────────────
  const [matches, setMatches]     = useState<QuinielaMatch[]>(() => makeInitialMatches(fixtures.filter(f => f.id !== 15)));
  const [plenaHome, setPlenaHome] = useState<QuinielaResult>(null);
  const [plenaAway, setPlenaAway] = useState<QuinielaResult>(null);

  // ── Selection state ───────────────────────────────────────────────────────
  const [selectedOption, setSelectedOption] = useState<UnifiedOption>('al_11');

  // ── Accordion state (independent from selection) ──────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const plenaFixture = fixtures.find(f => f.id === 15);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const doublesCount = matches.filter(m => m.result && m.result.length === 2).length;
  const triplesCount = matches.filter(m => m.result === '1X2').length;
  const allRegular   = matches.every(m => m.result !== null);
  const plenaOk      = plenaHome !== null && plenaAway !== null;

  // ── Reactive bets for Múltiple option ─────────────────────────────────────
  const directBets = useMemo(() => {
    return matches.reduce((acc, m) => {
      if (!m.result) return 0;
      return acc * m.result.length;
    }, 1) * (plenaOk ? (plenaHome?.length ?? 1) * (plenaAway?.length ?? 1) : 0);
  }, [matches, plenaHome, plenaAway, plenaOk]);

  // ── All options with computed values ──────────────────────────────────────
  // Múltiple is reactive (depends on picks), reductions are fixed.
  const options = useMemo(() => [
    {
      id: 'multiple' as UnifiedOption,
      label: 'Múltiple',
      bets: directBets,
      price: directBets * PRICE_PER_BET,
      table: null as null,
    },
    ...MANISES_REDUCTIONS.map(r => ({
      id: r.id as UnifiedOption,
      label: r.label,
      bets: r.bets,
      price: r.bets * PRICE_PER_BET,
      table: r.table,
    })),
  ], [directBets]);

  // ── Active option values (drive stats bar + bottom bar) ───────────────────
  const activeOpt   = options.find(o => o.id === selectedOption) ?? options[options.length - 1];
  const activeBets  = activeOpt.bets;
  const activePrice = activeOpt.price;

  // ── Summary emission ──────────────────────────────────────────────────────
  const emitSummary = useCallback((
    m: QuinielaMatch[], ph: QuinielaResult, pa: QuinielaResult, opt: UnifiedOption
  ) => {
    const db  = m.filter(x => x.result && x.result.length === 2).length;
    const tb  = m.filter(x => x.result === '1X2').length;
    const all = m.every(x => x.result !== null);
    const pOk = ph !== null && pa !== null;
    const dB  = m.reduce((a, x) => { if (!x.result) return 0; return a * x.result.length; }, 1)
                * (pOk ? (ph?.length ?? 1) * (pa?.length ?? 1) : 0);

    const isMultiple = opt === 'multiple';
    const b   = isMultiple ? dB : (MANISES_REDUCTIONS.find(r => r.id === opt)?.bets ?? 0);
    const valid = all && pOk && (isMultiple || db + tb >= 1);

    onSummaryChange({
      matches: m, plenaHome: ph, plenaAway: pa,
      mode:     isMultiple ? 'multiple' : 'manises',
      modalidad: isMultiple ? 'al_13' : opt as ManisesModalidad,
      bets: b, price: b * PRICE_PER_BET, isValid: valid,
    });
  }, [onSummaryChange]);

  useEffect(() => {
    emitSummary(matches, plenaHome, plenaAway, selectedOption);
  }, [matches, plenaHome, plenaAway, selectedOption, emitSummary]);

  // ── Event handlers ────────────────────────────────────────────────────────
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

  const clearAll = () => {
    setMatches(makeInitialMatches(fixtures.filter(f => f.id !== 15)));
    setPlenaHome(null);
    setPlenaAway(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2.5">

      {/* ── Borrar boleto ───────────────────────────────────────────── */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-red-500 active:scale-95 transition-transform"
        >
          <Trash2 className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wide">Borrar boleto</span>
        </button>
      </div>

      {/* ── Stats strip — reflects selected option ───────────────────── */}
      <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
        {[
          { label: 'Dobles',        value: String(doublesCount),                                        color: 'text-manises-blue' },
          { label: 'Triples',       value: String(triplesCount),                                        color: 'text-violet-600' },
          { label: 'Apuestas',      value: allRegular && plenaOk ? String(activeBets) : '—',            color: 'text-slate-600' },
          { label: 'Importe total', value: allRegular && plenaOk ? formatCurrency(activePrice) : '—',   color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={cn('text-[12px] font-black leading-tight', s.color)}>{s.value}</p>
            <p className="mt-0.5 text-[7px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Unified options list (Múltiple + Reducciones) ────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-50 px-3 py-2">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Elige tu opción</p>
        </div>
        <div className="divide-y divide-slate-50">
          {options.map(opt => {
            const isSelected = selectedOption === opt.id;
            const isExpanded = expandedId === opt.id;
            const showBets   = opt.id === 'multiple' ? (allRegular && plenaOk && opt.bets > 0) : true;

            return (
              <div key={opt.id}>
                <div className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 transition-all',
                  isSelected ? 'bg-manises-blue/[0.04]' : 'bg-white'
                )}>
                  {/* Radio + label area → selects option */}
                  <button
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
                    className="flex flex-1 min-w-0 items-start gap-2.5 text-left"
                  >
                    <div className={cn(
                      'mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 flex items-center justify-center',
                      isSelected ? 'border-manises-blue' : 'border-slate-300'
                    )}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-manises-blue" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-black leading-tight text-manises-blue">{opt.label}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        {showBets ? opt.bets : '—'} apuestas
                      </p>
                      <p className="text-[15px] font-black text-emerald-600">
                        {showBets ? formatCurrency(opt.price) : '—'}
                      </p>
                    </div>
                  </button>

                  {/* Ver garantías — independent accordion toggle */}
                  {opt.table && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(prev => prev === opt.id ? null : opt.id)}
                      className="flex shrink-0 items-center gap-1"
                    >
                      <span className="text-[9px] font-black text-manises-blue">Ver garantías</span>
                      <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                  )}
                </div>

                {/* Guarantee accordion */}
                {opt.table && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-manises-blue/10 bg-[#eef3ff] px-4 py-3">
                          <GuaranteeTable table={opt.table} totalCols={opt.bets} plenaFixture={plenaFixture} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Match grid (partidos 1–14, filas compactas) ──────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-50">
        {fixtures.filter(f => f.id !== 15).map((template, idx) => {
          const match = matches[idx];
          const badge = getMatchTypeBadge(match?.result ?? null);
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
              <span className={cn(
                'w-9 shrink-0 text-[9px] font-black text-right',
                badge === 'Triple' ? 'text-violet-600' :
                badge === 'Doble'  ? 'text-manises-blue' : 'text-slate-200'
              )}>
                {badge ?? '—'}
              </span>
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
                    plenaHome?.includes(sign) ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-500'
                  )}
                >
                  {sign}
                </button>
              ))}
            </div>
          </div>
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
                    plenaAway?.includes(sign) ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-500'
                  )}
                >
                  {sign}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Aviso reducción sin dobles/triples ──────────────────────── */}
      {selectedOption !== 'multiple' && doublesCount + triplesCount === 0 && allRegular && plenaOk && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-[9px] font-medium text-slate-400 leading-relaxed">
            Las reducciones se activan automáticamente según los pronósticos.
            Necesitas al menos un doble o triple para activar la reducción.
          </p>
        </div>
      )}
    </div>
  );
}
