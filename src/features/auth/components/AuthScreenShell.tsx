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
      className="relative h-dvh w-full overflow-hidden text-white bg-[#052a5a]"
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
      
      {/* Contenedor de layout estándar — scroll interno propio (h-dvh +
          overflow-y-auto), igual que <main> en PrivateLayout: <body> ahora
          es position:fixed/overflow:hidden (fix de teclado/viewport), así
          que ya no puede desplazarse para revelar contenido más alto que la
          pantalla (p. ej. el paso 2 del registro). El fondo sigue fijo en
          el div exterior (overflow-hidden), solo este contenedor scrollea.
          Exterior e interior usan la MISMA unidad (h-dvh, no min-h-screen):
          un exterior en 100vh (viewport grande/estático) y un interior en
          100dvh (viewport dinámico/pequeño) dejaban una franja del fondo
          del exterior visible bajo el contenido en iOS Safari real cuando
          la barra de direcciones está expandida — invisible en emuladores
          de escritorio (WebKit incluido) porque ahí 100vh === 100dvh al no
          existir una barra de navegador dinámica que colapsar. */}
      <div className="relative z-10 mx-auto flex h-dvh w-full max-w-md flex-col overflow-y-auto px-6 py-10">
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
