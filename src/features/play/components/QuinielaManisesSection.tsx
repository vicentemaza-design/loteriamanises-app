import { useState, useCallback, useEffect } from 'react';
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

export type ManisesMode = 'multiple' | 'manises';

export interface QuinielaManisesSummary {
  matches:      QuinielaMatch[];
  plenaHome:    QuinielaResult;
  plenaAway:    QuinielaResult;
  mode:         ManisesMode;
  modalidad:    ManisesModalidad;
  bets:         number;
  price:        number;
  isValid:      boolean;
}

interface Props {
  fixtures:          QuinielaFixture[];
  initialMode?:      ManisesMode;
  onSummaryChange:   (s: QuinielaManisesSummary) => void;
}

/* ── GuaranteeTable ──────────────────────────────────────────────────────── */
function GuaranteeTable({ table, totalCols }: {
  table: typeof MANISES_REDUCTIONS[0]['table'];
  totalCols: number;
}) {
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
export function QuinielaManisesSection({ fixtures, initialMode = 'multiple', onSummaryChange }: Props) {
  const [mode, setMode]           = useState<ManisesMode>(initialMode);
  const [matches, setMatches]     = useState<QuinielaMatch[]>(() => makeInitialMatches(fixtures.filter(f => f.id !== 15)));
  const [plenaHome, setPlenaHome] = useState<QuinielaResult>(null);
  const [plenaAway, setPlenaAway] = useState<QuinielaResult>(null);
  const [modalidad, setModalidad] = useState<ManisesModalidad>('al_13');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const plenaFixture = fixtures.find(f => f.id === 15);

  const doublesCount = matches.filter(m => m.result && m.result.length === 2).length;
  const triplesCount = matches.filter(m => m.result === '1X2').length;
  const allRegular   = matches.every(m => m.result !== null);
  const plenaOk      = plenaHome !== null && plenaAway !== null;

  const directBets = matches.reduce((acc, m) => {
    if (!m.result) return 0;
    return acc * m.result.length;
  }, 1) * (plenaOk ? (plenaHome?.length ?? 1) * (plenaAway?.length ?? 1) : 0);

  const bets  = mode === 'multiple'
    ? directBets
    : (MANISES_REDUCTIONS.find(r => r.id === modalidad)?.bets ?? 0);
  const price = bets * PRICE_PER_BET;

  const emitSummary = useCallback((
    m: QuinielaMatch[], ph: QuinielaResult, pa: QuinielaResult,
    mod: ManisesModalidad, currentMode: ManisesMode
  ) => {
    const db  = m.filter(x => x.result && x.result.length === 2).length;
    const tb  = m.filter(x => x.result === '1X2').length;
    const all = m.every(x => x.result !== null);
    const pOk = ph !== null && pa !== null;
    const dB  = m.reduce((a, x) => { if (!x.result) return 0; return a * x.result.length; }, 1)
                * (pOk ? (ph?.length ?? 1) * (pa?.length ?? 1) : 0);
    const b   = currentMode === 'multiple' ? dB : MANISES_REDUCTIONS.find(r => r.id === mod)?.bets ?? 0;
    const valid = all && pOk && (currentMode === 'multiple' || db + tb >= 1);
    onSummaryChange({ matches: m, plenaHome: ph, plenaAway: pa, mode: currentMode, modalidad: mod, bets: b, price: b * PRICE_PER_BET, isValid: valid });
  }, [onSummaryChange]);

  useEffect(() => {
    emitSummary(matches, plenaHome, plenaAway, modalidad, mode);
  }, [matches, plenaHome, plenaAway, modalidad, mode, emitSummary]);

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

  return (
    <div className="space-y-2.5">

      {/* ── Mode toggle: Múltiple / Reducidas ───────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl border border-slate-200 bg-slate-100/60 p-0.5 gap-0.5">
          {(['multiple', 'manises'] as ManisesMode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-[10px] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all',
                mode === m
                  ? 'bg-white text-manises-blue shadow-sm'
                  : 'text-slate-400'
              )}
            >
              {m === 'multiple' ? 'Múltiple' : 'Reducidas'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-red-500 active:scale-95 transition-transform"
        >
          <Trash2 className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wide">Borrar boleto</span>
        </button>
      </div>

      {/* ── Stats strip (Múltiple mode) ──────────────────────────────── */}
      {mode === 'multiple' && (
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
          {[
            { label: 'Dobles',   value: String(doublesCount),                                       color: 'text-manises-blue' },
            { label: 'Triples',  value: String(triplesCount),                                       color: 'text-violet-600' },
            { label: 'Apuestas', value: allRegular && plenaOk ? String(directBets) : '—',           color: 'text-slate-600' },
            { label: 'Importe',  value: allRegular && plenaOk ? formatCurrency(price) : '—',        color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={cn('text-[12px] font-black leading-tight', s.color)}>{s.value}</p>
              <p className="mt-0.5 text-[7px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Reduction selector (Reducidas mode, at top) ─────────────── */}
      {mode === 'manises' && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-50 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Elige tu reducción</p>
          </div>
          <div className="divide-y divide-slate-50">
            {MANISES_REDUCTIONS.map(red => {
              const isSelected = modalidad === red.id;
              const isExpanded = expandedId === red.id;
              return (
                <div key={red.id}>
                  <button
                    type="button"
                    onClick={() => { setModalidad(red.id); setExpandedId(prev => prev === red.id ? null : red.id); }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all',
                      isSelected ? 'bg-manises-blue/[0.04]' : 'bg-white'
                    )}
                  >
                    <div className={cn(
                      'h-3.5 w-3.5 shrink-0 rounded-full border-2 flex items-center justify-center',
                      isSelected ? 'border-manises-blue' : 'border-slate-300'
                    )}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-manises-blue" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-700">{red.label}</p>
                      <p className="text-[9px] text-slate-400">{red.bets} apuestas · {formatCurrency(red.bets * PRICE_PER_BET)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-black text-manises-blue">Ver garantías</span>
                      <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                    </div>
                  </button>
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
                          <GuaranteeTable table={red.table} totalCols={red.bets} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          {/* Home */}
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
          {/* Away */}
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

      {/* ── Info strip (Reducidas) ───────────────────────────────────── */}
      {mode === 'manises' && (
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
