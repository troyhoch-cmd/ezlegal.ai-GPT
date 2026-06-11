/**
 * Static security check: scan committed source files for leaked secrets.
 * Runs as part of `npm run qa:security`.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('fast-glob');

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', pattern: /(?:aws_secret_access_key|secret_key)\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/gi },
  { name: 'Generic API Key (long hex)', pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-f0-9]{32,}['"]/gi },
  { name: 'Private Key Block', pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g },
  { name: 'Supabase Service Role Key', pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{50,}\.[A-Za-z0-9_-]{20,}/g },
  { name: 'Generic Secret Assignment', pattern: /(?:secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
  { name: 'Stripe Secret Key', pattern: /sk_live_[A-Za-z0-9]{20,}/g },
  { name: 'OpenAI Key', pattern: /sk-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}/g },
];

const IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  '.git/**',
  'package-lock.json',
  '*.png',
  '*.jpg',
  '*.svg',
  '*.woff2',
  '*.pdf',
  'playwright-report/**',
  'test-results/**',
];

const ALLOWED_FILES = [
  '.env.example',
  'tests/security/secrets-scan.cjs',
];

async function main() {
  const root = path.resolve(__dirname, '../..');
  const files = await glob('**/*.{ts,tsx,js,cjs,mjs,json,yaml,yml,env,sql,py,sh}', {
    cwd: root,
    ignore: IGNORE_PATTERNS,
    absolute: true,
  });

  let violations = 0;

  for (const file of files) {
    const relativePath = path.relative(root, file);
    if (ALLOWED_FILES.some((af) => relativePath.endsWith(af))) continue;
    // Skip .env file (local only, gitignored)
    if (relativePath === '.env') continue;

    const content = fs.readFileSync(file, 'utf-8');

    for (const { name, pattern } of SECRET_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = content.match(pattern);
      if (matches) {
        // Filter false positives: env var references like import.meta.env.VITE_*
        const realMatches = matches.filter((m) => {
          if (m.includes('import.meta.env')) return false;
          if (m.includes('process.env')) return false;
          if (m.includes('Deno.env')) return false;
          if (m.includes('VITE_')) return false;
          if (m.includes('SUPABASE_URL')) return false;
          if (m.includes('example')) return false;
          if (m.includes('placeholder')) return false;
          if (m.includes('your_')) return false;
          // Route path definitions are not secrets
          if (/['"]\/[a-z-/]+['"]/.test(m)) return false;
          // UI labels like "Password" or "password reset" are not secrets
          if (/password.*reset|forgot.*password|change.*password/i.test(m)) return false;
          // Type annotations and field names
          if (m.includes('type') || m.includes('Type')) return false;
          return true;
        });

        if (realMatches.length > 0) {
          console.error(`FAIL: ${relativePath} - ${name} (${realMatches.length} match(es))`);
          violations++;
        }
      }
    }
  }

  if (violations > 0) {
    console.error(`\n${violations} potential secret(s) found in source files.`);
    process.exit(1);
  } else {
    console.log('PASS: No committed secrets detected.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Security scan error:', err);
  process.exit(1);
});
