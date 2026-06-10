# GPT-5.5 Pro Re-Audit Prompt (Post-Remediation)

> **How to use:** Upload the file `scripts/output/restored-pages-audit-bundle.md` to your GPT session, then paste the prompt below.

---

## Prompt to Paste

```
You are re-auditing the ezLegal.ai platform after a full remediation pass was applied to address 11 BLOCK-level findings from the previous audit. Your job is to verify that each fix was correctly implemented and no new issues were introduced.

## Context

ezLegal.ai is an AI-powered legal INFORMATION platform (not a law firm) serving consumers and SMBs who cannot afford a lawyer. The platform is bilingual (English/Spanish) and serves vulnerable populations including low-income users, immigrants, and non-English speakers.

## What Changed Since Last Audit

The following remediations were applied:

### 1. Critical Security Fixes
- Research.tsx: Now uses `supabase.auth.getSession()` to get the user's session token for edge function calls instead of the anon key
- Matters.tsx: Added `.eq('user_id', user.id)` to the loadMatters query to scope data by user
- PartnerHub.tsx: Error handling now checks the Supabase response for errors and surfaces them to the user (no longer swallows errors silently)
- Created `src/lib/safe-url.ts` with `sanitizeHref()` utility for URL validation

### 2. Broken Conversion Paths Fixed
- Checkout.tsx: Removed hardcoded `disabled` attribute from "Continue to Payment" button
- IssuePacks.tsx: Safety gate `onConfirm` now routes to `/checkout?plan=${packId}` instead of `/dashboard`

### 3. Softened Claims
- Negotiate.tsx: Removed "73%", "2-3x", "15 min", "AmLaw 100" unverified claims; replaced with qualified language ("Research suggests...", "can significantly improve...", "Professional negotiation frameworks")
- Dashboard.tsx: Replaced fabricated "$X savings" calculation with actual questions-answered count
- Checkout.tsx: Replaced "TLS 1.3 + AES-256" with "Encrypted checkout"

### 4. Scope Disclaimers Added
- Dashboard.tsx: Added legal information disclaimer at top of content area
- Research.tsx: Added AI-generated results disclaimer under the page heading

### 5. Bilingual Parity
- ChatV2.tsx: Translated "Now" label and tooltip title attributes
- Profile.tsx: All error/success messages, photo upload errors, email change guidance now bilingual
- Research.tsx: "No history" placeholder text now bilingual
- Matters.tsx: Form placeholders now bilingual

### 6. Crisis Safety (Spanish Keywords + normalizeForCrisis)
- ContextualCrisisAlert.tsx: Added 20+ Spanish crisis keywords across self_harm, domestic_violence, and homelessness categories
- `detectCrisisSignal()` now calls `normalizeForCrisis()` internally for accent-insensitive matching
- ChatV2.tsx already had `normalizeForCrisis` integrated (double-normalization is harmless)

### 7. Code Quality
- Unused `SUPABASE_ANON_KEY` constant removed from Research.tsx
- Dashboard savings widget replaced with real metric

## Your Audit Checklist (apply to EACH page)

### A. Lang Narrowing Pattern
- Bilingual pages MUST have: `const lang = language === 'es' ? 'es' : 'en';`
- English-only pages (TrustCenter, ForPartners) are exempt

### B. Softened Claims
- MUST NOT contain: "attorney-reviewed", "reviewed by licensed attorneys", "lawyer-reviewed"
- MUST NOT contain unverified statistics (73%, 2-3x, specific time claims)
- MUST NOT imply attorney-client relationship unless explicitly disclaimed
- Acceptable: "structured templates", "designed for common legal workflows", "research suggests"

### C. Bilingual Parity
- Every user-facing EN string must have an ES equivalent
- ES copy must match EN meaning
- Placeholders and error messages must be bilingual on bilingual pages

### D. Scope Disclaimers
- Pages offering legal content must include: "legal information, not legal advice"
- No promise of specific outcomes

### E. normalizeForCrisis (Chat/Crisis detection)
- `detectCrisisSignal` must normalize text for accent-insensitive matching
- Spanish crisis keywords must be present in CRISIS_KEYWORDS
- ChatV2.tsx must import and use normalizeForCrisis

### F. Security
- No hardcoded API keys or anon keys used for authenticated operations
- Auth-gated operations must check `user` before Supabase calls
- Data queries must be scoped by user_id
- Error states must be surfaced to users (no silent catch blocks)
- No `dangerouslySetInnerHTML` without sanitization

### G. Conversion Path Integrity
- Checkout button must NOT be permanently disabled
- Safety gate confirmation must route to checkout, not dashboard
- Auth gates must redirect back to the intended page after login

### H. React Best Practices
- No memory leaks (effects cleaned up)
- Proper key props on mapped elements
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
  "conversion_path": "PASS" | "FAIL" | "N/A",
  "react_quality": "PASS" | "WARN",
  "issues": ["list of specific issues found"],
  "recommendations": ["optional improvements that are NOT blockers"]
}
```

Then provide a Final Summary:

```json
{
  "overall_verdict": "SHIP" | "FIX_THEN_SHIP" | "BLOCK",
  "pass_count": N,
  "fail_count": N,
  "warn_count": N,
  "critical_fixes_required": ["list if any -- only genuine blockers"],
  "improvements_suggested": ["nice-to-haves that do not block shipping"],
  "summary": "One paragraph assessment"
}
```

## Grading Guidance

- **PASS**: The check is satisfied. Minor style preferences or theoretical improvements do NOT warrant FAIL.
- **WARN**: A non-blocking concern exists (e.g., a placeholder that could be more descriptive). Does NOT count toward BLOCK.
- **FAIL**: A genuine compliance, security, or functionality defect that must be fixed before shipping.

## Important Distinctions

- Claims properly attributed to infrastructure providers (e.g., "AES-256 via our cloud infrastructure provider") are NOT violations -- they are factual descriptions of the deployment stack.
- "SOC 2 Type II" attributed to Supabase (the infrastructure provider) is factual, not an unverified claim about ezLegal.
- "99.9% target uptime" (with "target" qualifier) is acceptable.
- "24hr response" for email support is a service commitment, not an unverified statistic.
- A `lang` variable declared but unused (when the page uses `language === 'en'` directly) is a WARN at most, not a FAIL.
- Placeholders in form inputs (e.g., "John Doe", "+1 (555) 123-4567") are acceptable as universal format examples and do NOT require translation.

## Begin

Review all 11 pages systematically. Be fair and precise -- flag real issues, not style preferences. Output one JSON block per file, then the Final Summary.
```
