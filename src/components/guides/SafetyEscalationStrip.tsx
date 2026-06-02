import { Phone, Scale, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SafetyEscalationStrip() {
  const { t } = useLanguage();

  return (
    <div className="bg-navy-50 border-b border-navy-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span className="text-xs text-navy-500 font-medium hidden sm:inline">
            {t('safety.needMore')}
          </span>
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center">
            <Link
              to="/emergency-resources"
              className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-red-600 font-medium transition-colors group"
            >
              <Phone className="w-3.5 h-3.5 text-navy-400 group-hover:text-red-500 transition-colors" />
              {t('safety.urgentHelp')}
            </Link>
            <span className="w-px h-4 bg-navy-200" aria-hidden="true" />
            <Link
              to="/pro-bono"
              className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-teal-600 font-medium transition-colors group"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-navy-400 group-hover:text-teal-500 transition-colors" />
              {t('safety.freeLegalAid')}
            </Link>
            <span className="w-px h-4 bg-navy-200" aria-hidden="true" />
            <Link
              to="/find-attorney"
              className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-teal-600 font-medium transition-colors group"
            >
              <Scale className="w-3.5 h-3.5 text-navy-400 group-hover:text-teal-500 transition-colors" />
              {t('safety.findLawyer')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
