import { useState } from 'react';
import { Minus, Plus, NavArrowLeft } from 'iconoir-react/regular';
import { cn, formatCurrency } from '@/shared/lib/utils';

interface NationalAleatorioFlowProps {
  unitPrice: number;
  drawLabel: string;
  onConfirm: (sameCount: number, distinctCount: number) => void;
  onBack: () => void;
}

function Stepper({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.1em] text-manises-blue">{label}</p>
      <p className="mt-0.5 text-[10px] font-medium text-slate-400">{sublabel}</p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all active:scale-[0.95]',
            value <= min
              ? 'border-slate-100 text-slate-200'
              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="min-w-[2.5rem] text-center text-[28px] font-black text-manises-blue tabular-nums">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all active:scale-[0.95]',
            value >= max
              ? 'border-slate-100 text-slate-200'
              : 'border-manises-blue bg-manises-blue text-white hover:bg-manises-blue/90'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NationalAleatorioFlow({
  unitPrice,
  drawLabel,
  onConfirm,
  onBack,
}: NationalAleatorioFlowProps) {
  const [sameCount, setSameCount] = useState(1);
  const [distinctCount, setDistinctCount] = useState(1);

  const total = sameCount + distinctCount;
  const totalPrice = total * unitPrice;
  const canConfirm = total > 0;

  return (
    <div className="flex flex-col gap-3 pb-[100px]">
      {/* Header info */}
      <div className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Sorteo</p>
        <p className="mt-0.5 text-[13px] font-black text-manises-blue">{drawLabel}</p>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">¿Cuántos décimos quieres?</p>
      </div>

      <Stepper
        label="Décimos del mismo número"
        sublabel="Varias copias del mismo número de décimo"
        value={sameCount}
        min={0}
        max={10}
        onChange={setSameCount}
      />

      <Stepper
        label="Décimos de distintos números"
        sublabel="Números diferentes, un décimo de cada"
        value={distinctCount}
        min={0}
        max={10}
        onChange={setDistinctCount}
      />

      {/* Volver */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 px-1 pt-1 text-[10px] font-semibold text-slate-400 transition-colors hover:text-slate-600"
      >
        <NavArrowLeft className="h-3 w-3" />
        Cambiar opciones
      </button>

      {/* Bottom CTA */}
      <div className="fixed bottom-[var(--nav-height)] left-0 right-0 z-10 mx-auto max-w-screen-sm px-4 pb-4 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent">
        <button
          type="button"
          onClick={() => canConfirm && onConfirm(sameCount, distinctCount)}
          disabled={!canConfirm}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-[0.98]',
            canConfirm
              ? 'bg-manises-blue text-white shadow-md'
              : 'bg-slate-100 text-slate-300'
          )}
        >
          <div className="text-left">
            <p className="text-[11px] font-semibold opacity-70">{total} décimo{total !== 1 ? 's' : ''}</p>
            <p className="text-[15px] font-black">{formatCurrency(totalPrice)}</p>
          </div>
          <span className="text-[13px] font-black uppercase tracking-wider">Continuar →</span>
        </button>
      </div>
    </div>
  );
}
