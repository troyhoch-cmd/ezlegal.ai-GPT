import AIGovernanceNotice from './AIGovernanceNotice';
import ScopeBoundaryCard from './ScopeBoundaryCard';
import JurisdictionNotice from './JurisdictionNotice';
import HumanEscalationCard from './HumanEscalationCard';
import SpanishLanguageAccessNotice from './SpanishLanguageAccessNotice';
import DataUseAndPrivacyCard from './DataUseAndPrivacyCard';

interface TrustDisclosurePanelProps {
  showAIGovernance?: boolean;
  showScope?: boolean;
  showJurisdiction?: boolean;
  showHumanEscalation?: boolean;
  showSpanish?: boolean;
  showDataPrivacy?: boolean;
  jurisdictionValue?: string;
  onJurisdictionChange?: (j: string) => void;
  variant?: 'full' | 'compact';
  className?: string;
}

export default function TrustDisclosurePanel({
  showAIGovernance = true,
  showScope = true,
  showJurisdiction = false,
  showHumanEscalation = true,
  showSpanish = true,
  showDataPrivacy = true,
  jurisdictionValue,
  onJurisdictionChange,
  variant = 'full',
  className = '',
}: TrustDisclosurePanelProps) {
  const isCompact = variant === 'compact';

  return (
    <aside
      data-testid="trust-disclosure-panel"
      className={`space-y-3 ${className}`}
      aria-label="Trust & Safety Information"
    >
      {showAIGovernance && (
        <AIGovernanceNotice variant={isCompact ? 'compact' : 'banner'} />
      )}
      {showScope && (
        <ScopeBoundaryCard variant={isCompact ? 'banner' : 'card'} />
      )}
      {showJurisdiction && (
        <JurisdictionNotice
          variant="selector"
          selectedJurisdiction={jurisdictionValue}
          onJurisdictionChange={onJurisdictionChange}
        />
      )}
      {showHumanEscalation && (
        <HumanEscalationCard variant={isCompact ? 'compact' : 'full'} />
      )}
      {showSpanish && (
        <SpanishLanguageAccessNotice variant={isCompact ? 'banner' : 'card'} />
      )}
      {showDataPrivacy && (
        <DataUseAndPrivacyCard variant={isCompact ? 'compact' : 'card'} />
      )}
    </aside>
  );
}
