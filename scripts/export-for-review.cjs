/**
 * export-for-review.cjs
 *
 * Generates a single Markdown file containing:
 * - Full route map with descriptions
 * - Every page component's source code
 * - Key shared components (navigation, layout, auth, analytics)
 * - Configuration (tailwind, env shape, supabase setup)
 *
 * Usage: node scripts/export-for-review.cjs > site-review.md
 * Then upload site-review.md to GPT-5.5 Pro for full analysis.
 */

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return `[File not found: ${filePath}]`;
  }
}

function relPath(absPath) {
  return path.relative(ROOT, absPath);
}

// Gather files by category
const pages = fg.sync('src/pages/**/*.{tsx,ts}', { cwd: ROOT }).sort();
const coreComponents = [
  'src/components/Navigation.tsx',
  'src/components/Layout.tsx',
  'src/components/Footer.tsx',
  'src/components/MobileBottomNav.tsx',
  'src/components/MobileDrawer.tsx',
  'src/components/HomeKPIStrip.tsx',
  'src/components/HomeAudienceRouting.tsx',
  'src/components/PersonaSelector.tsx',
  'src/components/CrisisStrip.tsx',
  'src/components/ConsentBanner.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/UserMenu.tsx',
  'src/components/PricingChooser.tsx',
  'src/components/EthicalConversionPanel.tsx',
  'src/components/InFlowTrustStrip.tsx',
  'src/components/VerifiableTrustStrip.tsx',
  'src/components/GuidedIssueLauncher.tsx',
  'src/components/AnswerModeSelector.tsx',
  'src/components/JurisdictionSelector.tsx',
  'src/components/shared/LegalDisclaimer.tsx',
  'src/components/shared/CrisisResourceCard.tsx',
  'src/components/shared/JurisdictionSelector.tsx',
  'src/components/cognitive-load/TabbedResponse.tsx',
  'src/components/cognitive-load/UnifiedTrustStrip.tsx',
  'src/components/cognitive-load/MoreHelpDrawer.tsx',
  'src/components/cognitive-load/ContextualCrisisAlert.tsx',
];
const configFiles = [
  'src/App.tsx',
  'src/lib/routes.ts',
  'src/lib/supabase.ts',
  'src/contexts/AuthContext.tsx',
  'src/contexts/LanguageContext.tsx',
  'src/contexts/PersonaContext.tsx',
  'src/services/analytics-service.ts',
  'src/services/chat-service.ts',
  'src/lib/legal-disclosures.ts',
  'src/lib/microcopy.ts',
  'src/lib/translations.ts',
  'src/data/pricing.ts',
  'tailwind.config.js',
  'index.html',
];

const output = [];

output.push('# ezLegal.ai - Full Prototype Source Export for GTM Review');
output.push('');
output.push('Generated: ' + new Date().toISOString());
output.push('');
output.push('## Instructions for Reviewer');
output.push('');
output.push('This file contains the complete source code of every page and key component in the ezLegal.ai prototype.');
output.push('Use this to analyze: conversion flows, UX quality, Spanish completeness, ethical compliance,');
output.push('disclaimers, accessibility patterns, cognitive load, trust signals, and GTM readiness.');
output.push('');
output.push('---');
output.push('');

// Route map
output.push('## Route Map');
output.push('');
const routesFile = path.join(ROOT, 'src/lib/routes.ts');
if (fs.existsSync(routesFile)) {
  output.push('```typescript');
  output.push(readFile(routesFile));
  output.push('```');
} else {
  output.push('(routes.ts not found - see App.tsx for route definitions)');
}
output.push('');
output.push('---');
output.push('');

// App.tsx (main router)
output.push('## App Router (src/App.tsx)');
output.push('');
output.push('```tsx');
output.push(readFile(path.join(ROOT, 'src/App.tsx')));
output.push('```');
output.push('');
output.push('---');
output.push('');

// Pages
output.push('## Pages');
output.push('');
for (const p of pages) {
  const abs = path.join(ROOT, p);
  output.push(`### ${relPath(abs)}`);
  output.push('');
  output.push('```tsx');
  output.push(readFile(abs));
  output.push('```');
  output.push('');
  output.push('---');
  output.push('');
}

// Core components
output.push('## Core Components');
output.push('');
for (const c of coreComponents) {
  const abs = path.join(ROOT, c);
  if (fs.existsSync(abs)) {
    output.push(`### ${c}`);
    output.push('');
    output.push('```tsx');
    output.push(readFile(abs));
    output.push('```');
    output.push('');
    output.push('---');
    output.push('');
  }
}

// Config/infra files
output.push('## Configuration & Infrastructure');
output.push('');
for (const c of configFiles) {
  const abs = path.join(ROOT, c);
  if (fs.existsSync(abs)) {
    const ext = path.extname(c).replace('.', '') || 'text';
    output.push(`### ${c}`);
    output.push('');
    output.push(`\`\`\`${ext === 'tsx' ? 'tsx' : ext === 'ts' ? 'typescript' : ext}`);
    output.push(readFile(abs));
    output.push('```');
    output.push('');
    output.push('---');
    output.push('');
  }
}

// CSS
output.push('## Global Styles (src/index.css - first 200 lines)');
output.push('');
output.push('```css');
const css = readFile(path.join(ROOT, 'src/index.css'));
output.push(css.split('\n').slice(0, 200).join('\n'));
output.push('```');
output.push('');

const result = output.join('\n');
process.stdout.write(result);

// Also write to file for convenience
const outFile = path.join(ROOT, 'site-review.md');
fs.writeFileSync(outFile, result);
process.stderr.write(`\nExported ${pages.length} pages + ${coreComponents.length} components + ${configFiles.length} config files\n`);
process.stderr.write(`Output: ${outFile} (${(result.length / 1024).toFixed(0)} KB)\n`);
