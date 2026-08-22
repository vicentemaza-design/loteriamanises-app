import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getSafeInternalPath } from '@/shared/lib/safeInternalPath';

export function PublicLayout() {
  const { user, isDemo, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('auth-route');

    return () => {
      document.documentElement.classList.remove('auth-route');
    };
  }, []);

  if (!loading && (user || isDemo)) {
    // Restores wherever RequireAuth sent the user from (see RequireAuth.tsx)
    // — Google, demo and email/password all just flip user/isDemo and land
    // here, so this one spot covers all three. Never an externally-supplied
    // destination: `from` only ever comes from RequireAuth's own location.
    const destination = getSafeInternalPath(location.state?.from, '/home');
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
