import { Save, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SaveAndResumeNoticeProps {
  variant?: 'inline' | 'banner';
  showPrivacyNote?: boolean;
}

export default function SaveAndResumeNotice({ variant = 'inline', showPrivacyNote = true }: SaveAndResumeNoticeProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (variant === 'banner') {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <Save className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-teal-800">
            {en ? 'Your progress is saved automatically' : 'Tu progreso se guarda automáticamente'}
          </p>
          <p className="text-xs text-teal-700 mt-1">
            {en
              ? 'You can close this page and come back later. Your answers will still be here.'
              : 'Puedes cerrar esta página y regresar después. Tus respuestas seguirán aquí.'}
          </p>
          {showPrivacyNote && (
            <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" aria-hidden="true" />
              {en
                ? 'Saved only on this device. Not sent to any server.'
                : 'Guardado solo en este dispositivo. No se envía a ningún servidor.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="text-xs text-slate-500 flex items-center gap-1.5">
      <Save className="w-3.5 h-3.5" aria-hidden="true" />
      {en ? 'Progress saved on this device' : 'Progreso guardado en este dispositivo'}
    </p>
  );
}
