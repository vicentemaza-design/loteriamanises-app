import { Outlet } from 'react-router-dom';

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
 * instead of relying on document scroll. Back navigation lives solely in
 * PublicLegalHeader's arrow now — no fixed footer action here.
 */
export function LegalLayout() {
  return (
    <div
      className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <Outlet />
    </div>
  );
}
