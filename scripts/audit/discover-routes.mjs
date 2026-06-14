import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const config = JSON.parse(readFileSync(resolve(ROOT, 'audit.config.json'), 'utf-8'));

function discoverRoutes() {
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
  const filtered = routes.filter(r => !excluded.has(r));

  const categorized = filtered.map(route => {
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

  return {
    discoveredAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    totalRoutes: categorized.length,
    routes: categorized,
    byIcp: config.icpDefinitions.map(icp => ({
      id: icp.id,
      label: icp.label,
      routes: categorized.filter(r => r.icp === icp.id).map(r => r.path),
    })),
  };
}

const outputDir = resolve(ROOT, config.outputDir);
mkdirSync(outputDir, { recursive: true });

const inventory = discoverRoutes();
const outputPath = resolve(outputDir, 'route-inventory.json');
writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

console.log(`Route Discovery Complete`);
console.log(`  Total routes: ${inventory.totalRoutes}`);
console.log(`  Auth-required: ${inventory.routes.filter(r => r.requiresAuth).length}`);
console.log(`  Dynamic: ${inventory.routes.filter(r => r.isDynamic).length}`);
inventory.byIcp.forEach(g => console.log(`  ICP "${g.label}": ${g.routes.length} routes`));
console.log(`  Output: ${outputPath}`);
