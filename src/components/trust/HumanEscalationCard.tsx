import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface HumanEscalationCardProps {
  context?: 'chat' | 'intake' | 'checkout' | 'general';
}

export default function HumanEscalationCard({ context = 'general' }: HumanEscalationCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const contextMessages: Record<string, { en: string; es: string }> = {
    chat: {
      en: 'If your situation is complex or high-risk, you can connect with a licensed attorney at any time.',
      es: 'Si tu situación es compleja o de alto riesgo, puedes conectarte con un abogado licenciado en cualquier momento.',
    },
    intake: {
      en: 'After completing intake, you can request a referral to a licensed attorney or legal aid provider.',
      es: 'Después de completar la admisión, puedes solicitar una referencia a un abogado licenciado o proveedor de ayuda legal.',
    },
    checkout: {
      en: 'Not sure if you need this? You can also speak with a licensed attorney directly.',
      es: 'No estás seguro si necesitas esto? También puedes hablar con un abogado licenciado directamente.',
    },
    general: {
      en: 'For complex legal situations, we recommend consulting with a licensed attorney.',
      es: 'Para situaciones legales complejas, recomendamos consultar con un abogado licenciado.',
    },
  };

  const msg = contextMessages[context];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-slate-700" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            {en ? 'Need human help?' : 'Necesitas ayuda humana?'}
          </h4>
          <p className="text-sm text-slate-600 mb-3">{en ? msg.en : msg.es}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/find-attorney"
              className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800 font-medium"
            >
              {en ? 'Find an attorney' : 'Buscar un abogado'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              to="/pro-bono"
              className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800 font-medium"
            >
              {en ? 'Free legal help' : 'Ayuda legal gratuita'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
