/**
 * Spanish Legal-Aid Routing Tests
 *
 * Verifies scoring, geography, verification downgrade, and transparency metadata.
 */

import { describe, it, expect } from 'vitest';
import { matchLegalAidOrganizations, getEmergencyResources, hasVerifiedMatch, getNeedsVerificationCount } from '../src/lib/legalAid/matching';
import { LEGAL_AID_DIRECTORY } from '../src/lib/legalAid/directory';
import { LEGAL_AID_CAVEATS } from '../src/lib/legalAid/types';
import type { LegalAidMatchParams } from '../src/lib/legalAid/types';

describe('Legal-Aid — Spanish priority', () => {
  const base: LegalAidMatchParams = {
    jurisdiction: 'AZ', language: 'es', issueArea: 'housing',
    urgency: 'normal', affordabilityStatus: 'cannot_pay',
  };

  it('Spanish gives additional boost when language is es', () => {
    const results = matchLegalAidOrganizations(base);
    if (results.length > 0) {
      expect(results[0].matchReasons).toContain('spanish_priority');
    }
  });

  it('English requests do not get spanish_priority', () => {
    const results = matchLegalAidOrganizations({ ...base, language: 'en' });
    for (const r of results) {
      expect(r.matchReasons).not.toContain('spanish_priority');
    }
  });

  it('Spanish score is at least as high as English', () => {
    const es = matchLegalAidOrganizations(base);
    const en = matchLegalAidOrganizations({ ...base, language: 'en' });
    if (es.length > 0 && en.length > 0) {
      expect(es[0].matchScore).toBeGreaterThanOrEqual(en[0].matchScore);
    }
  });
});

describe('Legal-Aid — geography and eligibility', () => {
  it('wrong jurisdiction returns no matches', () => {
    const results = matchLegalAidOrganizations({
      jurisdiction: 'WY', language: 'en', issueArea: 'housing',
      urgency: 'normal', affordabilityStatus: 'cannot_pay',
    });
    expect(results).toHaveLength(0);
  });

  it('all results serve the requested jurisdiction', () => {
    const results = matchLegalAidOrganizations({
      jurisdiction: 'AZ', language: 'en', issueArea: 'housing',
      urgency: 'normal', affordabilityStatus: 'can_pay',
    });
    for (const r of results) {
      expect(r.organization.statesServed).toContain('AZ');
    }
  });

  it('county match gives additional score', () => {
    const results = matchLegalAidOrganizations({
      jurisdiction: 'AZ', county: 'Pima', language: 'en',
      issueArea: 'housing', urgency: 'normal', affordabilityStatus: 'cannot_pay',
    });
    const countyOrgs = results.filter(r => r.matchReasons.includes('serves_county'));
    if (countyOrgs.length > 0) {
      expect(countyOrgs[0].matchScore).toBeGreaterThan(5);
    }
  });
});

describe('Legal-Aid — verification and recency', () => {
  it('unverified orgs do not get verified_organization boost', () => {
    const results = matchLegalAidOrganizations({
      jurisdiction: 'AZ', language: 'en', issueArea: 'housing',
      urgency: 'normal', affordabilityStatus: 'cannot_pay',
    });
    for (const r of results) {
      if (r.organization.status === 'needs_verification') {
        expect(r.matchReasons).not.toContain('verified_organization');
      }
    }
  });

  it('orgs without lastVerifiedAt do not get recently_verified', () => {
    const results = matchLegalAidOrganizations({
      jurisdiction: 'AZ', language: 'en', issueArea: 'housing',
      urgency: 'normal', affordabilityStatus: 'cannot_pay',
    });
    for (const r of results) {
      if (!r.organization.lastVerifiedAt) {
        expect(r.matchReasons).not.toContain('recently_verified');
      }
    }
  });

  it('getNeedsVerificationCount matches directory', () => {
    const expected = LEGAL_AID_DIRECTORY.filter(o => o.status === 'needs_verification').length;
    expect(getNeedsVerificationCount()).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it('hasVerifiedMatch false when all are needs_verification', () => {
    const results = matchLegalAidOrganizations({
      jurisdiction: 'AZ', language: 'en', issueArea: 'housing',
      urgency: 'normal', affordabilityStatus: 'cannot_pay',
    });
    expect(hasVerifiedMatch(results)).toBe(false);
  });
});

describe('Legal-Aid — emergency resources', () => {
  it('filters by jurisdiction', () => {
    const results = getEmergencyResources('AZ', 'en');
    for (const org of results) {
      expect(org.statesServed).toContain('AZ');
    }
  });

  it('filters by language', () => {
    const results = getEmergencyResources('NY', 'es');
    for (const org of results) {
      expect(org.languages).toContain('es');
    }
  });

  it('excludes emergencyExclusion orgs', () => {
    const results = getEmergencyResources('AZ', 'en');
    for (const org of results) {
      expect(org.emergencyExclusion).not.toBe(true);
    }
  });

  it('excludes unavailable orgs', () => {
    const results = getEmergencyResources('AZ', 'en');
    for (const org of results) {
      expect(org.status).not.toBe('unavailable');
    }
  });
});

describe('Legal-Aid Directory — transparency', () => {
  it('every org has a disclaimer', () => {
    for (const org of LEGAL_AID_DIRECTORY) {
      expect(org.disclaimer).toBeTruthy();
    }
  });

  it('every org has sourceLabel', () => {
    for (const org of LEGAL_AID_DIRECTORY) {
      expect(org.sourceLabel).toBeTruthy();
    }
  });

  it('unverified orgs do not fabricate sourceUrl', () => {
    for (const org of LEGAL_AID_DIRECTORY) {
      if (org.status === 'needs_verification') {
        expect(org.sourceUrl).toBeNull();
      }
    }
  });

  it('verification status is explicit for every org', () => {
    for (const org of LEGAL_AID_DIRECTORY) {
      expect(['verified', 'needs_verification', 'unavailable']).toContain(org.status);
    }
  });
});

describe('Legal-Aid Caveats — bilingual disclosures', () => {
  it('at least 5 caveats per language', () => {
    expect(Object.keys(LEGAL_AID_CAVEATS.en).length).toBeGreaterThanOrEqual(5);
    expect(Object.keys(LEGAL_AID_CAVEATS.es).length).toBeGreaterThanOrEqual(5);
  });

  it('states availability not guaranteed', () => {
    expect(LEGAL_AID_CAVEATS.en.availabilityNotGuaranteed).toMatch(/not guaranteed/i);
  });

  it('states ezLegal is not a provider', () => {
    expect(LEGAL_AID_CAVEATS.en.notProvider).toMatch(/not a legal-aid provider/i);
  });

  it('EN and ES keys match', () => {
    expect(Object.keys(LEGAL_AID_CAVEATS.en).sort())
      .toEqual(Object.keys(LEGAL_AID_CAVEATS.es).sort());
  });
});
