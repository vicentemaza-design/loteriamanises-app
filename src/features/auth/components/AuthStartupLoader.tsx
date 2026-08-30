import { useReducedMotion } from 'motion/react';
import { cn } from '@/shared/lib/utils';

/** Overlay de arranque puramente presentacional (sin lógica de negocio):
 *  fondo azul corporativo + logo + anillo de carga discreto. Lo muestra
 *  AuthScreenShell mientras prepara su imagen de fondo. */
export function AuthStartupLoader() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-[#0A4792]">
      <img
        src="/assets/branding/logo-white.png"
        alt="Lotería Manises"
        className="h-14 w-auto max-w-[200px]"
      />
      <svg
        className={cn('h-7 w-7 text-[#F5C518]', !reduceMotion && 'animate-spin')}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
