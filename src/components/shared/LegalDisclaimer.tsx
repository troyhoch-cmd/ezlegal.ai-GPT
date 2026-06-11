import { Info, AlertTriangle, Lock, UserX, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDisclosure } from '../../lib/legal-disclosures';
import type { DisclosureKey } from '../../lib/legal-disclosures';

type Variant = 'banner' | 'inline' | 'card' | 'footer';

interface LegalDisclaimerProps {
  variant?: Variant;
  keys?: DisclosureKey[];
  jurisdiction?: string;
  showLinks?: boolean;
  className?: string;
}

const DEFAULT_KEYS: DisclosureKey[] = ['notAdvice', 'noAttorneyClient', 'consultAttorney'];

export default function LegalDisclaimer({
  variant = 'inline',
  keys = DEFAULT_KEYS,
  jurisdiction,
  showLinks = false,
  className = '',
}: LegalDisclaimerProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const texts = keys.map(key => getDisclosure(key, language));

  if (variant === 'banner') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">
              {en ? 'Important Disclaimer' : 'Aviso Importante'}
            </h4>
            <div className="text-xs text-amber-800 space-y-1">
              {texts.map((text, i) => (
                <p key={i}>{i === 0 ? <strong>{text}</strong> : text}</p>
              ))}
              {jurisdiction && (
                <p>
                  {en
                    ? <>Information is tailored to <strong>{jurisdiction}</strong> law where possible.</>
                    : <>La información esta adaptada a la ley de <strong>{jurisdiction}</strong> cuando es posible.</>}
                </p>
              )}
            </div>
            {showLinks && (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link to="/scope-disclaimers" className="text-xs text-amber-700 hover:underline font-medium">
                  {en ? 'Full Disclaimers' : 'Descargos Completos'}
                </Link>
                <Link to="/trust-center" className="text-xs text-amber-700 hover:underline font-medium">
                  {en ? 'Trust Center' : 'Centro de Confianza'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-slate-50 rounded-xl p-4 space-y-3 text-sm text-slate-700 ${className}`}>
        <p><strong>{getDisclosure('notAdvice', language)}</strong></p>
        <ul className="space-y-2 pl-4">
          {keys.filter(k => k !== 'notAdvice').map(key => (
            <li key={key} className="flex items-start gap-2">
              <span className="text-slate-400">-</span>
              <span>{getDisclosure(key, language)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-navy-600 ${className}`}>
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{getDisclosure('notAdvice', language)}</span>
        </div>
        <div className="flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{en ? 'AES-256 encrypted' : 'Encriptado AES-256'}</span>
        </div>
        <div className="flex items-start gap-2">
          <UserX className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{getDisclosure('noPrivilege', language)}</span>
        </div>
        <div className="flex items-start gap-2">
          <Trash2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <Link to="/privacy" className="text-teal-600 hover:underline">
            {en ? 'Data retention & deletion' : 'Retencion y eliminacion de datos'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <p className={`text-xs text-slate-500 text-center ${className}`}>
      {texts.join(' ')}
    </p>
  );
}
