import { CheckCircle, ArrowRight, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ICP_CONTENT } from '../lib/gtm-content';
import { LegalReadinessWizard, FAQSection } from '../components/gtm';
import { track } from '../lib/gtm-analytics';
import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const content = ICP_CONTENT.law_firms;

const UI: Record<'en' | 'es', {
  badge: string;
  h1: string;
  pain: string;
  outcome: string;
  cta: string;
  demo: string;
  problemH2: string;
  useCasesH3: string;
  wizardH2: string;
  wizardP: string;
  faqH2: string;
  useCases: string[];
}> = {
  en: {
    badge: 'For Law Firms',
    h1: 'Standardize intake. Qualify faster. Prepare structured summaries.',
    pain: content.pain,
    outcome: content.outcome,
    cta: content.cta,
    demo: 'Book a demo',
    problemH2: 'The Problem',
    useCasesH3: 'Common use cases:',
    wizardH2: 'See How It Works for Your Firm',
    wizardP: 'Answer a few questions to see how intake automation fits your practice.',
    faqH2: 'Frequently Asked Questions',
    useCases: content.useCases,
  },
  es: {
    badge: 'Para Bufetes de Abogados',
    h1: 'Estandarice la admisión. Califique más rápido. Prepare resúmenes estructurados.',
    pain: 'La admisión, recolección de documentos y resúmenes iniciales consumen tiempo no facturable.',
    outcome: 'Estandarice la admisión de clientes, califique asuntos más rápido y prepare resúmenes estructurados para revisión de abogados.',
    cta: 'Ver automatización de admisión para bufetes',
    demo: 'Reservar una demo',
    problemH2: 'El Problema',
    useCasesH3: 'Casos de uso comunes:',
    wizardH2: 'Vea Cómo Funciona para Su Bufete',
    wizardP: 'Responda algunas preguntas para ver cómo la automatización de admisión se adapta a su práctica.',
    faqH2: 'Preguntas Frecuentes',
    useCases: [
      'Automatización de admisión de clientes',
      'Cuestionarios de paquetes de tarifa fija',
      'Admisión de revisión de contratos',
      'Admisión de patrimonio/formación empresarial',
      'Organización de documentos de descubrimiento',
    ],
  },
};

export default function ForLawFirms() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const t = UI[lang];

  useEffect(() => { track('page_view', { page: 'for_law_firms' }); }, []);

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-teal-600/20 text-teal-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {t.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              {t.h1}
            </h1>
            <p className="text-lg text-navy-200 mb-8 max-w-2xl mx-auto">{t.outcome}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resources/legal-readiness-checklist"
                onClick={() => track('cta_click', { cta: 'lawfirms_hero_primary' })}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg text-lg"
              >
                {t.cta} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => track('demo_click', { source: 'lawfirms_hero' })}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-lg"
              >
                {t.demo}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-8 flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                {lang === 'en'
                  ? 'ezLegal.ai provides legal information, not legal advice. We are not a law firm and do not replace licensed attorneys.'
                  : 'ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados y no reemplazamos a abogados licenciados.'}
              </p>
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">{t.problemH2}</h2>
            <p className="text-lg text-navy-700 text-center mb-8">{t.pain}</p>
            <h3 className="text-lg font-semibold text-navy-800 mb-4">{t.useCasesH3}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.useCases.map((uc) => (
                <div key={uc} className="flex items-center gap-3 p-4 bg-navy-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-navy-800">{uc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-navy-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">{t.wizardH2}</h2>
            <p className="text-navy-600 text-center mb-8">{t.wizardP}</p>
            <LegalReadinessWizard />
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">{t.faqH2}</h2>
            <FAQSection />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
