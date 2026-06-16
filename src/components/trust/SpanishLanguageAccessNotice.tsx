import { Globe, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface SpanishLanguageAccessNoticeProps {
  variant?: 'card' | 'banner' | 'inline';
  className?: string;
}

export default function SpanishLanguageAccessNotice({
  variant = 'card',
  className = '',
}: SpanishLanguageAccessNoticeProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const content = {
    title: en ? 'Available in Spanish' : 'Disponible en Español',
    esTitle: 'Aviso de Acceso en Español',
    notAdvice: 'Esta es información legal, no asesoramiento legal.',
    notLawFirm: 'ezLegal.ai no es un bufete de abogados.',
    noRelationship: 'El uso de este servicio no crea una relación abogado-cliente.',
    consultAttorney: 'Para asesoramiento legal específico, consulte a un abogado licenciado en su jurisdicción.',
    freeHelp: 'Recursos de ayuda legal gratuita disponibles.',
    humanEscalation: 'Puede hablar con un abogado si su situación lo requiere.',
    bilingualCta: en ? 'View in Spanish' : 'Ver en Español',
    helpCta: en ? 'Get Bilingual Help' : 'Obtener Ayuda Bilingüe',
  };

  if (variant === 'inline') {
    return (
      <div
        data-testid="spanish-language-access-notice"
        className={`flex items-center gap-2 ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
        <Link
          to="/espanol"
          className="text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
        >
          {content.bilingualCta}
        </Link>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        data-testid="spanish-language-access-notice"
        className={`bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 ${className}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span className="text-xs font-medium text-teal-800">
              {en ? 'This page is also available in Spanish' : 'Esta página también está disponible en español'}
            </span>
          </div>
          <Link
            to="/espanol"
            className="text-xs font-medium text-teal-700 bg-teal-100 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors"
          >
            {content.bilingualCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="spanish-language-access-notice"
      className={`bg-teal-50 border border-teal-200 rounded-xl p-4 sm:p-5 ${className}`}
      role="note"
      aria-label={content.esTitle}
      lang="es"
    >
      <div className="flex items-start gap-3">
        <div className="bg-teal-100 rounded-lg p-2 flex-shrink-0">
          <Globe className="w-5 h-5 text-teal-700" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-teal-900 text-sm mb-2">{content.esTitle}</h4>
          <div className="space-y-1.5 text-xs text-teal-800">
            <p>{content.notAdvice}</p>
            <p>{content.notLawFirm}</p>
            <p>{content.noRelationship}</p>
            <p>{content.consultAttorney}</p>
            <p className="font-medium">{content.freeHelp}</p>
            <p className="font-medium">{content.humanEscalation}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              to="/espanol"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              {content.bilingualCta}
            </Link>
            <Link
              to="/pro-bono"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-white border border-teal-300 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              {content.helpCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
