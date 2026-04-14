import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function PublicLayout() {
  const { user, isDemo, loading } = useAuth();

  if (!loading && (user || isDemo)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell min-h-dvh font-sans text-manises-blue flex flex-col overflow-hidden">
      <main className="flex-1 w-full relative overflow-y-auto overflow-x-hidden scroll-smooth">
        <div className="absolute inset-0 section-wash pointer-events-none" />
        <Outlet />
      </main>
    </div>
  );
}
