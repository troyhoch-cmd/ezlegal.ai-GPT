import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { announce } from '../lib/focus-manager';

export function useRouteFocus() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;

    const main = document.getElementById('main-content');
    if (!main) return;

    if (!main.hasAttribute('tabindex')) {
      main.setAttribute('tabindex', '-1');
    }

    window.requestAnimationFrame(() => {
      main.focus({ preventScroll: false });

      const heading = main.querySelector<HTMLElement>('h1');
      const title = heading?.textContent?.trim() || document.title;
      if (title) announce(`Navigated to ${title}`, 'polite');
    });
  }, [pathname, hash]);
}
