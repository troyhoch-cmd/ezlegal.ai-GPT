import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectSensitiveData, containsUrgentKeyword, urgentKeywords, SOURCES_UNAVAILABLE_NOTICE, disclaimerCopy } from '../src/lib/legalSafetyConfig';
import { BANNED_PHRASES } from '../src/lib/claims-registry';
import { LEGAL_AID_DIRECTORY, getVerificationWarnings, needsVerificationDisplay } from '../src/lib/legalAid/directory';

/**
 * Acceptance criteria unit tests for the ezLegal.ai redesign.
 * Covers criteria 3, 4, 5, 8, 9, 10 from Bolt prompt 9.
 */

// ─── Criterion 3: SSN/password/bank/card patterns trigger sensitive data warning ───
describe('Criterion 3: Sensitive data detection', () => {

  it('detects SSN patterns', () => {
    const result = detectSensitiveData('My SSN is 123-45-6789');
    expect(result.detected).toBe(true);
    expect(result.types).toContain('SSN');
  });

  it('detects SSN without dashes', () => {
    const result = detectSensitiveData('SSN: 123 45 6789');
    expect(result.detected).toBe(true);
    expect(result.types).toContain('SSN');
  });

  it('detects credit card patterns', () => {
    const result = detectSensitiveData('Card number 4111 1111 1111 1111');
    expect(result.detected).toBe(true);
    expect(result.types).toContain('credit_card');
  });

  it('detects password sharing', () => {
    const result = detectSensitiveData('my password is hunter2');
    expect(result.detected).toBe(true);
    expect(result.types).toContain('password');
  });

  it('does not flag normal legal text', () => {
    const result = detectSensitiveData('I received an eviction notice 5 days ago.');
    expect(result.detected).toBe(false);
    expect(result.types).toHaveLength(0);
  });

  it('handles empty/short input gracefully', () => {
    expect(detectSensitiveData('')).toEqual({ detected: false, types: [] });
    expect(detectSensitiveData('hi')).toEqual({ detected: false, types: [] });
  });
});

// ─── Criterion 4: Urgent keywords trigger urgent-resource flow ───
describe('Criterion 4: Urgency detection', () => {

  const REQUIRED_TRIGGERS = [
    { category: 'Eviction', text: 'I got an eviction notice yesterday' },
    { category: 'DV', text: 'I am a victim of domestic violence' },
    { category: 'Court deadline', text: 'My court date is tomorrow' },
    { category: 'Immigration detention', text: 'ice at my door' },
    { category: 'Criminal arrest', text: 'I was arrested last night' },
    { category: 'Custody emergency', text: 'They took my child from school' },
  ];

  for (const { category, text } of REQUIRED_TRIGGERS) {
    it(`detects ${category} trigger`, () => {
      expect(containsUrgentKeyword(text)).toBe(true);
    });
  }

  it('includes Spanish-language urgent keywords', () => {
    expect(containsUrgentKeyword('desalojo inmediato')).toBe(true);
    expect(containsUrgentKeyword('violencia doméstica')).toBe(true);
    expect(containsUrgentKeyword('deportación')).toBe(true);
  });

  it('does not flag normal legal questions', () => {
    expect(containsUrgentKeyword('What are my rights as a tenant?')).toBe(false);
    expect(containsUrgentKeyword('How do I start a small business?')).toBe(false);
  });

  it('urgentKeywords array is non-empty', () => {
    expect(urgentKeywords.length).toBeGreaterThan(20);
  });
});

// ─── Criterion 5: Sources unavailable message exists ───
describe('Criterion 5: Sources unavailable message', () => {

  it('has SOURCES_UNAVAILABLE_NOTICE in English', () => {
    expect(SOURCES_UNAVAILABLE_NOTICE.en).toBeTruthy();
    expect(SOURCES_UNAVAILABLE_NOTICE.en).toContain('unavailable');
    expect(SOURCES_UNAVAILABLE_NOTICE.en).toContain('verification');
  });

  it('has SOURCES_UNAVAILABLE_NOTICE in Spanish', () => {
    expect(SOURCES_UNAVAILABLE_NOTICE.es).toBeTruthy();
    expect(SOURCES_UNAVAILABLE_NOTICE.es).toContain('disponibles');
  });

  it('has sourcesUnavailable disclaimer copy', () => {
    expect(disclaimerCopy.sourcesUnavailable.en).toContain('unavailable');
    expect(disclaimerCopy.sourcesUnavailable.es).toContain('disponibles');
  });
});

// ─── Criterion 8: Organization pages do not imply real partnerships ───
describe('Criterion 8: No implied partnerships without evidence', () => {

  it('all directory entries with null sourceUrl get verification warning', () => {
    const nullSourceEntries = LEGAL_AID_DIRECTORY.filter((org: { sourceUrl: string | null }) => !org.sourceUrl);
    expect(nullSourceEntries.length).toBeGreaterThan(0);

    for (const org of nullSourceEntries) {
      const warnings = getVerificationWarnings(org);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w: { key: string }) => w.key === 'contact_directly')).toBe(true);
    }
  });

  it('all directory entries with needs_verification status get warning', () => {
    const unverifiedEntries = LEGAL_AID_DIRECTORY.filter((org: { status: string }) => org.status === 'needs_verification');
    expect(unverifiedEntries.length).toBeGreaterThan(0);

    for (const org of unverifiedEntries) {
      expect(needsVerificationDisplay(org)).toBe(true);
      const warnings = getVerificationWarnings(org);
      expect(warnings.some((w: { key: string }) => w.key === 'needs_verification')).toBe(true);
    }
  });

  it('ForOrganizations page has partnership disclaimer', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/pages/ForOrganizations.tsx'),
      'utf-8'
    );
    expect(content).toContain('do not imply existing partnerships');
    expect(content).toContain('All integration features require a signed agreement');
  });
});

// ─── Criterion 9: No analytics event contains PII ───
describe('Criterion 9: Analytics excludes PII', () => {
  it('CaseQueueItem interface does not include clientName or caseDescription', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/services/case-matching-service.ts'),
      'utf-8'
    );
    const queueInterface = content.match(/export interface CaseQueueItem \{[\s\S]*?\}/);
    expect(queueInterface).not.toBeNull();
    const interfaceText = queueInterface![0];
    expect(interfaceText).not.toContain('clientName');
    expect(interfaceText).not.toContain('caseDescription');
    expect(interfaceText).not.toContain('clientEmail');
    expect(interfaceText).not.toContain('clientPhone');
  });

  it('getCaseQueue selects only non-PII columns', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/services/case-matching-service.ts'),
      'utf-8'
    );
    const selectMatch = content.match(/getCaseQueue[\s\S]*?\.select\(['"`](.*?)['"`]\)/);
    expect(selectMatch).not.toBeNull();
    const selectCols = selectMatch![1];
    expect(selectCols).not.toContain('client_name');
    expect(selectCols).not.toContain('client_email');
    expect(selectCols).not.toContain('client_phone');
    expect(selectCols).not.toContain('case_description');
  });

  it('getMatchingStats has PII exclusion comment', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/services/case-matching-service.ts'),
      'utf-8'
    );
    expect(content).toContain('Never includes client names, narratives, phone, email, address, or case facts');
  });
});

// ─── Criterion 10: No banned trust claims in public UI ───
describe('Criterion 10: Banned claims not in public UI', () => {
  const SRC_DIR = path.resolve(__dirname, '../src');
  const SKIP_DIRS = ['node_modules', '.git', 'dist'];
  const SKIP_FILES = ['claims-registry.ts', 'site-review-content.ts', 'QADashboard.tsx'];
  const SCAN_EXTENSIONS = ['.tsx', '.ts'];

  function walk(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walk(fullPath));
      } else if (SCAN_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        if (!SKIP_FILES.includes(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  it('BANNED_PHRASES array is populated', () => {
    expect(BANNED_PHRASES.length).toBeGreaterThan(10);
  });

  it('no banned phrase appears in user-facing source files', () => {
    const files = walk(SRC_DIR);
    const violations: { file: string; phrase: string; line: number }[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      for (const phrase of BANNED_PHRASES) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Skip comments and imports
          if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*') || line.trimStart().startsWith('import ')) continue;
          // Skip test data markers and banned-phrase-related logic
          if (line.includes('BANNED_PHRASES') || line.includes('validateClaimText')) continue;

          if (line.toLowerCase().includes(phrase.toLowerCase())) {
            violations.push({
              file: path.relative(SRC_DIR, filePath),
              phrase,
              line: i + 1,
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      const summary = violations
        .slice(0, 10)
        .map(v => `  ${v.file}:${v.line} — "${v.phrase}"`)
        .join('\n');
      expect.fail(`Found ${violations.length} banned phrase violation(s):\n${summary}`);
    }
  });
});
