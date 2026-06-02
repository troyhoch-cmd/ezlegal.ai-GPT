import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../../lib/gtm-content';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border border-navy-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-navy-50 transition-colors"
              aria-expanded={openIndex === i}
            >
              <span className="font-semibold text-navy-900 pr-4">{item.q}</span>
              <ChevronDown className={`w-5 h-5 text-navy-500 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-sm text-navy-600 leading-relaxed animate-in fade-in duration-150">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
