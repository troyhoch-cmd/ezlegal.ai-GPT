import { isValidRoute } from './routes';
import { VALID_ANCHORS, validateQueryParams } from './deep-link-contracts';

export interface LinkHealthEvent {
  type: 'route_not_found' | 'anchor_not_found' | 'cta_click' | 'invalid_query_param';
  path: string;
  referrer: string;
  cta_id?: string;
  anchor?: string;
  campaign_params?: string;
  query_key?: string;
  query_value?: string;
  timestamp: number;
}

const EVENT_BUFFER: LinkHealthEvent[] = [];
const MAX_BUFFER = 50;
const FLUSH_INTERVAL = 30000;
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 20;

let flushTimer: ReturnType<typeof setInterval> | null = null;

const SESSION_DEDUP = new Set<string>();
const rateWindow: number[] = [];

const BOT_UA_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
  /lighthouse/i, /pagespeed/i, /headlesschrome/i,
];

function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  if ((navigator as { webdriver?: boolean }).webdriver) return true;
  const ua = navigator.userAgent;
  return BOT_UA_PATTERNS.some((p) => p.test(ua));
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const SAFE_VALUE_PATTERN = /^[a-zA-Z0-9_\-\.]{1,128}$/;
const REF_PATTERN = /^[a-zA-Z0-9_\-]{1,64}$/;

function extractCampaignParams(url: string): string {
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return '';
  try {
    const params = new URLSearchParams(url.slice(qIdx));
    const result: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val && SAFE_VALUE_PATTERN.test(val)) {
        result[key] = val;
      }
    }
    const ref = params.get('ref');
    if (ref && REF_PATTERN.test(ref)) {
      result.ref = ref;
    }
    return Object.keys(result).length > 0 ? JSON.stringify(result) : '';
  } catch {
    return '';
  }
}

function stripQueryParams(url: string): string {
  return url.split('?')[0].split('#')[0];
}

function checkRateLimit(): boolean {
  const now = Date.now();
  while (rateWindow.length > 0 && rateWindow[0] < now - RATE_LIMIT_WINDOW) {
    rateWindow.shift();
  }
  if (rateWindow.length >= RATE_LIMIT_MAX) return false;
  rateWindow.push(now);
  return true;
}

function emit(event: LinkHealthEvent) {
  if (isLikelyBot()) return;
  if (!checkRateLimit()) return;

  const dedupKey = `${event.type}:${event.path}:${event.anchor || ''}:${event.query_key || ''}`;
  if (SESSION_DEDUP.has(dedupKey)) return;
  SESSION_DEDUP.add(dedupKey);

  const campaign = extractCampaignParams(event.path) || extractCampaignParams(event.referrer);
  if (campaign) event.campaign_params = campaign;
  event.path = stripQueryParams(event.path);
  event.referrer = stripQueryParams(event.referrer);

  EVENT_BUFFER.push(event);
  if (EVENT_BUFFER.length >= MAX_BUFFER) {
    flush();
  }
}

export function flush() {
  if (EVENT_BUFFER.length === 0) return;
  const batch = EVENT_BUFFER.splice(0);
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      fetch(`${supabaseUrl}/rest/v1/link_health_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(batch.map((e) => ({
          event_type: e.type,
          path: e.path,
          referrer_path: e.referrer,
          cta_id: e.cta_id || null,
          anchor: e.anchor || null,
          campaign_params: e.campaign_params || null,
          query_key: e.query_key || null,
          query_value: e.query_value || null,
          occurred_at: new Date(e.timestamp).toISOString(),
        }))),
      }).catch(() => {});
    }
  } catch {
    // silently fail -- telemetry must never break UX
  }
}

export function startLinkHealthMonitoring() {
  if (flushTimer) return;
  flushTimer = setInterval(flush, FLUSH_INTERVAL);
  window.addEventListener('beforeunload', flush);
}

export function stopLinkHealthMonitoring() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  window.removeEventListener('beforeunload', flush);
  flush();
}

export function reportRouteNotFound(path: string) {
  emit({
    type: 'route_not_found',
    path,
    referrer: document.referrer || window.location.pathname,
    timestamp: Date.now(),
  });
}

export function reportAnchorNotFound(path: string, anchor: string) {
  emit({
    type: 'anchor_not_found',
    path,
    anchor,
    referrer: window.location.pathname,
    timestamp: Date.now(),
  });
}

export function reportCtaClick(ctaId: string, destination: string) {
  emit({
    type: 'cta_click',
    path: destination,
    referrer: window.location.pathname,
    cta_id: ctaId,
    timestamp: Date.now(),
  });
}

export function validateCurrentRoute(): boolean {
  const path = window.location.pathname;
  if (!isValidRoute(path)) {
    reportRouteNotFound(path);
    return false;
  }
  return true;
}

export function validateAnchor(): boolean {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return true;
  const pathname = window.location.pathname;
  const knownAnchors = VALID_ANCHORS[pathname];
  if (knownAnchors && !knownAnchors.includes(hash)) {
    reportAnchorNotFound(pathname, hash);
    return false;
  }
  const element = document.getElementById(hash);
  if (!element) {
    reportAnchorNotFound(pathname, hash);
    return false;
  }
  return true;
}

export interface CrawlResult {
  total: number;
  valid: number;
  broken: LinkHealthEvent[];
}

function validateHref(href: string, ctaId: string | undefined, result: CrawlResult) {
  const [path, hash] = href.split('#');
  const cleanPath = path.split('?')[0];

  if (!isValidRoute(cleanPath)) {
    result.broken.push({
      type: 'route_not_found',
      path: href,
      referrer: window.location.pathname,
      cta_id: ctaId,
      timestamp: Date.now(),
    });
    return;
  }

  if (hash && cleanPath === window.location.pathname) {
    const target = document.getElementById(hash);
    if (!target) {
      result.broken.push({
        type: 'anchor_not_found',
        path: href,
        anchor: hash,
        referrer: window.location.pathname,
        timestamp: Date.now(),
      });
      return;
    }
  }

  result.valid++;
}

export function crawlPageLinks(): CrawlResult {
  const result: CrawlResult = { total: 0, valid: 0, broken: [] };

  const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('/#')) return;
    result.total++;
    validateHref(href, link.dataset.ctaId, result);
  });

  const ctaElements = document.querySelectorAll<HTMLElement>('[data-cta-href^="/"]');
  ctaElements.forEach((el) => {
    const href = el.dataset.ctaHref;
    if (!href || href.startsWith('/#')) return;
    if (el.tagName === 'A') return;
    result.total++;
    validateHref(href, el.dataset.ctaId, result);
  });

  return result;
}

export function assertNoBrokenLinks(): { pass: boolean; message: string } {
  const result = crawlPageLinks();
  if (result.broken.length === 0) {
    return { pass: true, message: `All ${result.total} links valid on ${window.location.pathname}` };
  }
  const paths = result.broken.map((e) => `  ${e.type}: ${e.path}`).join('\n');
  return {
    pass: false,
    message: `${result.broken.length}/${result.total} broken on ${window.location.pathname}:\n${paths}`,
  };
}

export function reportInvalidQueryParam(path: string, key: string, value: string) {
  emit({
    type: 'invalid_query_param',
    path,
    referrer: window.location.pathname,
    query_key: key,
    query_value: value,
    timestamp: Date.now(),
  });
}

export function validateQueryParamsOnPage(): boolean {
  const pathname = window.location.pathname;
  const search = window.location.search;
  if (!search) return true;
  const violations = validateQueryParams(pathname, search);
  for (const v of violations) {
    reportInvalidQueryParam(pathname, v.key, v.value);
  }
  return violations.length === 0;
}
