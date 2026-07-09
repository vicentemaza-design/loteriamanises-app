import { useState, useCallback, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { QuinielaResult } from '../lib/quiniela-data';
import type { QuinielaFixture } from '../lib/quiniela-fixtures';

const PRICE_PER_COL = 0.75;
const MIN_COLS = 2;
const MAX_COLS = 8;

type Column = (QuinielaResult | null)[];

function makeEmptyColumn(): Column {
  return Array(15).fill(null) as Column;
}

export interface QuinielaSimpleSummary {
  columns: Column[];
  price: number;
  isValid: boolean;
}

interface Props {
  fixtures: QuinielaFixture[];
  onSummaryChange: (s: QuinielaSimpleSummary) => void;
}

export function QuinielaSimpleSection({ fixtures, onSummaryChange }: Props) {
  const [columns, setColumns] = useState<Column[]>([makeEmptyColumn(), makeEmptyColumn()]);
  const [activeIdx, setActiveIdx] = useState(0);

  const emitSummary = useCallback((cols: Column[]) => {
    const isValid = cols.every(col => col.every(r => r !== null));
    onSummaryChange({
      columns: cols,
      price: cols.length * PRICE_PER_COL,
      isValid,
    });
  }, [onSummaryChange]);

  useEffect(() => { emitSummary(columns); }, [columns, emitSummary]);

  const addColumn = () => {
    if (columns.length >= MAX_COLS) return;
    const next = [...columns, makeEmptyColumn()];
    setColumns(next);
    setActiveIdx(next.length - 1);
  };

  const removeColumn = () => {
    if (columns.length <= MIN_COLS) return;
    const next = columns.slice(0, -1);
    setColumns(next);
    setActiveIdx(Math.min(activeIdx, next.length - 1));
  };

  const toggleSign = (matchIdx: number, sign: string) => {
    setColumns(prev => {
      const next = prev.map((col, ci) => {
        if (ci !== activeIdx) return col;
        const updated = [...col];
        updated[matchIdx] = updated[matchIdx] === sign ? null : sign;
        return updated;
      });
      return next;
    });
  };

  const activeCol = columns[activeIdx] ?? makeEmptyColumn();
  const doublesCount = columns.filter(col => col.every(r => r !== null)).length;

  return (
    <div className="space-y-3">
      {/* Column navigator */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={removeColumn}
          disabled={columns.length <= MIN_COLS}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-[13px] font-black text-manises-blue">
            Columna {activeIdx + 1} de {columns.length}
          </p>
          <div className="mt-1.5 flex gap-1 justify-center">
            {columns.map((col, i) => {
              const complete = col.every(r => r !== null);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    i === activeIdx ? 'bg-manises-blue w-4' :
                    complete ? 'bg-emerald-400' : 'bg-slate-200'
                  )}
                />
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={addColumn}
          disabled={columns.length >= MAX_COLS}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-manises-blue/20 bg-manises-blue/8 text-manises-blue disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Match grid */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
        {fixtures.map((match, idx) => {
          const selected = activeCol[idx];
          return (
            <div key={match.id} className="flex items-center gap-2.5 py-2 px-3">
              <span className="w-5 shrink-0 text-[10px] font-black text-slate-300 text-right">
                {match.id}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-700 leading-tight truncate">{match.home}</p>
                {match.away && (
                  <p className="text-[11px] font-bold text-slate-700 leading-tight truncate">{match.away}</p>
                )}
              </div>
              <div className="flex gap-1">
                {(match.id === 15 ? ['0', '1', '2', 'M'] : ['1', 'X', '2']).map(sign => {
                  const isActive = selected === sign;
                  return (
                    <button
                      key={sign}
                      type="button"
                      onClick={() => toggleSign(idx, sign)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black transition-all active:scale-90',
                        isActive
                          ? 'bg-manises-blue text-white shadow-sm'
                          : 'bg-slate-50 text-slate-400'
                      )}
                    >
                      {sign}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
        <span className="text-[10px] text-slate-400 leading-relaxed font-medium">
          En columna sencilla solo puedes marcar un signo por partido.
          {columns.length > 1 && ` Tienes ${doublesCount} de ${columns.length} columnas completas.`}
        </span>
      </div>
    </div>
  );
}
