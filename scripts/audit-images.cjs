#!/usr/bin/env node
/**
 * Image Accessibility & SEO Audit
 * Scans for: missing alt, missing lazy loading, SVGs without aria, CLS risks.
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

const IMG_TAG_RE = /<img\b[^>]*>/g;

let totalFiles = 0;
let totalImages = 0;
let filesWithIssues = 0;
let totalIssues = 0;
const results = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lines = content.split('\n');
  totalFiles++;
  const fileIssues = [];

  for (let i = 0; i < lines.length; i++) {
    let match;
    IMG_TAG_RE.lastIndex = 0;
    while ((match = IMG_TAG_RE.exec(lines[i])) !== null) {
      totalImages++;
      const imgTag = match[0];

      if (!imgTag.includes('alt=') && !imgTag.includes('alt ')) {
        fileIssues.push({ type: 'missing-alt', line: i + 1, message: `<img> missing alt (line ${i + 1})` });
      }
      if (!imgTag.includes('loading=') && !imgTag.includes('fetchpriority')) {
        fileIssues.push({ type: 'missing-lazy', line: i + 1, message: `<img> missing loading="lazy" (line ${i + 1})` });
      }
      if (!imgTag.includes('width') && !imgTag.includes('w-') && !imgTag.includes('className')) {
        fileIssues.push({ type: 'missing-dimensions', line: i + 1, message: `<img> no explicit dimensions (line ${i + 1})` });
      }
    }
  }

  const svgMatches = content.match(/<svg\b[^>]*>/g) || [];
  for (const svgTag of svgMatches) {
    if (!svgTag.includes('aria-label') && !svgTag.includes('aria-hidden') && !svgTag.includes('role=')) {
      const lineIdx = content.indexOf(svgTag);
      const lineNum = content.slice(0, lineIdx).split('\n').length;
      fileIssues.push({ type: 'svg-no-label', line: lineNum, message: `<svg> missing aria-label/aria-hidden (line ${lineNum})` });
    }
  }

  if (fileIssues.length > 0) {
    filesWithIssues++;
    totalIssues += fileIssues.length;
    results.push({ file, issues: fileIssues });
  }
}

console.log('\n  IMAGE ACCESSIBILITY & SEO AUDIT');
console.log('  ' + '='.repeat(50));
console.log(`  Files scanned:      ${totalFiles}`);
console.log(`  Total images found: ${totalImages}`);
console.log(`  Files with issues:  ${filesWithIssues}`);
console.log(`  Total issues:       ${totalIssues}`);
console.log('  ' + '='.repeat(50));

if (results.length > 0) {
  const grouped = {};
  for (const r of results) {
    for (const issue of r.issues) {
      if (!grouped[issue.type]) grouped[issue.type] = [];
      grouped[issue.type].push({ file: r.file, ...issue });
    }
  }

  const labels = {
    'missing-alt': 'MISSING ALT TEXT (Critical A11y)',
    'missing-lazy': 'MISSING LAZY LOADING (Performance)',
    'missing-dimensions': 'MISSING DIMENSIONS (CLS Risk)',
    'svg-no-label': 'SVG WITHOUT ARIA (A11y)',
  };

  for (const [type, label] of Object.entries(labels)) {
    const items = grouped[type] || [];
    if (items.length === 0) continue;
    console.log(`\n  ${label} (${items.length} instances)`);
    console.log('  ' + '-'.repeat(40));
    for (const item of items.slice(0, 10)) {
      console.log(`    ${item.file}:${item.line}`);
    }
    if (items.length > 10) console.log(`    ... and ${items.length - 10} more`);
  }
}

console.log(`\n  Summary: ${totalIssues} image issues across ${filesWithIssues} files.\n`);
