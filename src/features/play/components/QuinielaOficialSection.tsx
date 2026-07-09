import { useState, useCallback, useEffect } from 'react';
import { ChevronRight, ChevronUp, Lock } from 'lucide-react';
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

export interface QuinielaOficialSummary {
  matches: QuinielaOficialMatch[];
  reductionId: string;
  bets: number;
  price: number;
  isValid: boolean;
}

interface Props {
  fixtures: QuinielaFixture[];
  onSummaryChange: (s: QuinielaOficialSummary) => void;
}

function GuaranteeTable({ table }: { table: typeof OFICIAL_REDUCTIONS[0]['table'] }) {
  return (
    <div className="space-y-4">
      {/* Título */}
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-manises-blue/70">
        {table.title}
      </p>

      {/* Tabla de probabilidades */}
      <div className="rounded-xl overflow-hidden border border-manises-blue/10">
        <div className="bg-manises-blue/5 px-2 pt-2 pb-1">
          <div className="flex">
            <div className="w-14 shrink-0" />
            <p className="flex-1 text-center text-[7px] font-black uppercase tracking-[0.12em] text-slate-400">
              Aciertos garantizados
            </p>
          </div>
          <div className="flex mt-0.5">
            <div className="w-14 shrink-0 text-[7px] font-bold text-slate-400 uppercase">Prob.</div>
            {table.cols.map(col => (
              <div key={col} className="flex-1 text-center text-[7px] font-black text-manises-blue uppercase">
                {col}
              </div>
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

      {/* Desarrollo primeras columnas — ancho completo */}
      <div>
        <p className="mb-2 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
          Desarrollo oficial (primeras columnas)
        </p>
        <div className="space-y-1.5">
          {table.development.map((row, i) => {
            const signs = row.trim().split(/\s+/).filter(Boolean);
            return (
              <div key={i} className="flex items-center gap-1 w-full">
                <span className="w-10 shrink-0 text-[8px] font-bold text-slate-400">
                  Col.&nbsp;{i + 1}
                </span>
                <div className="flex flex-1 justify-between">
                  {signs.map((s, j) => (
                    <span
                      key={j}
                      className={cn(
                        'text-[9px] font-black text-center leading-none',
                        s === '—' ? 'text-slate-300' : 'text-slate-600 font-mono'
                      )}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-3 text-[9px] font-black text-manises-blue underline underline-offset-2"
        >
          Ver todas las columnas ({table.totalCols})
        </button>
      </div>
    </div>
  );
}

export function QuinielaOficialSection({ fixtures, onSummaryChange }: Props) {
  const [matches, setMatches] = useState<QuinielaOficialMatch[]>(() => makeInitialOficialMatches(fixtures));
  const [reductionId, setReductionId] = useState<string>('7D_13');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const regularMatches = matches.filter(m => m.id !== 15);
  const doublesTotal  = regularMatches.filter(m => m.result && m.result.length === 2).length;
  const triplesTotal  = regularMatches.filter(m => m.result === '1X2').length;
  const reducidosD    = regularMatches.filter(m => m.isReducido && m.result && m.result.length === 2).length;
  const reducidosT    = regularMatches.filter(m => m.isReducido && m.result === '1X2').length;
  const directosD     = doublesTotal - reducidosD;
  const directosT     = triplesTotal - reducidosT;

  const selectedReduction = OFICIAL_REDUCTIONS.find(r => r.id === reductionId);
  const bets  = selectedReduction?.bets ?? 32;
  const price = bets * PRICE_PER_BET;
  const allSelected = matches.every(m => m.result !== null);

  const emitSummary = useCallback((m: QuinielaOficialMatch[], rid: string) => {
    const red = OFICIAL_REDUCTIONS.find(r => r.id === rid);
    const b   = red?.bets ?? 0;
    const all = m.every(x => x.result !== null);
    onSummaryChange({ matches: m, reductionId: rid, bets: b, price: b * PRICE_PER_BET, isValid: all });
  }, [onSummaryChange]);

  useEffect(() => { emitSummary(matches, reductionId); }, [matches, reductionId, emitSummary]);

  const toggleSign = (matchId: number, sign: string) => {
    const isPlena = matchId === 15;
    const order = isPlena ? '012M' : '1X2';
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const cur = m.result;
      let next: QuinielaResult = null;
      if (!cur) {
        next = sign;
      } else if (cur === sign) {
        next = null;
      } else {
        const parts = new Set<string>(cur.split(''));
        if (parts.has(sign)) parts.delete(sign);
        else parts.add(sign);
        const sorted = [...parts].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join('');
        next = sorted || null;
      }
      return { ...m, result: next, isReducido: next === null ? false : m.isReducido };
    }));
  };

  const toggleReducido = (matchId: number) => {
    setMatches(prev => prev.map(m => {
      // Pleno al 15 no participa en la reducción; solo dobles/triples pueden marcarse
      if (m.id !== matchId || m.id === 15 || !m.result || m.result.length < 2) return m;
      return { ...m, isReducido: !m.isReducido };
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getOficialBadge = (m: QuinielaOficialMatch): { label: string; color: string } | null => {
    if (!m.result) return null;
    if (m.id === 15) return null; // Pleno al 15 no tiene badge R/D
    const isMulti = m.result.length >= 2;
    if (!isMulti) return { label: '—', color: 'text-slate-300' };
    if (m.isReducido) return { label: 'R', color: 'bg-manises-blue text-white' };
    return { label: 'D', color: 'bg-slate-100 text-slate-500' };
  };

  return (
    <div className="space-y-3">

      {/* ── Stats bar (5 columnas) ────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-2 py-2.5 shadow-sm">
        <div className="grid grid-cols-5 gap-1">
          <div className="text-center">
            <p className="text-[13px] font-black text-manises-blue">{doublesTotal}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 leading-tight">DOBLES</p>
          </div>
          <div className="text-center">
            <p className="text-[13px] font-black text-manises-blue">{triplesTotal}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 leading-tight">TRIPLES</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-[11px] font-black text-slate-600 leading-tight">{reducidosD}D&nbsp;/{reducidosT}T</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 leading-tight">REDUCIDOS</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-black text-slate-600 leading-tight">{directosD}D&nbsp;/{directosT}T</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 leading-tight">DIRECTO</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-[11px] font-black text-slate-600 leading-tight">
              {allSelected ? String(bets).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '—'}
            </p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 leading-tight">APUESTAS&nbsp;(D.)</p>
          </div>
        </div>
      </div>

      {/* ── Leyenda ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-manises-blue text-[8px] font-black text-white">R</span>
          <span className="text-[9px] font-medium text-slate-500">Reducido (entra en la reducción)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[8px] font-black text-slate-500">D</span>
          <span className="text-[9px] font-medium text-slate-500">Directo (juega al directo)</span>
        </div>
      </div>

      {/* ── Match grid ───────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
        {fixtures.map((template, idx) => {
          const match = matches[idx];
          const badge = getOficialBadge(match);
          return (
            <div key={template.id} className="flex items-center gap-2 py-2 px-3">
              <span className="w-5 shrink-0 text-[10px] font-black text-slate-300 text-right">{template.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-700 leading-tight truncate">{template.home}</p>
                {template.away && (
                  <p className="text-[11px] font-bold text-slate-700 leading-tight truncate">{template.away}</p>
                )}
              </div>
              <div className="flex gap-1">
                {(template.id === 15 ? ['0', '1', '2', 'M'] : ['1', 'X', '2']).map(sign => {
                  const isActive = match.result?.includes(sign);
                  return (
                    <button
                      key={sign}
                      type="button"
                      onClick={() => toggleSign(match.id, sign)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black transition-all active:scale-90',
                        isActive ? 'bg-manises-blue text-white shadow-sm' : 'bg-slate-50 text-slate-400'
                      )}
                    >
                      {sign}
                    </button>
                  );
                })}
              </div>
              {/* R/D badge — solo activo cuando hay resultado */}
              {match.result ? (
                <button
                  type="button"
                  onClick={() => toggleReducido(match.id)}
                  className="w-8 shrink-0 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <span className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-md text-[8px] font-black transition-all',
                    badge ? badge.color : 'text-slate-300'
                  )}>
                    {badge?.label ?? '—'}
                  </span>
                </button>
              ) : (
                <div className="w-8 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Reducción oficial selector ───────────────────────────── */}
      <div className="space-y-1">
        <p className="px-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Elige tu reducción oficial
        </p>

        {OFICIAL_REDUCTIONS.map(red => {
          const isSelected = reductionId === red.id;
          const isExpanded = expandedId === red.id;

          return (
            <div key={red.id} className="overflow-hidden rounded-2xl">
              <button
                type="button"
                disabled={red.locked}
                onClick={() => {
                  if (red.locked) return;
                  setReductionId(red.id);
                  toggleExpand(red.id);
                }}
                className={cn(
                  'w-full flex items-center gap-3 border px-4 py-3 text-left transition-all',
                  isExpanded ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl',
                  red.locked
                    ? 'opacity-50 border-transparent bg-white/40'
                    : isSelected
                      ? 'border-manises-blue/20 bg-white shadow-sm'
                      : 'border-transparent bg-white/60'
                )}
              >
                <div className={cn(
                  'h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center',
                  red.locked ? 'border-slate-200' :
                  isSelected  ? 'border-manises-blue' : 'border-slate-300'
                )}>
                  {isSelected && !red.locked && <div className="h-2 w-2 rounded-full bg-manises-blue" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-700">{red.label}</p>
                  <p className="text-[9px] font-medium text-slate-400">
                    {red.bets} apuestas · {formatCurrency(red.bets * PRICE_PER_BET)}
                  </p>
                </div>
                {red.locked ? (
                  <Lock className="h-3.5 w-3.5 text-slate-300" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-manises-blue">Ver garantías</span>
                    <span className="text-slate-200 text-[8px]">|</span>
                    <span className="text-[9px] font-black text-manises-blue">Ver columnas</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleExpand(red.id); }}
                    >
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-slate-400" />
                        : <ChevronRight className="h-4 w-4 text-slate-300" />
                      }
                    </button>
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && !red.locked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="w-full border-x border-b border-manises-blue/15 bg-[#eef3ff] px-4 py-4 rounded-b-2xl mb-1">
                      <GuaranteeTable table={red.table} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
