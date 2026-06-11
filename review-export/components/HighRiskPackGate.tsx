import { useState } from 'react';
import { AlertTriangle, Phone, X, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDisclosure } from '../lib/legal-disclosures';
import type { Language } from '../lib/translations';
import { useLanguage } from '../contexts/LanguageContext';
import Bdi from './Bdi';

interface HighRiskPackGateProps {
  packName: string;
  packId: string;
  onContinue: () => void;
  onClose: () => void;
  language: string;
}

const urgencyIndicators: Record<string, { en: string[]; es: string[] }> = {
  immigration: {
    en: [
      'You have received a Notice to Appear (NTA) in immigration court',
      'You are in removal or deportation proceedings',
      'You are currently detained by ICE or CBP',
      'You have a court hearing date within 30 days',
      'You are facing an imminent visa expiration with no extension filed',
    ],
    es: [
      'Has recibido una Notificación de Comparecencia (NTA) en corte de inmigracion',
      'Estas en procedimientos de remocion o deportacion',
      'Estas actualmente detenido por ICE o CBP',
      'Tienes una fecha de audiencia en corte dentro de 30 dias',
      'Enfrentas una expiracion inminente de visa sin extension presentada',
    ],
  },
  housing: {
    en: [
      'You have received a formal eviction notice with a court date',
      'Your eviction hearing is within 14 days',
      'You are facing a lockout or utility shutoff',
      'You have been served with a writ of restitution',
      'You are experiencing unsafe or uninhabitable conditions',
    ],
    es: [
      'Has recibido un aviso formal de desalojo con fecha de corte',
      'Tu audiencia de desalojo es dentro de 14 dias',
      'Enfrentas un cierre de acceso o corte de servicios',
      'Has sido notificado con una orden de restitucion',
      'Estas experimentando condiciones inseguras o inhabitables',
    ],
  },
  family: {
    en: [
      'You or your children are in immediate danger (domestic violence)',
      'A custody hearing is scheduled within 14 days',
      'You need an emergency protective order',
      'Your child has been taken by CPS/DCS',
      'You are being denied court-ordered visitation rights',
    ],
    es: [
      'Tú o tus hijos están en peligro inmediato (violencia doméstica)',
      'Una audiencia de custodia está programada dentro de 14 días',
      'Necesitas una orden de protección de emergencia',
      'Tu hijo ha sido tomado por CPS/DCS',
      'Se te está negando la visitación ordenada por la corte',
    ],
  },
};

export default function HighRiskPackGate({ packName, packId, onContinue, onClose, language }: HighRiskPackGateProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const { t } = useLanguage();
  const lang = (language === 'es' ? 'es' : 'en') as Language;
  const isRtl = language === 'ar' || language === 'he';

  const indicators = urgencyIndicators[packId] || urgencyIndicators.housing;
  const items = lang === 'en' ? indicators.en : indicators.es;

  return (
    <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-auto">
        <div className="bg-amber-50 border-b border-amber-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-900">
                  {lang === 'en' ? 'Before You Continue' : 'Antes de Continuar'}
                </h2>
                <p className="text-sm text-navy-600">{packName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-navy-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-navy-700 mb-4 text-sm">
            {getDisclosure('selfHelpOnly', lang)}{' '}
            {getDisclosure('noAttorneyClient', lang)}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-red-800 text-sm mb-2">
              {lang === 'en'
                ? 'Stop and seek an attorney immediately if:'
                : 'Detente y busca un abogado inmediatamente si:'
              }
            </h3>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-navy-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-navy-900 mb-1">
                  {isRtl ? t('highRisk.immediateHelp') : (lang === 'en' ? 'Need immediate help?' : '¿Necesitas ayuda inmediata?')}
                </p>
                <p className="text-xs text-navy-600">
                  {isRtl ? (
                    <>
                      {t('crisisResources.call211')} <Bdi>LawHelp.org</Bdi>. {t('crisisResources.dvHotline')}: <Bdi>1-800-799-7233</Bdi>.
                    </>
                  ) : lang === 'en'
                    ? 'Call 211 or visit LawHelp.org for free legal assistance in your area. For domestic violence: National Hotline 1-800-799-7233.'
                    : 'Llama al 211 o visita LawHelp.org para asistencia legal gratuita en tu área. Para violencia doméstica: Línea Nacional 1-800-799-7233.'
                  }
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-navy-700">
              {lang === 'en'
                ? `I understand this pack provides legal information for self-help purposes only, not legal advice. I have reviewed the situations above and believe self-help materials are appropriate for my situation.`
                : `Entiendo que este paquete proporciona información legal solo para fines de autoayuda, no asesoramiento legal. He revisado las situaciones anteriores y creo que los materiales de autoayuda son apropiados para mi situación.`
              }
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/find-attorney"
              className="flex-1 flex items-center justify-center gap-2 bg-navy-100 hover:bg-navy-200 text-navy-700 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
              onClick={onClose}
            >
              {lang === 'en' ? 'Find a Lawyer Instead' : 'Buscar un Abogado'}
            </Link>
            <button
              onClick={onContinue}
              disabled={!acknowledged}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-colors text-sm ${
                acknowledged
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-navy-200 text-navy-400 cursor-not-allowed'
              }`}
            >
              <Shield className="w-4 h-4" />
              {lang === 'en' ? 'I Understand, Continue' : 'Entiendo, Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
