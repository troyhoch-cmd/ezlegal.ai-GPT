import { Phone, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CategoryResource {
  messageKey: string;
  detailKey: string;
  hotline?: { label: string; number: string };
}

const CATEGORY_RESOURCES: Record<string, CategoryResource> = {
  'Housing Law': {
    messageKey: 'urgent.housingMessage',
    detailKey: 'urgent.housingDetail',
    hotline: { label: 'HUD Housing Counseling', number: '1-800-569-4287' },
  },
  'Family Law': {
    messageKey: 'urgent.familyMessage',
    detailKey: 'urgent.familyDetail',
    hotline: { label: 'National DV Hotline', number: '1-800-799-7233' },
  },
};

const CATEGORY_NAME_MAP: Record<string, string> = {
  'Derecho de Vivienda': 'Housing Law',
  'Derecho Laboral': 'Employment Law',
  'Proteccion al Consumidor': 'Consumer Protection',
  'Derecho Familiar': 'Family Law',
  'Testamentos y Sucesiones': 'Wills & Probate',
  'Derecho Civil': 'Civil Law',
};

interface UrgentHelpBannerProps {
  category: string | null;
}

export default function UrgentHelpBanner({ category }: UrgentHelpBannerProps) {
  const { t } = useLanguage();

  if (!category) return null;

  const dbCategory = CATEGORY_NAME_MAP[category] || category;
  const resource = CATEGORY_RESOURCES[dbCategory];
  if (!resource) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-navy-900 text-sm">{t(resource.messageKey)}</p>
          <p className="text-navy-600 text-xs mt-0.5">{t(resource.detailKey)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {resource.hotline && (
          <a
            href={`tel:${resource.hotline.number.replace(/-/g, '')}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {resource.hotline.number}
          </a>
        )}
        <a
          href="/emergency-resources"
          className="inline-flex items-center gap-2 px-4 py-2 border border-navy-300 text-navy-700 rounded-lg text-sm font-semibold hover:bg-navy-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {t('urgent.allResources')}
        </a>
      </div>
    </div>
  );
}
