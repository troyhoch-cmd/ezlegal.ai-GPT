#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const localReport = resolve(ROOT, 'audit-output/local/FULL_SITE_AUDIT.json');
const liveReport = resolve(ROOT, 'audit-output/live/FULL_SITE_AUDIT.json');

const reportPath = existsSync(localReport) ? localReport : existsSync(liveReport) ? liveReport : null;

if (!reportPath) {
  console.error('[launch:check] No audit report found. Run audit:all first.');
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, 'utf-8'));

if (report.auditValidity !== 'valid') {
  console.error(`[launch:check] BLOCKED - Audit invalid: ${report.invalidReason || 'unknown reason'}`);
  process.exit(1);
}

if (!report.launchReady) {
  console.error(`[launch:check] BLOCKED - Not launch ready. Critical findings: ${report.summary?.bySeverity?.critical || 0}`);
  process.exit(1);
}

console.log('[launch:check] PASSED - Audit valid and launch ready.');
process.exit(0);
