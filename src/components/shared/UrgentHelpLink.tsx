import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { track } from '../../lib/gtm-analytics';
import { trackEvent } from '../../services/analytics-service';
import { trackUrgentResourcesOpened } from '../EthicalAnalytics';

interface UrgentHelpLinkProps {
  variant?: 'strip' | 'inline' | 'button';
  source?: string;
}

export function UrgentHelpLink({
  variant = 'button',
  source = 'unknown',
}: UrgentHelpLinkProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  function handleClick() {
    trackUrgentResourcesOpened();
    track('urgent_resources_clicked', { source });
    trackEvent('urgent_resources_clicked', { source });
  }

  if (variant === 'inline') {
    return (
      <Link
        to="/urgent-resources"
        onClick={handleClick}
        className="text-rose-600 underline hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
      >
        {en ? 'urgent resources' : 'recursos urgentes'}
      </Link>
    );
  }

  return (
    <Link
      to="/urgent-resources"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full bg-rose-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-800 transition focus:outline-none focus:ring-2 focus:ring-rose-500 whitespace-nowrap no-underline"
    >
      {en ? 'Get help now' : 'Obtener ayuda ahora'}
      <ArrowRight className="w-3 h-3" aria-hidden="true" />
    </Link>
  );
}
