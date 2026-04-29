import { motion } from 'motion/react';
import { Trophy } from 'iconoir-react/regular';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';

interface NationalTicketQuantitySelectorProps {
  selectedNumber: string;
  selectedQuantity: number;
  maxQuantity: number;
  decimoPrice: number;
  firstPrize: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onReserve: () => void;
}

/**
 * Panel de configuración de cantidad y resumen de premio (Fase 2B.3B).
 * Extraído de NationalAdvancedFlow.
 */
export function NationalTicketQuantitySelector({
  selectedNumber,
  selectedQuantity,
  maxQuantity,
  decimoPrice,
  firstPrize,
  onQuantityChange,
  onAddToCart,
  onReserve,
}: NationalTicketQuantitySelectorProps) {
  const potentialFirstPrize = firstPrize * selectedQuantity;

  return (
    <motion.section
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-[1.65rem] border border-manises-blue/10 bg-white p-4 shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selección actual</p>
          <h3 className="mt-1 text-lg font-black text-manises-blue">
            {selectedQuantity} {selectedQuantity === 1 ? 'décimo' : 'décimos'}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</p>
          <p className="mt-1 text-xl font-black text-manises-blue">
            {formatCurrency(decimoPrice * selectedQuantity)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5">
        <div className="ml-1.5 pr-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ajustar cantidad</span>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Máximo demo: {maxQuantity} {maxQuantity === 1 ? 'décimo' : 'décimos'} para el número {selectedNumber}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white shadow-sm"
            onClick={() => onQuantityChange(Math.max(1, selectedQuantity - 1))}
            disabled={selectedQuantity <= 1}
            aria-label="Restar un décimo"
          >
            -
          </Button>
          <span className="w-5 text-center text-base font-black text-manises-blue">{selectedQuantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white shadow-sm"
            onClick={() => onQuantityChange(Math.min(maxQuantity, selectedQuantity + 1))}
            disabled={selectedQuantity >= maxQuantity}
            aria-label="Sumar un décimo"
          >
            +
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <Trophy className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
        <p className="text-[11px] font-semibold text-emerald-800 leading-snug">
          Si este número simulado resultara premiado con el <span className="font-black">Gordo</span>, el cálculo orientativo sería{' '}
          <span className="font-black">{formatCurrency(potentialFirstPrize)}</span>.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-manises-blue hover:bg-slate-50"
          onClick={onReserve}
        >
          Reservar número demo
        </Button>
        <Button
          className="flex-1 rounded-2xl bg-manises-blue text-[10px] font-bold text-white shadow-lg"
          onClick={onAddToCart}
        >
          Añadir a cesta demo
        </Button>
      </div>

      <div className="mt-2.5 text-center">
        <p className="text-[8px] font-medium text-slate-400">
          La reserva no es compra automática · Requiere confirmación manual · Demo · reserva pendiente de integración
        </p>
      </div>
    </motion.section>
  );
}
