import { motion } from 'motion/react';
import { ShieldCheck, InfoCircle } from 'iconoir-react/regular';
import type { ReducedSystemUI } from '../contracts/reduced-play.contract';
import { cn, formatCurrency } from '@/shared/lib/utils';

interface ReducedSystemPickerProps {
  systems: ReducedSystemUI[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReducedSystemPicker({
  systems,
  selectedId,
  onSelect,
}: ReducedSystemPickerProps) {
  if (systems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <InfoCircle className="h-8 w-8 text-slate-300" />
        <p className="mt-2 text-[12px] font-black uppercase tracking-widest text-slate-400">
          Sin tablas compatibles
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Añade o quita números para ver opciones disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-manises-blue/60" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Tablas reducidas demo
          </p>
        </div>
        <span className="text-[9px] font-bold text-slate-400">
          {systems.length} {systems.length === 1 ? 'opción' : 'opciones'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {systems.map((system) => {
          const isActive = system.id === selectedId;

          return (
            <button
              key={system.id}
              onClick={() => onSelect(system.id)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[1.3rem] border p-4 text-left transition-all",
                isActive
                  ? "border-manises-blue/20 bg-manises-blue text-white shadow-[0_12px_30px_rgba(10,71,146,0.15)]"
                  : "border-slate-200 bg-white hover:border-manises-blue/20 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                      isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {system.guaranteeLabel}
                    </span>
                    {system.id.includes('reducida_4') && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-manises-gold">
                        ★ Recomendada
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-black leading-tight truncate">
                    {system.label}
                  </h3>
                  <p className={cn(
                    "mt-1 text-[11px] font-medium leading-relaxed",
                    isActive ? "text-white/80" : "text-slate-500"
                  )}>
                    {system.guaranteeCondition}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className={cn(
                    "rounded-xl px-2.5 py-1.5 text-center min-w-[60px]",
                    isActive ? "bg-white/10 text-white" : "bg-manises-blue/5 text-manises-blue"
                  )}>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Apuestas</p>
                    <p className="text-xs font-black">{system.betsCount}</p>
                  </div>
                  <p className={cn(
                    "text-[10px] font-black",
                    isActive ? "text-white" : "text-manises-blue"
                  )}>
                    {formatCurrency(system.totalPrice)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
