export type ICP = 'individual_es' | 'smb' | 'organization';

export type TriageRiskLevel = 'normal' | 'urgent' | 'emergency';

export type AffordabilityStatus = 'cannot_pay' | 'low_cost_needed' | 'can_pay';

export type HumanEscalationType =
  | 'legal_aid'
  | 'attorney_review'
  | 'partner_org'
  | 'emergency_resource';

export interface IntakeStep {
  id: string;
  titleEn: string;
  titleEs: string;
  requiresScopeBoundary: boolean;
  allowsCheckout: boolean;
  escalationTriggers?: TriageRiskLevel[];
}

export interface IntakeRouteDecision {
  icp: ICP;
  affordability: AffordabilityStatus;
  risk: TriageRiskLevel;
  destination: string;
  escalation?: HumanEscalationType;
  blockCheckout: boolean;
}

export interface IntakeSession {
  icp: ICP;
  currentStep: number;
  totalSteps: number;
  language: 'en' | 'es';
  affordability?: AffordabilityStatus;
  risk?: TriageRiskLevel;
  jurisdiction?: string;
  scopeBoundaryShown: boolean;
  completedAt?: string;
}

export interface SMBSegment {
  id: string;
  labelEn: string;
  labelEs: string;
  requiresAttorneyReview: boolean;
}

export interface OrgPartnerProfile {
  orgType: string;
  jurisdictions: string[];
  issueAreas: string[];
  languages: string[];
  intakeVolume: string;
  referralCapacity: string;
  dataNeeds: string;
  acceptsWarmReferrals: boolean;
  requiresConflictCheck: boolean;
}

export const SMB_SEGMENTS: SMBSegment[] = [
  { id: 'create_contract', labelEn: 'Create or update a contract', labelEs: 'Crear o actualizar un contrato', requiresAttorneyReview: false },
  { id: 'review_document', labelEn: 'Review a document', labelEs: 'Revisar un documento', requiresAttorneyReview: false },
  { id: 'recurring_docs', labelEn: 'Manage recurring legal documents', labelEs: 'Gestionar documentos legales recurrentes', requiresAttorneyReview: false },
  { id: 'attorney_review', labelEn: 'Need attorney review', labelEs: 'Necesito revisión de abogado', requiresAttorneyReview: true },
  { id: 'not_sure', labelEn: 'Not sure yet', labelEs: 'No estoy seguro todavía', requiresAttorneyReview: false },
];

export const ATTORNEY_REVIEW_TRIGGERS = [
  'employment_contract',
  'investor_funding',
  'litigation_dispute',
  'government_regulatory',
  'high_value_transaction',
] as const;
