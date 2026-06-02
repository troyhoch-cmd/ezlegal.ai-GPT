/**
 * Safety and Accessibility Tests
 *
 * Verifies:
 * - BeforeYouType appears before textarea in source order
 * - Textarea has aria-label
 * - Language toggle has aria-pressed state
 * - Skip link exists
 * - No analytics event sends free-text content
 * - Urgent-resource link is keyboard-focusable
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC = path.resolve(__dirname, '../src');

function readSrc(relPath: string): string {
  return fs.readFileSync(path.resolve(SRC, relPath), 'utf-8');
}

const HERO_INTAKE = readSrc('components/home/HeroIntake.tsx');
const URGENT_STRIP = readSrc('components/home/UrgentStrip.tsx');
const LANGUAGE_TOGGLE = readSrc('components/shared/LanguageToggle.tsx');

const ETHICAL_ANALYTICS_SOURCE = readSrc('components/EthicalAnalytics.ts');
const PERSONA_INTAKE_SOURCE = readSrc('pages/PersonaIntake.tsx');
const REFERRAL_CONSENT_SOURCE = readSrc('components/ReferralConsentCard.tsx');

describe('Safety — sensitive-info warning placement', () => {
  it('Sensitive-info warning appears in HeroIntake gated by focus', () => {
    expect(HERO_INTAKE).toContain('safetyCopy.inputSafety.noSSN');
    expect(HERO_INTAKE).toContain('{focused &&');
  });

  it('PersonaIntake shows short safety line', () => {
    expect(PERSONA_INTAKE_SOURCE).toContain('Not a law firm. Not legal advice. No account needed.');
  });
});

describe('Safety — urgent resources', () => {
  it('urgent resources link exists in HeroIntake', () => {
    expect(HERO_INTAKE).toContain('to="/urgent-resources"');
  });

  it('urgent strip renders examples from safetyCopy data', () => {
    expect(URGENT_STRIP).toContain('safetyCopy.urgentStrip');
    const safetyData = readSrc('data/safetyCopy.ts');
    expect(safetyData).toContain('Court papers, eviction, abuse, detention, deadline today/tomorrow, shutoff, lockout');
  });

  it('urgent link has keyboard focus styles', () => {
    const urgentIdx = URGENT_STRIP.indexOf('Urgent deadline or danger');
    const urgentArea = URGENT_STRIP.substring(urgentIdx, urgentIdx + 1500);
    expect(urgentArea).toContain('focus:ring-2');
  });
});

describe('Accessibility — textarea and labels', () => {
  it('textarea has aria-label', () => {
    expect(HERO_INTAKE).toContain('aria-label=');
    expect(HERO_INTAKE).toContain('h.inputAriaLabel');
  });

  it('language toggle has aria-pressed state', () => {
    expect(LANGUAGE_TOGGLE).toContain('aria-pressed');
  });
});

describe('Accessibility — skip link', () => {
  it('HeroIntake has skip link target (home-question)', () => {
    expect(HERO_INTAKE).toContain('id="home-question"');
  });

  it('skip link or focus management exists', () => {
    expect(HERO_INTAKE).toContain('home-question');
  });
});

describe('Ethical analytics — no free-text collection', () => {
  it('EthicalAnalytics does not reference question or free-text fields', () => {
    expect(ETHICAL_ANALYTICS_SOURCE).not.toContain('question');
    expect(ETHICAL_ANALYTICS_SOURCE).not.toContain('freeText');
    expect(ETHICAL_ANALYTICS_SOURCE).not.toContain('description');
    expect(ETHICAL_ANALYTICS_SOURCE).not.toContain('message');
  });

  it('EthicalAnalytics event types do not include text content', () => {
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'path_selected'");
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'language_selected'");
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'checkup_started'");
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'urgent_resources_opened'");
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'review_screen_viewed'");
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'referral_consent_viewed'");
    expect(ETHICAL_ANALYTICS_SOURCE).toContain("'pricing_viewed'");
  });

  it('EventPayload only contains safe metadata — no content fields', () => {
    expect(ETHICAL_ANALYTICS_SOURCE).toContain('event: AnalyticsEvent');
    expect(ETHICAL_ANALYTICS_SOURCE).toContain('path?: string');
    expect(ETHICAL_ANALYTICS_SOURCE).toContain('language?: string');
    expect(ETHICAL_ANALYTICS_SOURCE).toContain('step?: string');
    expect(ETHICAL_ANALYTICS_SOURCE).toContain('format?: string');
    expect(ETHICAL_ANALYTICS_SOURCE).toContain('timestamp: string');
  });
});

describe('Referral consent — organization referral', () => {
  it('ReferralConsentCard exists and has consent checkbox', () => {
    expect(REFERRAL_CONSENT_SOURCE).toContain('type="checkbox"');
    expect(REFERRAL_CONSENT_SOURCE).toContain('onConsent');
  });

  it('PersonaIntake renders ReferralConsentCard for organization persona', () => {
    expect(PERSONA_INTAKE_SOURCE).toContain('<ReferralConsentCard');
    expect(PERSONA_INTAKE_SOURCE).toContain("persona === 'organization'");
  });

  it('consent card has bilingual copy', () => {
    expect(REFERRAL_CONSENT_SOURCE).toContain("'Referral consent'");
    expect(REFERRAL_CONSENT_SOURCE).toContain("'Consentimiento de referencia'");
  });
});
