import { Brain, Scale, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import AIResponseFeedback from './AIResponseFeedback';

interface AIDisclosureProps {
  messageId: string;
  compact?: boolean;
  className?: string;
}

export default function AIDisclosure({ messageId, compact = false, className = '' }: AIDisclosureProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (compact) {
    return (
      <div className={`mt-2 space-y-1 ${className}`} role="note" aria-label={en ? 'AI disclosure' : 'Divulgacion de IA'}>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <Brain className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          <span>
            {en
              ? 'AI-generated legal information, not legal advice.'
              : 'Informacion legal generada por IA, no asesoramiento legal.'}
          </span>
        </p>
        <AIResponseFeedback messageId={messageId} language={language === 'es' ? 'es' : 'en'} compact />
      </div>
    );
  }

  return (
    <div
      className={`mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 ${className}`}
      role="note"
      aria-label={en ? 'AI disclosure' : 'Divulgacion de IA'}
    >
      <div className="flex items-start gap-2.5">
        <Brain className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-xs text-slate-600 font-medium">
            {en
              ? 'This is legal information, not legal advice. Results may be incomplete or outdated.'
              : 'Esto es informacion legal, no asesoramiento legal. Los resultados pueden ser incompletos o desactualizados.'}
          </p>
          <p className="text-xs text-slate-500">
            <Scale className="w-3 h-3 inline-block mr-1" aria-hidden="true" />
            {en
              ? 'Focused on Arizona law. Verify with a licensed attorney for your situation.'
              : 'Enfocado en la ley de Arizona. Verifique con un abogado licenciado para su situacion.'}
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/find-attorney"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
            >
              {en ? 'Find a lawyer' : 'Buscar un abogado'}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </Link>
            <Link
              to="/ai-governance"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 hover:underline"
            >
              {en ? 'AI governance' : 'Gobernanza de IA'}
            </Link>
          </div>
          <AIResponseFeedback messageId={messageId} language={language === 'es' ? 'es' : 'en'} compact />
        </div>
      </div>
    </div>
  );
}
