import { useState, useEffect } from 'react';
import { FileText, Users, Zap, BarChart3, CheckCircle, Circle, ArrowRight, X, Clock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingStep {
  id: string;
  icon: React.ElementType;
  label: { en: string; es: string };
  description: { en: string; es: string };
  link: string;
}

const TRIAL_STEPS: OnboardingStep[] = [
  {
    id: 'first_doc',
    icon: FileText,
    label: { en: 'Generate your first document', es: 'Genera tu primer documento' },
    description: { en: 'Use AI to draft a contract, policy, or agreement.', es: 'Usa IA para redactar un contrato, politica o acuerdo.' },
    link: '/dashboard/documents',
  },
  {
    id: 'template',
    icon: Zap,
    label: { en: 'Browse the template library', es: 'Explora la biblioteca de plantillas' },
    description: { en: 'Find ready-made templates for common business needs.', es: 'Encuentra plantillas listas para necesidades comunes.' },
    link: '/dashboard/documents',
  },
  {
    id: 'invite',
    icon: Users,
    label: { en: 'Invite a teammate', es: 'Invita a un companero' },
    description: { en: 'Add team members to collaborate on legal workflows.', es: 'Agrega miembros del equipo para colaborar.' },
    link: '/dashboard/profile',
  },
  {
    id: 'review',
    icon: BarChart3,
    label: { en: 'Run your first AI compliance check', es: 'Ejecuta tu primera revision de cumplimiento' },
    description: { en: 'Upload a document to check for compliance issues.', es: 'Sube un documento para verificar cumplimiento.' },
    link: '/dashboard/ai-assistant',
  },
];

interface TrialOnboardingProps {
  trialEndDate?: string;
}

export default function TrialOnboarding({ trialEndDate }: TrialOnboardingProps) {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const lang = language === 'en' ? 'en' : 'es';
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const isBusiness = profile?.user_type === 'business';

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`ez_trial_onboard_${user.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompletedSteps(parsed.completed || []);
        if (parsed.dismissed) setDismissed(true);
      } catch {}
    }
  }, [user]);

  const saveState = (completed: string[], isDismissed: boolean) => {
    if (!user) return;
    localStorage.setItem(`ez_trial_onboard_${user.id}`, JSON.stringify({ completed, dismissed: isDismissed }));
  };

  const toggleStep = (stepId: string) => {
    const updated = completedSteps.includes(stepId)
      ? completedSteps.filter(s => s !== stepId)
      : [...completedSteps, stepId];
    setCompletedSteps(updated);
    saveState(updated, dismissed);
  };

  if (dismissed || !user || !isBusiness) return null;
  if (completedSteps.length === TRIAL_STEPS.length) return null;

  const daysLeft = trialEndDate
    ? Math.max(0, Math.ceil((new Date(trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const progress = Math.round((completedSteps.length / TRIAL_STEPS.length) * 100);

  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-navy-900">
              {language === 'en' ? 'Your Trial Checklist' : 'Lista de Tu Prueba'}
            </h3>
            {daysLeft !== null && (
              <span className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {daysLeft} {language === 'en' ? 'days left' : 'dias restantes'}
              </span>
            )}
          </div>
          <p className="text-sm text-navy-500">
            {language === 'en'
              ? 'Complete these steps to get the most from your trial'
              : 'Completa estos pasos para aprovechar al maximo tu prueba'}
          </p>
        </div>
        <button
          onClick={() => { setDismissed(true); saveState(completedSteps, true); }}
          className="text-navy-400 hover:text-navy-600 p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full bg-navy-100 rounded-full h-2 mb-5">
        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-2">
        {TRIAL_STEPS.map((step) => {
          const isComplete = completedSteps.includes(step.id);
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                isComplete ? 'bg-blue-50 border border-blue-100' : 'bg-navy-50 border border-navy-100'
              }`}
            >
              <button onClick={() => toggleStep(step.id)} className="mt-0.5 flex-shrink-0">
                {isComplete
                  ? <CheckCircle className="w-5 h-5 text-blue-600" />
                  : <Circle className="w-5 h-5 text-navy-300" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StepIcon className={`w-4 h-4 flex-shrink-0 ${isComplete ? 'text-blue-600' : 'text-navy-500'}`} />
                  <span className={`text-sm font-medium ${isComplete ? 'text-blue-700 line-through' : 'text-navy-800'}`}>
                    {step.label[lang]}
                  </span>
                </div>
                {!isComplete && (
                  <>
                    <p className="text-xs text-navy-500 mt-1 ml-6">{step.description[lang]}</p>
                    <Link to={step.link} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 ml-6">
                      {language === 'en' ? 'Go' : 'Ir'} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-navy-100">
        <div className="flex items-center justify-between text-xs text-navy-500">
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            {language === 'en'
              ? 'No charge until trial ends. Cancel anytime.'
              : 'Sin cargo hasta que termine la prueba. Cancela cuando quieras.'}
          </div>
          <Link to="/dashboard/profile" className="text-blue-600 hover:text-blue-700 font-medium">
            {language === 'en' ? 'Manage billing' : 'Gestionar facturacion'}
          </Link>
        </div>
      </div>
    </div>
  );
}
