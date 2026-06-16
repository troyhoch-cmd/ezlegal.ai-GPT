/**
 * Generates a multi-page PDF of all forward-facing pages.
 * Uses Playwright for screenshots + jspdf for PDF assembly.
 * Designed to be crash-resistant: each page is independent,
 * failures are logged but don't stop the run.
 */
import { chromium } from 'playwright';
import { jsPDF } from 'jspdf';
import { mkdirSync, writeFileSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUT_DIR = resolve('audit-output');
const SCREENSHOTS_DIR = resolve(OUT_DIR, 'page-screenshots');
const PDF_PATH = resolve(OUT_DIR, 'ezlegal-all-pages.pdf');

const PUBLIC_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/accessibility', label: 'Accessibility Statement' },
  { path: '/ai-governance', label: 'AI Governance' },
  { path: '/ai-model-card', label: 'AI Model Card' },
  { path: '/algorithmic-impact-assessment', label: 'Algorithmic Impact Assessment' },
  { path: '/ask', label: 'Ask' },
  { path: '/bias-monitoring', label: 'Bias Monitoring' },
  { path: '/case-predictor', label: 'Case Predictor' },
  { path: '/chat', label: 'Chat' },
  { path: '/contact', label: 'Contact' },
  { path: '/emergency-resources', label: 'Emergency Resources' },
  { path: '/enterprise-security', label: 'Enterprise Security' },
  { path: '/espanol', label: 'Espanol Landing' },
  { path: '/ezreads', label: 'EZReads' },
  { path: '/features', label: 'Features' },
  { path: '/find-attorney', label: 'Find Attorney' },
  { path: '/for-business', label: 'For Business' },
  { path: '/for-individuals', label: 'For Individuals' },
  { path: '/for-organizations', label: 'For Organizations' },
  { path: '/for-partners', label: 'For Partners' },
  { path: '/forgot-password', label: 'Forgot Password' },
  { path: '/grant-reporting', label: 'Grant Reporting' },
  { path: '/help/which-feature', label: 'Feature Guide' },
  { path: '/how-it-works', label: 'How It Works' },
  { path: '/how-reports-are-reviewed', label: 'How Reports Are Reviewed' },
  { path: '/icp-prototype', label: 'ICP Prototype' },
  { path: '/issue-packs', label: 'Issue Packs' },
  { path: '/login', label: 'Login' },
  { path: '/media-kit', label: 'Media Kit' },
  { path: '/negotiate', label: 'Negotiate' },
  { path: '/partner-hub', label: 'Partner Hub' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/privacy-at-a-glance', label: 'Privacy At A Glance' },
  { path: '/privacy-faq', label: 'Privacy FAQ' },
  { path: '/pro-bono', label: 'Pro Bono Intake' },
  { path: '/safety-net', label: 'Legal Safety Net' },
  { path: '/schedule-demo', label: 'Schedule Demo' },
  { path: '/scope-disclaimers', label: 'Scope Disclaimers' },
  { path: '/security-faq', label: 'Security FAQ' },
  { path: '/share-perspective', label: 'Share Perspective' },
  { path: '/signup', label: 'Signup' },
  { path: '/site-review', label: 'Site Review' },
  { path: '/sla', label: 'SLA' },
  { path: '/start', label: 'Persona Intake' },
  { path: '/terms', label: 'Terms of Service' },
  { path: '/toolkit', label: 'Toolkit' },
  { path: '/trust-center', label: 'Trust Center' },
  { path: '/welcome', label: 'Channel Landing' },
];

const DASHBOARD_ROUTES = [
  { path: '/dashboard', label: 'Dashboard Home' },
  { path: '/dashboard/action-plan', label: 'Action Plan' },
  { path: '/dashboard/cases', label: 'Cases' },
  { path: '/dashboard/matters', label: 'Matters' },
  { path: '/dashboard/history', label: 'History' },
  { path: '/dashboard/documents', label: 'Documents' },
  { path: '/dashboard/research', label: 'Research' },
  { path: '/dashboard/profile', label: 'Profile' },
  { path: '/dashboard/billing', label: 'Billing' },
];

const ALL_ROUTES = [...PUBLIC_ROUTES, ...DASHBOARD_ROUTES];

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function capturePages() {
  const browser = await chromium.launch({
    headless: true,
    channel: undefined,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    javaScriptEnabled: true,
  });

  const results = [];
  let index = 0;

  for (const route of ALL_ROUTES) {
    index++;
    const page = await context.newPage();
    const filename = `${String(index).padStart(3, '0')}_${route.path.replace(/\//g, '_').replace(/^_/, '') || 'home'}.png`;
    const filepath = join(SCREENSHOTS_DIR, filename);

    try {
      console.log(`[${index}/${ALL_ROUTES.length}] Capturing: ${route.label} (${route.path})`);

      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 20000,
      });

      // Wait for React to hydrate and render
      await page.waitForTimeout(2000);
      await page.waitForSelector('body *', { timeout: 5000 }).catch(() => {});

      await page.screenshot({
        path: filepath,
        fullPage: true,
        timeout: 10000,
      });

      results.push({ route: route.path, label: route.label, file: filename, status: 'ok' });
    } catch (err) {
      console.warn(`  FAILED: ${err.message}`);
      results.push({ route: route.path, label: route.label, file: null, status: 'error', error: err.message });
    } finally {
      await page.close().catch(() => {});
    }
  }

  await browser.close();
  return results;
}

async function assemblePdf(results) {
  const successfulCaptures = results.filter(r => r.status === 'ok' && r.file);

  if (successfulCaptures.length === 0) {
    console.error('No screenshots captured successfully. Cannot generate PDF.');
    process.exit(1);
  }

  console.log(`\nAssembling PDF from ${successfulCaptures.length} screenshots...`);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1440, 900] });
  let firstPage = true;

  for (const capture of successfulCaptures) {
    const imgPath = join(SCREENSHOTS_DIR, capture.file);
    const imgData = readFileSync(imgPath);
    const base64 = imgData.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    if (!firstPage) {
      doc.addPage([1440, 900], 'landscape');
    }
    firstPage = false;

    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 1440, 30, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`${capture.label}  |  ${capture.route}`, 10, 20);

    try {
      doc.addImage(dataUri, 'PNG', 0, 30, 1440, 870);
    } catch (e) {
      doc.setFontSize(16);
      doc.setTextColor(200, 50, 50);
      doc.text(`[Image too large for PDF embed - see screenshot file: ${capture.file}]`, 100, 450);
    }
  }

  const pdfBuffer = doc.output('arraybuffer');
  writeFileSync(PDF_PATH, Buffer.from(pdfBuffer));
  console.log(`\nPDF saved to: ${PDF_PATH}`);
  console.log(`Total pages: ${successfulCaptures.length}`);
  console.log(`Failed captures: ${results.filter(r => r.status === 'error').length}`);

  const manifest = results.map(r => `[${r.status === 'ok' ? 'OK' : 'FAIL'}] ${r.label} (${r.route})${r.error ? ' - ' + r.error : ''}`).join('\n');
  writeFileSync(resolve(OUT_DIR, 'capture-manifest.txt'), manifest);
}

async function main() {
  console.log('=== ezLegal.ai Full-Site PDF Generator ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Routes to capture: ${ALL_ROUTES.length}`);
  console.log('');

  const results = await capturePages();
  await assemblePdf(results);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
