import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { pricingFAQ } from '../../data/pricing';
import { trackEngagement } from '../../services/engagement-service';

interface Props {
  language: 'en' | 'es';
}

export default function PricingFAQ({ language }: Props) {
  const l = language === 'es' ? 'es' : 'en';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    const next = openIndex === i ? null : i;
    setOpenIndex(next);
    if (next !== null) {
      trackEngagement({
        featureName: 'pricing_faq_opened',
        engagementType: 'click',
        metadata: { question: pricingFAQ[i].q.en },
      });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8">
          {l === 'es' ? 'Preguntas frecuentes' : 'Frequently asked questions'}
        </h2>
        <div className="space-y-3">
          {pricingFAQ.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-3 p-5 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                aria-expanded={openIndex === i}
                aria-controls={`pricing-faq-panel-${i}`}
                id={`pricing-faq-btn-${i}`}
              >
                <span className="font-semibold text-navy-900 text-sm sm:text-base">{faq.q[l]}</span>
                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" aria-hidden="true" />
                )}
              </button>
              {openIndex === i && (
                <div
                  id={`pricing-faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`pricing-faq-btn-${i}`}
                  className="px-5 pb-5 bg-slate-50 border-t border-slate-200"
                >
                  <p className="text-sm text-navy-600 leading-relaxed pt-4">{faq.a[l]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
