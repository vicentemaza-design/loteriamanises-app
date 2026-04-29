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
      className="rounded-[2rem] border border-manises-blue/10 bg-white p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selección actual</p>
          <h3 className="text-xl font-black text-manises-blue mt-1">
            {selectedQuantity} {selectedQuantity === 1 ? 'décimo' : 'décimos'}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</p>
          <p className="text-2xl font-black text-manises-blue mt-1">
            {formatCurrency(decimoPrice * selectedQuantity)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl">
        <div className="ml-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ajustar cantidad</span>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Máximo demo: {maxQuantity} {maxQuantity === 1 ? 'décimo' : 'décimos'} para el número {selectedNumber}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm"
            onClick={() => onQuantityChange(Math.max(1, selectedQuantity - 1))}
            disabled={selectedQuantity <= 1}
            aria-label="Restar un décimo"
          >
            -
          </Button>
          <span className="w-6 text-center font-black text-lg text-manises-blue">{selectedQuantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm"
            onClick={() => onQuantityChange(Math.min(maxQuantity, selectedQuantity + 1))}
            disabled={selectedQuantity >= maxQuantity}
            aria-label="Sumar un décimo"
          >
            +
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-[11px] font-semibold text-emerald-800 leading-snug">
          Si este número simulado resultara premiado con el <span className="font-black">Gordo</span>, el cálculo orientativo sería{' '}
          <span className="font-black">{formatCurrency(potentialFirstPrize)}</span>.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="flex-1 rounded-2xl text-manises-blue font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50"
          onClick={onReserve}
        >
          Reservar número demo
        </Button>
        <Button
          className="flex-1 rounded-2xl bg-manises-blue text-white font-bold shadow-lg"
          onClick={onAddToCart}
        >
          Añadir a cesta demo
        </Button>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[8px] font-medium text-slate-400">
          La reserva no es compra automática · Requiere confirmación manual · Demo · reserva pendiente de integración
        </p>
      </div>
    </motion.section>
  );
}
