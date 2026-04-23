import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Header } from '@/shared/layout/Header';
import { BottomNav } from '@/shared/layout/BottomNav';
import { AppLock } from '@/app/components/AppLock';
import { PlaySessionProvider } from '@/features/session/context/PlaySessionProvider';
import { PlaySessionIndicator } from '@/features/session/components/PlaySessionIndicator';
import { PlaySessionTray } from '@/features/session/components/PlaySessionTray';

// Rutas donde se oculta el BottomNav (flujos de pantalla completa)
const HIDE_BOTTOM_NAV_PATTERNS = ['/play/'];

export function PrivateLayout() {
  const location = useLocation();
  const [isLocked, setIsLocked] = React.useState(() => {
    return localStorage.getItem('app_lock_enabled') === 'true';
  });

  const hideNav = HIDE_BOTTOM_NAV_PATTERNS.some(p =>
    location.pathname.startsWith(p)
  );

  // 1. Ref explícito para el contenedor scrollable
  const mainRef = React.useRef<HTMLElement | null>(null);

  // 2. Reset de scroll automático al cambiar de ruta - fase 1
  React.useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
  }, [location.pathname]);

  return (
    <PlaySessionProvider>
      <div className="app-shell h-dvh font-sans text-manises-blue flex flex-col overflow-hidden">
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

            {!hideNav && (
              <>
                <PlaySessionIndicator variant="fab" />
                <BottomNav />
              </>
            )}
            <PlaySessionTray />
          </>
        )}
      </div>
    </PlaySessionProvider>
  );
}
