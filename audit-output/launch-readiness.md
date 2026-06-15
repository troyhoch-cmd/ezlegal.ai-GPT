# Launch Readiness Report

**Generated:** 2026-06-15T01:21:08.159Z
**Launch Ready:** NO
**Total Blockers:** 7

---

## Threshold Results

| # | Threshold | Required | Actual | Status |
|---|-----------|----------|--------|--------|
| 1 | Critical Findings | 0 | 0 | PASS |
| 2 | High Findings | 0 | 0 | PASS |
| 3 | Navigation Errors | 0 | 306 | FAIL |
| 4 | Public Route Reachability | 100% | 0% | FAIL |
| 5 | Icp Route Coverage | 100% | 100% | PASS |
| 6 | Ai Route Trust | all pass | 9 failing | FAIL |
| 7 | Spanish Route Completeness | all pass | 2 failing | FAIL |
| 8 | Conversion Route Readiness | all pass | all pass | PASS |
| 9 | No Duplicate Routes | 0 | 1 | FAIL |
| 10 | Screenshot Coverage | 100% | 1 missing | FAIL |
| 11 | Ci Passes | all pass | 2 failing | FAIL |

---

## Top Blockers

### 1. 0 navigation/audit errors
**Actual:** 306

- [/] page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - n
- [/] page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - n
- [/] page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - n

### 2. 100% public route reachability
**Actual:** 0% (0/51)

- /
- /login
- /signup
- /forgot-password
- /pricing

### 3. All AI routes have AI disclosure, legal boundary, jurisdiction warning, privacy notice, and human escalation
**Actual:** 9 AI route(s) with missing trust signals

- /ai-governance: no ICP evidence collected
- /case-predictor: no ICP evidence collected
- /case-predictor/start: no ICP evidence collected
- /chatbot: no ICP evidence collected
- /chatbot-standalone: no ICP evidence collected

### 4. All Spanish routes have Spanish/bilingual nav, forms, CTAs, and disclaimers
**Actual:** 2 Spanish route(s) with gaps

- /espanol: no Spanish ICP evidence collected
- /es: no Spanish ICP evidence collected

### 5. No duplicate route inventory entries
**Actual:** 1 duplicate path(s)

- /chat (4x)

### 6. Screenshots exist for every route and viewport
**Actual:** 1 missing screenshot(s)

- Screenshot directory does not exist

### 7. Build, typecheck, and Playwright smoke tests pass
**Actual:** 2 CI check(s) failed

- Typecheck failed: src/App.tsx(47,7): error TS6133: 'Chatbot' is declared but its value is never read. src/App.tsx(48,7): error TS6133: 'SimpleChatbot' is declared but its value is never read. src/components/AICaseMatch
- Playwright failed:  Running 128 tests using 1 worker

---

## Summary

- Total routes: 62
- Public routes: 51
- Total findings: 306
- ICP definitions: 3
- Typecheck: FAIL
- Build: PASS
- Playwright: FAIL
