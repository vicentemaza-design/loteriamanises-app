import { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router/AppRouter';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ConnectionStatusBanner } from '@/shared/components/ConnectionStatusBanner';

// DEBUG TEMPORAL — rama debug/ios-keyboard-scroll-recovery, no mergear a
// main. Registra cada transición del ciclo de teclado (no solo las
// medidas genéricas de viewport que ya capturaba la herramienta anterior)
// para poder confirmar, con una sola captura física, si el nudge de
// recuperación llega a ejecutarse o no.
interface KeyboardDebugEntry {
  t: number;
  event: string;
  [key: string]: unknown;
}

export default function App() {
  const debugLogRef = useRef<KeyboardDebugEntry[]>([]);
  const [copyLabel, setCopyLabel] = useState('Copiar diagnóstico');

  useEffect(() => {
    const vv = window.visualViewport;
    const pushDebug = (event: string, extra?: Record<string, unknown>) => {
      const log = debugLogRef.current;
      log.push({ t: Math.round(performance.now()), event, ...extra });
      if (log.length > 300) log.shift();
    };
    // Margen sobre el que un teclado software real siempre se pasa (los
    // más pequeños en iOS rondan 250-300px) — evita falsos positivos por
    // fluctuaciones menores de la barra de Safari (que también mueve
    // visualViewport.height unos pocos px al aparecer/colapsar).
    const KEYBOARD_HEIGHT_THRESHOLD = 80;
    const VIEWPORT_HEIGHT_TOLERANCE = 8;
    const KEYBOARD_CLOSE_HEIGHT_DELTA = 40;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let keyboardBaselineHeight: number | null = null;
    let smallestKeyboardHeight: number | null = null;
    let keyboardWasObservedOpen = false;
    let recoveryNudgeUsed = false;

    // Séptimo experimento (Vía 3). Los seis anteriores intentaban CURAR el
    // fallo después de que el teclado se cerrara — todos fallaron. Esta
    // variante es la primera que intenta PREVENIRLO: en el instante del
    // focus, antes de que iOS decida desplazar el documento para revelar
    // el input, se fija la altura de <body> al valor actual del
    // visualViewport y se oculta el overflow un instante, para intentar
    // que iOS no necesite hacer el pan de documento que dispara el bug
    // (visto en las capturas reales: scrollY pasa de 0 a un valor >0 justo
    // en ese momento). Se revierte a los 25ms.
    const PRE_ADJUST_RESTORE_DELAY = 25;

    const startKeyboardCycle = (event: FocusEvent) => {
      if (!isIOS) return;

      const height = vv?.height ?? window.innerHeight;
      if ((window.innerHeight - height) > KEYBOARD_HEIGHT_THRESHOLD) {
        pushDebug('baseline-skip-keyboard-already-open', { height, innerHeight: window.innerHeight });
        return;
      }

      keyboardBaselineHeight = height;
      smallestKeyboardHeight = null;
      keyboardWasObservedOpen = false;
      recoveryNudgeUsed = false;
      pushDebug('baseline-captured', { height });

      const target = event.target as HTMLElement | null;
      if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;

      const body = document.body;
      const previousHeight = body.style.height;
      const previousOverflow = body.style.overflow;
      pushDebug('pre-adjust-focus-attempt', { height });
      body.style.height = `${height}px`;
      body.style.overflow = 'hidden';
      window.setTimeout(() => {
        body.style.height = previousHeight;
        body.style.overflow = previousOverflow;
        pushDebug('pre-adjust-focus-restore-complete');
      }, PRE_ADJUST_RESTORE_DELAY);
    };

    // Único scroll "de documento" que debe existir: 0. Todo el scroll real
    // de la app vive dentro de <main> (ver purchase-events.ts) — nunca se
    // toca su scrollTop aquí, así que la posición del usuario dentro de la
    // pantalla que estaba editando se conserva intacta.
    const settleDocumentScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      if (document.documentElement.scrollTop !== 0) document.documentElement.scrollTop = 0;
      if (document.body.scrollTop !== 0) document.body.scrollTop = 0;
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
      const keyboardLikelyOpen = (window.innerHeight - height) > KEYBOARD_HEIGHT_THRESHOLD;

      if (isIOS && keyboardLikelyOpen) {
        const wasAlreadyOpen = keyboardWasObservedOpen;
        keyboardWasObservedOpen = true;
        smallestKeyboardHeight = smallestKeyboardHeight === null
          ? height
          : Math.min(smallestKeyboardHeight, height);
        if (!wasAlreadyOpen) {
          pushDebug('keyboard-open-detected', { height, scrollY: window.scrollY, offsetTop: vv?.offsetTop ?? null });
        }
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

      const viewportIsReset = Math.abs(vv?.offsetTop ?? 0) <= 1;
      const keyboardHasClosed = keyboardWasObservedOpen
        && smallestKeyboardHeight !== null
        && height >= smallestKeyboardHeight + KEYBOARD_CLOSE_HEIGHT_DELTA
        && viewportIsReset;
      const viewportClosedIncomplete = keyboardHasClosed
        && keyboardBaselineHeight !== null
        && height < keyboardBaselineHeight - VIEWPORT_HEIGHT_TOLERANCE;

      if (keyboardHasClosed) {
        pushDebug('keyboard-closed-detected', {
          height,
          baseline: keyboardBaselineHeight,
          smallestKeyboardHeight,
          scrollY: window.scrollY,
          incomplete: viewportClosedIncomplete,
        });
      }

      if (keyboardHasClosed) {
        keyboardWasObservedOpen = false;
        smallestKeyboardHeight = null;
        keyboardBaselineHeight = null;
      }
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    vv?.addEventListener('resize', updateAppHeight);
    vv?.addEventListener('scroll', updateAppHeight);
    window.addEventListener('focusin', startKeyboardCycle, { passive: true });

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      vv?.removeEventListener('resize', updateAppHeight);
      vv?.removeEventListener('scroll', updateAppHeight);
      window.removeEventListener('focusin', startKeyboardCycle);
    };
  }, []);

  const handleCopyDebugLog = async () => {
    const payload = {
      capturedAt: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent,
      log: debugLogRef.current,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopyLabel('Copiado ✓');
    } catch {
      setCopyLabel('Error al copiar');
    }
    window.setTimeout(() => setCopyLabel('Copiar diagnóstico'), 1500);
  };

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

      {/* DEBUG TEMPORAL — rama debug/ios-keyboard-scroll-recovery, no
          mergear a main. Botón absolute (no fixed/transform), no forma
          parte del layout ni interfiere con BottomNav/carrito. */}
      <button
        type="button"
        onClick={handleCopyDebugLog}
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          right: 8,
          zIndex: 999999,
          fontSize: 11,
          fontWeight: 700,
          padding: '6px 10px',
          borderRadius: 8,
          background: 'rgba(10,71,146,0.92)',
          color: '#fff',
          border: 'none',
        }}
      >
        {copyLabel}
      </button>
    </ErrorBoundary>
  );
}
// Trigger build
