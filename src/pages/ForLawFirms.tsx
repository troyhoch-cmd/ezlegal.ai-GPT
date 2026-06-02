import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ICP_CONTENT } from '../lib/gtm-content';
import { LegalReadinessWizard, FAQSection } from '../components/gtm';
import { track } from '../lib/gtm-analytics';
import { useEffect } from 'react';

const content = ICP_CONTENT.law_firms;

export default function ForLawFirms() {
  useEffect(() => { track('page_view', { page: 'for_law_firms' }); }, []);

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-teal-600/20 text-teal-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              For Law Firms
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              Standardize intake. Qualify faster. Prepare structured summaries.
            </h1>
            <p className="text-lg text-navy-200 mb-8 max-w-2xl mx-auto">{content.outcome}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resources/legal-readiness-checklist"
                onClick={() => track('cta_click', { cta: 'lawfirms_hero_primary' })}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg text-lg"
              >
                {content.cta} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => track('demo_click', { source: 'lawfirms_hero' })}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-lg"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-4 text-center">The Problem</h2>
            <p className="text-lg text-navy-700 text-center mb-8">{content.pain}</p>
            <h3 className="text-lg font-semibold text-navy-800 mb-4">Common use cases:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.useCases.map((uc) => (
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
            <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">See How It Works for Your Firm</h2>
            <p className="text-navy-600 text-center mb-8">Answer a few questions to see how intake automation fits your practice.</p>
            <LegalReadinessWizard />
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Frequently Asked Questions</h2>
            <FAQSection />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
