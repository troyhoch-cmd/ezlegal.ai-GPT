import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const config = JSON.parse(readFileSync(resolve(ROOT, 'audit.config.json'), 'utf-8'));
const inventory = JSON.parse(readFileSync(resolve(ROOT, config.outputDir, 'route-inventory.json'), 'utf-8'));

async function runConversionAudit() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const findings = [];
  const routeMetrics = [];
  const publicRoutes = inventory.routes.filter(r => !r.requiresAuth && !r.isDynamic);

  for (const route of publicRoutes) {
    console.log(`  conversion: ${route.path}`);
    const context = await browser.newContext({ viewport: config.viewports.desktop });
    const page = await context.newPage();

    try {
      await page.goto(route.fullUrl, { waitUntil: 'networkidle', timeout: config.timeout });
      await page.waitForTimeout(300);

      const ctaData = await page.evaluate(() => {
        const ctas = [];
        const buttons = document.querySelectorAll('a, button');
        const ctaPatterns = /sign.?up|get.?started|start|try|buy|subscribe|contact|demo|free|pricing|book|schedule/i;

        for (const btn of buttons) {
          const text = btn.textContent.trim();
          if (ctaPatterns.test(text) && text.length < 50) {
            const rect = btn.getBoundingClientRect();
            ctas.push({
              text: text.slice(0, 60),
              tag: btn.tagName.toLowerCase(),
              href: btn.getAttribute('href') || '',
              isAboveFold: rect.top < window.innerHeight,
              rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            });
          }
        }
        return ctas;
      });

      const formData = await page.evaluate((maxFields) => {
        const forms = document.querySelectorAll('form');
        const results = [];
        for (const form of forms) {
          const inputs = form.querySelectorAll('input:not([type=hidden]), select, textarea');
          results.push({
            fieldCount: inputs.length,
            exceedsMax: inputs.length > maxFields,
            fields: Array.from(inputs).map(i => ({
              type: i.type || i.tagName.toLowerCase(),
              name: i.name || i.id || '',
              required: i.hasAttribute('required'),
            })),
          });
        }
        return results;
      }, config.conversionThresholds.maxFormFields);

      const trustSignals = await page.evaluate(() => {
        const signals = [];
        const text = document.body.textContent.toLowerCase();
        if (/secure|encrypted|ssl|https/i.test(text)) signals.push('security-mention');
        if (/guarantee|money.?back/i.test(text)) signals.push('guarantee');
        if (/testimonial|review|star/i.test(text)) signals.push('social-proof');
        if (/free.?trial|no.?credit.?card/i.test(text)) signals.push('low-risk-offer');
        if (/bar.?association|certified|licensed/i.test(text)) signals.push('authority');
        if (document.querySelector('[aria-label*="trust"], [class*="trust"], [class*="badge"]')) signals.push('trust-badge');
        return signals;
      });

      const ethicalAI = await page.evaluate(() => {
        const text = document.body.textContent.toLowerCase();
        const signals = [];
        if (/not.?a.?lawyer|not.?legal.?advice|informational.?only/i.test(text)) signals.push('ai-disclosure');
        if (/consult.?a.?(lawyer|attorney)|seek.?legal.?counsel/i.test(text)) signals.push('escalation-path');
        if (/jurisdiction|state.?specific|varies.?by/i.test(text)) signals.push('jurisdiction-warning');
        if (/human.?review|attorney.?review|lawyer.?reviewed/i.test(text)) signals.push('human-oversight');
        return signals;
      });

      const aboveFoldCtas = ctaData.filter(c => c.isAboveFold);
      const metrics = {
        route: route.path,
        icp: route.icp,
        totalCtas: ctaData.length,
        aboveFoldCtas: aboveFoldCtas.length,
        formCount: formData.length,
        maxFormFields: Math.max(0, ...formData.map(f => f.fieldCount)),
        trustSignalCount: trustSignals.length,
        trustSignals,
        ethicalAISignals: ethicalAI,
        ethicalAIScore: ethicalAI.length,
      };
      routeMetrics.push(metrics);

      if (aboveFoldCtas.length === 0 && !route.path.includes('terms') && !route.path.includes('privacy')) {
        findings.push({
          route: route.path,
          category: 'conversion',
          severity: 'high',
          issue: 'no-above-fold-cta',
          description: 'No call-to-action visible above the fold',
        });
      }

      if (aboveFoldCtas.length > config.conversionThresholds.maxCtaPerViewport) {
        findings.push({
          route: route.path,
          category: 'conversion',
          severity: 'medium',
          issue: 'cta-overload',
          description: `${aboveFoldCtas.length} CTAs above fold may cause decision paralysis`,
        });
      }

      for (const form of formData) {
        if (form.exceedsMax) {
          findings.push({
            route: route.path,
            category: 'conversion',
            severity: 'high',
            issue: 'form-burden',
            description: `Form has ${form.fieldCount} fields (max: ${config.conversionThresholds.maxFormFields})`,
            fields: form.fields.map(f => f.name || f.type),
          });
        }
      }

      if (trustSignals.length === 0 && ['/pricing', '/checkout', '/signup'].some(p => route.path.includes(p))) {
        findings.push({
          route: route.path,
          category: 'conversion',
          severity: 'high',
          issue: 'missing-trust-signals',
          description: 'Conversion-critical page lacks trust signals (security, guarantees, social proof)',
        });
      }

      const isAIPage = ['/chatbot', '/chat', '/ask', '/case-predictor', '/negotiate'].some(p => route.path.startsWith(p));
      if (isAIPage && ethicalAI.length === 0) {
        findings.push({
          route: route.path,
          category: 'ethical-ai',
          severity: 'critical',
          issue: 'missing-ai-disclosure',
          description: 'AI-powered page missing disclosure that output is not legal advice',
        });
      }

      if (isAIPage && !ethicalAI.includes('escalation-path')) {
        findings.push({
          route: route.path,
          category: 'ethical-ai',
          severity: 'high',
          issue: 'missing-escalation-path',
          description: 'AI-powered page does not suggest consulting a real attorney',
        });
      }
    } catch (err) {
      findings.push({
        route: route.path,
        category: 'conversion',
        severity: 'low',
        issue: 'audit-error',
        description: err.message.slice(0, 200),
      });
    }

    await context.close();
  }

  await browser.close();
  return { findings, routeMetrics };
}

console.log('Running Conversion & Ethical AI Audit...');
const { findings, routeMetrics } = await runConversionAudit();

const output = {
  auditedAt: new Date().toISOString(),
  category: 'conversion',
  totalFindings: findings.length,
  summary: {
    avgTrustSignals: routeMetrics.length
      ? Math.round((routeMetrics.reduce((s, r) => s + r.trustSignalCount, 0) / routeMetrics.length) * 10) / 10
      : 0,
    routesWithoutCta: routeMetrics.filter(r => r.aboveFoldCtas === 0).length,
    avgEthicalAIScore: routeMetrics.length
      ? Math.round((routeMetrics.reduce((s, r) => s + r.ethicalAIScore, 0) / routeMetrics.length) * 10) / 10
      : 0,
  },
  bySeverity: {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  },
  routeMetrics,
  findings,
};

const outputPath = resolve(ROOT, config.outputDir, 'conversion-audit.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Conversion Audit Complete: ${findings.length} findings`);
console.log(`  Critical: ${output.bySeverity.critical} | High: ${output.bySeverity.high} | Medium: ${output.bySeverity.medium} | Low: ${output.bySeverity.low}`);
