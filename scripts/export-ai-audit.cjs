#!/usr/bin/env node
/**
 * ezLegal.ai AI Audit Export
 *
 * Generates a comprehensive text export of ALL page source code,
 * routes, components, and content that can be uploaded directly
 * to GPT 5.5 PRO, Claude, or any AI tool for a full site audit.
 *
 * This bypasses ALL crawling/blocking issues because the AI
 * reads the source directly - no network access needed.
 *
 * Usage:
 *   npm run export:ai-audit
 *
 * Output:
 *   ai-audit-export/  (folder with chunked files for upload)
 *
 * Upload Strategy for GPT 5.5 PRO:
 *   - Upload all files in ai-audit-export/ as attachments
 *   - Or use the single combined file: ai-audit-export/FULL_SITE_AUDIT.txt
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
const OUT_DIR = path.join(ROOT, 'ai-audit-export');

// Clean output
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
  } catch { return null; }
}

function glob(patterns) {
  return fg.sync(patterns, { cwd: ROOT, onlyFiles: true, dot: false }).sort();
}

// --- Collect all source ---

const sections = [];

// 1. Route Manifest
sections.push({
  title: 'ROUTE MANIFEST',
  content: readFile('src/lib/routes.ts'),
});

// 2. App.tsx (all route definitions)
sections.push({
  title: 'APP ROUTER (src/App.tsx)',
  content: readFile('src/App.tsx'),
});

// 3. All page components
const pages = glob(['src/pages/**/*.tsx']);
const pageChunks = [];
let currentChunk = '';
let chunkIndex = 1;

for (const p of pages) {
  const content = readFile(p);
  if (!content) continue;
  const entry = `\n${'='.repeat(80)}\nFILE: ${p}\n${'='.repeat(80)}\n${content}\n`;

  if ((currentChunk + entry).length > 400000) {
    pageChunks.push({ index: chunkIndex, content: currentChunk });
    currentChunk = entry;
    chunkIndex++;
  } else {
    currentChunk += entry;
  }
}
if (currentChunk) {
  pageChunks.push({ index: chunkIndex, content: currentChunk });
}

// 4. All components
const components = glob(['src/components/**/*.tsx']);
const componentChunks = [];
currentChunk = '';
chunkIndex = 1;

for (const c of components) {
  const content = readFile(c);
  if (!content) continue;
  const entry = `\n${'='.repeat(80)}\nFILE: ${c}\n${'='.repeat(80)}\n${content}\n`;

  if ((currentChunk + entry).length > 400000) {
    componentChunks.push({ index: chunkIndex, content: currentChunk });
    currentChunk = entry;
    chunkIndex++;
  } else {
    currentChunk += entry;
  }
}
if (currentChunk) {
  componentChunks.push({ index: chunkIndex, content: currentChunk });
}

// 5. Lib/services/hooks
const lib = glob(['src/lib/**/*.ts', 'src/services/**/*.ts', 'src/hooks/**/*.ts', 'src/contexts/**/*.tsx', 'src/data/**/*.ts']);
const libChunks = [];
currentChunk = '';
chunkIndex = 1;

for (const l of lib) {
  const content = readFile(l);
  if (!content) continue;
  const entry = `\n${'='.repeat(80)}\nFILE: ${l}\n${'='.repeat(80)}\n${content}\n`;

  if ((currentChunk + entry).length > 400000) {
    libChunks.push({ index: chunkIndex, content: currentChunk });
    currentChunk = entry;
    chunkIndex++;
  } else {
    currentChunk += entry;
  }
}
if (currentChunk) {
  libChunks.push({ index: chunkIndex, content: currentChunk });
}

// 6. Config files
const configs = [
  'package.json', 'vite.config.ts', 'tailwind.config.js',
  'tsconfig.json', 'tsconfig.app.json', 'index.html',
  'netlify.toml', 'public/_redirects',
].map(f => ({ path: f, content: readFile(f) })).filter(f => f.content);

// 7. Supabase migrations (just filenames for overview)
const migrations = glob(['supabase/migrations/*.sql']);

// 8. Edge functions
const edgeFunctions = glob(['supabase/functions/*/index.ts']);
const edgeFnContent = edgeFunctions.map(f => ({
  path: f,
  content: readFile(f),
})).filter(f => f.content);

// --- Write output files ---

// Audit instructions
const instructions = `# ezLegal.ai - Complete Site Audit Export
# Generated: ${new Date().toISOString()}
#
# This export contains the COMPLETE source code for all ${pages.length} pages,
# ${components.length} components, and ${lib.length} library/service files.
#
# HOW TO USE WITH GPT 5.5 PRO:
# 1. Upload these files as attachments to your GPT conversation
# 2. Ask GPT to audit specific aspects (UI/UX, accessibility, SEO, security, etc.)
# 3. No crawling needed - all content is in these files
#
# FILE STRUCTURE:
# - 00_INSTRUCTIONS.txt        (this file)
# - 01_ROUTES_AND_CONFIG.txt   (route manifest + config)
# - 02_PAGES_*.txt             (all page components, chunked)
# - 03_COMPONENTS_*.txt        (all UI components, chunked)
# - 04_LIB_SERVICES_*.txt      (libs, hooks, services, chunked)
# - 05_SUPABASE.txt            (migrations list + edge functions)
#
# TOTAL FILES: ${pages.length + components.length + lib.length}
# TOTAL ROUTES: ~80 defined routes
#
# AUDIT PROMPT SUGGESTIONS:
# - "Audit all pages for cognitive overload patterns"
# - "Review all components for accessibility (WCAG 2.1 AA)"
# - "Analyze conversion funnel from Home to Signup/Checkout"
# - "Check all forms for validation and error handling"
# - "Review SEO: meta tags, heading hierarchy, semantic HTML"
# - "Security review: XSS vectors, input sanitization, auth flows"
# - "Performance: bundle size, lazy loading, render optimization"
`;

fs.writeFileSync(path.join(OUT_DIR, '00_INSTRUCTIONS.txt'), instructions);

// Routes and config
let routesConfig = '';
routesConfig += `${'='.repeat(80)}\nROUTE MANIFEST\n${'='.repeat(80)}\n${sections[0].content}\n\n`;
routesConfig += `${'='.repeat(80)}\nAPP ROUTER\n${'='.repeat(80)}\n${sections[1].content}\n\n`;
for (const c of configs) {
  routesConfig += `${'='.repeat(80)}\nCONFIG: ${c.path}\n${'='.repeat(80)}\n${c.content}\n\n`;
}
fs.writeFileSync(path.join(OUT_DIR, '01_ROUTES_AND_CONFIG.txt'), routesConfig);

// Pages
for (const chunk of pageChunks) {
  const suffix = pageChunks.length > 1 ? `_part${chunk.index}` : '';
  fs.writeFileSync(path.join(OUT_DIR, `02_PAGES${suffix}.txt`), chunk.content);
}

// Components
for (const chunk of componentChunks) {
  const suffix = componentChunks.length > 1 ? `_part${chunk.index}` : '';
  fs.writeFileSync(path.join(OUT_DIR, `03_COMPONENTS${suffix}.txt`), chunk.content);
}

// Lib/services
for (const chunk of libChunks) {
  const suffix = libChunks.length > 1 ? `_part${chunk.index}` : '';
  fs.writeFileSync(path.join(OUT_DIR, `04_LIB_SERVICES${suffix}.txt`), chunk.content);
}

// Supabase
let supabaseContent = `${'='.repeat(80)}\nSUPABASE MIGRATIONS (${migrations.length} total)\n${'='.repeat(80)}\n`;
supabaseContent += migrations.map(m => `  ${path.basename(m)}`).join('\n');
supabaseContent += '\n\n';
for (const fn of edgeFnContent) {
  supabaseContent += `${'='.repeat(80)}\nEDGE FUNCTION: ${fn.path}\n${'='.repeat(80)}\n${fn.content}\n\n`;
}
fs.writeFileSync(path.join(OUT_DIR, '05_SUPABASE.txt'), supabaseContent);

// Summary
const files = fs.readdirSync(OUT_DIR);
const totalSize = files.reduce((sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size, 0);

console.log(`
  AI Audit Export Complete
  ========================
  Output:     ${OUT_DIR}/
  Files:      ${files.length}
  Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB
  Pages:      ${pages.length}
  Components: ${components.length}
  Lib/Hooks:  ${lib.length}
  Edge Fns:   ${edgeFunctions.length}
  Migrations: ${migrations.length}

  NEXT STEPS:
  1. Upload all files from ai-audit-export/ to GPT 5.5 PRO
  2. Use the audit prompts from 00_INSTRUCTIONS.txt
  3. No crawling or URL access needed - AI reads source directly
`);
