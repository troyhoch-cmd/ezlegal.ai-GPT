import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, ArrowRight, Flag } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BeforeYouType from '../components/BeforeYouType';
import { governanceSections, governanceDisclaimer, reportProblemCTA } from '../data/governanceCopy';
import { sourceConfidenceLevels } from '../data/aiSafety';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';

export default function AISafety() {
  const { language } = useLanguage();
  const en = language === 'en';

  useEffect(() => {
    trackEvent('page_view', { path: '/ai-safety' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        <section className="pt-24 sm:pt-32 pb-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span className="text-sm font-medium text-teal-800">
                {en ? 'AI Safety & Governance' : 'Seguridad y Gobernanza de IA'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
              {en ? 'How we use AI responsibly' : 'C\u00f3mo usamos la IA de manera responsable'}
            </h1>

            <p className="text-slate-600 leading-relaxed mb-6">
              {en
                ? 'This page describes what our AI does, what it does not do, and how we handle safety, privacy, and limitations. We update this as our practices evolve.'
                : 'Esta p\u00e1gina describe qu\u00e9 hace nuestra IA, qu\u00e9 no hace, y c\u00f3mo manejamos la seguridad, privacidad y limitaciones. Actualizamos esto a medida que nuestras pr\u00e1cticas evolucionan.'}
            </p>

            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-600">
                {en ? governanceDisclaimer.en : governanceDisclaimer.es}
              </p>
            </div>

            <BeforeYouType />
          </div>
        </section>

        {/* Governance sections */}
        <section className="pb-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
            {governanceSections.map((section) => (
              <div key={section.id} className="border border-slate-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  {section.status === 'implemented' ? (
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <h2 className="text-lg font-bold text-slate-900">
                    {en ? section.title.en : section.title.es}
                  </h2>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed ml-8">
                  {en ? section.content.en : section.content.es}
                </p>
                {section.status === 'pending-review' && section.statusNote && (
                  <div className="mt-3 ml-8 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 font-medium">
                      {en ? 'Pending legal/security review' : 'Pendiente de revisi\u00f3n legal/seguridad'}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {en ? section.statusNote.en : section.statusNote.es}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Source confidence */}
        <section className="py-10 bg-slate-50 border-y border-slate-200" aria-labelledby="confidence-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="confidence-heading" className="text-lg font-bold text-slate-900 mb-4">
              {en ? 'Source confidence indicators' : 'Indicadores de confianza de fuente'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {en
                ? 'When AI provides information, we indicate confidence levels:'
                : 'Cuando la IA proporciona informaci\u00f3n, indicamos niveles de confianza:'}
            </p>
            <div className="space-y-2">
              {sourceConfidenceLevels.map((level) => (
                <div key={level.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    level.color === 'slate' ? 'bg-slate-400' :
                    level.color === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} aria-hidden="true" />
                  <span className="text-sm text-slate-800">{en ? level.label.en : level.label.es}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Report a problem + footer links */}
        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <Link
              to="/contact?subject=ai-problem"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition no-underline mb-6 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              {en ? reportProblemCTA.en : reportProblemCTA.es}
            </Link>

            <p className="text-sm text-slate-500 mb-4">
              {en ? 'Questions about our AI practices?' : '\u00bfPreguntas sobre nuestras pr\u00e1cticas de IA?'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/trust-center"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition no-underline focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {en ? 'Trust Center' : 'Centro de Confianza'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition no-underline focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {en ? 'Contact Us' : 'Cont\u00e1ctanos'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
