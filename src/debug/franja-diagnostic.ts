/**
 * AUTOPSIA AISLADA — franja blanca inferior iOS.
 * Solo se activa con ?viewportDebug=1. No modifica layout, scroll, foco ni
 * ningún componente de la aplicación; únicamente observa y permite copiar
 * snapshots A/B/C.
 */

interface RectLike { x: number; y: number; top: number; right: number; bottom: number; left: number; width: number; height: number }
interface ElementGeometry {
  clientHeight: number;
  scrollHeight: number;
  rect: RectLike;
  computedHeight: string;
  computedMinHeight: string;
  overflow: string;
  backgroundColor: string;
  backgroundImage: string;
}
interface Snapshot {
  phase: string;
  capturedAt: string;
  performanceNow: number;
  location: string;
  userAgent: string;
  window: Record<string, number>;
  visualViewport: Record<string, number | null>;
  documentElement: ElementGeometry & { scrollTop: number };
  body: ElementGeometry & { scrollTop: number; position: string; top: string; bottom: string };
  root: (ElementGeometry & { scrollTop: number }) | null;
  appShell: (ElementGeometry & { scrollTop: number; position: string; bottom: string }) | null;
  main: (ElementGeometry & { scrollTop: number; overflowY: string; paddingBottom: string }) | null;
  bottomNav: {
    rect: RectLike;
    position: string;
    bottom: string;
    height: string;
    paddingBottom: string;
    backgroundColor: string;
    backdropFilter: string;
    safeAreaBottomPx: number;
  } | null;
  viewportUnits: { vh100: number; svh100: number; lvh100: number; dvh100: number };
  safeAreaBottomPx: number;
  cssVars: Record<string, string>;
  visibleBackgroundSamples: Array<Record<string, unknown>>;
  recentEvents: Array<{ performanceNow: number; type: string }>;
}

const debugEnabled = new URLSearchParams(window.location.search).get('viewportDebug') === '1';

if (debugEnabled) {
  const snapshots: Record<string, Snapshot> = {};
  const events: Array<{ performanceNow: number; type: string }> = [];
  let baselineHeight = 0;
  let keyboardWasObserved = false;
  let bandWasObserved = false;

  const toRect = (value: DOMRect): RectLike => ({
    x: value.x, y: value.y, top: value.top, right: value.right,
    bottom: value.bottom, left: value.left, width: value.width, height: value.height,
  });

  const measure = (element: Element): ElementGeometry => {
    const style = getComputedStyle(element);
    return {
      clientHeight: (element as HTMLElement).clientHeight,
      scrollHeight: (element as HTMLElement).scrollHeight,
      rect: toRect(element.getBoundingClientRect()),
      computedHeight: style.height,
      computedMinHeight: style.minHeight,
      overflow: style.overflow,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
    };
  };

  const readUnit = (unit: string): number => {
    const probe = document.createElement('div');
    probe.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;width:1px;height:${unit};`;
    document.body.appendChild(probe);
    const value = probe.getBoundingClientRect().height;
    probe.remove();
    return value;
  };

  const readSafeAreaBottom = (): number => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:1px;height:0;padding-bottom:env(safe-area-inset-bottom, 0px);';
    document.body.appendChild(probe);
    const value = probe.getBoundingClientRect().height;
    probe.remove();
    return value;
  };

  const samplePoint = (x: number, y: number) => document.elementsFromPoint(x, y).slice(0, 5).map((element) => {
    const style = getComputedStyle(element);
    const className = typeof element.className === 'string' ? element.className.trim().replace(/\s+/g, '.') : '';
    return {
      element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${className ? `.${className}` : ''}`,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
    };
  });

  const sampleBackgrounds = (nav: Element | null) => {
    const points = [{ label: 'viewport-bottom', x: window.innerWidth / 2, y: Math.max(0, window.innerHeight - 1) }];
    const navBottom = nav?.getBoundingClientRect().bottom ?? -1;
    if (navBottom >= 0 && navBottom < window.innerHeight - 1) {
      points.push({ label: 'below-bottom-nav', x: window.innerWidth / 2, y: navBottom + 1 });
    }
    return points.map((point) => ({ ...point, elements: samplePoint(point.x, point.y) }));
  };

  const capture = (phase: string): Snapshot => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const shell = document.querySelector('.app-shell');
    const main = document.querySelector('main');
    const nav = document.querySelector('nav[aria-label="Navegación principal"]');
    const vv = window.visualViewport;
    const htmlStyle = getComputedStyle(html);
    const bodyStyle = getComputedStyle(body);
    const shellStyle = shell ? getComputedStyle(shell) : null;
    const mainStyle = main ? getComputedStyle(main) : null;
    const navStyle = nav ? getComputedStyle(nav) : null;
    const safeAreaBottomPx = readSafeAreaBottom();
    const htmlGeometry = measure(html);
    const bodyGeometry = measure(body);
    const rootGeometry = root ? measure(root) : null;
    const shellGeometry = shell ? measure(shell) : null;
    const mainGeometry = main ? measure(main) : null;

    return {
      phase,
      capturedAt: new Date().toISOString(),
      performanceNow: performance.now(),
      location: window.location.href,
      userAgent: navigator.userAgent,
      window: {
        innerWidth: window.innerWidth, innerHeight: window.innerHeight,
        outerWidth: window.outerWidth, outerHeight: window.outerHeight,
        scrollX: window.scrollX, scrollY: window.scrollY,
        pageXOffset: window.pageXOffset, pageYOffset: window.pageYOffset,
        devicePixelRatio: window.devicePixelRatio,
      },
      visualViewport: {
        width: vv?.width ?? null, height: vv?.height ?? null,
        offsetTop: vv?.offsetTop ?? null, offsetLeft: vv?.offsetLeft ?? null,
        pageTop: vv?.pageTop ?? null, pageLeft: vv?.pageLeft ?? null,
        scale: vv?.scale ?? null,
      },
      documentElement: { ...htmlGeometry, scrollTop: html.scrollTop },
      body: { ...bodyGeometry, scrollTop: body.scrollTop, position: bodyStyle.position, top: bodyStyle.top, bottom: bodyStyle.bottom },
      root: root ? { ...rootGeometry!, scrollTop: (root as HTMLElement).scrollTop } : null,
      appShell: shell ? { ...shellGeometry!, scrollTop: (shell as HTMLElement).scrollTop, position: shellStyle!.position, bottom: shellStyle!.bottom } : null,
      main: main ? { ...mainGeometry!, scrollTop: (main as HTMLElement).scrollTop, overflowY: mainStyle!.overflowY, paddingBottom: mainStyle!.paddingBottom } : null,
      bottomNav: nav && navStyle ? {
        rect: toRect(nav.getBoundingClientRect()), position: navStyle.position,
        bottom: navStyle.bottom, height: navStyle.height, paddingBottom: navStyle.paddingBottom,
        backgroundColor: navStyle.backgroundColor, backdropFilter: navStyle.backdropFilter,
        safeAreaBottomPx,
      } : null,
      viewportUnits: {
        vh100: readUnit('100vh'), svh100: readUnit('100svh'),
        lvh100: readUnit('100lvh'), dvh100: readUnit('100dvh'),
      },
      safeAreaBottomPx,
      cssVars: {
        appHeight: htmlStyle.getPropertyValue('--app-height').trim(),
        appVh: htmlStyle.getPropertyValue('--app-vh').trim(),
        headerHeight: htmlStyle.getPropertyValue('--header-height').trim(),
        navHeight: htmlStyle.getPropertyValue('--nav-height').trim(),
      },
      visibleBackgroundSamples: sampleBackgrounds(nav),
      recentEvents: [...events],
    };
  };

  const recordEvent = (type: string) => {
    events.push({ performanceNow: performance.now(), type });
    if (events.length > 300) events.shift();
    const currentHeight = window.visualViewport?.height ?? window.innerHeight;
    if (!keyboardWasObserved && currentHeight > baselineHeight) baselineHeight = currentHeight;
    if (baselineHeight > 0 && currentHeight < baselineHeight - 80) keyboardWasObserved = true;
    if (keyboardWasObserved && currentHeight < baselineHeight - 8 && (window.visualViewport?.offsetTop ?? 0) <= 8) {
      bandWasObserved = true;
      snapshots.B = capture('B — teclado cerrado / franja presente');
    }
  };

  const copy = async (button: HTMLButtonElement) => {
    snapshots.current = capture('captura manual');
    const payload = JSON.stringify({ snapshots, events, baselineHeight, exportedAt: new Date().toISOString() }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      button.textContent = 'Diagnóstico copiado ✓';
    } catch {
      button.textContent = 'No se pudo copiar';
    }
  };

  const init = () => {
    const initial = () => {
      baselineHeight = window.visualViewport?.height ?? window.innerHeight;
      snapshots.A = capture('A — estado normal inicial');
    };

    ['resize', 'scroll', 'orientationchange', 'touchstart', 'touchmove', 'touchend'].forEach((type) => {
      window.addEventListener(type, () => {
        recordEvent(type);
        if (type === 'touchend' && bandWasObserved) {
          window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
            snapshots.C = capture('C — después del gesto manual');
          }));
        }
      }, { passive: true });
    });
    window.visualViewport?.addEventListener('resize', () => recordEvent('visualViewport.resize'));
    window.visualViewport?.addEventListener('scroll', () => recordEvent('visualViewport.scroll'));

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Copiar diagnóstico franja';
    button.setAttribute('aria-label', 'Copiar diagnóstico de franja inferior');
    button.style.cssText = [
      'position:fixed', 'right:12px', 'bottom:calc(var(--nav-height, 5rem) + 12px)',
      'z-index:2147483647', 'font:700 11px system-ui,sans-serif', 'padding:8px 10px',
      'border:0', 'border-radius:8px', 'background:#7b1e1e', 'color:#fff',
      'box-shadow:0 2px 8px rgba(0,0,0,.25)',
    ].join(';');
    button.addEventListener('click', () => { void copy(button); });
    document.body.appendChild(button);
    window.requestAnimationFrame(() => window.requestAnimationFrame(initial));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}
