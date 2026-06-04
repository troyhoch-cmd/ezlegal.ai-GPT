import { describe, it, expect } from 'vitest';
import { CANONICAL_TIER_IDS, DEPRECATED_PLAN_IDS } from '../src/services/pricingService';
import { pricingAudiences } from '../src/data/pricing';

describe('Pricing tier canonical enforcement', () => {
  const allStaticPlanIds = pricingAudiences.flatMap((a) => a.plans.map((p) => p.id));

  it('static pricing.ts does not use deprecated plan IDs: free, essentials, pro, smb, legal_aid', () => {
    for (const deprecated of DEPRECATED_PLAN_IDS) {
      expect(allStaticPlanIds).not.toContain(deprecated);
    }
  });

  it('canonical tier IDs list contains exactly 12 entries', () => {
    expect(CANONICAL_TIER_IDS).toHaveLength(12);
  });

  it('canonical tier IDs include all required tiers', () => {
    const required = [
      'justice_free',
      'everyday_plus',
      'family_household',
      'single_document_boost',
      'business_free',
      'business_starter',
      'business_growth',
      'business_team',
      'legal_aid_free',
      'clinic_starter',
      'organization_pro',
      'coalition_statewide',
    ];
    for (const id of required) {
      expect(CANONICAL_TIER_IDS).toContain(id);
    }
  });

  it('deprecated plan IDs are not present in canonical list', () => {
    for (const deprecated of DEPRECATED_PLAN_IDS) {
      expect(CANONICAL_TIER_IDS).not.toContain(deprecated);
    }
  });

  it('DEPRECATED_PLAN_IDS contains all known deprecated IDs', () => {
    expect(DEPRECATED_PLAN_IDS).toContain('free');
    expect(DEPRECATED_PLAN_IDS).toContain('essentials');
    expect(DEPRECATED_PLAN_IDS).toContain('pro');
    expect(DEPRECATED_PLAN_IDS).toContain('smb');
    expect(DEPRECATED_PLAN_IDS).toContain('legal_aid');
  });
});
