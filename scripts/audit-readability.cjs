#!/usr/bin/env node
/**
 * Readability Audit
 * Scans page content for readability issues:
 * - Legal jargon without plain-language alternatives
 * - Long sentences (>35 words)
 * - High Flesch-Kincaid grade level text blocks
 */

const fs = require('fs');
const path = require('path');

let fg;
try {
  fg = require('fast-glob');
} catch {
  console.error('Missing: fast-glob. Run: npm i -D fast-glob');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');

const files = fg.sync(['src/pages/**/*.tsx', 'src/components/**/*.tsx'], {
  cwd: ROOT,
  onlyFiles: true,
}).sort();

const LEGAL_JARGON = [
  'hereinafter', 'whereas', 'notwithstanding', 'aforementioned',
  'hereunder', 'therein', 'hereto', 'thereof', 'pursuant to',
  'in lieu of', 'ab initio', 'inter alia', 'prima facie',
  'ipso facto', 'mutatis mutandis', 'de facto', 'bona fide',
  'caveat emptor', 'subpoena duces tecum',
];

function extractTextStrings(content) {
  const strings = content.match(/['"`]([^'"`]{20,})['"`]/g) || [];
  return strings
    .map(s => s.slice(1, -1))
    .filter(s => /[a-zA-Z]/.test(s) && !/^(src|href|class|id|key|data-)/.test(s));
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const match = word.match(/[aeiouy]{1,2}/g);
  return match ? match.length : 1;
}

function fleschKincaidGrade(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (sentences.length === 0 || words.length === 0) return 0;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return Math.max(0, Math.round((0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) - 15.59) * 10) / 10);
}

let totalFiles = 0;
let filesWithIssues = 0;
let totalIssues = 0;
const results = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  totalFiles++;
  const fileIssues = [];

  const lowerContent = content.toLowerCase();
  for (const term of LEGAL_JARGON) {
    if (lowerContent.includes(term)) {
      const lineNum = content.split('\n').findIndex(l => l.toLowerCase().includes(term)) + 1;
      fileIssues.push({ type: 'jargon', message: `Legal jargon "${term}" (line ${lineNum})` });
    }
  }

  const textBlocks = extractTextStrings(content);
  for (const block of textBlocks) {
    const sentences = block.split(/[.!?]+/).filter(s => s.trim().length > 5);
    for (const sentence of sentences) {
      const wordCount = sentence.trim().split(/\s+/).length;
      if (wordCount > 35) {
        fileIssues.push({
          type: 'long-sentence',
          message: `Sentence with ${wordCount} words: "${sentence.trim().slice(0, 50)}..."`,
        });
      }
    }
    if (block.length > 100) {
      const grade = fleschKincaidGrade(block);
      if (grade > 12) {
        fileIssues.push({
          type: 'high-grade-level',
          message: `Text at grade level ${grade}: "${block.slice(0, 40)}..."`,
        });
      }
    }
  }

  if (fileIssues.length > 0) {
    filesWithIssues++;
    totalIssues += fileIssues.length;
    results.push({ file, issues: fileIssues });
  }
}

console.log('\n  READABILITY AUDIT');
console.log('  ' + '='.repeat(50));
console.log(`  Files scanned:      ${totalFiles}`);
console.log(`  Files with issues:  ${filesWithIssues}`);
console.log(`  Total issues:       ${totalIssues}`);
console.log('  ' + '='.repeat(50));

if (results.length > 0) {
  const grouped = { jargon: [], 'long-sentence': [], 'high-grade-level': [] };
  for (const r of results) {
    for (const issue of r.issues) {
      if (!grouped[issue.type]) grouped[issue.type] = [];
      grouped[issue.type].push({ file: r.file, ...issue });
    }
  }

  if (grouped.jargon.length > 0) {
    console.log(`\n  LEGAL JARGON (${grouped.jargon.length} instances)`);
    console.log('  ' + '-'.repeat(40));
    for (const item of grouped.jargon.slice(0, 20)) {
      console.log(`    ${item.file} - ${item.message}`);
    }
    if (grouped.jargon.length > 20) console.log(`    ... and ${grouped.jargon.length - 20} more`);
  }

  if (grouped['long-sentence'].length > 0) {
    console.log(`\n  LONG SENTENCES (${grouped['long-sentence'].length} instances)`);
    console.log('  ' + '-'.repeat(40));
    for (const item of grouped['long-sentence'].slice(0, 10)) {
      console.log(`    ${item.file} - ${item.message}`);
    }
    if (grouped['long-sentence'].length > 10) console.log(`    ... and ${grouped['long-sentence'].length - 10} more`);
  }

  if (grouped['high-grade-level'].length > 0) {
    console.log(`\n  HIGH GRADE LEVEL (${grouped['high-grade-level'].length} instances)`);
    console.log('  ' + '-'.repeat(40));
    for (const item of grouped['high-grade-level'].slice(0, 10)) {
      console.log(`    ${item.file} - ${item.message}`);
    }
    if (grouped['high-grade-level'].length > 10) console.log(`    ... and ${grouped['high-grade-level'].length - 10} more`);
  }
}

console.log(`\n  Summary: ${totalIssues} readability issues across ${filesWithIssues} files.\n`);
