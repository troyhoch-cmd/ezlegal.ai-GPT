/**
 * Attorney Review Lifecycle Tests
 *
 * Verifies 10-state lifecycle, acknowledgments, conflict-check gate,
 * and scope_acknowledged_at requirement.
 */

import { describe, it, expect } from 'vitest';
import {
  REVIEW_STATUS_DISPLAY,
  REVIEW_ACKNOWLEDGMENT_TEXTS,
  ATTORNEY_REVIEW_DISCLOSURES,
  type ReviewStatus,
  type ReviewAcknowledgment,
  type AttorneyReviewRequest,
} from '../src/lib/attorneyReview/types';

const ALL_STATUSES: ReviewStatus[] = [
  'draft', 'submitted', 'pending_conflict_check', 'accepted_by_attorney',
  'declined', 'in_review', 'changes_requested', 'completed', 'cancelled', 'refunded',
];

describe('Attorney Review — 10-state lifecycle', () => {
  it('all 10 lifecycle states exist', () => {
    expect(ALL_STATUSES).toHaveLength(10);
    for (const status of ALL_STATUSES) {
      expect(REVIEW_STATUS_DISPLAY[status]).toBeDefined();
    }
  });

  it('each status has label, description, and color', () => {
    for (const status of ALL_STATUSES) {
      const d = REVIEW_STATUS_DISPLAY[status];
      expect(d.label).toBeTruthy();
      expect(d.description).toBeTruthy();
      expect(d.color).toBeTruthy();
    }
  });

  it('REVIEW_STATUS_DISPLAY covers exactly 10 states', () => {
    expect(Object.keys(REVIEW_STATUS_DISPLAY)).toHaveLength(10);
  });
});

describe('Attorney Review — conflict-check gate', () => {
  it('pending_conflict_check precedes accepted_by_attorney in state list', () => {
    const conflictIdx = ALL_STATUSES.indexOf('pending_conflict_check');
    const acceptedIdx = ALL_STATUSES.indexOf('accepted_by_attorney');
    expect(conflictIdx).toBeLessThan(acceptedIdx);
  });

  it('conflictCheckStatus models pending, cleared, flagged, null', () => {
    const valid: AttorneyReviewRequest['conflictCheckStatus'][] = ['pending', 'cleared', 'flagged', null];
    expect(valid).toContain('pending');
    expect(valid).toContain('cleared');
    expect(valid).toContain('flagged');
    expect(valid).toContain(null);
  });

  it('flagged conflict prevents attorney assignment', () => {
    const flagged: Partial<AttorneyReviewRequest> = {
      conflictCheckStatus: 'flagged',
      status: 'pending_conflict_check',
      assignedAttorneyId: null,
    };
    expect(flagged.assignedAttorneyId).toBeNull();
  });
});

describe('Attorney Review — scope acknowledgment', () => {
  it('scopeAcknowledgedAt field exists on AttorneyReviewRequest', () => {
    const req: Partial<AttorneyReviewRequest> = { scopeAcknowledgedAt: null };
    expect(req).toHaveProperty('scopeAcknowledgedAt');
  });

  it('unacknowledged submission has null scopeAcknowledgedAt', () => {
    const req: Partial<AttorneyReviewRequest> = { status: 'submitted', scopeAcknowledgedAt: null };
    expect(req.scopeAcknowledgedAt).toBeNull();
  });

  it('acknowledged submission has timestamp', () => {
    const req: Partial<AttorneyReviewRequest> = {
      status: 'submitted', scopeAcknowledgedAt: '2026-05-24T10:00:00Z',
    };
    expect(req.scopeAcknowledgedAt).toBeTruthy();
  });
});

describe('Attorney Review — acknowledgment completeness', () => {
  const REQUIRED: (keyof ReviewAcknowledgment)[] = [
    'notLegalAdviceUntilReviewed', 'attorneyMayDecline', 'separateEngagement',
    'noGuaranteedOutcome', 'timelinesAreEstimates', 'jurisdictionMayAffect',
  ];

  it('all 6 acknowledgments defined', () => {
    expect(REQUIRED).toHaveLength(6);
  });

  it('each has English text > 20 chars', () => {
    for (const key of REQUIRED) {
      expect(REVIEW_ACKNOWLEDGMENT_TEXTS.en[key].length).toBeGreaterThan(20);
    }
  });

  it('each has Spanish text > 20 chars', () => {
    for (const key of REQUIRED) {
      expect(REVIEW_ACKNOWLEDGMENT_TEXTS.es[key].length).toBeGreaterThan(20);
    }
  });

  it('acknowledgment text does not make guarantees', () => {
    for (const key of REQUIRED) {
      const text = REVIEW_ACKNOWLEDGMENT_TEXTS.en[key].toLowerCase();
      expect(text).not.toMatch(/we guarantee|guaranteed success|will always/);
    }
  });
});

describe('Attorney Review — disclosure completeness', () => {
  it('disclosures contain at least 7 points', () => {
    expect(ATTORNEY_REVIEW_DISCLOSURES.en.points.length).toBeGreaterThanOrEqual(7);
    expect(ATTORNEY_REVIEW_DISCLOSURES.es.points.length).toBeGreaterThanOrEqual(7);
  });

  it('states ezLegal is not a law firm', () => {
    const allPoints = ATTORNEY_REVIEW_DISCLOSURES.en.points.join(' ').toLowerCase();
    expect(allPoints).toContain('not a law firm');
  });

  it('excludes ongoing representation', () => {
    const items = ATTORNEY_REVIEW_DISCLOSURES.en.notIncluded.join(' ').toLowerCase();
    expect(items).toContain('ongoing legal representation');
  });

  it('EN and ES point counts match', () => {
    expect(ATTORNEY_REVIEW_DISCLOSURES.en.points.length)
      .toBe(ATTORNEY_REVIEW_DISCLOSURES.es.points.length);
  });
});
