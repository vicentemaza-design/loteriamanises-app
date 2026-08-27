/**
 * AUTOPSIA AISLADA — franja blanca / containing block de BottomNav.
 * Siempre activo en esta rama (una PWA instalada no tiene barra de
 * direcciones para añadir query params) — nunca se mergea a main. No
 * modifica layout, scroll, foco ni ningún componente de la aplicación;
 * únicamente observa y permite copiar un snapshot de la cadena de
 * ancestros de BottomNav.
 */

const debugEnabled = true;

interface AncestorInfo {
  depth: number;
  tag: string;
  id: string | null;
  className: string | null;
  position: string;
  transform: string;
  filter: string;
  backdropFilter: string;
  perspective: string;
  contain: string;
  willChange: string;
  containingBlockCandidate: boolean;
  flags: string[];
  rect: { top: number; bottom: number; left: number; right: number; width: number; height: number };
}

function inspectAncestorChain(nav: Element) {
  const results: AncestorInfo[] = [];
  let el: Element | null = nav.parentElement;
  let depth = 0;
  while (el && depth < 20) {
    const cs = getComputedStyle(el);
    const flags: string[] = [];
    if (cs.transform && cs.transform !== 'none') flags.push('transform');
    if (cs.filter && cs.filter !== 'none') flags.push('filter');
    if (cs.backdropFilter && cs.backdropFilter !== 'none') flags.push('backdropFilter');
    if (cs.perspective && cs.perspective !== 'none') flags.push('perspective');
    if (cs.contain && !['none', 'style', 'size'].includes(cs.contain)) flags.push('contain');
    if (cs.willChange && cs.willChange !== 'auto') flags.push('willChange');

    const rect = el.getBoundingClientRect();
    results.push({
      depth,
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      className: typeof el.className === 'string' ? el.className.slice(0, 120) : null,
      position: cs.position,
      transform: cs.transform,
      filter: cs.filter,
      backdropFilter: cs.backdropFilter,
      perspective: cs.perspective,
      contain: cs.contain,
      willChange: cs.willChange,
      containingBlockCandidate: flags.length > 0,
      flags,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
    });
    el = el.parentElement;
    depth++;
  }
  return results;
}

function capture() {
  const nav = document.querySelector('nav[aria-label="Navegación principal"]');
  const navRect = nav ? nav.getBoundingClientRect() : null;
  return {
    capturedAt: new Date().toISOString(),
    location: window.location.href,
    userAgent: navigator.userAgent,
    window: { innerWidth: window.innerWidth, innerHeight: window.innerHeight, devicePixelRatio: window.devicePixelRatio },
    navRect: navRect ? { top: navRect.top, bottom: navRect.bottom, left: navRect.left, right: navRect.right, width: navRect.width, height: navRect.height } : null,
    gapBelowNav: navRect ? window.innerHeight - navRect.bottom : null,
    ancestorChain: nav ? inspectAncestorChain(nav) : [],
    navHeightVar: getComputedStyle(document.documentElement).getPropertyValue('--nav-height').trim(),
  };
}

if (debugEnabled) {
  const init = () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Copiar containing-block';
    button.setAttribute('aria-label', 'Copiar diagnóstico de containing block de BottomNav');
    button.style.cssText = [
      'position:fixed', 'left:12px', 'bottom:calc(env(safe-area-inset-bottom, 0px) + 100px)',
      'z-index:2147483647', 'font:700 11px system-ui,sans-serif', 'padding:8px 10px',
      'border:0', 'border-radius:8px', 'background:#164a2e', 'color:#fff',
      'box-shadow:0 2px 8px rgba(0,0,0,.25)',
    ].join(';');

    button.addEventListener('click', async () => {
      const snapshot = capture();
      try {
        await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
        button.textContent = 'Copiado ✓';
      } catch {
        button.textContent = 'No se pudo copiar';
      }
      window.setTimeout(() => { button.textContent = 'Copiar containing-block'; }, 1500);
    });

    document.body.appendChild(button);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}
