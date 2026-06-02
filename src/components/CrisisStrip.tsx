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
    es: '¿Estás enfrentando un desalojo, ICE o violencia doméstica?',
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

  const base =
    'inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium rounded-full tap-highlight-none max-w-full';
  const styles =
    variant === 'hero'
      ? 'bg-red-50 text-red-900 border border-red-200 px-3 sm:px-4 py-2 hover:bg-red-100'
      : 'bg-white/10 text-white border border-white/30 px-3 sm:px-4 py-2 hover:bg-white/20';

  return (
    <Link
      to="/emergency-resources"
      className={`${base} ${styles} focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors`}
      aria-label={`${label} ${cta}`}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <bdi className="truncate min-w-0" style={{ unicodeBidi: 'isolate' }}>{label}</bdi>
      <bdi className="font-semibold underline underline-offset-2 whitespace-nowrap hidden sm:inline" style={{ unicodeBidi: 'isolate' }}>{cta}</bdi>
      <ArrowRight className="h-4 w-4 flex-shrink-0 rtl-mirror" aria-hidden="true" />
    </Link>
  );
}
