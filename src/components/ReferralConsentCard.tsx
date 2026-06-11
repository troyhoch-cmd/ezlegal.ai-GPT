import { useState } from 'react';
import { CheckCircle, AlertTriangle, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackReferralConsentViewed } from './EthicalAnalytics';

interface Props {
  onConsent: (consented: boolean, consentSource?: string) => void;
  clientName?: string;
}

export default function ReferralConsentCard({ onConsent }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [agreed, setAgreed] = useState(false);

  useState(() => {
    trackReferralConsentViewed();
  });

  const handleSubmit = () => {
    onConsent(agreed, agreed ? 'explicit_opt_in_intake_form' : undefined);
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
          <p className="text-xs font-medium text-slate-800 mb-1.5">
            {en ? 'What will be shared:' : 'Lo que se compartirá:'}
          </p>
          <ul className="text-xs text-slate-700 leading-relaxed space-y-0.5">
            <li>{en ? '- Issue category and urgency level' : '- Categoría del problema y nivel de urgencia'}</li>
            <li>{en ? '- Jurisdiction (state/county)' : '- Jurisdicción (estado/condado)'}</li>
            <li>{en ? '- Preferred language' : '- Idioma preferido'}</li>
            <li>{en ? '- AI-generated structured summary (no free-text narratives)' : '- Resumen estructurado generado por IA (sin narrativas de texto libre)'}</li>
          </ul>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {en
              ? 'Your name, phone, email, and address are NOT shared unless you explicitly opt in below.'
              : 'Tu nombre, teléfono, correo y dirección NO se comparten a menos que lo autorices explícitamente a continuación.'}
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
              ? 'I consent to sharing my structured intake summary with the organization for staff review.'
              : 'Doy mi consentimiento para compartir mi resumen de admisión estructurado con la organización para revision del personal.'}
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

      <div className="mt-3 flex items-start gap-1.5 text-[10px] text-slate-500">
        <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span>
          {en
            ? 'Consent is timestamped and logged. You can revoke consent at any time by contacting us. Your data is not shared until you confirm.'
            : 'El consentimiento se registra con marca de tiempo. Puedes revocar tu consentimiento en cualquier momento contactándonos. Tus datos no se comparten hasta que confirmes.'}
        </span>
      </div>
    </div>
  );
}
