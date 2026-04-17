// Final iOS PWA Layout Stabilization - Isolation Test v1.0.2
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import authBackground from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';

interface AuthScreenShellProps {
  children: ReactNode;
  contentClassName?: string;
  backgroundImageSrc?: string;
}

export function AuthScreenShell({
  children,
  contentClassName,
}: AuthScreenShellProps) {
  return (
    // TEST DE AISLAMIENTO: Volvemos a la estructura técnica de persecución de viewport
    // pero eliminando toda la carga decorativa y animada.
    <div className="relative h-[var(--app-vh)] min-h-[var(--app-vh)] w-full overflow-hidden bg-[#060d1a] text-white">
      {/* Sin imagen, sin motion, sin gradientes. Solo fondo sólido. */}
      
      <div className="relative z-10 h-[var(--app-vh)] min-h-[var(--app-vh)] w-full overflow-y-auto overflow-x-hidden">
        <div
          className={cn(
            'flex min-h-full flex-col items-center justify-start px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
