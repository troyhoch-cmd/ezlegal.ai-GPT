# GPT-5.5 Pro Full Front-End + Back-End Audit Prompt

> **How to use:** Upload the file `scripts/output/restored-pages-audit-bundle.md` to your GPT session, then paste the prompt below.

---

## Prompt to Paste

```
You are auditing the ezLegal.ai platform -- an AI-powered legal information platform serving consumers and SMBs who cannot afford a lawyer. This is a PRODUCTION readiness audit covering 11 restored pages that were recovered from a content regression and then had a compliance pass applied.

## Your Role

You are a senior full-stack auditor specializing in:
1. Legal tech compliance (UPL avoidance, scope disclaimers, softened claims)
2. Front-end quality (React/TypeScript, accessibility, i18n parity)
3. Security (XSS prevention, auth checks, data exposure)
4. Bilingual parity (English/Spanish equivalence)

## What You Are Reviewing

The attached bundle contains 11 React page components + 8 supporting files from an AI legal information platform. These pages were restored from a pre-audit baseline (April 28, 2026) and then had compliance patterns applied. You must verify the compliance pass was correctly applied.

## Audit Checklist (apply to EACH page)

### A. Lang Narrowing Pattern (CRITICAL)
- Bilingual pages MUST have: `const lang = language === 'es' ? 'es' : 'en';`
- NOT the old pattern: `const en = language === 'en'` (except as derived: `const en = lang === 'en'`)
- English-only pages (TrustCenter, ForPartners) are exempt

### B. Softened Claims (CRITICAL for legal compliance)
- MUST NOT contain: "attorney-reviewed", "reviewed by licensed attorneys", "lawyer-reviewed"
- Acceptable alternatives: "structured templates", "designed for common legal workflows", "periodically reviewed for accuracy"
- MUST NOT contain unverified time claims: "Setup in 30 minutes", "answers in seconds"
- MUST NOT imply attorney-client relationship unless explicitly disclaimed

### C. Bilingual Parity
- Every user-facing EN string must have an ES equivalent
- ES copy must match EN meaning (not be stronger or weaker)
- No English-only user-facing strings in bilingual pages

### D. Scope Disclaimers
- Pages offering legal content must include: "This is legal information, not legal advice"
- No promise of specific outcomes
- Crisis/safety content must be handled with proper escalation

### E. normalizeForCrisis (Chat pages only)
- ChatV2.tsx MUST import `normalizeForCrisis` from `../lib/text-utils`
- Crisis detection MUST normalize text before checking: `detectCrisisSignal(normalizeForCrisis(m.content))`

### F. Security
- No hardcoded API keys or secrets
- Auth-gated operations must check `user` before Supabase calls
- No `dangerouslySetInnerHTML` without sanitization
- Proper error handling on async operations

### G. React Best Practices
- No memory leaks (effects cleaned up)
- Proper key props on mapped elements
- No unused imports or dead code
- TypeScript types properly applied

## Output Format

For EACH of the 11 pages, output:

```json
{
  "file": "src/pages/PageName.tsx",
  "verdict": "PASS" | "FAIL" | "WARN",
  "lang_narrowing": "PASS" | "FAIL" | "EXEMPT",
  "softened_claims": "PASS" | "FAIL",
  "bilingual_parity": "PASS" | "FAIL" | "EXEMPT",
  "scope_disclaimers": "PASS" | "FAIL" | "N/A",
  "normalize_for_crisis": "PASS" | "FAIL" | "N/A",
  "security": "PASS" | "FAIL",
  "react_quality": "PASS" | "WARN",
  "issues": ["list of specific issues found"],
  "recommendations": ["optional improvements"]
}
```

Then provide a Final Summary:

```json
{
  "overall_verdict": "SHIP" | "FIX_THEN_SHIP" | "BLOCK",
  "pass_count": N,
  "fail_count": N,
  "warn_count": N,
  "critical_fixes_required": ["list if any"],
  "summary": "One paragraph assessment"
}
```

## Important Context

- This platform serves vulnerable populations (low-income, immigrants, non-English speakers)
- UPL (Unauthorized Practice of Law) violations are the #1 legal risk
- The platform is bilingual English/Spanish -- parity is a civil rights concern
- "ezLegal" is an AI INFORMATION platform, not a law firm
- Edge functions (Supabase) handle backend API calls -- the front-end calls them via supabase client
- The `detectCrisisSignal` function checks for suicide/DV/emergency keywords
- `normalizeForCrisis` strips Unicode diacriticals for accent-insensitive matching (critical for Spanish speakers typing without accents)

## Begin

Review all 11 pages systematically. Do not skip any file. Output one JSON block per file, then the Final Summary.
```
