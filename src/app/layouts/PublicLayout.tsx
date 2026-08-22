import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';
import { RUNTIME_CONFIG } from '@/config/runtime';

export function PublicLayout() {
  const { user, loading, redirectSignInJustCompleted } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('auth-route');

    return () => {
      document.documentElement.classList.remove('auth-route');
    };
  }, []);

  // Only a REAL restored Firebase session (`user`) may silently bypass
  // Login. `isDemo` is deliberately excluded here — a restored/stale demo
  // flag (sessionStorage, set by AuthProvider's mount-time effect) must
  // never bounce a fresh Login visit straight to /home on its own. That was
  // the "enters automatically, no time to click anything" bug: landing
  // back on "/" (same tab, reload, PWA relaunch...) with a leftover demo
  // flag from an earlier visit redirected before the user did anything.
  // Entering demo now always requires an explicit click on this screen —
  // LoginPage.tsx navigates to /home directly after signInDemo() instead of
  // relying on this reactive redirect.
  //
  // In a demo-enabled deployment we additionally require the access screen
  // to always be choosable: a real Google/email session merely RESTORED
  // from a previous visit (persisted Firebase auth) must not silently skip
  // Login either — same "no time to choose anything" bug, but for a real
  // account instead of the demo flag. The one exception is
  // `redirectSignInJustCompleted`: the popup-blocked fallback navigates the
  // whole page to Google and back, so the only way to complete that
  // specific flow is to let this exact return trip continue to /home.
  const canAutoRedirect = !RUNTIME_CONFIG.demoEnabled || redirectSignInJustCompleted;

  if (!loading && user && canAutoRedirect) {
    // Restores wherever RequireAuth sent the user from (see RequireAuth.tsx).
    // Never an externally-supplied destination: `from` only ever comes from
    // RequireAuth's own location.
    const destination = getSafeInternalPath(location.state?.from, '/home');
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
