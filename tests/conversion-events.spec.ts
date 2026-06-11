import { describe, it, expect } from 'vitest';
import {
  sanitizeConversionMeta,
  CONVERSION_EVENTS,
  type ConversionEvent,
  type ConversionMeta,
} from '../src/data/conversionEvents';

describe('sanitizeConversionMeta', () => {
  it('passes allowed keys through', () => {
    const input = {
      path: '/intake',
      language: 'es',
      cta: 'start_checkup',
      plan_id: 'everyday_plus',
      issue_category: 'housing',
      urgency_bucket: 'standard',
      source: 'homepage',
    };
    const result = sanitizeConversionMeta(input);
    expect(result).toEqual(input);
  });

  it('drops keys not in the allowlist', () => {
    const result = sanitizeConversionMeta({
      path: '/pricing',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      ssn: '123-45-6789',
      document_text: 'My landlord evicted me...',
      narrative: 'Long legal story...',
      password: 'secret123',
      custom_field: 'anything',
    });
    expect(result).toEqual({ path: '/pricing' });
    expect(result).not.toHaveProperty('name');
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('phone');
    expect(result).not.toHaveProperty('ssn');
    expect(result).not.toHaveProperty('document_text');
    expect(result).not.toHaveProperty('narrative');
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('custom_field');
  });

  it('drops values longer than 200 characters', () => {
    const longValue = 'a'.repeat(201);
    const result = sanitizeConversionMeta({ path: longValue, language: 'en' });
    expect(result).toEqual({ language: 'en' });
    expect(result).not.toHaveProperty('path');
  });

  it('drops non-string values', () => {
    const result = sanitizeConversionMeta({
      path: '/home',
      language: 123 as unknown,
      plan_id: null as unknown,
      source: undefined as unknown,
    });
    expect(result).toEqual({ path: '/home' });
  });

  it('returns empty object for all-unsafe input', () => {
    const result = sanitizeConversionMeta({
      name: 'Jane',
      email: 'jane@test.com',
      social_security: '000-00-0000',
      legal_text: 'privileged content',
    });
    expect(result).toEqual({});
  });

  it('is case-sensitive on keys (only exact allowed keys pass)', () => {
    const result = sanitizeConversionMeta({
      Path: '/home',
      LANGUAGE: 'en',
      CTA: 'button',
    });
    expect(result).toEqual({});
  });
});

describe('CONVERSION_EVENTS registry', () => {
  const allEvents = Object.keys(CONVERSION_EVENTS) as ConversionEvent[];

  it('contains all 18 required events', () => {
    const required: ConversionEvent[] = [
      'home_viewed',
      'home_cta_clicked',
      'issue_chip_clicked',
      'urgent_resources_clicked',
      'intake_started',
      'intake_step_completed',
      'intake_completed',
      'urgent_resource_viewed',
      'referral_consent_shown',
      'referral_consent_accepted',
      'legal_aid_referral_clicked',
      'pricing_viewed',
      'plan_selected',
      'checkout_started',
      'checkout_completed',
      'language_toggled',
      'spanish_cta_clicked',
      'partner_demo_clicked',
    ];
    for (const e of required) {
      expect(allEvents).toContain(e);
    }
  });

  it('every event has a description and safeFields array', () => {
    for (const [, spec] of Object.entries(CONVERSION_EVENTS)) {
      expect(typeof spec.description).toBe('string');
      expect(spec.description.length).toBeGreaterThan(0);
      expect(Array.isArray(spec.safeFields)).toBe(true);
    }
  });

  it('safeFields only contain allowed ConversionMeta keys', () => {
    const allowedKeys: (keyof ConversionMeta)[] = [
      'path', 'language', 'cta', 'plan_id', 'issue_category', 'urgency_bucket', 'source',
    ];
    for (const [, spec] of Object.entries(CONVERSION_EVENTS)) {
      for (const field of spec.safeFields) {
        expect(allowedKeys).toContain(field);
      }
    }
  });

  it('no safeFields contain PII-sensitive keys', () => {
    const unsafeKeys = ['name', 'email', 'phone', 'ssn', 'text', 'question', 'narrative', 'document_text'];
    for (const [, spec] of Object.entries(CONVERSION_EVENTS)) {
      for (const field of spec.safeFields) {
        expect(unsafeKeys).not.toContain(field);
      }
    }
  });
});
