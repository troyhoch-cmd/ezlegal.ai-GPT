#!/usr/bin/env node
/**
 * ezLegal.ai GPT Audit Export Script
 * Bundles route manifest, inventories, source files, migrations,
 * Supabase functions, and an audit prompt into review-export/.
 *
 * Usage:
 *   npm i -D fast-glob
 *   npm run export:gpt-review
 */

const fs = require('fs');
const path = require('path');

let fg;
try {
  fg = require('fast-glob');
} catch {
  console.error('Missing dependency: fast-glob');
  console.error('Run: npm i -D fast-glob');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'review-export');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function writeOut(relativePath, content) {
  const target = path.join(OUT_DIR, relativePath);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content, 'utf8');
}

function glob(patterns) {
  return fg.sync(patterns, {
    cwd: ROOT,
    onlyFiles: true,
    unique: true,
    dot: false,
  }).sort();
}

function countLines(content) {
  return content ? content.split(/\r?\n/).length : 0;
}

function routeType(routePath, component) {
  if (routePath.startsWith('/admin')) return 'Admin';
  if (routePath.startsWith('/dashboard')) return 'Dashboard';
  if (component === 'DeprecatedRouteRedirect' || component === 'Navigate') return 'Redirect';
  return 'Public';
}

function buildRouteManifest() {
  const appTsx = readFile(path.join(ROOT, 'src/App.tsx'));
  if (!appTsx) return '# Route manifest unavailable\n\nsrc/App.tsx was not found.\n';

  const routes = [];
  const seen = new Set();
  const routeTags = appTsx.match(/<Route\b[\s\S]*?(?:\/>|>)/g) || [];

  for (const tag of routeTags) {
    const pathMatch = tag.match(/\bpath=(["'`])([^"'`]+)\1/);
    const compMatch = tag.match(/\belement=\{\s*<([A-Za-z0-9_]+)/);

    if (!pathMatch || !compMatch) continue;

    const routePath = pathMatch[2];
    const component = compMatch[1];
    const key = `${routePath}::${component}`;

    if (!seen.has(key)) {
      seen.add(key);
      routes.push({ path: routePath, component });
    }
  }

  let manifest = `# ezLegal.ai Route Manifest\n`;
  manifest += `Generated: ${new Date().toISOString()}\n`;
  manifest += `Total literal routes found: ${routes.length}\n\n`;
  manifest += `> Note: This regex-based manifest captures literal <Route path="..."> declarations in src/App.tsx. Dynamic route constants may require manual review.\n\n`;
  manifest += `| Path | Component | Type |\n|---|---|---|\n`;

  for (const route of routes.sort((a, b) => a.path.localeCompare(b.path))) {
    manifest += `| ${route.path} | ${route.component} | ${routeType(route.path, route.component)} |\n`;
  }

  return manifest;
}

function buildPageInventory() {
  const pages = glob(['src/pages/**/*.{tsx,ts}']);
  let inventory = `# Page Component Inventory\n`;
  inventory += `Generated: ${new Date().toISOString()}\n`;
  inventory += `Total pages: ${pages.length}\n\n`;

  for (const page of pages) {
    const content = readFile(path.join(ROOT, page));
    if (!content) continue;

    const flags = [];
    if (content.includes('supabase')) flags.push('Supabase');
    if (content.includes('useLanguage') || content.includes('LanguageContext')) flags.push('i18n');
    if (content.includes('useAuth') || content.includes('AuthContext')) flags.push('Auth');
    if (content.includes('useNavigate') || content.includes('Link')) flags.push('Router');
    if (content.includes('form') || content.includes('Form')) flags.push('Form');

    inventory += `- ${page} (${countLines(content)} lines)`;
    if (flags.length) inventory += ` [${flags.join(', ')}]`;
    inventory += `\n`;
  }

  return inventory;
}

function buildComponentInventory() {
  const components = glob(['src/components/**/*.{tsx,ts}']);
  let inventory = `# Component Inventory\n`;
  inventory += `Generated: ${new Date().toISOString()}\n`;
  inventory += `Total components: ${components.length}\n\n`;

  for (const comp of components) {
    const content = readFile(path.join(ROOT, comp));
    if (!content) continue;
    inventory += `- ${comp} (${countLines(content)} lines)\n`;
  }

  return inventory;
}

function buildMigrationInventory() {
  const migrations = glob(['supabase/migrations/*.sql']);
  let inventory = `# Database Migration Inventory\n`;
  inventory += `Generated: ${new Date().toISOString()}\n`;
  inventory += `Total migrations: ${migrations.length}\n\n`;

  for (const mig of migrations) {
    inventory += `- ${path.basename(mig)}\n`;
  }

  return inventory;
}

function buildAuditPrompt() {
  return `# GPT Legaltech Audit Prompt — ezLegal.ai

Audit the exported ezLegal.ai source for three ICPs:
1. Spanish-speaking individuals who cannot afford a lawyer
2. SMBs
3. Pro bono and legal service organizations

For each ICP, evaluate:
- Product quality and whether it is best-in-class
- Cognitive overload and plain-language usability
- Conversion optimization and completion flow
- Ethical AI, legal-information-not-advice guardrails, privacy, and A2J alignment
- Partnership and revenue model potential

Evidence rules:
- Base claims only on exported source files, manifests, migrations, and cited external standards.
- Mark missing or ambiguous evidence as [blocked] or [evidence unavailable].
- Distinguish fact from inference.
- Do not infer AI vendor practices, training data, data retention, or legal accuracy unless the export proves them.
- Treat Spanish parity, accessibility, save/resume, progress indicators, content provenance, and human escalation as required review points.

Output:
- Executive summary
- Route-level findings
- Component-level findings
- ICP matrix
- Highest-risk legal/ethical gaps
- Redesign backlog with acceptance criteria
`;
}

function copyMatched(patterns, outSubdir, stripPrefix = '') {
  const files = glob(patterns);

  for (const rel of files) {
    const source = path.join(ROOT, rel);
    const suffix = stripPrefix && rel.startsWith(stripPrefix)
      ? rel.slice(stripPrefix.length)
      : rel;
    const target = path.join(OUT_DIR, outSubdir, suffix);

    ensureDir(path.dirname(target));
    fs.copyFileSync(source, target);
  }

  return files.length;
}

function copySourceFiles() {
  const counts = {};

  counts.pages = copyMatched(['src/pages/**/*.{tsx,ts}'], 'pages', 'src/pages/');
  counts.components = copyMatched(['src/components/**/*.{tsx,ts}'], 'components', 'src/components/');
  counts.services = copyMatched(['src/services/**/*.{tsx,ts}'], 'services', 'src/services/');
  counts.lib = copyMatched(['src/lib/**/*.{tsx,ts}'], 'lib', 'src/lib/');
  counts.contexts = copyMatched(['src/contexts/**/*.{tsx,ts}'], 'contexts', 'src/contexts/');
  counts.hooks = copyMatched(['src/hooks/**/*.{tsx,ts}'], 'hooks', 'src/hooks/');
  counts.migrations = copyMatched(['supabase/migrations/*.sql'], 'supabase/migrations', 'supabase/migrations/');
  counts.functions = copyMatched(['supabase/functions/**/index.ts'], 'supabase/functions', 'supabase/functions/');

  const rootFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'src/index.css',
    'index.html',
    'package.json',
    'vite.config.ts',
    'vite.config.js',
    'tailwind.config.ts',
    'tailwind.config.js',
    'tsconfig.json',
    'netlify.toml',
    'public/_redirects',
  ];

  counts.rootFiles = 0;

  for (const rel of rootFiles) {
    const source = path.join(ROOT, rel);
    if (!fs.existsSync(source)) continue;

    const target = path.join(OUT_DIR, 'root', rel);
    ensureDir(path.dirname(target));
    fs.copyFileSync(source, target);
    counts.rootFiles += 1;
  }

  return counts;
}

function buildSummary(copyCounts) {
  const pages = glob(['src/pages/**/*.{tsx,ts}']);
  const components = glob(['src/components/**/*.{tsx,ts}']);
  const services = glob(['src/services/**/*.{tsx,ts}']);
  const lib = glob(['src/lib/**/*.{tsx,ts}']);
  const migrations = glob(['supabase/migrations/*.sql']);
  const edgeFunctions = glob(['supabase/functions/**/index.ts']);

  return `# GPT Audit Export Summary

Generated: ${new Date().toISOString()}
Project: ezLegal.ai

## Stats

- Pages: ${pages.length}
- Components: ${components.length}
- Services: ${services.length}
- Lib files: ${lib.length}
- Migrations: ${migrations.length}
- Edge Functions: ${edgeFunctions.length}

## Copied

- Pages: ${copyCounts.pages}
- Components: ${copyCounts.components}
- Services: ${copyCounts.services}
- Lib: ${copyCounts.lib}
- Contexts: ${copyCounts.contexts}
- Hooks: ${copyCounts.hooks}
- Migrations: ${copyCounts.migrations}
- Edge Functions: ${copyCounts.functions}
- Root/config files: ${copyCounts.rootFiles}

## Architecture From Provided Baseline

- Framework: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Supabase
- Router: React Router
- i18n: Custom bilingual EN/ES via LanguageContext
- Audit mode: append ?demo=audit to bypass auth gates if implemented in source

## Files

- ROUTE_MANIFEST.md
- PAGE_INVENTORY.md
- COMPONENT_INVENTORY.md
- MIGRATION_INVENTORY.md
- AUDIT_PROMPT.md
- pages/
- components/
- services/
- lib/
- contexts/
- hooks/
- supabase/
- root/
`;
}

function main() {
  console.log('ezLegal.ai GPT Audit Export');
  console.log('===========================\n');

  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }

  ensureDir(OUT_DIR);

  console.log('Generating manifests...');
  writeOut('ROUTE_MANIFEST.md', buildRouteManifest());
  writeOut('PAGE_INVENTORY.md', buildPageInventory());
  writeOut('COMPONENT_INVENTORY.md', buildComponentInventory());
  writeOut('MIGRATION_INVENTORY.md', buildMigrationInventory());
  writeOut('AUDIT_PROMPT.md', buildAuditPrompt());

  console.log('Copying source files...');
  const copyCounts = copySourceFiles();

  console.log('Generating summary...');
  writeOut('SUMMARY.md', buildSummary(copyCounts));

  const totalFiles = glob(['review-export/**/*']).length;
  console.log(`\nExport complete: ${OUT_DIR}`);
  console.log(`Total files exported: ${totalFiles}`);
}

main();
