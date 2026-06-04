import type { LegalAidOrganization } from './types';

/**
 * Legal-aid directory data.
 * Status indicates verification level:
 * - verified: Information confirmed from public source
 * - needs_verification: Information may be outdated or unconfirmed
 * - unavailable: Organization may no longer operate or accept referrals
 *
 * IMPORTANT: Do not fabricate sourceUrl values. Set to null if unknown.
 * Do not invent organization names or contact info.
 */

export interface VerificationWarning {
  key: 'contact_directly' | 'needs_verification';
  en: string;
  es: string;
}

export function getVerificationWarnings(org: LegalAidOrganization): VerificationWarning[] {
  const warnings: VerificationWarning[] = [];

  if (!org.sourceUrl) {
    warnings.push({
      key: 'contact_directly',
      en: 'Contact directly to confirm availability.',
      es: 'Contacte directamente para confirmar disponibilidad.',
    });
  }

  if (org.status === 'needs_verification') {
    warnings.push({
      key: 'needs_verification',
      en: 'Information needs verification.',
      es: 'La información necesita verificación.',
    });
  }

  return warnings;
}

export function needsVerificationDisplay(org: LegalAidOrganization): boolean {
  return !org.sourceUrl || org.status === 'needs_verification';
}
export const LEGAL_AID_DIRECTORY: LegalAidOrganization[] = [
  {
    id: 'az-legal-aid-001',
    name: 'Community Legal Services (Arizona)',
    statesServed: ['AZ'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'debt', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Generally serves individuals at or below 125% of the federal poverty level.',
    phone: '(602) 258-3434',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Contact directly to confirm current intake availability and eligibility requirements.',
    status: 'needs_verification',
  },
  {
    id: 'az-legal-aid-002',
    name: 'Southern Arizona Legal Aid',
    statesServed: ['AZ'],
    countiesServed: ['Pima', 'Cochise', 'Graham', 'Greenlee', 'Santa Cruz'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'debt', 'immigration', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Serves southern Arizona counties.',
    phone: '(520) 623-9465',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Service area limited to southern Arizona. Contact directly for current availability.',
    status: 'needs_verification',
  },
  {
    id: 'ca-legal-aid-001',
    name: 'Legal Aid Foundation (California)',
    statesServed: ['CA'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'immigration', 'debt'],
    eligibilityNotes: 'Income-based eligibility. Covers Los Angeles County primarily.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Primarily serves Los Angeles County. Eligibility and services may vary.',
    status: 'needs_verification',
  },
  {
    id: 'tx-legal-aid-001',
    name: 'Texas RioGrande Legal Aid',
    statesServed: ['TX'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'immigration', 'debt', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Serves 68 counties in southwest Texas.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Serves southwest Texas counties only. Contact to confirm coverage area.',
    status: 'needs_verification',
  },
  {
    id: 'ny-legal-aid-001',
    name: 'Legal Aid Society (New York)',
    statesServed: ['NY'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'criminal', 'immigration', 'debt'],
    eligibilityNotes: 'Income-based eligibility. Serves New York City boroughs.',
    acceptsReferrals: true,
    emergencyAvailable: true,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Primarily serves NYC boroughs. Emergency assistance may be limited.',
    status: 'needs_verification',
  },
  {
    id: 'fl-legal-aid-001',
    name: 'Florida Legal Services',
    statesServed: ['FL'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'immigration', 'benefits', 'debt'],
    eligibilityNotes: 'Income-based eligibility. Statewide coverage.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Statewide organization. Services vary by location and capacity.',
    status: 'needs_verification',
  },
  {
    id: 'il-legal-aid-001',
    name: 'Legal Aid Chicago',
    statesServed: ['IL'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'debt', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Serves Cook County primarily.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Primarily serves Cook County. Contact for current eligibility criteria.',
    status: 'needs_verification',
  },
  {
    id: 'national-dv-001',
    name: 'National Domestic Violence Hotline',
    statesServed: ['AZ', 'CA', 'TX', 'NY', 'FL', 'IL'],
    languages: ['en', 'es'],
    issueAreas: ['family'],
    eligibilityNotes: 'No income requirement. Available 24/7 for anyone experiencing domestic violence.',
    phone: '1-800-799-7233',
    acceptsReferrals: false,
    emergencyAvailable: true,
    emergencyExclusion: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'National hotline',
    disclaimer: 'Crisis support hotline. Not a legal representation service.',
    status: 'needs_verification',
  },
];
