import { Link } from 'react-router-dom';
import { Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { homepagePartner } from '../../data/homepageContent';
import { trackEvent } from '../../services/analytics-service';

export function LegalAidPartnerSection() {
  const { language } = useLanguage();
  const en = language === 'en';
  const p = homepagePartner;

  return (
    <section className="py-10 sm:py-14 border-t border-slate-100" aria-labelledby="partners-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="partners-heading" className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2">
          {en ? p.heading.en : p.heading.es}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto text-center mb-1">
          {en ? p.description.en : p.description.es}
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto text-center mb-5">
          {en
            ? 'Use ezLegal to help visitors understand issues, prepare summaries, and route urgent matters to human help.'
            : 'Usa ezLegal para ayudar a los visitantes a entender problemas, preparar resúmenes y derivar asuntos urgentes a ayuda humana.'}
        </p>

        <div className="grid gap-2 sm:grid-cols-2 max-w-md mx-auto mb-6">
          {p.capabilities.map((cap, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
              {en ? cap.en : cap.es}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            to={p.primaryHref}
            onClick={() => trackEvent('partner_demo_clicked', { source: 'homepage' })}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 no-underline"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            {en ? p.primaryCta.en : p.primaryCta.es}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to={p.secondaryHref}
              className="text-xs font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
            >
              {en ? p.secondaryCta.en : p.secondaryCta.es}
            </Link>
            <Link
              to="/for-organizations"
              onClick={() => trackEvent('partner_cta_clicked', { cta: 'explore_workflow' })}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
            >
              {en ? 'Explore partner workflow' : 'Explorar flujo de socios'}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
