import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const config = JSON.parse(readFileSync(resolve(ROOT, 'audit.config.json'), 'utf-8'));
const inventory = JSON.parse(readFileSync(resolve(ROOT, config.outputDir, 'route-inventory.json'), 'utf-8'));

const LEGAL_JARGON = [
  'pursuant to', 'hereinafter', 'aforementioned', 'heretofore', 'notwithstanding',
  'wherefore', 'hereunder', 'therein', 'hereof', 'thereof', 'whereby',
  'inter alia', 'ipso facto', 'prima facie', 'pro rata', 'bona fide',
  'force majeure', 'habeas corpus', 'modus operandi', 'quid pro quo',
  'vis-a-vis', 'de jure', 'de facto', 'ad hoc', 'ex parte',
  'indemnify', 'indemnification', 'liquidated damages', 'consequential damages',
  'severability', 'waiver', 'estoppel', 'tort', 'tortious',
];

const SPANISH_INDICATORS = [
  'derechos', 'servicios', 'nosotros', 'preguntas', 'ayuda',
  'contrato', 'abogado', 'justicia', 'gratis', 'comunidad',
  'recursos', 'emergencia', 'privacidad', 'seguridad',
];

function calculateFleschKincaid(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const grade = 0.39 * (words.length / sentences.length)
    + 11.8 * (syllables / words.length) - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function findLongSentences(text, maxLength) {
  return text.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length > maxLength)
    .map(s => ({ text: s.slice(0, 100), wordCount: s.split(/\s+/).length }));
}

function detectJargon(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const term of LEGAL_JARGON) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      const context = text.slice(Math.max(0, idx - 30), idx + term.length + 30);
      found.push({ term, context: context.trim() });
    }
  }
  return found;
}

function detectSpanish(text) {
  const lower = text.toLowerCase();
  const found = SPANISH_INDICATORS.filter(word => lower.includes(word));
  return found;
}

async function runContentAudit() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const findings = [];
  const routeMetrics = [];
  const publicRoutes = inventory.routes.filter(r => !r.requiresAuth && !r.isDynamic);

  for (const route of publicRoutes) {
    console.log(`  content: ${route.path}`);
    const context = await browser.newContext({ viewport: config.viewports.desktop });
    const page = await context.newPage();

    try {
      await page.goto(route.fullUrl, { waitUntil: 'networkidle', timeout: config.timeout });
      await page.waitForTimeout(300);

      const pageText = await page.evaluate(() => {
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, svg').forEach(el => el.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim();
      });

      const grade = calculateFleschKincaid(pageText);
      const longSentences = findLongSentences(pageText, config.contentThresholds.maxSentenceLength);
      const jargon = detectJargon(pageText);
      const spanishWords = detectSpanish(pageText);
      const wordCount = pageText.split(/\s+/).length;

      routeMetrics.push({
        route: route.path,
        icp: route.icp,
        wordCount,
        fleschKincaidGrade: grade,
        jargonCount: jargon.length,
        longSentenceCount: longSentences.length,
        spanishWordCount: spanishWords.length,
        hasSpanishContent: spanishWords.length >= 3,
      });

      if (grade > config.contentThresholds.maxFleschKincaidGrade) {
        findings.push({
          route: route.path,
          category: 'content',
          severity: grade > 12 ? 'high' : 'medium',
          issue: 'high-reading-level',
          description: `Reading level grade ${grade} exceeds threshold of ${config.contentThresholds.maxFleschKincaidGrade}`,
          metric: grade,
        });
      }

      for (const item of jargon) {
        findings.push({
          route: route.path,
          category: 'content',
          severity: 'medium',
          issue: 'legal-jargon',
          description: `Legal jargon "${item.term}" found: "...${item.context}..."`,
          term: item.term,
        });
      }

      if (longSentences.length > 3) {
        findings.push({
          route: route.path,
          category: 'content',
          severity: 'medium',
          issue: 'complex-sentences',
          description: `${longSentences.length} sentences exceed ${config.contentThresholds.maxSentenceLength} words`,
          examples: longSentences.slice(0, 3),
        });
      }

      if (route.icp === 'spanish-speaking' && spanishWords.length < 3) {
        findings.push({
          route: route.path,
          category: 'content',
          severity: 'high',
          issue: 'missing-spanish-content',
          description: `Spanish-targeted route has insufficient Spanish content (${spanishWords.length} indicators found)`,
        });
      }
    } catch (err) {
      findings.push({
        route: route.path,
        category: 'content',
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

console.log('Running Content Audit...');
const { findings, routeMetrics } = await runContentAudit();

const avgGrade = routeMetrics.length
  ? Math.round((routeMetrics.reduce((s, r) => s + r.fleschKincaidGrade, 0) / routeMetrics.length) * 10) / 10
  : 0;

const output = {
  auditedAt: new Date().toISOString(),
  category: 'content',
  totalFindings: findings.length,
  summary: {
    averageReadingGrade: avgGrade,
    routesAboveThreshold: routeMetrics.filter(r => r.fleschKincaidGrade > config.contentThresholds.maxFleschKincaidGrade).length,
    totalJargonInstances: findings.filter(f => f.issue === 'legal-jargon').length,
    spanishContentRoutes: routeMetrics.filter(r => r.hasSpanishContent).length,
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

const outputPath = resolve(ROOT, config.outputDir, 'content-audit.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Content Audit Complete: ${findings.length} findings`);
console.log(`  Avg reading grade: ${avgGrade}`);
console.log(`  Jargon instances: ${output.summary.totalJargonInstances}`);
console.log(`  Spanish content routes: ${output.summary.spanishContentRoutes}`);
