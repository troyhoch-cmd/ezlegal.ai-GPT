import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { safetyCopy } from '../../data/safetyCopy';
import { trackUrgentResourcesOpened } from '../EthicalAnalytics';
import { trackEvent } from '../../services/analytics-service';

export function UrgentStrip() {
  const { language } = useLanguage();
  const en = language === 'en';
  const c = safetyCopy.urgentStrip;

  function handleClick() {
    trackUrgentResourcesOpened();
    trackEvent('urgent_strip_click', { source: 'home_strip' });
  }

  return (
    <section className="bg-rose-50 border-b border-rose-100" aria-label={en ? 'Urgent deadline or danger' : 'Plazo urgente o peligro'}>
      {/* Mobile: single-line compact */}
      <div className="sm:hidden mx-auto max-w-3xl px-4 py-1 flex items-center gap-1.5 justify-center">
        <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" aria-hidden="true" />
        <Link
          to="/urgent-resources"
          onClick={handleClick}
          className="text-[11px] text-rose-700 font-semibold underline underline-offset-2 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded min-h-[44px] inline-flex items-center"
        >
          {en ? 'Urgent? View emergency resources' : '\u00bfUrgente? Recursos de emergencia'}
        </Link>
      </div>

      {/* Desktop: full layout */}
      <div className="hidden sm:flex mx-auto max-w-3xl px-6 py-2.5 items-center gap-3 justify-center">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-rose-700 font-medium">
            {en ? c.heading.en : c.heading.es}
          </p>
        </div>
        <p className="text-[11px] text-rose-600">
          {en ? c.examples.en : c.examples.es}
        </p>
        <Link
          to="/urgent-resources"
          onClick={handleClick}
          className="inline-flex items-center gap-1 rounded-full bg-rose-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-800 transition focus:outline-none focus:ring-2 focus:ring-rose-500 whitespace-nowrap no-underline"
        >
          {en ? c.cta.en : c.cta.es}
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
