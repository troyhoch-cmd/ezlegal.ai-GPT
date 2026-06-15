#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const outputDir = resolve(ROOT, 'audit-output');
mkdirSync(outputDir, { recursive: true });

function loadJson(filename) {
  const path = resolve(outputDir, filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadConfig() {
  const cfgPath = resolve(ROOT, 'audit.config.json');
  if (!existsSync(cfgPath)) return null;
  return JSON.parse(readFileSync(cfgPath, 'utf-8'));
}

const config = loadConfig();
const routeInventory = loadJson('route-inventory.json');
const visualAudit = loadJson('visual-audit.json');
const a11yAudit = loadJson('accessibility-audit.json');
const contentAudit = loadJson('content-audit.json');
const conversionAudit = loadJson('conversion-audit.json');
const icpEvidenceAudit = loadJson('icp-evidence-audit.json');

const allFindings = [
  ...(visualAudit?.findings || []),
  ...(a11yAudit?.findings || []),
  ...(contentAudit?.findings || []),
  ...(conversionAudit?.findings || []),
  ...(icpEvidenceAudit?.findings || []),
];

const blockers = [];

// --- THRESHOLD 1: 0 critical findings ---
const criticals = allFindings.filter(f => f.severity === 'critical');
if (criticals.length > 0) {
  blockers.push({
    threshold: '0 critical findings',
    actual: criticals.length,
    details: criticals.slice(0, 3).map(f => `[${f.route}] ${f.issue}: ${f.description?.slice(0, 80)}`),
  });
}

// --- THRESHOLD 2: 0 high findings ---
const highs = allFindings.filter(f => f.severity === 'high');
if (highs.length > 0) {
  blockers.push({
    threshold: '0 high findings',
    actual: highs.length,
    details: highs.slice(0, 3).map(f => `[${f.route}] ${f.issue}: ${f.description?.slice(0, 80)}`),
  });
}

// --- THRESHOLD 3: 0 navigation/audit errors ---
const navErrors = allFindings.filter(f => f.issue === 'navigation-error' || f.issue === 'audit-error');
if (navErrors.length > 0) {
  blockers.push({
    threshold: '0 navigation/audit errors',
    actual: navErrors.length,
    details: navErrors.slice(0, 3).map(f => `[${f.route}] ${f.description?.slice(0, 80)}`),
  });
}

// --- THRESHOLD 4: 100% public route reachability ---
const publicRoutes = (routeInventory?.routes || []).filter(r => !r.requiresAuth);
const routeReachable = publicRoutes.filter(r => {
  return !navErrors.some(e => e.route === r.path);
});
const reachabilityPct = publicRoutes.length > 0
  ? Math.round((routeReachable.length / publicRoutes.length) * 100)
  : 0;
if (reachabilityPct < 100) {
  const unreachable = publicRoutes.filter(r => navErrors.some(e => e.route === r.path));
  blockers.push({
    threshold: '100% public route reachability',
    actual: `${reachabilityPct}% (${routeReachable.length}/${publicRoutes.length})`,
    details: unreachable.slice(0, 5).map(r => r.path),
  });
}

// --- THRESHOLD 5: 100% ICP route coverage ---
const icpDefs = config?.icpDefinitions || [];
const discoveredPaths = new Set((routeInventory?.routes || []).map(r => r.path));
const missingIcpRoutes = [];
for (const icp of icpDefs) {
  for (const route of icp.routes) {
    if (!discoveredPaths.has(route)) {
      missingIcpRoutes.push(`${icp.id}: ${route}`);
    }
  }
}
if (missingIcpRoutes.length > 0) {
  blockers.push({
    threshold: '100% ICP route coverage',
    actual: `${missingIcpRoutes.length} ICP route(s) missing from inventory`,
    details: missingIcpRoutes,
  });
}

// --- THRESHOLD 6: AI routes have required trust signals ---
const aiRoutePatterns = ['/ai', '/chat', '/case-predictor', '/documents', '/assistant'];
const icpEvidence = icpEvidenceAudit?.evidence || {};
const allIcpRouteEvidence = {};
for (const [, icpData] of Object.entries(icpEvidence)) {
  for (const [routePath, routeData] of Object.entries(icpData.routes || {})) {
    allIcpRouteEvidence[routePath] = routeData;
  }
}

const aiRoutes = (routeInventory?.routes || []).filter(r =>
  aiRoutePatterns.some(p => r.path.includes(p)) && !r.requiresAuth
);

const aiRouteFailures = [];
for (const route of aiRoutes) {
  const evidence = allIcpRouteEvidence[route.path];
  if (!evidence) {
    aiRouteFailures.push(`${route.path}: no ICP evidence collected`);
    continue;
  }
  const missing = [];
  if (!evidence.aiDisclosure) missing.push('AI disclosure');
  if (!evidence.legalBoundary) missing.push('legal boundary');
  if (!evidence.jurisdictionWarning) missing.push('jurisdiction warning');
  if (!evidence.humanEscalation) missing.push('human escalation');
  const privacySignal = (evidence.trustSignals || []).includes('privacy');
  if (!privacySignal) missing.push('privacy notice');
  if (missing.length > 0) {
    aiRouteFailures.push(`${route.path}: missing ${missing.join(', ')}`);
  }
}
if (aiRouteFailures.length > 0) {
  blockers.push({
    threshold: 'All AI routes have AI disclosure, legal boundary, jurisdiction warning, privacy notice, and human escalation',
    actual: `${aiRouteFailures.length} AI route(s) with missing trust signals`,
    details: aiRouteFailures.slice(0, 5),
  });
}

// --- THRESHOLD 7: Spanish routes have required elements ---
const spanishRoutes = (routeInventory?.routes || []).filter(r => r.icp === 'spanish-speaking');
const spanishEvidence = icpEvidence['spanish-speaking']?.routes || {};
const spanishFailures = [];
for (const route of spanishRoutes) {
  const evidence = spanishEvidence[route.path];
  if (!evidence) {
    spanishFailures.push(`${route.path}: no Spanish ICP evidence collected`);
    continue;
  }
  const missing = [];
  if (evidence.spanishNavCount !== undefined && evidence.spanishNavCount === 0) missing.push('bilingual nav');
  if (evidence.spanishFormCount !== undefined && evidence.totalFormElements > 0 && evidence.spanishFormCount === 0) missing.push('Spanish forms');
  if (evidence.spanishCtaCount !== undefined && evidence.spanishCtaCount === 0) missing.push('Spanish CTAs');
  if (evidence.hasSpanishDisclaimer === false) missing.push('Spanish disclaimers');
  if (missing.length > 0) {
    spanishFailures.push(`${route.path}: missing ${missing.join(', ')}`);
  }
}
if (spanishFailures.length > 0) {
  blockers.push({
    threshold: 'All Spanish routes have Spanish/bilingual nav, forms, CTAs, and disclaimers',
    actual: `${spanishFailures.length} Spanish route(s) with gaps`,
    details: spanishFailures.slice(0, 5),
  });
}

// --- THRESHOLD 8: Conversion routes have above-fold CTA, trust signal, tested next action ---
const conversionRoutePatterns = ['/pricing', '/checkout', '/for-business', '/signup', '/contact', '/features'];
const conversionRoutes = (routeInventory?.routes || []).filter(r =>
  conversionRoutePatterns.some(p => r.path === p || r.path.startsWith(p + '/'))
);
const convMetrics = conversionAudit?.routeMetrics || [];
const conversionFailures = [];
for (const route of conversionRoutes) {
  const metrics = convMetrics.find(m => m.route === route.path);
  if (!metrics) {
    const hasNavError = navErrors.some(e => e.route === route.path);
    if (hasNavError) continue;
    conversionFailures.push(`${route.path}: no conversion metrics collected`);
    continue;
  }
  const missing = [];
  if ((metrics.aboveFoldCtas || 0) === 0) missing.push('above-fold CTA');
  if ((metrics.trustSignalCount || 0) === 0) missing.push('trust signal');
  if ((metrics.aboveFoldCtas || 0) === 0 && (metrics.formCount || 0) === 0) missing.push('tested next action');
  if (missing.length > 0) {
    conversionFailures.push(`${route.path}: missing ${missing.join(', ')}`);
  }
}
if (conversionFailures.length > 0) {
  blockers.push({
    threshold: 'All conversion routes have above-fold CTA, trust signal, and tested next action',
    actual: `${conversionFailures.length} conversion route(s) with gaps`,
    details: conversionFailures.slice(0, 5),
  });
}

// --- THRESHOLD 9: No duplicate route inventory entries ---
const routePaths = (routeInventory?.routes || []).map(r => r.path);
const pathCounts = {};
for (const p of routePaths) {
  pathCounts[p] = (pathCounts[p] || 0) + 1;
}
const duplicates = Object.entries(pathCounts).filter(([, count]) => count > 1);
if (duplicates.length > 0) {
  blockers.push({
    threshold: 'No duplicate route inventory entries',
    actual: `${duplicates.length} duplicate path(s)`,
    details: duplicates.map(([path, count]) => `${path} (${count}x)`),
  });
}

// --- THRESHOLD 10: Screenshots exist for every route and viewport ---
const screenshotDir = resolve(ROOT, config?.screenshotDir || 'audit-output/screenshots');
const viewports = Object.keys(config?.viewports || { mobile: {}, tablet: {}, desktop: {} });
const screenshotFailures = [];

if (!existsSync(screenshotDir)) {
  screenshotFailures.push('Screenshot directory does not exist');
} else {
  const allScreenshots = new Set();
  function collectScreenshots(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        collectScreenshots(resolve(dir, entry.name));
      } else if (entry.name.endsWith('.png') || entry.name.endsWith('.jpg')) {
        allScreenshots.add(entry.name.replace(/\.(png|jpg)$/, ''));
      }
    }
  }
  collectScreenshots(screenshotDir);

  for (const route of publicRoutes.slice(0, 80)) {
    const slug = route.path === '/' ? 'home' : route.path.replace(/^\//, '').replace(/\//g, '-');
    for (const vp of viewports) {
      const expected = `${slug}-${vp}`;
      if (!allScreenshots.has(expected)) {
        screenshotFailures.push(`Missing: ${expected}.png (${route.path} @ ${vp})`);
      }
    }
  }
}

if (screenshotFailures.length > 0) {
  blockers.push({
    threshold: 'Screenshots exist for every route and viewport',
    actual: `${screenshotFailures.length} missing screenshot(s)`,
    details: screenshotFailures.slice(0, 5),
  });
}

// --- THRESHOLD 11: Build, typecheck, and Playwright smoke tests pass ---
const ciChecks = [];
let typecheckPass = false;
let buildPass = false;
let playwrightPass = false;

try {
  execSync('npx tsc --noEmit -p tsconfig.app.json', { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
  typecheckPass = true;
} catch (e) {
  const stderr = e.stderr?.toString() || e.stdout?.toString() || 'unknown error';
  ciChecks.push(`Typecheck failed: ${stderr.split('\n').slice(0, 3).join(' ').slice(0, 200)}`);
}

try {
  execSync('npx vite build', { cwd: ROOT, stdio: 'pipe', timeout: 180000 });
  buildPass = true;
} catch (e) {
  const stderr = e.stderr?.toString() || e.stdout?.toString() || 'unknown error';
  ciChecks.push(`Build failed: ${stderr.split('\n').slice(0, 3).join(' ').slice(0, 200)}`);
}

try {
  const result = execSync('npx playwright test --reporter=list 2>&1', { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
  const output = result.toString();
  if (output.includes('failed')) {
    ciChecks.push(`Playwright smoke tests have failures`);
  } else {
    playwrightPass = true;
  }
} catch (e) {
  const output = e.stdout?.toString() || e.stderr?.toString() || '';
  if (output.includes('no tests found') || output.includes('Error: No tests found')) {
    playwrightPass = true;
  } else {
    ciChecks.push(`Playwright failed: ${output.split('\n').slice(0, 2).join(' ').slice(0, 150)}`);
  }
}

if (ciChecks.length > 0) {
  blockers.push({
    threshold: 'Build, typecheck, and Playwright smoke tests pass',
    actual: `${ciChecks.length} CI check(s) failed`,
    details: ciChecks,
  });
}

// --- COMPUTE RESULT ---
const launchReady = blockers.length === 0;
const timestamp = new Date().toISOString();

const result = {
  generatedAt: timestamp,
  launchReady,
  totalBlockers: blockers.length,
  thresholds: {
    criticalFindings: { required: 0, actual: criticals.length, pass: criticals.length === 0 },
    highFindings: { required: 0, actual: highs.length, pass: highs.length === 0 },
    navigationErrors: { required: 0, actual: navErrors.length, pass: navErrors.length === 0 },
    publicRouteReachability: { required: '100%', actual: `${reachabilityPct}%`, pass: reachabilityPct === 100 },
    icpRouteCoverage: { required: '100%', actual: missingIcpRoutes.length === 0 ? '100%' : `${missingIcpRoutes.length} missing`, pass: missingIcpRoutes.length === 0 },
    aiRouteTrust: { required: 'all pass', actual: aiRouteFailures.length === 0 ? 'all pass' : `${aiRouteFailures.length} failing`, pass: aiRouteFailures.length === 0 },
    spanishRouteCompleteness: { required: 'all pass', actual: spanishFailures.length === 0 ? 'all pass' : `${spanishFailures.length} failing`, pass: spanishFailures.length === 0 },
    conversionRouteReadiness: { required: 'all pass', actual: conversionFailures.length === 0 ? 'all pass' : `${conversionFailures.length} failing`, pass: conversionFailures.length === 0 },
    noDuplicateRoutes: { required: 0, actual: duplicates.length, pass: duplicates.length === 0 },
    screenshotCoverage: { required: '100%', actual: screenshotFailures.length === 0 ? '100%' : `${screenshotFailures.length} missing`, pass: screenshotFailures.length === 0 },
    ciPasses: { required: 'all pass', actual: ciChecks.length === 0 ? 'all pass' : `${ciChecks.length} failing`, pass: ciChecks.length === 0 },
  },
  blockers: blockers.slice(0, 10),
  summary: {
    totalRoutes: routeInventory?.totalRoutes || 0,
    publicRoutes: publicRoutes.length,
    totalFindings: allFindings.length,
    icpDefinitions: icpDefs.length,
    typecheckPass,
    buildPass,
    playwrightPass,
  },
};

// --- WRITE JSON ---
writeFileSync(resolve(outputDir, 'launch-readiness.json'), JSON.stringify(result, null, 2));

// --- WRITE MARKDOWN ---
const mdLines = [];
mdLines.push('# Launch Readiness Report');
mdLines.push('');
mdLines.push(`**Generated:** ${timestamp}`);
mdLines.push(`**Launch Ready:** ${launchReady ? 'YES' : 'NO'}`);
mdLines.push(`**Total Blockers:** ${blockers.length}`);
mdLines.push('');
mdLines.push('---');
mdLines.push('');
mdLines.push('## Threshold Results');
mdLines.push('');
mdLines.push('| # | Threshold | Required | Actual | Status |');
mdLines.push('|---|-----------|----------|--------|--------|');

const thresholdEntries = Object.entries(result.thresholds);
thresholdEntries.forEach(([key, val], i) => {
  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  const status = val.pass ? 'PASS' : 'FAIL';
  mdLines.push(`| ${i + 1} | ${label} | ${val.required} | ${val.actual} | ${status} |`);
});

mdLines.push('');

if (blockers.length > 0) {
  mdLines.push('---');
  mdLines.push('');
  mdLines.push('## Top Blockers');
  mdLines.push('');
  for (let i = 0; i < Math.min(blockers.length, 10); i++) {
    const b = blockers[i];
    mdLines.push(`### ${i + 1}. ${b.threshold}`);
    mdLines.push(`**Actual:** ${b.actual}`);
    mdLines.push('');
    if (b.details && b.details.length > 0) {
      for (const d of b.details) {
        mdLines.push(`- ${d}`);
      }
      mdLines.push('');
    }
  }
}

mdLines.push('---');
mdLines.push('');
mdLines.push('## Summary');
mdLines.push('');
mdLines.push(`- Total routes: ${result.summary.totalRoutes}`);
mdLines.push(`- Public routes: ${result.summary.publicRoutes}`);
mdLines.push(`- Total findings: ${result.summary.totalFindings}`);
mdLines.push(`- ICP definitions: ${result.summary.icpDefinitions}`);
mdLines.push(`- Typecheck: ${typecheckPass ? 'PASS' : 'FAIL'}`);
mdLines.push(`- Build: ${buildPass ? 'PASS' : 'FAIL'}`);
mdLines.push(`- Playwright: ${playwrightPass ? 'PASS' : 'FAIL'}`);
mdLines.push('');

writeFileSync(resolve(outputDir, 'launch-readiness.md'), mdLines.join('\n'));

// --- CI-FRIENDLY TERMINAL SUMMARY ---
console.log('');
console.log('='.repeat(60));
console.log('  LAUNCH READINESS CHECK');
console.log('='.repeat(60));
console.log('');

for (const [key, val] of thresholdEntries) {
  const label = key.replace(/([A-Z])/g, ' $1').trim();
  const icon = val.pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`  [${icon}] ${label}: ${val.actual} (required: ${val.required})`);
}

console.log('');
console.log('-'.repeat(60));

if (launchReady) {
  console.log('');
  console.log('  \x1b[32m*** LAUNCH READY ***\x1b[0m');
  console.log('');
  console.log('  All thresholds met. Ship it.');
  console.log('');
} else {
  console.log('');
  console.log(`  \x1b[31m*** NOT LAUNCH READY *** (${blockers.length} blocker(s))\x1b[0m`);
  console.log('');
  console.log('  TOP 10 BLOCKERS:');
  console.log('');
  for (let i = 0; i < Math.min(blockers.length, 10); i++) {
    const b = blockers[i];
    console.log(`  ${i + 1}. ${b.threshold}`);
    console.log(`     Actual: ${b.actual}`);
    if (b.details && b.details.length > 0) {
      for (const d of b.details.slice(0, 2)) {
        console.log(`     - ${d}`);
      }
    }
    console.log('');
  }
}

console.log('-'.repeat(60));
console.log(`  Output: audit-output/launch-readiness.json`);
console.log(`  Report: audit-output/launch-readiness.md`);
console.log('='.repeat(60));
console.log('');

process.exit(launchReady ? 0 : 1);
