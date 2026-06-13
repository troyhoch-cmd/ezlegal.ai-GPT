import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, Lock, Phone, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Safeguard {
  icon: typeof ShieldCheck;
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
}

const SAFEGUARDS: Safeguard[] = [
  {
    icon: Bot,
    titleEn: 'Legal information, not advice',
    titleEs: 'Información legal, no asesoría',
    bodyEn: 'ezLegal.ai provides general legal information. We are not a law firm and do not provide legal advice or representation.',
    bodyEs: 'ezLegal.ai proporciona información legal general. No somos un bufete de abogados y no brindamos asesoría ni representación legal.',
  },
  {
    icon: AlertTriangle,
    titleEn: 'AI can be wrong',
    titleEs: 'La IA puede equivocarse',
    bodyEn: 'AI-generated responses may contain errors or be outdated. Always verify important information with a licensed attorney or official source.',
    bodyEs: 'Las respuestas generadas por IA pueden contener errores o estar desactualizadas. Siempre verifica información importante con un abogado o fuente oficial.',
  },
  {
    icon: Lock,
    titleEn: 'Privacy basics',
    titleEs: 'Privacidad básica',
    bodyEn: 'Your conversations are encrypted in transit and at rest. We do not sell your data or use it to train AI models. Attorney-client privilege does not apply.',
    bodyEs: 'Tus conversaciones están cifradas en tránsito y en reposo. No vendemos tus datos ni los usamos para entrenar modelos de IA. El privilegio abogado-cliente no aplica.',
  },
  {
    icon: Phone,
    titleEn: 'When to contact a lawyer',
    titleEs: 'Cuándo contactar a un abogado',
    bodyEn: 'For court appearances, complex disputes, custody matters, criminal charges, or any situation requiring legal representation — consult a licensed attorney.',
    bodyEs: 'Para comparecencias, disputas complejas, custodia, cargos penales o cualquier situación que requiera representación legal — consulta a un abogado con licencia.',
  },
  {
    icon: ShieldCheck,
    titleEn: 'Crisis escalation',
    titleEs: 'Escalamiento en crisis',
    bodyEn: 'If you face immediate danger, eviction, or domestic violence, we route you to verified emergency resources and hotlines.',
    bodyEs: 'Si enfrentas peligro inmediato, desalojo o violencia doméstica, te dirigimos a recursos de emergencia y líneas de ayuda verificadas.',
  },
];

export default function SafeguardsSection() {
  const [expanded, setExpanded] = useState(false);
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-2 mx-auto"
        aria-expanded={expanded}
        aria-controls="safeguards-panel"
      >
        <ShieldCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{en ? 'Learn about our safeguards' : 'Conoce nuestras protecciones'}</span>
        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        }
      </button>

      {expanded && (
        <div
          id="safeguards-panel"
          className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-slide-up"
        >
          <div className="divide-y divide-slate-100">
            {SAFEGUARDS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titleEn} className="flex gap-3 px-4 py-4 sm:px-5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900 leading-tight break-words">
                      {en ? item.titleEn : item.titleEs}
                    </p>
                    <p className="text-xs text-navy-600 leading-relaxed mt-1 break-words">
                      {en ? item.bodyEn : item.bodyEs}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 text-center">
            <Link
              to="/trust-center"
              className="text-xs font-medium text-teal-700 hover:text-teal-600 underline underline-offset-2"
            >
              {en ? 'View full Trust Center' : 'Ver Centro de Confianza completo'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
