import type { ReviewUrgency } from './types';

export interface ReviewPricingTier {
  id: string;
  label: string;
  description: string;
  basePriceCents: number;
  urgencyMultiplier: Record<ReviewUrgency, number>;
  estimatedTurnaround: Record<ReviewUrgency, string>;
  includes: string[];
}

export const REVIEW_PRICING_TIERS: ReviewPricingTier[] = [
  {
    id: 'basic_review',
    label: 'Basic Document Review',
    description: 'Attorney reviews your document for completeness, accuracy, and identifies potential issues.',
    basePriceCents: 14900,
    urgencyMultiplier: { standard: 1.0, expedited: 1.5, emergency: 2.5 },
    estimatedTurnaround: { standard: '3-5 business days', expedited: '1-2 business days', emergency: 'Same day' },
    includes: [
      'Completeness check',
      'Accuracy verification',
      'Issue identification',
      'Brief written summary',
    ],
  },
  {
    id: 'detailed_review',
    label: 'Detailed Review with Recommendations',
    description: 'Comprehensive review with specific improvement recommendations and risk assessment.',
    basePriceCents: 29900,
    urgencyMultiplier: { standard: 1.0, expedited: 1.5, emergency: 2.5 },
    estimatedTurnaround: { standard: '5-7 business days', expedited: '2-3 business days', emergency: '1 business day' },
    includes: [
      'Everything in Basic Review',
      'Risk assessment',
      'Specific improvement recommendations',
      'Alternative clause suggestions',
      'Jurisdiction-specific notes',
    ],
  },
  {
    id: 'full_revision',
    label: 'Full Review and Revision',
    description: 'Attorney reviews and revises your document, returning a finalized version.',
    basePriceCents: 49900,
    urgencyMultiplier: { standard: 1.0, expedited: 1.5, emergency: 2.5 },
    estimatedTurnaround: { standard: '7-10 business days', expedited: '3-5 business days', emergency: '1-2 business days' },
    includes: [
      'Everything in Detailed Review',
      'Full document revision',
      'One round of follow-up questions',
      'Finalized document version',
    ],
  },
];

export function calculateReviewPrice(tierId: string, urgency: ReviewUrgency): number | null {
  const tier = REVIEW_PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;
  return Math.round(tier.basePriceCents * tier.urgencyMultiplier[urgency]);
}

export function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getEstimatedTurnaround(tierId: string, urgency: ReviewUrgency): string | null {
  const tier = REVIEW_PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;
  return tier.estimatedTurnaround[urgency];
}
