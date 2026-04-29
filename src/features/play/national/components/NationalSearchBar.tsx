import { Search } from 'lucide-react';
import type { NationalSearchState } from '../contracts/national-play.contract';

interface NationalSearchBarProps {
  searchState: NationalSearchState;
  onChange: (nextState: NationalSearchState) => void;
}

export function NationalSearchBar({ searchState, onChange }: NationalSearchBarProps) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="search"
          value={searchState.query}
          onChange={(event) => onChange({ ...searchState, query: event.target.value })}
          placeholder="Buscar número"
          className="w-full bg-transparent text-[14px] font-semibold text-manises-blue outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Quiero al menos X décimos iguales</p>
          <span className="text-[10px] font-black text-manises-blue">{searchState.minQuantity} {searchState.minQuantity === 1 ? 'décimo' : 'décimos'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 20, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ ...searchState, minQuantity: val })}
              className={`rounded-xl border h-9 min-w-[3.5rem] px-3 text-[11px] font-black transition-all ${
                searchState.minQuantity === val
                  ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
        {[
          { id: 'featured', label: 'Destacados' },
          { id: 'availability', label: 'Stock demo' },
          { id: 'number', label: 'Número' },
        ].map((option) => {
          const active = searchState.sortBy === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange({ ...searchState, sortBy: option.id as NationalSearchState['sortBy'] })}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
                active
                  ? 'border-manises-blue/20 bg-manises-blue/5 text-manises-blue'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {option.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onChange({ ...searchState, onlyAvailable: !searchState.onlyAvailable })}
          className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
            searchState.onlyAvailable
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          {searchState.onlyAvailable ? 'Solo con stock' : 'Mostrar todos'}
        </button>
      </div>
    </div>
  );
}
