import type { ReviewUrgency } from './types';

type AttorneyReviewEvent =
  | { event: 'attorney_review_recommended'; businessSegment: string; documentType: string | null; triggerReasons: string[] }
  | { event: 'attorney_review_cta_clicked'; businessSegment: string; tierId: string }
  | { event: 'attorney_review_acknowledged'; requestId: string }
  | { event: 'attorney_review_request_created'; requestId: string; tierId: string; urgency: ReviewUrgency; priceCents: number }
  | { event: 'attorney_review_declined'; businessSegment: string; documentType: string | null };

export function trackAttorneyReviewEvent(payload: AttorneyReviewEvent): void {
  if (typeof window !== 'undefined' && 'dataLayer' in window) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push(payload);
  }
}
