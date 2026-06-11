const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'details > summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(root: HTMLElement | Document = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  );
}

export function focusFirstIn(root: HTMLElement | null): boolean {
  if (!root) return false;
  const autofocusEl = root.querySelector<HTMLElement>('[data-autofocus]');
  if (autofocusEl) {
    autofocusEl.focus();
    return true;
  }
  const focusables = getFocusableElements(root);
  if (focusables.length > 0) {
    focusables[0].focus();
    return true;
  }
  if (root.tabIndex < 0) root.tabIndex = -1;
  root.focus();
  return true;
}

export function isElementInDOM(el: Element | null): el is HTMLElement {
  return !!el && el instanceof HTMLElement && document.body.contains(el);
}

let liveRegionNode: HTMLDivElement | null = null;

function ensureLiveRegion(): HTMLDivElement {
  if (liveRegionNode && document.body.contains(liveRegionNode)) return liveRegionNode;
  const node = document.createElement('div');
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  node.setAttribute('aria-atomic', 'true');
  node.className = 'sr-only';
  node.id = 'sr-live-region';
  document.body.appendChild(node);
  liveRegionNode = node;
  return node;
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const node = ensureLiveRegion();
  node.setAttribute('aria-live', priority);
  node.textContent = '';
  window.setTimeout(() => {
    node.textContent = message;
  }, 50);
}
