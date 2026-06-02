import { useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { LegalReadinessWizard, ChecklistDownload } from '../components/gtm';
import { track } from '../lib/gtm-analytics';

export default function LegalReadinessChecklist() {
  useEffect(() => { track('page_view', { page: 'legal_readiness_checklist' }); }, []);

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Legal Readiness Check</h1>
            <p className="text-teal-100 text-lg mb-6">
              Answer a few questions to get personalized recommendations for your legal workflow.
              Or download the full checklist directly.
            </p>
            <ChecklistDownload />
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">Guided Readiness Assessment</h2>
            <p className="text-navy-600 text-center mb-8">Complete this 5-step wizard to get a tailored legal readiness report.</p>
            <LegalReadinessWizard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
