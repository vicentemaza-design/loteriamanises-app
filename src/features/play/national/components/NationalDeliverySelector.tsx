import { Lock } from 'lucide-react';
import { Smartphone, Truck } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type DeliveryMode = 'custody' | 'shipping';

interface NationalDeliverySelectorProps {
  selectedMode: DeliveryMode;
  shippingAvailable?: boolean;
  onChange: (mode: DeliveryMode) => void;
  onShippingUnavailableClick?: () => void;
}

export function NationalDeliverySelector({
  selectedMode,
  shippingAvailable = true,
  onChange,
  onShippingUnavailableClick,
}: NationalDeliverySelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="px-1">
        <h3 className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Tipo de décimo / Entrega</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('custody')}
          className={cn(
            'flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all',
            selectedMode === 'custody'
              ? 'border-manises-blue bg-manises-blue text-white shadow-manises'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
          )}
        >
          <Smartphone className={cn('h-5 w-5', selectedMode === 'custody' ? 'text-white' : 'text-manises-blue')} />
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider">Digital</p>
            <p className={cn('text-[9px] font-medium opacity-70', selectedMode === 'custody' ? 'text-white' : 'text-slate-400')}>
              Custodia sin envío
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!shippingAvailable) {
              onShippingUnavailableClick?.();
            } else {
              onChange('shipping');
            }
          }}
          className={cn(
            'relative flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all',
            !shippingAvailable
              ? 'border-slate-100 bg-slate-50 text-slate-400'
              : selectedMode === 'shipping'
              ? 'border-manises-blue bg-manises-blue text-white shadow-manises'
              : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
          )}
        >
          {!shippingAvailable && (
            <Lock className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-300" />
          )}
          <Truck className={cn(
            'h-5 w-5',
            !shippingAvailable ? 'text-slate-300' : selectedMode === 'shipping' ? 'text-white' : 'text-manises-blue'
          )} />
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider">Mensajería</p>
            <p className={cn(
              'text-[9px] font-medium opacity-70',
              !shippingAvailable ? 'text-slate-400' : selectedMode === 'shipping' ? 'text-white' : 'text-slate-400'
            )}>
              {shippingAvailable ? 'Envío a tu casa' : 'No disponible'}
            </p>
          </div>
        </button>
      </div>

      <p className="px-1 text-[9px] font-medium text-slate-400">Servicio simulado en esta demo.</p>
    </div>
  );
}
