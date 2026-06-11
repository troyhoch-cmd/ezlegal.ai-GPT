import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validatePayload,
  trackEthicalEvent,
  AnalyticsPayload,
  EVENT_SCHEMA,
  type AnalyticsEventName,
} from '../src/lib/analytics/events';

describe('Ethical Analytics', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
      length: 0,
      key: (index: number) => null,
    };

    // Mock sessionStorage
    const sessionStore: Record<string, string> = {};
    global.sessionStorage = {
      getItem: (key: string) => sessionStore[key] || null,
      setItem: (key: string, value: string) => {
        sessionStore[key] = value;
      },
      removeItem: (key: string) => {
        delete sessionStore[key];
      },
      clear: () => {
        Object.keys(sessionStore).forEach((key) => delete sessionStore[key]);
      },
      length: 0,
      key: (index: number) => null,
    };

    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: () => 'mock-uuid-1234',
      getRandomValues: (arr: Uint8Array) => arr,
    });

    // Mock console.warn
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validatePayload', () => {
    it('should reject payloads with PII field names', () => {
      const piiFields = ['name', 'email', 'phone', 'caseFacts', 'documentText'];

      for (const field of piiFields) {
        const payload: AnalyticsPayload = {
          event: 'ICP_SELECTED',
          timestamp: Date.now(),
          sessionId: 'test-session',
          properties: {
            [field]: 'sensitive-data',
          },
        };

        const result = validatePayload(payload);
        expect(result).toBeNull();
      }
    });

    it('should reject payloads with email-like values', () => {
      const payload: AnalyticsPayload = {
        event: 'ICP_SELECTED',
        timestamp: Date.now(),
        sessionId: 'test-session',
        properties: {
          userEmail: 'john.doe@example.com',
        },
      };

      const result = validatePayload(payload);
      expect(result).toBeNull();
    });

    it('should reject payloads with phone-like values', () => {
      const phoneValues = [
        '5551234567',
        '+15551234567',
        '1 (555) 123-4567',
        '+1-555-123-4567',
      ];

      for (const phone of phoneValues) {
        const payload: AnalyticsPayload = {
          event: 'ICP_SELECTED',
          timestamp: Date.now(),
          sessionId: 'test-session',
          properties: {
            contactNumber: phone,
          },
        };

        const result = validatePayload(payload);
        expect(result).toBeNull();
      }
    });

    it('should accept valid payloads with safe properties', () => {
      const payload: AnalyticsPayload = {
        event: 'ICP_SELECTED',
        timestamp: Date.now(),
        sessionId: 'test-session',
        properties: {
          icp: 'small-business',
          source: 'organic',
          stepNumber: 3,
          completed: true,
        },
      };

      const result = validatePayload(payload);
      expect(result).toEqual(payload);
    });

    it('should accept payloads with numeric and boolean values', () => {
      const payload: AnalyticsPayload = {
        event: 'CHECKOUT_COMPLETED',
        timestamp: 1234567890,
        sessionId: 'test-session',
        properties: {
          tier: 'premium',
          amount: 99.99,
          billingCycle: 12,
          isAnnual: true,
        },
      };

      const result = validatePayload(payload);
      expect(result).toEqual(payload);
    });
  });

  describe('trackEthicalEvent', () => {
    it('should return false when consent is denied', () => {
      localStorage.setItem('ez_consent_analytics', 'denied');

      const result = trackEthicalEvent('ICP_SELECTED', {
        icp: 'small-business',
      });

      expect(result).toBe(false);
    });

    it('should return true when consent is granted', () => {
      localStorage.setItem('ez_consent_analytics', 'granted');

      const result = trackEthicalEvent('ICP_SELECTED', {
        icp: 'small-business',
      });

      expect(result).toBe(true);
    });

    it('should return true when consent is not set (default allow)', () => {
      const result = trackEthicalEvent('ICP_SELECTED', {
        icp: 'small-business',
      });

      expect(result).toBe(true);
    });

    it('should return false when payload contains PII', () => {
      localStorage.setItem('ez_consent_analytics', 'granted');

      const result = trackEthicalEvent('ICP_SELECTED', {
        icp: 'small-business',
        name: 'John Doe',
      });

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should queue events in sessionStorage', () => {
      localStorage.setItem('ez_consent_analytics', 'granted');

      trackEthicalEvent('ICP_SELECTED', {
        icp: 'small-business',
      });

      const queue = JSON.parse(
        sessionStorage.getItem('ez_analytics_queue') || '[]'
      );
      expect(queue).toHaveLength(1);
      expect(queue[0].event).toBe('ICP_SELECTED');
      expect(queue[0].properties.icp).toBe('small-business');
    });
  });

  describe('EVENT_SCHEMA', () => {
    it('should have entries for all event names', () => {
      const allEvents: AnalyticsEventName[] = [
        'ICP_SELECTED',
        'LANGUAGE_SELECTED',
        'INTAKE_STARTED',
        'STEP_COMPLETED',
        'SAVE_RESUME_USED',
        'LEGAL_DISCLAIMER_VIEWED',
        'AI_DISCLOSURE_VIEWED',
        'ATTORNEY_HANDOFF_CLICKED',
        'LEGAL_AID_REFERRAL_CLICKED',
        'PRICE_VIEWED',
        'CHECKOUT_STARTED',
        'CHECKOUT_COMPLETED',
        'INTAKE_ABANDONED',
      ];

      for (const event of allEvents) {
        expect(EVENT_SCHEMA).toHaveProperty(event);
        expect(Array.isArray(EVENT_SCHEMA[event])).toBe(true);
        expect(EVENT_SCHEMA[event].length).toBeGreaterThan(0);
      }
    });

    it('should define allowed properties for each event', () => {
      expect(EVENT_SCHEMA.ICP_SELECTED).toEqual(['icp', 'source']);
      expect(EVENT_SCHEMA.LANGUAGE_SELECTED).toEqual(['language', 'source']);
      expect(EVENT_SCHEMA.CHECKOUT_COMPLETED).toEqual([
        'tier',
        'billingCycle',
        'amount',
      ]);
    });
  });
});
