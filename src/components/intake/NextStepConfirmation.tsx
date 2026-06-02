import { CheckCircle, ArrowRight, Clock, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface NextStep {
  iconType: 'clock' | 'file' | 'users' | 'check';
  textEn: string;
  textEs: string;
}

interface NextStepConfirmationProps {
  titleEn?: string;
  titleEs?: string;
  steps?: NextStep[];
  primaryAction?: { labelEn: string; labelEs: string; to: string };
  secondaryAction?: { labelEn: string; labelEs: string; to: string };
}

const DEFAULT_STEPS: NextStep[] = [
  { iconType: 'check', textEn: 'Your information has been received', textEs: 'Tu información ha sido recibida' },
  { iconType: 'clock', textEn: 'We are preparing your summary', textEs: 'Estamos preparando tu resumen' },
  { iconType: 'file', textEn: 'You will see possible next steps', textEs: 'Verás posibles próximos pasos' },
  { iconType: 'users', textEn: 'You can choose free help, documents, or attorney options', textEs: 'Puedes elegir ayuda gratis, documentos u opciones de abogados' },
];

const ICON_MAP = { clock: Clock, file: FileText, users: Users, check: CheckCircle };

export default function NextStepConfirmation({
  titleEn = 'What happens next',
  titleEs = 'Qué sigue',
  steps = DEFAULT_STEPS,
  primaryAction,
  secondaryAction,
}: NextStepConfirmationProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{en ? titleEn : titleEs}</h2>
      </div>

      <ol className="space-y-4 mb-6">
        {steps.map((step, i) => {
          const Icon = ICON_MAP[step.iconType];
          return (
            <li key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase">{en ? `Step ${i + 1}` : `Paso ${i + 1}`}</span>
                <p className="text-sm text-slate-700 mt-0.5">{en ? step.textEn : step.textEs}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col sm:flex-row gap-3">
        {primaryAction && (
          <Link
            to={primaryAction.to}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            {en ? primaryAction.labelEn : primaryAction.labelEs}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {secondaryAction && (
          <Link
            to={secondaryAction.to}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            {en ? secondaryAction.labelEn : secondaryAction.labelEs}
          </Link>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
        {en
          ? 'ezLegal provides legal information and tools, not legal advice. For legal advice, contact a licensed attorney.'
          : 'ezLegal proporciona información y herramientas legales, no asesoría legal. Para asesoría legal, contacte a un abogado licenciado.'}
      </p>
    </div>
  );
}
