import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router/AppRouter';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ConnectionStatusBanner } from '@/shared/components/ConnectionStatusBanner';

export default function App() {
  useEffect(() => {
    const vv = window.visualViewport;
    // Margen sobre el que un teclado software real siempre se pasa (los
    // más pequeños en iOS rondan 250-300px) — evita falsos positivos por
    // fluctuaciones menores de la barra de Safari (que también mueve
    // visualViewport.height unos pocos px al aparecer/colapsar).
    const KEYBOARD_HEIGHT_THRESHOLD = 80;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let keyboardWasOpen = false;
    let repaintNudgeUsed = false;
    let repaintNudgePending = false;
    let recoveryTimerIds: number[] = [];
    let recoveryFrameIds: number[] = [];

    const isPrivateRoute = () => !document.documentElement.classList.contains('auth-route');
    const keyboardIsOpen = (height: number) =>
      window.innerHeight - height > KEYBOARD_HEIGHT_THRESHOLD;

    // Único scroll "de documento" que debe existir: 0. Todo el scroll real
    // de la app vive dentro de <main> (ver purchase-events.ts) — nunca se
    // toca su scrollTop aquí, así que la posición del usuario dentro de la
    // pantalla que estaba editando se conserva intacta.
    const settleDocumentScroll = () => {
      // Ejecutar siempre el scrollTo, aunque WebKit ya exponga scrollY = 0:
      // el gesto físico que corrige el bug también fuerza una recomposición.
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    };

    const captureViewportRecoveryState = () => ({
      windowScrollY: window.scrollY,
      documentScrollTop: document.scrollingElement?.scrollTop ?? 0,
      visualViewportHeight: vv?.height ?? window.innerHeight,
      visualViewportOffsetTop: vv?.offsetTop ?? 0,
    });

    const cancelViewportRecovery = () => {
      recoveryTimerIds.forEach(window.clearTimeout);
      recoveryFrameIds.forEach(window.cancelAnimationFrame);
      recoveryTimerIds = [];
      recoveryFrameIds = [];
      if (repaintNudgePending) {
        settleDocumentScroll();
        repaintNudgePending = false;
      }
    };

    const forceSingleViewportRecomposition = () => {
      if (repaintNudgeUsed) return;

      repaintNudgeUsed = true;
      repaintNudgePending = true;
      window.scrollTo(0, 1);
      const nudgeFrameId = requestAnimationFrame(() => {
        settleDocumentScroll();
        repaintNudgePending = false;
        recoveryFrameIds = recoveryFrameIds.filter(id => id !== nudgeFrameId);
      });
      recoveryFrameIds.push(nudgeFrameId);
    };

    const recoverIOSPrivateViewport = () => {
      const height = vv?.height ?? window.innerHeight;
      if (!isIOS || !isPrivateRoute() || !keyboardWasOpen || keyboardIsOpen(height)) return;

      document.documentElement.style.setProperty('--app-height', `${height}px`);
      settleDocumentScroll();
      // Capturar las métricas después del reset permite observar un posible
      // pan residual de WebKit sin intentar escribir en offsetTop, que es
      // read-only. El nudge se limita a una vez por ciclo de teclado.
      const recoveryState = captureViewportRecoveryState();
      const hasResidualVisualPan = Math.abs(recoveryState.visualViewportOffsetTop) > 2;
      if (hasResidualVisualPan || recoveryState.windowScrollY === 0) {
        forceSingleViewportRecomposition();
      }
    };

    const scheduleViewportRecovery = () => {
      if (!isIOS || !isPrivateRoute() || !keyboardWasOpen) return;

      cancelViewportRecovery();
      recoverIOSPrivateViewport();

      const firstFrameId = requestAnimationFrame(() => {
        recoverIOSPrivateViewport();
        recoveryFrameIds = recoveryFrameIds.filter(id => id !== firstFrameId);

        const secondFrameId = requestAnimationFrame(() => {
          recoverIOSPrivateViewport();
          recoveryFrameIds = recoveryFrameIds.filter(id => id !== secondFrameId);
        });
        recoveryFrameIds.push(secondFrameId);
      });
      recoveryFrameIds.push(firstFrameId);
      [100, 250, 500].forEach(delay => {
        const timerId = window.setTimeout(() => {
          recoverIOSPrivateViewport();
          recoveryTimerIds = recoveryTimerIds.filter(id => id !== timerId);
          if (delay === 500) keyboardWasOpen = false;
        }, delay);
        recoveryTimerIds.push(timerId);
      });
    };

    const updateAppHeight = () => {
      const height = vv?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${height}px`);

      // window.innerHeight (el layout viewport) NO se reduce cuando aparece
      // el teclado en iOS Safari — solo lo hace visualViewport.height. Esa
      // diferencia es la señal fiable de "hay teclado cubriendo pantalla
      // ahora mismo", muy superior a comparar contra la última lectura
      // (el fix anterior usaba height > lastHeight, sensible a los pasos
      // intermedios del resize durante la animación de apertura/cierre).
      //
      // Deliberadamente NO se exige "el input activo ha perdido el foco":
      // en iOS se puede cerrar el teclado (swipe, botón de teclado) sin
      // que el input pierda el foco — el fix anterior gateaba la corrección
      // con isEditing y por eso nunca llegaba a ejecutarse en ese caso,
      // que es justo el reportado por Rafa en dispositivo real.
      // Rutas públicas (.auth-route, ver PublicLayout/index.css): el
      // documento vuelve a ser el scroller real (body ya no es
      // position:fixed ahí), así que window.scrollY > 0 es un estado
      // legítimo mientras el usuario recorre un formulario más alto que la
      // pantalla (p.ej. Registro paso 2) — forzarlo a 0 aquí lo "enganchaba"
      // de vuelta arriba en cualquier resize/scroll de visualViewport. En
      // privadas (body:fixed, scroll solo dentro de <main>) el
      // comportamiento no cambia: 0 sigue siendo el único scroll de
      // documento válido.
      const isAuthRoute = document.documentElement.classList.contains('auth-route');
      const keyboardLikelyOpen = keyboardIsOpen(height);
      if (isIOS && keyboardLikelyOpen) {
        keyboardWasOpen = true;
        repaintNudgeUsed = false;
        cancelViewportRecovery();
      }
      if (!keyboardLikelyOpen && !isAuthRoute) {
        settleDocumentScroll();
        // WebKit a veces reporta la geometría final del viewport 1-2 frames
        // después de disparar el propio evento resize/scroll — un par de
        // reintentos en rAF (no una cadena de setTimeout) asegura que la
        // corrección no se pierda si algo la revierte mientras el layout
        // todavía se está asentando.
        requestAnimationFrame(() => requestAnimationFrame(settleDocumentScroll));
      }

      if (isIOS && !keyboardLikelyOpen && keyboardWasOpen) {
        scheduleViewportRecovery();
      }
    };

    const handleFocusIn = () => {
      if (!isIOS) return;
      cancelViewportRecovery();
      keyboardWasOpen = true;
      repaintNudgeUsed = false;
    };

    const handleFocusOut = () => {
      if (!isIOS) return;
      scheduleViewportRecovery();
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    vv?.addEventListener('resize', updateAppHeight);
    vv?.addEventListener('scroll', updateAppHeight);
    window.addEventListener('focusin', handleFocusIn, { passive: true });
    window.addEventListener('focusout', handleFocusOut, { passive: true });

    return () => {
      cancelViewportRecovery();
      window.removeEventListener('resize', updateAppHeight);
      vv?.removeEventListener('resize', updateAppHeight);
      vv?.removeEventListener('scroll', updateAppHeight);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ConnectionStatusBanner />
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              actionButtonStyle: {
                backgroundColor: '#0a4792',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '11px',
                borderRadius: '8px',
                padding: '6px 12px',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
// Trigger build
