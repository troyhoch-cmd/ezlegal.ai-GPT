import { Phone, Globe, MapPin, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { LegalAidMatchResult } from '../../lib/legalAid/types';
import { LEGAL_AID_CAVEATS } from '../../lib/legalAid/types';

interface LegalAidReferralCardProps {
  result: LegalAidMatchResult;
  language: 'en' | 'es';
}

const REASON_LABELS: Record<string, { en: string; es: string }> = {
  serves_jurisdiction: { en: 'Serves your area', es: 'Sirve su área' },
  serves_county: { en: 'Serves your county', es: 'Sirve su condado' },
  supports_language: { en: 'Supports your language', es: 'Soporta su idioma' },
  spanish_priority: { en: 'Spanish available', es: 'Español disponible' },
  covers_issue_area: { en: 'Covers your issue type', es: 'Cubre su tipo de problema' },
  emergency_available: { en: 'Emergency help available', es: 'Ayuda de emergencia disponible' },
  free_legal_aid: { en: 'Free legal aid', es: 'Ayuda legal gratuita' },
  accepts_referrals: { en: 'Accepts referrals', es: 'Acepta referencias' },
  verified_organization: { en: 'Verified organization', es: 'Organización verificada' },
  recently_verified: { en: 'Recently verified', es: 'Verificada recientemente' },
};

export function LegalAidReferralCard({ result, language }: LegalAidReferralCardProps) {
  const { organization: org, matchReasons } = result;
  const caveats = LEGAL_AID_CAVEATS[language];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{org.name}</h4>
          {org.eligibilityNotes && (
            <p className="text-slate-500 text-xs mt-0.5">{org.eligibilityNotes}</p>
          )}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
          org.status === 'verified'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {org.status === 'verified'
            ? (language === 'es' ? 'Verificada' : 'Verified')
            : (language === 'es' ? 'Necesita verificación' : 'Needs verification')}
        </span>
      </div>

      {/* Match reasons */}
      <div className="flex flex-wrap gap-1.5">
        {matchReasons.map((reason) => (
          <span key={reason} className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            <CheckCircle className="w-3 h-3" />
            {REASON_LABELS[reason]?.[language] ?? reason}
          </span>
        ))}
      </div>

      {/* Contact info */}
      <div className="flex flex-wrap gap-4 text-sm">
        {org.phone && (
          <a href={`tel:${org.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 text-teal-600 hover:text-teal-800">
            <Phone className="w-3.5 h-3.5" />
            {org.phone}
          </a>
        )}
        {org.intakeUrl && (
          <a href={org.intakeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-800">
            <Globe className="w-3.5 h-3.5" />
            {language === 'es' ? 'Sitio web' : 'Website'}
          </a>
        )}
      </div>

      {/* Languages and area */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {org.languages.join(', ')}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {org.statesServed.join(', ')}
          {org.countiesServed && ` (${org.countiesServed.join(', ')})`}
        </span>
        {org.lastVerifiedAt && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {language === 'es' ? 'Verificada:' : 'Verified:'} {new Date(org.lastVerifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Disclaimer */}
      {org.disclaimer && (
        <p className="text-slate-400 text-xs flex items-start gap-1.5">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          {org.disclaimer}
        </p>
      )}

      {/* What to expect */}
      <div className="bg-slate-50 rounded p-2.5 text-xs text-slate-600">
        <p className="font-medium mb-1">
          {language === 'es' ? '¿Qué esperar?' : 'What to expect:'}
        </p>
        <ul className="space-y-0.5">
          <li className="flex items-start gap-1">
            <span className="text-slate-400 mt-0.5">1.</span>
            {language === 'es' ? 'Contacte a la organización directamente' : 'Contact the organization directly'}
          </li>
          <li className="flex items-start gap-1">
            <span className="text-slate-400 mt-0.5">2.</span>
            {language === 'es' ? 'Ellos determinarán su elegibilidad' : 'They will determine your eligibility'}
          </li>
          <li className="flex items-start gap-1">
            <span className="text-slate-400 mt-0.5">3.</span>
            {language === 'es' ? 'Puede haber una lista de espera' : 'There may be a waitlist'}
          </li>
        </ul>
      </div>

      {/* Caveat */}
      <p className="text-slate-400 text-xs border-t border-slate-100 pt-2">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        {caveats.notProvider}
      </p>
    </div>
  );
}
