const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_FILE = path.join(ROOT, 'src', 'App.tsx');
const REPORT_DIR = path.join(ROOT, 'reports', 'conformance');
const RESULT_FILE = path.join(REPORT_DIR, 'validation-results.json');

function addCheck(checks, name, passed, details) {
  checks.push({ name, passed: Boolean(passed), details });
}

function validate() {
  const checks = [];

  addCheck(checks, 'Route definition exists', fs.existsSync(APP_FILE),
    path.relative(ROOT, APP_FILE));

  if (!fs.existsSync(APP_FILE)) {
    return finish(checks, 0);
  }

  const source = fs.readFileSync(APP_FILE, 'utf8');
  const routePaths = [...source.matchAll(/<Route\s[^>]*?path=["']([^"']+)["']/gs)]
    .map((match) => match[1]);
  const absoluteRoutes = routePaths.filter((route) => route.startsWith('/'));
  const duplicates = [...new Set(absoluteRoutes.filter(
    (route, index) => absoluteRoutes.indexOf(route) !== index,
  ))];

  addCheck(checks, 'Routes were discovered', routePaths.length > 0,
    `${routePaths.length} route paths found in src/App.tsx`);
  addCheck(checks, 'Absolute route paths are unique', duplicates.length === 0,
    duplicates.length ? `Duplicates: ${duplicates.join(', ')}` : `${absoluteRoutes.length} unique absolute routes`);
  addCheck(checks, 'Catch-all route is configured', routePaths.includes('*'),
    routePaths.includes('*') ? 'A fallback route is present' : 'No path="*" route was found');

  const requiredRoutes = ['/privacy', '/terms', '/accessibility', '/emergency-resources'];
  const missingRequiredRoutes = requiredRoutes.filter((route) => !absoluteRoutes.includes(route));
  addCheck(checks, 'Required trust and safety routes are configured', missingRequiredRoutes.length === 0,
    missingRequiredRoutes.length ? `Missing: ${missingRequiredRoutes.join(', ')}` : requiredRoutes.join(', '));

  const lazyImports = [...source.matchAll(
    /const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\);/g,
  )].map(([, component, importPath]) => ({ component, importPath }));
  const missingImports = lazyImports.filter(({ importPath }) => {
    const resolved = path.resolve(path.dirname(APP_FILE), importPath);
    return !['.tsx', '.ts', '.jsx', '.js'].some((extension) => fs.existsSync(resolved + extension));
  });
  addCheck(checks, 'Lazy-loaded route modules resolve', missingImports.length === 0,
    missingImports.length
      ? `Missing: ${missingImports.map(({ component, importPath }) => `${component} (${importPath})`).join(', ')}`
      : `${lazyImports.length} lazy imports resolved`);

  return finish(checks, routePaths.length);
}

function finish(checks, routeCount) {
  const failures = checks.filter((check) => !check.passed);
  return {
    generatedAt: new Date().toISOString(),
    passed: failures.length === 0,
    routeCount,
    checks,
    failureCount: failures.length,
  };
}

function writeResults(results) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(RESULT_FILE, `${JSON.stringify(results, null, 2)}\n`);
}

module.exports = { REPORT_DIR, RESULT_FILE, validate, writeResults };
