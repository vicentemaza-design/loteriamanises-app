import type { ReactNode } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/utils';

interface PremiumSectionCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PremiumSectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
}: PremiumSectionCardProps) {
  return (
    <Card className={cn('rounded-2xl border-white/70', className)}>
      <CardContent className="p-5">
        <div className="mb-4 space-y-1">
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-manises-blue/45">
              {eyebrow}
            </p>
          )}
          <h3 className="text-base font-black tracking-tight text-manises-blue">{title}</h3>
          {description && (
            <p className="text-[12px] font-medium leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
