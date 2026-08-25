import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router/AppRouter';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ConnectionStatusBanner } from '@/shared/components/ConnectionStatusBanner';

export default function App() {
  useEffect(() => {
    let lastHeight = window.visualViewport?.height ?? window.innerHeight;

    const updateAppHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${height}px`);

      // iOS Safari: al cerrar el teclado el visualViewport recupera su
      // altura completa, pero el layout viewport a veces no vuelve a
      // desplazarse a su posición original (deja una banda residual y hay
      // que arrastrar la pantalla a mano). Si el viewport acaba de CRECER
      // (señal de que el teclado se ha cerrado, no de que se ha abierto) y
      // no hay ningún campo con foco, se corrige el scroll residual — nunca
      // mientras se está editando, para no interferir con el teclado abierto.
      const grew = height > lastHeight;
      lastHeight = height;
      const active = document.activeElement;
      const isEditing = active instanceof HTMLElement &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (grew && !isEditing && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
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
