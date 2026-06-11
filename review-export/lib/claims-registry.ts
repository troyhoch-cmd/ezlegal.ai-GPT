export type ClaimType = 'security' | 'privacy' | 'compliance' | 'coverage' | 'performance' | 'service' | 'pricing';

export interface ClaimEntry {
  claim: string;
  claim_type: ClaimType;
  evidence: string;
  scope: string;
  owner: string;
  surfaces: string[];
  lastReviewed: string;
}

export const CLAIMS_REGISTRY: Record<string, ClaimEntry> = {
  'tls-encryption': {
    claim: 'TLS 1.3 encryption in transit',
    claim_type: 'security',
    evidence: 'Supabase infrastructure uses TLS 1.3 for all connections',
    scope: 'Data in transit between client and server only',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['VerifiableTrustStrip', 'ForBusiness', 'ForPartners', 'EnterpriseSecurity', 'SLA'],
    lastReviewed: '2026-02',
  },
  'aes-256-encryption': {
    claim: 'AES-256 encryption at rest',
    claim_type: 'security',
    evidence: 'Supabase/AWS encrypts stored data with AES-256',
    scope: 'Data at rest in database and storage only',
    owner: 'Infrastructure (Supabase/AWS)',
    surfaces: ['VerifiableTrustStrip', 'ForBusiness', 'ForPartners', 'ForOrganizations', 'EnterpriseSecurity'],
    lastReviewed: '2026-02',
  },
  'soc2-type2': {
    claim: 'SOC 2 Type II certified infrastructure',
    claim_type: 'compliance',
    evidence: 'Supabase holds SOC 2 Type II certification for its managed cloud infrastructure',
    scope: 'Infrastructure provider certification; does not cover ezLegal application layer',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['ForPartners', 'EnterpriseSecurity', 'ForBusiness FAQ'],
    lastReviewed: '2026-02',
  },
  'zero-training': {
    claim: 'We never use your data to train AI models',
    claim_type: 'privacy',
    evidence: 'Internal policy: no client data used for model training; OpenAI API data not used for training per API ToS',
    scope: 'All user-submitted data including chat messages, documents, and prediction inputs',
    owner: 'ezLegal Engineering',
    surfaces: ['VerifiableTrustStrip', 'ForBusiness', 'TrustCenter', 'PrivacyPolicy'],
    lastReviewed: '2026-02',
  },
  'ccpa-compliance': {
    claim: 'CCPA compliant',
    claim_type: 'compliance',
    evidence: 'Data export, deletion, and opt-out endpoints implemented; 45-day fulfillment target',
    scope: 'California residents; data rights per CCPA requirements',
    owner: 'ezLegal Legal/Engineering',
    surfaces: ['VerifiableTrustStrip', 'PrivacyPolicy', 'ForPartners'],
    lastReviewed: '2026-02',
  },
  'attorney-reviewed-templates': {
    claim: 'Attorney-reviewed template library',
    claim_type: 'service',
    evidence: 'Templates reviewed by licensed attorneys for legal accuracy at the template level',
    scope: 'Review is at template level, not per-user or per-purchase; does not constitute legal advice; does not create attorney-client relationship',
    owner: 'ezLegal Legal/Content',
    surfaces: ['IssuePacks', 'Pricing', 'PricingChooser', 'ForIndividuals', 'ForBusiness', 'TrustLogos'],
    lastReviewed: '2026-02',
  },
  'fifty-state-coverage': {
    claim: '50-state US coverage',
    claim_type: 'coverage',
    evidence: 'Jurisdiction selector includes all 50 US states; AI responses are jurisdiction-aware',
    scope: 'Coverage depth varies by state and case type; not all legal areas have equal data density',
    owner: 'ezLegal Engineering/Content',
    surfaces: ['Home', 'ForBusiness', 'CasePredictor'],
    lastReviewed: '2026-02',
  },
  'source-coverage-indicator': {
    claim: 'Source coverage 25-95% confidence indicator',
    claim_type: 'performance',
    evidence: 'Estimated from text pattern matching against citation database; not verified retrieval accuracy',
    scope: 'Indicates breadth of citation support, not prediction accuracy; high coverage does not equal correctness; laws vary by jurisdiction',
    owner: 'ezLegal Engineering',
    surfaces: ['Chatbot'],
    lastReviewed: '2026-02',
  },
  'target-uptime-999': {
    claim: '99.9% target uptime',
    claim_type: 'service',
    evidence: 'Target based on Supabase infrastructure SLA; not a contractual guarantee at base tier',
    scope: 'Starter/Individual/Pro plans; ~43 min/month max downtime; excludes scheduled maintenance',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['ForPartners', 'SLA'],
    lastReviewed: '2026-02',
  },
  'target-uptime-9995': {
    claim: '99.95% target uptime',
    claim_type: 'service',
    evidence: 'Enterprise-tier target; contractual SLA available on request',
    scope: 'Enterprise/LSO Professional plans only; ~22 min/month max downtime',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['ForPartners', 'SLA'],
    lastReviewed: '2026-02',
  },
  'bilingual-support': {
    claim: 'Bilingual English/Spanish support',
    claim_type: 'service',
    evidence: 'LanguageContext with translation keys; Spanish landing page; bilingual components',
    scope: 'UI text and common legal terms; not full legal translation service',
    owner: 'ezLegal Engineering/Content',
    surfaces: ['Home', 'Navigation', 'EspanolLanding', 'IssuePacks', 'CasePredictor'],
    lastReviewed: '2026-02',
  },
  'crisis-detection': {
    claim: 'Crisis detection and emergency resource escalation',
    claim_type: 'service',
    evidence: 'Keyword-based crisis detection in CrisisEscalationCard; routes to verified hotlines',
    scope: 'Keyword matching only; not clinical assessment; resources are third-party hotlines',
    owner: 'ezLegal Engineering',
    surfaces: ['Chatbot', 'EmergencyResources'],
    lastReviewed: '2026-02',
  },
  'case-predictor-methodology': {
    claim: 'Data-informed probability range estimate',
    claim_type: 'performance',
    evidence: 'Statistical model comparing user inputs against publicly available case outcome data',
    scope: 'Estimate only, not legal advice or guarantee; based on public data which excludes settlements; varies by state/case type; updated periodically, not real-time. GOVERNANCE: performance-type claim -- requires methodology disclosure on every surface',
    owner: 'ezLegal Engineering',
    surfaces: ['CasePredictor', 'OutcomePredictionWidget'],
    lastReviewed: '2026-02',
  },
  'case-predictor-sample-preview': {
    claim: 'Sample prediction report with illustrative data (hundreds of cases compared, 65-78% probability range)',
    claim_type: 'performance',
    evidence: 'Fictional example for marketing illustration; no real case data displayed; all values are representative, not measured',
    scope: 'Hero preview on CasePredictor page only; labeled "Illustrative Example" with disclaimer footer; does not represent actual system output or real case analysis',
    owner: 'ezLegal Marketing/Engineering',
    surfaces: ['CasePredictor'],
    lastReviewed: '2026-02',
  },
  'money-back-guarantee': {
    claim: '30-day money-back guarantee',
    claim_type: 'pricing',
    evidence: 'Refund policy implemented in checkout flow',
    scope: 'Applies to Issue Pack purchases; Stripe-processed refunds',
    owner: 'ezLegal Business',
    surfaces: ['IssuePacks', 'Checkout', 'Pricing'],
    lastReviewed: '2026-02',
  },
  'negotiation-preparation-stat': {
    claim: '73% of prepared negotiators get better outcomes',
    claim_type: 'performance',
    evidence: 'General negotiation research (Harvard PON, Malhotra & Bazerman); not an ezLegal-specific metric',
    scope: 'Industry research statistic, not an ezLegal performance claim. Refers to negotiation preparation in general, not to this specific tool. GOVERNANCE: must always include source attribution',
    owner: 'ezLegal Content',
    surfaces: ['Negotiate'],
    lastReviewed: '2026-02',
  },
  'anchoring-improvement-stat': {
    claim: '2-3x initial offer improvement from anchoring',
    claim_type: 'performance',
    evidence: 'General negotiation research on anchoring effects (Galinsky & Mussweiler, 2001); not an ezLegal-specific metric',
    scope: 'Academic research on anchoring technique effectiveness, not an ezLegal performance claim. Actual results vary by situation. GOVERNANCE: must always include source attribution',
    owner: 'ezLegal Content',
    surfaces: ['Negotiate'],
    lastReviewed: '2026-02',
  },
  '24-7-availability': {
    claim: '24/7 AI availability',
    claim_type: 'service',
    evidence: 'AI chatbot runs on Supabase + OpenAI API infrastructure; no business-hours restriction',
    scope: 'AI responses only; attorney matching and human support are business-hours only; subject to uptime SLA and API provider availability',
    owner: 'ezLegal Engineering',
    surfaces: ['Home', 'Features', 'ChannelLanding', 'ForBusiness'],
    lastReviewed: '2026-02',
  },
};

export const BANNED_PHRASES = [
  'attorney-approved',
  'bank-level security',
  'guaranteed results',
  '100% accurate',
  'always correct',
  'never wrong',
  'join thousands',
  'trusted by thousands',
  '10,000+ businesses',
  '50+ active partners',
  'serving 3x more',
  '29,000+ satisfied',
  '50k+ questions',
  '4.8/5',
  'save 80%',
];

export const DISCLAIMER_TERMS = [
  'attorney-client privilege',
  'guaranteed outcome',
];

export function getClaimEntry(key: string): ClaimEntry | undefined {
  return CLAIMS_REGISTRY[key];
}

export function getClaimSurfaces(key: string): string[] {
  return CLAIMS_REGISTRY[key]?.surfaces || [];
}

export function validateClaimText(text: string): string[] {
  const violations: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      violations.push(phrase);
    }
  }
  return violations;
}
