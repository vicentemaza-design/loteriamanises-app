import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function PublicLayout() {
  const { user, isDemo, loading } = useAuth();

  if (!loading && (user || isDemo)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
