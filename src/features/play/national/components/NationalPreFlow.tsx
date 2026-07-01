import { useState } from 'react';
import type { ReactNode } from 'react';
import { Spark, EditPencil, Check } from 'iconoir-react/regular';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { NationalDeliverySelector, type DeliveryMode } from './NationalDeliverySelector';

export type NationalMethod = 'aleatorio' | 'elegir';

interface NationalPreFlowProps {
  /** Chips de fecha (solo Nacional Jue/Sáb) — se muestra como sección "1. Elige el sorteo" */
  sorteoContent?: ReactNode;
  /** Info fija del sorteo (Navidad/Niño) — pill informativo en cabecera */
  fixedSorteoLabel?: string;
  /** Balance del usuario para la barra inferior */
  availableBalance: number;
  onConfirm: (delivery: DeliveryMode, method: NationalMethod) => void;
}

const SECTION_LBL = 'mb-2.5 px-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400';

export function NationalPreFlow({
  sorteoContent,
  fixedSorteoLabel,
  availableBalance,
  onConfirm,
}: NationalPreFlowProps) {
  const [delivery, setDelivery] = useState<DeliveryMode>('custody');
  const [method, setMethod] = useState<NationalMethod>('aleatorio');

  const stepOffset = sorteoContent ? 1 : 0;

  const { euros, cents } = splitCurrency(availableBalance);

  return (
    <div className="flex flex-col gap-3 pb-[96px]">
      {/* Pill informativo de sorteo fijo (Navidad/Niño) */}
      {fixedSorteoLabel && (
        <div className="flex items-center gap-2 rounded-xl border border-manises-blue/15 bg-manises-blue/5 px-3.5 py-2.5">
          <span className="text-[11px] font-black text-manises-blue">{fixedSorteoLabel}</span>
        </div>
      )}

      {/* Sección 1: Elige el sorteo (solo Nacional Jue/Sáb) */}
      {sorteoContent && (
        <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm">
          <p className={SECTION_LBL}>1. Elige el sorteo</p>
          {sorteoContent}
        </div>
      )}

      {/* Sección: Forma de entrega */}
      <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm">
        <p className={SECTION_LBL}>{stepOffset + 1}. Forma de entrega</p>
        <NationalDeliverySelector selectedMode={delivery} onChange={setDelivery} />
      </div>

      {/* Sección: ¿Cómo quieres elegir? */}
      <div className="rounded-[1.2rem] border border-slate-100 bg-white px-3.5 py-3.5 shadow-sm">
        <p className={SECTION_LBL}>{stepOffset + 2}. ¿Cómo quieres elegir tus números?</p>
        <div className="grid grid-cols-2 gap-2">
          <MethodButton
            icon={<Spark className="h-4.5 w-4.5" />}
            label="Aleatorio"
            selected={method === 'aleatorio'}
            onSelect={() => setMethod('aleatorio')}
          />
          <MethodButton
            icon={<EditPencil className="h-4.5 w-4.5" />}
            label="Elegir número"
            selected={method === 'elegir'}
            onSelect={() => setMethod('elegir')}
          />
        </div>
      </div>

      {/* Barra inferior fija */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      >
        <div
          className="bg-[#0a4792]/88 mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Saldo */}
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className="relative text-[1.05rem] font-black leading-none text-manises-gold">
              {euros}<sup className="ml-0.5 align-super text-[0.5rem] font-black">,{cents}</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">
              Saldo €
            </p>
          </div>

          {/* Importe */}
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className="relative text-[1.05rem] font-black leading-none text-white">
              0<sup className="ml-0.5 align-super text-[0.5rem] font-black">,00</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">
              Importe €
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => onConfirm(delivery, method)}
            className="relative m-1.5 flex h-auto min-w-0 items-center justify-center overflow-hidden rounded-xl bg-manises-gold px-4 text-[1rem] font-black leading-none text-manises-blue shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14)] transition-all active:scale-[0.985]"
          >
            <span className="absolute inset-x-4 top-0 h-px bg-white/45" />
            <span className="relative">Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MethodButton ──────────────────────────────────────────────────────────────

function MethodButton({
  icon, label, selected, onSelect,
}: {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex items-center gap-2 rounded-xl border-2 px-3 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]',
        selected
          ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
      )}
    >
      <span className={selected ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span className="flex-1 text-left leading-tight">{label}</span>
      {selected ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
      )}
    </button>
  );
}

function splitCurrency(amount: number) {
  const [euros = '0', cents = '00'] = amount
    .toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(',');
  return { euros, cents };
}
