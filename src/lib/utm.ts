const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const STORAGE_KEY = 'ezlegal_utm';

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
  captured_at?: string;
}

export function captureUTMParams(): UTMData | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: UTMData = {};
    let hasUtm = false;

    for (const key of UTM_PARAMS) {
      const val = params.get(key);
      if (val) {
        utm[key] = val;
        hasUtm = true;
      }
    }

    if (!hasUtm) return getStoredUTM();

    utm.landing_page = window.location.pathname;
    utm.referrer = document.referrer || undefined;
    utm.captured_at = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return null;
  }
}

export function getStoredUTM(): UTMData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function appendUTMToUrl(url: string, overrides?: Partial<UTMData>): string {
  const stored = getStoredUTM();
  const merged = { ...stored, ...overrides };

  const urlObj = new URL(url, window.location.origin);
  for (const key of UTM_PARAMS) {
    const val = merged[key];
    if (val && !urlObj.searchParams.has(key)) {
      urlObj.searchParams.set(key, val);
    }
  }

  return urlObj.pathname + urlObj.search + urlObj.hash;
}

export function trackCTAClick(ctaId: string, destination?: string) {
  const utm = getStoredUTM();
  const event = {
    event: 'cta_click',
    cta_id: ctaId,
    destination: destination || window.location.pathname,
    timestamp: Date.now(),
    ...utm,
  };

  // Store in session for analytics pickup
  try {
    const clicks = JSON.parse(sessionStorage.getItem('ezlegal_cta_clicks') || '[]');
    clicks.push(event);
    sessionStorage.setItem('ezlegal_cta_clicks', JSON.stringify(clicks));
  } catch { /* noop */ }

  // Fire custom event for any analytics listener
  window.dispatchEvent(new CustomEvent('ezlegal:cta_click', { detail: event }));
}
