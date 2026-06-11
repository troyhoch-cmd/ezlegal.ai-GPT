import { Shield, Lock, Brain, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface TrustCTABlockProps {
  variant?: 'standard' | 'compact';
}

export default function TrustCTABlock({ variant = 'standard' }: TrustCTABlockProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const links = [
    { to: '/trust-center', icon: Shield, labelEn: 'Trust Center', labelEs: 'Centro de Confianza' },
    { to: '/privacy', icon: Lock, labelEn: 'Privacy', labelEs: 'Privacidad' },
    { to: '/ai-governance', icon: Brain, labelEn: 'AI Governance', labelEs: 'Gobernanza de IA' },
    { to: '/scope-disclaimers', icon: Eye, labelEn: 'Scope & Disclaimers', labelEs: 'Alcance y Avisos' },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 px-2.5 py-1.5 bg-white rounded-full border border-slate-200 hover:border-teal-300 transition"
            >
              <Icon className="w-3 h-3" aria-hidden="true" />
              {en ? link.labelEn : link.labelEs}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-3 text-center">
        {en ? 'Transparency & Trust' : 'Transparencia y Confianza'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:shadow-sm transition text-center"
            >
              <Icon className="w-5 h-5 text-teal-600" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700">{en ? link.labelEn : link.labelEs}</span>
            </Link>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 text-center mt-3">
        {en
          ? 'ezLegal provides legal information and tools, not legal advice.'
          : 'ezLegal proporciona información y herramientas legales, no asesoría legal.'}
      </p>
    </div>
  );
}
