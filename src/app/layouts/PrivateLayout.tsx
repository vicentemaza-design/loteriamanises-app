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

            {/* PlayTopSurface (rama test/ios-root-transparent, no mergear a
                main todavía): montada directamente aquí, fuera de
                <main>/<Outlet>/GamePlayHeader — confirmado por QA física
                (canario #00FF00) que solo una capa a este nivel de DOM
                alcanza la zona física superior de iOS en /play/, algo que
                el propio fondo fixed de GamePlayHeader (más profundo en el
                árbol) no consigue por sí solo. Cubre EXCLUSIVAMENTE la
                safe-area (nunca los 56px de controles) y queda por debajo
                de GamePlayHeader (z-30 < z-40) — su misión es solo pintar
                esa franja, nunca taparlo. Lee el mismo gradiente que
                GamePlayHeader ya pinta, vía la variable CSS que este
                registra (ver PLAY_HEADER_BACKGROUND_VAR en
                GamePlayHeader.tsx) — sin colores/mapas duplicados; si esa
                variable no está aún definida (p. ej. primer frame antes de
                que monte), cae al azul de fallback de body/html. */}
            {hideNav && (
              <div
                aria-hidden="true"
                data-ios-play-top-surface="true"
                className="fixed top-0 left-0 right-0 z-30 pointer-events-none"
                style={{
                  height: 'env(safe-area-inset-top, 0px)',
                  background: 'var(--play-header-background, #3B6CA8)',
                }}
              />
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
