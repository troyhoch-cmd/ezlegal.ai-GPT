import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { heroTrustItems } from '../../data/trustSignals';

export function TrustProofStrip() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-4" aria-labelledby="trust-strip-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 id="trust-strip-heading" className="sr-only">{en ? 'Safety and trust' : 'Seguridad y confianza'}</h2>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          {heroTrustItems.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-teal-500 flex-shrink-0" aria-hidden="true" />
              {en ? item.text.en : item.text.es}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
