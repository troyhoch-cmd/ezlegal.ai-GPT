import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { chromium } from '@playwright/test';
import { resolveAuditConfig } from './resolve-config.mjs';

const config = resolveAuditConfig();
const ROOT = config.ROOT;
const inventory = JSON.parse(readFileSync(resolve(ROOT, config.outputDir, 'route-inventory.json'), 'utf-8'));

const screenshotDir = resolve(ROOT, config.screenshotDir);
mkdirSync(screenshotDir, { recursive: true });

async function collectPageInventory(page) {
  return page.evaluate(() => {
    const getText = (el) => el?.textContent?.trim().slice(0, 200) || '';
    const getAttr = (el, attr) => el?.getAttribute(attr) || '';

    const title = document.title || '';
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const lang = document.documentElement.getAttribute('lang') || '';

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: parseInt(h.tagName[1]),
      text: getText(h).slice(0, 100),
    }));

    const ctaPatterns = /sign.?up|get.?started|start|try|buy|subscribe|contact|demo|free|pricing|book|schedule|learn.?more|join|create|register/i;
    const ctas = [];
    document.querySelectorAll('a, button').forEach(el => {
      const text = getText(el);
      if (ctaPatterns.test(text) && text.length < 80) {
        const rect = el.getBoundingClientRect();
        ctas.push({
          text: text.slice(0, 60),
          tag: el.tagName.toLowerCase(),
          href: el.getAttribute('href') || '',
          isAboveFold: rect.top < window.innerHeight,
          selector: el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}.${Array.from(el.classList).slice(0, 2).join('.')}`,
        });
      }
    });

    const forms = Array.from(document.querySelectorAll('form')).map(form => {
      const inputs = form.querySelectorAll('input:not([type=hidden]), select, textarea');
      return {
        action: form.getAttribute('action') || '',
        method: form.getAttribute('method') || 'get',
        fieldCount: inputs.length,
        fields: Array.from(inputs).slice(0, 15).map(i => ({
          type: i.type || i.tagName.toLowerCase(),
          name: i.name || i.id || '',
          required: i.hasAttribute('required'),
          label: i.getAttribute('aria-label') || document.querySelector(`label[for="${i.id}"]`)?.textContent?.trim().slice(0, 50) || '',
        })),
      };
    });

    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: getText(a).slice(0, 60),
      href: a.getAttribute('href'),
      isExternal: a.getAttribute('href')?.startsWith('http') && !a.getAttribute('href')?.includes(window.location.hostname),
    }));

    const ariaElements = [];
    document.querySelectorAll('[aria-label], [aria-describedby], [role]').forEach(el => {
      ariaElements.push({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role') || '',
        ariaLabel: el.getAttribute('aria-label')?.slice(0, 80) || '',
      });
    });

    const spanishIndicators = ['derechos', 'servicios', 'nosotros', 'preguntas', 'ayuda', 'abogado', 'justicia', 'gratis', 'recursos', 'emergencia', 'privacidad'];
    const bodyText = document.body.textContent.toLowerCase();
    const spanishWords = spanishIndicators.filter(w => bodyText.includes(w));
    const hasSpanishContent = spanishWords.length >= 3;

    const disclaimerPatterns = /not.?legal.?advice|informational.?only|consult.?a.?(lawyer|attorney)|no.?attorney.?client|disclaimer|jurisdiction|privacy/i;
    const disclaimers = [];
    document.querySelectorAll('p, span, small, div').forEach(el => {
      const text = getText(el);
      if (disclaimerPatterns.test(text) && text.length > 10 && text.length < 500) {
        disclaimers.push({ text: text.slice(0, 200), selector: el.tagName.toLowerCase() });
      }
    });

    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src')?.slice(0, 100) || '',
      alt: img.getAttribute('alt') || '',
      hasAlt: img.hasAttribute('alt'),
      loading: img.getAttribute('loading') || '',
    }));

    return {
      title,
      metaDescription: metaDesc,
      lang,
      headings,
      ctas,
      forms,
      links: { total: links.length, external: links.filter(l => l.isExternal).length, internal: links.filter(l => !l.isExternal).length, items: links.slice(0, 50) },
      ariaElements: { total: ariaElements.length, items: ariaElements.slice(0, 30) },
      spanishContent: { hasSpanishContent, indicators: spanishWords },
      disclaimers: disclaimers.slice(0, 10),
      images: { total: images.length, missingAlt: images.filter(i => !i.hasAlt).length, items: images.slice(0, 20) },
    };
  });
}

async function runVisualAudit() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const findings = [];
  const domInventory = [];
  const publicRoutes = inventory.routes.filter(r => !r.requiresAuth && !r.isDynamic);

  for (const route of publicRoutes) {
    console.log(`  Auditing: ${route.path}`);
    const routeData = { route: route.path, icp: route.icp, viewports: {} };

    for (const [vpName, vpSize] of Object.entries(config.viewports)) {
      const context = await browser.newContext({ viewport: vpSize });
      const page = await context.newPage();

      try {
        const response = await page.goto(route.fullUrl, {
          waitUntil: 'networkidle',
          timeout: config.timeout,
        });

        if (!response || response.status() >= 400) {
          findings.push({
            route: route.path,
            viewport: vpName,
            category: 'visual',
            severity: 'critical',
            issue: 'http-error',
            description: `Route returned HTTP ${response?.status() || 'no response'}`,
            evidence: { statusCode: response?.status(), url: route.fullUrl },
          });
          await context.close();
          continue;
        }

        await page.waitForTimeout(500);

        const filename = `${route.path.replace(/\//g, '_').replace(/^_/, '') || 'home'}-${vpName}.png`;
        await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });

        if (vpName === 'desktop') {
          const pageData = await collectPageInventory(page);
          routeData.inventory = pageData;
        }

        routeData.viewports[vpName] = { screenshot: filename, status: response.status() };

        const overflowIssues = await page.evaluate(() => {
          const issues = [];
          if (document.body.scrollWidth > window.innerWidth + 5) {
            issues.push({ description: 'Horizontal overflow on body', scrollWidth: document.body.scrollWidth, viewportWidth: window.innerWidth });
          }
          const overflowing = [];
          document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 5 && rect.width > 0) {
              overflowing.push(`<${el.tagName.toLowerCase()} class="${(el.className?.toString() || '').slice(0, 40)}">`);
            }
          });
          if (overflowing.length > 0) {
            issues.push({ description: `${overflowing.length} elements overflow viewport`, elements: [...new Set(overflowing)].slice(0, 5) });
          }
          return issues;
        });

        for (const issue of overflowIssues) {
          findings.push({
            route: route.path,
            viewport: vpName,
            category: 'visual',
            severity: vpName === 'mobile' ? 'high' : 'medium',
            issue: 'layout-overflow',
            description: issue.description,
            evidence: { screenshot: filename, elements: issue.elements },
          });
        }

        const contrastIssues = await page.evaluate(() => {
          const issues = [];
          const els = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6, li, label, button');
          for (const el of Array.from(els).slice(0, 200)) {
            const style = getComputedStyle(el);
            if (style.color === style.backgroundColor && style.color !== 'rgba(0, 0, 0, 0)') {
              issues.push({ element: `<${el.tagName.toLowerCase()}>`, text: el.textContent?.slice(0, 40) });
            }
          }
          return issues.slice(0, 5);
        });

        for (const issue of contrastIssues) {
          findings.push({
            route: route.path,
            viewport: vpName,
            category: 'visual',
            severity: 'high',
            issue: 'invisible-text',
            description: `Text may be invisible: same fg/bg color on ${issue.element}`,
            evidence: { screenshot: filename, text: issue.text },
          });
        }
      } catch (err) {
        findings.push({
          route: route.path,
          viewport: vpName,
          category: 'visual',
          severity: 'medium',
          issue: 'navigation-error',
          description: err.message.slice(0, 200),
          evidence: { url: route.fullUrl },
        });
      }

      await context.close();
    }

    domInventory.push(routeData);

    if (config.mode === 'live' && config.liveCrawl?.crawlDelay) {
      await new Promise(r => setTimeout(r, config.liveCrawl.crawlDelay));
    }
  }

  await browser.close();
  return { findings, domInventory };
}

console.log('Running Visual & DOM Inventory Audit...');
const { findings, domInventory } = await runVisualAudit();

const output = {
  auditedAt: new Date().toISOString(),
  category: 'visual',
  totalFindings: findings.length,
  bySeverity: {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  },
  findings,
};

const outDir = resolve(ROOT, config.outputDir);
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'visual-audit.json'), JSON.stringify(output, null, 2));
writeFileSync(resolve(outDir, 'page-dom-inventory.json'), JSON.stringify({ auditedAt: new Date().toISOString(), pages: domInventory }, null, 2));

console.log(`Visual Audit Complete: ${findings.length} findings`);
console.log(`  Critical: ${output.bySeverity.critical} | High: ${output.bySeverity.high} | Medium: ${output.bySeverity.medium} | Low: ${output.bySeverity.low}`);
console.log(`  DOM Inventory: ${domInventory.length} pages collected`);
console.log(`  Screenshots: ${screenshotDir}`);
