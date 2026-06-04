/**
 * Homepage Structure Tests — Schema-driven architecture edition
 *
 * Validates the refactored homepage uses structured content from data files
 * and assembles reusable components without large hardcoded copy blocks.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const homeDir = path.resolve(__dirname, '../src/components/home');
const dataDir = path.resolve(__dirname, '../src/data');
const assembler = fs.readFileSync(
  path.resolve(__dirname, '../src/pages/Home.tsx'),
  'utf-8'
);

function readComponent(name: string): string {
  return fs.readFileSync(path.resolve(homeDir, name), 'utf-8');
}
function readData(name: string): string {
  return fs.readFileSync(path.resolve(dataDir, name), 'utf-8');
}

const heroIntake = readComponent('HeroIntake.tsx');
const urgentStrip = readComponent('UrgentStrip.tsx');
const smb = readComponent('SMBConversionSection.tsx');
const partners = readComponent('LegalAidPartnerSection.tsx');
const safety = readComponent('SafetyNotice.tsx');
const finalCta = readComponent('FinalCTA.tsx');
const mobileCta = readComponent('MobileStickyBar.tsx');
const situationExplorer = readComponent('SituationExplorer.tsx');
const bilingualNotice = readComponent('BilingualParityNotice.tsx');
const homeShell = readComponent('HomeShell.tsx');

const homepageContent = readData('homepageContent.ts');
const trustSignals = readData('trustSignals.ts');
const safetyCopyData = readData('safetyCopy.ts');
const conversionEvents = readData('homepageConversionEvents.ts');

describe('Homepage assembler — composition', () => {
  it('imports schema-driven section components', () => {
    expect(assembler).toContain('UrgentStrip');
    expect(assembler).toContain('HeroIntake');
    expect(assembler).toContain('SituationExplorer');
    expect(assembler).toContain('SMBConversionSection');
    expect(assembler).toContain('LegalAidPartnerSection');
    expect(assembler).toContain('BilingualParityNotice');
    expect(assembler).toContain('SafetyNotice');
    expect(assembler).toContain('FinalCTA');
    expect(assembler).toContain('HomeShell');
  });

  it('assembler is under 50 lines', () => {
    const lines = assembler.split('\n').length;
    expect(lines).toBeLessThanOrEqual(50);
  });

  it('assembler does not contain inline content strings', () => {
    expect(assembler).not.toContain('Eviction or rent');
    expect(assembler).not.toContain('Will AI make legal decisions');
    expect(assembler).not.toContain('Legal help for small businesses');
    expect(assembler).not.toContain('Not a law firm');
  });
});

describe('Homepage — hero', () => {
  it('imports content from homepageContent data', () => {
    expect(heroIntake).toContain("from '../../data/homepageContent'");
  });

  it('has language context for bilingual support', () => {
    expect(heroIntake).toContain("useLanguage");
  });

  it('has urgent resources link', () => {
    expect(heroIntake).toContain('to="/urgent-resources"');
  });

  it('uses schema-driven headline', () => {
    expect(heroIntake).toContain('h.headline.en');
    expect(heroIntake).toContain('h.headline.es');
  });

  it('uses schema-driven scope line', () => {
    expect(heroIntake).toContain('h.scopeLine.en');
    expect(heroIntake).toContain('h.scopeLine.es');
  });
});

describe('Homepage — structured content file', () => {
  it('contains hero headline in both languages', () => {
    expect(homepageContent).toContain('Understand your legal options in 2 minutes');
    expect(homepageContent).toContain('Entiende tus opciones legales en 2 minutos');
  });

  it('contains scope line with "Not a law firm. Not legal advice."', () => {
    expect(homepageContent).toContain('Not a law firm. Not legal advice. No account needed.');
    expect(homepageContent).toContain('No es un bufete. No es asesor');
  });

  it('contains primary CTA in both languages', () => {
    expect(homepageContent).toContain('Start free 2-minute checkup');
    expect(homepageContent).toContain('Comenzar revisi');
  });

  it('contains urgent link text in both languages', () => {
    expect(homepageContent).toContain('Get emergency help now');
    expect(homepageContent).toContain('Obtener ayuda de emergencia ahora');
  });

  it('contains SMB content in both languages', () => {
    expect(homepageContent).toContain('For small businesses');
    expect(homepageContent).toContain('Para peque');
    expect(homepageContent).toContain('Check a business issue');
    expect(homepageContent).toContain('View SMB plans');
  });

  it('contains partner content in both languages', () => {
    expect(homepageContent).toContain('For legal-aid and pro bono teams');
    expect(homepageContent).toContain('Para equipos de ayuda legal y pro bono');
    expect(homepageContent).toContain('View partner dashboard demo');
    expect(homepageContent).toContain('Talk to partnerships');
  });

  it('contains finalCTA content in both languages', () => {
    expect(homepageContent).toContain("Ready to understand your options?");
    expect(homepageContent).toContain("Listo para entender tus opciones");
  });
});

describe('Homepage — primary CTA', () => {
  it('hero references primaryCta from content schema', () => {
    expect(heroIntake).toContain('h.primaryCta.en');
  });
});

describe('Homepage — input panel', () => {
  it('has labeled textarea', () => {
    expect(heroIntake).toContain('htmlFor="home-question"');
    expect(heroIntake).toContain('id="home-question"');
  });

  it('has sensitive-info warning visible on focus', () => {
    expect(heroIntake).toContain('safetyCopy.inputSafety.noSSN');
    expect(heroIntake).toContain('safetyCopy.inputSafety.notAdvice');
  });

  it('has urgent help callout', () => {
    expect(heroIntake).toContain('h.urgentPrompt');
    expect(heroIntake).toContain('to="/urgent-resources"');
  });
});

describe('Homepage — ICP path cards in hero', () => {
  it('contains three audience paths', () => {
    expect(heroIntake).toContain("I need free or low-cost legal help");
    expect(heroIntake).toContain("I'm a small business");
    expect(heroIntake).toContain('I work with a legal aid / nonprofit organization');
  });

  it('routes to correct paths', () => {
    expect(heroIntake).toContain('/start?path=legal-aid');
    expect(heroIntake).toContain('/start?path=smb');
    expect(heroIntake).toContain('/for-organizations');
  });
});

describe('Homepage — trust proof strip', () => {
  it('hero imports heroTrustItems from trustSignals', () => {
    expect(heroIntake).toContain('heroTrustItems');
  });

  it('hero renders CheckCircle icons for trust items', () => {
    expect(heroIntake).toContain('CheckCircle');
  });

  it('trustSignals has 4 hero trust items', () => {
    expect(trustSignals).toContain('free-to-start');
    expect(trustSignals).toContain('bilingual');
    expect(trustSignals).toContain('not-law-firm');
    expect(trustSignals).toContain('privacy-first');
  });
});

describe('Homepage — situation explorer', () => {
  it('contains common situations', () => {
    expect(situationExplorer).toContain('Eviction or housing');
    expect(situationExplorer).toContain('Debt or collections');
    expect(situationExplorer).toContain('Immigration');
  });

  it('has bilingual labels', () => {
    expect(situationExplorer).toContain('Desalojo o vivienda');
    expect(situationExplorer).toContain('Deuda o cobranzas');
  });
});

describe('Homepage — SMB section', () => {
  it('imports content from homepageContent', () => {
    expect(smb).toContain("from '../../data/homepageContent'");
  });

  it('renders capabilities list', () => {
    expect(smb).toContain('s.capabilities.map');
  });

  it('links to SMB path', () => {
    expect(smb).toContain('s.primaryHref');
  });

  it('links to pricing', () => {
    expect(smb).toContain('s.secondaryHref');
  });

  it('content file has SMB capabilities', () => {
    expect(homepageContent).toContain('Contracts and agreements');
    expect(homepageContent).toContain('Compliance and licensing');
    expect(homepageContent).toContain('Employment issues');
    expect(homepageContent).toContain('Leases and vendor agreements');
    expect(homepageContent).toContain('Document preparation');
    expect(homepageContent).toContain('Know when to talk to a lawyer');
  });
});

describe('Homepage — legal-aid and pro bono partners', () => {
  it('imports content from homepageContent', () => {
    expect(partners).toContain("from '../../data/homepageContent'");
  });

  it('renders capabilities list', () => {
    expect(partners).toContain('p.capabilities.map');
  });

  it('links to partner dashboard demo', () => {
    expect(partners).toContain('p.primaryHref');
  });

  it('content file has partner capabilities', () => {
    expect(homepageContent).toContain('Consent-based referrals');
    expect(homepageContent).toContain('Triage queue');
    expect(homepageContent).toContain('Partner capacity controls');
    expect(homepageContent).toContain('Referral export');
    expect(homepageContent).toContain('Consent audit log');
  });

  it('content file links to /partner-dashboard-demo', () => {
    expect(homepageContent).toContain('/partner-dashboard-demo');
  });
});

describe('Homepage — ethical AI / responsible AI', () => {
  it('contains section heading', () => {
    expect(safety).toContain('Responsible legal AI');
  });

  it('contains six trust cards', () => {
    expect(safety).toContain("'Legal information, not legal advice'");
    expect(safety).toContain("'Jurisdiction matters'");
    expect(safety).toContain("'Human fallback'");
    expect(safety).toContain("'Privacy-first intake'");
    expect(safety).toContain("'Sources and explanations'");
    expect(safety).toContain("'Bias and language-quality review'");
  });

  it('links to AI safety page', () => {
    expect(safety).toContain('to="/ai-safety"');
    expect(safety).toContain('Read our AI safety principles');
  });
});

describe('Homepage — ICP routes data', () => {
  const icpData = fs.readFileSync(
    path.resolve(__dirname, '../src/data/icpRoutes.ts'),
    'utf-8'
  );

  it('contains three path headings in data', () => {
    expect(icpData).toContain('I need legal help for myself');
    expect(icpData).toContain('I need legal help for my business');
    expect(icpData).toContain('I work with a legal aid or pro bono organization');
  });

  it('contains path CTAs in data', () => {
    expect(icpData).toContain('Start personal intake');
    expect(icpData).toContain('Start business intake');
    expect(icpData).toContain('Explore partner workflow');
  });
});

describe('Homepage — mobile sticky CTA', () => {
  it('contains sticky mobile bar', () => {
    expect(mobileCta).toContain('sm:hidden');
    expect(mobileCta).toContain('fixed bottom-0');
  });

  it('contains "Start free 2-minute checkup" label', () => {
    expect(mobileCta).toContain('Start free 2-minute checkup');
  });

  it('contains "Espa\u00f1ol" label', () => {
    expect(mobileCta).toContain('Espa\u00f1ol');
  });
});

describe('Homepage — accessibility', () => {
  it('hero intake has many focus ring styles', () => {
    const focusMatches = heroIntake.match(/focus:ring-2/g);
    expect(focusMatches!.length).toBeGreaterThanOrEqual(5);
  });

  it('hero intake icons are decorative (aria-hidden)', () => {
    const ariaHidden = heroIntake.match(/aria-hidden="true"/g);
    expect(ariaHidden!.length).toBeGreaterThanOrEqual(5);
  });

  it('textarea has associated label', () => {
    expect(heroIntake).toContain('htmlFor="home-question"');
    expect(heroIntake).toContain('id="home-question"');
  });

  it('textarea has aria-label for screen readers', () => {
    expect(heroIntake).toContain('aria-label=');
  });
});

describe('Homepage — conversion hierarchy', () => {
  it('assembler renders HeroIntake before SituationExplorer', () => {
    const heroIdx = assembler.indexOf('<HeroIntake');
    const sitIdx = assembler.indexOf('<SituationExplorer');
    expect(heroIdx).toBeLessThan(sitIdx);
  });

  it('assembler renders SituationExplorer before SMBConversionSection', () => {
    const sitIdx = assembler.indexOf('<SituationExplorer');
    const smbIdx = assembler.indexOf('<SMBConversionSection');
    expect(sitIdx).toBeLessThan(smbIdx);
  });
});

describe('Homepage — conversion events', () => {
  it('defines all required event types', () => {
    expect(conversionEvents).toContain('homepage_viewed');
    expect(conversionEvents).toContain('language_changed');
    expect(conversionEvents).toContain('icp_route_selected');
    expect(conversionEvents).toContain('hero_checkup_started');
    expect(conversionEvents).toContain('urgent_help_clicked');
    expect(conversionEvents).toContain('smb_issue_started');
    expect(conversionEvents).toContain('partner_demo_clicked');
    expect(conversionEvents).toContain('safety_notice_expanded');
  });

  it('forbids sensitive fields in analytics', () => {
    expect(conversionEvents).toContain('FORBIDDEN_ANALYTICS_FIELDS');
    expect(conversionEvents).toContain("'question'");
    expect(conversionEvents).toContain("'email'");
    expect(conversionEvents).toContain("'ssn'");
  });
});

describe('Homepage — bilingual parity notice', () => {
  it('has English and Spanish copy', () => {
    expect(bilingualNotice).toContain('All tools, guides, and intake forms are available in English and Spanish.');
    expect(bilingualNotice).toContain('Todas las herramientas');
  });
});

describe('Homepage — HomeShell wrapper', () => {
  it('contains Navigation and Footer', () => {
    expect(homeShell).toContain('Navigation');
    expect(homeShell).toContain('Footer');
  });

  it('contains main landmark', () => {
    expect(homeShell).toContain('id="main-content"');
  });

  it('includes MobileStickyBar', () => {
    expect(homeShell).toContain('MobileStickyBar');
  });
});

/* ============================================================
 * REGRESSION GUARDS
 * Prevent future overbuilding above the fold.
 * ============================================================ */

describe('Regression — hero height budget', () => {
  it('HeroIntake is under 220 lines (prevent bloat)', () => {
    const lines = heroIntake.split('\n').length;
    expect(lines).toBeLessThanOrEqual(220);
  });

  it('hero section uses tight top padding (pt-2 or pt-6, not pt-12+)', () => {
    expect(heroIntake).toMatch(/className="pt-[26]/);
  });

  it('textarea is 2 rows (not 3+ which pushes content below fold)', () => {
    expect(heroIntake).toContain('rows={2}');
  });

  it('hero does not render marketing cards above the fold', () => {
    expect(heroIntake).not.toContain('pricing');
    expect(heroIntake).not.toContain('testimonial');
    expect(heroIntake).not.toContain('ComparisonTable');
    expect(heroIntake).not.toContain('DashboardPreview');
  });
});

describe('Regression — CTA count above fold', () => {
  it('hero has exactly one primary CTA button (bg-teal-700)', () => {
    const primaryCtas = heroIntake.match(/bg-teal-700/g);
    expect(primaryCtas).toHaveLength(1);
  });

  it('hero does not have secondary styled CTAs (only ICP path buttons)', () => {
    expect(heroIntake).not.toContain('bg-sky-700');
    expect(heroIntake).not.toContain('bg-emerald-700');
  });
});

describe('Regression — Spanish parity in content schema', () => {
  it('every en key in homepageContent has a matching es key', () => {
    const enKeys = (homepageContent.match(/en: '/g) || []).length;
    const esKeys = (homepageContent.match(/es: '/g) || []).length;
    expect(esKeys).toBeGreaterThanOrEqual(enKeys - 1);
  });

  it('hero ICP cards each have en and es labels', () => {
    expect(heroIntake).toContain("label: { en: 'I need free or low-cost legal help'");
    expect(heroIntake).toContain("label: { en: \"I'm a small business\"");
    expect(heroIntake).toContain("label: { en: 'I work with a legal aid / nonprofit organization'");
  });

  it('trust strip items all have es translations', () => {
    const enItems = (trustSignals.match(/text: \{ en:/g) || []).length;
    const esItems = (trustSignals.match(/es:/g) || []).length;
    expect(esItems).toBeGreaterThanOrEqual(enItems);
  });
});

describe('Regression — analytics privacy', () => {
  it('homepageConversionEvents forbids sensitive fields', () => {
    expect(conversionEvents).toContain('FORBIDDEN_ANALYTICS_FIELDS');
    expect(conversionEvents).toContain("'question'");
    expect(conversionEvents).toContain("'email'");
    expect(conversionEvents).toContain("'phone'");
    expect(conversionEvents).toContain("'ssn'");
    expect(conversionEvents).toContain("'case_facts'");
  });

  it('HeroIntake does not track question text in analytics', () => {
    expect(heroIntake).not.toMatch(/trackEvent\([^)]*question/);
    expect(heroIntake).not.toMatch(/trackEvent\([^)]*freeText/);
  });

  it('no conversion event spec includes free-text safeFields', () => {
    expect(conversionEvents).not.toMatch(/safeFields:.*'question'/);
    expect(conversionEvents).not.toMatch(/safeFields:.*'text'/);
    expect(conversionEvents).not.toMatch(/safeFields:.*'email'/);
    expect(conversionEvents).not.toMatch(/safeFields:.*'name'/);
  });
});

describe('Regression — no governance bloat above fold', () => {
  it('hero does not contain multi-paragraph disclaimers', () => {
    expect(heroIntake).not.toContain('This is legal information, not legal advice. Using this does not create');
    expect(heroIntake).not.toContain('attorney-client relationship');
  });

  it('hero safety warning is gated by focus state', () => {
    const warningIdx = heroIntake.indexOf('safetyCopy.inputSafety');
    const focusIdx = heroIntake.lastIndexOf('{focused &&', warningIdx);
    expect(focusIdx).toBeGreaterThan(-1);
  });

  it('hero does not contain "Before you type" expandable (replaced by auto-show)', () => {
    expect(heroIntake).not.toContain('Before you type');
    expect(heroIntake).not.toContain('warningOpen');
    expect(heroIntake).not.toContain('ChevronDown');
  });
});
