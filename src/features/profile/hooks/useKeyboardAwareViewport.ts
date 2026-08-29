import { useCallback, useEffect, useRef, useState } from 'react';

// Mismo umbral que ya usa App.tsx para distinguir la apertura real del
// teclado de fluctuaciones menores del visualViewport (colapso de la barra
// de Safari, etc.) — no se toca ni se importa desde allí: es un valor
// intencionadamente duplicado para mantener este hook aislado de
// App.tsx/main.tsx, que no se modifican en esta tarea.
const KEYBOARD_HEIGHT_THRESHOLD = 80;

// Margen mínimo entre el campo activo y el borde del teclado/viewport.
const SAFE_MARGIN_PX = 24;

// Espera tras el último evento de resize/scroll de visualViewport antes de
// comprobar si el campo activo sigue visible. iOS emite varios resize
// seguidos mientras el teclado anima su apertura/cierre (la altura cambia
// frame a frame) — sin este pequeño debounce, scrollIntoView se dispararía
// en mitad de esa animación en vez de una sola vez, ya asentada.
const SETTLE_DELAY_MS = 120;

export interface KeyboardAwareViewport {
  /** true cuando innerHeight - visualViewport.height supera el umbral. */
  keyboardOpen: boolean;
  /** Alto real del visualViewport; null si el navegador no lo soporta. */
  viewportHeight: number | null;
  /** Desplazamiento superior del visualViewport (0 si no hay soporte). */
  viewportOffsetTop: number;
  /**
   * window.innerHeight - visualViewport.height, nunca negativo. Pensado
   * para usarse como base de un padding-bottom LOCAL en el formulario que
   * llama al hook — nunca para tocar --app-height/--app-vh ni ninguna
   * variable CSS global.
   */
  keyboardInset: number;
  /**
   * Registra (o desregistra con null) el input actualmente enfocado.
   * Llamar en onFocus (con event.currentTarget) y onBlur (con null) de
   * cada campo que deba participar. El propio hook decide cuándo, y si
   * hace falta, desplazarlo — nunca se llama scrollIntoView directamente
   * desde el formulario.
   */
  registerActiveField: (el: HTMLElement | null) => void;
}

export function useKeyboardAwareViewport(): KeyboardAwareViewport {
  const [viewport, setViewport] = useState<{ height: number | null; offsetTop: number }>({
    height: null,
    offsetTop: 0,
  });

  const activeFieldRef = useRef<HTMLElement | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const checkActiveFieldVisibility = useCallback(() => {
    const el = activeFieldRef.current;
    if (!el || !el.isConnected) return;

    const vv = window.visualViewport;
    const viewportTop = vv ? vv.offsetTop : 0;
    const viewportBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const rect = el.getBoundingClientRect();

    const isFullyVisible =
      rect.top >= viewportTop + SAFE_MARGIN_PX &&
      rect.bottom <= viewportBottom - SAFE_MARGIN_PX;

    if (!isFullyVisible) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const registerActiveField = useCallback((el: HTMLElement | null) => {
    activeFieldRef.current = el;
    if (!el) return;

    // Cubre el caso en que el teclado YA estaba abierto y el usuario solo
    // cambia de un campo a otro: visualViewport no vuelve a emitir resize
    // (su altura no cambia), así que hace falta un chequeo explícito aquí,
    // no solo en el listener de abajo.
    requestAnimationFrame(() => {
      requestAnimationFrame(checkActiveFieldVisibility);
    });
  }, [checkActiveFieldVisibility]);

  useEffect(() => {
    const vv = window.visualViewport;
    // Sin soporte de visualViewport: no-op total. keyboardOpen se queda en
    // false y registerActiveField sigue siendo llamable sin romper nada
    // (mismo comportamiento que hoy, sin este hook).
    if (!vv) return undefined;

    const handleViewportChange = () => {
      setViewport({ height: vv.height, offsetTop: vv.offsetTop });

      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        checkActiveFieldVisibility();
      }, SETTLE_DELAY_MS);
    };

    handleViewportChange();
    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);

    return () => {
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [checkActiveFieldVisibility]);

  const keyboardInset = viewport.height !== null
    ? Math.max(0, window.innerHeight - viewport.height)
    : 0;

  return {
    keyboardOpen: keyboardInset > KEYBOARD_HEIGHT_THRESHOLD,
    viewportHeight: viewport.height,
    viewportOffsetTop: viewport.offsetTop,
    keyboardInset,
    registerActiveField,
  };
}
