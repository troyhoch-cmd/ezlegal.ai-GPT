import { Shield, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { type ReviewStatus, getStatusColor, getStatusLabel } from '../data/legalContentStatus';
import { useLanguage } from '../contexts/LanguageContext';

interface LegalReviewBadgeProps {
  status: ReviewStatus;
  compact?: boolean;
}

export function LegalReviewBadge({ status, compact = false }: LegalReviewBadgeProps) {
  const { language } = useLanguage();
  const colorClass = getStatusColor(status);
  const label = getStatusLabel(status, language);

  const Icon = status === 'approved' ? CheckCircle
    : status === 'needs-revision' || status === 'expired' ? AlertTriangle
    : status === 'under-review' || status === 'pending-review' ? Clock
    : status === 'ai-generated' ? FileText
    : Shield;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
        title={label}
      >
        <Icon className="w-3 h-3" aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
