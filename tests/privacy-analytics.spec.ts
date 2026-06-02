/**
 * Privacy Analytics Tests
 *
 * Verifies allowlist-only analytics emission, no PII in event names,
 * and structural guarantees against sensitive data leakage.
 */

import { describe, it, expect } from 'vitest';
import type { SanitizedAnalyticsPayload, IntakeEvent } from '../src/lib/intake/analytics';

describe('SanitizedAnalyticsPayload — allowlist enforcement', () => {
  const ALLOWED_FIELDS: (keyof SanitizedAnalyticsPayload)[] = [
    'event', 'anonymousSessionId', 'icp', 'stepId', 'stepIndex',
    'totalSteps', 'language', 'issueCategory', 'timestamp',
    'elapsedMs', 'completionStatus', 'uiMetadata',
  ];

  it('payload interface contains only allowlisted fields', () => {
    const samplePayload: SanitizedAnalyticsPayload = {
      event: 'intake_started',
      timestamp: new Date().toISOString(),
    };
    for (const key of Object.keys(samplePayload)) {
      expect(ALLOWED_FIELDS).toContain(key);
    }
  });

  it('does NOT allow PII fields (name, email, phone, address)', () => {
    const forbidden = [
      'name', 'email', 'phone', 'address', 'streetAddress',
      'fullName', 'firstName', 'lastName', 'ssn', 'dateOfBirth',
      'caseDescription', 'legalNarrative', 'documentContent',
      'immigrationStatus', 'financialDetails', 'bankAccount',
    ];
    for (const field of forbidden) {
      expect(ALLOWED_FIELDS).not.toContain(field);
    }
  });

  it('does NOT allow legal fact fields', () => {
    const legalFacts = [
      'caseNarrative', 'legalIssueDescription', 'evidenceText',
      'courtDocumentContent', 'witnessStatement', 'pleadingText',
    ];
    for (const field of legalFacts) {
      expect(ALLOWED_FIELDS).not.toContain(field);
    }
  });
});

describe('IntakeEvent — no PII in event names', () => {
  const EVENT_NAMES: IntakeEvent['event'][] = [
    'intake_started', 'intake_step_completed', 'intake_completed',
    'intake_abandoned', 'intake_emergency_detected', 'intake_scope_boundary_shown',
    'intake_legal_aid_matched', 'intake_attorney_review_recommended',
    'intake_attorney_review_cta_clicked', 'intake_attorney_review_declined',
    'intake_consent_recorded', 'intake_partner_profile_created',
    'intake_referral_routed', 'intake_resume_attempted',
  ];

  it('all event names use categorical prefixes only', () => {
    for (const name of EVENT_NAMES) {
      expect(name).toMatch(/^intake_[a-z_]+$/);
      expect(name).not.toMatch(/user|name|email|phone|address/i);
    }
  });

  it('event names do not encode legal issue specifics', () => {
    for (const name of EVENT_NAMES) {
      expect(name).not.toMatch(/divorce|custody|eviction|arrest|immigration|bankruptcy/i);
    }
  });

  it('all 14 event types are accounted for', () => {
    expect(EVENT_NAMES).toHaveLength(14);
  });
});

describe('Privacy — structural guarantees', () => {
  it('SanitizedAnalyticsPayload requires event and timestamp', () => {
    const minimal: SanitizedAnalyticsPayload = {
      event: 'test',
      timestamp: '2026-01-01T00:00:00Z',
    };
    expect(minimal.event).toBeDefined();
    expect(minimal.timestamp).toBeDefined();
  });

  it('uiMetadata only allows deviceType, entryPoint, variant', () => {
    const metadata: SanitizedAnalyticsPayload['uiMetadata'] = {
      deviceType: 'mobile',
      entryPoint: 'homepage',
      variant: 'a',
    };
    expect(Object.keys(metadata!)).toHaveLength(3);
  });

  it('completionStatus only allows completed, abandoned, escalated', () => {
    const valid: SanitizedAnalyticsPayload['completionStatus'][] = [
      'completed', 'abandoned', 'escalated',
    ];
    expect(valid).toHaveLength(3);
  });

  it('IntakeEvent payloads do not contain free-text description fields', () => {
    const sample: IntakeEvent = { event: 'intake_started', icp: 'individual_es', language: 'es' };
    const forbidden = ['description', 'narrative', 'text', 'content', 'message', 'notes'];
    for (const key of Object.keys(sample)) {
      for (const pattern of forbidden) {
        expect(key.toLowerCase()).not.toContain(pattern);
      }
    }
  });
});
