import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { translations } from '../lib/translations';
import {
  type Language,
  type Direction,
  SUPPORTED_LOCALES,
  getLocaleDescriptor,
  detectBrowserLanguage,
  getBrowserTimezone,
  applyDirectionToDom,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatList,
  selectPlural,
} from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { trackEvent, setAnalyticsLanguage } from '../services/analytics-service';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextType {
  language: Language;
  locale: string;
  dir: Direction;
  timezone: string;
  setLanguage: (lang: Language) => void;
  setLocale: (bcp47: string) => void;
  t: TranslateFn;
  formatDate: (v: Date | string | number, opts?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (v: Date | string | number) => string;
  formatRelativeTime: (v: Date | string | number) => string;
  formatNumber: (v: number, opts?: Intl.NumberFormatOptions) => string;
  formatCurrency: (v: number, currency?: string) => string;
  formatPercent: (v: number, fractionDigits?: number) => string;
  formatList: (items: string[], type?: Intl.ListFormatType) => string;
  plural: (count: number, forms: { zero?: string; one: string; two?: string; few?: string; many?: string; other: string }) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG = 'ezlegal-language';
const STORAGE_LOCALE = 'ezlegal-locale';

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) return saved as Language;
    return detectBrowserLanguage();
  });

  const [locale, setLocaleState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_LOCALE);
    if (saved) return saved;
    return getLocaleDescriptor(language).bcp47;
  });

  const [timezone, setTimezone] = useState<string>(() => getBrowserTimezone());

  const descriptor = useMemo(() => getLocaleDescriptor(language), [language]);
  const dir: Direction = descriptor.dir;

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG, language);
    localStorage.setItem(STORAGE_LOCALE, locale);
    applyDirectionToDom(dir, locale, language);
  }, [language, locale, dir]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user || !active) return;
        const { data } = await supabase
          .from('accessibility_preferences')
          .select('locale, timezone')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!active || !data) return;
        if (data.locale) {
          const code = data.locale.split('-')[0] as Language;
          const match = SUPPORTED_LOCALES.find((l) => l.code === code);
          if (match) {
            setLanguageState(match.code);
            setLocaleState(data.locale);
          }
        }
        if (data.timezone) setTimezone(data.timezone);
      } catch { /* gracefully handle unauthenticated or network errors */ }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (patch: { locale?: string; timezone?: string }) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;
      await supabase
        .from('accessibility_preferences')
        .upsert(
          { user_id: user.id, ...patch, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
    } catch { /* gracefully handle unauthenticated or network errors */ }
  }, []);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      setAnalyticsLanguage(lang);
      trackEvent('language_selected', { language: lang });
      const bcp47 = getLocaleDescriptor(lang).bcp47;
      setLocaleState(bcp47);
      void persist({ locale: bcp47 });
    },
    [persist],
  );

  const setLocale = useCallback(
    (bcp47: string) => {
      setLocaleState(bcp47);
      const code = bcp47.split('-')[0] as Language;
      if (SUPPORTED_LOCALES.some((l) => l.code === code)) setLanguageState(code);
      void persist({ locale: bcp47 });
    },
    [persist],
  );

  const t: TranslateFn = useCallback(
    (key, vars) => {
      const dict = translations[language] ?? translations.en;
      const fallback = translations.en[key] ?? key;
      return interpolate(dict[key] ?? fallback, vars);
    },
    [language],
  );

  const value: LanguageContextType = useMemo(
    () => ({
      language,
      locale,
      dir,
      timezone,
      setLanguage,
      setLocale,
      t,
      formatDate: (v, opts) => formatDate(v, locale, opts, timezone),
      formatDateTime: (v) => formatDateTime(v, locale, timezone),
      formatRelativeTime: (v) => formatRelativeTime(v, locale),
      formatNumber: (v, opts) => formatNumber(v, locale, opts),
      formatCurrency: (v, currency) => formatCurrency(v, locale, currency),
      formatPercent: (v, frac) => formatPercent(v, locale, frac),
      formatList: (items, type) => formatList(items, locale, type),
      plural: (count, forms) => selectPlural(count, locale, forms),
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [language, locale, dir, timezone, setLanguage, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LOCALES } from '../lib/i18n';
export type { Language, Direction } from '../lib/i18n';
