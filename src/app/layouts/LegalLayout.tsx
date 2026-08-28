import { Outlet } from 'react-router-dom';

/**
 * Neutral shell for /legal/* documents. Deliberately independent from
 * PublicLayout (which auto-redirects an authenticated user away — see
 * PublicLayout.tsx) and PrivateLayout (which mounts the private app shell
 * — Header, BottomNav, carts, PlaySessionProvider, AppLock — with no auth
 * check of its own). Legal documents must render identically regardless
 * of session state, so this layout has no auth logic and no redirects.
 */
export function LegalLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <Outlet />
    </div>
  );
}
