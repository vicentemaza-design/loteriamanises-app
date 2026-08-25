import { useEffect } from 'react';

// Notifica cuando una compra se confirma con éxito (no solo "añadida a la
// cesta") — cada página de juego lo usa para volver a su pantalla de entrada
// "en fresco" (selección limpia, scroll arriba), sin necesidad de navegar a
// otra ruta (el carrito es un modal flotante sobre la propia página).
//
// No se reutiliza session.status === 'confirmed' porque PlaySessionProvider
// nunca deja esa transición observable cuando se confirman TODOS los
// borradores de una vez (el caso normal): replaceDrafts() colapsa a
// createEmptySession() con status 'idle' en cuanto drafts.length === 0. Un
// evento explícito, disparado justo tras el éxito real (usePlaySessionConfirm),
// es la señal fiable para el caso común.
const PURCHASE_CONFIRMED_EVENT = 'manises:purchase-confirmed';

export function dispatchPurchaseConfirmed() {
  window.dispatchEvent(new Event(PURCHASE_CONFIRMED_EVENT));
}

export function usePurchaseConfirmedEffect(onConfirmed: () => void) {
  // Sin array de dependencias a propósito: el listener se re-suscribe en
  // cada render con el closure más reciente (evita re-crear con useCallback
  // en cada página solo para satisfacer exhaustive-deps) — coste despreciable
  // para un listener de window, nunca deja uno huérfano gracias al cleanup.
  useEffect(() => {
    window.addEventListener(PURCHASE_CONFIRMED_EVENT, onConfirmed);
    return () => window.removeEventListener(PURCHASE_CONFIRMED_EVENT, onConfirmed);
  });
}

// Único <main> con scroll real del app shell (ver PrivateLayout.tsx: es el
// único <main> de toda la app — mismo elemento que ya usa el reset de scroll
// al cambiar de ruta vía su propio ref interno). Se llama tras resetear el
// estado local de la página de juego: se difiere un frame (rAF, no una
// cadena de timeouts) para que el reset ya esté pintado antes de forzar
// scrollTop = 0, evitando reposicionar sobre contenido que todavía va a
// desaparecer/cambiar de alto.
export function scrollMainToTop() {
  requestAnimationFrame(() => {
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    main.scrollTop = 0;
    main.scrollLeft = 0;
  });
}
