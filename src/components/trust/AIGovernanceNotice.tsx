import { Brain, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface AIGovernanceNoticeProps {
  variant?: 'banner' | 'compact' | 'inline';
  className?: string;
}

export default function AIGovernanceNotice({
  variant = 'banner',
  className = '',
}: AIGovernanceNoticeProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const content = {
    title: en ? 'AI-Generated Information' : 'Información Generada por IA',
    notAdvice: en
      ? 'This AI provides legal information, not legal advice.'
      : 'Esta IA proporciona información legal, no asesoramiento legal.',
    mayBeWrong: en
      ? 'AI outputs may be wrong, incomplete, or outdated. Always verify with a licensed attorney.'
      : 'Las respuestas de la IA pueden ser incorrectas, incompletas o desactualizadas. Siempre verifique con un abogado licenciado.',
    governance: en ? 'AI Governance' : 'Gobernanza de IA',
    howReviewed: en ? 'How Reports Are Reviewed' : 'Cómo se Revisan los Reportes',
  };

  if (variant === 'inline') {
    return (
      <p
        data-testid="ai-governance-notice"
        className={`text-xs text-slate-500 flex items-center gap-1.5 ${className}`}
      >
        <Brain className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{content.notAdvice} {content.mayBeWrong}</span>
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        data-testid="ai-governance-notice"
        className={`bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 ${className}`}
      >
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-blue-800 space-y-0.5">
            <p className="font-medium">{content.notAdvice}</p>
            <p>{content.mayBeWrong}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="ai-governance-notice"
      className={`bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 ${className}`}
      role="note"
      aria-label={content.title}
    >
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
          <Brain className="w-5 h-5 text-blue-700" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-blue-900 text-sm mb-1">{content.title}</h4>
          <div className="space-y-1.5 text-xs text-blue-800">
            <p className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{content.notAdvice}</span>
            </p>
            <p className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{content.mayBeWrong}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link
              to="/ai-governance"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
            >
              {content.governance}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </Link>
            <Link
              to="/how-reports-are-reviewed"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
            >
              {content.howReviewed}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
