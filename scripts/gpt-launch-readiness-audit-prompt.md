# GPT-5.5 Pro Launch Readiness Audit

> Upload this prompt alongside `scripts/output/merged-audit-bundle.md` (regenerated after all P0 fixes).
> Ask: "Run the launch readiness audit using the provided prompt and bundle."

---

## PURPOSE

This is a **re-audit + launch gate** evaluation. The previous audit returned a **BLOCK** verdict with 7 banned content instances and 75+ bilingual gaps across three P0 files:

- `src/pages/EZReads.tsx`
- `src/pages/ForBusiness.tsx`
- `src/pages/Documents.tsx`

The following remediations have been applied since the BLOCK verdict:

### EZReads.tsx Fixes Applied
1. Changed outcome-implying title "Win Your Case" to "Prepare Your Case" (EN + ES)
2. Replaced `new Date().toISOString()` with fixed ISO date strings in `toArticle()`
3. Added `CategoryConfig` interface; `useCategories()` now derives counts from article data (no hardcoded numbers)
4. Changed `formatUpdatedDate` signature from `lang: string` to `lang: 'en' | 'es'`
5. Added proper language narrowing: `const lang = language === 'es' ? 'es' : 'en' as const`
6. Implemented functional newsletter form with Supabase `email_captures` insert

### ForBusiness.tsx Fixes Applied
1. Replaced hardcoded `$149 * 12` with dynamic import from `pricing.ts` (Business Starter plan `monthlyPrice`)
2. Softened hero copy: "handles contracts, compliance" -> "helps your team navigate contracts, compliance questions, and workflows"
3. Softened pain point: "AI-powered review in minutes, not days" -> "AI-assisted review workflow helps surface key issues faster"
4. Rephrased FAQ: "Can ezLegal.ai replace our attorney entirely?" -> "Do we still need an attorney if we use ezLegal.ai?"
5. Added visible non-dismissible scope boundary between hero and trust bar
6. Softened value prop speed claims ("in hours instead of weeks" -> "identify key clauses and potential issues more quickly")
7. Added "from" label and "/yr" suffix to ROI calculator output for price transparency
8. Added tooltip attribution for encryption claims to infrastructure provider (Supabase)
9. Updated calculator disclaimer to reference plan name and link to pricing page
10. Softened final CTA copy from "handle" to "navigate"
11. Both EN and ES versions updated for all changes

### Documents.tsx Fixes Applied
1. Added non-dismissible legal disclaimer in document preview/save/download area (EN + ES)
2. Fixed dead Download button with proper `onClick` handler (Blob download)
3. Added `user?.id` dependency to `useEffect` to reload documents on auth change
4. Added Edge Function response validation (checks `typeof data.response === 'string'`)
5. Added env var guard (`SUPABASE_URL` / `SUPABASE_ANON_KEY`) before API calls
6. Softened AI prompt from "Generate a professional legal document" to "Generate an informational legal draft...for review by a licensed attorney"
7. Softened page subtitle: "Generate professional legal documents in minutes" -> "Create informational legal drafts for review by a licensed attorney"
8. Translated 30+ UI strings to Spanish: labels, placeholders, buttons, CTAs, headers, helper text
9. Softened empty state copy: "Generate your first legal document" -> "Create your first informational legal draft"

---

## YOUR TASK

Perform TWO evaluations:

### Evaluation 1: P0 Re-Audit (Verify Fixes)

Re-run the exact same checklist from the previous audit against the three P0 files. Specifically confirm:

1. **All 7 previously flagged banned content instances are resolved**
2. **The 75+ bilingual gaps are closed** (or reduced to a documented, acceptable count)
3. **Hardcoded data issues are fixed** (no `new Date()`, no magic numbers for pricing/counts)
4. **Type safety issues are resolved** (no `string` where `'en' | 'es'` is expected)
5. **Dead UI elements are functional** (download button, newsletter form)
6. **Scope boundaries and disclaimers are present** near AI output and claims

For each previously flagged issue, report: FIXED / PARTIALLY_FIXED / NOT_FIXED / NEW_ISSUE_INTRODUCED

### Evaluation 2: Launch Gate Assessment

Evaluate whether the three files are now **production-ready** by checking:

#### A. Banned Content (Zero Tolerance)
Scan for ALL instances of:
- "bank-level security"
- "join thousands" / "trusted by thousands"
- "guaranteed outcome" / "guaranteed results"
- "replaces a lawyer" / "better than a lawyer"
- "we are a law firm"
- "attorney-client relationship" (implying we create one)
- "trained on actual legal precedents"
- "generate enforceable documents"
- "generate professional legal documents" (overclaiming)
- "AI handles [legal task]" (implying autonomous execution)
- "AI-powered review in minutes" (overclaiming speed)
- Any fabricated statistics or user counts

#### B. Scope Boundary Compliance
- Every page that references AI capabilities MUST have a visible, non-dismissible scope boundary stating "legal information / workflow support only, not legal advice"
- Documents page MUST have disclaimer near generated content
- ForBusiness page MUST have disclaimer visible without scrolling past the fold

#### C. Bilingual Parity
- Count remaining hardcoded English-only strings in each file
- Acceptable threshold: 0 untranslated user-facing strings
- Template names in Documents.tsx are acceptable in English only IF they are proper nouns (e.g., "501(c)(3)")

#### D. Commerce Model Integrity
- No hardcoded prices outside of `src/data/pricing.ts`
- ROI calculator references actual plan data
- Trial claims match what pricing page offers
- No "SOC 2 certified" claim attributed directly to ezLegal.ai (it's our infrastructure provider)

#### E. Safety & Ethics
- No outcome-implying language in legal content pages
- Crisis resources remain accessible
- AI-generated content clearly labeled as drafts requiring attorney review
- No auto-execution of legal actions (every action requires explicit user confirmation)

---

## STACK CONTEXT (unchanged)

- **Framework:** Vite 5 + React 18 + TypeScript 5.9 + Tailwind CSS 3.4
- **Backend:** Supabase (Postgres + Edge Functions + Auth)
- **i18n:** Custom `LanguageContext` with `{ language, t, setLanguage }` where `type Language = 'en' | 'es' | 'ar'`
- **Language narrowing:** `const lang = language === 'es' ? 'es' : 'en'` (bilingual data keyed as `Record<'en' | 'es', T>`)
- **Icons:** lucide-react only
- **Pricing source of truth:** `src/data/pricing.ts` (PROTECTED, never modified)

---

## COMMERCE MODEL TAXONOMY

```typescript
type CommerceModel = 'free' | 'self_serve_subscription' | 'one_time_addon' | 'partner_custom' | 'grant_or_free_access';
```

Business plans available: `business-starter` ($29/mo), `business-plus` ($79/mo), `business-pro` (custom pricing).

---

## PROTECTED FILES (must not have been modified)

- `src/data/pricing.ts`
- `src/components/pricing/PricingCard.tsx`
- `src/pages/Pricing.tsx`
- `src/lib/pricingMath.ts`
- All files under `src/components/pricing/`

---

## OUTPUT FORMAT

### Per-File Report

```json
{
  "file": "src/pages/[FileName].tsx",
  "previous_verdict": "BLOCK",
  "new_verdict": "SHIP | FIX_THEN_SHIP | BLOCK",
  "fix_verification": {
    "total_issues_from_previous_audit": <number>,
    "fixed": <number>,
    "partially_fixed": <number>,
    "not_fixed": <number>,
    "new_issues_introduced": <number>,
    "details": [
      {
        "original_issue": "<description>",
        "status": "FIXED | PARTIALLY_FIXED | NOT_FIXED | NEW_ISSUE",
        "evidence": "<quote or line reference>"
      }
    ]
  },
  "banned_content": {
    "count": 0,
    "violations": []
  },
  "bilingual_coverage": {
    "untranslated_user_facing_strings": 0,
    "details": []
  },
  "scope_boundaries": {
    "present": true,
    "non_dismissible": true,
    "location": "<description>"
  },
  "type_safety": {
    "issues": []
  },
  "commerce_model_compliance": {
    "hardcoded_prices": false,
    "details": []
  },
  "risk_level": "low | medium | high"
}
```

### Final Launch Gate Summary

```json
{
  "overall_verdict": "SHIP | FIX_THEN_SHIP | BLOCK",
  "previous_verdict": "BLOCK",
  "verdict_change_rationale": "<explanation>",
  "banned_content_count": 0,
  "bilingual_gap_count": 0,
  "scope_boundary_compliance": "PASS | PARTIAL | FAIL",
  "commerce_model_compliance": "PASS | PARTIAL | FAIL",
  "safety_compliance": "PASS | PARTIAL | FAIL",
  "remaining_blockers": [],
  "remaining_advisories": [],
  "launch_recommendation": "<1-2 sentence recommendation>",
  "confidence_level": "high | medium | low"
}
```

---

## SEVERITY CLASSIFICATION

- **BLOCKER**: Banned content present, missing mandatory disclaimer, hardcoded pricing, outcome-implying claims, attorney-replacement language
- **HIGH**: Untranslated user-facing strings (>5 per file), dead UI elements, unvalidated API responses
- **MEDIUM**: Minor type safety issues, missing tooltip/title attributes, imprecise language that doesn't rise to "banned"
- **LOW**: Style inconsistencies, optional enhancements, documentation gaps

**SHIP threshold:** Zero BLOCKERs, zero HIGH issues. MEDIUM/LOW are acceptable with documentation.

---

## THREE-PROJECT DISTINCTION (unchanged)

| Label | Description | Rule |
|-------|-------------|------|
| **CURRENT PROJECT** | The active Bolt development project | This is what you are auditing. |
| **APRIL 28 BASELINE** | GitHub snapshot recovery source | Reference ONLY for merge accuracy. |
| **LEGACY SITE** | Old production ezLegal.ai website | **NEVER reference. NEVER draw from.** |

---

## REMINDER

You are auditing the CURRENT PROJECT only. The goal is to confirm the BLOCK verdict has been resolved and determine whether these three files are now safe to ship to production.

Be thorough but fair: do not invent issues that aren't present. If the fixes successfully address the prior concerns, acknowledge that clearly. If new issues were introduced by the fixes, flag them explicitly.

The standard is: **Would a compliance-aware engineering lead approve this for production deployment at a legal technology company?**

Proceed with the audit.
