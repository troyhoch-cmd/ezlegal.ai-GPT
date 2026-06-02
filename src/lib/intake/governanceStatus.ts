export type PolicyStatus = 'implemented' | 'partial' | 'planned' | 'blocked';

export type GovernanceCategory =
  | 'ai_limitations'
  | 'privacy_data'
  | 'legal_aid_referral'
  | 'attorney_review'
  | 'partner_controls'
  | 'accessibility_language';

export interface GovernanceEvidence {
  id: string;
  labelEn: string;
  labelEs: string;
  category: GovernanceCategory;
  status: PolicyStatus;
  url?: string;
  evidencePath?: string;
  lastUpdated?: string;
  owner?: string;
  userImpactEn?: string;
  userImpactEs?: string;
  openGap?: string;
  nextAction?: string;
}

export const GOVERNANCE_CATEGORY_LABELS: Record<GovernanceCategory, { en: string; es: string }> = {
  ai_limitations: { en: 'AI Limitations & Scope', es: 'Limitaciones y Alcance de IA' },
  privacy_data: { en: 'Privacy & Data Handling', es: 'Privacidad y Manejo de Datos' },
  legal_aid_referral: { en: 'Legal-Aid Referral Governance', es: 'Gobernanza de Referencias de Ayuda Legal' },
  attorney_review: { en: 'Attorney Review Governance', es: 'Gobernanza de Revisión de Abogado' },
  partner_controls: { en: 'Partner Organization Controls', es: 'Controles de Organizaciones Asociadas' },
  accessibility_language: { en: 'Accessibility & Language Access', es: 'Accesibilidad y Acceso Lingüístico' },
};

export const GOVERNANCE_EVIDENCE: GovernanceEvidence[] = [
  {
    id: 'scope_boundaries',
    labelEn: 'Scope boundaries and limitations disclosure',
    labelEs: 'Divulgación de límites y limitaciones de alcance',
    category: 'ai_limitations',
    status: 'implemented',
    url: '/scope-disclaimers',
    evidencePath: 'src/lib/intake/scopeBoundaries.ts',
    lastUpdated: '2026-05-24',
    owner: 'product',
    userImpactEn: 'Users see clear can-help/cannot-do lists before purchasing.',
    userImpactEs: 'Los usuarios ven listas claras de lo que podemos/no podemos hacer antes de comprar.',
  },
  {
    id: 'training_data_policy',
    labelEn: 'Training data policy',
    labelEs: 'Política de datos de entrenamiento',
    category: 'privacy_data',
    status: 'implemented',
    url: '/ai-governance',
    lastUpdated: '2026-05-24',
    owner: 'engineering',
    userImpactEn: 'Users know their conversations are not used to train AI models.',
    userImpactEs: 'Los usuarios saben que sus conversaciones no se usan para entrenar modelos de IA.',
  },
  {
    id: 'retention_policy',
    labelEn: 'Data retention policy',
    labelEs: 'Política de retención de datos',
    category: 'privacy_data',
    status: 'implemented',
    url: '/privacy',
    lastUpdated: '2026-05-24',
    owner: 'legal',
    userImpactEn: 'Users can request data deletion at any time.',
    userImpactEs: 'Los usuarios pueden solicitar eliminación de datos en cualquier momento.',
  },
  {
    id: 'model_provider',
    labelEn: 'Model provider documentation',
    labelEs: 'Documentación del proveedor de modelo',
    category: 'ai_limitations',
    status: 'partial',
    owner: 'engineering',
    openGap: 'Provider documentation exists internally but is not yet published externally.',
    nextAction: 'Publish model card with provider details and limitations.',
    userImpactEn: 'Users will know which AI models power the platform.',
    userImpactEs: 'Los usuarios sabrán qué modelos de IA impulsan la plataforma.',
  },
  {
    id: 'evaluation_policy',
    labelEn: 'AI evaluation and testing methodology',
    labelEs: 'Metodología de evaluación y pruebas de IA',
    category: 'ai_limitations',
    status: 'planned',
    owner: 'engineering',
    openGap: 'Evaluation methodology is not yet formalized for external review.',
    nextAction: 'Document testing methodology and publish summary.',
  },
  {
    id: 'human_review_policy',
    labelEn: 'Human review escalation protocol',
    labelEs: 'Protocolo de escalación a revisión humana',
    category: 'ai_limitations',
    status: 'implemented',
    url: '/trust-center',
    evidencePath: 'src/components/trust/HumanEscalationCard.tsx',
    lastUpdated: '2026-05-24',
    owner: 'product',
    userImpactEn: 'Users are escalated to human help when AI reaches its limits.',
    userImpactEs: 'Los usuarios son escalados a ayuda humana cuando la IA llega a sus límites.',
  },
  {
    id: 'bias_monitoring',
    labelEn: 'Bias and fairness monitoring',
    labelEs: 'Monitoreo de sesgo y equidad',
    category: 'ai_limitations',
    status: 'implemented',
    url: '/bias-monitoring',
    lastUpdated: '2026-05-24',
    owner: 'engineering',
    userImpactEn: 'Platform monitors for biased outputs across demographics.',
    userImpactEs: 'La plataforma monitorea resultados sesgados entre demografías.',
  },
  {
    id: 'incident_response',
    labelEn: 'AI incident response plan',
    labelEs: 'Plan de respuesta a incidentes de IA',
    category: 'ai_limitations',
    status: 'planned',
    owner: 'engineering',
    openGap: 'Incident response plan exists internally but not published.',
    nextAction: 'Publish external-facing incident response summary.',
  },
  {
    id: 'language_limitations',
    labelEn: 'Language and accessibility limitations',
    labelEs: 'Limitaciones de idioma y accesibilidad',
    category: 'accessibility_language',
    status: 'implemented',
    url: '/ai-governance',
    lastUpdated: '2026-05-24',
    owner: 'product',
    userImpactEn: 'Users are informed about language support boundaries.',
    userImpactEs: 'Los usuarios son informados sobre los límites del soporte de idioma.',
  },
  {
    id: 'legal_aid_matching_transparency',
    labelEn: 'Legal-aid matching methodology and limitations',
    labelEs: 'Metodología y limitaciones del emparejamiento de ayuda legal',
    category: 'legal_aid_referral',
    status: 'implemented',
    evidencePath: 'src/lib/legalAid/matching.ts',
    lastUpdated: '2026-05-24',
    owner: 'product',
    userImpactEn: 'Users see why an organization was matched and know availability is not guaranteed.',
    userImpactEs: 'Los usuarios ven por qué se emparejó una organización y saben que la disponibilidad no está garantizada.',
    openGap: 'All directory entries still need external verification.',
  },
  {
    id: 'legal_aid_verification',
    labelEn: 'Legal-aid directory verification status',
    labelEs: 'Estado de verificación del directorio de ayuda legal',
    category: 'legal_aid_referral',
    status: 'partial',
    evidencePath: 'src/lib/legalAid/directory.ts',
    owner: 'operations',
    openGap: 'All 8 directory entries are marked needs_verification. No sourceUrls confirmed.',
    nextAction: 'Verify each organization via public source and update lastVerifiedAt.',
    userImpactEn: 'Users see "needs verification" badges on unverified organizations.',
    userImpactEs: 'Los usuarios ven insignias de "necesita verificación" en organizaciones no verificadas.',
  },
  {
    id: 'attorney_review_disclosures',
    labelEn: 'Attorney review scope and limitation disclosures',
    labelEs: 'Divulgaciones de alcance y limitaciones de revisión de abogado',
    category: 'attorney_review',
    status: 'implemented',
    evidencePath: 'src/lib/attorneyReview/types.ts',
    lastUpdated: '2026-05-24',
    owner: 'legal',
    userImpactEn: 'Users acknowledge 6 explicit limitations before requesting attorney review.',
    userImpactEs: 'Los usuarios reconocen 6 limitaciones explícitas antes de solicitar revisión de abogado.',
  },
  {
    id: 'attorney_review_fulfillment',
    labelEn: 'Attorney review fulfillment and assignment process',
    labelEs: 'Proceso de cumplimiento y asignación de revisión de abogado',
    category: 'attorney_review',
    status: 'partial',
    owner: 'operations',
    openGap: 'Assignment workflow is modeled but not yet operationally staffed.',
    nextAction: 'Establish attorney network and operational assignment process.',
  },
  {
    id: 'partner_rls_security',
    labelEn: 'Partner data access controls (RLS)',
    labelEs: 'Controles de acceso a datos de socios (RLS)',
    category: 'partner_controls',
    status: 'implemented',
    evidencePath: 'supabase/migrations/20260524043740_create_governed_intake_persistence.sql',
    lastUpdated: '2026-05-24',
    owner: 'engineering',
    userImpactEn: 'Partner organizations can only access their own referral data.',
    userImpactEs: 'Las organizaciones asociadas solo pueden acceder a sus propios datos de referencia.',
  },
  {
    id: 'partner_consent_governance',
    labelEn: 'Partner data-sharing consent framework',
    labelEs: 'Marco de consentimiento para compartir datos con socios',
    category: 'partner_controls',
    status: 'implemented',
    evidencePath: 'src/components/intake/OrganizationPartnerIntake.tsx',
    lastUpdated: '2026-05-24',
    owner: 'product',
    userImpactEn: 'Clients explicitly consent before data is shared with partner organizations.',
    userImpactEs: 'Los clientes consienten explícitamente antes de que los datos se compartan con organizaciones asociadas.',
  },
  {
    id: 'bilingual_parity',
    labelEn: 'English/Spanish content parity',
    labelEs: 'Paridad de contenido inglés/español',
    category: 'accessibility_language',
    status: 'partial',
    owner: 'product',
    openGap: 'Core intake flows are bilingual. Some secondary pages remain English-only.',
    nextAction: 'Complete Spanish translations for remaining secondary pages.',
  },
];

export function getPublishedPolicies(): GovernanceEvidence[] {
  return GOVERNANCE_EVIDENCE.filter(e => e.status === 'implemented');
}

export function getPartialPolicies(): GovernanceEvidence[] {
  return GOVERNANCE_EVIDENCE.filter(e => e.status === 'partial');
}

export function getPlannedPolicies(): GovernanceEvidence[] {
  return GOVERNANCE_EVIDENCE.filter(e => e.status === 'planned');
}

export function getUnpublishedPolicies(): GovernanceEvidence[] {
  return GOVERNANCE_EVIDENCE.filter(e => e.status !== 'implemented');
}

export function getEvidenceByCategory(category: GovernanceCategory): GovernanceEvidence[] {
  return GOVERNANCE_EVIDENCE.filter(e => e.category === category);
}

export const GOVERNANCE_TRUST_STATEMENTS = {
  en: {
    implemented: 'This control is implemented and operational.',
    partial: 'This control is partially implemented. See open gaps below.',
    planned: 'This control is planned but not yet implemented.',
    blocked: 'This control is blocked pending a dependency.',
  },
  es: {
    implemented: 'Este control está implementado y operativo.',
    partial: 'Este control está parcialmente implementado. Vea las brechas abiertas abajo.',
    planned: 'Este control está planeado pero aún no implementado.',
    blocked: 'Este control está bloqueado pendiente de una dependencia.',
  },
} as const;
