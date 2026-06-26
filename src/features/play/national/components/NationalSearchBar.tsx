import { useState } from 'react';
import { Search } from 'lucide-react';
import type { NationalSearchState } from '../contracts/national-play.contract';

interface NationalSearchBarProps {
  searchState: NationalSearchState;
  onChange: (nextState: NationalSearchState) => void;
}

const SORT_LABELS: Record<NationalSearchState['sortBy'], string> = {
  featured: 'Destacados',
  availability: 'Stock',
  number: 'Número',
};

export function NationalSearchBar({ searchState, onChange }: NationalSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilter = searchState.minQuantity > 1 || searchState.sortBy !== 'featured' || !searchState.onlyAvailable;

  return (
    <div className="space-y-1.5">
      {/* Single compact row */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <input
            type="search"
            value={searchState.query}
            onChange={(event) => onChange({ ...searchState, query: event.target.value })}
            placeholder="Número completo o terminación"
            className="w-full bg-transparent text-[12px] font-semibold text-manises-blue outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${
            showFilters || hasActiveFilter
              ? 'border-manises-blue/20 bg-manises-blue/5 text-manises-blue'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          }`}
        >
          {showFilters ? 'Cerrar' : `Filtros${hasActiveFilter ? ' ·' : ''}`}
        </button>
      </div>

      {/* Collapsible filters */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm space-y-3">
          <div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-manises-blue">
              Mín. décimos iguales · {SORT_LABELS[searchState.sortBy]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[1, 10, 20, 30, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ ...searchState, minQuantity: val })}
                  className={`h-7 min-w-[2.5rem] rounded-lg border px-2 text-[10px] font-black transition-all ${
                    searchState.minQuantity === val
                      ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {val === 1 ? 'Todos' : `+${val}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
            {([
              { id: 'featured', label: 'Destacados' },
              { id: 'availability', label: 'Stock' },
              { id: 'number', label: 'Número' },
            ] as const).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ ...searchState, sortBy: option.id })}
                className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                  searchState.sortBy === option.id
                    ? 'border-manises-blue/20 bg-manises-blue/5 text-manises-blue'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChange({ ...searchState, onlyAvailable: !searchState.onlyAvailable })}
              className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] transition-colors ${
                searchState.onlyAvailable
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {searchState.onlyAvailable ? 'Con stock' : 'Todos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
