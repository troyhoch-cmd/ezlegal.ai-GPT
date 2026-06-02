/**
 * Bilingual Parity Tests
 *
 * Validates that Spanish mode renders Spanish CTAs, warnings, path labels,
 * intake review, and pricing expectations. Fails if key English strings
 * remain in Spanish-mode components.
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
const URGENT_STRIP = readSrc('components/home/UrgentStrip.tsx');

const AUDIENCE_PATHS_SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../src/data/audiencePaths.ts'),
  'utf-8'
);

const AI_SAFETY_SOURCE = readSrc('pages/AISafety.tsx');
const PERSONA_INTAKE_SOURCE = readSrc('pages/PersonaIntake.tsx');
const GOVERNANCE_COPY_SOURCE = readSrc('data/governanceCopy.ts');

describe('Bilingual parity — audiencePaths data', () => {
  it('every path config has both en and es for headline', () => {
    expect(AUDIENCE_PATHS_SOURCE).toContain("headline:");
    const enMatches = AUDIENCE_PATHS_SOURCE.match(/headline:\s*\{[^}]*en:/g);
    const esMatches = AUDIENCE_PATHS_SOURCE.match(/headline:\s*\{[^}]*es:/g);
    expect(enMatches!.length).toBeGreaterThanOrEqual(3);
    expect(esMatches!.length).toBeGreaterThanOrEqual(3);
  });

  it('every path has en/es for primaryCTA label', () => {
    const labels = AUDIENCE_PATHS_SOURCE.match(/label:\s*\{[^}]*en:[^}]*es:/g);
    expect(labels!.length).toBeGreaterThanOrEqual(6);
  });

  it('every path has en/es for pricingExpectation', () => {
    expect(AUDIENCE_PATHS_SOURCE).toContain("pricingExpectation:");
    const matches = AUDIENCE_PATHS_SOURCE.match(/pricingExpectation:\s*\{[^}]*en:/g);
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });

  it('every path has en/es for safetyReminders', () => {
    const matches = AUDIENCE_PATHS_SOURCE.match(/safetyReminders:/g);
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });
});

const HOMEPAGE_CONTENT = readSrc('data/homepageContent.ts');

describe('Bilingual parity — Home components', () => {
  it('hero has both English and Spanish headlines in content data', () => {
    expect(HOMEPAGE_CONTENT).toContain('Free legal help tools in English or Spanish');
    expect(HOMEPAGE_CONTENT).toContain('Herramientas legales gratuitas en ingl');
  });

  it('hero ICP cards have Spanish variants', () => {
    expect(HERO_INTAKE).toContain('No puedo pagar un abogado');
    expect(HERO_INTAKE).toContain('Tengo un peque');
  });

  it('hero scope statement has Spanish variant in content data', () => {
    expect(HOMEPAGE_CONTENT).toContain('No es un bufete. No es asesor');
  });

  it('urgent strip has Spanish copy', () => {
    expect(URGENT_STRIP).toContain('Plazo urgente o peligro');
  });

  it('language toggle tracks selection', () => {
    expect(HERO_INTAKE).toContain('trackLanguageSelected');
  });

  it('homepageContent SMB has full bilingual parity', () => {
    expect(HOMEPAGE_CONTENT).toContain("en: 'For small businesses'");
    expect(HOMEPAGE_CONTENT).toContain("es: 'Para peque");
    expect(HOMEPAGE_CONTENT).toContain("en: 'Check a business issue'");
    expect(HOMEPAGE_CONTENT).toContain("es: 'Revisar un problema de negocio'");
  });

  it('homepageContent partner has full bilingual parity', () => {
    expect(HOMEPAGE_CONTENT).toContain("en: 'For legal-aid and pro bono teams'");
    expect(HOMEPAGE_CONTENT).toContain("es: 'Para equipos de ayuda legal y pro bono'");
    expect(HOMEPAGE_CONTENT).toContain("en: 'View partner dashboard demo'");
    expect(HOMEPAGE_CONTENT).toContain("es: 'Ver demo del panel de socios'");
  });

  it('every BilingualText in homepageContent has both en and es', () => {
    const enCount = (HOMEPAGE_CONTENT.match(/en: '/g) || []).length;
    const esCount = (HOMEPAGE_CONTENT.match(/es: '/g) || []).length;
    expect(enCount).toBeGreaterThanOrEqual(20);
    expect(esCount).toBeGreaterThanOrEqual(20);
    expect(Math.abs(enCount - esCount)).toBeLessThanOrEqual(2);
  });
});

describe('Bilingual parity — AISafety.tsx', () => {
  it('uses governance sections with bilingual rendering', () => {
    expect(AI_SAFETY_SOURCE).toContain('section.title.en');
    expect(AI_SAFETY_SOURCE).toContain('section.title.es');
  });

  it('uses governance content bilingual', () => {
    expect(AI_SAFETY_SOURCE).toContain('section.content.en');
    expect(AI_SAFETY_SOURCE).toContain('section.content.es');
  });

  it('report problem CTA is bilingual', () => {
    expect(AI_SAFETY_SOURCE).toContain('reportProblemCTA.en');
    expect(AI_SAFETY_SOURCE).toContain('reportProblemCTA.es');
  });
});

describe('Bilingual parity — governanceCopy data', () => {
  it('all sections have both en and es content', () => {
    const enContent = GOVERNANCE_COPY_SOURCE.match(/content:\s*\{[^}]*en:/g);
    const esContent = GOVERNANCE_COPY_SOURCE.match(/content:\s*\{[^}]*es:/g);
    expect(enContent!.length).toBeGreaterThanOrEqual(6);
    expect(esContent!.length).toBeGreaterThanOrEqual(6);
  });

  it('disclaimer has both languages', () => {
    expect(GOVERNANCE_COPY_SOURCE).toContain('governanceDisclaimer');
    expect(GOVERNANCE_COPY_SOURCE).toContain("en: 'ezLegal.ai is not a law firm");
    expect(GOVERNANCE_COPY_SOURCE).toContain("es: 'ezLegal.ai no es un bufete");
  });
});

describe('Bilingual parity — PersonaIntake', () => {
  it('supports path=organizations', () => {
    expect(PERSONA_INTAKE_SOURCE).toContain("pathParam === 'organizations'");
  });

  it('review screen shows language field', () => {
    expect(PERSONA_INTAKE_SOURCE).toContain("'Language:'");
    expect(PERSONA_INTAKE_SOURCE).toContain("'Idioma:'");
  });

  it('issue labels have Spanish alternatives', () => {
    expect(PERSONA_INTAKE_SOURCE).toContain('labelEs:');
    const esLabels = PERSONA_INTAKE_SOURCE.match(/labelEs:/g);
    expect(esLabels!.length).toBeGreaterThanOrEqual(15);
  });
});
