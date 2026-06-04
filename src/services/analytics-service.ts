import { supabase } from '../lib/supabase';

export type ConversionEvent =
  | 'page_view'
  | 'language_selected'
  | 'primary_cta_clicked'
  | 'intake_started'
  | 'intake_step_completed'
  | 'intake_abandoned'
  | 'jurisdiction_entered'
  | 'ai_answer_requested'
  | 'ai_answer_shown'
  | 'source_panel_opened'
  | 'human_help_clicked'
  | 'signup_started'
  | 'signup_completed'
  | 'payment_started'
  | 'payment_completed'
  | 'support_contacted'
  | 'partner_referral_landed'
  | 'handoff_requested'
  | 'privacy_gate_accepted'
  | 'icp_card_clicked'
  | 'referral_cta_clicked'
  | 'urgent_signal_detected'
  | 'chat_started'
  | 'first_question_submitted'
  | 'handoff_opened'
  | 'handoff_submitted'
  | 'handoff_failed'
  | 'partner_referral_clicked'
  | 'landing_view'
  | 'home_viewed'
  | 'home_cta_clicked'
  | 'issue_card_clicked'
  | 'urgent_resources_clicked'
  | 'wizard_started'
  | 'wizard_completed'
  | 'summary_downloaded'
  | 'partner_cta_clicked'
  | 'demo_requested'
  | 'espanol_landing_viewed'
  | 'espanol_issue_selected'
  | 'espanol_cta_clicked'
  | 'business_problem_selected'
  | 'business_cta_clicked'
  | 'persona_intake_step'
  | 'persona_selected'
  | 'persona_intake_completed'
  | 'save_progress_attempted'
  | 'nav_start_checkup_click'
  | 'hero_start_checkup_click'
  | 'mobile_sticky_start_click'
  | 'urgent_strip_click'
  | 'inline_emergency_resources_click'
  | 'language_toggle_en'
  | 'language_toggle_es'
  | 'icp_individual_click'
  | 'icp_smb_click'
  | 'icp_legal_aid_click'
  | 'situation_chip_click'
  | 'reading_preferences_open'
  | 'intake_text_entered'
  | 'homepage_viewed'
  | 'hero_checkup_started'
  | 'icp_route_selected'
  | 'urgent_help_clicked'
  | 'smb_issue_started'
  | 'partner_demo_clicked'
  | 'org_governance_clicked'
  | 'spanish_triage_started'
  | 'spanish_emergency_triage_shown'
  | 'spanish_free_help_selected'
  | 'spanish_paid_document_selected'
  | 'triage_persona_selected'
  | 'triage_issue_selected'
  | 'triage_urgency_selected'
  | 'triage_completed'
  | 'referral_consent_decision'
  | 'smb_attorney_review_selected'
  | 'smb_demo_clicked'
  | 'smb_pricing_clicked'
  | 'smb_segment_selected'
  | 'smb_checkout_scope_acknowledged'
  | 'smb_intake_completed'
  | 'org_partner_intake_completed'
  | 'org_demo_clicked'
  | 'org_partner_intake_started'
  | 'org_governance_clicked'
  | 'sensitive_data_warning_shown'
  | 'conversation_deleted'
  | 'response_feedback'
  | 'language_switched';

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

interface PartnerAttribution {
  partnerId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  refCode: string | null;
}

const ATTRIBUTION_KEY = 'ezlegal-partner-attribution';

function getSessionId(): string {
  const key = 'ezlegal-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

let currentLanguage = 'en';
let currentJurisdiction: string | null = null;

export function setAnalyticsLanguage(lang: string) {
  currentLanguage = lang;
}

export function setAnalyticsJurisdiction(jurisdiction: string | null) {
  currentJurisdiction = jurisdiction;
}

function getAttribution(): PartnerAttribution {
  const stored = localStorage.getItem(ATTRIBUTION_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return { partnerId: null, utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, refCode: null };
}

export function captureAttribution(): void {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref') || params.get('partner') || null;
  const utmSource = params.get('utm_source') || null;
  const utmMedium = params.get('utm_medium') || null;
  const utmCampaign = params.get('utm_campaign') || null;
  const utmContent = params.get('utm_content') || null;

  if (!refCode && !utmSource) return;

  const attribution: PartnerAttribution = {
    partnerId: refCode,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    refCode,
  };

  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));

  if (refCode) {
    trackEvent('partner_referral_landed', {
      partner_id: refCode,
      utm_source: utmSource || '',
      utm_medium: utmMedium || '',
      utm_campaign: utmCampaign || '',
    });
  }
}

export function trackEvent(
  eventName: ConversionEvent,
  properties: EventProperties = {}
) {
  const sessionId = getSessionId();
  const attribution = getAttribution();

  const payload = {
    event_name: eventName,
    event_type: eventName,
    session_id: sessionId,
    properties,
    page_path: window.location.pathname,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    language: currentLanguage,
    jurisdiction: currentJurisdiction,
    metadata: {
      ...properties,
      ...(attribution.partnerId ? { partner_id: attribution.partnerId } : {}),
      ...(attribution.utmSource ? { utm_source: attribution.utmSource } : {}),
      ...(attribution.utmMedium ? { utm_medium: attribution.utmMedium } : {}),
      ...(attribution.utmCampaign ? { utm_campaign: attribution.utmCampaign } : {}),
    },
  };

  supabase.auth.getUser().then(({ data }) => {
    const row = data?.user ? { ...payload, user_id: data.user.id } : payload;
    supabase.from('analytics_events').insert(row).then(() => {});
  });
}

export function trackPageView(path?: string) {
  trackEvent('page_view', { path: path || window.location.pathname });
}
