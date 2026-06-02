import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { homepageFinalCTA } from '../../data/homepageContent';
import { trackEvent } from '../../services/analytics-service';

export function FinalCTA() {
  const { language } = useLanguage();
  const en = language === 'en';
  const c = homepageFinalCTA;

  return (
    <section className="bg-slate-900 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          {en ? c.heading.en : c.heading.es}
        </h2>
        <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
          {en ? c.subline.en : c.subline.es}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/start"
            onClick={() => trackEvent('home_cta_clicked', { cta: 'final_section' })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 no-underline"
          >
            {en ? 'Start free 2-minute checkup' : 'Comenzar revisión gratis de 2 minutos'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/start?lang=es"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 no-underline"
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            {c.spanishCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
