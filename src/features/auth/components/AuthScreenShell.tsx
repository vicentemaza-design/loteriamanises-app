// Final iOS PWA Layout Stabilization - Static Identity v1.0.3
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
  backgroundImageSrc = authBackground,
}: AuthScreenShellProps) {
  return (
    // Conservamos la estructura técnica de persecución de viewport (--app-vh)
    <div className="relative h-[var(--app-vh)] min-h-[var(--app-vh)] w-full overflow-hidden bg-[#052a5a] text-white">
      
      {/* CAPA DE FONDO: Recuperada con la imagen pero 100% estática */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={backgroundImageSrc}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-35"
        />
        {/* Overlay oscuro estático para legibilidad */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,42,90,0.72)_0%,rgba(10,71,146,0.78)_45%,rgba(5,42,90,0.88)_100%)]" />
        {/* Luces sutiles estáticas para profundidad */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />
      </div>
      
      {/* CONTENIDOR DE SCROLL: Mantenemos la lógica de scroll interno para evitar glitches del viewport global */}
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
