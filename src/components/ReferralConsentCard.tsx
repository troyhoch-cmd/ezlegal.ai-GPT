import { useState } from 'react';
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackReferralConsentViewed } from './EthicalAnalytics';

interface Props {
  onConsent: (consented: boolean) => void;
  clientName?: string;
}

export default function ReferralConsentCard({ onConsent, clientName }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [agreed, setAgreed] = useState(false);

  useState(() => {
    trackReferralConsentViewed();
  });

  const handleSubmit = () => {
    onConsent(agreed);
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 max-w-lg" role="region" aria-labelledby="referral-consent-title">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h3 id="referral-consent-title" className="font-semibold text-slate-900 text-sm">
            {en ? 'Referral consent' : 'Consentimiento de referencia'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {en
              ? 'Before we share your intake summary with a legal-aid organization, we need your permission.'
              : 'Antes de compartir tu resumen de admisión con una organización de ayuda legal, necesitamos tu permiso.'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-white rounded border border-amber-100 p-3">
          <p className="text-xs text-slate-700 leading-relaxed">
            {en
              ? 'I understand that my intake summary (issue type, urgency level, state, and preferred language) will be shared with the selected organization so they can assess whether they can help me. My free-text description will NOT be shared unless I check the box below.'
              : 'Entiendo que mi resumen de admisión (tipo de problema, nivel de urgencia, estado e idioma preferido) se compartirá con la organización seleccionada para que puedan evaluar si pueden ayudarme. Mi descripción en texto libre NO se compartirá a menos que marque la casilla a continuación.'}
          </p>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
            aria-describedby="consent-detail"
          />
          <span id="consent-detail" className="text-xs text-slate-700">
            {en
              ? 'I consent to sharing my structured intake summary with the organization.'
              : 'Doy mi consentimiento para compartir mi resumen de admisión estructurado con la organización.'}
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!agreed}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          {en ? 'Confirm and share' : 'Confirmar y compartir'}
        </button>
        <button
          type="button"
          onClick={() => onConsent(false)}
          className="text-xs text-slate-500 hover:text-slate-700 underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
        >
          {en ? 'Skip referral' : 'Omitir referencia'}
        </button>
      </div>

      <p className="mt-3 text-[10px] text-slate-500 flex items-start gap-1">
        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        {en
          ? 'You can revoke consent at any time by contacting us. Your data is not shared until you confirm.'
          : 'Puedes revocar tu consentimiento en cualquier momento contactándonos. Tus datos no se comparten hasta que confirmes.'}
      </p>
    </div>
  );
}
