import type { Key, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type ActionTone = 'default' | 'gold' | 'blue' | 'rose' | 'emerald' | 'violet';

interface PremiumActionRowProps {
  key?: Key;
  icon: LucideIcon;
  title: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
  tone?: ActionTone;
  badge?: string;
}

const toneMap: Record<ActionTone, { bg: string; text: string }> = {
  default: { bg: 'bg-gray-100', text: 'text-gray-600' },
  gold: { bg: 'bg-amber-50', text: 'text-amber-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  violet: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
};

export function PremiumActionRow({
  icon: Icon,
  title,
  description,
  trailing,
  onClick,
  className,
  tone = 'default',
  badge,
}: PremiumActionRowProps) {
  const palette = toneMap[tone];
  const content = (
    <div
      className={cn(
        'group relative flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all border border-transparent',
        onClick ? 'hover:bg-muted/50 active:bg-muted cursor-pointer' : '',
        className
      )}
    >
      <div className={cn('p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 shadow-sm', palette.bg, palette.text)}>
        <Icon className="w-4.5 h-4.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-manises-blue truncate leading-tight">{title}</p>
          {badge && (
            <span className="bg-manises-blue/5 text-manises-blue/40 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-manises-blue/5">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>

      {trailing ?? (onClick ? <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-manises-blue transition-colors shrink-0" /> : null)}
    </div>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}
