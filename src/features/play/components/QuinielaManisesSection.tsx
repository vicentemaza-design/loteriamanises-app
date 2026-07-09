import { useState, useCallback, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
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

const PRICE_PER_BET = 1.0;

export interface QuinielaManisesSummary {
  matches: QuinielaMatch[];
  modalidad: ManisesModalidad;
  bets: number;
  price: number;
  isValid: boolean;
}

interface Props {
  fixtures: QuinielaFixture[];
  onSummaryChange: (s: QuinielaManisesSummary) => void;
}

/* ── Tabla de garantías expandida ────────────────────────────────────── */
function GuaranteeTable({
  table,
  totalCols,
}: {
  table: typeof MANISES_REDUCTIONS[0]['table'];
  totalCols: number;
}) {
  return (
    <div className="space-y-4">
      {/* Título */}
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-manises-blue/70">
        {table.title}
      </p>

      {/* Tabla de probabilidades */}
      <div className="rounded-xl overflow-hidden border border-manises-blue/10">
        {/* Cabecera doble */}
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
        {/* Filas */}
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
          Desarrollo (primeras columnas)
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
          Ver todas las columnas ({totalCols})
        </button>
      </div>
    </div>
  );
}

/* ── Sección principal ────────────────────────────────────────────────── */
export function QuinielaManisesSection({ fixtures, onSummaryChange }: Props) {
  const [matches, setMatches] = useState<QuinielaMatch[]>(() => makeInitialMatches(fixtures));
  const [modalidad, setModalidad] = useState<ManisesModalidad>('directo');
  const [expandedModalidad, setExpandedModalidad] = useState<string | null>(null);

  const regularMatches = matches.filter(m => m.id !== 15);
  const doublesCount = regularMatches.filter(m => m.result && m.result.length === 2).length;
  const triplesCount = regularMatches.filter(m => m.result === '1X2').length;
  const allSelected  = matches.every(m => m.result !== null);

  const directBets = matches.reduce((acc, m) => {
    if (!m.result) return 0;
    return acc * m.result.length;
  }, 1);

  const bets  = modalidad === 'directo'
    ? directBets
    : MANISES_REDUCTIONS.find(r => r.id === modalidad)?.bets ?? 0;
  const price = bets * PRICE_PER_BET;

  const emitSummary = useCallback((m: QuinielaMatch[], mod: ManisesModalidad) => {
    const reg  = m.filter(x => x.id !== 15);
    const db   = reg.filter(x => x.result && x.result.length === 2).length;
    const tb   = reg.filter(x => x.result === '1X2').length;
    const all  = m.every(x => x.result !== null);
    const dB   = m.reduce((a, x) => {
      if (!x.result) return 0;
      return a * x.result.length;
    }, 1);
    const b    = mod === 'directo' ? dB : MANISES_REDUCTIONS.find(r => r.id === mod)?.bets ?? 0;
    const valid = all && (mod === 'directo' || db + tb >= 1);
    onSummaryChange({ matches: m, modalidad: mod, bets: b, price: b * PRICE_PER_BET, isValid: valid });
  }, [onSummaryChange]);

  useEffect(() => { emitSummary(matches, modalidad); }, [matches, modalidad, emitSummary]);

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
      return { ...m, result: next };
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedModalidad(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-3">

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
        {[
          { label: 'DOBLES',          value: String(doublesCount),                                         color: 'text-manises-blue' },
          { label: 'TRIPLES',         value: String(triplesCount),                                         color: 'text-manises-blue' },
          { label: 'APUESTAS (DIR.)', value: allSelected ? String(directBets) : '—',                      color: 'text-slate-600' },
          { label: 'IMPORTE DIRECTO', value: allSelected ? formatCurrency(directBets * PRICE_PER_BET) : '—', color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={cn('text-[13px] font-black leading-tight', s.color)}>{s.value}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.06em] mt-0.5 leading-tight">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Match grid ────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
        {fixtures.map((template, idx) => {
          const match = matches[idx];
          const badge = getMatchTypeBadge(match.result);
          return (
            <div key={template.id} className="flex items-center gap-2.5 py-2 px-3">
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
              {/* Badge tipo Doble/Triple/Simple */}
              <span className={cn(
                'w-11 shrink-0 text-[9px] font-black text-right leading-tight',
                badge === 'Triple' ? 'text-violet-600' :
                badge === 'Doble'  ? 'text-manises-blue' : 'text-slate-300'
              )}>
                {badge ?? ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Selector de modalidad ─────────────────────────────────── */}
      <div className="space-y-px">
        <p className="px-0.5 pb-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Elige tu modalidad
        </p>

        {/* Directo */}
        <button
          type="button"
          onClick={() => setModalidad('directo')}
          className={cn(
            'w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
            modalidad === 'directo'
              ? 'border-manises-blue/20 bg-white shadow-sm'
              : 'border-transparent bg-white/60'
          )}
        >
          <div className={cn(
            'h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center',
            modalidad === 'directo' ? 'border-manises-blue' : 'border-slate-300'
          )}>
            {modalidad === 'directo' && <div className="h-2 w-2 rounded-full bg-manises-blue" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-slate-700">Directo (múltiple)</p>
            <p className="text-[9px] font-medium text-slate-400 mt-0.5">
              {allSelected ? `${directBets} apuestas · ${formatCurrency(directBets * PRICE_PER_BET)}` : 'Completa el pronóstico'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </button>

        {/* Reducciones Manises */}
        {MANISES_REDUCTIONS.map(red => {
          const isSelected = modalidad === red.id;
          const isExpanded = expandedModalidad === red.id;

          return (
            <div key={red.id} className="overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setModalidad(red.id);
                  toggleExpand(red.id);
                }}
                className={cn(
                  'w-full flex items-center gap-3 border px-4 py-3 text-left transition-all',
                  isExpanded ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl',
                  isSelected
                    ? 'border-manises-blue/20 bg-white shadow-sm'
                    : 'border-transparent bg-white/60'
                )}
              >
                <div className={cn(
                  'h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center',
                  isSelected ? 'border-manises-blue' : 'border-slate-300'
                )}>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-manises-blue" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-700">{red.label}</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                    {red.bets} apuestas · {formatCurrency(red.bets * PRICE_PER_BET)}
                  </p>
                </div>
                <span className="text-[9px] font-black text-manises-blue">Ver garantías</span>
                <ChevronDown className={cn(
                  'h-4 w-4 shrink-0 text-slate-400 transition-transform',
                  isExpanded ? 'rotate-180' : ''
                )} />
              </button>

              {/* Panel expandido — ancho completo */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      'w-full border-x border-b border-manises-blue/15 bg-[#eef3ff] px-4 py-4 rounded-b-2xl',
                      isSelected ? 'border-manises-blue/20' : 'border-manises-blue/10'
                    )}>
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
  );
}
