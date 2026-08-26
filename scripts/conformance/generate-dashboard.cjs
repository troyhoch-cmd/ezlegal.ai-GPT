#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { REPORT_DIR, RESULT_FILE, validate, writeResults } = require('./lib.cjs');

// The report step runs with `if: always()` in CI, so it must also work when the
// validation step failed before it could create its result file.
let results;
try {
  results = JSON.parse(fs.readFileSync(RESULT_FILE, 'utf8'));
} catch {
  results = validate();
  writeResults(results);
}

const status = results.passed ? 'Passed' : 'Failed';
const rows = results.checks.map((check) =>
  `| ${check.passed ? '✅' : '❌'} | ${check.name} | ${check.details.replaceAll('|', '\\|')} |`,
).join('\n');
const report = `# Route Policy Conformance Dashboard

## Executive Summary

**${status}** — ${results.checks.length - results.failureCount}/${results.checks.length} checks passed across ${results.routeCount} discovered routes.

Generated at: ${results.generatedAt}

## Checks

| Result | Gate | Details |
|---|---|---|
${rows}
`;

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, 'route-policy-dashboard.md'), report);
console.log(`Conformance dashboard generated (${status.toLowerCase()}).`);
