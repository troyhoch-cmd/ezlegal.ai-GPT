import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Info, ChevronDown, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface UnifiedTrustStripProps {
  jurisdiction?: string;
  onChangeJurisdiction?: () => void;
  onDismiss?: () => void;
  persistDismissal?: boolean;
}

const STORAGE_KEY = 'ezlegal-trust-dismissed';

export default function UnifiedTrustStrip({
  jurisdiction,
  onChangeJurisdiction,
  onDismiss,
  persistDismissal = true,
}: UnifiedTrustStripProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (persistDismissal) {
      const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (wasDismissed === 'true') {
        setDismissed(true);
      }
    }
  }, [persistDismissal]);

  const handleDismiss = () => {
    setDismissed(true);
    if (persistDismissal) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div
      className="bg-slate-50 border-b border-slate-200 transition-all duration-200"
      role="region"
      aria-label={en ? 'Trust and safety information' : 'Información de confianza y seguridad'}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          aria-expanded={expanded}
          aria-controls="trust-details"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="font-medium">
              {en ? 'AI legal information' : 'Información legal IA'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1.5 text-xs">
              <Lock className="w-3 h-3 text-green-600" aria-hidden="true" />
              {en ? 'Encrypted' : 'Encriptado'}
            </span>
            {jurisdiction && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-xs font-medium text-navy-700">
                  {jurisdiction} {en ? 'law' : 'ley'}
                </span>
                {onChangeJurisdiction && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChangeJurisdiction(); }}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium underline underline-offset-2"
                  >
                    {en ? 'Change' : 'Cambiar'}
                  </button>
                )}
              </>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          aria-label={en ? 'Dismiss trust banner' : 'Cerrar banner de confianza'}
        >
          <X className="w-4 h-4 text-slate-400" aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div
          id="trust-details"
          className="px-4 pb-3 animate-in slide-in-from-top-1 duration-200"
        >
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {en ? 'Legal Information Only' : 'Solo Información Legal'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {en
                      ? 'This is not legal advice. No attorney-client relationship is formed.'
                      : 'Esto no es asesoramiento legal. No se forma relacion abogado-cliente.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-green-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {en ? 'AES-256 Encrypted' : 'Encriptado AES-256'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {en
                      ? 'Your conversations are encrypted and can be deleted anytime.'
                      : 'Sus conversaciones estan encriptadas y pueden eliminarse en cualquier momento.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/trust-center"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                {en ? 'Trust Center' : 'Centro de Confianza'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
              <Link
                to="/privacy"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                {en ? 'Privacy & Deletion' : 'Privacidad y Eliminacion'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
              <Link
                to="/scope-disclaimers"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                {en ? 'Full Disclaimers' : 'Descargos Completos'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
