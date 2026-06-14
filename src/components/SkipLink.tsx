import { useLanguage } from '../contexts/LanguageContext';

export default function SkipLink() {
  const { language } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-navy-900 focus:text-white focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
    >
      {language === 'es' ? 'Saltar al contenido principal' : 'Skip to main content'}
    </a>
  );
}
