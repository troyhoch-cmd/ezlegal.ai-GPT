import { Shield, Trash2, Download, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface DataUseAndPrivacyCardProps {
  variant?: 'card' | 'compact' | 'inline';
  className?: string;
}

export default function DataUseAndPrivacyCard({
  variant = 'card',
  className = '',
}: DataUseAndPrivacyCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const content = {
    title: en ? 'Your Data & Privacy' : 'Sus Datos y Privacidad',
    dataUse: en
      ? 'We use your input only to generate your results. We do not sell or share your data.'
      : 'Usamos su información solo para generar sus resultados. No vendemos ni compartimos sus datos.',
    noTraining: en
      ? 'We do not train AI on your case details unless you explicitly opt in.'
      : 'No entrenamos la IA con los detalles de su caso a menos que usted lo autorice explícitamente.',
    controls: en
      ? 'You can delete or export your data at any time.'
      : 'Puede eliminar o exportar sus datos en cualquier momento.',
    privacy: en ? 'Privacy Policy' : 'Política de Privacidad',
    delete: en ? 'Delete My Data' : 'Eliminar Mis Datos',
    export: en ? 'Export My Data' : 'Exportar Mis Datos',
  };

  if (variant === 'inline') {
    return (
      <p
        data-testid="data-use-privacy-card"
        className={`text-xs text-slate-500 flex items-center gap-1.5 ${className}`}
      >
        <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{content.noTraining}</span>
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        data-testid="data-use-privacy-card"
        className={`bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 ${className}`}
      >
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-slate-600 space-y-0.5">
            <p>{content.dataUse}</p>
            <p className="font-medium">{content.noTraining}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="data-use-privacy-card"
      className={`bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 ${className}`}
      role="note"
      aria-label={content.title}
    >
      <div className="flex items-start gap-3">
        <div className="bg-slate-200 rounded-lg p-2 flex-shrink-0">
          <Shield className="w-5 h-5 text-slate-700" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm mb-2">{content.title}</h4>
          <div className="space-y-1.5 text-xs text-slate-700">
            <p>{content.dataUse}</p>
            <p className="font-medium">{content.noTraining}</p>
            <p>{content.controls}</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
            >
              <Lock className="w-3 h-3" aria-hidden="true" />
              {content.privacy}
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              {content.delete}
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Download className="w-3 h-3" aria-hidden="true" />
              {content.export}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
