import { useState, useEffect } from 'react';
import { QUINIELA_REDUCED_TABLES, QuinielaReducedType } from '../lib/bet-calculator';
import { Check, AlertCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface QuinielaMatch {
  id: number;
  home: string;
  away: string;
  result: '1' | 'X' | '2' | '1X' | '12' | 'X2' | '1X2' | null;
}

interface Props {
  mode: 'simple' | 'reduced';
  reducedType?: QuinielaReducedType;
  onSelectionChange: (selection: QuinielaMatch[]) => void;
}

const INITIAL_MATCHES: QuinielaMatch[] = [
  { id: 1, home: 'Real Madrid', away: 'FC Barcelona', result: null },
  { id: 2, home: 'Atlético', away: 'Sevilla', result: null },
  { id: 3, home: 'Real Sociedad', away: 'Betis', result: null },
  { id: 4, home: 'Athletic', away: 'Villarreal', result: null },
  { id: 5, home: 'Girona', away: 'Valencia', result: null },
  { id: 6, home: 'Las Palmas', away: 'Osasuna', result: null },
  { id: 7, home: 'Celta', away: 'Getafe', result: null },
  { id: 8, home: 'Alavés', away: 'Mallorca', result: null },
  { id: 9, home: 'Rayo', away: 'Cádiz', result: null },
  { id: 10, home: 'Granada', away: 'Almería', result: null },
  { id: 11, home: 'Zaragoza', away: 'Espanyol', result: null },
  { id: 12, home: 'Sporting', away: 'Eibar', result: null },
  { id: 13, home: 'Levante', away: 'Valladolid', result: null },
  { id: 14, home: 'Racing', away: 'Burgos', result: null },
  { id: 15, home: 'Pleno al 15', away: '(M - G)', result: null },
];

export function QuinielaProfessionalSelector({ mode, reducedType, onSelectionChange }: Props) {
  const [matches, setMatches] = useState<QuinielaMatch[]>(INITIAL_MATCHES);
  
  const doublesCount = matches.filter(m => ['1X', '12', 'X2'].includes(m.result || '')).length;
  const triplesCount = matches.filter(m => m.result === '1X2').length;

  const config = reducedType ? QUINIELA_REDUCED_TABLES[reducedType] : null;

  useEffect(() => {
    onSelectionChange(matches);
  }, [matches, onSelectionChange]);

  const toggleResult = (matchId: number, val: '1' | 'X' | '2') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      
      const current = m.result;
      let next: QuinielaMatch['result'] = null;

      if (!current) next = val;
      else if (current === val) next = null;
      else {
        // Lógica de múltiples (solo si el click añade un signo nuevo)
        const parts = new Set(current.split(''));
        if (parts.has(val)) parts.delete(val);
        else parts.add(val);
        
        const sorted = Array.from(parts).sort().join('') as QuinielaMatch['result'];
        next = sorted || null;
      }

      return { ...m, result: next };
    }));
  };

  return (
    <div className="space-y-4">
      {/* Resumen de Sistema */}
      {mode === 'reduced' && config && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Sistema: {config.label}</p>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${doublesCount === config.dobles ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                <p className="text-[10px] font-bold text-indigo-700">DOBLES: {doublesCount}/{config.dobles}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${triplesCount === config.triples ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                <p className="text-[10px] font-bold text-indigo-700">TRIPLES: {triplesCount}/{config.triples}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Partidos */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
        {matches.map((match) => (
          <div key={match.id} className="flex items-center p-3 gap-3">
            <div className="w-6 text-[10px] font-black text-slate-300">{match.id}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-700 truncate">{match.home}</p>
              <p className="text-[11px] font-bold text-slate-700 truncate">{match.away}</p>
            </div>
            <div className="flex gap-1.5">
              {['1', 'X', '2'].map((v) => {
                const isActive = match.result?.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => toggleResult(match.id, v as '1'|'X'|'2')}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                      isActive 
                        ? 'bg-manises-blue text-white shadow-md scale-95' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 active:scale-90'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
