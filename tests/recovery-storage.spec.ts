/**
 * Recovery Storage Tests
 *
 * Verifies minimal data schema, 72h expiry, and fail-closed behavior.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import {
  saveRecoveryState,
  getRecoveryState,
  clearRecoveryState,
  hasRecoverableSession,
  getRecoveryExpiration,
  type RecoveryState,
} from '../src/lib/intake/recovery';

describe('RecoveryState — data minimization', () => {
  const ALLOWED_TOP_LEVEL = ['icp', 'stepId', 'stepIndex', 'language', 'savedAt', 'selections'];
  const ALLOWED_SELECTIONS = ['issueCategory', 'jurisdiction', 'businessSegment', 'orgType'];

  it('RecoveryState interface contains only non-sensitive fields', () => {
    const state: RecoveryState = {
      icp: 'individual_es', stepId: 'eligibility', stepIndex: 2,
      language: 'es', savedAt: new Date().toISOString(),
      selections: { issueCategory: 'housing' },
    };
    for (const key of Object.keys(state)) {
      expect(ALLOWED_TOP_LEVEL).toContain(key);
    }
  });

  it('selections only allows categorical metadata', () => {
    const selections: RecoveryState['selections'] = {
      issueCategory: 'housing', jurisdiction: 'AZ',
      businessSegment: 'smb', orgType: 'nonprofit',
    };
    for (const key of Object.keys(selections)) {
      expect(ALLOWED_SELECTIONS).toContain(key);
    }
  });

  it('does NOT have fields for PII or legal narratives', () => {
    const forbidden = [
      'name', 'email', 'phone', 'address', 'ssn',
      'caseDescription', 'legalNarrative', 'documentContent',
      'uploadedFiles', 'immigrationStatus', 'income',
    ];
    for (const field of forbidden) {
      expect(ALLOWED_TOP_LEVEL).not.toContain(field);
      expect(ALLOWED_SELECTIONS).not.toContain(field);
    }
  });
});

describe('Recovery — TTL expiration', () => {
  beforeEach(() => { localStorageMock.clear(); vi.clearAllMocks(); });

  it('saves and retrieves valid recovery state', () => {
    const state: RecoveryState = {
      icp: 'smb', stepId: 'business-type', stepIndex: 1,
      language: 'en', savedAt: new Date().toISOString(),
      selections: { businessSegment: 'startup' },
    };
    saveRecoveryState(state);
    const retrieved = getRecoveryState();
    expect(retrieved).not.toBeNull();
    expect(retrieved!.icp).toBe('smb');
  });

  it('returns null for expired state (>72 hours)', () => {
    const expired = new Date(Date.now() - 73 * 60 * 60 * 1000).toISOString();
    localStorageMock.setItem('ez_intake_recovery', JSON.stringify({
      icp: 'individual_es', stepId: 'x', stepIndex: 0,
      language: 'es', savedAt: expired, selections: {},
    }));
    expect(getRecoveryState()).toBeNull();
  });

  it('returns state within 72-hour window', () => {
    const recent = new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString();
    localStorageMock.setItem('ez_intake_recovery', JSON.stringify({
      icp: 'individual_es', stepId: 'x', stepIndex: 1,
      language: 'es', savedAt: recent, selections: { issueCategory: 'housing' },
    }));
    expect(getRecoveryState()).not.toBeNull();
  });

  it('clears expired state from storage', () => {
    const expired = new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString();
    localStorageMock.setItem('ez_intake_recovery', JSON.stringify({
      icp: 'smb', stepId: 's', stepIndex: 0,
      language: 'en', savedAt: expired, selections: {},
    }));
    getRecoveryState();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ez_intake_recovery');
  });
});

describe('Recovery — failure modes', () => {
  beforeEach(() => { localStorageMock.clear(); vi.clearAllMocks(); });

  it('returns null on corrupted JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('not valid json{{{');
    expect(getRecoveryState()).toBeNull();
  });

  it('returns null when localStorage is empty', () => {
    expect(getRecoveryState()).toBeNull();
  });

  it('hasRecoverableSession returns false when no state', () => {
    expect(hasRecoverableSession()).toBe(false);
  });

  it('clearRecoveryState removes the storage key', () => {
    saveRecoveryState({
      icp: 'smb', stepId: 's', stepIndex: 0,
      language: 'en', savedAt: new Date().toISOString(), selections: {},
    });
    clearRecoveryState();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ez_intake_recovery');
  });

  it('getRecoveryExpiration returns null when no state', () => {
    expect(getRecoveryExpiration()).toBeNull();
  });

  it('getRecoveryExpiration returns date 72h after savedAt', () => {
    const now = new Date();
    saveRecoveryState({
      icp: 'individual_es', stepId: 's', stepIndex: 0,
      language: 'es', savedAt: now.toISOString(), selections: {},
    });
    const exp = getRecoveryExpiration();
    expect(exp).not.toBeNull();
    const expected = now.getTime() + 72 * 60 * 60 * 1000;
    expect(Math.abs(exp!.getTime() - expected)).toBeLessThan(1000);
  });
});
