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

  React.useEffect(() => {
    const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!viewportMeta) return;

    const content = viewportMeta.content
      .replace(/,?\s*viewport-fit=(?:cover|contain|auto)/, '');
    viewportMeta.setAttribute('content', content);
  }, []);

  // Superficie base de la PWA privada. En iOS instalado hay zonas físicas
  // reservadas que pueden mostrar el fondo de <html>; mantenerlo azul evita
  // que aparezca una franja clara en las rutas privadas, incluidas /play/*.
  // Este comentario también sirve para retrigger de preview sin alterar lógica.
  // Se restaura al desmontar para no contaminar Login/Registro.
  React.useEffect(() => {
    const html = document.documentElement;
    const previousBackground = html.style.background;
    html.style.background = '#3B6CA8';

    return () => {
      html.style.background = previousBackground;
    };
  }, []);

  // CONFIRMADO con Web Inspector remoto en dispositivo real (rama
  // debug/ios-keyboard-scroll-recovery): con .app-shell/<main> ya
  // alineados exactamente a innerHeight (812), sigue quedando una franja
  // de ~62px hasta el borde físico real (874) que NINGÚN elemento
  // position:fixed puede alcanzar — es un límite de WebKit en esta PWA
  // instalada (viewport-fit=cover), no algo corregible ajustando alturas.
  // Esos px "inalcanzables" muestran el fondo base de <html>, que sí
  // llega al borde físico real. Se colorea ese fondo del mismo azul que
  // BottomNav SOLO cuando la barra está visible, para que la franja se
  // perciba como parte de ella en vez de un hueco — no se puede hacer que
  // BottomNav "llegue" físicamente ahí, así que se iguala el color.
  React.useEffect(() => {
    const showsNav = !isLocked && !hideNav;
    document.documentElement.classList.toggle('has-bottom-nav', showsNav);
    return () => {
      document.documentElement.classList.remove('has-bottom-nav');
    };
  }, [isLocked, hideNav]);

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

            {/* Paneles de cesta (flotan sobre todo el layout) */}
            <GamesCartPanel />
            <LotteryCartPanel />
          </>
        )}
      </div>

      {/* EXPERIMENTO EN RAMA (debug/ios-keyboard-scroll-recovery, no
          mergear a main): BottomNav fuera de .app-shell a propósito.
          .app-shell tiene overflow-hidden y se dimensiona con
          dvh/lvh (aproximado, puede quedarse corto un frame en iOS real);
          al ser BottomNav descendiente DOM suyo, overflow-hidden lo
          recorta por pintura aunque su containing block siga siendo el
          viewport (esto es independiente de containing block — un
          overflow-hidden recorta a CUALQUIER descendiente, incluido uno
          fixed). Sacándolo aquí, solo queda recortado por <body>, que se
          resuelve con position:fixed;inset:0 siempre exacto contra el
          viewport real, sin la imprecisión de dvh/lvh. */}
      {!isLocked && !hideNav && <BottomNav />}
    </PlaySessionProvider>
  );
}
