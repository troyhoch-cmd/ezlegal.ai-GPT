import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFloatingChrome } from '../contexts/FloatingChromeContext';
import { dismiss as dismissSurface, isDismissed as isDismissedRemote } from '../services/ui-preferences-service';

const DISMISSED_KEY = 'ezlegal.pwa.installDismissedAt';
const COOLDOWN_DAYS = 14;

const COPY = {
  en: {
    title: 'Install ezLegal',
    body: 'Add ezLegal to your home screen for one-tap access, even offline.',
    install: 'Install app',
    later: 'Not now',
    close: 'Dismiss install prompt',
  },
  es: {
    title: 'Instalar ezLegal',
    body: 'Anade ezLegal a tu pantalla de inicio para acceso con un toque, incluso sin conexion.',
    install: 'Instalar app',
    later: 'Ahora no',
    close: 'Cerrar solicitud de instalacion',
  },
};

function isDismissed(): boolean {
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < COOLDOWN_DAYS * 24 * 3600 * 1000;
}

export default function PWAInstallPrompt() {
  const { canInstall, promptInstall } = usePWAInstall();
  const { language } = useLanguage();
  const { user } = useAuth();
  const chrome = useFloatingChrome('pwa_install');
  const [visible, setVisible] = useState(false);
  const copy = COPY[language === 'es' ? 'es' : 'en'];

  useEffect(() => {
    let cancelled = false;
    if (!canInstall) return;
    (async () => {
      if (isDismissed()) return;
      const remote = await isDismissedRemote('pwa_install', user?.id ?? null);
      if (cancelled || remote) return;
      const t = setTimeout(() => {
        if (!cancelled) {
          setVisible(true);
          chrome.claim();
        }
      }, 4000);
      return () => clearTimeout(t);
    })();
    return () => {
      cancelled = true;
      chrome.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canInstall, user?.id]);

  if (!canInstall || !visible || !chrome.canShow) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    dismissSurface('pwa_install', user?.id ?? null);
    setVisible(false);
    chrome.release();
  };

  const install = async () => {
    const outcome = await promptInstall();
    if (outcome !== 'accepted') {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      dismissSurface('pwa_install', user?.id ?? null);
    }
    setVisible(false);
    chrome.release();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-body"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[90] rounded-xl shadow-lg border overflow-hidden"
      style={{
        backgroundColor: 'var(--surface-card)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--accent-teal)', color: '#fff' }}
          >
            <Download className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="pwa-install-title" className="text-base font-semibold">
              {copy.title}
            </h2>
            <p id="pwa-install-body" className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {copy.body}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2"
                style={{ backgroundColor: 'var(--accent-teal)', color: '#fff' }}
              >
                {copy.install}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {copy.later}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={copy.close}
            className="p-1 rounded hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
