export type Language = 'en' | 'es' | 'ar' | 'he';
export type Direction = 'ltr' | 'rtl';

export interface LocaleDescriptor {
  code: Language;
  bcp47: string;
  label: string;
  nativeLabel: string;
  dir: Direction;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleDescriptor[] = [
  { code: 'en', bcp47: 'en-US', label: 'English', nativeLabel: 'English', dir: 'ltr', flag: 'US' },
  { code: 'es', bcp47: 'es-US', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr', flag: 'MX' },
  { code: 'ar', bcp47: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', flag: 'SA' },
  { code: 'he', bcp47: 'he-IL', label: 'Hebrew', nativeLabel: 'עברית', dir: 'rtl', flag: 'IL' },
];

export function getLocaleDescriptor(code: Language): LocaleDescriptor {
  return SUPPORTED_LOCALES.find((l) => l.code === code) ?? SUPPORTED_LOCALES[0];
}

export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = [navigator.language, ...(navigator.languages ?? [])].map((l) => l.toLowerCase());
  for (const c of candidates) {
    const primary = c.split('-')[0];
    const match = SUPPORTED_LOCALES.find((l) => l.code === primary);
    if (match) return match.code;
  }
  return 'en';
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function formatDate(
  value: Date | string | number,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  timezone?: string,
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: timezone }).format(d);
}

export function formatDateTime(
  value: Date | string | number,
  locale: string,
  timezone?: string,
): string {
  return formatDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' }, timezone);
}

export function formatRelativeTime(value: Date | string | number, locale: string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), 'day');
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 604800), 'week');
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
  return rtf.format(Math.round(diffSec / 31536000), 'year');
}

export function formatNumber(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  locale: string,
  currency = 'USD',
): string {
  return formatNumber(value, locale, { style: 'currency', currency });
}

export function formatPercent(value: number, locale: string, fractionDigits = 0): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatList(items: string[], locale: string, type: Intl.ListFormatType = 'conjunction'): string {
  try {
    return new Intl.ListFormat(locale, { style: 'long', type }).format(items);
  } catch {
    return items.join(', ');
  }
}

export function selectPlural(
  value: number,
  locale: string,
  forms: { zero?: string; one: string; two?: string; few?: string; many?: string; other: string },
): string {
  const rule = new Intl.PluralRules(locale).select(value);
  return (forms[rule] ?? forms.other).replace(/\{count\}/g, formatNumber(value, locale));
}

export function applyDirectionToDom(dir: Direction, bcp47: string, lang: Language) {
  const root = document.documentElement;
  const descriptor = getLocaleDescriptor(lang);
  const resolvedDir: Direction = descriptor.dir;
  root.lang = lang;
  root.dir = resolvedDir;
  root.dataset.locale = bcp47;
  root.dataset.dir = resolvedDir;
  if (resolvedDir !== dir) {
    console.warn(`[i18n] dir mismatch: requested ${dir} for ${lang}; enforced ${resolvedDir}`);
  }
  if (document.body) {
    document.body.dir = resolvedDir;
  }
}
