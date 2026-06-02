import { useState } from 'react';
import { ArrowRight, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEngagement } from '../../services/engagement-service';

interface Props {
  language: 'en' | 'es';
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 'result';

interface WizardState {
  who: 'individual' | 'business' | 'org' | null;
  need: 'question' | 'document' | 'nextsteps' | 'findhelp' | null;
  urgent: boolean | null;
}

export default function HelpMeChoose({ language, onClose }: Props) {
  const l = language === 'es' ? 'es' : 'en';
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>({ who: null, need: null, urgent: null });

  const advance = (updates: Partial<WizardState>, nextStep: Step) => {
    const newState = { ...state, ...updates };
    setState(newState);
    setStep(nextStep);
    if (nextStep === 'result') {
      trackEngagement({
        featureName: 'pricing_help_me_choose_completed',
        engagementType: 'complete',
        metadata: newState,
      });
    }
  };

  const getRecommendation = () => {
    if (state.who === 'org') return { plan: 'Verified Legal Aid', href: '/pro-bono', tab: 'legal-aid' };
    if (state.who === 'business') return { plan: 'Business Starter', href: '/signup?plan=business-starter', tab: 'business' };
    if (state.need === 'findhelp') return { plan: 'Free', href: '/chat', tab: 'individuals' };
    if (state.need === 'document' || state.need === 'nextsteps') return { plan: 'Everyday Plus', href: '/chat?plan=everyday-plus', tab: 'individuals' };
    return { plan: 'Free', href: '/chat', tab: 'individuals' };
  };

  const copy = {
    title: { en: 'Help me choose', es: 'Ayudame a elegir' },
    step1: { en: 'Who is this for?', es: 'Para quien es esto?' },
    step2: { en: 'What do you need most?', es: 'Que necesitas mas?' },
    step3: { en: 'Is this urgent?', es: 'Es urgente?' },
    urgentWarning: {
      en: 'If you have a safety issue or imminent deadline, get urgent help first:',
      es: 'Si tienes un problema de seguridad o fecha limite inminente, obtén ayuda urgente primero:',
    },
    urgentLink: { en: 'Urgent help resources', es: 'Recursos de ayuda urgente' },
    recommendation: { en: 'We recommend:', es: 'Te recomendamos:' },
    getStarted: { en: 'Get started', es: 'Comenzar' },
  };

  const options1 = [
    { value: 'individual' as const, en: 'Myself or my family', es: 'Para mi o mi familia' },
    { value: 'business' as const, en: 'My business or team', es: 'Mi negocio o equipo' },
    { value: 'org' as const, en: 'My organization / legal aid', es: 'Mi organizacion / ayuda legal' },
  ];

  const options2 = [
    { value: 'question' as const, en: 'Ask a question', es: 'Hacer una pregunta' },
    { value: 'document' as const, en: 'Understand a document', es: 'Entender un documento' },
    { value: 'nextsteps' as const, en: 'Prepare next steps', es: 'Preparar proximos pasos' },
    { value: 'findhelp' as const, en: 'Find help', es: 'Encontrar ayuda' },
  ];

  const options3 = [
    { value: true, en: 'Yes, I may have a deadline or safety issue', es: 'Si, puede que tenga una fecha limite o problema de seguridad' },
    { value: false, en: 'No, I\'m planning ahead', es: 'No, estoy planificando con anticipacion' },
  ];

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg max-w-lg mx-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 text-navy-400 hover:text-navy-700 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label={l === 'es' ? 'Cerrar' : 'Close'}
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-lg font-bold text-navy-900 mb-5">{copy.title[l]}</h3>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-navy-700 mb-3">{copy.step1[l]}</p>
          {options1.map((opt) => (
            <button
              key={opt.value}
              onClick={() => advance({ who: opt.value }, 2)}
              className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-sm font-medium text-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {opt[l]}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-navy-700 mb-3">{copy.step2[l]}</p>
          {options2.map((opt) => (
            <button
              key={opt.value}
              onClick={() => advance({ need: opt.value }, 3)}
              className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-sm font-medium text-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {opt[l]}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-navy-700 mb-3">{copy.step3[l]}</p>
          {options3.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => advance({ urgent: opt.value }, 'result')}
              className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-sm font-medium text-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {opt[l]}
            </button>
          ))}
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-4">
          {state.urgent && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-amber-900">{copy.urgentWarning[l]}</p>
                <Link
                  to="/emergency-resources"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
                >
                  {copy.urgentLink[l]}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
            <p className="text-xs font-medium text-teal-700 uppercase tracking-wide mb-1">{copy.recommendation[l]}</p>
            <p className="text-lg font-bold text-navy-900">{getRecommendation().plan}</p>
            <Link
              to={getRecommendation().href}
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {copy.getStarted[l]}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
