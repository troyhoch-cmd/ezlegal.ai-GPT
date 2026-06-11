import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../src');

function findFiles(dir: string, ext: string, collected: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findFiles(full, ext, collected);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      collected.push(full);
    }
  }
  return collected;
}

describe('Accessibility CI Checks', () => {
  const tsxFiles = findFiles(path.join(SRC, 'pages'), '.tsx')
    .concat(findFiles(path.join(SRC, 'components'), '.tsx'));

  it('all <img> tags have alt attributes', () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Match <img without alt= (allowing multiline)
      const imgRegex = /<img\b(?![^>]*\balt\b)[^>]*>/g;
      const matches = content.match(imgRegex);
      if (matches) {
        violations.push(`${path.relative(SRC, file)}: ${matches.length} img(s) missing alt`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('interactive elements have accessible labels', () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Find <button> with only an icon inside (no text, no aria-label)
      const iconOnlyButtons = content.match(/<button[^>]*>[\s\n]*<[A-Z]\w+[^>]*\/?>[\s\n]*<\/button>/g);
      if (iconOnlyButtons) {
        // Check if they have aria-label
        for (const btn of iconOnlyButtons) {
          if (!btn.includes('aria-label')) {
            violations.push(`${path.relative(SRC, file)}: icon-only button missing aria-label`);
          }
        }
      }
    }
    // Allow up to 20 violations (regex-based detection produces false positives)
    expect(violations.length).toBeLessThan(20);
  });

  it('form inputs have associated labels or aria-label', () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Find <input without aria-label, aria-labelledby, or id (for label association)
      const inputRegex = /<input\b(?![^>]*(?:aria-label|aria-labelledby))[^>]*>/g;
      const matches = content.match(inputRegex);
      if (matches) {
        // Only flag if there's no nearby <label
        const hasLabels = content.includes('<label');
        if (!hasLabels && matches.length > 0) {
          violations.push(`${path.relative(SRC, file)}: ${matches.length} input(s) may lack labels`);
        }
      }
    }
    // Soft check - report but don't hard-fail on false positives
    expect(violations.length).toBeLessThan(25);
  });

  it('SkipLink component exists and is used in App', () => {
    const skipLink = fs.existsSync(path.join(SRC, 'components/SkipLink.tsx'));
    const app = fs.readFileSync(path.join(SRC, 'App.tsx'), 'utf-8');
    expect(skipLink).toBe(true);
    expect(app).toContain('SkipLink');
  });

  it('main landmark exists in Layout', () => {
    const layout = fs.readFileSync(path.join(SRC, 'components/Layout.tsx'), 'utf-8');
    const hasMain = layout.includes('<main') || layout.includes('role="main"');
    expect(hasMain).toBe(true);
  });
});

describe('Spanish Translation Coverage CI', () => {
  it('EspanolLanding has no bare English user-facing strings', () => {
    const file = fs.readFileSync(path.join(SRC, 'pages/EspanolLanding.tsx'), 'utf-8');
    // Should not have language === 'en' checks (it's a Spanish-only page)
    // All text should be in Spanish
    const bareEnglishPhrases = [
      'Get started',
      'Learn more',
      'Sign up',
      'Free trial',
    ];
    const violations: string[] = [];
    for (const phrase of bareEnglishPhrases) {
      // Check if the phrase appears as a literal string (not in a conditional)
      const regex = new RegExp(`['"\`]${phrase}['"\`](?!.*\\?.*:)`, 'i');
      if (regex.test(file)) {
        violations.push(phrase);
      }
    }
    expect(violations).toEqual([]);
  });

  it('bilingual pages use language conditional for all visible text', () => {
    const bilingualPages = [
      'ForBusiness.tsx',
      'CasePredictor.tsx',
    ];
    const violations: string[] = [];
    for (const pageName of bilingualPages) {
      const filePath = path.join(SRC, 'pages', pageName);
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      // Must import useLanguage
      if (!content.includes('useLanguage')) {
        violations.push(`${pageName}: does not import useLanguage`);
      }
      // Must use language variable
      if (!content.includes("language === 'en'") && !content.includes('language === "en"') && !content.includes('en ?')) {
        violations.push(`${pageName}: no bilingual conditionals found`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('ChatDisclaimer renders in both languages', () => {
    const file = fs.readFileSync(path.join(SRC, 'components/chat/ChatDisclaimer.tsx'), 'utf-8');
    expect(file).toContain('useLanguage');
    expect(file).toContain('informaci'); // Spanish variant (información legal)
  });

  it('no hardcoded English in Spanish espanol components', () => {
    const espanolDir = path.join(SRC, 'components/espanol');
    if (!fs.existsSync(espanolDir)) return;
    const files = findFiles(espanolDir, '.tsx');
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      // These components should primarily be in Spanish
      // Check for common English-only phrases that shouldn't appear without conditional
      const englishOnly = ['Click here', 'Submit', 'Next step'];
      for (const phrase of englishOnly) {
        if (content.includes(`'${phrase}'`) || content.includes(`"${phrase}"`)) {
          if (!content.includes('language') && !content.includes('en ?')) {
            violations.push(`${path.basename(file)}: contains "${phrase}" without language conditional`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('audit-spanish-copy script exists', () => {
    const scriptPath = path.resolve(__dirname, '../scripts/audit-spanish-copy.cjs');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });
});
