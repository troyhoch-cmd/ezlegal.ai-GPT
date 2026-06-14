import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolveAuditConfig } from './resolve-config.mjs';

const config = resolveAuditConfig();
const ROOT = config.ROOT;

function discoverRoutesFromSource() {
  const routeFile = resolve(ROOT, config.routeSource);
  const content = readFileSync(routeFile, 'utf-8');

  const routes = [];
  const routeRegex = /:\s*'([^']+)'/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const path = match[1];
    if (path.startsWith('/')) {
      routes.push(path);
    }
  }

  const excluded = new Set(config.excludeRoutes || []);
  return routes.filter(r => !excluded.has(r));
}

async function discoverRoutesFromLiveCrawl() {
  const { chromium } = await import('@playwright/test');
  const crawlConfig = config.liveCrawl || {};
  const maxDepth = crawlConfig.maxDepth || 3;
  const maxPages = crawlConfig.maxPages || 100;
  const crawlDelay = crawlConfig.crawlDelay || 500;
  const respectRobots = crawlConfig.respectRobotsTxt !== false;
  const userAgent = crawlConfig.userAgent || 'ezLegalAuditBot/2.0';

  const baseOrigin = new URL(config.baseUrl).origin;
  const disallowed = new Set();

  if (respectRobots) {
    try {
      const resp = await fetch(`${baseOrigin}/robots.txt`, {
        headers: { 'User-Agent': userAgent },
      });
      if (resp.ok) {
        const text = await resp.text();
        let relevantAgent = false;
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.toLowerCase().startsWith('user-agent:')) {
            const agent = trimmed.slice(11).trim().toLowerCase();
            relevantAgent = agent === '*' || userAgent.toLowerCase().includes(agent);
          } else if (relevantAgent && trimmed.toLowerCase().startsWith('disallow:')) {
            const path = trimmed.slice(9).trim();
            if (path) disallowed.add(path);
          }
        }
        console.log(`  robots.txt: ${disallowed.size} disallowed paths`);
      }
    } catch (e) {
      console.log(`  robots.txt: not available (${e.message})`);
    }
  }

  const discovered = new Set(['/']);
  const visited = new Set();
  const queue = [{ path: '/', depth: 0 }];
  const excluded = new Set(config.excludeRoutes || []);

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });

  while (queue.length > 0 && visited.size < maxPages) {
    const { path, depth } = queue.shift();
    if (visited.has(path)) continue;
    if (depth > maxDepth) continue;
    if (excluded.has(path)) continue;

    const isDisallowed = [...disallowed].some(d => {
      if (d.endsWith('*')) return path.startsWith(d.slice(0, -1));
      return path === d || path.startsWith(d);
    });
    if (isDisallowed) {
      console.log(`  skipped (robots.txt): ${path}`);
      continue;
    }

    visited.add(path);
    console.log(`  crawl [depth=${depth}]: ${path}`);

    const context = await browser.newContext({
      viewport: config.viewports.desktop,
      userAgent,
    });
    const page = await context.newPage();

    try {
      const response = await page.goto(`${config.baseUrl}${path}`, {
        waitUntil: 'networkidle',
        timeout: config.timeout,
      });

      if (response && response.ok()) {
        const links = await page.evaluate((origin) => {
          return Array.from(document.querySelectorAll('a[href]'))
            .map(a => {
              try {
                const url = new URL(a.href, window.location.origin);
                if (url.origin === origin) return url.pathname;
              } catch {}
              return null;
            })
            .filter(Boolean);
        }, baseOrigin);

        for (const link of links) {
          const normalized = link.replace(/\/$/, '') || '/';
          if (!discovered.has(normalized) && !normalized.includes('#')) {
            discovered.add(normalized);
            queue.push({ path: normalized, depth: depth + 1 });
          }
        }
      }
    } catch (err) {
      console.log(`  error: ${path} - ${err.message.slice(0, 80)}`);
    }

    await context.close();

    if (crawlDelay > 0) {
      await new Promise(r => setTimeout(r, crawlDelay));
    }
  }

  await browser.close();
  return [...visited].sort();
}

function categorizeRoutes(routes) {
  return routes.map(route => {
    const icpMatch = config.icpDefinitions.find(icp =>
      icp.routes.some(icpRoute => route === icpRoute || route.startsWith(icpRoute + '/'))
    );

    return {
      path: route,
      fullUrl: `${config.baseUrl}${route}`,
      icp: icpMatch ? icpMatch.id : 'general',
      requiresAuth: route.startsWith('/dashboard') || route.startsWith('/admin'),
      isDynamic: route.includes(':') || route.includes('*'),
    };
  });
}

console.log(`Route Discovery (mode: ${config.mode})...`);

let rawRoutes;
if (config.mode === 'live') {
  rawRoutes = await discoverRoutesFromLiveCrawl();
} else {
  rawRoutes = discoverRoutesFromSource();
}

// Deduplicate routes by normalized pathname
const seen = new Set();
const deduped = [];
for (const route of rawRoutes) {
  const normalized = route.replace(/\/+$/, '') || '/';
  if (!seen.has(normalized)) {
    seen.add(normalized);
    deduped.push(normalized);
  }
}
console.log(`  Deduplication: ${rawRoutes.length} raw -> ${deduped.length} unique`);

const categorized = categorizeRoutes(deduped);

const inventory = {
  discoveredAt: new Date().toISOString(),
  mode: config.mode,
  baseUrl: config.baseUrl,
  totalRoutes: categorized.length,
  routes: categorized,
  byIcp: config.icpDefinitions.map(icp => ({
    id: icp.id,
    label: icp.label,
    routes: categorized.filter(r => r.icp === icp.id).map(r => r.path),
  })),
};

const outputDir = resolve(ROOT, config.outputDir);
mkdirSync(outputDir, { recursive: true });

const outputPath = resolve(outputDir, 'route-inventory.json');
writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

console.log(`Route Discovery Complete`);
console.log(`  Mode: ${config.mode}`);
console.log(`  Base URL: ${config.baseUrl}`);
console.log(`  Total routes: ${inventory.totalRoutes}`);
console.log(`  Auth-required: ${inventory.routes.filter(r => r.requiresAuth).length}`);
console.log(`  Dynamic: ${inventory.routes.filter(r => r.isDynamic).length}`);
inventory.byIcp.forEach(g => console.log(`  ICP "${g.label}": ${g.routes.length} routes`));
console.log(`  Output: ${outputPath}`);
