import { useState, useCallback, useEffect } from 'react';
import { Minus, Plus, Trash2, Shuffle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { QuinielaResult } from '../lib/quiniela-data';
import type { QuinielaFixture } from '../lib/quiniela-fixtures';

const PRICE_PER_COL = 0.75;
const MIN_COLS = 2;
const MAX_COLS = 8;
const REGULAR_SIGNS = ['1', 'X', '2'] as const;
const PLENA_SIGNS   = ['0', '1', '2', 'M'] as const;

// Column stores 14 regular results + [14] is unused for P15
type Column = (QuinielaResult | null)[];
// P15 per column: { home: sign | null, away: sign | null }
type PlenaCol = { home: string | null; away: string | null };

function makeEmptyColumn(): Column  { return Array(14).fill(null) as Column; }
function makeEmptyPlena(): PlenaCol { return { home: null, away: null }; }

function randomSign() { return REGULAR_SIGNS[Math.floor(Math.random() * 3)]; }
function randomPlena(): PlenaCol {
  return { home: PLENA_SIGNS[Math.floor(Math.random() * 4)], away: PLENA_SIGNS[Math.floor(Math.random() * 4)] };
}

export interface QuinielaSimpleSummary {
  columns: Column[];
  plenas:  PlenaCol[];
  price:   number;
  isValid: boolean;
}

interface Props {
  fixtures: QuinielaFixture[];
  drawDate: Date;
  onSummaryChange: (s: QuinielaSimpleSummary) => void;
}

export function QuinielaSimpleSection({ fixtures, drawDate, onSummaryChange }: Props) {
  const drawDateLabel = (() => {
    const s = drawDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();
  const [columns, setColumns]   = useState<Column[]>([makeEmptyColumn(), makeEmptyColumn()]);
  const [plenas, setPlenas]     = useState<PlenaCol[]>([makeEmptyPlena(), makeEmptyPlena()]);
  const [activeIdx, setActiveIdx] = useState(0);

  const regularFixtures = fixtures.filter(f => f.id !== 15);
  const plenaFixture    = fixtures.find(f => f.id === 15);

  const emitSummary = useCallback((cols: Column[], pls: PlenaCol[]) => {
    const isValid = cols.every((col, ci) => {
      const reg = col.every(r => r !== null);
      const p   = pls[ci]?.home !== null && pls[ci]?.away !== null;
      return reg && p;
    });
    onSummaryChange({ columns: cols, plenas: pls, price: cols.length * PRICE_PER_COL, isValid });
  }, [onSummaryChange]);

  useEffect(() => { emitSummary(columns, plenas); }, [columns, plenas, emitSummary]);

  const addColumn = () => {
    if (columns.length >= MAX_COLS) return;
    const nextCols  = [...columns, makeEmptyColumn()];
    const nextPlenas = [...plenas, makeEmptyPlena()];
    setColumns(nextCols);
    setPlenas(nextPlenas);
    setActiveIdx(nextCols.length - 1);
  };

  const removeColumn = () => {
    if (columns.length <= MIN_COLS) return;
    const nextCols   = columns.slice(0, -1);
    const nextPlenas = plenas.slice(0, -1);
    setColumns(nextCols);
    setPlenas(nextPlenas);
    setActiveIdx(Math.min(activeIdx, nextCols.length - 1));
  };

  const toggleSign = (matchIdx: number, sign: string) => {
    setColumns(prev => prev.map((col, ci) => {
      if (ci !== activeIdx) return col;
      const updated = [...col];
      updated[matchIdx] = updated[matchIdx] === sign ? null : sign;
      return updated;
    }));
  };

  const togglePlena = (side: 'home' | 'away', sign: string) => {
    setPlenas(prev => prev.map((p, ci) => {
      if (ci !== activeIdx) return p;
      return { ...p, [side]: p[side] === sign ? null : sign };
    }));
  };

  const clearColumn = () => {
    setColumns(prev => prev.map((col, ci) => ci !== activeIdx ? col : makeEmptyColumn()));
    setPlenas(prev => prev.map((p, ci) => ci !== activeIdx ? p : makeEmptyPlena()));
  };

  const randomizeColumn = () => {
    setColumns(prev => prev.map((col, ci) => ci !== activeIdx ? col : regularFixtures.map(() => randomSign())));
    setPlenas(prev => prev.map((p, ci) => ci !== activeIdx ? p : randomPlena()));
  };

  const activeCol   = columns[activeIdx] ?? makeEmptyColumn();
  const activePlena = plenas[activeIdx]  ?? makeEmptyPlena();

  return (
    <div className="space-y-2.5">

      {/* ── Fecha ──────────────────────────────────────────────────── */}
      <h2 className="text-[15px] font-black text-manises-blue leading-tight">
        {drawDateLabel}
      </h2>

      {/* ── Column navigator ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
        {/* Remove column */}
        <button
          type="button"
          onClick={removeColumn}
          disabled={columns.length <= MIN_COLS}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        {/* Column dots */}
        <div className="flex-1 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400 leading-tight">
            Columnas
          </p>
          <p className="text-[14px] font-black text-manises-blue leading-tight">
            {activeIdx + 1} de {columns.length}
          </p>
          <div className="mt-1 flex gap-1 justify-center">
            {columns.map((col, i) => {
              const plena   = plenas[i];
              const complete = col.every(r => r !== null) && plena?.home !== null && plena?.away !== null;
              return (
                <button key={i} type="button" onClick={() => setActiveIdx(i)}
                  className="p-2 -m-2"
                >
                  <span className={cn('block h-2.5 rounded-full transition-all',
                    i === activeIdx ? 'bg-manises-blue w-6' :
                    complete ? 'bg-emerald-400 w-2.5' : 'bg-slate-200 w-2.5'
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear column */}
        <button
          type="button"
          onClick={clearColumn}
          className="flex h-8 items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-2.5 text-red-500 active:scale-95 transition-transform"
        >
          <Trash2 className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wide">Borrar</span>
        </button>

        {/* Random */}
        <button
          type="button"
          onClick={randomizeColumn}
          className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-slate-500 active:scale-95 transition-transform"
        >
          <Shuffle className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wide">Aleatorio</span>
        </button>

        {/* Add column */}
        <button
          type="button"
          onClick={addColumn}
          disabled={columns.length >= MAX_COLS}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-manises-blue/20 bg-manises-blue/8 text-manises-blue disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Partidos 1–14 (filas compactas) ───────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-50">
        {regularFixtures.map((match, idx) => {
          const selected = activeCol[idx];
          return (
            <div key={match.id} className="flex items-center gap-2 py-1.5 px-3">
              <span className="w-4 shrink-0 text-[10px] font-black text-slate-300 text-right tabular-nums">
                {match.id}
              </span>
              <p className="flex-1 min-w-0 text-[10.5px] font-semibold text-slate-600 truncate leading-tight">
                {match.home} <span className="text-slate-300 font-normal">·</span> {match.away}
              </p>
              <div className="flex gap-1 shrink-0">
                {REGULAR_SIGNS.map(sign => (
                  <button
                    key={sign}
                    type="button"
                    onClick={() => toggleSign(idx, sign)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black transition-all active:scale-90',
                      selected === sign
                        ? 'bg-manises-blue text-white shadow-sm'
                        : 'bg-slate-50 text-slate-400'
                    )}
                  >
                    {sign}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pleno al 15 (por goles) ────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-amber-100/80 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-amber-50 bg-amber-50/60 px-3 py-1.5">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
            <span className="text-[8px] font-black leading-none">15</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">
            Pleno al 15 (por goles)
          </p>
        </div>
        {plenaFixture && (
          <>
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
                      activePlena.home === sign
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
                      activePlena.away === sign
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-500'
                    )}
                  >
                    {sign}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
