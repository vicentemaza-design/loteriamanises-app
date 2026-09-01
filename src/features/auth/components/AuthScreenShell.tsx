// Final iOS PWA Layout Stabilization - Background Engine v1.0.4
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import authBackground from '@/assets/images/group-people-celebrating-financial-success-with-joyful-faces-dreamy-background-clear-h.jpg';

const STARTUP_FALLBACK_TIMEOUT_MS = 2100;
const MIN_BRAND_VISIBLE_MS = 2200;
const FIRST_PAINT_HANDOFF_MS = 780;

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

  // Keep the branded startup state long enough for the native-black -> blue
  // continuity, isotipo entry and liquid fill to read as one deliberate motion.
  // Real background readiness still wins over the minimum when it is slower.
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

  // Dissolve the startup surface over the Login that is already rendered
  // underneath. This keeps the handoff as a crossfade rather than a swap.
  useEffect(() => {
    if (!isReady) return;

    const firstPaint = document.getElementById('auth-first-paint');
    if (!firstPaint) return;

    let removeTimer: number | undefined;
    firstPaint.classList.add('is-handing-off');
    removeTimer = window.setTimeout(() => firstPaint.remove(), FIRST_PAINT_HANDOFF_MS);

    return () => {
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, [isReady]);

  return (
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />

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
