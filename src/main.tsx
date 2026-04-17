import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const setAppVh = () => {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
};

setAppVh();
window.addEventListener('resize', setAppVh);
window.addEventListener('pageshow', setAppVh);
window.visualViewport?.addEventListener('resize', setAppVh);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
