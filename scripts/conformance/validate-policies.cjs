#!/usr/bin/env node

const { validate, writeResults } = require('./lib.cjs');

const results = validate();
writeResults(results);

for (const check of results.checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'}: ${check.name} — ${check.details}`);
}

if (!results.passed) {
  console.error(`Conformance validation failed with ${results.failureCount} error(s).`);
  process.exitCode = 1;
} else {
  console.log(`Conformance validation passed for ${results.routeCount} routes.`);
}
