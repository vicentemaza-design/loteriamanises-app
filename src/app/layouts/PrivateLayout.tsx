import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Header } from '@/shared/layout/Header';
import { BottomNav } from '@/shared/layout/BottomNav';
import { AppLock } from '@/app/components/AppLock';
import { PlaySessionProvider } from '@/features/session/context/PlaySessionProvider';
import { GamesCartPanel } from '@/features/session/components/GamesCartPanel';
import { LotteryCartPanel } from '@/features/session/components/LotteryCartPanel';
import { getSecurityPreferences, isReauthRequiredForLaunch } from '@/features/profile/lib/security';

const HIDE_BOTTOM_NAV_PATTERNS = ['/play/'];

export function PrivateLayout() {
  const location = useLocation();
  const [isLocked, setIsLocked] = React.useState(() => {
    return isReauthRequiredForLaunch(getSecurityPreferences());
  });

  const hideNav = HIDE_BOTTOM_NAV_PATTERNS.some(p =>
    location.pathname.startsWith(p)
  );

  const mainRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
  }, [location.pathname]);

  return (
    <PlaySessionProvider>
      {/* h-app (height: var(--app-height)) en vez de h-dvh: --app-height lo
          recalcula App.tsx en vivo a partir de visualViewport.height, la
          señal más fiable de la altura real disponible en iOS — la unidad
          CSS 100dvh puede quedarse momentáneamente corta cuando la barra de
          Safari colapsa/expande, dejando ver el fondo de html/body (casi
          blanco) por debajo de la bottom nav hasta que el propio dvh se
          repinta. min-height:-webkit-fill-available (.app-shell) se
          mantiene como segunda red de seguridad. */}
      <div className="app-shell h-app font-sans text-manises-blue flex flex-col overflow-hidden">
        <AnimatePresence>
          {isLocked && (
            <AppLock onUnlock={() => setIsLocked(false)} />
          )}
        </AnimatePresence>

        {!isLocked && (
          <>
            {!hideNav && <Header />}

            <main
              ref={mainRef}
              className={`min-h-0 flex-1 w-full relative overflow-y-auto overflow-x-hidden scrollbar-hide ${
                hideNav ? 'pt-0 pb-0' : 'pb-nav-safe'
              }`}
              style={!hideNav ? { paddingTop: 'var(--header-height)' } : undefined}
            >
              <div className="absolute inset-x-0 top-0 h-96 section-wash pointer-events-none opacity-40" />
              <div key={location.pathname} className="relative w-full min-h-full">
                <Outlet />
              </div>
            </main>

            {!hideNav && <BottomNav />}

            {/* Paneles de cesta (flotan sobre todo el layout) */}
            <GamesCartPanel />
            <LotteryCartPanel />
          </>
        )}
      </div>
    </PlaySessionProvider>
  );
}
