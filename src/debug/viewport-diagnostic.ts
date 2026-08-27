import { isViewportDiagnosticEnabled } from './viewport-diagnostic-mode';

if (isViewportDiagnosticEnabled()) {
  type RectSnapshot = {
    x: number;
    y: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  };

  type Snapshot = Record<string, unknown>;

  const snapshots: Snapshot[] = [];
  const visualViewport = window.visualViewport;
  let keyboardCycleActive = false;
  let awaitingRecoveryGesture = false;

  const toRect = (element: Element | null): RectSnapshot | null => {
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  const elementIdentity = (element: Element | null) => {
    if (!element) return null;

    const htmlElement = element as HTMLElement;
    return {
      tagName: htmlElement.tagName,
      id: htmlElement.id || null,
      className: typeof htmlElement.className === 'string' ? htmlElement.className : null,
      name: htmlElement.getAttribute('name'),
      type: htmlElement.getAttribute('type'),
      ariaLabel: htmlElement.getAttribute('aria-label'),
      rect: toRect(htmlElement),
    };
  };

  const getAppCustomProperties = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      appVh: rootStyles.getPropertyValue('--app-vh').trim() || null,
      appHeight: rootStyles.getPropertyValue('--app-height').trim() || null,
    };
  };

  const record = (eventType: string, phase?: 'A' | 'B' | 'C') => {
    const navigation = document.querySelector<HTMLElement>('nav[aria-label="Navegación principal"]');
    const header = document.querySelector<HTMLElement>('header');
    const main = document.querySelector<HTMLElement>('main');
    const shell = document.querySelector<HTMLElement>('.app-shell');
    const scrollingElement = document.scrollingElement as HTMLElement | null;
    const navigationStyles = navigation ? getComputedStyle(navigation) : null;
    const mainStyles = main ? getComputedStyle(main) : null;
    const shellStyles = shell ? getComputedStyle(shell) : null;

    snapshots.push({
      phase: phase ?? null,
      eventType,
      performanceNow: performance.now(),
      timestamp: new Date().toISOString(),
      viewport: {
        innerHeight: window.innerHeight,
        scrollY: window.scrollY,
        pageYOffset: window.pageYOffset,
        documentElementScrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop,
        scrollingElementScrollTop: scrollingElement?.scrollTop ?? null,
        visualViewport: visualViewport
          ? {
              height: visualViewport.height,
              offsetTop: visualViewport.offsetTop,
              pageTop: visualViewport.pageTop,
            }
          : null,
      },
      appCustomProperties: getAppCustomProperties(),
      navigation: {
        rect: toRect(navigation),
        computed: navigationStyles
          ? {
              position: navigationStyles.position,
              bottom: navigationStyles.bottom,
              transform: navigationStyles.transform,
              height: navigationStyles.height,
              paddingBottom: navigationStyles.paddingBottom,
              backdropFilter: navigationStyles.backdropFilter || navigationStyles.getPropertyValue('-webkit-backdrop-filter'),
            }
          : null,
      },
      header: {
        rect: toRect(header),
      },
      main: {
        rect: toRect(main),
        scrollTop: main?.scrollTop ?? null,
        clientHeight: main?.clientHeight ?? null,
        scrollHeight: main?.scrollHeight ?? null,
        computed: mainStyles
          ? {
              height: mainStyles.height,
              minHeight: mainStyles.minHeight,
              y: toRect(main)?.y ?? null,
            }
          : null,
      },
      shell: {
        rect: toRect(shell),
        computed: shellStyles
          ? {
              height: shellStyles.height,
              minHeight: shellStyles.minHeight,
              y: toRect(shell)?.y ?? null,
            }
          : null,
      },
      activeElement: elementIdentity(document.activeElement),
    });
  };

  const likelyKeyboardOpen = () => {
    if (!visualViewport) return false;
    return window.innerHeight - visualViewport.height > 80;
  };

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Copiar diagnóstico';
  button.setAttribute('aria-label', 'Copiar diagnóstico del viewport');
  button.style.position = 'absolute';
  button.style.top = '8px';
  button.style.right = '8px';
  button.style.zIndex = '2147483647';
  button.style.padding = '6px 8px';
  button.style.border = '1px solid #0a4792';
  button.style.borderRadius = '6px';
  button.style.background = '#ffffff';
  button.style.color = '#0a4792';
  button.style.font = '600 12px system-ui, sans-serif';
  button.style.cursor = 'pointer';

  button.onclick = async () => {
    record('copy-button');
    const diagnostic = JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        location: window.location.href,
        userAgent: navigator.userAgent,
        snapshots,
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(diagnostic);
      button.textContent = 'Diagnóstico copiado';
    } catch {
      button.textContent = 'Error al copiar';
    }

    window.setTimeout(() => {
      button.textContent = 'Copiar diagnóstico';
    }, 1800);
  };

  document.body.append(button);
  record('diagnostic-start', 'A');
  requestAnimationFrame(() => record('diagnostic-start-raf', 'A'));

  document.addEventListener('focusin', () => {
    keyboardCycleActive = true;
    awaitingRecoveryGesture = false;
    record('focusin', 'A');
  });

  document.addEventListener('focusout', () => {
    record('focusout');
    if (keyboardCycleActive) {
      requestAnimationFrame(() => {
        if (!likelyKeyboardOpen()) {
          awaitingRecoveryGesture = true;
          record('keyboard-closed-observed', 'B');
        }
      });
    }
  });

  window.addEventListener('resize', () => record('window.resize'));
  window.addEventListener('scroll', () => record('window.scroll'));

  visualViewport?.addEventListener('resize', () => record('visualViewport.resize'));
  visualViewport?.addEventListener('scroll', () => record('visualViewport.scroll'));

  document.addEventListener('touchstart', () => {
    record('touchstart', awaitingRecoveryGesture ? 'B' : undefined);
  }, { passive: true });

  document.addEventListener('touchmove', () => record('touchmove'), { passive: true });

  document.addEventListener('touchend', () => {
    if (awaitingRecoveryGesture) {
      record('touchend', 'C');
      requestAnimationFrame(() => record('touchend-raf', 'C'));
      awaitingRecoveryGesture = false;
      keyboardCycleActive = false;
      return;
    }

    record('touchend');
  }, { passive: true });
}
