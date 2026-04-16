import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface PremiumMetricPillProps {
  label: string;
  value: string;
  tone?: 'default' | 'gold' | 'blue' | 'rose' | 'emerald' | 'violet';
  icon?: ReactNode;
}

const toneMap: Record<string, { label: string }> = {
  gold:    { label: 'text-amber-600' },
  blue:    { label: 'text-sky-600' },
  rose:    { label: 'text-rose-600' },
  emerald: { label: 'text-emerald-600' },
  violet:  { label: 'text-violet-600' },
  default: { label: 'text-manises-blue/60' },
};

export function PremiumMetricPill({
  label,
  value,
  tone = 'default',
  icon,
}: PremiumMetricPillProps) {
  const palette = toneMap[tone] ?? toneMap.default;
  return (
    <div
      className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-inner"
    >
      <div className="flex items-center gap-1.5 leading-none">
        {icon && <span className={cn('opacity-70', palette.label)}>{icon}</span>}
        <p className={cn('text-[9px] font-black uppercase tracking-[0.16em]', palette.label)}>
          {label}
        </p>
      </div>
      <p className="text-[0.85rem] font-black tracking-tight text-manises-blue mt-1">
        {value}
      </p>
    </div>
  );
}
