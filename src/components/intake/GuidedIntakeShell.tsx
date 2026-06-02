import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ICP, TriageRiskLevel, HumanEscalationType } from '../../lib/intake/types';
import { SCOPE_DISCLAIMER } from '../../lib/intake/scopeBoundaries';
import ProgressStepper from './ProgressStepper';
import SaveAndResumeNotice from './SaveAndResumeNotice';
import EmergencyTriageNotice from './EmergencyTriageNotice';
import ScopeBoundaryCard from '../trust/ScopeBoundaryCard';

interface GuidedIntakeShellProps {
  children: ReactNode;
  icp: ICP;
  currentStep: number;
  totalSteps: number;
  stepLabels?: { en: string; es: string }[];
  showEmergency?: boolean;
  showSaveNotice?: boolean;
  showScopeBoundary?: boolean;
  onBack?: () => void;
  onSave?: () => void;
  onEscalate?: (type: HumanEscalationType, risk: TriageRiskLevel) => void;
  titleEn?: string;
  titleEs?: string;
}

export default function GuidedIntakeShell({
  children,
  icp: _icp,
  currentStep,
  totalSteps,
  stepLabels,
  showEmergency = false,
  showSaveNotice = true,
  showScopeBoundary = false,
  onBack,
  onSave,
  onEscalate: _onEscalate,
  titleEn,
  titleEs,
}: GuidedIntakeShellProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {showEmergency && (
        <div className="mb-4">
          <EmergencyTriageNotice variant="banner" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          {onBack && currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              aria-label={en ? 'Go back to previous step' : 'Volver al paso anterior'}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {en ? 'Back' : 'Atrás'}
            </button>
          )}

          <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} labels={stepLabels} />

          {(titleEn || titleEs) && (
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-4">
              {en ? titleEn : titleEs}
            </h2>
          )}
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        {showScopeBoundary && (
          <div className="px-5 pb-4 sm:px-6 sm:pb-5 border-t border-slate-100 pt-4">
            <ScopeBoundaryCard variant="compact" />
          </div>
        )}

        {showSaveNotice && (
          <div className="px-5 pb-4 sm:px-6 sm:pb-5 border-t border-slate-100 pt-3 flex items-center justify-between">
            <SaveAndResumeNotice variant="inline" />
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              >
                {en ? 'Save progress' : 'Guardar progreso'}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500 text-center max-w-md mx-auto">
        {en ? SCOPE_DISCLAIMER.en : SCOPE_DISCLAIMER.es}
      </p>
    </div>
  );
}
