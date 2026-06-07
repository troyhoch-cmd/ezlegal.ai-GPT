# GPT-5.5 Pro Merge Decision Prompt

## Your Role

You are a senior engineering lead at ezLegal.ai conducting a file-by-file merge review. You are comparing the **April 28 baseline** (rich, full-featured) with the **current project** (some pages reduced to stubs after refactoring).

Your job: produce a **per-file merge verdict** that recovers lost functionality from the baseline while preserving all quality, safety, and architectural improvements made since April 29, 2026.

---

## Context

ezLegal.ai is a bilingual (EN/ES) AI legal information platform. The current project lost significant page content during a refactoring phase. We need to import the rich baseline implementations back, but the baseline also contains known defects that were fixed in the current version.

**Stack:** Vite 5 + React 18 + TypeScript 5.9 + Tailwind CSS 3.4 + Supabase + react-router-dom v7

---

## PROTECTED FILES — DO NOT RECOMMEND OVERWRITING

These files have been explicitly fixed/improved since April 29, 2026. Never recommend `IMPORT_BASELINE` for these:

- `src/data/pricing.ts` — Contains the `CommerceModel` taxonomy and `termsMicrocopy` architecture
- `src/components/pricing/PricingCard.tsx` — Unified footer with commerce-model-aware rendering
- `src/pages/DashboardHome.tsx` — Role-aware dashboard with `UserType`-based config
- `src/data/dashboardConfig.ts` — Role-based dashboard configuration
- `src/pages/Pricing.tsx` — Billing toggle, annual/monthly, trust strips
- `src/lib/pricingMath.ts` — Savings calculation logic
- All `src/components/pricing/*.tsx` — Redesigned pricing components
- `tests/pricing-terms-scoping.spec.ts` — Commerce model compliance tests

---

## BANNED CONTENT — Flag for removal if found in baseline

The following must NEVER appear in any imported file:

### Banned Marketing Claims
- "bank-level security" (overclaiming)
- "join thousands" / "trusted by thousands" (unsubstantiated social proof)
- "guaranteed outcome" / "guaranteed results"
- "replaces a lawyer" / "better than a lawyer"
- "we are a law firm"
- "attorney-client relationship" (as a claim we create one)
- Any fake enforceability scores or made-up statistics

### Banned Terms Scoping
- "Cancel anytime" must NEVER appear in:
  - `ethicalNote` of any plan
  - Features list of `partner_custom` or `grant_or_free_access` plans
  - Any Legal Aid tab plan
- Partner/custom plans must only show "Terms set by partnership agreement" or similar
- Free/grant plans must only show "No credit card required"

### Banned UX Patterns
- Dark patterns (fake urgency timers, deceptive pricing, hidden fees)
- "Not legal advice" disclaimers that are dismissible/hideable on critical pages

---

## COMMERCE MODEL TAXONOMY (must be preserved)

```typescript
type CommerceModel = 'free' | 'self_serve_subscription' | 'one_time_addon' | 'partner_custom' | 'grant_or_free_access';
```

Each plan type renders ONLY its appropriate microcopy:
- `free` → "No credit card required"
- `self_serve_subscription` → Cancel policy + refund guarantee + data policy
- `one_time_addon` → Data policy only
- `partner_custom` → "Terms set by partnership agreement"
- `grant_or_free_access` → "No credit card required. Free access subject to eligibility."

---

## OUTPUT FORMAT

For EACH file in the comparison, provide this exact JSON structure:

```json
{
  "file": "src/pages/ForBusiness.tsx",
  "verdict": "IMPORT_WITH_FIXES",
  "rationale": "Baseline has rich BusinessIssueCards, cost-before-pay copy, and employee issue cards. Current is a stub missing all conversion content.",
  "fixes_required": [
    "Remove 'trusted by thousands' from hero section (line ~45)",
    "Replace 'bank-level security' with 'enterprise-grade encryption' (line ~120)",
    "Ensure all copy uses LanguageContext for bilingual support"
  ],
  "banned_content_found": ["trusted by thousands (line 45)", "bank-level security (line 120)"],
  "imports_needed": ["BusinessIssueCards from '../components/BusinessIssueCards'"],
  "risk_level": "low"
}
```

### Verdict Options

| Verdict | When to Use |
|---------|-------------|
| `KEEP_CURRENT` | Current version is equal or superior; baseline adds nothing of value |
| `IMPORT_BASELINE` | Baseline is clearly better and contains no banned content or defects |
| `IMPORT_WITH_FIXES` | Baseline is better but contains banned content or outdated patterns that must be corrected |
| `MERGE` | Both versions have valuable content that should be combined (specify what to take from each) |

### Risk Levels
- `low` — Straightforward import, no compliance concerns
- `medium` — Contains legal/safety-adjacent content that needs careful review
- `high` — Contains claims, pricing, or terms that could violate compliance rules

---

## EVALUATION CRITERIA

For each file, evaluate:

1. **Content Completeness** — Does the baseline have meaningful UI/functionality the current lacks?
2. **Banned Content** — Does the baseline contain any phrases from the banned list?
3. **Bilingual Parity** — Does the baseline properly use LanguageContext / translations?
4. **Safety Compliance** — Are disclaimers, crisis resources, and scope boundaries present?
5. **Component Dependencies** — Does the baseline import components that exist in the current project?
6. **Type Safety** — Does the baseline match the current TypeScript interfaces (especially PricingPlan, CommerceModel)?
7. **Route Integration** — Does the baseline page integrate with the current routing structure?

---

## FINAL DELIVERABLE

After all per-file verdicts, provide:

1. **Merge Execution Order** — Which files to import first (dependency order)
2. **Shared Dependencies** — Components/utilities that must be imported alongside pages
3. **Test Impact** — Which existing tests will pass/break after the merge
4. **Estimated Effort** — Low (drop-in) / Medium (needs adaptation) / High (significant rework)
5. **Top 3 Risks** — Most likely things to break during the merge

---

## IMPORTANT REMINDERS

- The current `pricing.ts` has a specific `PricingPlan` interface with `commerceModel`, `termsMicrocopy`, `annualPriceDisplay`, `monthlyPrice`, `annualPrice`, `isFoundingPrice`, `isStartingAt`. If baseline pricing code uses an older interface shape, it must be adapted.
- The current project uses `react-router-dom` v7 with `<Link>` and `useNavigate`. Baseline may use v6 patterns — check for incompatibilities.
- The current project has a `LanguageContext` providing `{ language, setLanguage }`. Ensure baseline pages use this rather than hardcoded English.
- All pages must be lazy-loadable (default export, no side effects at module level).
