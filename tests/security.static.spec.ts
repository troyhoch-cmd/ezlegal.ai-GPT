import { describe, expect, it } from 'vitest';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from 'node:fs';
import {
  basename,
  extname,
  join
} from 'node:path';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  'playwright-report',
  'test-results'
]);

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.html',
  '.css'
]);

function isTextLike(filePath: string): boolean {
  const name = basename(filePath);
  return name.startsWith('.env') || TEXT_EXTENSIONS.has(extname(filePath));
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];

  const output: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) output.push(...walk(fullPath));
      continue;
    }

    if (stat.isFile() && isTextLike(fullPath) && stat.size < 750_000) {
      output.push(fullPath);
    }
  }

  return output;
}

const allFiles = walk('.');

const secretPatterns: Array<{ name: string; regex: RegExp }> = [
  {
    name: 'OpenAI/LLM-style API key',
    regex: /sk-[A-Za-z0-9_-]{20,}/g
  },
  {
    name: 'private key block',
    regex: /-----BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY-----/g
  },
  {
    name: 'Supabase service role key assignment',
    regex: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["']?[^"'\s]+/g
  },
  {
    name: 'Stripe secret key',
    regex: /sk_live_[A-Za-z0-9]{16,}/g
  },
  {
    name: 'generic hardcoded secret assignment',
    regex: /(API_KEY|SECRET_KEY|AUTH_TOKEN)\s*[:=]\s*["'][A-Za-z0-9+/=_-]{20,}["']/gi
  }
];

describe('static security launch checks', () => {
  it('does not include real .env files with non-public secrets in source tree', () => {
    const envFiles = allFiles.filter((file) => {
      const name = basename(file);
      if (!name.startsWith('.env')) return false;
      if (['.env.example', '.env.sample', '.env.template'].includes(name)) return false;

      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
      const hasNonPublicVar = lines.some(
        (l) => !l.startsWith('VITE_') && !l.startsWith('NEXT_PUBLIC_')
      );
      return hasNonPublicVar;
    });

    expect(envFiles, `Move env values into deployment secrets:\n${envFiles.join('\n')}`).toEqual([]);
  });

  it('does not contain likely committed secrets', () => {
    const findings: string[] = [];

    for (const file of allFiles) {
      const name = basename(file);

      if (['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(name)) {
        continue;
      }

      if (name === '.env.example' || name === '.env.sample' || name === '.env.template') {
        continue;
      }

      if (extname(file) === '.md') {
        continue;
      }

      const text = readFileSync(file, 'utf8');

      for (const pattern of secretPatterns) {
        const matches = text.match(pattern.regex);
        if (matches?.length) {
          findings.push(`${file}: ${pattern.name}`);
        }
      }
    }

    expect(findings, findings.join('\n')).toEqual([]);
  });
});
