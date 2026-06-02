import { useState } from 'react';
import { Check, Shield, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { setPlan, type PlanEntitlements, type PlanId } from '../services/safety-net-service';

interface Props {
  current: PlanEntitlements | null;
  onChange: (next: PlanEntitlements | null) => void;
}

const PLANS: {
  id: PlanId;
  icon: typeof Shield;
  name_en: string;
  name_es: string;
  price_en: string;
  price_es: string;
  features_en: string[];
  features_es: string[];
  accent: 'navy' | 'teal' | 'amber';
}[] = [
  {
    id: 'free',
    icon: Shield,
    name_en: 'Free',
    name_es: 'Gratis',
    price_en: '$0',
    price_es: '$0',
    accent: 'navy',
    features_en: ['1 active matter', '10 MB document vault', 'In-app reminders only', 'Plain-English answers'],
    features_es: ['1 caso activo', 'Boveda de 10 MB', 'Solo recordatorios en la app', 'Respuestas claras'],
  },
  {
    id: 'plus',
    icon: Sparkles,
    name_en: 'Plus',
    name_es: 'Plus',
    price_en: '$12 / mo',
    price_es: '$12 / mes',
    accent: 'teal',
    features_en: [
      'Up to 5 matters',
      '500 MB vault',
      'Email + in-app reminders',
      'Monthly legal checkup',
      'AI document explanations',
    ],
    features_es: [
      'Hasta 5 casos',
      'Boveda de 500 MB',
      'Recordatorios por correo',
      'Revision mensual',
      'Explicacion de documentos',
    ],
  },
  {
    id: 'protection',
    icon: Zap,
    name_en: 'Protection',
    name_es: 'Proteccion',
    price_en: '$29 / mo',
    price_es: '$29 / mes',
    accent: 'amber',
    features_en: [
      'Up to 25 matters',
      '2 GB vault',
      'Email, SMS, and WhatsApp reminders',
      'Monthly legal checkup',
      'Priority attorney handoff',
    ],
    features_es: [
      'Hasta 25 casos',
      'Boveda de 2 GB',
      'Correo, SMS y WhatsApp',
      'Revision mensual',
      'Conexion prioritaria con abogado',
    ],
  },
];

export default function SafetyPlanChooser({ current, onChange }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [switching, setSwitching] = useState<PlanId | null>(null);

  async function handleSelect(plan: PlanId) {
    setSwitching(plan);
    const next = await setPlan(plan);
    onChange(next);
    setSwitching(null);
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-navy-900 mb-1">
          {en ? 'Choose your protection level' : 'Elige tu nivel de proteccion'}
        </h2>
        <p className="text-sm text-navy-600">
          {en
            ? 'Upgrade anytime. Your vault, matters, and deadlines stay with you.'
            : 'Cambia cuando quieras. Tu boveda, casos y fechas se quedan contigo.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const isCurrent = current?.plan === p.id;
          const Icon = p.icon;
          const accentBg = p.accent === 'teal' ? 'bg-teal-600' : p.accent === 'amber' ? 'bg-amber-500' : 'bg-navy-700';
          const accentBorder = isCurrent
            ? p.accent === 'teal'
              ? 'border-teal-500 ring-2 ring-teal-200'
              : p.accent === 'amber'
              ? 'border-amber-500 ring-2 ring-amber-200'
              : 'border-navy-500 ring-2 ring-navy-200'
            : 'border-navy-200';
          return (
            <div key={p.id} className={`bg-white rounded-2xl p-5 border ${accentBorder} relative`}>
              {p.id === 'plus' && !isCurrent && (
                <span className="absolute -top-2 right-4 bg-teal-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  {en ? 'Popular' : 'Popular'}
                </span>
              )}
              <div className={`w-10 h-10 ${accentBg} text-white rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">{en ? p.name_en : p.name_es}</h3>
              <div className="text-2xl font-bold text-navy-900 mb-3">{en ? p.price_en : p.price_es}</div>
              <ul className="space-y-2 mb-4">
                {(en ? p.features_en : p.features_es).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(p.id)}
                disabled={isCurrent || switching === p.id}
                className={`w-full font-bold text-sm py-2.5 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-navy-100 text-navy-600 cursor-default'
                    : p.accent === 'amber'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : p.accent === 'teal'
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-navy-700 hover:bg-navy-800 text-white'
                }`}
              >
                {isCurrent
                  ? (en ? 'Current plan' : 'Plan actual')
                  : switching === p.id
                  ? (en ? 'Switching...' : 'Cambiando...')
                  : (en ? 'Choose' : 'Elegir')}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-navy-500 mt-3 text-center">
        {en
          ? 'This is a preview of plan gating. Billing integration lives in your account settings.'
          : 'Vista previa del plan. La facturacion esta en la configuracion de tu cuenta.'}
      </p>
    </div>
  );
}
