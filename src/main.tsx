import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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

const stabilizeAppVh = () => {
  setAppVh();
  requestAnimationFrame(() => {
    setAppVh();
    requestAnimationFrame(() => {
      setAppVh();
    });
  });
  setTimeout(setAppVh, 150);
  setTimeout(setAppVh, 400);
};

if (!window.hasOwnProperty('__app_vh_initialized')) {
  stabilizeAppVh();
  window.addEventListener('load', stabilizeAppVh);
  window.addEventListener('pageshow', stabilizeAppVh);
  window.addEventListener('resize', setAppVh);
  window.visualViewport?.addEventListener('resize', setAppVh);
  (window as any).__app_vh_initialized = true;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
