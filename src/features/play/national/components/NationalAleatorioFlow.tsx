import { useState } from 'react';
import { Minus, Plus, Spark, Cart } from 'iconoir-react/regular';
import { cn, formatCurrency } from '@/shared/lib/utils';
import { NationalContextBar } from './NationalContextBar';
import type { DeliveryMode } from './NationalDeliverySelector';
import type { NationalMethod } from './NationalPreFlow';
import type { NationalShowcaseItem } from '../contracts/national-play.contract';

interface NationalAleatorioFlowProps {
  drawDate: string;
  drawLabel: string;
  delivery: DeliveryMode;
  method: NationalMethod;
  unitPrice: number;
  availableBalance: number;
  showcase: NationalShowcaseItem[];
  onEdit: () => void;
  onConfirm: (sameCount: number, distinctCount: number) => void;
}

function splitCurrency(amount: number) {
  const [euros = '0', cents = '00'] = amount
    .toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split(',');
  return { euros, cents };
}

function CounterRow({
  label,
  sublabel,
  value,
  unitPrice,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  unitPrice: number;
  onChange: (v: number) => void;
}) {
  const subtotal = value * unitPrice;
  return (
    <div className="rounded-[1.2rem] border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* Texto */}
        <div className="min-w-0">
          <p className="text-[12px] font-black text-manises-blue">{label}</p>
          <p className="mt-0.5 text-[9px] font-medium text-slate-400">{sublabel}</p>
        </div>
        {/* Precio */}
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-black text-manises-blue">{formatCurrency(subtotal)}</p>
          <p className="mt-0.5 text-[9px] font-medium text-slate-400">
            {value} {value === 1 ? 'décimo' : 'décimos'}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mt-3.5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all active:scale-95',
            value <= 0
              ? 'border-slate-100 text-slate-200'
              : 'border-manises-blue/30 bg-manises-blue/6 text-manises-blue hover:border-manises-blue/50 hover:bg-manises-blue/10'
          )}
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className={cn(
          'min-w-[3rem] rounded-xl px-3 py-1 text-center text-[1.75rem] font-black tabular-nums transition-colors',
          value > 0
            ? 'bg-manises-blue/6 text-manises-blue'
            : 'bg-slate-50 text-slate-300'
        )}>
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-manises-blue bg-manises-blue text-white transition-all active:scale-95 hover:bg-manises-blue/90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NationalAleatorioFlow({
  drawDate,
  drawLabel: _drawLabel,
  delivery,
  method,
  unitPrice,
  availableBalance,
  showcase: _showcase,
  onEdit,
  onConfirm,
}: NationalAleatorioFlowProps) {
  const [sameCount, setSameCount] = useState(1);
  const [distinctCount, setDistinctCount] = useState(0);

  const total = sameCount + distinctCount;
  const totalPrice = total * unitPrice;
  const canConfirm = total > 0;

  const balanceParts = splitCurrency(availableBalance);
  const totalParts = splitCurrency(totalPrice);

  return (
    <div className="flex flex-col gap-3 pb-[180px]">
      {/* Barra de contexto */}
      <NationalContextBar
        drawDate={drawDate}
        delivery={delivery}
        method={method}
        onEdit={onEdit}
      />

      {/* Título */}
      <div className="px-0.5">
        <h2 className="text-[15px] font-black uppercase tracking-[0.08em] text-manises-blue">
          ¿Cuántos décimos quieres?
        </h2>
      </div>

      {/* Steppers */}
      <CounterRow
        label="Décimos del mismo número"
        sublabel="Misma combinación de números"
        value={sameCount}
        unitPrice={unitPrice}
        onChange={setSameCount}
      />
      <CounterRow
        label="Décimos de distintos números"
        sublabel="Números diferentes, uno de cada"
        value={distinctCount}
        unitPrice={unitPrice}
        onChange={setDistinctCount}
      />

      {/* Info */}
      <div className="flex items-center gap-3 rounded-2xl border border-manises-blue/15 bg-manises-blue/8 px-4 py-3.5">
        <Spark className="h-5 w-5 shrink-0 text-manises-gold" />
        <p className="text-[13px] font-black leading-snug text-manises-blue">
          Asignaremos los números aleatoriamente
        </p>
      </div>

      {/* Barra inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div
          className="bg-[#0a4792]/88 mx-auto grid h-14 w-full max-w-screen-sm grid-cols-[1fr_1fr_2.15fr] text-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Saldo */}
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className="relative text-[1.05rem] font-black leading-none text-manises-gold">
              {balanceParts.euros}
              <sup className="ml-0.5 align-super text-[0.5rem] font-black">,{balanceParts.cents}</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">
              Saldo €
            </p>
          </div>

          {/* Importe */}
          <div className="relative flex min-w-0 flex-col items-center justify-center border-r border-white/12 px-1">
            <div className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-white/[0.035]" />
            <p className="relative text-[1.05rem] font-black leading-none text-white">
              {totalParts.euros}
              <sup className="ml-0.5 align-super text-[0.5rem] font-black">,{totalParts.cents}</sup>
            </p>
            <p className="relative mt-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none text-white/58">
              Importe €
            </p>
          </div>

          {/* CTA: carrito con badge */}
          <button
            type="button"
            onClick={() => canConfirm && onConfirm(sameCount, distinctCount)}
            disabled={!canConfirm}
            className={cn(
              'relative m-1.5 flex h-auto min-w-0 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-[0.9rem] font-black leading-none transition-all active:scale-[0.985]',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_6px_14px_rgba(0,0,0,0.14)]',
              canConfirm
                ? 'bg-manises-gold text-manises-blue'
                : 'cursor-not-allowed bg-white/10 text-white/45 shadow-none'
            )}
          >
            {canConfirm && <span className="absolute inset-x-4 top-0 h-px bg-white/45" />}
            <span className="relative flex items-center gap-1.5">
              <Cart className="h-4.5 w-4.5" />
              {canConfirm && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-manises-blue text-[9px] font-black text-white">
                  {total}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
