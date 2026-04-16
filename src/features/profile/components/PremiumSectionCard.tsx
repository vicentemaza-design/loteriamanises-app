import type { Key, ReactNode } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/utils';

type PremiumTone = 'default' | 'gold' | 'blue' | 'rose' | 'emerald' | 'violet';

interface PremiumSectionCardProps {
  key?: Key;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  tone?: PremiumTone;
}

const toneAccents: Record<PremiumTone, string> = {
  default: 'border-l-manises-blue/20',
  gold: 'border-l-manises-gold',
  blue: 'border-l-sky-500',
  rose: 'border-l-rose-500',
  emerald: 'border-l-emerald-500',
  violet: 'border-l-violet-500',
};

export function PremiumSectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
  tone = 'default',
}: PremiumSectionCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm surface-neo-soft',
        'border-l-4',
        toneAccents[tone],
        className
      )}
    >
      <CardContent className="p-5">
        <div className="mb-4 space-y-1">
          {eyebrow && (
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
              {eyebrow}
            </p>
          )}
          <h2 className="text-[0.95rem] font-black tracking-tight text-manises-blue leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] font-medium leading-relaxed text-muted-foreground pt-0.5">
              {description}
            </p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
