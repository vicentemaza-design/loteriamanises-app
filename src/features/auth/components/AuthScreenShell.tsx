// Final iOS PWA Layout Stabilization - Background Engine v1.0.4
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import authBackground from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';

const STARTUP_FALLBACK_TIMEOUT_MS = 1200;
const MIN_BRAND_VISIBLE_MS = 850;
const BRAND_ALIGN_MS = 180;
const FIRST_PAINT_HANDOFF_MS = 300;

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
  const mountTimeRef = useRef(Date.now());

  // Prepare the approved Auth background first. The branded first-paint layer
  // now has a short minimum presence so cached launches do not collapse into
  // a flash. This minimum starts at React mount; on a cold launch, a slower
  // real asset load remains the controlling condition instead of adding a
  // second artificial wait after the image is ready.
  useEffect(() => {
    let handled = false;
    let revealTimer: number | undefined;

    const reveal = () => setIsReady(true);

    const markReady = () => {
      if (handled) return;
      handled = true;

      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = MIN_BRAND_VISIBLE_MS - elapsed;
      if (remaining > 0) {
        revealTimer = window.setTimeout(reveal, remaining);
      } else {
        reveal();
      }
    };

    const img = new Image();
    img.onload = markReady;
    img.onerror = markReady;
    img.src = backgroundImageSrc;
    if (img.complete) markReady();

    const fallback = window.setTimeout(markReady, STARTUP_FALLBACK_TIMEOUT_MS);
    return () => {
      window.clearTimeout(fallback);
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      img.onload = null;
      img.onerror = null;
    };
  }, [backgroundImageSrc]);

  // Handoff rule: the pre-React logo must first align with the actual rendered
  // Auth logo, then the branded layer can fade. This removes the need to guess
  // a shared top offset across iOS launch/relaunch viewport states.
  useEffect(() => {
    if (!isReady) return;

    const firstPaint = document.getElementById('auth-first-paint');
    const firstBrand = firstPaint?.querySelector<HTMLElement>('.auth-first-brand');
    const firstLogo = firstPaint?.querySelector<HTMLImageElement>('img');
    const renderedLogo = document.querySelector<HTMLImageElement>(
      '#root img[src="/assets/branding/logo-white.png"]'
    );

    if (!firstPaint) return;

    let alignTimer: number | undefined;
    let removeTimer: number | undefined;

    const startFade = () => {
      firstPaint.classList.add('is-handing-off');
      removeTimer = window.setTimeout(() => firstPaint.remove(), FIRST_PAINT_HANDOFF_MS);
    };

    if (firstBrand && firstLogo && renderedLogo) {
      const firstRect = firstLogo.getBoundingClientRect();
      const targetRect = renderedLogo.getBoundingClientRect();
      const deltaX = targetRect.left - firstRect.left;
      const deltaY = targetRect.top - firstRect.top;

      firstBrand.style.transform = `translateX(calc(-50% + ${deltaX}px)) translateY(${deltaY}px)`;
      alignTimer = window.setTimeout(startFade, BRAND_ALIGN_MS);
    } else {
      startFade();
    }

    return () => {
      if (alignTimer !== undefined) window.clearTimeout(alignTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, [isReady]);

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
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
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
