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

const logVh = (label: string) => {
  const vv = window.visualViewport ? window.visualViewport.height : 'N/A';
  const ih = window.innerHeight;
  const ch = document.documentElement.clientHeight;
  const final = getRealViewportHeight();
  console.log(`[MAIN-DIAG] ${label}: VV=${vv}, IH=${ih}, CH=${ch} -> FINAL=${final}`);
  setAppVh();
};

const stabilizeAppVh = () => {
  logVh('init');
  requestAnimationFrame(() => {
    logVh('raf_1');
    requestAnimationFrame(() => {
      logVh('raf_2');
    });
  });
  setTimeout(() => logVh('120ms'), 120);
  setTimeout(() => logVh('350ms'), 350);
};

if (!window.hasOwnProperty('__app_vh_initialized')) {
  stabilizeAppVh();
  window.addEventListener('load', () => stabilizeAppVh());
  window.addEventListener('pageshow', () => stabilizeAppVh());
  window.addEventListener('resize', setAppVh);
  window.visualViewport?.addEventListener('resize', setAppVh);
  (window as any).__app_vh_initialized = true;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
