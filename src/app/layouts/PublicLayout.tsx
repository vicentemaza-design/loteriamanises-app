import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function PublicLayout() {
  const { user, isDemo, loading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add('auth-route');
    document.body.classList.add('auth-route');

    return () => {
      document.documentElement.classList.remove('auth-route');
      document.body.classList.remove('auth-route');
    };
  }, []);

  if (!loading && (user || isDemo)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
