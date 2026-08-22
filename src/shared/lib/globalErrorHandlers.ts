/**
 * Global, client-side error capture for anything outside React's render
 * phase — ErrorBoundary (see app/components/ErrorBoundary.tsx) only catches
 * render/lifecycle errors, never event-handler exceptions or promise
 * rejections. This module fills that gap with console.error visibility only
 * — no remote reporting, no user-facing UI (toasts/modals stay unchanged).
 */

const SENSITIVE_KEY_PATTERN = /password|token|pin|secret|authorization|cookie/i;

/** Redacts obviously sensitive keys before anything reaches console.error. */
function toSafeLogPayload(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (value && typeof value === 'object') {
    const safe: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      safe[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? '[redacted]'
        : typeof val === 'object' && val !== null
          ? '[object]'
          : val;
    }
    return safe;
  }
  return value;
}

/**
 * Registers window.onerror + unhandledrejection exactly once per page load.
 * Guarded the same way as the viewport-height init in main.tsx, so React
 * StrictMode's double-invoke and any HMR re-execution never double-register.
 */
export function registerGlobalErrorHandlers() {
  if ((window as { __globalErrorHandlersRegistered?: boolean }).__globalErrorHandlersRegistered) {
    return;
  }
  (window as { __globalErrorHandlersRegistered?: boolean }).__globalErrorHandlersRegistered = true;

  window.onerror = (message, source, lineno, colno, error) => {
    console.error('[GlobalError] Uncaught error:', toSafeLogPayload(error ?? message), { source, lineno, colno });
  };

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[GlobalError] Unhandled promise rejection:', toSafeLogPayload(event.reason));
  });
}
