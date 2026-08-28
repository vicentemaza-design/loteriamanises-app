import { ArrowLeft } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

// Reserves room at the bottom of the scroll container for the fixed public
// action bar below, so it never covers the last line of a document.
const FOOTER_CLEARANCE = 'calc(3.5rem + env(safe-area-inset-bottom, 0px))';

/**
 * Neutral shell for /legal/* documents. Deliberately independent from
 * PublicLayout (which auto-redirects an authenticated user away — see
 * PublicLayout.tsx) and PrivateLayout (which mounts the private app shell
 * — Header, BottomNav, carts, PlaySessionProvider, AppLock — with no auth
 * check of its own). Legal documents must render identically regardless
 * of session state, so this layout has no auth logic and no redirects.
 *
 * html/body are overflow:hidden by default outside PublicLayout's
 * `auth-route` class (see index.css) — legal routes deliberately don't use
 * that class, so this layout provides its own bounded, scrollable viewport
 * instead of relying on document scroll.
 *
 * The public back action below is rendered as a DOM sibling of the
 * scrollable div, not a descendant of it — an `overflow-y-auto` ancestor
 * clips a `position:fixed` descendant to its own box no matter its
 * containing block (confirmed empirically this session with BottomNav vs
 * .app-shell's overflow-hidden), so nesting it inside would clip it away.
 */
export function LegalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const target = getSafeInternalPath(location.state?.from, '/');
  const label = target === '/register' ? 'Volver al registro' : 'Volver al acceso';

  return (
    <>
      <div
        className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-background"
        style={{ paddingBottom: FOOTER_CLEARANCE }}
      >
        <Outlet />
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-slate-100 bg-background/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          onClick={() => navigate(target)}
          className="flex items-center gap-1.5 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-manises-blue/70 transition-colors active:scale-95 hover:text-manises-blue"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {label}
        </button>
      </div>
    </>
  );
}
