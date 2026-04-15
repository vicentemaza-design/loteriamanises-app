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

  return (
    <div className="app-shell h-app min-h-app min-h-0 font-sans text-manises-blue flex flex-col overflow-hidden">
      <AnimatePresence>
        {isLocked && (
          <AppLock onUnlock={() => setIsLocked(false)} />
        )}
      </AnimatePresence>

      {!isLocked && (
        <>
          {!hideNav && <Header />}
          <main
            className={`min-h-0 flex-1 w-full relative overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide ${
              hideNav ? 'pb-0' : 'pb-nav-safe'
            }`}
          >
            <div className="absolute inset-0 section-wash pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.62)_0,_rgba(255,255,255,0)_70%)] pointer-events-none" />
            <div className="relative w-full min-h-full">
              <Outlet />
            </div>
          </main>
          {!hideNav && <BottomNav />}
        </>
      )}
    </div>
  );
}
