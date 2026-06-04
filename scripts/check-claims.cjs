#!/usr/bin/env node
/**
 * check-claims.js
 * Scans source files for banned trust claims from CLAIMS_REGISTRY.
 * Exit code 1 if violations found, 0 if clean.
 * Usage: node scripts/check-claims.js
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SRC_DIR = path.resolve(__dirname, '../src');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'test-results', 'playwright-report']);
const SKIP_FILES = new Set(['claims-registry.ts', 'site-review-content.ts', 'QADashboard.tsx']);
const SCAN_EXTENSIONS = new Set(['.tsx', '.ts']);

// Banned phrases from claims-registry.ts
const BANNED_PHRASES = [
  'attorney-approved',
  'bank-level security',
  'guaranteed results',
  '100% accurate',
  'always correct',
  'never wrong',
  'join thousands',
  'trusted by thousands',
  '10,000+ businesses',
  '50+ active partners',
  'serving 3x more',
  '29,000+ satisfied',
  '50k+ questions',
  '4.8/5',
  'save 80%',
];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      if (!SKIP_FILES.has(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function main() {
  const files = walk(SRC_DIR);
  const violations = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const phrase of BANNED_PHRASES) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comments, imports, and banned-phrase-handling logic
        const trimmed = line.trimStart();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ')) continue;
        if (line.includes('BANNED_PHRASES') || line.includes('validateClaimText')) continue;

        if (line.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            file: path.relative(SRC_DIR, filePath),
            line: i + 1,
            phrase,
            context: line.trim().substring(0, 100),
          });
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log(`[check:claims] PASS - Scanned ${files.length} files, no banned phrases found.`);
    process.exit(0);
  } else {
    console.error(`[check:claims] FAIL - Found ${violations.length} banned phrase violation(s):\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}`);
      console.error(`    Phrase: "${v.phrase}"`);
      console.error(`    Context: ${v.context}\n`);
    }
    process.exit(1);
  }
}

main();
