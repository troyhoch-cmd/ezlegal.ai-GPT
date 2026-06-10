/**
 * export-restored-pages-audit.cjs
 *
 * Exports the 11 restored pages (post-compliance-pass) into a single markdown
 * bundle for GPT-5.5 Pro front-end + back-end audit.
 *
 * Output: scripts/output/restored-pages-audit-bundle.md
 *
 * Usage: node scripts/export-restored-pages-audit.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'scripts', 'output');

function read(rel) {
  const abs = path.join(ROOT, rel);
  try { return fs.readFileSync(abs, 'utf-8'); } catch { return `[FILE NOT FOUND: ${rel}]`; }
}

function fileSection(filePath) {
  const ext = filePath.endsWith('.tsx') ? 'tsx' : filePath.endsWith('.ts') ? 'typescript' : 'text';
  const content = read(filePath);
  const lines = content.split('\n').length;
  return `## ${filePath} (${lines} lines)\n\n\`\`\`${ext}\n${content}\n\`\`\`\n\n---\n\n`;
}

const RESTORED_PAGES = [
  'src/pages/ChatV2.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Negotiate.tsx',
  'src/pages/Research.tsx',
  'src/pages/IssuePacks.tsx',
  'src/pages/Matters.tsx',
  'src/pages/TrustCenter.tsx',
  'src/pages/ForPartners.tsx',
  'src/pages/PartnerHub.tsx',
];

const SUPPORTING_FILES = [
  'src/lib/text-utils.ts',
  'src/components/cognitive-load/index.ts',
  'src/components/cognitive-load/ContextualCrisisAlert.tsx',
  'src/services/entitlement-service.ts',
  'src/services/chat-service.ts',
  'src/lib/plan-context.ts',
  'src/data/practiceAreas.ts',
  'src/data/jurisdictions.ts',
];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let output = `# ezLegal.ai -- Restored Pages Audit Bundle\n\n`;
output += `**Generated:** ${new Date().toISOString()}\n\n`;
output += `**Purpose:** GPT-5.5 Pro compliance audit of 11 restored pages after content regression fix + compliance pass.\n\n`;
output += `## Audit Checklist\n\n`;
output += `For each page, verify:\n`;
output += `1. **Lang narrowing**: \`const lang = language === 'es' ? 'es' : 'en'\` present (bilingual pages only)\n`;
output += `2. **Softened claims**: No "attorney-reviewed", "reviewed by licensed attorneys", unverified time claims\n`;
output += `3. **Bilingual parity**: EN and ES copy have equivalent meaning and length\n`;
output += `4. **Scope disclaimers**: AI-generated content disclaimers present where applicable\n`;
output += `5. **normalizeForCrisis**: Used in chat pages before crisis detection\n`;
output += `6. **No UPL violations**: No unauthorized practice of law claims\n`;
output += `7. **Security**: No exposed keys, proper auth checks, XSS prevention\n\n`;
output += `---\n\n`;
output += `# Part 1: Restored Pages (11 files)\n\n`;

for (const file of RESTORED_PAGES) {
  output += fileSection(file);
}

output += `# Part 2: Key Supporting Files\n\n`;

for (const file of SUPPORTING_FILES) {
  if (fs.existsSync(path.join(ROOT, file))) {
    output += fileSection(file);
  }
}

const outPath = path.join(OUT_DIR, 'restored-pages-audit-bundle.md');
fs.writeFileSync(outPath, output);

const stats = fs.statSync(outPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
console.log(`Written: ${outPath}`);
console.log(`Size: ${sizeMB} MB (${output.split('\n').length} lines)`);
console.log(`Pages: ${RESTORED_PAGES.length}`);
console.log(`Supporting files: ${SUPPORTING_FILES.length}`);
