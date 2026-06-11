import { APP_ROUTE_META } from '../config/routes';

export type LanguageSupport = 'en' | 'es' | 'both' | 'partial';

const SPANISH_FALLBACKS: Record<string, string> = {
  '/case-predictor': '/es/chat',
  '/negotiate': '/es/chat',
  '/toolkit': '/es/chat',
  '/ai-governance': '/es/chat',
  '/for-startups': '/for-business',
  '/for-law-firms': '/for-partners',
  '/for-in-house': '/for-business',
};

export function getLanguageSupport(pathname: string): LanguageSupport {
  const meta = APP_ROUTE_META[pathname];
  if (!meta) return 'both';
  const langs = meta.availableLanguages;
  if (langs.includes('en') && langs.includes('es')) return 'both';
  if (langs.includes('es') && !langs.includes('en')) return 'es';
  return 'en';
}

export function getSpanishFallbackRoute(pathname: string): string {
  return SPANISH_FALLBACKS[pathname] || '/es/chat';
}

export function isSpanishSupported(pathname: string): boolean {
  const support = getLanguageSupport(pathname);
  return support === 'both' || support === 'es';
}

export function shouldShowSpanishContinuityWarning(pathname: string, language: string): boolean {
  if (language !== 'es') return false;
  return !isSpanishSupported(pathname);
}
