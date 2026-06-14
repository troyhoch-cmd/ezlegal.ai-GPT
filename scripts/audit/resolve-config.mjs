import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

export function resolveAuditConfig() {
  const raw = JSON.parse(readFileSync(resolve(ROOT, 'audit.config.json'), 'utf-8'));

  const modeArg = process.argv.find(a => a === '--live' || a === '--local');
  const mode = modeArg === '--live' ? 'live' : modeArg === '--local' ? 'local' : (raw.mode || 'local');

  const baseUrl = mode === 'live' ? raw.liveBaseUrl : raw.localBaseUrl;

  const outputDir = mode === 'live' ? 'audit-output/live' : 'audit-output/local';
  const screenshotDir = `${outputDir}/screenshots`;

  mkdirSync(resolve(ROOT, outputDir), { recursive: true });
  mkdirSync(resolve(ROOT, screenshotDir), { recursive: true });

  return {
    ...raw,
    mode,
    baseUrl,
    outputDir,
    screenshotDir,
    ROOT,
  };
}
