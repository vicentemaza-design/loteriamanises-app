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
    document.documentElement.classList.remove('auth-route');

    const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!viewportMeta) return;

    const content = viewportMeta.content
      .replace(/,?\s*viewport-fit=(?:cover|contain|auto)/, '');
    viewportMeta.setAttribute('content', content);
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

            {/* PlayTopSurface: superficie visual superior de todos los /play/,
                montada aquí a nivel de PrivateLayout, fuera de <main>/
                <Outlet>/GamePlayHeader, para extender el gradiente/artwork
                del juego a la zona física superior de iOS (status bar).
                Altura 54px y z-index 1 (ver PLAY_TOP_SURFACE_HEIGHT_VAR/
                PLAY_TOP_SURFACE_Z_VAR en GamePlayHeader.tsx). Lee el mismo
                gradiente que GamePlayHeader registra en
                PLAY_HEADER_BACKGROUND_VAR — sin colores/mapas duplicados;
                si esa variable no está aún definida (p. ej. primer frame
                antes de que monte), cae al azul de fallback de body/html.
                GamePlayHeader permanece transparente por encima, con sus
                controles y texto. */}
            {hideNav && (
              <div
                aria-hidden="true"
                data-ios-play-top-surface="true"
                className="fixed top-0 left-0 right-0 pointer-events-none overflow-hidden"
                style={{
                  height: 'var(--play-top-surface-height, 54px)',
                  zIndex: 'var(--play-top-surface-z, 1)',
                  background: 'var(--play-header-background, #3B6CA8)',
                }}
              >
                {/* Acabado visual del artwork, para todos los juegos (ver
                    PLAY_TOP_SURFACE_ARTWORK_VAR/PLAY_TOP_SURFACE_IMAGE_VAR en
                    GamePlayHeader.tsx): reutiliza tal cual la misma fuente de
                    imagen que GameCardRow en GamesPage.tsx, con una
                    composición más sutil (imagen 0.10 + grayscale(0.65)/
                    brightness(0.75), tinte multiply 0.35 sobre el mismo
                    gradiente del juego, velo direccional suave) para que la
                    imagen quede subordinada al gradiente en la franja de
                    54px. */}
                <div
                  className="absolute inset-0"
                  style={{ opacity: 'var(--play-top-surface-artwork, 0)' }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: 'var(--play-top-surface-image, none)',
                      opacity: 0.10,
                      filter: 'grayscale(0.65) brightness(0.75)',
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'var(--play-header-background, #3B6CA8)', mixBlendMode: 'multiply', opacity: 0.35 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/8 to-transparent" />
                </div>
              </div>
            )}

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

      {/* BottomNav vive fuera de .app-shell a propósito: .app-shell tiene
          overflow-hidden y se dimensiona con dvh/lvh (aproximado, puede
          quedarse corto un frame en iOS real); al ser BottomNav
          descendiente suyo, ese overflow-hidden lo recortaría por pintura
          aunque su containing block siga siendo el viewport. Sacándolo
          aquí, solo queda acotado por <body>, resuelto con
          position:fixed;inset:0 siempre exacto contra el viewport real —
          así el nav alcanza correctamente la superficie inferior en
          iOS. */}
      {!isLocked && !hideNav && <BottomNav />}
    </PlaySessionProvider>
  );
}
