import { Phone, Heart, ExternalLink, Users, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCrisisResources } from '../../lib/legal-disclosures';
import type { CrisisResource } from '../../lib/legal-disclosures';
import Bdi from '../Bdi';

interface CrisisResourceCardProps {
  variant?: 'full' | 'compact' | 'inline';
  filterType?: CrisisResource['type'];
  showAttorneyLinks?: boolean;
}

export default function CrisisResourceCard({
  variant = 'full',
  filterType,
  showAttorneyLinks = true,
}: CrisisResourceCardProps) {
  const { language, t } = useLanguage();
  const en = language === 'en';
  const isRtl = language === 'ar' || language === 'he';
  const resources = getCrisisResources(language, filterType);

  const label = (enStr: string, esStr: string, tKey?: string) => {
    if (isRtl && tKey) {
      const v = t(tKey);
      if (v && v !== tKey) return v;
    }
    return en ? enStr : esStr;
  };

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        <a
          href="tel:988"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Phone className="w-3 h-3" aria-hidden="true" />
          <Bdi>988</Bdi>
        </a>
        <a
          href="tel:1-800-799-7233"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Heart className="w-3 h-3" aria-hidden="true" />
          {label('DV Hotline', 'Linea de VD', 'crisisResources.dvHotline')}
        </a>
        <Link
          to="/emergency-resources"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-300 text-red-700 text-xs font-semibold rounded-lg"
        >
          {label('All Crisis Resources', 'Todos los Recursos de Crisis', 'crisisResources.title')}
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        <a
          href="tel:988"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          <Bdi>988</Bdi>
        </a>
        <a
          href="tel:1-800-799-7233"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4" aria-hidden="true" />
          {label('DV Hotline', 'Linea de Violencia Domestica', 'crisisResources.dvHotline')}
        </a>
        <Link
          to="/emergency-resources"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors"
        >
          {label('All Resources', 'Todos los Recursos', 'crisisResources.title')}
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6" role="alert">
      <div className="flex items-start gap-3 mb-4">
        <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-bold text-red-900">
            {label('Your Safety Comes First', 'Tu Seguridad es lo Primero', 'crisisResources.title')}
          </h3>
          <p className="text-sm text-red-800 mt-1">
            {isRtl ? (
              <>
                {t('crisisResources.call911')} {t('crisisResources.call211')}
              </>
            ) : en
              ? <>If you or someone you know is in immediate danger, please contact emergency services (<Bdi>911</Bdi>) or one of these resources.</>
              : <>Si usted o alguien que conoce esta en peligro inmediato, contacte los servicios de emergencia (<Bdi>911</Bdi>) o uno de estos recursos.</>}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {resources.map((resource) => (
          <div key={resource.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
            <div>
              <div className="font-medium text-stone-900 text-sm">{resource.name}</div>
              <div className="flex items-center gap-1 text-red-700 text-sm font-semibold">
                <Phone className="w-3 h-3" aria-hidden="true" />
                <Bdi>{resource.phone}</Bdi>
              </div>
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
              aria-label={`${resource.name} (opens in new tab)`}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        ))}
      </div>

      {showAttorneyLinks && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Link
            to="/pro-bono"
            className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-green-700">
                {label('Free Legal Aid', 'Ayuda Legal Gratuita', 'nav.freeChat')}
              </span>
            </div>
          </Link>
          <Link
            to="/find-attorney"
            className="flex items-start gap-3 p-3 bg-white border border-red-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                {label('Find an Attorney', 'Encontrar un Abogado', 'nav.findAttorney')}
              </span>
            </div>
          </Link>
        </div>
      )}

      <Link
        to="/emergency-resources"
        className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
      >
        {label('View all crisis resources', 'Ver todos los recursos de crisis', 'crisisResources.title')}
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
