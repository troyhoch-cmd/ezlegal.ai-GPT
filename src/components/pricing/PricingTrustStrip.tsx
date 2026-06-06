import { Shield, Lock, Eye, Server, Scale } from 'lucide-react';

interface Props {
  language: 'en' | 'es';
}

const safeguards = [
  {
    icon: Server,
    en: 'Your data never trains AI models',
    es: 'Tus datos nunca entrenan modelos de IA',
  },
  {
    icon: Lock,
    en: 'Encrypted in transit and at rest',
    es: 'Encriptado en tránsito y en reposo',
  },
  {
    icon: Eye,
    en: 'Human review available on every plan',
    es: 'Revisión humana disponible en cada plan',
  },
  {
    icon: Scale,
    en: 'Not legal advice — clear boundaries always',
    es: 'No es asesoría legal — límites claros siempre',
  },
  {
    icon: Shield,
    en: 'SOC 2 controls & ABA AI ethics aligned',
    es: 'Controles SOC 2 y alineados con ética ABA AI',
  },
];

export default function PricingTrustStrip({ language }: Props) {
  const l = language === 'es' ? 'es' : 'en';

  return (
    <div className="w-full py-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {safeguards.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.en}
                className="inline-flex items-center gap-1.5 text-xs text-navy-600 whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                {item[l]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
