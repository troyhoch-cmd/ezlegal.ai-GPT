import { Lock, Clock, ShieldCheck, Eye, DollarSign, FileCheck, UserCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TRUST_SIGNALS, getTrustSignal } from '../../lib/microcopy';

type TrustSignalKey = keyof typeof TRUST_SIGNALS;

interface TrustModuleProps {
  signals: TrustSignalKey[];
  variant?: 'chips' | 'list' | 'inline' | 'minimal';
  className?: string;
}

const iconMap: Record<TrustSignalKey, typeof Lock> = {
  SECURE: Lock,
  AVAILABLE_24_7: Clock,
  NO_SIGNUP: ShieldCheck,
  CONFIDENTIAL: Eye,
  FREE_TO_USE: DollarSign,
  REAL_CITATIONS: FileCheck,
  EXPERT_REVIEWED: UserCheck
};

export default function TrustModule({
  signals,
  variant = 'chips',
  className = ''
}: TrustModuleProps) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  if (variant === 'chips') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 ${className}`}>
        {signals.map(signal => {
          const Icon = iconMap[signal];
          return (
            <div
              key={signal}
              className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full"
            >
              <Icon className="w-4 h-4 text-teal-300" aria-hidden="true" />
              <span className="text-white font-medium text-sm">
                {getTrustSignal(signal, lang)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <ul className={`space-y-2 ${className}`}>
        {signals.map(signal => {
          const Icon = iconMap[signal];
          return (
            <li key={signal} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-teal-600" aria-hidden="true" />
              <span className="text-navy-700">{getTrustSignal(signal, lang)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-4 text-sm text-navy-500 ${className}`}>
        {signals.map((signal, index) => {
          const Icon = iconMap[signal];
          return (
            <span key={signal} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              {getTrustSignal(signal, lang)}
              {index < signals.length - 1 && <span className="mx-2 text-navy-300">|</span>}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {signals.slice(0, 3).map(signal => {
        const Icon = iconMap[signal];
        return (
          <div key={signal} className="flex items-center gap-1.5 text-sm text-navy-500">
            <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
            <span>{getTrustSignal(signal, lang)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HeroTrustChips({ className = '' }: { className?: string }) {
  return (
    <TrustModule
      signals={['SECURE', 'AVAILABLE_24_7', 'NO_SIGNUP']}
      variant="chips"
      className={className}
    />
  );
}

export function FormTrustSignals({ className = '' }: { className?: string }) {
  return (
    <TrustModule
      signals={['CONFIDENTIAL', 'SECURE']}
      variant="inline"
      className={className}
    />
  );
}

export function ResultsTrustSignals({ className = '' }: { className?: string }) {
  return (
    <TrustModule
      signals={['REAL_CITATIONS', 'EXPERT_REVIEWED']}
      variant="inline"
      className={className}
    />
  );
}
