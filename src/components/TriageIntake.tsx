import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ChevronRight, Shield, Scale,
  Building2, Users, Briefcase, Heart, Car, Home as HomeIcon,
  CreditCard, HelpCircle, Phone
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TriageResult {
  issueType: string;
  jurisdiction: string;
  urgency: 'emergency' | 'urgent' | 'standard' | 'planning';
  hasDeadline: boolean;
  deadlineDate?: string;
}

interface TriageIntakeProps {
  onComplete: (result: TriageResult) => void;
  onSkip: () => void;
}

const ISSUE_CATEGORIES = [
  { id: 'housing', icon: HomeIcon },
  { id: 'employment', icon: Briefcase },
  { id: 'family', icon: Users },
  { id: 'immigration', icon: Shield },
  { id: 'debt', icon: CreditCard },
  { id: 'criminal', icon: Scale },
  { id: 'injury', icon: Car },
  { id: 'business', icon: Building2 },
  { id: 'benefits', icon: Heart },
  { id: 'other', icon: HelpCircle },
];

const ISSUE_LABELS: Record<string, Record<string, string>> = {
  en: {
    housing: 'Landlord or eviction',
    employment: 'Job, wages, or firing',
    family: 'Family or custody',
    immigration: 'Immigration',
    debt: 'Debt or collections',
    criminal: 'Arrest or criminal',
    injury: 'Injury or accident',
    business: 'Business or contract',
    benefits: 'Government benefits',
    other: 'Something else',
  },
  es: {
    housing: 'Arrendador o desalojo',
    employment: 'Trabajo o salario',
    family: 'Familia o custodia',
    immigration: 'Inmigracion',
    debt: 'Deudas o cobros',
    criminal: 'Arresto o criminal',
    injury: 'Lesion o accidente',
    business: 'Negocio o contrato',
    benefits: 'Beneficios del gobierno',
    other: 'Otra cosa',
  },
};

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
  'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
  'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export default function TriageIntake({ onComplete, onSkip }: TriageIntakeProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [issueType, setIssueType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [urgency, setUrgency] = useState<'emergency' | 'urgent' | 'standard' | 'planning'>('standard');
  const labels = ISSUE_LABELS[language] || ISSUE_LABELS.en;

  const canStart = issueType && jurisdiction;

  const handleStart = () => {
    if (!canStart) return;
    onComplete({
      issueType,
      jurisdiction,
      urgency,
      hasDeadline: false,
    });
  };

  const urgencyOptions = [
    { value: 'emergency' as const, label: en ? 'Today' : 'Hoy' },
    { value: 'urgent' as const, label: en ? 'This week' : 'Esta semana' },
    { value: 'standard' as const, label: en ? 'This month' : 'Este mes' },
    { value: 'planning' as const, label: en ? 'No rush' : 'Sin prisa' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-navy-200 max-w-lg w-full mx-auto overflow-hidden" data-testid="intake-form">
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-5 py-4">
        <h2 className="text-lg font-bold text-white">
          {en ? 'Tell us what\u2019s going on' : 'Dinos que esta pasando'}
        </h2>
        <p className="text-teal-100 text-sm mt-0.5">
          {en ? 'Two quick picks and we\u2019ll jump in.' : 'Dos selecciones rapidas y empezamos.'}
        </p>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-navy-900 mb-3">
            {en ? '1. What\u2019s your situation?' : '1. Cuál es tu situación?'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ISSUE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const selected = issueType === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setIssueType(cat.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all min-h-[52px] ${
                    selected
                      ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200 text-teal-900'
                      : 'border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50 text-navy-800'
                  }`}
                  aria-pressed={selected}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-teal-600' : 'text-navy-500'}`} />
                  <span className="text-sm font-medium leading-tight">
                    {labels[cat.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-navy-900 mb-3">
            {en ? '2. What state are you in?' : '2. En que estado estas?'}
          </h3>
          <select
            id="triage-state"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full px-3 py-3 border-2 border-navy-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none bg-white"
          >
            <option value="">{en ? 'Select your state\u2026' : 'Selecciona tu estado\u2026'}</option>
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <details className="group">
          <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-semibold text-navy-600 hover:text-navy-800">
            <span className="flex items-center gap-1.5">
              {en ? 'Add timing (optional)' : 'Agregar urgencia (opcional)'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
          </summary>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {urgencyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setUrgency(opt.value)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                  urgency === opt.value
                    ? 'border-teal-600 bg-teal-50 text-teal-800'
                    : 'border-navy-200 bg-white text-navy-600 hover:border-navy-300'
                }`}
                aria-pressed={urgency === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </details>

        {urgency === 'emergency' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-semibold mb-1">
                {en ? 'If you\u2019re in immediate danger, call 911.' : 'Si estas en peligro inmediato, llama al 911.'}
              </p>
              <a href="tel:988" className="inline-flex items-center gap-1 text-red-700 hover:underline font-medium">
                <Phone className="w-3 h-3" /> {en ? 'Crisis line: 988' : 'Linea de crisis: 988'}
              </a>
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-base hover:from-teal-500 hover:to-teal-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {en ? 'Start my chat' : 'Empezar mi chat'}
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-navy-400 text-center leading-relaxed">
          {en
            ? 'Information, not legal advice. No attorney-client relationship. '
            : 'Información, no asesoramiento legal. No se crea relacion abogado-cliente. '}
          <Link to="/privacy" className="underline hover:text-navy-600">
            {en ? 'Privacy' : 'Privacidad'}
          </Link>
          <span className="text-navy-300"> | </span>
          <button onClick={onSkip} className="underline hover:text-navy-600">
            {en ? 'Answer later' : 'Responder despues'}
          </button>
        </p>
      </div>
    </div>
  );
}
