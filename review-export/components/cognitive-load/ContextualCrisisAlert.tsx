import { useState, useEffect, useCallback } from 'react';
import { Phone, Heart, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export type CrisisSignal = 'self_harm' | 'domestic_violence' | 'homelessness' | 'emergency';

interface CrisisConfig {
  title: string;
  titleEs: string;
  message: string;
  messageEs: string;
  primaryAction: {
    label: string;
    labelEs: string;
    phone?: string;
    href?: string;
  };
  color: string;
  bgColor: string;
}

const CRISIS_CONFIGS: Record<CrisisSignal, CrisisConfig> = {
  self_harm: {
    title: 'You Are Not Alone',
    titleEs: 'No Estas Solo/a',
    message: 'Free, confidential support is available 24/7.',
    messageEs: 'Apoyo gratuito y confidencial disponible 24/7.',
    primaryAction: {
      label: 'Call 988 Now',
      labelEs: 'Llamar 988 Ahora',
      phone: '988',
    },
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  domestic_violence: {
    title: 'Safety Resources Available',
    titleEs: 'Recursos de Seguridad Disponibles',
    message: 'Trained advocates are ready to help 24/7.',
    messageEs: 'Defensores capacitados estan listos para ayudar 24/7.',
    primaryAction: {
      label: 'National DV Hotline',
      labelEs: 'Linea Nacional de VD',
      phone: '1-800-799-7233',
    },
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
  homelessness: {
    title: 'Housing Help Available',
    titleEs: 'Ayuda de Vivienda Disponible',
    message: 'Connect with housing resources and emergency shelter.',
    messageEs: 'Conectese con recursos de vivienda y refugio de emergencia.',
    primaryAction: {
      label: 'Find Local Help',
      labelEs: 'Encontrar Ayuda Local',
      href: '/emergency-resources',
    },
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  emergency: {
    title: 'Need Immediate Help?',
    titleEs: 'Necesita Ayuda Inmediata?',
    message: 'Crisis resources are available.',
    messageEs: 'Hay recursos de crisis disponibles.',
    primaryAction: {
      label: 'View Resources',
      labelEs: 'Ver Recursos',
      href: '/emergency-resources',
    },
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
};

const CRISIS_KEYWORDS: Record<CrisisSignal, string[]> = {
  self_harm: [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'self harm',
    'no reason to live',
    'better off dead',
  ],
  domestic_violence: [
    'domestic violence',
    'abusive relationship',
    'partner abuse',
    'hit me',
    'hurting me',
    'restraining order',
    'protective order',
    'scared of',
    'abuser',
  ],
  homelessness: [
    'homeless',
    'evicted',
    'kicked out',
    'nowhere to go',
    'living in car',
    'on the street',
    'about to lose my home',
    'eviction notice',
  ],
  emergency: [],
};

interface ContextualCrisisAlertProps {
  messages: Array<{ content: string; role: 'user' | 'assistant' }>;
  forceShow?: CrisisSignal;
  onDismiss?: () => void;
  className?: string;
}

export function detectCrisisSignal(text: string): CrisisSignal | null {
  const lowerText = text.toLowerCase();

  for (const [signal, keywords] of Object.entries(CRISIS_KEYWORDS) as [CrisisSignal, string[]][]) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return signal;
    }
  }

  return null;
}

export default function ContextualCrisisAlert({
  messages,
  forceShow,
  onDismiss,
  className = '',
}: ContextualCrisisAlertProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [dismissed, setDismissed] = useState(false);
  const [detectedSignal, setDetectedSignal] = useState<CrisisSignal | null>(null);

  useEffect(() => {
    if (forceShow) {
      setDetectedSignal(forceShow);
      setDismissed(false);
      return;
    }

    const userMessages = messages.filter((m) => m.role === 'user');
    for (const msg of userMessages.slice(-3)) {
      const signal = detectCrisisSignal(msg.content);
      if (signal) {
        setDetectedSignal(signal);
        setDismissed(false);
        return;
      }
    }
  }, [messages, forceShow]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (!detectedSignal || dismissed) {
    return null;
  }

  const config = CRISIS_CONFIGS[detectedSignal];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${config.bgColor} border-2 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence'
            ? 'bg-rose-100'
            : detectedSignal === 'homelessness'
            ? 'bg-amber-100'
            : 'bg-red-100'
        }`}>
          {detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence' ? (
            <Heart className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
          ) : (
            <AlertTriangle className={`w-5 h-5 ${config.color}`} aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${config.color}`}>
            {en ? config.title : config.titleEs}
          </h4>
          <p className="text-sm text-slate-600 mt-0.5">
            {en ? config.message : config.messageEs}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {config.primaryAction.phone ? (
              <a
                href={`tel:${config.primaryAction.phone}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  detectedSignal === 'self_harm' || detectedSignal === 'domestic_violence'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {en ? config.primaryAction.label : config.primaryAction.labelEs}
              </a>
            ) : config.primaryAction.href ? (
              <Link
                to={config.primaryAction.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  detectedSignal === 'emergency'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {en ? config.primaryAction.label : config.primaryAction.labelEs}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : null}

            <Link
              to="/emergency-resources"
              className="text-sm text-slate-600 hover:text-slate-800 underline"
            >
              {en ? 'All crisis resources' : 'Todos los recursos de crisis'}
            </Link>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
          aria-label={en ? 'Dismiss alert' : 'Cerrar alerta'}
        >
          <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
