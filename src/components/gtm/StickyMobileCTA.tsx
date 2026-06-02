import { Link } from 'react-router-dom';
import { track } from '../../lib/gtm-analytics';

export default function StickyMobileCTA() {
  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-40 bg-white border-t border-navy-200 p-3 flex gap-3 sm:hidden shadow-lg">
      <Link
        to="/resources/legal-readiness-checklist"
        onClick={() => track('cta_click', { cta: 'mobile_free_check' })}
        className="flex-1 bg-teal-600 text-white text-center py-2.5 rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors"
      >
        Free Check
      </Link>
      <Link
        to="/schedule-demo"
        onClick={() => track('demo_click', { source: 'mobile_sticky' })}
        className="flex-1 border-2 border-navy-200 text-navy-800 text-center py-2.5 rounded-lg font-semibold text-sm hover:border-teal-600 transition-colors"
      >
        Demo
      </Link>
    </div>
  );
}
