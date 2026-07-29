import type { Language } from './i18n';

type TranslationDictionary = Record<string, string>;

export const translations: Record<Language, TranslationDictionary> = {
  en: {},
  es: {},
  ar: {},
  he: {},
};
