import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackLanguageSelected } from '../EthicalAnalytics';
import { track } from '../../lib/gtm-analytics';
import { trackEvent } from '../../services/analytics-service';

export function MobileStickyBar() {
  const { language, setLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);
  const en = language === 'en';

  useEffect(() => {
    const target = document.querySelector('[data-hero-primary-cta]');
    if (!target) { setVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function handleSpanish() {
    setLanguage('es');
    trackLanguageSelected('es');
    track('home_cta_clicked', { cta: 'espanol' });
    trackEvent('home_cta_clicked', { cta: 'espanol' });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-2.5 flex items-center gap-2" aria-label={en ? 'Mobile actions' : 'Acciones móviles'}>
      <Link
        to="/start"
        onClick={() => trackEvent('mobile_sticky_start_click', {})}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white no-underline focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {en ? 'Start free 2-minute checkup' : 'Comenzar revisión gratis de 2 minutos'}
      </Link>
      <button
        type="button"
        onClick={handleSpanish}
        className="inline-flex items-center justify-center rounded-full border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        Español
      </button>
    </div>
  );
}
