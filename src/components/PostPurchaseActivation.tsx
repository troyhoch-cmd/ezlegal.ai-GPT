import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Users, CheckCircle, Circle, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ActivationStep {
  id: string;
  icon: React.ElementType;
  label: { en: string; es: string };
  description: { en: string; es: string };
  action?: { label: { en: string; es: string }; link: string };
}

const ACTIVATION_STEPS: ActivationStep[] = [
  {
    id: 'download',
    icon: Download,
    label: { en: 'Download your action plan', es: 'Descarga tu plan de accion' },
    description: { en: 'Your PDF action plan is ready. Download it now.', es: 'Tu plan de accion PDF esta listo. Descargalo ahora.' },
    action: { label: { en: 'Go to Documents', es: 'Ir a Documentos' }, link: '/dashboard/documents' },
  },
  {
    id: 'templates',
    icon: FileText,
    label: { en: 'Fill in your templates', es: 'Completa tus plantillas' },
    description: { en: 'Customize the fillable templates with your details.', es: 'Personaliza las plantillas con tus datos.' },
    action: { label: { en: 'Open Templates', es: 'Abrir Plantillas' }, link: '/dashboard/documents' },
  },
  {
    id: 'deadlines',
    icon: Calendar,
    label: { en: 'Review your deadlines', es: 'Revisa tus fechas limite' },
    description: { en: 'Check your deadline checklist and mark key dates.', es: 'Revisa tu lista de fechas y marca las fechas clave.' },
    action: { label: { en: 'View Deadlines', es: 'Ver Fechas' }, link: '/dashboard/matters' },
  },
  {
    id: 'attorney',
    icon: Users,
    label: { en: 'See free, low-cost, or attorney options', es: 'Ver opciones gratuitas, de bajo costo, o de abogados' },
    description: { en: 'Find legal aid, pro bono services, or vetted attorneys in your area if you need professional help.', es: 'Encuentra ayuda legal, servicios pro bono, o abogados verificados en tu area si necesitas ayuda profesional.' },
    action: { label: { en: 'Find Help', es: 'Encontrar Ayuda' }, link: '/dashboard/lawyer-profiles' },
  },
];

export default function PostPurchaseActivation() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const lang = language === 'en' ? 'en' : 'es';
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`ez_activation_${user.id}`);
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
    localStorage.setItem(`ez_activation_${user.id}`, JSON.stringify({
      completed,
      dismissed: isDismissed,
    }));
  };

  const toggleStep = (stepId: string) => {
    const updated = completedSteps.includes(stepId)
      ? completedSteps.filter(s => s !== stepId)
      : [...completedSteps, stepId];
    setCompletedSteps(updated);
    saveState(updated, dismissed);

    if (user) {
      supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'activation_step',
        details: { step: stepId, completed: !completedSteps.includes(stepId) },
      }).then(() => {});
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    saveState(completedSteps, true);
  };

  if (dismissed || !user) return null;
  if (completedSteps.length === ACTIVATION_STEPS.length) return null;

  const progress = Math.round((completedSteps.length / ACTIVATION_STEPS.length) * 100);

  return (
    <div className="bg-white border border-teal-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-navy-900">
            {language === 'en' ? 'Next steps for your legal issue' : 'Proximos pasos para tu asunto legal'}
          </h3>
          <p className="text-sm text-navy-500">
            {language === 'en'
              ? `${completedSteps.length} of ${ACTIVATION_STEPS.length} steps completed`
              : `${completedSteps.length} de ${ACTIVATION_STEPS.length} pasos completados`}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-navy-400 hover:text-navy-600 p-1"
          aria-label={language === 'en' ? 'Dismiss' : 'Cerrar'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full bg-navy-100 rounded-full h-2 mb-5">
        <div
          className="bg-teal-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {ACTIVATION_STEPS.map((step) => {
          const isComplete = completedSteps.includes(step.id);
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                isComplete ? 'bg-teal-50 border border-teal-100' : 'bg-navy-50 border border-navy-100'
              }`}
            >
              <button
                onClick={() => toggleStep(step.id)}
                className="mt-0.5 flex-shrink-0"
                aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
              >
                {isComplete
                  ? <CheckCircle className="w-5 h-5 text-teal-600" />
                  : <Circle className="w-5 h-5 text-navy-300" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StepIcon className={`w-4 h-4 flex-shrink-0 ${isComplete ? 'text-teal-600' : 'text-navy-500'}`} />
                  <span className={`text-sm font-medium ${isComplete ? 'text-teal-700 line-through' : 'text-navy-800'}`}>
                    {step.label[lang]}
                  </span>
                </div>
                {!isComplete && (
                  <p className="text-xs text-navy-500 mt-1 ml-6">{step.description[lang]}</p>
                )}
                {!isComplete && step.action && (
                  <Link
                    to={step.action.link}
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium mt-1 ml-6"
                  >
                    {step.action.label[lang]}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
