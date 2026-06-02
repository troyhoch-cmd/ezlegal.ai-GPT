import type { LegalAidMatchParams, LegalAidMatchResult, LegalAidOrganization } from './types';
import { LEGAL_AID_DIRECTORY } from './directory';

export function matchLegalAidOrganizations(params: LegalAidMatchParams): LegalAidMatchResult[] {
  const results: LegalAidMatchResult[] = [];

  for (const org of LEGAL_AID_DIRECTORY) {
    if (org.status === 'unavailable') continue;

    let score = 0;
    const reasons: string[] = [];

    if (org.statesServed.includes(params.jurisdiction)) {
      score += 3;
      reasons.push('serves_jurisdiction');
    } else {
      continue;
    }

    if (params.county && org.countiesServed?.includes(params.county)) {
      score += 2;
      reasons.push('serves_county');
    }

    if (org.languages.includes(params.language)) {
      score += 2;
      reasons.push('supports_language');
    }

    if (params.language === 'es' && org.languages.includes('es')) {
      score += 1;
      reasons.push('spanish_priority');
    }

    if (org.issueAreas.includes(params.issueArea)) {
      score += 2;
      reasons.push('covers_issue_area');
    }

    if (params.urgency === 'emergency' && org.emergencyAvailable) {
      score += 3;
      reasons.push('emergency_available');
    }

    if (params.affordabilityStatus === 'cannot_pay' && org.acceptsReferrals) {
      score += 1;
      reasons.push('free_legal_aid');
    }

    if (org.acceptsReferrals) {
      score += 1;
      reasons.push('accepts_referrals');
    }

    if (org.status === 'verified') {
      score += 1;
      reasons.push('verified_organization');
    }

    if (org.lastVerifiedAt) {
      const daysSinceVerification = (Date.now() - new Date(org.lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceVerification < 90) {
        score += 1;
        reasons.push('recently_verified');
      }
    }

    if (score >= 5) {
      results.push({ organization: org, matchScore: score, matchReasons: reasons });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function getEmergencyResources(jurisdiction: string, language: string): LegalAidOrganization[] {
  return LEGAL_AID_DIRECTORY.filter(
    (org) =>
      org.emergencyAvailable &&
      !org.emergencyExclusion &&
      org.statesServed.includes(jurisdiction) &&
      org.languages.includes(language) &&
      org.status !== 'unavailable'
  );
}

export function hasVerifiedMatch(results: LegalAidMatchResult[]): boolean {
  return results.some((r) => r.organization.status === 'verified');
}

export function getNeedsVerificationCount(): number {
  return LEGAL_AID_DIRECTORY.filter((org) => org.status === 'needs_verification').length;
}
