// Final iOS PWA Layout Stabilization - Background Engine v1.0.4
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
    /* 
       CORRECCIÓN DEFINITIVA DE CLIPPING:
       Inyectamos la imagen directamente en el background del contenedor raíz.
       Esto evita que iOS renderice la imagen y el fondo en capas separadas 
       con alturas distintas durante el cold-boot de la PWA.
    */
    <div
      className="relative min-h-screen w-full overflow-hidden text-white bg-[#052a5a]"
      style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(5,42,90,0.72) 0%, rgba(10,71,146,0.78) 45%, rgba(5,42,90,0.88) 100%),
          url(${backgroundImageSrc})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Luces sutiles estáticas para profundidad */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />

      {/* Flujo natural de documento (arquitectura estable previa a f5819a3,
          ver c5c53b4): exterior e interior en min-h-screen, sin scroll
          interno propio. El intento de "scroll interno + body fijo" (h-dvh
          + overflow-y-auto aquí, body position:fixed en index.css) generó
          una franja de fondo residual en iOS Safari real que persistía
          incluso igualando las unidades de exterior/interior — la propia
          combinación "body fijo + scroll anidado" es la que fallaba, no
          solo el mismatch vh/dvh. body vuelve a ser scrolleable de forma
          nativa SOLO en rutas públicas (html.auth-route, ver index.css);
          el fix de teclado de App.tsx no depende de body:fixed y sigue
          intacto. Privadas mantienen su body:fixed sin cambios. */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
        <div
          className={cn(
            'flex flex-1 flex-col items-center pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
