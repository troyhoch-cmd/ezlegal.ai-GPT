import { Scale, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScopeBoundaryCardProps {
  variant?: 'card' | 'banner' | 'inline';
  className?: string;
}

export default function ScopeBoundaryCard({
  variant = 'card',
  className = '',
}: ScopeBoundaryCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const content = {
    title: en ? 'Service Scope' : 'Alcance del Servicio',
    notLawFirm: en
      ? 'ezLegal.ai is not a law firm. No licensed attorney will represent you unless one separately agrees to do so.'
      : 'ezLegal.ai no es un bufete de abogados. Ningún abogado licenciado lo representará a menos que uno acepte hacerlo por separado.',
    noRelationship: en
      ? 'Using this AI does not create an attorney-client relationship. Your inputs are not protected by attorney-client privilege.'
      : 'El uso de esta IA no crea una relación abogado-cliente. Sus entradas no están protegidas por el privilegio abogado-cliente.',
    learnMore: en ? 'Full Scope Disclaimers' : 'Descargos Completos',
  };

  if (variant === 'inline') {
    return (
      <p
        data-testid="scope-boundary-card"
        className={`text-xs text-slate-500 ${className}`}
      >
        <Scale className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
        {content.notLawFirm}
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        data-testid="scope-boundary-card"
        className={`bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 ${className}`}
      >
        <div className="flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-medium">{content.notLawFirm}</p>
            <p>{content.noRelationship}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="scope-boundary-card"
      className={`bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 ${className}`}
      role="note"
      aria-label={content.title}
    >
      <div className="flex items-start gap-3">
        <div className="bg-slate-200 rounded-lg p-2 flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-slate-700" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm mb-2">{content.title}</h4>
          <div className="space-y-2 text-xs text-slate-700">
            <p>{content.notLawFirm}</p>
            <p>{content.noRelationship}</p>
          </div>
          <Link
            to="/scope-disclaimers"
            className="inline-block mt-3 text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
          >
            {content.learnMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
