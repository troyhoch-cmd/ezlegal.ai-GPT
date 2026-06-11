/**
 * Global Legal AI Standards
 * Canonical audit checklist for ezlegal.ai
 *
 * Every requirement has an id, category, priority, and implementation status.
 * Use this file as the single source of truth for compliance audits.
 */

export type StandardStatus = 'implemented' | 'partial' | 'missing' | 'not_applicable';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Category =
  | 'access_to_justice'
  | 'legal_ai_safety'
  | 'ai_reliability'
  | 'privacy_data_protection'
  | 'upl_controls'
  | 'conversion_ux'
  | 'professional_standards';

export interface Standard {
  id: string;
  category: Category;
  priority: Priority;
  requirement: string;
  status: StandardStatus;
  implementedIn?: string[];
  notes?: string;
}

export const GLOBAL_LEGAL_AI_STANDARDS: Standard[] = [
  // ─── 1. ACCESS TO JUSTICE ───────────────────────────────────────────────────
  {
    id: 'A2J-001',
    category: 'access_to_justice',
    priority: 'critical',
    requirement: 'Plain-language UX: all user-facing text at 8th-grade reading level or below',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/TabbedResponse.tsx', 'src/hooks/useReadingPreferences.ts'],
    notes: 'Reading preferences exist but not all pages enforce plain-language defaults',
  },
  {
    id: 'A2J-002',
    category: 'access_to_justice',
    priority: 'critical',
    requirement: 'Spanish-first or bilingual support: users can access all primary flows in Spanish without going through English first',
    status: 'partial',
    implementedIn: ['src/pages/EspanolLanding.tsx', 'src/contexts/LanguageContext.tsx', 'src/lib/translations.ts'],
    notes: 'Spanish landing and context exist but not all flows are fully translated',
  },
  {
    id: 'A2J-003',
    category: 'access_to_justice',
    priority: 'high',
    requirement: 'Low cognitive load: one primary action per screen, progressive disclosure, minimal form fields',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/', 'src/components/GuidedIssueLauncher.tsx'],
    notes: 'Cognitive load components exist; some pages still show too much content at once',
  },
  {
    id: 'A2J-004',
    category: 'access_to_justice',
    priority: 'critical',
    requirement: 'Mobile-friendly flows: all primary user journeys usable on 320px viewport',
    status: 'partial',
    implementedIn: ['src/components/MobileBottomNav.tsx', 'src/components/MobileDrawer.tsx'],
    notes: 'Mobile nav exists; need responsive audit of intake flows',
  },
  {
    id: 'A2J-005',
    category: 'access_to_justice',
    priority: 'high',
    requirement: 'Clear next steps for users who cannot afford a lawyer: free options, legal aid referrals, self-help resources',
    status: 'partial',
    implementedIn: ['src/pages/EmergencyResources.tsx', 'src/pages/ProBonoIntake.tsx', 'src/components/PersonaNextSteps.tsx'],
    notes: 'Emergency resources and pro bono intake exist; need unified "I cannot afford a lawyer" path',
  },
  {
    id: 'A2J-006',
    category: 'access_to_justice',
    priority: 'high',
    requirement: 'Referrals to legal aid, pro bono, court self-help, or emergency resources when appropriate',
    status: 'partial',
    implementedIn: ['src/components/CrisisEscalationCard.tsx', 'src/components/shared/CrisisResourceCard.tsx'],
    notes: 'Crisis cards exist; need contextual triggering in chat/triage flows',
  },

  // ─── 2. LEGAL AI SAFETY ─────────────────────────────────────────────────────
  {
    id: 'SAFE-001',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Clear disclaimer: product provides legal information, not legal advice',
    status: 'implemented',
    implementedIn: ['src/components/shared/LegalDisclaimer.tsx', 'src/components/templates/LegalDisclosureModule.tsx'],
  },
  {
    id: 'SAFE-002',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'No attorney-client relationship unless explicitly created by a licensed provider',
    status: 'implemented',
    implementedIn: ['src/components/shared/AttorneyServiceDisclosure.tsx', 'src/lib/legal-disclosures.ts'],
  },
  {
    id: 'SAFE-003',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Jurisdiction-aware responses: AI must identify and limit answers to relevant jurisdiction',
    status: 'partial',
    implementedIn: ['src/components/shared/JurisdictionSelector.tsx', 'src/data/jurisdictions.ts'],
    notes: 'Selector exists but chat service does not always enforce jurisdiction context',
  },
  {
    id: 'SAFE-004',
    category: 'legal_ai_safety',
    priority: 'high',
    requirement: 'No unsupported guarantees about legal outcomes',
    status: 'implemented',
    implementedIn: ['src/components/OutcomePredictionWidget.tsx', 'src/components/PredictionConsentGate.tsx'],
  },
  {
    id: 'SAFE-005',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Encourage lawyer review for high-risk matters',
    status: 'partial',
    implementedIn: ['src/components/HighRiskPackGate.tsx', 'src/components/NextBestStep.tsx'],
    notes: 'Gate exists; need consistent triggering across all high-risk detection points',
  },
  {
    id: 'SAFE-006',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Escalation paths for emergencies: eviction, immigration, DV, criminal, court deadlines',
    status: 'partial',
    implementedIn: ['src/components/CrisisTriageGate.tsx', 'src/components/CrisisStrip.tsx', 'src/lib/urgent-signal-detector.ts'],
    notes: 'Detection logic exists; need to wire it into all chat entry points',
  },

  // ─── 3. AI RELIABILITY ──────────────────────────────────────────────────────
  {
    id: 'REL-001',
    category: 'ai_reliability',
    priority: 'critical',
    requirement: 'Avoid hallucinated citations: never fabricate case names, statutes, or agency names',
    status: 'partial',
    implementedIn: ['src/components/CitationDisplay.tsx', 'src/lib/claims-registry.ts'],
    notes: 'Citation display exists; edge function prompt needs hallucination-prevention instructions',
  },
  {
    id: 'REL-002',
    category: 'ai_reliability',
    priority: 'high',
    requirement: 'When law, forms, deadlines, or eligibility rules are uncertain, explicitly say so',
    status: 'partial',
    implementedIn: ['src/components/CoverageConfidenceIndicator.tsx'],
    notes: 'Confidence indicator exists; AI prompt must include uncertainty disclosure instructions',
  },
  {
    id: 'REL-003',
    category: 'ai_reliability',
    priority: 'high',
    requirement: 'Prefer cited, verifiable sources where available',
    status: 'partial',
    implementedIn: ['src/components/CitationDisplay.tsx', 'supabase/functions/legalbreeze-rag/index.ts'],
    notes: 'RAG function exists; citation rendering implemented',
  },
  {
    id: 'REL-004',
    category: 'ai_reliability',
    priority: 'high',
    requirement: 'Ask clarifying questions before generating legal documents',
    status: 'partial',
    implementedIn: ['src/components/CourtReadyOutputBuilder.tsx'],
    notes: 'Builder has steps; need pre-generation confirmation gate',
  },
  {
    id: 'REL-005',
    category: 'ai_reliability',
    priority: 'critical',
    requirement: 'Do not fabricate laws, case names, agencies, or filing rules',
    status: 'partial',
    implementedIn: ['src/lib/claims-registry.ts'],
    notes: 'Claims registry validates known sources; AI system prompt must reinforce this',
  },

  // ─── 4. PRIVACY AND DATA PROTECTION ────────────────────────────────────────
  {
    id: 'PRIV-001',
    category: 'privacy_data_protection',
    priority: 'critical',
    requirement: 'Minimize collection of sensitive personal data',
    status: 'partial',
    implementedIn: ['src/components/PrivacyMicroPanel.tsx', 'src/lib/consent.ts'],
    notes: 'Consent framework exists; some forms collect more than needed',
  },
  {
    id: 'PRIV-002',
    category: 'privacy_data_protection',
    priority: 'critical',
    requirement: 'Warn users before they enter confidential information',
    status: 'partial',
    implementedIn: ['src/components/DocumentUploadWarning.tsx'],
    notes: 'Document warning exists; chat input needs pre-submission warning for sensitive topics',
  },
  {
    id: 'PRIV-003',
    category: 'privacy_data_protection',
    priority: 'high',
    requirement: 'Do not expose user data in logs, analytics, prompts, or error messages',
    status: 'partial',
    implementedIn: ['src/lib/error-handler.ts'],
    notes: 'Error handler sanitizes; need audit of analytics events for PII leakage',
  },
  {
    id: 'PRIV-004',
    category: 'privacy_data_protection',
    priority: 'high',
    requirement: 'Deletion and export pathways for user data',
    status: 'implemented',
    implementedIn: ['supabase/functions/data-deletion/index.ts', 'supabase/functions/data-export/index.ts'],
  },
  {
    id: 'PRIV-005',
    category: 'privacy_data_protection',
    priority: 'critical',
    requirement: 'Protect especially sensitive data: immigration status, health, finances, DV, minors, criminal',
    status: 'partial',
    implementedIn: ['src/lib/urgent-signal-detector.ts'],
    notes: 'Signal detector identifies sensitive topics; need data-handling policy enforcement in storage',
  },

  // ─── 5. UNAUTHORIZED PRACTICE OF LAW CONTROLS ──────────────────────────────
  {
    id: 'UPL-001',
    category: 'upl_controls',
    priority: 'critical',
    requirement: 'Do not tell users what they "should" do as legal strategy',
    status: 'partial',
    implementedIn: ['src/lib/legal-disclosures.ts'],
    notes: 'Disclosures exist; AI system prompt must avoid directive language',
  },
  {
    id: 'UPL-002',
    category: 'upl_controls',
    priority: 'critical',
    requirement: 'Present options, risks, and general information rather than personalized legal conclusions',
    status: 'partial',
    implementedIn: ['src/components/LegalResponseFormatter.tsx'],
    notes: 'Formatter structures responses; AI prompt must reinforce options-based framing',
  },
  {
    id: 'UPL-003',
    category: 'upl_controls',
    priority: 'high',
    requirement: 'Include "consult a lawyer/legal aid" pathways for complex or high-stakes matters',
    status: 'partial',
    implementedIn: ['src/components/NextBestStep.tsx', 'src/components/AttorneyConnections.tsx'],
    notes: 'Components exist; need consistent display after every AI response on high-risk topics',
  },

  // ─── 6. CONVERSION AND UX STANDARDS ────────────────────────────────────────
  {
    id: 'CUX-001',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Minimize form fields: no field without clear purpose',
    status: 'partial',
    implementedIn: ['src/components/ValidatedFormField.tsx'],
    notes: 'Validated fields exist; some intake forms have unnecessary fields',
  },
  {
    id: 'CUX-002',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Progressive disclosure: show details only when relevant',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/CollapsibleSidebar.tsx', 'src/components/cognitive-load/TabbedResponse.tsx'],
  },
  {
    id: 'CUX-003',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Avoid long walls of text: chunk content, use headings, bullets',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/TabbedResponse.tsx'],
  },
  {
    id: 'CUX-004',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Clear primary CTA per screen',
    status: 'partial',
    implementedIn: ['src/pages/Home.tsx', 'src/pages/Pricing.tsx'],
    notes: 'Main pages have CTAs; some interior pages lack clear primary action',
  },
  {
    id: 'CUX-005',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Trust-building copy without overclaiming',
    status: 'implemented',
    implementedIn: ['src/components/TrustBadges.tsx', 'src/components/VerifiableTrustStrip.tsx', 'src/lib/claims-registry.ts'],
  },
  {
    id: 'CUX-006',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Pricing, free options, or eligibility paths are clear',
    status: 'implemented',
    implementedIn: ['src/pages/Pricing.tsx', 'src/components/pricing/'],
  },
  {
    id: 'CUX-007',
    category: 'conversion_ux',
    priority: 'critical',
    requirement: 'Spanish-language users not forced through English-first flows',
    status: 'partial',
    implementedIn: ['src/pages/EspanolLanding.tsx', 'src/contexts/LanguageContext.tsx'],
    notes: 'Landing page exists; chat and triage flows still default to English',
  },

  // ─── 7. PROFESSIONAL / LSO STANDARDS ───────────────────────────────────────
  {
    id: 'PRO-001',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Support referral workflows between AI triage and human lawyers',
    status: 'implemented',
    implementedIn: ['src/components/ChatHandoffToolbar.tsx', 'src/components/LawyerConnectionModal.tsx'],
  },
  {
    id: 'PRO-002',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Support intake triage for legal service organizations',
    status: 'implemented',
    implementedIn: ['src/components/TriageIntake.tsx', 'src/components/intake/'],
  },
  {
    id: 'PRO-003',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Admin review capability for AI-generated outputs',
    status: 'implemented',
    implementedIn: ['src/pages/Admin.tsx', 'src/pages/AdminAuditLog.tsx'],
  },
  {
    id: 'PRO-004',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Audit trails for all AI-generated legal outputs',
    status: 'implemented',
    implementedIn: ['supabase/migrations/20260327225238_enhance_admin_audit_log_system.sql'],
  },
  {
    id: 'PRO-005',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Human override and review capability for AI recommendations',
    status: 'partial',
    implementedIn: ['src/components/ChatHandoffToolbar.tsx'],
    notes: 'Handoff toolbar exists; need explicit "flag for review" action on any AI output',
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

export function getStandardsByCategory(category: Category): Standard[] {
  return GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.category === category);
}

export function getStandardsByStatus(status: StandardStatus): Standard[] {
  return GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === status);
}

export function getCriticalGaps(): Standard[] {
  return GLOBAL_LEGAL_AI_STANDARDS.filter(
    s => s.priority === 'critical' && (s.status === 'missing' || s.status === 'partial')
  );
}

export function getComplianceScore(): { total: number; implemented: number; partial: number; missing: number; percentage: number } {
  const total = GLOBAL_LEGAL_AI_STANDARDS.length;
  const implemented = GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === 'implemented').length;
  const partial = GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === 'partial').length;
  const missing = GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === 'missing').length;
  const percentage = Math.round(((implemented + partial * 0.5) / total) * 100);
  return { total, implemented, partial, missing, percentage };
}

export function getAuditSummary(): string {
  const score = getComplianceScore();
  const criticalGaps = getCriticalGaps();
  return `Compliance: ${score.percentage}% (${score.implemented} implemented, ${score.partial} partial, ${score.missing} missing of ${score.total}). Critical gaps: ${criticalGaps.length}.`;
}
