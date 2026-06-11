#!/usr/bin/env node
/**
 * i18n-audit.cjs
 * Compares EN and ES translation key sets, finds orphaned t('key') usages,
 * and detects raw dot-notation strings rendered in JSX that look like untranslated keys.
 *
 * Usage:
 *   node scripts/i18n-audit.cjs          # CI mode: exits 1 on missing keys
 *   node scripts/i18n-audit.cjs --warn   # warn-only mode: exits 0 even with issues
 *
 * Exit code 1 if critical issues found (missing keys), 0 otherwise.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const WARN_ONLY = process.argv.includes('--warn');
const SRC_DIR = path.resolve(__dirname, '../src');
const TRANSLATIONS_PATH = path.resolve(SRC_DIR, 'lib/translations.ts');

// --- Parse translation keys from translations.ts ---

function parseTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const enKeys = new Set();
  const esKeys = new Set();

  // Find the en: { ... } block (from "en: {" to the matching close before "es: {")
  const enBlockMatch = content.match(/\ben:\s*\{([\s\S]*?)\n\s*\},\s*\n\s*es:/);
  const esBlockMatch = content.match(/\bes:\s*\{([\s\S]*?)\n\s*\}\s*\n?\s*\};/);

  if (!enBlockMatch) {
    console.error('ERROR: Could not parse EN block from translations.ts');
    process.exit(2);
  }
  if (!esBlockMatch) {
    console.error('ERROR: Could not parse ES block from translations.ts');
    process.exit(2);
  }

  const keyRegex = /['"]([a-zA-Z0-9_.]+)['"]\s*:/g;

  let match;
  while ((match = keyRegex.exec(enBlockMatch[1])) !== null) {
    enKeys.add(match[1]);
  }

  keyRegex.lastIndex = 0;
  while ((match = keyRegex.exec(esBlockMatch[1])) !== null) {
    esKeys.add(match[1]);
  }

  return { enKeys, esKeys };
}

// --- Walk source files ---

function walk(dir, extensions = ['.ts', '.tsx']) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

// --- Find all t('key') usages in source ---

function findTUsages(files) {
  const usages = [];
  // Matches: t('key'), t("key"), t(`key`)
  const tRegex = /\bt\(\s*(['"`])([a-zA-Z0-9_.]+)\1\s*[,)]/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    tRegex.lastIndex = 0;
    while ((match = tRegex.exec(content)) !== null) {
      const key = match[2];
      const line = content.substring(0, match.index).split('\n').length;
      usages.push({ key, file: path.relative(SRC_DIR, file), line });
    }
  }
  return usages;
}

// --- Detect raw key-like strings in JSX ---

function findRawKeyStrings(files) {
  const suspicious = [];
  // Dot-notation strings that look like translation keys rendered directly in JSX
  // Pattern: >{someVar.that.looks.like.key}< or >"some.key.string"<
  const jsxStringRegex = />\s*['"]([a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*){2,})['"]\s*</g;
  const jsxExprRegex = /\{['"]([a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*){2,})['"]\}/g;

  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    const content = fs.readFileSync(file, 'utf8');
    let match;

    jsxStringRegex.lastIndex = 0;
    while ((match = jsxStringRegex.exec(content)) !== null) {
      const key = match[1];
      const line = content.substring(0, match.index).split('\n').length;
      suspicious.push({ key, file: path.relative(SRC_DIR, file), line });
    }

    jsxExprRegex.lastIndex = 0;
    while ((match = jsxExprRegex.exec(content)) !== null) {
      const key = match[1];
      const line = content.substring(0, match.index).split('\n').length;
      suspicious.push({ key, file: path.relative(SRC_DIR, file), line });
    }
  }
  return suspicious;
}

// --- Main ---

const { enKeys, esKeys } = parseTranslationKeys(TRANSLATIONS_PATH);
const files = walk(SRC_DIR);
const tUsages = findTUsages(files);
const rawKeys = findRawKeyStrings(files);

// Compute deltas
const missingInEs = [...enKeys].filter(k => !esKeys.has(k)).sort();
const missingInEn = [...esKeys].filter(k => !enKeys.has(k)).sort();

// t() calls referencing keys that don't exist in EN
const allDefinedKeys = new Set([...enKeys, ...esKeys]);
const orphanedUsages = tUsages.filter(u => !allDefinedKeys.has(u.key));

// Deduplicate orphaned keys
const orphanedKeys = [...new Set(orphanedUsages.map(u => u.key))].sort();

// --- Output ---

const hasCritical = missingInEs.length > 0 || missingInEn.length > 0;
const hasOrphans = orphanedKeys.length > 0;
const hasRawKeys = rawKeys.length > 0;

console.log('\ni18n Translation Audit');
console.log('='.repeat(60));
console.log(`EN keys: ${enKeys.size}`);
console.log(`ES keys: ${esKeys.size}`);
console.log(`t() usages found: ${tUsages.length}`);
console.log(`Unique t() keys: ${new Set(tUsages.map(u => u.key)).size}`);
console.log('');

if (missingInEs.length > 0) {
  console.log(`CRITICAL: ${missingInEs.length} key(s) in EN but missing in ES:`);
  for (const k of missingInEs.slice(0, 30)) {
    console.log(`  - ${k}`);
  }
  if (missingInEs.length > 30) {
    console.log(`  ... and ${missingInEs.length - 30} more`);
  }
  console.log('');
}

if (missingInEn.length > 0) {
  console.log(`CRITICAL: ${missingInEn.length} key(s) in ES but missing in EN:`);
  for (const k of missingInEn.slice(0, 30)) {
    console.log(`  - ${k}`);
  }
  if (missingInEn.length > 30) {
    console.log(`  ... and ${missingInEn.length - 30} more`);
  }
  console.log('');
}

if (hasOrphans) {
  console.log(`WARNING: ${orphanedKeys.length} t() key(s) not found in translations:`);
  for (const k of orphanedKeys.slice(0, 20)) {
    const locations = orphanedUsages.filter(u => u.key === k).slice(0, 2);
    const locStr = locations.map(l => `${l.file}:${l.line}`).join(', ');
    console.log(`  - "${k}" (${locStr})`);
  }
  if (orphanedKeys.length > 20) {
    console.log(`  ... and ${orphanedKeys.length - 20} more`);
  }
  console.log('');
}

if (hasRawKeys) {
  console.log(`WARNING: ${rawKeys.length} raw dot-notation string(s) in JSX (possible untranslated keys):`);
  for (const r of rawKeys.slice(0, 10)) {
    console.log(`  - "${r.key}" at ${r.file}:${r.line}`);
  }
  if (rawKeys.length > 10) {
    console.log(`  ... and ${rawKeys.length - 10} more`);
  }
  console.log('');
}

if (!hasCritical && !hasOrphans && !hasRawKeys) {
  console.log('PASS: All EN/ES keys match, no orphaned t() calls, no raw key strings.');
}

console.log('='.repeat(60));

if (hasCritical && !WARN_ONLY) {
  console.log('FAIL: Missing translations detected. Fix before merging.');
  process.exit(1);
}

if (hasOrphans || hasRawKeys) {
  console.log('WARN: Non-critical issues detected (see above).');
}

process.exit(0);
