import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';

interface ChatPrivacyGateProps {
  onAccept: () => void;
}

const STORAGE_KEY = 'ezlegal-chat-privacy-accepted';

export default function ChatPrivacyGate({ onAccept }: ChatPrivacyGateProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const accepted = sessionStorage.getItem(STORAGE_KEY);
    if (accepted === 'true') {
      onAccept();
    }
  }, [onAccept]);

  function handleContinue() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    trackEvent('intake_started', { source: 'privacy_gate', language });
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-teal-700" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {en ? 'Before you begin' : 'Antes de comenzar'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              {en
                ? 'This tool provides legal information, not legal advice. No attorney-client relationship is created by using this service.'
                : 'Esta herramienta proporciona informacion legal, no asesoramiento legal. No se crea una relacion abogado-cliente al usar este servicio.'}
            </p>
          </div>

          <div className="flex gap-3 p-3 bg-slate-50 rounded-lg">
            <Lock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-medium">
                {en ? 'Your privacy:' : 'Su privacidad:'}
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>
                  {en
                    ? '- Conversations are encrypted and deletable anytime'
                    : '- Las conversaciones estan encriptadas y se pueden eliminar en cualquier momento'}
                </li>
                <li>
                  {en
                    ? '- Do not share Social Security numbers, passwords, or financial account numbers'
                    : '- No comparta numeros de Seguro Social, contrasenas ni numeros de cuentas financieras'}
                </li>
                <li>
                  {en
                    ? '- You can request full data deletion at any time'
                    : '- Puede solicitar la eliminacion completa de datos en cualquier momento'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
            {en
              ? 'I understand this is legal information only, not legal advice, and I will not share highly sensitive personal data.'
              : 'Entiendo que esto es solo informacion legal, no asesoramiento legal, y no compartire datos personales altamente sensibles.'}
          </span>
        </label>

        <button
          onClick={handleContinue}
          disabled={!acknowledged}
          className="w-full py-3 px-4 bg-teal-700 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-800 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {en ? 'Continue to AI Assistant' : 'Continuar al Asistente de IA'}
        </button>

        <div className="text-center">
          <a
            href="/privacy"
            className="text-xs text-slate-500 hover:text-teal-700 inline-flex items-center gap-1"
          >
            {en ? 'Full Privacy Policy' : 'Politica de Privacidad Completa'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
