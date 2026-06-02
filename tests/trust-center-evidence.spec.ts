/**
 * Trust Center Evidence Tests
 *
 * Verifies governance control metadata, evidence completeness,
 * and no false compliance claims.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  GOVERNANCE_EVIDENCE,
  GOVERNANCE_CATEGORY_LABELS,
  getPublishedPolicies,
  getPartialPolicies,
  getPlannedPolicies,
  getUnpublishedPolicies,
  getEvidenceByCategory,
  type GovernanceCategory,
  type PolicyStatus,
} from '../src/lib/intake/governanceStatus';

const ALL_CATEGORIES: GovernanceCategory[] = [
  'ai_limitations', 'privacy_data', 'legal_aid_referral',
  'attorney_review', 'partner_controls', 'accessibility_language',
];

const ALL_STATUSES: PolicyStatus[] = ['implemented', 'partial', 'planned', 'blocked'];

describe('Governance Evidence — required metadata', () => {
  it('every control has id, labelEn, labelEs, category, status', () => {
    for (const item of GOVERNANCE_EVIDENCE) {
      expect(item.id).toBeTruthy();
      expect(item.labelEn).toBeTruthy();
      expect(item.labelEs).toBeTruthy();
      expect(ALL_CATEGORIES).toContain(item.category);
      expect(ALL_STATUSES).toContain(item.status);
    }
  });

  it('every control has an owner', () => {
    for (const item of GOVERNANCE_EVIDENCE) {
      expect(item.owner).toBeTruthy();
    }
  });

  it('implemented controls have evidencePath or url', () => {
    for (const item of getPublishedPolicies()) {
      expect(item.evidencePath || item.url).toBeTruthy();
    }
  });

  it('implemented controls have lastUpdated date', () => {
    for (const item of getPublishedPolicies()) {
      expect(item.lastUpdated).toBeTruthy();
      expect(item.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('partial and planned controls have openGap', () => {
    for (const item of [...getPartialPolicies(), ...getPlannedPolicies()]) {
      expect(item.openGap).toBeTruthy();
      expect(item.openGap!.length).toBeGreaterThan(10);
    }
  });
});

describe('Governance Evidence — no false compliance claims', () => {
  it('planned controls do NOT have evidence url', () => {
    for (const item of getPlannedPolicies()) {
      expect(item.url).toBeUndefined();
    }
  });

  it('no non-implemented control claims certification', () => {
    for (const item of GOVERNANCE_EVIDENCE) {
      if (item.status !== 'implemented') {
        const label = (item.labelEn + ' ' + (item.userImpactEn || '')).toLowerCase();
        expect(label).not.toMatch(/certified|compliant with|meets standard/);
      }
    }
  });

  it('planned controls use future language in userImpact', () => {
    for (const item of getPlannedPolicies()) {
      if (item.userImpactEn) {
        expect(item.userImpactEn.toLowerCase()).toMatch(/will|would|planned|future/);
      }
    }
  });
});

describe('Governance Evidence — category coverage', () => {
  it('all 6 categories have at least one control', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(getEvidenceByCategory(cat).length).toBeGreaterThan(0);
    }
  });

  it('category labels exist in EN and ES', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(GOVERNANCE_CATEGORY_LABELS[cat].en).toBeTruthy();
      expect(GOVERNANCE_CATEGORY_LABELS[cat].es).toBeTruthy();
    }
  });

  it('at least 16 total controls', () => {
    expect(GOVERNANCE_EVIDENCE.length).toBeGreaterThanOrEqual(16);
  });
});

describe('Governance Evidence — helper functions', () => {
  it('getPublishedPolicies returns only implemented', () => {
    for (const item of getPublishedPolicies()) {
      expect(item.status).toBe('implemented');
    }
  });

  it('getUnpublishedPolicies returns non-implemented', () => {
    for (const item of getUnpublishedPolicies()) {
      expect(item.status).not.toBe('implemented');
    }
  });

  it('published + unpublished = total', () => {
    expect(getPublishedPolicies().length + getUnpublishedPolicies().length)
      .toBe(GOVERNANCE_EVIDENCE.length);
  });

  it('all items across categories sum to total', () => {
    let sum = 0;
    for (const cat of ALL_CATEGORIES) sum += getEvidenceByCategory(cat).length;
    expect(sum).toBe(GOVERNANCE_EVIDENCE.length);
  });

  it('IDs are unique', () => {
    const ids = GOVERNANCE_EVIDENCE.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Governance Evidence — evidence paths exist', () => {
  it('evidencePath references real source files', () => {
    const projectRoot = path.resolve(__dirname, '..');
    for (const item of GOVERNANCE_EVIDENCE) {
      if (item.evidencePath) {
        const fullPath = path.join(projectRoot, item.evidencePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    }
  });
});
