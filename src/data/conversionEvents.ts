import { supabase } from '../lib/supabase';

export type ConversionEvent =
  | 'home_viewed'
  | 'home_cta_clicked'
  | 'issue_chip_clicked'
  | 'urgent_resources_clicked'
  | 'intake_started'
  | 'intake_step_completed'
  | 'intake_completed'
  | 'urgent_resource_viewed'
  | 'referral_consent_shown'
  | 'referral_consent_accepted'
  | 'legal_aid_referral_clicked'
  | 'pricing_viewed'
  | 'plan_selected'
  | 'checkout_started'
  | 'checkout_completed'
  | 'language_toggled'
  | 'spanish_cta_clicked'
  | 'partner_demo_clicked';

export interface ConversionMeta {
  path?: string;
  language?: string;
  cta?: string;
  plan_id?: string;
  issue_category?: string;
  urgency_bucket?: string;
  source?: string;
}

const ALLOWED_META_KEYS: ReadonlySet<string> = new Set<keyof ConversionMeta>([
  'path',
  'language',
  'cta',
  'plan_id',
  'issue_category',
  'urgency_bucket',
  'source',
]);

const BLOCKED_PATTERNS = [
  'name', 'email', 'phone', 'ssn', 'social_security',
  'account_number', 'document_text', 'narrative', 'legal_text',
  'description', 'freetext', 'free_text', 'password', 'token',
  'id_number', 'a_number', 'case_facts', 'question', 'text',
];

export function sanitizeConversionMeta(meta: Record<string, unknown>): ConversionMeta {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (!ALLOWED_META_KEYS.has(key)) continue;
    if (BLOCKED_PATTERNS.some((p) => lower.includes(p))) continue;
    if (typeof value === 'string' && value.length <= 200) {
      clean[key] = value;
    }
  }
  return clean as ConversionMeta;
}

export const CONVERSION_EVENTS: Record<ConversionEvent, { description: string; safeFields: (keyof ConversionMeta)[] }> = {
  home_viewed: { description: 'User landed on homepage', safeFields: ['language'] },
  home_cta_clicked: { description: 'User clicked a CTA button', safeFields: ['cta', 'source'] },
  issue_chip_clicked: { description: 'User selected an issue chip', safeFields: ['issue_category'] },
  urgent_resources_clicked: { description: 'User navigated to urgent resources', safeFields: ['source'] },
  intake_started: { description: 'User began an intake flow', safeFields: ['path', 'language', 'issue_category'] },
  intake_step_completed: { description: 'User completed an intake step', safeFields: ['path', 'source'] },
  intake_completed: { description: 'User finished the full intake', safeFields: ['path', 'issue_category', 'urgency_bucket'] },
  urgent_resource_viewed: { description: 'User viewed an urgent resource card', safeFields: ['urgency_bucket', 'source'] },
  referral_consent_shown: { description: 'Referral consent was displayed', safeFields: ['path', 'source'] },
  referral_consent_accepted: { description: 'User accepted referral consent', safeFields: ['path', 'source'] },
  legal_aid_referral_clicked: { description: 'User clicked a legal aid referral', safeFields: ['source', 'issue_category'] },
  pricing_viewed: { description: 'User viewed pricing page', safeFields: ['language', 'source'] },
  plan_selected: { description: 'User selected a pricing plan', safeFields: ['plan_id', 'source'] },
  checkout_started: { description: 'User began checkout', safeFields: ['plan_id'] },
  checkout_completed: { description: 'User completed checkout', safeFields: ['plan_id'] },
  language_toggled: { description: 'User switched language', safeFields: ['language'] },
  spanish_cta_clicked: { description: 'User clicked a Spanish-language CTA', safeFields: ['cta', 'path'] },
  partner_demo_clicked: { description: 'User clicked partner demo CTA', safeFields: ['source', 'path'] },
};

export async function trackConversion(
  event: ConversionEvent,
  rawMeta: Record<string, unknown> = {}
): Promise<void> {
  const meta = sanitizeConversionMeta(rawMeta);

  try {
    const sessionId = sessionStorage.getItem('ezlegal-session-id') || crypto.randomUUID();
    if (!sessionStorage.getItem('ezlegal-session-id')) {
      sessionStorage.setItem('ezlegal-session-id', sessionId);
    }

    const { data: userData } = await supabase.auth.getUser();

    const row = {
      event_name: event,
      event_type: event,
      session_id: sessionId,
      properties: meta,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      language: meta.language || 'en',
      metadata: meta,
      ...(userData?.user ? { user_id: userData.user.id } : {}),
    };

    await supabase.from('analytics_events').insert(row);
  } catch {
    // no-op: analytics must never break the app
  }
}
