/**
 * export-merged-for-audit.cjs
 *
 * Bundles the P0/P1/P2 merged files into a single text file for upload to GPT-5.5 Pro
 * alongside the audit prompt (scripts/gpt-post-merge-audit-prompt.md).
 *
 * Usage: node scripts/export-merged-for-audit.cjs
 * Output: scripts/output/merged-audit-bundle.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Files to audit — add P1/P2 files here as they are merged
const MERGED_FILES = [
  // P0 (completed + fixes applied)
  'src/pages/ForBusiness.tsx',
  'src/pages/EZReads.tsx',
  'src/pages/Documents.tsx',
  // P1 (fixes applied)
  'src/pages/ChatV2.tsx',
  'src/pages/Ask.tsx',
  'src/pages/Checkout.tsx',
  // P1 (add as merged)
  // 'src/pages/Dashboard.tsx',
  // 'src/pages/Negotiate.tsx',
  // 'src/pages/Research.tsx',
  // 'src/pages/IssuePacks.tsx',
  // P2 (add as merged)
  // 'src/pages/ForPartners.tsx',
  // 'src/pages/PartnerHub.tsx',
  // 'src/pages/TrustCenter.tsx',
  // 'src/pages/Matters.tsx',
  // 'src/pages/Profile.tsx',
];

// Supporting context files (always included)
const CONTEXT_FILES = [
  'src/lib/translations.ts',
  'src/contexts/LanguageContext.tsx',
  'src/data/pricing.ts',
];

function readFileIfExists(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    return `// FILE NOT FOUND: ${relPath}\n`;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

function buildBundle() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const lines = [];

  lines.push('# ezLegal.ai Post-Merge Audit Bundle');
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push('# Use with: scripts/gpt-post-merge-audit-prompt.md');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## IMPORTANT: LEGACY SITE EXCLUSION');
  lines.push('');
  lines.push('DO NOT reference the legacy ezlegal.ai production site at any point during this audit.');
  lines.push('The files below are from the CURRENT PROJECT only.');
  lines.push('The April 28 baseline was used as a recovery source — it is NOT the standard.');
  lines.push('The legacy production site is IRRELEVANT. See the audit prompt for full rules.');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Merged files (primary audit targets)
  lines.push('# SECTION 1: MERGED FILES (Audit These)');
  lines.push('');
  for (const file of MERGED_FILES) {
    lines.push(`## File: ${file}`);
    lines.push('');
    lines.push('```tsx');
    lines.push(readFileIfExists(file));
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Context files (for reference only)
  lines.push('# SECTION 2: CONTEXT FILES (Reference Only — Do Not Audit)');
  lines.push('');
  lines.push('These files provide type definitions and architectural context.');
  lines.push('They are NOT audit targets. Do NOT suggest changes to these files.');
  lines.push('');
  for (const file of CONTEXT_FILES) {
    const content = readFileIfExists(file);
    // Truncate large files to first/last 100 lines for context
    const fileLines = content.split('\n');
    let output = content;
    if (fileLines.length > 250) {
      const head = fileLines.slice(0, 100).join('\n');
      const tail = fileLines.slice(-50).join('\n');
      output = `${head}\n\n// ... [${fileLines.length - 150} lines omitted for brevity] ...\n\n${tail}`;
    }
    lines.push(`## Context: ${file}`);
    lines.push('');
    lines.push('```tsx');
    lines.push(output);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Summary
  lines.push('# SECTION 3: AUDIT INSTRUCTIONS');
  lines.push('');
  lines.push('Use the full prompt in `scripts/gpt-post-merge-audit-prompt.md` alongside this bundle.');
  lines.push('');
  lines.push('Key reminders:');
  lines.push('- Audit ONLY Section 1 files');
  lines.push('- DO NOT reference the legacy ezlegal.ai production site');
  lines.push('- Check for banned content (see prompt for full list)');
  lines.push('- Verify bilingual EN/ES parity');
  lines.push('- Confirm type safety and proper Language narrowing');
  lines.push('- Output one JSON block per audited file');
  lines.push('');

  const output = lines.join('\n');
  const outPath = path.join(OUTPUT_DIR, 'merged-audit-bundle.md');
  fs.writeFileSync(outPath, output, 'utf-8');

  console.log(`Audit bundle generated: ${outPath}`);
  console.log(`  Merged files: ${MERGED_FILES.length}`);
  console.log(`  Context files: ${CONTEXT_FILES.length}`);
  console.log(`  Total size: ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Upload scripts/gpt-post-merge-audit-prompt.md to GPT-5.5 Pro');
  console.log('  2. Upload scripts/output/merged-audit-bundle.md');
  console.log('  3. Ask: "Audit these merged files using the provided prompt."');
}

buildBundle();
