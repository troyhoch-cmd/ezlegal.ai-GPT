const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:']);

export function sanitizeHref(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#') return '#';

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return '#';
    return parsed.href;
  } catch {
    if (trimmed.startsWith('/')) return trimmed;
    return '#';
  }
}
