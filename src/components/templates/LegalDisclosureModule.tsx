import { AlertTriangle, Info, Shield, Scale } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LEGAL_DISCLOSURES, getDisclosure } from '../../lib/microcopy';

type DisclosureKey = keyof typeof LEGAL_DISCLOSURES;

interface LegalDisclosureModuleProps {
  disclosures: DisclosureKey[];
  variant?: 'inline' | 'banner' | 'footer' | 'modal';
  showIcon?: boolean;
  className?: string;
}

const variantStyles = {
  inline: 'bg-navy-50 border border-navy-200 rounded-lg px-4 py-3',
  banner: 'bg-navy-800/60 backdrop-blur-sm border border-navy-600/50 rounded-xl px-6 py-4',
  footer: 'bg-slate-50 border-t border-slate-200 px-6 py-4',
  modal: 'bg-amber-50 border border-amber-200 rounded-lg px-4 py-3'
};

const textStyles = {
  inline: 'text-navy-700 text-sm',
  banner: 'text-white/90 text-base',
  footer: 'text-slate-600 text-xs',
  modal: 'text-amber-800 text-sm'
};

const iconStyles = {
  inline: 'text-navy-500',
  banner: 'text-teal-300',
  footer: 'text-slate-400',
  modal: 'text-amber-600'
};

export default function LegalDisclosureModule({
  disclosures,
  variant = 'inline',
  showIcon = true,
  className = ''
}: LegalDisclosureModuleProps) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  const Icon = variant === 'modal' ? AlertTriangle : variant === 'banner' ? Shield : Info;

  const content = disclosures.map(key => getDisclosure(key, lang)).join(' ');

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[variant]}`} aria-hidden="true" />
        )}
        <p className={`${textStyles[variant]} leading-relaxed`}>
          {content}
        </p>
      </div>
    </div>
  );
}

interface StandardDisclaimerProps {
  variant?: 'hero' | 'form' | 'results' | 'compact';
  className?: string;
}

export function StandardDisclaimer({ variant = 'hero', className = '' }: StandardDisclaimerProps) {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  if (variant === 'hero') {
    return (
      <LegalDisclosureModule
        disclosures={['NOT_LEGAL_ADVICE', 'NO_ATTORNEY_CLIENT']}
        variant="banner"
        className={className}
      />
    );
  }

  if (variant === 'form') {
    return (
      <LegalDisclosureModule
        disclosures={['NOT_LEGAL_ADVICE', 'CONFIDENTIALITY']}
        variant="inline"
        className={className}
      />
    );
  }

  if (variant === 'results') {
    return (
      <LegalDisclosureModule
        disclosures={['NOT_LEGAL_ADVICE', 'AI_TRANSPARENCY', 'JURISDICTION_LIMITS']}
        variant="inline"
        className={className}
      />
    );
  }

  return (
    <div className={`text-xs text-slate-500 ${className}`}>
      {getDisclosure('NOT_LEGAL_ADVICE', lang)}
    </div>
  );
}

export function ReferralDisclaimer({ className = '' }: { className?: string }) {
  return (
    <LegalDisclosureModule
      disclosures={['REFERRAL_ELIGIBILITY', 'NO_ATTORNEY_CLIENT']}
      variant="inline"
      className={className}
    />
  );
}

export function ProBonoDisclaimer({ className = '' }: { className?: string }) {
  return (
    <LegalDisclosureModule
      disclosures={['PRO_BONO_ELIGIBILITY', 'NO_ATTORNEY_CLIENT']}
      variant="inline"
      className={className}
    />
  );
}
