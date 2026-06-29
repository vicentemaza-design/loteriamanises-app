import { Lock, Smartphone, Truck } from 'lucide-react';
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
    <div className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange('custody')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 transition-all active:scale-[0.98]',
          selectedMode === 'custody' ? 'bg-manises-blue shadow-sm' : 'hover:bg-white/60'
        )}
      >
        <Smartphone
          className={cn('h-3.5 w-3.5 shrink-0', selectedMode === 'custody' ? 'text-white' : 'text-manises-blue/60')}
        />
        <div className="text-left">
          <p className={cn('text-[10px] font-black uppercase tracking-wider leading-none', selectedMode === 'custody' ? 'text-white' : 'text-slate-500')}>
            Digital
          </p>
          <p className={cn('mt-0.5 text-[8px] font-medium leading-none', selectedMode === 'custody' ? 'text-white/60' : 'text-slate-400')}>
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
          'relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2 transition-all active:scale-[0.98]',
          !shippingAvailable
            ? 'opacity-40'
            : selectedMode === 'shipping'
            ? 'bg-manises-blue shadow-sm'
            : 'hover:bg-white/60'
        )}
      >
        {!shippingAvailable && (
          <Lock className="absolute right-2 top-1.5 h-2.5 w-2.5 text-slate-400" />
        )}
        <Truck
          className={cn('h-3.5 w-3.5 shrink-0', selectedMode === 'shipping' ? 'text-white' : 'text-manises-blue/60')}
        />
        <div className="text-left">
          <p className={cn('text-[10px] font-black uppercase tracking-wider leading-none', selectedMode === 'shipping' ? 'text-white' : 'text-slate-500')}>
            Mensajería
          </p>
          <p className={cn('mt-0.5 text-[8px] font-medium leading-none', selectedMode === 'shipping' ? 'text-white/60' : 'text-slate-400')}>
            {shippingAvailable ? 'Envío a tu casa' : 'No disponible'}
          </p>
        </div>
      </button>
    </div>
  );
}
