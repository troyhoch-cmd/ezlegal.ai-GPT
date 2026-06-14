import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const config = JSON.parse(readFileSync(resolve(ROOT, 'audit.config.json'), 'utf-8'));
const inventory = JSON.parse(readFileSync(resolve(ROOT, config.outputDir, 'route-inventory.json'), 'utf-8'));

async function runAccessibilityAudit() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const findings = [];
  const publicRoutes = inventory.routes.filter(r => !r.requiresAuth && !r.isDynamic);

  for (const route of publicRoutes) {
    console.log(`  a11y: ${route.path}`);
    const context = await browser.newContext({ viewport: config.viewports.desktop });
    const page = await context.newPage();

    try {
      await page.goto(route.fullUrl, { waitUntil: 'networkidle', timeout: config.timeout });
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      for (const violation of results.violations) {
        const severity = mapImpactToSeverity(violation.impact);
        for (const node of violation.nodes.slice(0, 5)) {
          findings.push({
            route: route.path,
            category: 'accessibility',
            severity,
            issue: violation.id,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            selector: node.target.join(' > '),
            html: node.html.slice(0, 200),
            wcagTags: violation.tags.filter(t => t.startsWith('wcag')),
          });
        }
      }

      const headingIssues = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const issues = [];
        const h1s = headings.filter(h => h.tagName === 'H1');
        if (h1s.length > 1) {
          issues.push({ type: 'multiple-h1', count: h1s.length });
        }
        if (h1s.length === 0 && headings.length > 0) {
          issues.push({ type: 'missing-h1' });
        }
        for (let i = 1; i < headings.length; i++) {
          const prev = parseInt(headings[i - 1].tagName[1]);
          const curr = parseInt(headings[i].tagName[1]);
          if (curr > prev + 1) {
            issues.push({
              type: 'skipped-level',
              from: `h${prev}`,
              to: `h${curr}`,
              text: headings[i].textContent.slice(0, 50),
            });
          }
        }
        return issues;
      });

      for (const issue of headingIssues) {
        findings.push({
          route: route.path,
          category: 'accessibility',
          severity: issue.type === 'missing-h1' ? 'medium' : 'high',
          issue: `heading-${issue.type}`,
          description: issue.type === 'multiple-h1'
            ? `Page has ${issue.count} h1 elements`
            : issue.type === 'missing-h1'
              ? 'Page has headings but no h1'
              : `Heading jumps from ${issue.from} to ${issue.to}: "${issue.text}"`,
        });
      }

      const focusIssues = await page.evaluate(() => {
        const interactive = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
        const issues = [];
        for (const el of Array.from(interactive).slice(0, 100)) {
          const tabindex = el.getAttribute('tabindex');
          if (tabindex && parseInt(tabindex) > 0) {
            issues.push(`Positive tabindex (${tabindex}) on <${el.tagName.toLowerCase()}>`);
          }
        }
        return [...new Set(issues)].slice(0, 5);
      });

      for (const issue of focusIssues) {
        findings.push({
          route: route.path,
          category: 'accessibility',
          severity: 'medium',
          issue: 'positive-tabindex',
          description: issue,
        });
      }
    } catch (err) {
      findings.push({
        route: route.path,
        category: 'accessibility',
        severity: 'medium',
        issue: 'audit-error',
        description: err.message.slice(0, 200),
      });
    }

    await context.close();
  }

  await browser.close();
  return findings;
}

function mapImpactToSeverity(impact) {
  switch (impact) {
    case 'critical': return 'critical';
    case 'serious': return 'high';
    case 'moderate': return 'medium';
    default: return 'low';
  }
}

console.log('Running Accessibility Audit...');
const findings = await runAccessibilityAudit();

const output = {
  auditedAt: new Date().toISOString(),
  category: 'accessibility',
  totalFindings: findings.length,
  bySeverity: {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  },
  byIssueType: Object.entries(
    findings.reduce((acc, f) => { acc[f.issue] = (acc[f.issue] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]),
  findings,
};

const outputPath = resolve(ROOT, config.outputDir, 'accessibility-audit.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Accessibility Audit Complete: ${findings.length} findings`);
console.log(`  Critical: ${output.bySeverity.critical} | High: ${output.bySeverity.high} | Medium: ${output.bySeverity.medium} | Low: ${output.bySeverity.low}`);
