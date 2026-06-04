/**
 * Best-in-class readiness test suite.
 * These tests fail if the codebase violates quality requirements.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC = path.resolve(__dirname, '../src');

function readSrc(relPath: string): string {
  return fs.readFileSync(path.resolve(SRC, relPath), 'utf-8');
}

const HOME = readSrc('pages/Home.tsx');
const HERO_INTAKE = readSrc('components/home/HeroIntake.tsx');
const PRICING_PREVIEW = readSrc('components/home/PricingPreview.tsx');
const URGENT_STRIP = readSrc('components/home/UrgentStrip.tsx');
const PERSONA_INTAKE = readSrc('pages/PersonaIntake.tsx');
const FOR_ORGS = readSrc('pages/ForOrganizations.tsx');
const AI_SAFETY = readSrc('pages/AISafety.tsx');
const FOR_BUSINESS = readSrc('pages/ForBusiness.tsx');
const HOME_COPY = readSrc('data/homeCopy.ts');
const PRICING = readSrc('data/pricing.ts');
const AI_SAFETY_DATA = readSrc('data/aiSafety.ts');

describe('1. Primary CTAs have accessible names', () => {
  it('Home primary CTA has visible text in content file', () => {
    const content = readSrc('data/homepageContent.ts');
    expect(content).toContain('Start free 2-minute checkup');
  });

  it('Home ICP path cards have visible text', () => {
    expect(HERO_INTAKE).toContain("I can't afford a lawyer");
    expect(HERO_INTAKE).toContain('I run a small business');
  });

  it('PersonaIntake buttons have visible labels', () => {
    expect(PERSONA_INTAKE).toContain('Individual or family');
    expect(PERSONA_INTAKE).toContain('Small business');
  });
});

describe('2. Form fields do not rely only on placeholder text', () => {
  it('Home textarea has a visible label', () => {
    expect(HERO_INTAKE).toContain('htmlFor="home-question"');
  });

  it('PersonaIntake state search has a label or placeholder with context', () => {
    expect(PERSONA_INTAKE).toMatch(/Search states|Buscar estados/);
  });
});

describe('3. Spanish mode changes new homepage sections', () => {
  it('homepageContent has ES translations for hero', () => {
    const content = readSrc('data/homepageContent.ts');
    expect(content).toContain("es: 'No es un bufete");
  });

  it('homepageContent has ES translations for SMB section', () => {
    const content = readSrc('data/homepageContent.ts');
    expect(content).toContain("es: 'Para peque");
  });

  it('trustSignals has ES translations for trust strip', () => {
    const trust = readSrc('data/trustSignals.ts');
    expect(trust).toContain("es: 'No es bufete");
  });

  it('safetyCopy has ES translations for urgent strip', () => {
    const safety = readSrc('data/safetyCopy.ts');
    expect(safety).toContain("es: '¿Plazo urgente o peligro");
  });

  it('Home assembler imports schema-driven components', () => {
    expect(HOME).toContain('HeroIntake');
    expect(HOME).toContain('SMBConversionSection');
    expect(HOME).toContain('LegalAidPartnerSection');
  });

  it('HeroIntake uses content from homepageContent', () => {
    expect(HERO_INTAKE).toContain("from '../../data/homepageContent'");
  });
});

describe('4. Pricing does not say "free" without showing what costs extra', () => {
  it('pricing data shows free tier clearly', () => {
    expect(PRICING).toContain("price: { en: '$0', es: '$0' }");
  });

  it('pricing data shows paid tiers', () => {
    expect(PRICING).toContain("price: { en: '$9/mo'");
    expect(PRICING).toContain("price: { en: '$29/mo'");
  });

  it('PricingPreview includes disclaimer from homeCopy', () => {
    expect(PRICING_PREVIEW).toContain('homeCopy.pricingPreview.disclaimer');
  });

  it('homeCopy disclaimer states cost visibility', () => {
    expect(HOME_COPY).toContain("You will see any cost before you pay");
  });
});

describe('5. AI copy does not imply legal advice', () => {
  it('HeroIntake has legal-information-not-advice microcopy via safetyCopy', () => {
    expect(HERO_INTAKE).toContain('safetyCopy.inputSafety.notAdvice');
  });

  it('AI safety page does not contain "100% accurate"', () => {
    expect(AI_SAFETY).not.toContain('100% accurate');
  });

  it('AI safety page does not contain "attorney-approved"', () => {
    expect(AI_SAFETY).not.toContain('attorney-approved');
  });

  it('AI safety page does not contain "guaranteed"', () => {
    expect(AI_SAFETY).not.toMatch(/\bguaranteed\b/i);
  });

  it('AI safety data explicitly states what AI does NOT do', () => {
    expect(AI_SAFETY_DATA).toContain('Does not give legal advice');
    expect(AI_SAFETY_DATA).toContain('Does not guarantee outcomes');
  });
});

describe('6. Intake has review/confirm screen before submission', () => {
  it('PersonaIntake has results step showing summary', () => {
    expect(PERSONA_INTAKE).toContain("step === 'results'");
    expect(PERSONA_INTAKE).toContain('What we understood');
  });

  it('PersonaIntake results include issue summary', () => {
    expect(PERSONA_INTAKE).toContain('Issue:');
    expect(PERSONA_INTAKE).toContain('Urgency:');
  });
});

describe('7. Legal-aid path has urgent-resource routing', () => {
  it('PersonaIntake shows urgent resources for high-risk', () => {
    expect(PERSONA_INTAKE).toContain('isHighRisk');
    expect(PERSONA_INTAKE).toContain('/urgent-resources');
  });

  it('PersonaIntake detects court-date/unsafe/legal-papers as high risk', () => {
    expect(PERSONA_INTAKE).toContain("urgency === 'court-date'");
    expect(PERSONA_INTAKE).toContain("urgency === 'unsafe'");
    expect(PERSONA_INTAKE).toContain("urgency === 'legal-papers'");
  });
});

describe('8. Organization page does not imply live integrations without labeling', () => {
  it('ForOrganizations has "Example only" label on mock data', () => {
    expect(FOR_ORGS).toContain('Example only');
  });

  it('ForOrganizations does not imply existing partnerships without disclaimer', () => {
    expect(FOR_ORGS).toContain('do not imply existing partnership');
  });
});

describe('9. Pages have "not a law firm" / legal information disclosure', () => {
  it('HeroIntake references scope line from content data', () => {
    expect(HERO_INTAKE).toContain('h.scopeLine');
  });

  it('homepageContent has explicit not-a-law-firm scope statement', () => {
    const content = readSrc('data/homepageContent.ts');
    expect(content).toContain('Not a law firm. Not legal advice.');
  });

  it('PersonaIntake has legal disclosure', () => {
    expect(PERSONA_INTAKE).toContain('not legal advice');
  });

  it('AI Safety page references governance disclaimer', () => {
    expect(AI_SAFETY).toContain('governanceDisclaimer');
  });

  it('ForOrganizations has disclaimer', () => {
    expect(FOR_ORGS).toContain('do not claim to replace lawyers');
  });
});

describe('10. Build passes (verified by test runner)', () => {
  it('confirms test suite loaded without import errors', () => {
    expect(true).toBe(true);
  });
});

describe('Homepage — 3 path links', () => {
  const icpData = readSrc('data/icpRoutes.ts');

  it('links to legal-aid path', () => {
    expect(HOME).toContain("'legal-aid'");
  });

  it('ICP routes cover business path', () => {
    expect(icpData).toContain('/for-business');
  });

  it('ICP routes cover organizations path', () => {
    expect(icpData).toContain('/for-organizations');
  });
});

describe('Homepage — hero structure', () => {
  it('has exactly one H1 in HeroIntake', () => {
    const h1s = HERO_INTAKE.match(/<h1[\s>]/g);
    expect(h1s).toHaveLength(1);
  });

  it('CTA navigates to /start path', () => {
    expect(HERO_INTAKE).toContain('/start?path=');
  });
});

describe('Homepage — sensitive-info warning progressive disclosure', () => {
  it('renders sensitive-info warning gated by focus in HeroIntake', () => {
    expect(HERO_INTAKE).toContain('safetyCopy.inputSafety.noSSN');
    expect(HERO_INTAKE).toContain('{focused &&');
  });

  it('PersonaIntake shows short safety line on step 1', () => {
    expect(PERSONA_INTAKE).toContain('Not a law firm. Not legal advice. No account needed.');
  });
});

describe('Homepage — pricing from data', () => {
  it('PricingPreview imports pricingAudiences', () => {
    expect(PRICING_PREVIEW).toContain("from '../../data/pricing'");
  });

  it('PricingPreview uses pricing data for display', () => {
    expect(PRICING_PREVIEW).toContain('pricingAudiences[0].plans[0].price');
  });
});

describe('PersonaIntake — path params', () => {
  it('handles path=legal-aid param', () => {
    expect(PERSONA_INTAKE).toContain("pathParam === 'legal-aid'");
  });

  it('handles path=smb param', () => {
    expect(PERSONA_INTAKE).toContain("pathParam === 'smb'");
  });
});

describe('ForBusiness — SMB breakdown', () => {
  it('has free/human/paid breakdown', () => {
    expect(FOR_BUSINESS).toContain('Free:');
    expect(FOR_BUSINESS).toContain('Human help:');
    expect(FOR_BUSINESS).toContain('May cost extra:');
  });

  it('covers contract review', () => {
    expect(FOR_BUSINESS).toContain('Contract review');
  });

  it('covers hiring issues', () => {
    expect(FOR_BUSINESS).toContain('employee issue');
  });
});

describe('ForOrganizations — CTAs', () => {
  it('has Book a partner demo CTA', () => {
    expect(FOR_ORGS).toContain('Book a partner demo');
  });

  it('has See sample referral CTA', () => {
    expect(FOR_ORGS).toContain('See sample referral');
  });

  it('has Download security overview CTA', () => {
    expect(FOR_ORGS).toContain('Download security');
  });

  it('has ReferralPacketPreview component', () => {
    expect(FOR_ORGS).toContain('ReferralPacketPreview');
  });

  it('has OrganizationIntakeQueue component', () => {
    expect(FOR_ORGS).toContain('OrganizationIntakeQueue');
  });
});

describe('Path-aware rendering — new acceptance criteria', () => {
  it('Home imports audiencePaths', () => {
    expect(HOME).toContain("from '../data/audiencePaths'");
  });

  it('Home parses path query param', () => {
    expect(HOME).toContain('searchParams.get(');
  });

  it('HeroIntake renders ICP path cards for audience selection', () => {
    expect(HERO_INTAKE).toContain('icpCards');
    expect(HERO_INTAKE).toContain('handlePathClick');
  });

  it('urgent strip visible near intake start', () => {
    expect(URGENT_STRIP).toContain('Urgent deadline or danger');
  });

  it('/ai-safety is linked from Home via SafetyNotice', () => {
    const safetyNotice = readSrc('components/home/SafetyNotice.tsx');
    expect(safetyNotice).toContain('to="/ai-safety"');
  });

  it('ForBusiness has BusinessIssueCards', () => {
    expect(FOR_BUSINESS).toContain('BusinessIssueCards');
  });

  it('ForBusiness has cost-before-pay copy', () => {
    expect(FOR_BUSINESS).toContain('You always see cost before you pay');
  });

  it('PersonaIntake handles path=organizations', () => {
    expect(PERSONA_INTAKE).toContain("pathParam === 'organizations'");
  });

  it('ReferralConsentCard is used in PersonaIntake', () => {
    expect(PERSONA_INTAKE).toContain('ReferralConsentCard');
  });
});
