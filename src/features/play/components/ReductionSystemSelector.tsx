import { motion } from 'motion/react';
import { ShieldCheck } from 'iconoir-react/regular';
import type { ReductionSystemDefinition } from '../lib/play-matrix';

interface ReductionSystemSelectorProps {
  systems: ReductionSystemDefinition[];
  currentSystemId: string;
  onChange: (systemId: string) => void;
}

export function ReductionSystemSelector({
  systems,
  currentSystemId,
  onChange,
}: ReductionSystemSelectorProps) {
  if (systems.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck className="h-4 w-4 text-manises-blue/65" />
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Sistema reducido
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {systems.map((system) => {
          const isActive = system.id === currentSystemId;
          const pattern = system.requiredPattern
            ? `${system.requiredPattern.dobles}D · ${system.requiredPattern.triples}T`
            : system.guaranteeLabel;

          return (
            <button
              key={system.id}
              type="button"
              onClick={() => onChange(system.id)}
              className={`relative overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all ${
                isActive
                  ? 'border-manises-blue/25 bg-manises-blue text-white shadow-[0_14px_36px_rgba(10,71,146,0.22)]'
                  : 'border-slate-200 bg-white text-manises-blue hover:border-manises-blue/20 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeReductionSystem"
                  className="absolute inset-0 bg-[linear-gradient(135deg,#0a4792_0%,#1f5db3_100%)]"
                  transition={{ type: 'spring', bounce: 0.16, duration: 0.44 }}
                />
              )}

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className={`text-[12px] font-black uppercase tracking-[0.12em] ${isActive ? 'text-white/75' : 'text-slate-400'}`}>
                    {pattern}
                  </p>
                  <h3 className="mt-1 text-sm font-black leading-tight">{system.label}</h3>
                  <p className={`mt-1 text-[12px] font-medium leading-relaxed ${isActive ? 'text-white/78' : 'text-slate-500'}`}>
                    {system.guaranteeCondition}
                  </p>
                </div>

                {system.fixedBetsCount ? (
                  <div
                    className={`rounded-xl px-2.5 py-2 text-center ${
                      isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-manises-blue'
                    }`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-70">Cols.</p>
                    <p className="mt-0.5 text-sm font-black">{system.fixedBetsCount}</p>
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
