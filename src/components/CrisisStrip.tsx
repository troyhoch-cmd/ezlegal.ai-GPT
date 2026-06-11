import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  variant?: 'hero' | 'inline';
}

export default function CrisisStrip({ variant = 'hero' }: Props) {
  const { language, t } = useLanguage();

  const LABELS: Record<string, string> = {
    en: 'Facing eviction, ICE, or domestic violence?',
    es: '¿Enfrentas desalojo, ICE o violencia doméstica?',
    ar: t('crisis.label'),
    he: t('crisis.label'),
  };
  const CTAS: Record<string, string> = {
    en: 'Get urgent help',
    es: 'Obtén ayuda urgente',
    ar: t('crisis.cta'),
    he: t('crisis.cta'),
  };
  const label = LABELS[language] ?? LABELS.en;
  const cta = CTAS[language] ?? CTAS.en;

  if (variant === 'inline') {
    return (
      <Link
        to="/emergency-resources"
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium rounded-2xl min-h-[44px] px-4 py-2.5 bg-rose-600 text-white border border-rose-400/60 hover:bg-rose-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-navy-900 transition-colors w-full max-w-sm mx-auto"
        aria-label={`${label} ${cta}`}
      >
        <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-center">{label}</span>
        <span className="font-bold underline underline-offset-2 whitespace-nowrap">{cta}</span>
        <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link
      to="/emergency-resources"
      className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium rounded-full min-h-[44px] px-4 py-2.5 bg-red-50 text-red-900 border border-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors max-w-full"
      aria-label={`${label} ${cta}`}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
      <span className="font-semibold underline underline-offset-2 whitespace-nowrap">{cta}</span>
      <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
    </Link>
  );
}
