/**
 * GPT 5.5 Pro Audit Export Script
 *
 * Bundles all page source files, route manifest, component inventory,
 * and migration list into a single review-export/ directory for GPT audit.
 *
 * Usage: node scripts/export-for-gpt-review.cjs
 */

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'review-export');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function buildRouteManifest() {
  const appTsx = readFile(path.join(ROOT, 'src/App.tsx'));
  if (!appTsx) return '# Route manifest unavailable\n';

  const routeLines = [];
  const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{<(\w+)/g;
  let match;
  while ((match = routeRegex.exec(appTsx)) !== null) {
    routeLines.push({ path: match[1], component: match[2] });
  }

  const nestedRegex = /<Route\s+path="([^"]+)"\s+element=\{\s*\n?\s*<(\w+)/g;
  while ((match = nestedRegex.exec(appTsx)) !== null) {
    if (!routeLines.find(r => r.path === match[1])) {
      routeLines.push({ path: match[1], component: match[2] });
    }
  }

  let manifest = `# ezLegal.ai Route Manifest (v869 Baseline)\n`;
  manifest += `# Generated: ${new Date().toISOString()}\n`;
  manifest += `# Total routes: ${routeLines.length}\n\n`;
  manifest += `| Path | Component | Type |\n|------|-----------|------|\n`;

  for (const route of routeLines.sort((a, b) => a.path.localeCompare(b.path))) {
    const type = route.path.startsWith('/admin') ? 'Admin'
      : route.path.startsWith('/dashboard') ? 'Dashboard'
      : route.component === 'DeprecatedRouteRedirect' ? 'Redirect'
      : route.component === 'Navigate' ? 'Redirect'
      : 'Public';
    manifest += `| ${route.path} | ${route.component} | ${type} |\n`;
  }

  return manifest;
}

function buildPageInventory() {
  const pages = fg.sync('src/pages/*.tsx', { cwd: ROOT }).sort();
  let inventory = `# Page Component Inventory\n`;
  inventory += `# Total pages: ${pages.length}\n\n`;

  for (const page of pages) {
    const content = readFile(path.join(ROOT, page));
    if (!content) continue;
    const lines = content.split('\n').length;
    const hasSupabase = content.includes('supabase');
    const hasLanguage = content.includes('useLanguage');
    const hasAuth = content.includes('useAuth');
    const name = path.basename(page, '.tsx');
    inventory += `- **${name}** (${lines} lines)`;
    const flags = [];
    if (hasSupabase) flags.push('Supabase');
    if (hasLanguage) flags.push('i18n');
    if (hasAuth) flags.push('Auth');
    if (flags.length) inventory += ` [${flags.join(', ')}]`;
    inventory += `\n`;
  }

  return inventory;
}

function buildComponentInventory() {
  const components = fg.sync('src/components/**/*.tsx', { cwd: ROOT }).sort();
  let inventory = `# Component Inventory\n`;
  inventory += `# Total components: ${components.length}\n\n`;

  for (const comp of components) {
    const content = readFile(path.join(ROOT, comp));
    if (!content) continue;
    const lines = content.split('\n').length;
    inventory += `- ${comp} (${lines} lines)\n`;
  }

  return inventory;
}

function buildMigrationInventory() {
  const migrations = fg.sync('supabase/migrations/*.sql', { cwd: ROOT }).sort();
  let inventory = `# Database Migration Inventory\n`;
  inventory += `# Total migrations: ${migrations.length}\n\n`;

  for (const mig of migrations) {
    const filename = path.basename(mig);
    const name = filename.replace(/^\d+_/, '').replace('.sql', '');
    inventory += `- ${filename}\n`;
  }

  return inventory;
}

function copySourceFiles() {
  const pagesDir = path.join(OUT_DIR, 'pages');
  const componentsDir = path.join(OUT_DIR, 'components');
  const servicesDir = path.join(OUT_DIR, 'services');
  const libDir = path.join(OUT_DIR, 'lib');

  ensureDir(pagesDir);
  ensureDir(componentsDir);
  ensureDir(servicesDir);
  ensureDir(libDir);

  // Copy all pages
  const pages = fg.sync('src/pages/*.tsx', { cwd: ROOT });
  for (const page of pages) {
    const content = readFile(path.join(ROOT, page));
    if (content) {
      fs.writeFileSync(path.join(pagesDir, path.basename(page)), content);
    }
  }

  // Copy key components (top-level only to keep size manageable)
  const topComponents = fg.sync('src/components/*.tsx', { cwd: ROOT });
  for (const comp of topComponents) {
    const content = readFile(path.join(ROOT, comp));
    if (content) {
      fs.writeFileSync(path.join(componentsDir, path.basename(comp)), content);
    }
  }

  // Copy services
  const services = fg.sync('src/services/*.ts', { cwd: ROOT });
  for (const svc of services) {
    const content = readFile(path.join(ROOT, svc));
    if (content) {
      fs.writeFileSync(path.join(servicesDir, path.basename(svc)), content);
    }
  }

  // Copy key lib files
  const libFiles = ['routes.ts', 'supabase.ts', 'translations.ts', 'navigation.ts', 'route-meta.ts'];
  for (const lib of libFiles) {
    const content = readFile(path.join(ROOT, 'src/lib', lib));
    if (content) {
      fs.writeFileSync(path.join(libDir, lib), content);
    }
  }

  // Copy App.tsx
  const appContent = readFile(path.join(ROOT, 'src/App.tsx'));
  if (appContent) {
    fs.writeFileSync(path.join(OUT_DIR, 'App.tsx'), appContent);
  }

  // Copy index.html
  const indexContent = readFile(path.join(ROOT, 'index.html'));
  if (indexContent) {
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexContent);
  }
}

function main() {
  console.log('ezLegal.ai GPT 5.5 Pro Audit Export');
  console.log('====================================\n');

  // Clean and create output directory
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
  }
  ensureDir(OUT_DIR);

  // Generate manifests
  console.log('Generating route manifest...');
  fs.writeFileSync(path.join(OUT_DIR, 'ROUTE_MANIFEST.md'), buildRouteManifest());

  console.log('Generating page inventory...');
  fs.writeFileSync(path.join(OUT_DIR, 'PAGE_INVENTORY.md'), buildPageInventory());

  console.log('Generating component inventory...');
  fs.writeFileSync(path.join(OUT_DIR, 'COMPONENT_INVENTORY.md'), buildComponentInventory());

  console.log('Generating migration inventory...');
  fs.writeFileSync(path.join(OUT_DIR, 'MIGRATION_INVENTORY.md'), buildMigrationInventory());

  // Copy source files
  console.log('Copying source files...');
  copySourceFiles();

  // Generate summary
  const pages = fg.sync('src/pages/*.tsx', { cwd: ROOT });
  const components = fg.sync('src/components/**/*.tsx', { cwd: ROOT });
  const migrations = fg.sync('supabase/migrations/*.sql', { cwd: ROOT });

  const summary = `# GPT 5.5 Pro Audit Export Summary
# Baseline: v869 (restored ${new Date().toISOString().split('T')[0]})
# Project: ezLegal.ai

## Stats
- Pages: ${pages.length}
- Components: ${components.length}
- Services: ${fg.sync('src/services/*.ts', { cwd: ROOT }).length}
- Migrations: ${migrations.length}
- Edge Functions: ${fg.sync('supabase/functions/*/index.ts', { cwd: ROOT }).length}

## Key Architecture
- Framework: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- Router: React Router v7
- Icons: Lucide React
- Hosting: Netlify (SPA with _redirects)
- i18n: Custom bilingual EN/ES via LanguageContext

## Audit Mode
Append ?demo=audit to any URL to bypass auth gates for full crawlability.

## Files in This Export
- ROUTE_MANIFEST.md - All routes with component mappings
- PAGE_INVENTORY.md - All page files with feature flags
- COMPONENT_INVENTORY.md - All components with line counts
- MIGRATION_INVENTORY.md - All database migrations
- AUDIT_PROMPT.md - Instructions for GPT 5.5 Pro audit
- App.tsx - Main router configuration
- index.html - Entry HTML
- pages/ - All page source files
- components/ - Top-level component source files
- services/ - Service layer source files
- lib/ - Key utility files
`;

  fs.writeFileSync(path.join(OUT_DIR, 'SUMMARY.md'), summary);

  console.log(`\nExport complete! Output: ${OUT_DIR}`);
  console.log(`Total files exported: ${fg.sync('**/*', { cwd: OUT_DIR }).length}`);
}

main();
