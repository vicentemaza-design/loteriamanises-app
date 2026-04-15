import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PremiumActionRowProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PremiumActionRow({
  icon: Icon,
  title,
  description,
  trailing,
  onClick,
  className,
}: PremiumActionRowProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-white/65 bg-white/60 px-4 py-3.5 shadow-[0_8px_24px_rgba(10,25,47,0.06)] backdrop-blur-md transition-all',
        onClick ? 'cursor-pointer hover:border-manises-blue/20 hover:bg-white/75' : '',
        className
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-manises-blue/6 text-manises-blue">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-manises-blue">{title}</p>
        {description && (
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {trailing ?? (onClick ? <ChevronRight className="h-4 w-4 shrink-0 text-manises-blue/35" /> : null)}
    </div>
  );

  if (!onClick) return content;

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}
