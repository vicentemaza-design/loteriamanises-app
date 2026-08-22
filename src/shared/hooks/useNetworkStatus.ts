import { useEffect, useRef, useState } from 'react';

/** How long the transient "Conexión restablecida" state stays visible after reconnecting. */
const RECONNECTED_VISIBLE_MS = 4000;

/**
 * Single, centralized source of truth for connectivity — reads
 * `navigator.onLine` and listens to the browser's `online`/`offline` events
 * exactly once. Meant to be consumed by exactly one mounted component
 * (ConnectionStatusBanner, mounted once in App.tsx) so listeners are never
 * duplicated across pages/screens.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [justReconnected, setJustReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const handleOnline = () => {
      setIsOnline(true);
      // Only announce "reconnected" if we were actually offline before —
      // guards against the browser firing a redundant 'online' event while
      // already online, which would otherwise re-trigger the banner.
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setJustReconnected(true);
        reconnectTimer = setTimeout(() => setJustReconnected(false), RECONNECTED_VISIBLE_MS);
      }
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setJustReconnected(false);
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return { isOnline, justReconnected };
}
