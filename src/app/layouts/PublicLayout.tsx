import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function PublicLayout() {
  const { user, isDemo, loading } = useAuth();

  if (!loading && (user || isDemo)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell h-app min-h-app min-h-0 font-sans text-manises-blue flex flex-col overflow-hidden">
      <main className="min-h-0 flex-1 w-full relative overflow-y-auto overflow-x-hidden scroll-smooth">
        <div className="absolute inset-0 section-wash pointer-events-none" />
        <div className="relative w-full min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
