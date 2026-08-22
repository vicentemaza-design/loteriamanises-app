import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router/AppRouter';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ConnectionStatusBanner } from '@/shared/components/ConnectionStatusBanner';

export default function App() {
  useEffect(() => {
    const updateAppHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${height}px`);
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.visualViewport?.addEventListener('resize', updateAppHeight);
    window.visualViewport?.addEventListener('scroll', updateAppHeight);

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.visualViewport?.removeEventListener('resize', updateAppHeight);
      window.visualViewport?.removeEventListener('scroll', updateAppHeight);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ConnectionStatusBanner />
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              actionButtonStyle: {
                backgroundColor: '#0a4792',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '11px',
                borderRadius: '8px',
                padding: '6px 12px',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
// Trigger build
