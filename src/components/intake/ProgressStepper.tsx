import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: { en: string; es: string }[];
}

export default function ProgressStepper({ currentStep, totalSteps, labels }: ProgressStepperProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="w-full mb-6" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={en ? `Step ${currentStep} of ${totalSteps}` : `Paso ${currentStep} de ${totalSteps}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">
          {en ? `Step ${currentStep} of ${totalSteps}` : `Paso ${currentStep} de ${totalSteps}`}
        </span>
        <span className="text-sm text-slate-500">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentStep ? 'bg-teal-600' : i === currentStep ? 'bg-teal-300' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {labels && labels[currentStep - 1] && (
        <p className="text-sm text-slate-600 mt-2 font-medium">
          {en ? labels[currentStep - 1].en : labels[currentStep - 1].es}
        </p>
      )}
    </div>
  );
}

export function StepIndicator({ step, total, completed }: { step: number; total: number; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-teal-600 flex items-center justify-center">
          <span className="text-xs font-bold text-teal-600">{step}</span>
        </div>
      )}
      <span className="text-xs text-slate-500">{step}/{total}</span>
    </div>
  );
}
