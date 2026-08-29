import { useCallback, useEffect, useRef, useState } from 'react';

// Mismo umbral que ya usa App.tsx para distinguir la apertura real del
// teclado de fluctuaciones menores del visualViewport (colapso de la barra
// de Safari, etc.) — no se toca ni se importa desde allí: es un valor
// intencionadamente duplicado para mantener este hook aislado de
// App.tsx/main.tsx, que no se modifican en esta tarea.
const KEYBOARD_HEIGHT_THRESHOLD = 80;

// Margen mínimo entre el campo activo y el borde SUPERIOR del visualViewport
// (para no quedar pegado al header). El borde inferior (teclado/autofill)
// usa su propio objetivo, más generoso — ver TARGET_BOTTOM_CLEARANCE_PX.
const SAFE_MARGIN_PX = 56;

// Separación objetivo entre el borde inferior del campo activo y el borde
// inferior REAL del visualViewport (donde empieza el teclado/la barra de
// autofill). SAFE_MARGIN_PX (56) ya bastaba para "detectar" que el campo
// estaba demasiado bajo, pero scrollIntoView({block:'center'}) posiciona
// respecto al centro del contenedor de scroll, no respecto al borde real
// del visualViewport (que con teclado abierto es más pequeño que el layout
// viewport) — de ahí que el campo siguiera terminando pegado al teclado
// pese a que la detección ya era correcta. Validado en dispositivo físico
// que 72px de hueco es suficiente para separarlo de la barra de
// "Autorrellenar contacto" de iOS.
const TARGET_BOTTOM_CLEARANCE_PX = 72;

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

    // Sin visualViewport (navegador sin soporte): no hay forma de calcular
    // la posición real del teclado — mantener el comportamiento seguro
    // anterior (scrollIntoView nativo) en vez del cálculo fino de abajo.
    if (!vv) {
      const rect = el.getBoundingClientRect();
      const isFullyVisible =
        rect.top >= SAFE_MARGIN_PX && rect.bottom <= window.innerHeight - SAFE_MARGIN_PX;
      if (!isFullyVisible) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Scroller real de la app (el <main> de PrivateLayout, sin tocar) —
    // nunca window.scrollBy: body está fixed y no es el scroller real.
    const scroller = el.closest('main');
    if (!(scroller instanceof HTMLElement)) {
      // No debería ocurrir en las páginas de Perfil que usan este hook,
      // pero si el input no cuelga de un <main>, mismo fallback seguro.
      const rect = el.getBoundingClientRect();
      const isFullyVisible =
        rect.top >= vv.offsetTop + SAFE_MARGIN_PX &&
        rect.bottom <= vv.offsetTop + vv.height - SAFE_MARGIN_PX;
      if (!isFullyVisible) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Medido en cada llamada (nunca una posición capturada de antemano):
    // esto es lo que hace que la función sea idempotente — si se llama de
    // nuevo tras un scroll ya aplicado, el overflow calculado da <= 0 y no
    // se vuelve a desplazar nada, evitando bucles/oscilaciones aunque el
    // scroll "smooth" en curso dispare una nueva comprobación mientras
    // todavía anima.
    const rect = el.getBoundingClientRect();
    const viewportTop = vv.offsetTop;
    const viewportBottom = vv.offsetTop + vv.height;

    // Borde inferior — el problema físico confirmado: el campo puede
    // "detectarse" como demasiado bajo pero scrollIntoView(block:'center')
    // no lo separaba lo suficiente del teclado/autofill real. Aquí se
    // desplaza el scroller real la distancia exacta de solape contra el
    // borde inferior REAL del visualViewport, no un centro teórico.
    const targetBottom = viewportBottom - TARGET_BOTTOM_CLEARANCE_PX;
    const overflowBottom = rect.bottom - targetBottom;
    if (overflowBottom > 0) {
      scroller.scrollBy({ top: overflowBottom, behavior: 'smooth' });
      return;
    }

    // Borde superior — protección secundaria (no es el problema reportado
    // hoy) para que el campo no quede pegado al header al desplazarse hacia
    // arriba en el formulario.
    const targetTop = viewportTop + SAFE_MARGIN_PX;
    const overflowTop = targetTop - rect.top;
    if (overflowTop > 0) {
      scroller.scrollBy({ top: -overflowTop, behavior: 'smooth' });
    }
    // Ni overflowBottom ni overflowTop positivos: el campo ya está en zona
    // cómoda — no se mueve nada (evita mover innecesariamente campos que
    // ya se ven bien, p. ej. BankAccounts/IBAN).
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
