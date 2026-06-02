import { Brain, Shield, Eye, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface AIGovernanceSummaryProps {
  variant?: 'card' | 'strip';
}

export default function AIGovernanceSummary({ variant = 'card' }: AIGovernanceSummaryProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const principles = [
    {
      icon: Brain,
      titleEn: 'Transparent AI',
      titleEs: 'IA Transparente',
      descEn: 'We disclose when AI is used and explain its limitations.',
      descEs: 'Divulgamos cuándo se usa IA y explicamos sus limitaciones.',
    },
    {
      icon: Shield,
      titleEn: 'No training on your data',
      titleEs: 'No entrenamos con tus datos',
      descEn: 'Your conversations are never used to train AI models.',
      descEs: 'Tus conversaciones nunca se usan para entrenar modelos de IA.',
    },
    {
      icon: Eye,
      titleEn: 'Human oversight',
      titleEs: 'Supervisión humana',
      descEn: 'High-risk situations are flagged for human review.',
      descEs: 'Situaciones de alto riesgo se señalan para revisión humana.',
    },
    {
      icon: Lock,
      titleEn: 'Data minimization',
      titleEs: 'Minimización de datos',
      descEn: 'We collect only what is needed to help you.',
      descEs: 'Solo recopilamos lo necesario para ayudarte.',
    },
  ];

  if (variant === 'strip') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4 justify-center">
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                <Icon className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                <span className="font-medium">{en ? p.titleEn : p.titleEs}</span>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2">
          <Link to="/ai-governance" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            {en ? 'View AI Governance' : 'Ver Gobernanza de IA'} &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {en ? 'AI Governance Principles' : 'Principios de Gobernanza de IA'}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {principles.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{en ? p.titleEn : p.titleEs}</p>
                <p className="text-xs text-slate-600 mt-0.5">{en ? p.descEn : p.descEs}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-4">
        <Link to="/ai-governance" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {en ? 'Full AI Governance' : 'Gobernanza de IA completa'} &rarr;
        </Link>
        <Link to="/trust-center" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
          {en ? 'Trust Center' : 'Centro de Confianza'} &rarr;
        </Link>
      </div>
    </div>
  );
}
