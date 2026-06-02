import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { recordConsent } from '../lib/consent';

const STORAGE_KEY = 'ezlegal-consent-banner-v1';

const EU_EEA_UK_TIMEZONES = [
  'Europe/',
  'Atlantic/Azores',
  'Atlantic/Canary',
  'Atlantic/Faroe',
  'Atlantic/Madeira',
  'Atlantic/Reykjavik',
];

function likelyEU(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    return EU_EEA_UK_TIMEZONES.some((prefix) => tz.startsWith(prefix));
  } catch {
    return false;
  }
}

export default function ConsentBanner() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const en = language === 'en';

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    if (!likelyEU()) return;
    setVisible(true);
  }, []);

  const dismiss = (granted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? 'accept' : 'decline');
    } catch {
      // ignore
    }
    void recordConsent({
      consentType: 'privacy_notice',
      source: 'eu_banner',
      language,
      userId: user?.id ?? null,
      granted,
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={en ? 'Privacy notice' : 'Aviso de privacidad'}
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-navy-200 bg-white shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex items-start gap-3 flex-1">
          <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="text-sm text-navy-800 leading-relaxed">
            <p className="font-semibold text-navy-900 mb-1">
              {en ? 'We respect your privacy' : 'Respetamos tu privacidad'}
            </p>
            <p>
              {en
                ? 'We use essential cookies to run the site. We do not set advertising or cross-site tracking cookies. Review our '
                : 'Usamos cookies esenciales para operar el sitio. No usamos cookies de publicidad ni rastreo entre sitios. Consulta nuestra '}
              <Link to="/privacy-at-a-glance" className="underline text-teal-700 hover:text-teal-800">
                {en ? 'privacy summary' : 'resumen de privacidad'}
              </Link>
              {'.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <button
            type="button"
            onClick={() => dismiss(false)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold text-navy-800 border border-navy-300 hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-navy-400"
          >
            {en ? 'Decline non-essential' : 'Rechazar no esenciales'}
          </button>
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {en ? 'Accept' : 'Aceptar'}
          </button>
          <button
            type="button"
            onClick={() => dismiss(false)}
            aria-label={en ? 'Close' : 'Cerrar'}
            className="sm:hidden absolute top-2 right-2 p-1 text-navy-500 hover:text-navy-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
