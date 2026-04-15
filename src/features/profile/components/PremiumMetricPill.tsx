import { cn } from '@/shared/lib/utils';

interface PremiumMetricPillProps {
  label: string;
  value: string;
  tone?: 'default' | 'gold' | 'blue';
}

export function PremiumMetricPill({
  label,
  value,
  tone = 'default',
}: PremiumMetricPillProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 backdrop-blur-md',
        tone === 'gold' && 'border-manises-gold/20 bg-manises-gold/10',
        tone === 'blue' && 'border-manises-blue/12 bg-manises-blue/6',
        tone === 'default' && 'border-white/70 bg-white/65'
      )}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-manises-blue/45">{label}</p>
      <p className="mt-1 text-sm font-black tracking-tight text-manises-blue">{value}</p>
    </div>
  );
}
