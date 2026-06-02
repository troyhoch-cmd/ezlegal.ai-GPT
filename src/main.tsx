import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import LocalBusinessSchema from './components/LocalBusinessSchema.tsx';
import './index.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      /* SW registration is best-effort; app still works without it */
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalBusinessSchema />
    <App />
  </StrictMode>
);
