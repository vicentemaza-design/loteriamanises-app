const STORAGE_KEY = 'viewportDebug';

function readStoredDebugMode(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistDebugMode(enabled: boolean) {
  try {
    if (enabled) {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // A query-param activation remains usable when storage is unavailable.
  }
}

export function isViewportDiagnosticEnabled(): boolean {
  const requestedMode = new URLSearchParams(window.location.search).get('viewportDebug');

  if (requestedMode === '0') {
    persistDebugMode(false);
    return false;
  }

  if (requestedMode === '1') {
    persistDebugMode(true);
    return true;
  }

  return readStoredDebugMode();
}
