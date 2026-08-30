// Final iOS PWA Layout Stabilization - Background Engine v1.0.4
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/shared/lib/utils';
import authBackground from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';
import { AuthStartupLoader } from './AuthStartupLoader';

const STARTUP_FALLBACK_TIMEOUT_MS = 700;

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
  const [isReady, setIsReady] = useState(false);
  const reduceMotion = useReducedMotion();

  // Precarga el fondo antes de revelar el contenido, para evitar que la
  // foto aparezca de golpe sobre un Login ya montado. Timeout de seguridad:
  // el Login nunca queda oculto indefinidamente aunque la imagen falle o
  // tarde más de lo esperado.
  useEffect(() => {
    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      setIsReady(true);
    };

    const img = new Image();
    img.onload = markReady;
    img.onerror = markReady;
    img.src = backgroundImageSrc;
    if (img.complete) markReady();

    const fallback = window.setTimeout(markReady, STARTUP_FALLBACK_TIMEOUT_MS);
    return () => {
      window.clearTimeout(fallback);
      img.onload = null;
      img.onerror = null;
    };
  }, [backgroundImageSrc]);

  return (
    /*
       CORRECCIÓN DEFINITIVA DE CLIPPING:
       Inyectamos la imagen directamente en el background del contenedor raíz.
       Esto evita que iOS renderice la imagen y el fondo en capas separadas
       con alturas distintas durante el cold-boot de la PWA.
    */
    <div
      className="relative min-h-dvh w-full overflow-hidden text-white bg-[#0A4792]"
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
      <motion.div
        className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10"
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        aria-hidden={!isReady}
        inert={!isReady}
        style={!isReady ? { pointerEvents: 'none' } : undefined}
      >
        <div
          className={cn(
            'flex flex-1 flex-col items-center pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]',
            contentClassName
          )}
        >
          {children}
        </div>
      </motion.div>

      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="auth-startup-loader"
            className="absolute inset-0 z-20"
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <AuthStartupLoader />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
