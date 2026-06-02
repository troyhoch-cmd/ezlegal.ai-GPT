import { Link } from 'react-router-dom';
import { FileText, Sparkles, UserCheck, Handshake, ArrowRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NextBestStepProps {
  messageCount: number;
  lastMessage?: string;
  onDismiss: () => void;
}

interface TopicMatch {
  topic: string;
  confidence: number;
}

const TOPIC_PATTERNS: Record<string, { primary: RegExp; secondary: RegExp }> = {
  housing: {
    primary: /\b(evict|landlord|tenant|lease agreement|security deposit|habitab|rent control)\b/i,
    secondary: /\b(rent|housing|apartment|move out|notice to quit|sublease)\b/i,
  },
  immigration: {
    primary: /\b(deport|visa|asylum|green card|citizenship|naturali|ice encounter|i-130|i-485)\b/i,
    secondary: /\b(immigra|work permit|ead|status|overstay|sponsor)\b/i,
  },
  family: {
    primary: /\b(divorce|custody|child support|visitation|family court|restraining order)\b/i,
    secondary: /\b(marriage|domestic|alimony|paternity|adoption|guardianship)\b/i,
  },
  employment: {
    primary: /\b(wrongful termination|wage theft|discrimination|flsa|overtime pay|retaliation)\b/i,
    secondary: /\b(fired|employ|workplace|salary|owed money|hr complaint)\b/i,
  },
  debt: {
    primary: /\b(debt collector|garnish|bankrupt|fair debt|statute of limitation|validation letter)\b/i,
    secondary: /\b(debt|collect|credit|owe|creditor|judgment)\b/i,
  },
  criminal: {
    primary: /\b(arrest|felony|misdemeanor|criminal charge|probation|expunge|plea)\b/i,
    secondary: /\b(criminal|ticket|dui|court date|public defender|bail)\b/i,
  },
  negotiation: {
    primary: /\b(negotiat|settlement offer|counter.?offer|demand letter|mediation)\b/i,
    secondary: /\b(settle|dispute|agreement|resolve|deal)\b/i,
  },
};

function detectTopicWithConfidence(text: string): TopicMatch {
  if (!text) return { topic: '', confidence: 0 };

  let bestTopic = '';
  let bestScore = 0;

  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
    let score = 0;
    const primaryMatches = text.match(patterns.primary);
    const secondaryMatches = text.match(patterns.secondary);

    if (primaryMatches) score += primaryMatches.length * 2;
    if (secondaryMatches) score += secondaryMatches.length;

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  const confidence = Math.min(bestScore / 4, 1);
  return { topic: bestTopic, confidence };
}

const PACK_NAMES: Record<string, { en: string; es: string }> = {
  housing: { en: 'Housing & Eviction Pack', es: 'Paquete de Vivienda' },
  immigration: { en: 'Immigration Help Pack', es: 'Paquete de Inmigracion' },
  family: { en: 'Family Matters Pack', es: 'Paquete Familiar' },
  employment: { en: 'Employment & Wages Pack', es: 'Paquete Laboral' },
  debt: { en: 'Debt Defense Pack', es: 'Paquete de Deudas' },
  criminal: { en: 'Criminal Law Pack', es: 'Paquete Penal' },
  negotiation: { en: 'Negotiation Planner', es: 'Planificador de Negociacion' },
};

const CONFIDENCE_THRESHOLD = 0.25;

export default function NextBestStep({ messageCount, lastMessage, onDismiss }: NextBestStepProps) {
  const { language } = useLanguage();

  if (messageCount < 1) return null;

  const { topic, confidence } = lastMessage ? detectTopicWithConfidence(lastMessage) : { topic: '', confidence: 0 };
  const isConfident = confidence >= CONFIDENCE_THRESHOLD && topic;
  const packName = isConfident ? PACK_NAMES[topic]?.[language === 'en' ? 'en' : 'es'] : null;

  const steps = isConfident ? [
    {
      icon: topic === 'negotiation' ? Handshake : FileText,
      label: topic === 'negotiation'
        ? (language === 'en' ? 'Build negotiation strategy' : 'Crear estrategia de negociacion')
        : (language === 'en' ? 'Get an action plan' : 'Obtener plan de accion'),
      desc: packName
        ? (language === 'en' ? `${packName} - templates & deadlines` : `${packName} - plantillas y fechas`)
        : (language === 'en' ? 'Document templates & deadline checklists' : 'Plantillas y listas de verificacion'),
      to: topic === 'negotiation' ? '/negotiate' : `/issue-packs?topic=${topic}`,
      primary: true,
    },
    {
      icon: Sparkles,
      label: language === 'en' ? 'Predict my outcome' : 'Predecir mi resultado',
      desc: language === 'en' ? 'AI analysis of your likely case outcome' : 'Analisis IA de tu resultado probable',
      to: '/case-predictor',
    },
    {
      icon: UserCheck,
      label: language === 'en' ? 'Find an attorney' : 'Encontrar abogado',
      desc: language === 'en' ? 'Browse attorneys matched to your area & case type' : 'Busca abogados de tu area y tipo de caso',
      to: '/find-attorney',
    },
  ] : [
    {
      icon: MessageSquare,
      label: language === 'en' ? 'Keep asking questions' : 'Sigue preguntando',
      desc: language === 'en' ? 'Get more details about your situation' : 'Obtén mas detalles sobre tu situación',
      to: '#',
      primary: true,
    },
    {
      icon: FileText,
      label: language === 'en' ? 'Browse action plans' : 'Ver planes de accion',
      desc: language === 'en' ? 'Ready-made packs for common legal issues' : 'Paquetes listos para temas legales comunes',
      to: '/issue-packs',
    },
    {
      icon: UserCheck,
      label: language === 'en' ? 'Find an attorney' : 'Encontrar abogado',
      desc: language === 'en' ? 'Browse attorneys in your area' : 'Busca abogados en tu area',
      to: '/find-attorney',
    },
  ];

  return (
    <div className="mt-4 bg-gradient-to-br from-navy-50 to-teal-50 border border-navy-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-navy-900 text-sm">
          {language === 'en' ? 'What would you like to do next?' : 'Que te gustaria hacer ahora?'}
        </h4>
        <button onClick={onDismiss} className="text-xs text-navy-400 hover:text-navy-600 transition-colors">
          {language === 'en' ? 'Dismiss' : 'Cerrar'}
        </button>
      </div>
      <div className="space-y-2">
        {steps.map((step) => {
          if (step.to === '#') {
            return (
              <button
                key="continue"
                onClick={onDismiss}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all group bg-teal-600 hover:bg-teal-500 text-white shadow-md hover:shadow-lg text-left"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white">{step.label}</div>
                  <div className="text-xs text-teal-100">{step.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 text-white/70" />
              </button>
            );
          }
          return (
            <Link
              key={step.to}
              to={step.to}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                step.primary
                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md hover:shadow-lg'
                  : 'bg-white hover:bg-navy-50 border border-navy-200 text-navy-700 hover:border-teal-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                step.primary ? 'bg-white/20' : 'bg-teal-50 group-hover:bg-teal-100'
              }`}>
                <step.icon className={`w-5 h-5 ${step.primary ? 'text-white' : 'text-teal-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${step.primary ? 'text-white' : 'text-navy-900'}`}>{step.label}</div>
                <div className={`text-xs ${step.primary ? 'text-teal-100' : 'text-navy-400'}`}>{step.desc}</div>
              </div>
              <ArrowRight className={`w-4 h-4 flex-shrink-0 ${step.primary ? 'text-white/70' : 'text-navy-300'}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
