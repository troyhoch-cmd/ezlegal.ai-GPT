#!/usr/bin/env node
/**
 * audit-spanish-copy.cjs
 * Scans src/data/**\/*.ts for bilingual objects (en/es keys) and reports:
 *   - missing es field
 *   - empty es field
 *   - identical en/es unless allowlisted
 *   - common unaccented Spanish words
 *
 * Usage:
 *   node scripts/audit-spanish-copy.cjs          # report only
 *   node scripts/audit-spanish-copy.cjs --write  # auto-fix accent issues
 *
 * Exit code 1 if issues found (CI-friendly), 0 if clean.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const WRITE_MODE = process.argv.includes('--write');
const DATA_DIR = path.resolve(__dirname, '../src/data');

const ACCENT_MAP = {
  'espanol': 'español',
  'ingles': 'inglés',
  'credito': 'crédito',
  'basicas': 'básicas',
  'proximos': 'próximos',
  'informacion': 'información',
  'asesoria': 'asesoría',
  'revision': 'revisión',
  'contrasena': 'contraseña',
  'telefono': 'teléfono',
  'numero': 'número',
  'unico': 'único',
  'juridica': 'jurídica',
  'juridico': 'jurídico',
  'pagina': 'página',
  'codigo': 'código',
  'analisis': 'análisis',
  'automatica': 'automática',
  'automatico': 'automático',
  'tambien': 'también',
  'mas': 'más',
  'facil': 'fácil',
};

// Words that are legitimately identical in en/es (proper nouns, numbers, symbols)
const IDENTICAL_ALLOWLIST = new Set([
  '$0', '$5', '$9', '$15', '$19', '$29', '$39', '$49', '$59', '$79', '$99',
  '$149', '$199', '$299', '$499',
  '$0/mo', '$5/mo', '$9/mo', '$15/mo', '$19/mo', '$29/mo', '$39/mo', '$49/mo',
  'email', 'Email', 'PDF', 'JSON', 'CSV', 'AI', 'FAQ',
  'ezLegal.ai', 'LegalBreeze', 'Supabase', 'OpenAI',
  '--', '1', '5', '10', '25', '50', '100', 'Boost', 'N/A',
]);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function findBilingualStrings(content) {
  const results = [];
  // Match patterns like { en: '...', es: '...' } or { en: "...", es: "..." }
  const regex = /\{\s*en:\s*(['"`])((?:(?!\1)[^\\]|\\.)*?)\1\s*,\s*es:\s*(['"`])((?:(?!\3)[^\\]|\\.)*?)\3\s*\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const en = match[2];
    const es = match[4];
    const offset = match.index;
    const lineNum = content.substring(0, offset).split('\n').length;
    results.push({ en, es, line: lineNum, offset, fullMatch: match[0] });
  }

  // Also detect { en: ..., es: ... } where es is on a separate line
  const multilineRegex = /en:\s*(['"`])((?:(?!\1)[^\\]|\\.)*?)\1[\s\S]*?es:\s*(['"`])((?:(?!\3)[^\\]|\\.)*?)\3/g;
  while ((match = multilineRegex.exec(content)) !== null) {
    const en = match[2];
    const es = match[4];
    const offset = match.index;
    const lineNum = content.substring(0, offset).split('\n').length;
    // Avoid duplicates from first regex
    const isDuplicate = results.some(r => r.line === lineNum && r.en === en && r.es === es);
    if (!isDuplicate) {
      results.push({ en, es, line: lineNum, offset, fullMatch: match[0] });
    }
  }

  return results;
}

function findMissingEsFields(content) {
  const issues = [];
  // Match objects that have en: but no es: nearby
  const enOnlyRegex = /\{\s*en:\s*(['"`])(?:(?!\1)[^\\]|\\.)*?\1\s*\}/g;
  let match;
  while ((match = enOnlyRegex.exec(content)) !== null) {
    if (!match[0].includes('es:')) {
      const offset = match.index;
      const lineNum = content.substring(0, offset).split('\n').length;
      issues.push({ line: lineNum, text: match[0].substring(0, 60) });
    }
  }
  return issues;
}

function checkAccents(esText) {
  const issues = [];
  const lower = esText.toLowerCase();
  for (const [wrong, correct] of Object.entries(ACCENT_MAP)) {
    // Word boundary check: the wrong word must appear as a whole word
    const wordRegex = new RegExp(`\\b${wrong}\\b`, 'gi');
    if (wordRegex.test(lower)) {
      issues.push({ wrong, correct });
    }
  }
  return issues;
}

function applyAccentFixes(text) {
  let fixed = text;
  for (const [wrong, correct] of Object.entries(ACCENT_MAP)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    fixed = fixed.replace(regex, (match) => {
      // Preserve original casing of first letter
      if (match[0] === match[0].toUpperCase()) {
        return correct[0].toUpperCase() + correct.slice(1);
      }
      return correct;
    });
  }
  return fixed;
}

// --- Main ---

const files = walk(DATA_DIR);
const allIssues = [];
let totalFixed = 0;

for (const file of files) {
  const relPath = path.relative(path.resolve(__dirname, '..'), file);
  let content = fs.readFileSync(file, 'utf8');
  const fileIssues = [];

  // Check for bilingual pairs
  const pairs = findBilingualStrings(content);
  for (const pair of pairs) {
    // Empty es
    if (pair.es.trim() === '') {
      fileIssues.push({
        type: 'empty_es',
        line: pair.line,
        message: `Empty es field (en: "${pair.en.substring(0, 40)}...")`,
      });
    }

    // Identical en/es
    if (pair.en === pair.es && !IDENTICAL_ALLOWLIST.has(pair.en)) {
      fileIssues.push({
        type: 'identical',
        line: pair.line,
        message: `Identical en/es: "${pair.en.substring(0, 50)}"`,
      });
    }

    // Accent issues in es
    const accentIssues = checkAccents(pair.es);
    for (const ai of accentIssues) {
      fileIssues.push({
        type: 'accent',
        line: pair.line,
        message: `"${ai.wrong}" should be "${ai.correct}"`,
        wrong: ai.wrong,
        correct: ai.correct,
      });
    }
  }

  // Check for missing es fields
  const missing = findMissingEsFields(content);
  for (const m of missing) {
    fileIssues.push({
      type: 'missing_es',
      line: m.line,
      message: `Object has en: but no es: field (${m.text}...)`,
    });
  }

  // Also scan all Spanish string content for accent issues (even outside matched pairs)
  const esStringRegex = /es:\s*(['"`])((?:(?!\1)[^\\]|\\.)*?)\1/g;
  let esMatch;
  while ((esMatch = esStringRegex.exec(content)) !== null) {
    const esText = esMatch[2];
    const lineNum = content.substring(0, esMatch.index).split('\n').length;
    const accentIssues = checkAccents(esText);
    for (const ai of accentIssues) {
      const alreadyReported = fileIssues.some(
        fi => fi.line === lineNum && fi.wrong === ai.wrong
      );
      if (!alreadyReported) {
        fileIssues.push({
          type: 'accent',
          line: lineNum,
          message: `"${ai.wrong}" should be "${ai.correct}"`,
          wrong: ai.wrong,
          correct: ai.correct,
        });
      }
    }
  }

  // Apply fixes in --write mode
  if (WRITE_MODE && fileIssues.some(i => i.type === 'accent')) {
    let modified = content;
    // Fix accent issues in es: string values
    modified = modified.replace(
      /(es:\s*(['"`]))((?:(?!\2)[^\\]|\\.)*?)(\2)/g,
      (fullMatch, prefix, quote, esContent, endQuote) => {
        const fixed = applyAccentFixes(esContent);
        if (fixed !== esContent) {
          totalFixed++;
          return prefix + fixed + endQuote;
        }
        return fullMatch;
      }
    );

    // Also fix accent issues in es arrays
    // Pattern: es: [ '...', '...' ]
    modified = modified.replace(
      /(es:\s*\[)([\s\S]*?)(\])/g,
      (fullMatch, prefix, arrayContent, suffix) => {
        const fixed = applyAccentFixes(arrayContent);
        if (fixed !== arrayContent) {
          totalFixed++;
          return prefix + fixed + suffix;
        }
        return fullMatch;
      }
    );

    if (modified !== content) {
      fs.writeFileSync(file, modified, 'utf8');
    }
  }

  if (fileIssues.length > 0) {
    allIssues.push({ file: relPath, issues: fileIssues });
  }
}

// --- Output ---

if (allIssues.length === 0) {
  console.log('Spanish parity audit: PASS (no issues found)');
  process.exit(0);
}

// CI-friendly output
console.log(`\nSpanish Parity Audit Report`);
console.log('='.repeat(60));
console.log(`Files scanned: ${files.length}`);
console.log(`Files with issues: ${allIssues.length}`);

const totalIssueCount = allIssues.reduce((sum, f) => sum + f.issues.length, 0);
console.log(`Total issues: ${totalIssueCount}`);

if (WRITE_MODE) {
  console.log(`Accent fixes applied: ${totalFixed}`);
}

console.log('');

const byType = { missing_es: 0, empty_es: 0, identical: 0, accent: 0 };
for (const { issues } of allIssues) {
  for (const issue of issues) {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  }
}

console.log('Summary by type:');
if (byType.missing_es > 0) console.log(`  Missing es:   ${byType.missing_es}`);
if (byType.empty_es > 0) console.log(`  Empty es:     ${byType.empty_es}`);
if (byType.identical > 0) console.log(`  Identical:    ${byType.identical}`);
if (byType.accent > 0) console.log(`  Accent:       ${byType.accent}`);
console.log('');

for (const { file, issues } of allIssues) {
  console.log(`\n${file}`);
  console.log('-'.repeat(file.length));
  for (const issue of issues) {
    const typeLabel = issue.type.toUpperCase().padEnd(12);
    console.log(`  L${String(issue.line).padStart(4)} [${typeLabel}] ${issue.message}`);
  }
}

console.log('\n' + '='.repeat(60));
if (!WRITE_MODE && byType.accent > 0) {
  console.log('Run with --write to auto-fix accent issues.');
}

process.exit(1);
