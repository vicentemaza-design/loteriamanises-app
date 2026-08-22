import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';

/**
 * Global, transversal connectivity notice — mounted exactly once (in
 * App.tsx, above routing) so it works identically on every screen, with or
 * without a session, and independently of demo/production
 * (RUNTIME_CONFIG.demoEnabled/VITE_ENABLE_DEMO_ACCESS never apply here: real
 * loss of network access is a device-level capability, not a demo concern).
 *
 * A persistent top banner, not a blocking modal: it never interrupts
 * whatever the user is doing. It only reports state — no retry button, no
 * auto-reload, no automatic re-submission of anything. Financial flows
 * (purchase/withdrawal/top-up) keep their own explicit "try again" actions
 * untouched by this component.
 */
export function ConnectionStatusBanner() {
  const { isOnline, justReconnected } = useNetworkStatus();
  const reduceMotion = useReducedMotion();
  const visible = !isOnline || justReconnected;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: -32, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[240] flex items-center justify-center gap-2.5 bg-manises-blue px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.625rem)' }}
        >
          {isOnline ? (
            <Wifi className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          ) : (
            <motion.span
              animate={reduceMotion ? undefined : { opacity: [1, 0.5, 1] }}
              transition={reduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <WifiOff className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
            </motion.span>
          )}
          <div className="text-left leading-tight">
            <p className="text-[11px] font-black text-white">
              {isOnline ? 'Conexión restablecida' : 'Sin conexión'}
            </p>
            {!isOnline && (
              <p className="text-[9.5px] font-medium text-white/75">Comprueba tu conexión a internet.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
