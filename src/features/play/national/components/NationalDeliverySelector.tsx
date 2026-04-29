import { Smartphone, Truck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type DeliveryMode = 'custody' | 'shipping';

interface NationalDeliverySelectorProps {
  selectedMode: DeliveryMode;
  onChange: (mode: DeliveryMode) => void;
}

export function NationalDeliverySelector({ selectedMode, onChange }: NationalDeliverySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Tipo de décimo / Entrega</h3>
        <span className="text-[8px] font-black text-manises-gold uppercase tracking-widest bg-manises-gold/10 px-2 py-0.5 rounded-full">
          Demo · pendiente de integración
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('custody')}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-all',
            selectedMode === 'custody'
              ? 'border-manises-blue bg-manises-blue text-white shadow-manises'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
          )}
        >
          <Smartphone className={cn('h-5 w-5', selectedMode === 'custody' ? 'text-white' : 'text-manises-blue')} />
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-wider">Custodia / Digital</p>
            <p className={cn('text-[9px] font-medium opacity-70', selectedMode === 'custody' ? 'text-white' : 'text-slate-400')}>
              Sin envío · custodia demo
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('shipping')}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-all',
            selectedMode === 'shipping'
              ? 'border-manises-blue bg-manises-blue text-white shadow-manises'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
          )}
        >
          <Truck className={cn('h-5 w-5', selectedMode === 'shipping' ? 'text-white' : 'text-manises-blue')} />
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-wider">Mensajería</p>
            <p className={cn('text-[9px] font-medium opacity-70', selectedMode === 'shipping' ? 'text-white' : 'text-slate-400')}>
              Vista previa envío
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
