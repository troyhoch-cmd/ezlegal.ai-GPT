import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageToggleProps {
  onToggle?: (lang: 'en' | 'es') => void;
}

export function LanguageToggle({ onToggle }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  function handleSwitch(lang: 'en' | 'es') {
    setLanguage(lang);
    onToggle?.(lang);
  }

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="group"
      aria-label={
        language === 'en' ? 'Language selection' : 'Selección de idioma'
      }
    >
      <button
        type="button"
        onClick={() => handleSwitch('en')}
        aria-pressed={language === 'en'}
        data-language-toggle="en"
        className={`rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          language === 'en'
            ? 'bg-teal-700 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('es')}
        aria-pressed={language === 'es'}
        data-language-toggle="es"
        className={`rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          language === 'es'
            ? 'bg-teal-700 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Español
      </button>
    </div>
  );
}
