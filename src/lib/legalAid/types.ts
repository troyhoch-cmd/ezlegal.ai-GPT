export type VerificationStatus = 'verified' | 'needs_verification' | 'unavailable';

export interface LegalAidOrganization {
  id: string;
  name: string;
  statesServed: string[];
  countiesServed?: string[];
  languages: string[];
  issueAreas: string[];
  eligibilityNotes: string;
  intakeUrl?: string;
  phone?: string;
  email?: string;
  acceptsReferrals: boolean;
  emergencyAvailable: boolean;
  emergencyExclusion?: boolean;
  lastVerifiedAt: string | null;
  sourceUrl: string | null;
  sourceLabel?: string;
  disclaimer?: string;
  status: VerificationStatus;
}

export interface LegalAidMatchParams {
  jurisdiction: string;
  county?: string;
  language: string;
  issueArea: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  affordabilityStatus: 'cannot_pay' | 'low_cost_needed' | 'can_pay';
}

export interface LegalAidMatchResult {
  organization: LegalAidOrganization;
  matchScore: number;
  matchReasons: string[];
}

export const LEGAL_AID_CAVEATS = {
  en: {
    availabilityNotGuaranteed: 'Availability is not guaranteed. Organizations may have waitlists or limited capacity.',
    eligibilityDetermined: 'Eligibility is determined by the organization, not by ezLegal.',
    emergencyNote: 'Emergency legal matters require immediate local emergency or legal help. Call 911 for immediate danger.',
    notProvider: 'ezLegal is not a legal-aid provider. We help you find organizations that may be able to assist.',
    verificationNote: 'Organization information may change. Contact the organization directly to confirm current services.',
  },
  es: {
    availabilityNotGuaranteed: 'La disponibilidad no está garantizada. Las organizaciones pueden tener listas de espera o capacidad limitada.',
    eligibilityDetermined: 'La elegibilidad es determinada por la organización, no por ezLegal.',
    emergencyNote: 'Los asuntos legales de emergencia requieren ayuda legal o de emergencia local inmediata. Llame al 911 en caso de peligro inmediato.',
    notProvider: 'ezLegal no es un proveedor de ayuda legal. Le ayudamos a encontrar organizaciones que puedan asistirle.',
    verificationNote: 'La información de las organizaciones puede cambiar. Contacte a la organización directamente para confirmar los servicios actuales.',
  },
} as const;
