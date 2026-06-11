import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Save, AlertTriangle, Shield } from 'lucide-react';
import { getQuestionsForPath, isUrgent, type ICPPath, type IntakeQuestion } from '../../data/intakeQuestions';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'ezlegal_intake_progress';

const PII_WARNING = {
  en: 'Do not include Social Security numbers, bank accounts, passwords, immigration A-numbers, or full identity documents.',
  es: 'No incluyas números de Seguro Social, cuentas bancarias, contraseñas, números A de inmigración o documentos de identidad completos.',
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

interface GuidedIntakeProps {
  path: ICPPath;
  onComplete?: (answers: Record<string, string>) => void;
  userId?: string | null;
}

export default function GuidedIntake({ path, onComplete, userId }: GuidedIntakeProps) {
  const { language } = useLanguage();
  const l = language === 'es' ? 'es' : 'en';
  const questions = getQuestionsForPath(path);
  const totalSteps = questions.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showUrgentCard, setShowUrgentCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumed, setResumed] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [path, userId]);

  const loadProgress = useCallback(async () => {
    if (userId) {
      const { data } = await supabase
        .from('user_preferences')
        .select('intake_progress')
        .eq('visitor_id', userId)
        .maybeSingle();
      if (data?.intake_progress?.path === path) {
        setAnswers(data.intake_progress.answers || {});
        setCurrentStep(data.intake_progress.step || 0);
        setResumed(true);
      }
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.path === path) {
            setAnswers(parsed.answers || {});
            setCurrentStep(parsed.step || 0);
            setResumed(true);
          }
        }
      } catch { /* ignore parse errors */ }
    }
  }, [path, userId]);

  const saveProgress = useCallback(async () => {
    setSaving(true);
    const progress = { path, answers, step: currentStep, savedAt: new Date().toISOString() };

    if (userId) {
      await supabase
        .from('user_preferences')
        .upsert({ visitor_id: userId, intake_progress: progress }, { onConflict: 'visitor_id' });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
    setSaving(false);
  }, [path, answers, currentStep, userId]);

  const question = questions[currentStep];
  if (!question) return null;

  const handleAnswer = (value: string) => {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);

    if (question.id === 'urgency' && isUrgent(value)) {
      setShowUrgentCard(true);
    }
  };

  const handleContinue = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue = !question.required || !!answers[question.id];
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div data-testid="guided-intake" className="w-full max-w-xl mx-auto px-4 sm:px-6">
      {/* Progress bar */}
      <div data-testid="intake-progress" className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">
            {l === 'es' ? `Paso ${currentStep + 1} de ${totalSteps}` : `Step ${currentStep + 1} of ${totalSteps}`}
          </span>
          {resumed && (
            <span className="text-xs text-teal-600 font-medium">
              {l === 'es' ? 'Progreso restaurado' : 'Progress restored'}
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Urgent resources card */}
      {showUrgentCard && (
        <div data-testid="urgent-resource-card" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">
                {l === 'es' ? 'Recursos urgentes disponibles' : 'Urgent resources available'}
              </p>
              <p className="text-xs text-red-800 mb-2">
                {l === 'es'
                  ? 'Si estás en peligro inmediato, llama al 911. Para otros recursos urgentes:'
                  : 'If you are in immediate danger, call 911. For other urgent resources:'}
              </p>
              <ul className="space-y-1 text-xs text-red-800">
                <li>
                  {l === 'es' ? 'Violencia doméstica: 1-800-799-7233' : 'Domestic violence: 1-800-799-7233'}
                </li>
                <li>
                  {l === 'es' ? 'Línea de crisis: 988' : 'Crisis line: 988'}
                </li>
                <li>
                  <a href="/urgent-resources" className="underline font-medium hover:text-red-900">
                    {l === 'es' ? 'Ver todos los recursos urgentes' : 'See all urgent resources'}
                  </a>
                </li>
              </ul>
              <p className="text-[10px] text-red-700 mt-2 italic">
                {l === 'es'
                  ? 'Puedes continuar con la admisión después de revisar estos recursos.'
                  : 'You can continue with intake after reviewing these resources.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <label className="block text-base font-semibold text-slate-900 mb-1">
          {question.label[l]}
          {!question.required && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({l === 'es' ? 'opcional' : 'optional'})
            </span>
          )}
        </label>

        {/* Help text */}
        {question.help && (
          <p className="text-sm text-slate-500 mb-4">{question.help[l]}</p>
        )}

        {/* Legal-aid income explanation */}
        {path === 'legal-aid' && (question.id === 'household-size' || question.id === 'income-range') && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-teal-50 border border-teal-100 rounded-lg">
            <Shield className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800">
              {l === 'es'
                ? 'Esta pregunta es opcional. Se usa solo para verificar si puedes calificar para ayuda legal gratuita. No almacenamos esta información.'
                : 'This question is optional. It is used only to check if you may qualify for free legal help. We do not store this information.'}
            </p>
          </div>
        )}

        {/* PII warning */}
        {question.piiWarning && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{PII_WARNING[l]}</p>
          </div>
        )}

        {/* Input field */}
        <div className="mt-4">
          {question.type === 'single' && question.options && (
            <div className="space-y-2">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    answers[question.id] === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium ring-1 ring-teal-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {opt.label[l]}
                </button>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              rows={4}
              placeholder={l === 'es' ? 'Escribe aquí...' : 'Type here...'}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          )}

          {question.type === 'state' && (
            <select
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">{l === 'es' ? 'Selecciona un estado...' : 'Select a state...'}</option>
              {US_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          )}

          {question.type === 'zip' && (
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={l === 'es' ? 'Ej: 85001' : 'e.g., 85001'}
              maxLength={10}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {l === 'es' ? 'Atrás' : 'Back'}
        </button>

        <button
          data-testid="intake-save"
          onClick={saveProgress}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving
            ? (l === 'es' ? 'Guardando...' : 'Saving...')
            : (l === 'es' ? 'Guardar y continuar después' : 'Save and continue later')
          }
        </button>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {currentStep === totalSteps - 1
            ? (l === 'es' ? 'Enviar' : 'Submit')
            : (l === 'es' ? 'Continuar' : 'Continue')
          }
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Safety footer */}
      <div className="mt-8 p-3 bg-slate-50 border border-slate-100 rounded-lg">
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          {l === 'es'
            ? 'Esto es información legal, no asesoría legal. No se crea una relación abogado-cliente.'
            : 'This is legal information, not legal advice. No attorney-client relationship is created.'}
        </p>
      </div>
    </div>
  );
}
