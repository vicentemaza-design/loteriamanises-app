import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { registerGlobalErrorHandlers } from '@/shared/lib/globalErrorHandlers';
import './index.css';

registerGlobalErrorHandlers();

const getRealViewportHeight = () => {
  const candidates = [
    window.visualViewport ? window.visualViewport.height : 0,
    window.innerHeight || 0,
    document.documentElement ? document.documentElement.clientHeight : 0,
  ].filter(Boolean);

  return Math.max(...candidates);
};

const setAppVh = () => {
  const vh = getRealViewportHeight();
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
};

const nudgeViewport = () => {
  setAppVh();
  window.scrollTo(0, 0);
  document.documentElement.offsetHeight;
};

const stabilizeAppVh = () => {
  nudgeViewport();
  requestAnimationFrame(() => {
    nudgeViewport();
    requestAnimationFrame(() => {
      nudgeViewport();
    });
  });
  setTimeout(nudgeViewport, 120);
  setTimeout(nudgeViewport, 350);
};

if (!window.hasOwnProperty('__app_vh_initialized')) {
  stabilizeAppVh();
  window.addEventListener('load', () => stabilizeAppVh());
  window.addEventListener('pageshow', () => stabilizeAppVh());
  // Antes solo se actualizaba la variable CSS (setAppVh) en cada resize.
  // Cuando Safari expande/colapsa su propia barra de direcciones,
  // window.innerHeight cambia igual que al abrir/cerrar el teclado, pero
  // sin el reflow forzado (scrollTo + doble rAF) que sí soluciona el caso
  // del teclado, WebKit puede dejar el pintado de los elementos fixed
  // desfasado respecto a la nueva altura real.
  window.addEventListener('resize', stabilizeAppVh);
  window.visualViewport?.addEventListener('resize', stabilizeAppVh);
  (window as any).__app_vh_initialized = true;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
