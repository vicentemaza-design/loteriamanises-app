import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Header } from '@/shared/layout/Header';
import { BottomNav } from '@/shared/layout/BottomNav';
import { AppLock } from '@/app/components/AppLock';

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

  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <div className="app-shell min-h-dvh font-sans text-manises-blue flex flex-col overflow-hidden">
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
            className={`min-h-0 flex-1 w-full relative overflow-y-auto overflow-x-hidden scrollbar-hide bg-background ${
              hideNav ? 'pt-0 pb-0' : 'pb-nav-safe'
            }`}
            style={!hideNav ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)' } : undefined}
          >
            <div className="absolute inset-0 section-wash pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.62)_0,_rgba(255,255,255,0)_70%)] pointer-events-none" />
            <div className="relative w-full min-h-full bg-background">
              <Outlet />
            </div>
          </main>
          {!hideNav && <BottomNav />}
        </>
      )}
    </div>
  );
}
