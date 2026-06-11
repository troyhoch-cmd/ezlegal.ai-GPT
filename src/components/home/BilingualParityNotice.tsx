import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function BilingualParityNotice() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="py-6 border-t border-slate-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Globe className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
        <p>
          {en
            ? 'All tools, guides, and intake forms are available in English and Spanish.'
            : 'Todas las herramientas, gu\u00edas y formularios est\u00e1n disponibles en ingl\u00e9s y espa\u00f1ol.'}
        </p>
      </div>
    </div>
  );
}
