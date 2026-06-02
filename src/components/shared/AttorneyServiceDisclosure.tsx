import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronDown, ChevronUp, Shield, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDisclosure } from '../../lib/legal-disclosures';

interface AttorneyServiceDisclosureProps {
  variant?: 'inline' | 'expandable' | 'compact';
  context?: 'directory' | 'matching' | 'issue-pack' | 'case-predictor' | 'dashboard' | 'general';
}

const CONTEXT_NOTE: Record<string, Record<string, string>> = {
  'issue-pack': {
    en: 'Issue Packs include informational attorney referrals. Referrals are not endorsements and do not guarantee representation.',
    es: 'Los Paquetes incluyen referencias informativas de abogados. No son recomendaciones ni garantizan representacion.',
  },
  'case-predictor': {
    en: 'Case Predictor provides statistical estimates, not attorney advice. Consult a licensed attorney before acting on predictions.',
    es: 'El Predictor de Casos proporciona estimaciones estadisticas, no consejo de abogado. Consulte un abogado antes de actuar.',
  },
  dashboard: {
    en: 'Attorney connections shown here are informational. Confirm engagement terms directly with any attorney.',
    es: 'Las conexiones con abogados son informativas. Confirme terminos directamente con cualquier abogado.',
  },
  directory: {
    en: 'This directory is for informational purposes. Listings are not endorsements by ezLegal.ai.',
    es: 'Este directorio es informativo. Los listados no son recomendaciones de ezLegal.ai.',
  },
  matching: {
    en: 'Matches are based on practice area, jurisdiction, and availability. No attorney pays for placement.',
    es: 'Los emparejamientos se basan en area de practica, jurisdicción y disponibilidad. Ningun abogado paga por aparecer.',
  },
  general: { en: '', es: '' },
};

export default function AttorneyServiceDisclosure({
  variant = 'inline',
  context = 'general',
}: AttorneyServiceDisclosureProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);

  const scopeText = getDisclosure('attorneyServiceScope', language);
  const noRelText = getDisclosure('attorneyNoRelationship', language);
  const feesText = getDisclosure('attorneyFeesSeparate', language);
  const geoText = getDisclosure('attorneyGeographicLimits', language);

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 text-xs text-navy-500">
        <Scale className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span>
          {noRelText}{' '}
          <Link to="/scope-disclaimers" className="underline text-teal-600 hover:text-teal-700">
            {en ? 'Full disclosures' : 'Divulgaciones completas'}
          </Link>
        </span>
      </div>
    );
  }

  if (variant === 'expandable') {
    return (
      <div className="border border-navy-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-navy-50 hover:bg-navy-100 transition-colors text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-navy-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-navy-700">
              {en ? 'Attorney Service Disclosures' : 'Divulgaciones de Servicios de Abogados'}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-navy-400" /> : <ChevronDown className="w-4 h-4 text-navy-400" />}
        </button>
        {expanded && (
          <div className="p-4 space-y-3 text-sm text-navy-600">
            {CONTEXT_NOTE[context]?.[language] && (
              <p className="font-medium text-navy-700">{CONTEXT_NOTE[context][language]}</p>
            )}
            <p>{scopeText}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="bg-navy-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-navy-700 mb-1">{en ? 'Fees' : 'Honorarios'}</p>
                <p className="text-xs">{feesText}</p>
              </div>
              <div className="bg-navy-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-navy-700 mb-1">{en ? 'Coverage' : 'Cobertura'}</p>
                <p className="text-xs">{geoText}</p>
              </div>
            </div>
            <Link to="/scope-disclaimers" className="inline-block text-xs text-teal-600 hover:text-teal-700 underline">
              {en ? 'View full scope disclaimers' : 'Ver divulgaciones completas'}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          {CONTEXT_NOTE[context]?.[language] && (
            <p className="text-sm font-semibold text-amber-800">{CONTEXT_NOTE[context][language]}</p>
          )}
          <p className="text-sm text-amber-700">{scopeText}</p>
          <p className="text-xs text-amber-600">{feesText} {geoText}</p>
          <Link to="/scope-disclaimers" className="inline-block text-xs text-teal-600 hover:text-teal-700 underline">
            {en ? 'View full scope disclaimers' : 'Ver divulgaciones completas'}
          </Link>
        </div>
      </div>
    </div>
  );
}
