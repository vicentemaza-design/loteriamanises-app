import type { ReactNode } from 'react';
import { Lock, Smartphone, Truck, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type DeliveryMode = 'custody' | 'shipping';

interface NationalDeliverySelectorProps {
  selectedMode: DeliveryMode | null;
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
    <div className="grid grid-cols-2 gap-2">
      <DeliveryCard
        icon={<Smartphone className="h-4.5 w-4.5" />}
        label="Digital"
        sublabel="Custodia sin envío"
        selected={selectedMode === 'custody'}
        onSelect={() => onChange('custody')}
      />
      <DeliveryCard
        icon={<Truck className="h-4.5 w-4.5" />}
        label="Mensajería"
        sublabel={shippingAvailable ? 'Envío a tu casa' : 'No disponible'}
        selected={selectedMode === 'shipping'}
        disabled={!shippingAvailable}
        lockIcon={!shippingAvailable}
        onSelect={() => {
          if (!shippingAvailable) {
            onShippingUnavailableClick?.();
          } else {
            onChange('shipping');
          }
        }}
      />
    </div>
  );
}

function DeliveryCard({
  icon, label, sublabel, selected, disabled, lockIcon, onSelect,
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  selected: boolean;
  disabled?: boolean;
  lockIcon?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex items-center gap-2 rounded-xl border-2 px-3 py-3.5 transition-all active:scale-[0.97]',
        selected
          ? 'border-manises-blue bg-manises-blue text-white shadow-sm'
          : disabled
          ? 'border-slate-200 bg-slate-50 opacity-50'
          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
      )}
    >
      <span className={cn('shrink-0', selected ? 'text-white' : 'text-slate-400')}>{icon}</span>
      <div className="flex-1 min-w-0 text-left">
        <p className={cn('text-[10px] font-black uppercase tracking-wider leading-none', selected ? 'text-white' : 'text-slate-600')}>
          {label}
        </p>
        <p className={cn('mt-0.5 text-[8px] font-medium leading-none', selected ? 'text-white/60' : 'text-slate-400')}>
          {sublabel}
        </p>
      </div>
      {lockIcon ? (
        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      ) : selected ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
      )}
    </button>
  );
}
