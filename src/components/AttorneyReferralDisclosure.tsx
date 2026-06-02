import { useState } from 'react';
import { Users, MapPin, Clock, AlertTriangle, ChevronDown, ChevronUp, Shield, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface AttorneyReferralDisclosureProps {
  variant?: 'inline' | 'expandable';
}

export default function AttorneyReferralDisclosure({ variant = 'expandable' }: AttorneyReferralDisclosureProps) {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(variant === 'inline');

  const content = (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">
              {language === 'en' ? 'How Matching Works' : 'Como Funciona'}
            </h4>
            <p className="text-xs text-navy-600">
              {language === 'en'
                ? 'We match based on practice area, jurisdiction, and availability from our network of independent attorneys.'
                : 'Hacemos la conexion basada en area de practica, jurisdicción y disponibilidad de nuestra red de abogados independientes.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">
              {language === 'en' ? 'Geographic Coverage' : 'Cobertura Geografica'}
            </h4>
            <p className="text-xs text-navy-600">
              {language === 'en'
                ? 'Coverage varies by state and practice area. We currently have the strongest coverage in Arizona, California, and Texas.'
                : 'La cobertura varia por estado y area de practica. Actualmente tenemos la mejor cobertura en Arizona, California y Texas.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">
              {language === 'en' ? 'Referral Timeline' : 'Tiempo de Referencia'}
            </h4>
            <p className="text-xs text-navy-600">
              {language === 'en'
                ? 'You\'ll receive 1-3 attorney profiles within 48 hours of purchase. Response times vary by attorney.'
                : 'Recibiras 1-3 perfiles de abogados dentro de 48 horas de la compra. Los tiempos de respuesta varian.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-900">
              {language === 'en' ? 'Your Choice, No Obligation' : 'Tu Decision, Sin Obligacion'}
            </h4>
            <p className="text-xs text-navy-600">
              {language === 'en'
                ? 'Referrals are informational only. You decide whether to contact any attorney. No obligation to hire.'
                : 'Las referencias son solo informativas. Tu decides si contactar a un abogado. Sin obligacion de contratar.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-semibold mb-1">
              {language === 'en' ? 'Important Disclosures' : 'Divulgaciones Importantes'}
            </p>
            <ul className="space-y-1">
              <li>
                {language === 'en'
                  ? 'Referrals are not endorsements. We do not guarantee attorney quality or outcomes.'
                  : 'Las referencias no son endosos. No garantizamos calidad de abogados ni resultados.'}
              </li>
              <li>
                {language === 'en'
                  ? 'Attorney fees are separate from Issue Pack pricing and are set by each attorney.'
                  : 'Los honorarios del abogado son separados del precio del paquete y son fijados por cada abogado.'}
              </li>
              <li>
                {language === 'en'
                  ? 'If no match is available in your area, we\'ll provide alternative resources.'
                  : 'Si no hay coincidencia en tu area, proporcionaremos recursos alternativos.'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/find-attorney"
          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          {language === 'en' ? 'Browse our attorney directory' : 'Explorar nuestro directorio de abogados'} &rarr;
        </Link>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="bg-white border border-navy-200 rounded-xl p-6">
        <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-600" />
          {language === 'en' ? 'How Attorney Referral Works' : 'Como Funciona la Referencia a Abogado'}
        </h3>
        {content}
      </div>
    );
  }

  return (
    <div className="border border-navy-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-navy-50 hover:bg-navy-100 transition-colors text-left"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 font-semibold text-navy-900 text-sm">
          <Shield className="w-4 h-4 text-teal-600" />
          {language === 'en' ? 'How Attorney Referral Works' : 'Como Funciona la Referencia a Abogado'}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-navy-500" /> : <ChevronDown className="w-4 h-4 text-navy-500" />}
      </button>
      {expanded && (
        <div className="p-4 bg-white border-t border-navy-200">
          {content}
        </div>
      )}
    </div>
  );
}
