#!/usr/bin/env node
/**
 * ezLegal.ai Static Prerender Script
 *
 * Generates static HTML for every route so that:
 * 1. Netlify serves proper HTML without SPA routing issues
 * 2. AI crawlers (GPT, Claude, etc.) can read page content without JS execution
 *
 * Usage:
 *   npm run build          # build the SPA first
 *   npm run prerender      # then generate static HTML for all routes
 *
 * The result is a dist/ folder where each route has its own index.html
 * with fully rendered content. Upload this entire dist/ to Netlify.
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { createServer } = require('vite');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/pricing',
  '/checkout',
  '/contact',
  '/features',
  '/about',
  '/ezreads',
  '/pro-bono',
  '/emergency-resources',
  '/for-organizations',
  '/for-business',
  '/for-individuals',
  '/for-partners',
  '/share-perspective',
  '/scope-disclaimers',
  '/schedule-demo',
  '/lso-dashboard',
  '/grant-reporting',
  '/ai-governance',
  '/ai-model-card',
  '/algorithmic-impact-assessment',
  '/bias-monitoring',
  '/terms',
  '/privacy',
  '/privacy-at-a-glance',
  '/privacy-faq',
  '/security-faq',
  '/trust-center',
  '/enterprise-security',
  '/how-it-works',
  '/partner-hub',
  '/media-kit',
  '/how-reports-are-reviewed',
  '/espanol',
  '/es',
  '/business',
  '/partners',
  '/urgent-help',
  '/accessibility',
  '/access',
  '/negotiate',
  '/site-review',
  '/sla',
  '/find-attorney',
  '/ask',
  '/issue-packs',
  '/case-predictor',
  '/case-predictor/start',
  '/chat',
  '/help/which-feature',
  '/safety-net',
  '/toolkit',
  '/icp-prototype',
  '/start',
  '/welcome',
  '/dashboard',
  '/dashboard/action-plan',
  '/dashboard/ai-assistant',
  '/dashboard/cases',
  '/dashboard/matters',
  '/dashboard/clients',
  '/dashboard/history',
  '/dashboard/documents',
  '/dashboard/icp-templates',
  '/dashboard/research',
  '/dashboard/lawyer-profiles',
  '/dashboard/profile',
  '/dashboard/website-integration',
  '/dashboard/billing',
  '/admin',
  '/admin/users',
  '/admin/content',
  '/admin/chat',
  '/admin/partners',
  '/admin/system',
  '/admin/audit-log',
  '/admin/collateral',
];

async function prerender() {
  console.log(`\n  Prerendering ${ROUTES.length} routes...\n`);

  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('  ERROR: dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }

  const { preview } = require('vite');
  const server = await preview({
    preview: { port: 4177, strictPort: true },
    build: { outDir: 'dist' },
  });

  const baseUrl = `http://localhost:4177`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    try {
      const page = await context.newPage();
      const url = `${baseUrl}${route}?demo=audit`;

      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);

      let html = await page.content();

      // Remove demo query param from any self-referencing links
      html = html.replace(/\?demo=audit/g, '');

      // Determine output path
      const routePath = route === '/' ? '/index.html' : `${route}/index.html`;
      const outputFile = path.join(DIST_DIR, routePath);
      const outputDir = path.dirname(outputFile);

      fs.mkdirSync(outputDir, { recursive: true });

      // Don't overwrite the root index.html if route is /
      if (route === '/') {
        // Save prerendered version alongside the SPA shell
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf8');
      } else {
        fs.writeFileSync(outputFile, html, 'utf8');
      }

      success++;
      process.stdout.write(`  [${success + failed}/${ROUTES.length}] ${route}\n`);

      await page.close();
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${route} - ${err.message}`);
    }
  }

  await browser.close();
  server.httpServer.close();

  console.log(`\n  Done! ${success} pages prerendered, ${failed} failed.`);
  console.log(`  Output: ${DIST_DIR}/\n`);

  if (failed > 0) process.exit(1);
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
