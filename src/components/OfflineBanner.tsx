import { WifiOff, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../contexts/LanguageContext';

const COPY = {
  en: {
    offline: "You're offline. Some features are unavailable; changes will sync when you're back online.",
    restored: "You're back online. Syncing your changes now.",
  },
  es: {
    offline: 'Estas sin conexion. Algunas funciones no estan disponibles; los cambios se sincronizaran al regresar.',
    restored: 'Conexion restablecida. Sincronizando tus cambios.',
  },
};

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const { language } = useLanguage();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const copy = COPY[language === 'es' ? 'es' : 'en'];

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      return;
    }
    if (wasOffline) {
      setShowRestored(true);
      const t = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);

  if (!online) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 bg-amber-100 border border-amber-300 text-amber-900"
      >
        <WifiOff className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium">{copy.offline}</p>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 bg-teal-50 border border-teal-300 text-teal-900"
      >
        <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium">{copy.restored}</p>
      </div>
    );
  }

  return null;
}
