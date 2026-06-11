import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, AlertTriangle, Heart, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getRouteMeta, isHighRiskRoute, shouldShowDisclaimer, shouldShowLegalAidEscalation } from '../config/routes';

const DISCLAIMER_DISMISSED_KEY = 'ezlegal-disclaimer-dismissed';
const HIGH_RISK_ACK_KEY = 'ezlegal-high-risk-ack';

export default function RouteDisclaimerBanner() {
  const { language } = useLanguage();
  const location = useLocation();
  const en = language === 'en';
  const path = location.pathname;

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem(DISCLAIMER_DISMISSED_KEY);
      return stored === 'true';
    } catch { return false; }
  });

  const meta = getRouteMeta(path);
  if (!meta) return null;

  const showDisclaimer = shouldShowDisclaimer(path);
  const showEscalation = shouldShowLegalAidEscalation(path);
  const highRisk = isHighRiskRoute(path);

  if (!showDisclaimer && !showEscalation) return null;
  if (dismissed && !highRisk) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true'); } catch { /* ignore */ }
  };

  return (
    <div className={`border-b px-4 py-2 ${highRisk ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {highRisk ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          )}
          <p className={`text-xs ${highRisk ? 'text-amber-800' : 'text-slate-600'}`}>
            {en
              ? 'ezLegal.ai provides legal information, not legal advice. AI output may be incomplete. Consult a licensed attorney for your specific situation.'
              : 'ezLegal.ai proporciona información legal, no asesoría legal. La IA puede ser incompleta. Consulte a un abogado licenciado para su situación.'}
            {' '}
            <Link to="/scope-disclaimers" className="underline hover:text-slate-900 font-medium">
              {en ? 'Scope' : 'Alcance'}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showEscalation && (
            <Link
              to="/find-attorney"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
            >
              <Heart className="w-3 h-3" aria-hidden="true" />
              {en ? 'Free/low-cost help' : 'Ayuda gratuita'}
            </Link>
          )}
          {!highRisk && (
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
              aria-label={en ? 'Dismiss' : 'Cerrar'}
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HighRiskAcknowledgment({ onAcknowledge }: { onAcknowledge: () => void }) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {en ? 'Before you continue' : 'Antes de continuar'}
          </h2>
        </div>
        <div className="space-y-3 mb-6 text-sm text-slate-600">
          <p>{en
            ? 'This tool uses AI to analyze legal situations. Please understand:'
            : 'Esta herramienta usa IA para analizar situaciones legales. Por favor entienda:'}</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{en ? 'ezLegal.ai is not a law firm.' : 'ezLegal.ai no es un bufete de abogados.'}</li>
            <li>{en ? 'AI output may be wrong or incomplete.' : 'La IA puede estar equivocada o incompleta.'}</li>
            <li>{en ? 'This does not create an attorney-client relationship.' : 'Esto no crea una relación abogado-cliente.'}</li>
            <li>{en ? 'You should consult a qualified attorney for legal advice.' : 'Debe consultar a un abogado calificado para asesoría legal.'}</li>
            <li>{en ? 'Emergency issues require immediate professional help.' : 'Problemas de emergencia requieren ayuda profesional inmediata.'}</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              try {
                localStorage.setItem(HIGH_RISK_ACK_KEY, new Date().toISOString());
              } catch { /* ignore */ }
              onAcknowledge();
            }}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {en ? 'I understand, continue' : 'Entiendo, continuar'}
          </button>
          <Link
            to="/find-attorney"
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-center hover:bg-slate-50 transition-colors text-sm"
          >
            {en ? 'Find a lawyer instead' : 'Buscar un abogado'}
          </Link>
        </div>
        <div className="mt-3 flex justify-center gap-3 text-xs text-slate-500">
          <Link to="/scope-disclaimers" className="underline hover:text-slate-700">
            {en ? 'Full disclaimers' : 'Avisos completos'}
          </Link>
          <Link to="/emergency-resources" className="underline hover:text-slate-700">
            {en ? 'Emergency resources' : 'Recursos de emergencia'}
          </Link>
        </div>
      </div>
    </div>
  );
}
