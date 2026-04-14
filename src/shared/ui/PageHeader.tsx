import type { ReactNode } from 'react';
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Cabecera de página consistente con título, descripción opcional y acciones.
 */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1 mb-6 px-1', className)}
        {...props}
      >
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-manises-blue tracking-tight">
            {title}
          </h1>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground font-medium max-w-[90%]">
            {description}
          </p>
        )}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
