/**
 * CTA Copy Regression — guards canonical primary CTA strings and
 * ensures deprecated/unaccented variants never appear.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC = path.resolve(__dirname, '../src');

function readSrc(relPath: string): string {
  return fs.readFileSync(path.resolve(SRC, relPath), 'utf-8');
}

const CANONICAL_EN = 'Start free 2-minute checkup';
const CANONICAL_ES = 'Comenzar revisión gratis de 2 minutos';

const BANNED = [
  'Comenzar revision gratis',
  'Chequeo gratuito',
  'Start free checkup',
  'Iniciar chequeo gratuito',
];

const CTA_FILES = [
  'data/homepageContent.ts',
  'components/home/HeroIntake.tsx',
  'components/home/MobileStickyBar.tsx',
  'components/home/FinalCTA.tsx',
  'components/Navigation.tsx',
];

describe('Primary CTA canonical strings', () => {
  it('homepageContent.ts contains the canonical EN CTA', () => {
    expect(readSrc('data/homepageContent.ts')).toContain(CANONICAL_EN);
  });

  it('homepageContent.ts contains the canonical ES CTA (accented)', () => {
    expect(readSrc('data/homepageContent.ts')).toContain(CANONICAL_ES);
  });

  it('HeroIntake references the canonical CTA via data import', () => {
    const content = readSrc('components/home/HeroIntake.tsx');
    expect(content).toContain('h.primaryCta');
  });

  it('MobileStickyBar uses canonical CTA strings', () => {
    const content = readSrc('components/home/MobileStickyBar.tsx');
    expect(content).toContain(CANONICAL_EN);
    expect(content).toContain(CANONICAL_ES);
  });

  it('FinalCTA uses canonical CTA strings', () => {
    const content = readSrc('components/home/FinalCTA.tsx');
    expect(content).toContain(CANONICAL_EN);
    expect(content).toContain(CANONICAL_ES);
  });

  it('Navigation uses canonical CTA strings', () => {
    const content = readSrc('components/Navigation.tsx');
    expect(content).toContain(CANONICAL_EN);
    expect(content).toContain(CANONICAL_ES);
  });
});

describe('Banned CTA variants do not appear in primary CTA locations', () => {
  for (const file of CTA_FILES) {
    for (const banned of BANNED) {
      it(`"${banned}" absent from ${file}`, () => {
        const content = readSrc(file);
        expect(content).not.toContain(banned);
      });
    }
  }
});
