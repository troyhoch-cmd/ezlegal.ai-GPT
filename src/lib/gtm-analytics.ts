type EventProperties = Record<string, string | number | boolean | null>;

const STORAGE_KEY = 'ezlegal_analytics_events';

export function getAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {};
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const key of keys) {
    const val = params.get(key);
    if (val) attribution[key] = val;
  }
  attribution.referrer = document.referrer || '';
  attribution.landing_page = window.location.pathname;
  return attribution;
}

export function track(eventName: string, properties?: EventProperties): void {
  const payload = {
    event: eventName,
    properties: { ...properties, ...getAttribution() },
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  if (import.meta.env.DEV) {
    console.debug('[analytics]', eventName, payload);
  }

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(payload);
    if (existing.length > 500) existing.splice(0, existing.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch { /* quota exceeded or private mode */ }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, properties || {});
    }
  }
}

export function identifyLead(email: string, traits?: EventProperties): void {
  track('lead_identified', { email, ...traits });
}
