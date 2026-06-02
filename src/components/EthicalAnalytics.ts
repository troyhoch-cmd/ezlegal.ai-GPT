type AnalyticsEvent =
  | 'path_selected'
  | 'language_selected'
  | 'checkup_started'
  | 'checkup_step_completed'
  | 'checkup_abandoned'
  | 'results_viewed'
  | 'urgent_resources_opened'
  | 'review_screen_viewed'
  | 'referral_consent_viewed'
  | 'referral_consent_checked'
  | 'referral_packet_download_clicked'
  | 'partner_demo_clicked'
  | 'pricing_viewed'
  | 'smb_pricing_viewed'
  | 'governance_page_viewed'
  | 'export_clicked';

interface EventPayload {
  event: AnalyticsEvent;
  path?: string;
  language?: string;
  step?: string;
  format?: string;
  timestamp: string;
}

const QUEUE: EventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (QUEUE.length === 0) return;
  const batch = QUEUE.splice(0);
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-chat`;
    try {
      navigator.sendBeacon(url, JSON.stringify({ type: 'analytics_batch', events: batch }));
    } catch {
      // Silent fail — analytics must never block the user
    }
  }
}

export function trackEthical(event: AnalyticsEvent, metadata?: { path?: string; language?: string; step?: string; format?: string }) {
  const payload: EventPayload = {
    event,
    path: metadata?.path,
    language: metadata?.language,
    step: metadata?.step,
    format: metadata?.format,
    timestamp: new Date().toISOString(),
  };
  QUEUE.push(payload);

  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 2000);
}

export function trackPathSelected(path: string) {
  trackEthical('path_selected', { path });
}

export function trackLanguageSelected(language: string) {
  trackEthical('language_selected', { language });
}

export function trackCheckupStarted(path?: string) {
  trackEthical('checkup_started', { path });
}

export function trackUrgentResourcesOpened() {
  trackEthical('urgent_resources_opened');
}

export function trackReviewScreenViewed() {
  trackEthical('review_screen_viewed');
}

export function trackReferralConsentViewed() {
  trackEthical('referral_consent_viewed');
}

export function trackPricingViewed() {
  trackEthical('pricing_viewed');
}

export function trackCheckupStepCompleted(step: string, path?: string) {
  trackEthical('checkup_step_completed', { step, path });
}

export function trackCheckupAbandoned(step: string, path?: string) {
  trackEthical('checkup_abandoned', { step, path });
}

export function trackResultsViewed(path?: string) {
  trackEthical('results_viewed', { path });
}

export function trackReferralConsentChecked(path?: string) {
  trackEthical('referral_consent_checked', { path });
}

export function trackReferralPacketDownloadClicked(format?: string) {
  trackEthical('referral_packet_download_clicked', { format });
}

export function trackPartnerDemoClicked() {
  trackEthical('partner_demo_clicked');
}

export function trackSmbPricingViewed() {
  trackEthical('smb_pricing_viewed');
}

export function trackGovernancePageViewed() {
  trackEthical('governance_page_viewed');
}

export function trackExportClicked(format: string) {
  trackEthical('export_clicked', { format });
}
