import { useState } from 'react';
import { ArrowRight, ArrowLeft, MessageSquare, Briefcase, Users, HelpCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Step {
  question: { en: string; es: string };
  options: {
    label: { en: string; es: string };
    value: string;
    icon?: React.ElementType;
  }[];
}

const STEPS: Step[] = [
  {
    question: {
      en: 'Who is this for?',
      es: 'Para quien es esto?',
    },
    options: [
      { label: { en: 'Myself or my family', es: 'Para mi o mi familia' }, value: 'individual', icon: Users },
      { label: { en: 'My business or team', es: 'Mi negocio o equipo' }, value: 'business', icon: Briefcase },
      { label: { en: 'My organization / legal aid', es: 'Mi organizacion / ayuda legal' }, value: 'organization', icon: Users },
    ],
  },
  {
    question: {
      en: 'What do you need most right now?',
      es: 'Que necesitas mas ahora?',
    },
    options: [
      { label: { en: 'Just answers to a legal question', es: 'Solo respuestas a una pregunta legal' }, value: 'answers' },
      { label: { en: 'Documents and an action plan', es: 'Documentos y un plan de accion' }, value: 'action_plan' },
      { label: { en: 'Predict my case outcome', es: 'Predecir el resultado de mi caso' }, value: 'predict' },
      { label: { en: 'Help with a negotiation or dispute', es: 'Ayuda con una negociacion o disputa' }, value: 'negotiate' },
    ],
  },
  {
    question: {
      en: 'How urgently do you need help?',
      es: 'Que tan urgente necesitas ayuda?',
    },
    options: [
      { label: { en: 'Just exploring my options', es: 'Solo explorando mis opciones' }, value: 'exploring' },
      { label: { en: 'I have a deadline or court date coming', es: 'Tengo una fecha limite o audiencia' }, value: 'deadline' },
      { label: { en: 'I need help right now', es: 'Necesito ayuda ahora mismo' }, value: 'urgent' },
    ],
  },
];

interface Recommendation {
  title: { en: string; es: string };
  description: { en: string; es: string };
  cta: { en: string; es: string };
  link: string;
  price?: string;
  badge?: { en: string; es: string };
}

function getRecommendation(answers: string[]): Recommendation {
  const [audience, need, urgency] = answers;

  if (audience === 'business') {
    return {
      title: { en: 'Business Pro Plan', es: 'Plan Empresarial Pro' },
      description: {
        en: 'Unlimited AI legal tools, compliance alerts, and 2 hours of attorney consultation per month. 14-day free trial.',
        es: 'Herramientas legales IA ilimitadas, alertas de cumplimiento y 2 horas de consulta de abogado al mes. Prueba gratis de 14 dias.',
      },
      cta: { en: 'Start 14-Day Free Trial', es: 'Comenzar Prueba Gratis' },
      link: '/signup?plan=pro&trial=14',
      price: '$249/mo',
      badge: { en: 'Best for teams', es: 'Mejor para equipos' },
    };
  }

  if (audience === 'organization') {
    return {
      title: { en: 'Schedule a Pilot', es: 'Agendar un Piloto' },
      description: {
        en: 'Deploy AI legal tools to your community with grant-eligible pricing, audit controls, and dedicated onboarding.',
        es: 'Implementa herramientas legales de IA para tu comunidad con precios elegibles para subvenciones y controles de auditoria.',
      },
      cta: { en: 'Request Pilot', es: 'Solicitar Piloto' },
      link: '/schedule-demo',
      badge: { en: 'Grant-eligible', es: 'Elegible para subvenciones' },
    };
  }

  if (need === 'answers') {
    return {
      title: { en: 'Free AI Legal Answers', es: 'Respuestas Legales IA Gratis' },
      description: {
        en: 'Ask legal questions for free. Get cited answers in plain language, available 24/7 in English or Spanish.',
        es: 'Haz preguntas legales gratis. Recibe respuestas con fuentes en lenguaje simple, disponible 24/7 en inglés o español.',
      },
      cta: { en: 'Ask My Question Free', es: 'Hacer Mi Pregunta Gratis' },
      link: '/ask',
      price: 'Free',
      badge: { en: 'Free to start', es: 'Gratis para comenzar' },
    };
  }

  if (need === 'predict') {
    return {
      title: { en: 'AI Case Predictor', es: 'Predictor de Casos IA' },
      description: {
        en: 'Get a data-informed probability range for your case based on similar outcomes in your state. First prediction is free.',
        es: 'Obtiene un rango de probabilidad basado en resultados similares en tu estado. Primera prediccion gratis.',
      },
      cta: { en: 'Try First Prediction Free', es: 'Probar Primera Prediccion Gratis' },
      link: '/case-predictor',
      price: '$4.99',
      badge: { en: '1st prediction free', es: '1ra prediccion gratis' },
    };
  }

  if (need === 'negotiate') {
    return {
      title: { en: 'Negotiation Strategy Planner', es: 'Planificador de Negociacion' },
      description: {
        en: 'Get AI-generated scripts, BATNA analysis, and settlement strategies. Free to explore; $49 for your complete exportable strategy document.',
        es: 'Obtiene guiones generados por IA, analisis BATNA y estrategias. Gratis para explorar; $49 por tu documento de estrategia completo.',
      },
      cta: urgency === 'urgent'
        ? { en: 'Start Planning Now', es: 'Comenzar a Planificar' }
        : { en: 'Explore Free Tools', es: 'Explorar Herramientas Gratis' },
      link: urgency === 'urgent' ? '/issue-packs?topic=negotiation' : '/negotiate',
      price: 'Free to $49',
    };
  }

  if (urgency === 'urgent' || urgency === 'deadline') {
    return {
      title: { en: 'Issue Pack for Your Situation', es: 'Paquete para Tu Situación' },
      description: {
        en: 'Get a complete action plan with attorney-reviewed templates, deadline checklists, and an attorney referral. One-time purchase, instant access.',
        es: 'Obtiene un plan de accion completo con plantillas revisadas por abogados, listas de fechas y referencia a abogado. Compra unica, acceso instantaneo.',
      },
      cta: { en: 'Browse Issue Packs', es: 'Ver Paquetes' },
      link: '/issue-packs',
      price: '$29-$49',
      badge: { en: 'Instant access', es: 'Acceso instantaneo' },
    };
  }

  return {
    title: { en: 'Start with a Free Question', es: 'Comienza con una Pregunta Gratis' },
    description: {
      en: 'Ask a free question to understand your situation. If you need more, we\'ll recommend the right next step.',
      es: 'Haz una pregunta gratis para entender tu situación. Si necesitas mas, te recomendaremos el siguiente paso.',
    },
    cta: { en: 'Ask My Question Free', es: 'Hacer Mi Pregunta Gratis' },
    link: '/ask',
    price: 'Free',
  };
}

export default function PricingChooser() {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'es';
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (value: string) => {
    const newAnswers = [...answers.slice(0, currentStep), value];
    setAnswers(newAnswers);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    const rec = getRecommendation(answers);
    return (
      <div className="bg-white border-2 border-teal-200 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">
            {language === 'en' ? 'We Recommend' : 'Recomendamos'}
          </h3>
        </div>

        {rec.badge && (
          <div className="flex justify-center mb-3">
            <span className="text-xs font-bold bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
              {rec.badge[lang]}
            </span>
          </div>
        )}

        <h4 className="text-xl font-bold text-navy-900 text-center mb-1">{rec.title[lang]}</h4>
        {rec.price && (
          <p className="text-center text-teal-600 font-bold text-lg mb-3">{rec.price}</p>
        )}
        <p className="text-sm text-navy-600 text-center mb-6">{rec.description[lang]}</p>

        <Link
          to={rec.link}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-3 px-6 rounded-xl font-bold transition-all w-full"
        >
          {rec.cta[lang]}
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={handleBack} className="text-sm text-navy-500 hover:text-navy-700">
            &larr; {language === 'en' ? 'Back' : 'Atras'}
          </button>
          <button onClick={handleReset} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            {language === 'en' ? 'Start over' : 'Empezar de nuevo'}
          </button>
        </div>
      </div>
    );
  }

  const step = STEPS[currentStep];

  return (
    <div className="bg-white border-2 border-navy-200 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-semibold text-navy-900">
            {language === 'en' ? 'Help Me Choose' : 'Ayudame a Elegir'}
          </span>
        </div>
        <span className="text-xs text-navy-400">
          {currentStep + 1} / {STEPS.length}
        </span>
      </div>

      <div className="flex gap-1 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-teal-500' : 'bg-navy-200'
            }`}
          />
        ))}
      </div>

      <h3 className="text-lg font-bold text-navy-900 mb-4">{step.question[lang]}</h3>

      <div className="space-y-2">
        {step.options.map((option) => {
          const Icon = option.icon || MessageSquare;
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:border-teal-400 hover:bg-teal-50 ${
                answers[currentStep] === option.value
                  ? 'border-teal-400 bg-teal-50'
                  : 'border-navy-200'
              }`}
            >
              <Icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <span className="text-sm font-medium text-navy-800">{option.label[lang]}</span>
            </button>
          );
        })}
      </div>

      {currentStep > 0 && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 mt-4"
        >
          <ArrowLeft className="w-3 h-3" />
          {language === 'en' ? 'Back' : 'Atras'}
        </button>
      )}
    </div>
  );
}
