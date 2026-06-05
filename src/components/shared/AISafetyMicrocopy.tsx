import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Users, Lock, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Variant = 'info' | 'warning' | 'urgent' | 'compact';

interface BaseProps {
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  info: 'bg-slate-100 border-slate-200 text-slate-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  urgent: 'bg-red-50 border-red-200 text-red-900',
  compact: 'bg-transparent border-transparent text-slate-500',
};

export function ScopeNotice({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-start gap-2 ${isCompact ? 'py-1' : 'p-3 rounded-xl border'} ${variantStyles[variant]} ${className}`}>
      <Shield className={`${isCompact ? 'w-3.5 h-3.5 mt-0.5' : 'w-4 h-4 mt-0.5'} shrink-0`} aria-hidden="true" />
      <p className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        {en
          ? 'This is legal information, not legal advice. No attorney-client relationship is created.'
          : 'Esto es información legal, no asesoría legal. No se crea relación abogado-cliente.'}
        {!isCompact && (
          <>
            {' '}
            <Link to="/scope-disclaimers" className="underline underline-offset-2 hover:opacity-80">
              {en ? 'Scope limits' : 'Límites de alcance'}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export function NotLegalAdviceBanner({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium">
        {en
          ? 'This is legal information, not legal advice.'
          : 'Esto es información legal, no asesoría legal.'}
      </p>
    </div>
  );
}

export function HumanEscalationCard({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Users className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm leading-relaxed">
          {en
            ? 'You may need a lawyer or legal aid organization for this issue.'
            : 'Puede necesitar un abogado u organización de ayuda legal para este asunto.'}
        </p>
        <Link
          to="/find-attorney"
          className="inline-block mt-1.5 text-sm font-medium underline underline-offset-2 hover:opacity-80"
        >
          {en ? 'Find legal help' : 'Encontrar ayuda legal'}
        </Link>
      </div>
    </div>
  );
}

export function PrivacyMicrocopy({ variant = 'info', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-start gap-2 ${isCompact ? 'py-1' : 'p-3 rounded-xl border'} ${variantStyles[variant]} ${className}`}>
      <Lock className={`${isCompact ? 'w-3.5 h-3.5 mt-0.5' : 'w-4 h-4 mt-0.5'} shrink-0`} aria-hidden="true" />
      <p className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        {en
          ? 'Do not upload documents you are not comfortable sharing. Conversations are encrypted.'
          : 'No suba documentos que no se sienta cómodo compartiendo. Las conversaciones están cifradas.'}
        {!isCompact && (
          <>
            {' '}
            <Link to="/privacy-at-a-glance" className="underline underline-offset-2 hover:opacity-80">
              {en ? 'Privacy details' : 'Detalles de privacidad'}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export function DeadlineWarning({ variant = 'warning', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Clock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">
        {en
          ? 'Deadlines matter. If you have a court date or filing deadline, tell us the date so we can prioritize.'
          : 'Las fechas límite son importantes. Si tiene una fecha de corte o plazo, díganos para priorizar.'}
      </p>
    </div>
  );
}

export function SpanishScopeNotice({ variant = 'info', className = '' }: BaseProps) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border ${variantStyles[variant]} ${className}`}>
      <Shield className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">
        Esto es información legal, no asesoría legal. Las fechas límite son importantes. Si está en peligro inmediato, llame al 911.{' '}
        <Link to="/scope-disclaimers" className="underline underline-offset-2 hover:opacity-80">
          Alcance y límites
        </Link>
      </p>
    </div>
  );
}

export function UrgentSafetyNotice({ variant = 'urgent', className = '' }: BaseProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${variantStyles[variant]} ${className}`} role="alert">
      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">
          {en
            ? 'If you are in immediate danger, call 911.'
            : 'Si está en peligro inmediato, llame al 911.'}
        </p>
        <Link
          to="/emergency-resources"
          className="inline-block mt-1 text-sm font-medium underline underline-offset-2 hover:opacity-80"
        >
          {en ? 'Emergency resources' : 'Recursos de emergencia'}
        </Link>
      </div>
    </div>
  );
}
