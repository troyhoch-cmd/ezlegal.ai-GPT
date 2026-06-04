import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { homepageSMB } from '../../data/homepageContent';
import { trackEvent } from '../../services/analytics-service';

export function SMBConversionSection() {
  const { language } = useLanguage();
  const en = language === 'en';
  const s = homepageSMB;

  return (
    <section className="py-10 sm:py-14 border-t border-slate-100" aria-labelledby="smb-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="smb-heading" className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2">
          {en ? s.heading.en : s.heading.es}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto text-center mb-1">
          {en ? s.description.en : s.description.es}
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto text-center mb-5">
          {en
            ? 'Check contracts, leases, payment disputes, and workplace questions before you decide your next step.'
            : 'Revisa contratos, arrendamientos, disputas de pago y preguntas laborales antes de decidir tu próximo paso.'}
        </p>

        <div className="grid gap-2 sm:grid-cols-2 max-w-md mx-auto mb-6">
          {s.capabilities.map((cap, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" aria-hidden="true" />
              {en ? cap.en : cap.es}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={s.primaryHref}
            onClick={() => trackEvent('smb_issue_started', { source: 'homepage' })}
            className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 no-underline"
          >
            <Briefcase className="w-4 h-4" aria-hidden="true" />
            {en ? s.primaryCta.en : s.primaryCta.es}
          </Link>
          <Link
            to={s.secondaryHref}
            className="text-xs font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded no-underline"
          >
            {en ? s.secondaryCta.en : s.secondaryCta.es}
          </Link>
        </div>
      </div>
    </section>
  );
}
