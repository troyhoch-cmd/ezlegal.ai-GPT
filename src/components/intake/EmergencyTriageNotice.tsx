import { AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmergencyTriageNoticeProps {
  variant?: 'banner' | 'card';
  showDVHotline?: boolean;
  showLegalAid?: boolean;
}

export default function EmergencyTriageNotice({ variant = 'banner', showDVHotline = true, showLegalAid = true }: EmergencyTriageNoticeProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (variant === 'card') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5" role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-2">
              {en ? 'Are you in immediate danger?' : 'Estás en peligro inmediato?'}
            </h3>
            <p className="text-sm text-red-800 mb-4">
              {en
                ? 'If you are in danger, call 911. If you need help with domestic violence or a legal emergency, these resources are free and confidential.'
                : 'Si estás en peligro, llama al 911. Si necesitas ayuda con violencia doméstica o una emergencia legal, estos recursos son gratuitos y confidenciales.'}
            </p>
            <div className="space-y-2">
              {showDVHotline && (
                <a
                  href="tel:18007997233"
                  className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {en ? 'National DV Hotline: 1-800-799-7233' : 'Línea Nacional de VD: 1-800-799-7233'}
                </a>
              )}
              {showLegalAid && (
                <Link
                  to="/emergency-resources"
                  className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  {en ? 'View emergency resources' : 'Ver recursos de emergencia'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-lg" role="alert">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-red-800 font-medium">
          {en ? 'In danger? Call 911.' : 'En peligro? Llama al 911.'}
          {' '}
          <Link to="/emergency-resources" className="underline hover:text-red-900">
            {en ? 'Free help available' : 'Ayuda gratuita disponible'}
          </Link>
        </p>
      </div>
    </div>
  );
}
