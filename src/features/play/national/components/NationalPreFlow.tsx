import { useState } from 'react';
import type { ReactNode } from 'react';
import { Spark, EditPencil } from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';

export type NationalMethod = 'aleatorio' | 'elegir';

interface NationalPreFlowProps {
  /** Contenido opcional para la sección "Elige el sorteo" (solo Nacional Jue/Sáb) */
  sorteoContent?: ReactNode;
  onConfirm: (delivery: DeliveryMode, method: NationalMethod) => void;
}

const SECTION_LABEL = 'text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 mb-2.5 px-0.5';

export function NationalPreFlow({ sorteoContent, onConfirm }: NationalPreFlowProps) {
  const [delivery, setDelivery] = useState<DeliveryMode>('custody');

  const stepBase = sorteoContent ? 1 : 0;

  return (
    <div className="space-y-3">
      {/* Sección 1: Elige el sorteo (solo para Nacional Jue/Sáb) */}
      {sorteoContent && (
        <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm">
          <p className={SECTION_LABEL}>1. Elige el sorteo</p>
          {sorteoContent}
        </div>
      )}

      {/* Sección: Entrega */}
      <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm">
        <p className={SECTION_LABEL}>{stepBase + 1}. ¿Cómo quieres recibir tus décimos?</p>
        <NationalDeliverySelector selectedMode={delivery} onChange={setDelivery} />
      </div>

      {/* Sección: Método */}
      <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm">
        <p className={SECTION_LABEL}>{stepBase + 2}. ¿Cómo quieres obtener tus números?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onConfirm(delivery, 'aleatorio')}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 py-4',
              'text-[10px] font-black uppercase tracking-wider text-slate-500',
              'transition-all active:scale-[0.97] hover:border-amber-200 hover:bg-amber-50/60'
            )}
          >
            <Spark className="h-5 w-5 text-manises-gold" />
            <span>Aleatorio</span>
          </button>

          <button
            type="button"
            onClick={() => onConfirm(delivery, 'elegir')}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 py-4',
              'text-[10px] font-black uppercase tracking-wider',
              'border-manises-blue bg-manises-blue text-white shadow-sm',
              'transition-all active:scale-[0.97]'
            )}
          >
            <EditPencil className="h-5 w-5 text-white" />
            <span>Elegir número</span>
          </button>
        </div>
      </div>
    </div>
  );
}
