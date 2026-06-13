#!/usr/bin/env node
/**
 * Heading Hierarchy Audit
 * Scans all page and component files for heading tag usage (h1-h6)
 * and reports hierarchy violations.
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

const HEADING_RE = /<h([1-6])[\s>]/g;

let totalIssues = 0;
let totalFiles = 0;
let filesWithIssues = 0;
const results = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lines = content.split('\n');
  totalFiles++;

  const headings = [];
  for (let i = 0; i < lines.length; i++) {
    let match;
    HEADING_RE.lastIndex = 0;
    while ((match = HEADING_RE.exec(lines[i])) !== null) {
      headings.push({ level: parseInt(match[1], 10), line: i + 1 });
    }
  }

  if (headings.length === 0) continue;

  const fileIssues = [];

  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count > 1) {
    fileIssues.push({
      type: 'multiple-h1',
      message: `Multiple h1 tags found (${h1Count} total)`,
    });
  }

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      fileIssues.push({
        type: 'skipped-level',
        message: `Heading level skipped: h${prev} -> h${curr} (line ${headings[i].line})`,
      });
    }
  }

  if (file.includes('pages/') && headings.length > 0 && headings[0].level > 2) {
    fileIssues.push({
      type: 'missing-top-heading',
      message: `Page starts with h${headings[0].level} instead of h1 or h2`,
    });
  }

  if (fileIssues.length > 0) {
    filesWithIssues++;
    totalIssues += fileIssues.length;
    results.push({ file, headings: headings.length, issues: fileIssues });
  }
}

console.log('\n  HEADING HIERARCHY AUDIT');
console.log('  ' + '='.repeat(50));
console.log(`  Files scanned:      ${totalFiles}`);
console.log(`  Files with issues:  ${filesWithIssues}`);
console.log(`  Total issues:       ${totalIssues}`);
console.log('  ' + '='.repeat(50));

if (results.length > 0) {
  console.log('');
  for (const r of results) {
    console.log(`  ${r.file} (${r.headings} headings)`);
    for (const issue of r.issues) {
      const icon = issue.type === 'multiple-h1' ? '[WARN]' :
                   issue.type === 'skipped-level' ? '[ERROR]' : '[INFO]';
      console.log(`    ${icon} ${issue.message}`);
    }
    console.log('');
  }
}

console.log(`  Summary: ${totalIssues} heading issues across ${filesWithIssues} files.\n`);
