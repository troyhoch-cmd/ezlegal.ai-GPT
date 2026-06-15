import { Phone, Users, Scale, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface HumanEscalationCardProps {
  variant?: 'full' | 'compact' | 'inline';
  showEmergency?: boolean;
  showLegalAid?: boolean;
  showLawyerMatch?: boolean;
  className?: string;
}

export default function HumanEscalationCard({
  variant = 'full',
  showEmergency = true,
  showLegalAid = true,
  showLawyerMatch = true,
  className = '',
}: HumanEscalationCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const content = {
    title: en ? 'Need Human Help?' : 'Necesita Ayuda Humana?',
    subtitle: en
      ? 'AI has limits. Here are paths to human assistance:'
      : 'La IA tiene límites. Aquí hay opciones de asistencia humana:',
    emergency: {
      title: en ? 'Emergency Resources' : 'Recursos de Emergencia',
      desc: en ? 'Crisis hotline: 988 | DV hotline: 1-800-799-7233' : 'Línea de crisis: 988 | Violencia doméstica: 1-800-799-7233',
    },
    legalAid: {
      title: en ? 'Free Legal Aid' : 'Ayuda Legal Gratuita',
      desc: en ? 'Pro bono attorneys & legal aid organizations' : 'Abogados pro bono y organizaciones de ayuda legal',
      cta: en ? 'Find Free Help' : 'Encontrar Ayuda Gratuita',
    },
    lawyer: {
      title: en ? 'Talk to a Lawyer' : 'Hablar con un Abogado',
      desc: en ? 'Get matched with a licensed attorney in your area' : 'Conecte con un abogado licenciado en su área',
      cta: en ? 'Find a Lawyer' : 'Buscar un Abogado',
    },
  };

  if (variant === 'inline') {
    return (
      <div data-testid="human-escalation-card" className={`flex flex-wrap items-center gap-3 ${className}`}>
        {showLawyerMatch && (
          <Link
            to="/find-attorney"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {content.lawyer.cta}
          </Link>
        )}
        {showLegalAid && (
          <Link
            to="/pro-bono"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {content.legalAid.cta}
          </Link>
        )}
        {showEmergency && (
          <Link
            to="/emergency-resources"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            988
          </Link>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        data-testid="human-escalation-card"
        className={`bg-teal-50 border border-teal-200 rounded-lg p-3 ${className}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-teal-700" aria-hidden="true" />
          <span className="text-xs font-semibold text-teal-900">{content.title}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {showLawyerMatch && (
            <Link to="/find-attorney" className="text-xs text-teal-700 hover:underline font-medium">
              {content.lawyer.cta}
            </Link>
          )}
          {showLegalAid && (
            <Link to="/pro-bono" className="text-xs text-teal-700 hover:underline font-medium">
              {content.legalAid.cta}
            </Link>
          )}
          {showEmergency && (
            <Link to="/emergency-resources" className="text-xs text-red-600 hover:underline font-medium">
              {content.emergency.title}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="human-escalation-card"
      className={`bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-4 sm:p-5 ${className}`}
      role="complementary"
      aria-label={content.title}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-teal-100 rounded-lg p-1.5">
          <Users className="w-5 h-5 text-teal-700" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-teal-900 text-sm">{content.title}</h4>
          <p className="text-xs text-teal-700">{content.subtitle}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {showEmergency && (
          <Link
            to="/emergency-resources"
            className="flex items-start gap-3 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors group"
          >
            <Phone className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 group-hover:text-red-700">{content.emergency.title}</p>
              <p className="text-xs text-slate-600">{content.emergency.desc}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          </Link>
        )}

        {showLegalAid && (
          <Link
            to="/pro-bono"
            className="flex items-start gap-3 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors group"
          >
            <Scale className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{content.legalAid.title}</p>
              <p className="text-xs text-slate-600">{content.legalAid.desc}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          </Link>
        )}

        {showLawyerMatch && (
          <Link
            to="/find-attorney"
            className="flex items-center justify-center gap-2 bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {content.lawyer.cta}
          </Link>
        )}
      </div>
    </div>
  );
}
