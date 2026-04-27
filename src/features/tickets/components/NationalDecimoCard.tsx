import { Target } from 'lucide-react';
import type { Ticket } from '@/shared/types/domain';

interface NationalDecimoCardProps {
  ticket: Ticket;
  displayNumber: string;
}

/**
 * Previsualización mock de un décimo de Lotería Nacional.
 */
export function NationalDecimoCard({ ticket, displayNumber }: NationalDecimoCardProps) {
  const series = (ticket.metadata?.series as string) || 'Serie demo';
  const fraction = (ticket.metadata?.fraction as string) || 'Fracción demo';
  const drawLabel = (ticket.metadata?.nationalDrawLabel as string) || 'Sorteo Nacional';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-manises-blue/10 bg-[#fffdf5] shadow-inner">
      <div className="absolute right-0 top-0 rounded-bl-xl bg-manises-gold/10 px-2 py-1 text-[8px] font-black uppercase text-manises-gold">
        DEMO · no es décimo real
      </div>

      <div className="flex p-4">
        {/* Imagen del décimo (Placeholder premium) */}
        <div className="mr-4 flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-manises-blue/5 bg-white p-2 shadow-sm">
          <div className="flex h-full w-full items-center justify-center rounded bg-manises-blue/5">
            <Target className="h-8 w-8 text-manises-blue/20" />
          </div>
          <p className="mt-1 text-[6px] font-bold text-slate-300">ADMIN. 6</p>
        </div>

        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-manises-blue/40">
              Lotería Nacional
            </p>
            <h4 className="text-sm font-black text-manises-blue">{drawLabel}</h4>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="block text-[28px] font-black leading-none tracking-tighter text-manises-blue">
                {displayNumber.padStart(5, '0')}
              </span>
              <div className="flex gap-2 text-[9px] font-bold text-slate-400">
                <span className="uppercase">{series}</span>
                <span className="uppercase">{fraction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-manises-blue/10 bg-manises-blue/[0.02] p-2 text-center">
        <p className="text-[8px] font-bold uppercase tracking-widest text-manises-blue/30">
          Custodiado en Administración Nº 6 · Manises
        </p>
      </div>
    </div>
  );
}
