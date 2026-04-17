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

const nudgeViewport = () => {
  setAppVh();
  window.scrollTo(0, 0);
  if (document.body) {
    const _unused = document.body.offsetHeight;
  }
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
