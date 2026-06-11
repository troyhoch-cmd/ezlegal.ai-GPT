import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Phone, LogOut, ExternalLink, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

type Category = 'eviction' | 'ice' | 'dv' | 'other';

interface Props {
  onAcknowledge: () => void;
}

const COPY = {
  en: {
    title: 'Before we continue — this is not emergency assistance',
    intro:
      'If you or someone else is in immediate danger, please call or text a hotline below. AI is not a substitute for emergency services.',
    chooseLabel: 'What best describes your situation?',
    eviction: 'Housing / eviction',
    ice: 'Immigration / ICE',
    dv: 'Domestic violence or safety',
    other: 'Another urgent legal issue',
    quickExit: 'Quick exit (leave this page now)',
    call911: 'Life-threatening? Call 911',
    ack: 'I understand. Show me resources.',
    dvNotice:
      'For your safety, close this page or use Quick Exit at any time. We will not save the details of your situation.',
    dvHotline: 'National DV Hotline: 1-800-799-7233 (24/7, confidential)',
    iceHotline: 'Immigration: United We Dream Deportation Defense 1-844-363-1423',
    evictionHotline: 'Eviction help: Find legal aid at lsc.gov or 2-1-1',
  },
  es: {
    title: 'Antes de continuar — esto no es asistencia de emergencia',
    intro:
      'Si tú u otra persona están en peligro inmediato, llama o envía un mensaje a una línea de ayuda abajo. La IA no reemplaza a los servicios de emergencia.',
    chooseLabel: '¿Qué describe mejor tu situación?',
    eviction: 'Vivienda / desalojo',
    ice: 'Inmigración / ICE',
    dv: 'Violencia doméstica o seguridad',
    other: 'Otro problema legal urgente',
    quickExit: 'Salida rápida (sal de esta página ahora)',
    call911: '¿Peligro de vida? Llama al 911',
    ack: 'Entiendo. Muéstrame los recursos.',
    dvNotice:
      'Por tu seguridad, cierra esta página o usa Salida rápida en cualquier momento. No guardaremos los detalles de tu situación.',
    dvHotline: 'Línea Nacional contra la Violencia Doméstica: 1-800-799-7233 (24/7, confidencial)',
    iceHotline: 'Inmigración: United We Dream Deportation Defense 1-844-363-1423',
    evictionHotline: 'Ayuda con desalojos: busca asistencia legal en lsc.gov o 2-1-1',
  },
};

export default function CrisisTriageGate({ onAcknowledge }: Props) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = COPY[language === 'es' ? 'es' : 'en'];
  const [category, setCategory] = useState<Category | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('crisis_triage_sessions')
      .insert({
        user_id: user?.id ?? null,
        language: language === 'es' ? 'es' : 'en',
      })
      .select('id')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.id) sessionIdRef.current = data.id;
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, language]);

  const updateSession = (patch: Record<string, unknown>) => {
    const id = sessionIdRef.current;
    if (!id) return;
    supabase.from('crisis_triage_sessions').update(patch).eq('id', id).then(() => {});
  };

  const handleCategory = (c: Category) => {
    setCategory(c);
    updateSession({ category: c, updated_at: new Date().toISOString() });
  };

  const handleQuickExit = () => {
    updateSession({ quick_exit_used: true });
    try {
      window.location.replace('https://www.google.com/search?q=weather');
    } catch {
      window.location.href = 'https://www.google.com';
    }
  };

  const handleAck = () => {
    updateSession({ acknowledged_not_emergency: true, resource_viewed: true });
    onAcknowledge();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy-900/90 backdrop-blur-sm">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-red-200">
          <div className="flex items-center gap-3 rounded-t-2xl bg-red-50 border-b border-red-200 p-5">
            <ShieldAlert className="h-6 w-6 text-red-600 flex-shrink-0" aria-hidden="true" />
            <h1 className="text-lg sm:text-xl font-bold text-red-900 leading-snug">{t.title}</h1>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <p className="text-sm sm:text-base text-navy-800 leading-relaxed">{t.intro}</p>

            <a
              href="tel:911"
              className="flex items-center justify-between gap-3 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-3 font-semibold min-h-[56px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              <span className="flex items-center gap-2">
                <Phone className="h-5 w-5" aria-hidden="true" />
                {t.call911}
              </span>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>

            <div>
              <p className="text-sm font-semibold text-navy-900 mb-2">{t.chooseLabel}</p>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {(
                  [
                    ['eviction', t.eviction],
                    ['ice', t.ice],
                    ['dv', t.dv],
                    ['other', t.other],
                  ] as Array<[Category, string]>
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategory(key)}
                    className={`text-left rounded-lg border px-4 py-3 text-sm font-medium min-h-[44px] transition-colors ${
                      category === key
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-navy-900 border-navy-200 hover:border-teal-500 hover:bg-teal-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {category === 'dv' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p>{t.dvNotice}</p>
                </div>
                <p className="font-semibold">{t.dvHotline}</p>
                <button
                  type="button"
                  onClick={handleQuickExit}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-900 text-white px-4 py-2 text-sm font-semibold hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2 min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t.quickExit}
                </button>
              </div>
            )}

            {category === 'ice' && (
              <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 text-sm text-teal-900">
                <p className="font-semibold">{t.iceHotline}</p>
              </div>
            )}

            {category === 'eviction' && (
              <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 text-sm text-teal-900">
                <p className="font-semibold">{t.evictionHotline}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAck}
                disabled={!category}
                className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-navy-200 disabled:text-navy-500 text-white px-4 py-3 font-semibold min-h-[56px] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-colors"
              >
                {t.ack}
              </button>
              <button
                type="button"
                onClick={handleQuickExit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-300 text-navy-800 hover:bg-navy-50 px-4 py-3 font-semibold min-h-[56px] focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t.quickExit}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
