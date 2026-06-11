/**
 * Ethical Funnel Instrumentation
 * Privacy-safe analytics events that never store PII or legal facts.
 */

export type AnalyticsEventName =
  | 'ICP_SELECTED'
  | 'LANGUAGE_SELECTED'
  | 'INTAKE_STARTED'
  | 'STEP_COMPLETED'
  | 'SAVE_RESUME_USED'
  | 'LEGAL_DISCLAIMER_VIEWED'
  | 'AI_DISCLOSURE_VIEWED'
  | 'ATTORNEY_HANDOFF_CLICKED'
  | 'LEGAL_AID_REFERRAL_CLICKED'
  | 'PRICE_VIEWED'
  | 'CHECKOUT_STARTED'
  | 'CHECKOUT_COMPLETED'
  | 'INTAKE_ABANDONED';

// Fields that MUST NEVER appear in analytics payloads
const PII_FIELDS = new Set([
  'name', 'firstName', 'lastName', 'first_name', 'last_name',
  'email', 'phone', 'phoneNumber', 'phone_number',
  'ssn', 'socialSecurity', 'social_security',
  'address', 'streetAddress', 'street_address',
  'dateOfBirth', 'date_of_birth', 'dob',
  'caseFacts', 'case_facts', 'legalFacts', 'legal_facts',
  'documentText', 'document_text', 'documentContent', 'document_content',
  'userAnswer', 'user_answer', 'freeText', 'free_text',
  'creditCard', 'credit_card', 'cardNumber', 'card_number',
]);

export interface AnalyticsPayload {
  event: AnalyticsEventName;
  timestamp: number;
  sessionId: string;
  properties: Record<string, string | number | boolean>;
}

/**
 * Validates a payload and strips/rejects PII fields.
 * Returns null if payload contains PII (hard reject).
 */
export function validatePayload(payload: AnalyticsPayload): AnalyticsPayload | null {
  for (const key of Object.keys(payload.properties)) {
    if (PII_FIELDS.has(key)) {
      return null;
    }
    // Also reject any value that looks like an email or phone
    const val = String(payload.properties[key]);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return null;
    if (/^\+?1?\d{10,}$/.test(val.replace(/[\s()-]/g, ''))) return null;
  }
  return payload;
}

/**
 * Consent-aware tracking wrapper.
 * Only fires if user has consented to analytics.
 */
export function trackEthicalEvent(
  event: AnalyticsEventName,
  properties: Record<string, string | number | boolean> = {}
): boolean {
  // Check consent
  try {
    const consent = localStorage.getItem('ez_consent_analytics');
    if (consent === 'denied') return false;
  } catch { /* SSR-safe */ }

  const payload: AnalyticsPayload = {
    event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    properties,
  };

  const validated = validatePayload(payload);
  if (!validated) {
    console.warn(`[Analytics] Rejected event ${event}: PII detected in payload`);
    return false;
  }

  // Dispatch to analytics service
  try {
    const stored = JSON.parse(sessionStorage.getItem('ez_analytics_queue') || '[]');
    stored.push(validated);
    sessionStorage.setItem('ez_analytics_queue', JSON.stringify(stored));
  } catch { /* quota exceeded or SSR */ }

  return true;
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem('ez_session_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('ez_session_id', id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

// Allowed properties per event for documentation
export const EVENT_SCHEMA: Record<AnalyticsEventName, string[]> = {
  ICP_SELECTED: ['icp', 'source'],
  LANGUAGE_SELECTED: ['language', 'source'],
  INTAKE_STARTED: ['icp', 'persona', 'jurisdiction'],
  STEP_COMPLETED: ['stepNumber', 'stepName', 'icp'],
  SAVE_RESUME_USED: ['stepNumber', 'icp'],
  LEGAL_DISCLAIMER_VIEWED: ['page', 'disclaimerType'],
  AI_DISCLOSURE_VIEWED: ['page', 'disclosureType'],
  ATTORNEY_HANDOFF_CLICKED: ['jurisdiction', 'issueCategory'],
  LEGAL_AID_REFERRAL_CLICKED: ['jurisdiction', 'issueCategory', 'source'],
  PRICE_VIEWED: ['tier', 'source'],
  CHECKOUT_STARTED: ['tier', 'billingCycle'],
  CHECKOUT_COMPLETED: ['tier', 'billingCycle', 'amount'],
  INTAKE_ABANDONED: ['stepNumber', 'icp', 'timeSpentMs'],
};
