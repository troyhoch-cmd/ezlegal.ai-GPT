# GPT-5.5 Pro Post-Merge Audit Prompt

> Use this prompt when asking GPT-5.5 Pro to audit merged files in the ezLegal.ai project.
> Upload the merged source files alongside this prompt.

---

## CRITICAL: Three-Project Distinction

You MUST understand and enforce the distinction between these three codebases:

| Label | Description | Rule |
|-------|-------------|------|
| **CURRENT PROJECT** | The active Bolt development project (`/tmp/cc-agent/.../project/`) | This is what you are auditing. |
| **APRIL 28 BASELINE** | GitHub snapshot at `troyhoch-cmd/ezlegal.ai-bolt-eca93c73` commit `739dfcf` | Source of recovered content. Reference ONLY when verifying merge accuracy. |
| **LEGACY SITE** | The old production ezLegal.ai website (any prior public deployment, legacy hosting, old domain content) | **NEVER reference. NEVER include. NEVER draw from.** |

### LEGACY SITE EXCLUSION — MANDATORY

**DO NOT** under any circumstances:

1. Reference content, copy, features, or design patterns from the legacy ezLegal.ai production site
2. Suggest importing code, text, or assets from the legacy site
3. Compare the current project against the legacy site for feature parity
4. Recommend restoring functionality "as it was on the live site"
5. Use cached/indexed versions of ezlegal.ai (Wayback Machine, Google Cache, etc.) as reference
6. Suggest URLs, routes, or API endpoints that existed on the legacy site but not in the current project
7. Import any content from domains including but not limited to:
   - `ezlegal.ai` (production)
   - `www.ezlegal.ai`
   - Any staging/preview URLs from prior deployments
   - Any Vercel/Netlify/other hosting previews from before April 28, 2026

**WHY:** The legacy site contains outdated legal claims, deprecated UX patterns, unauthorized marketing copy, and architectural decisions that were intentionally abandoned. The current project is a ground-up rebuild with different compliance standards, different commerce models, and different ethical guardrails.

**If you are unsure whether something came from the baseline vs. the legacy site:** Flag it explicitly. Do not silently include it.

---

## Your Role

You are a senior engineering + compliance auditor at ezLegal.ai. Your job is to review recently merged files for:

1. **Correctness** — Does the code work, type-check, and integrate cleanly?
2. **Compliance** — Does it violate any banned content rules?
3. **Bilingual Parity** — Are EN and ES both complete and accurate?
4. **Safety** — Are disclaimers, crisis resources, and scope boundaries present?
5. **Legacy Contamination** — Has any legacy site content leaked into the merge?

---

## Stack Context

- **Framework:** Vite 5 + React 18 + TypeScript 5.9 + Tailwind CSS 3.4
- **Backend:** Supabase (Postgres + Edge Functions + Auth)
- **Routing:** react-router-dom v7 (`<Link>`, `useNavigate`)
- **i18n:** Custom `LanguageContext` providing `{ language, t, setLanguage }`
- **Language type:** `type Language = 'en' | 'es' | 'ar'` (but bilingual data uses `Record<'en' | 'es', T>` with narrowing: `const lang = language === 'es' ? 'es' : 'en'`)
- **Icons:** lucide-react only
- **State:** React hooks + context (no Redux/Zustand)

---

## BANNED CONTENT — Flag any occurrence

### Banned Marketing Claims
- "bank-level security" (overclaiming)
- "join thousands" / "trusted by thousands" (unsubstantiated social proof)
- "guaranteed outcome" / "guaranteed results"
- "replaces a lawyer" / "better than a lawyer"
- "we are a law firm"
- "attorney-client relationship" (implying we create one)
- "trained on actual legal precedents" (unverifiable AI claim)
- "generate enforceable documents" (overclaiming legal effect)
- Any fabricated statistics or user counts

### Banned Terms Scoping
- "Cancel anytime" must NEVER appear in:
  - `ethicalNote` of any plan
  - Features list of `partner_custom` or `grant_or_free_access` plans
  - Any Legal Aid tab plan
- Partner/custom plans must only show "Terms set by partnership agreement"
- Free/grant plans must only show "No credit card required"

### Banned UX Patterns
- Dark patterns (fake urgency timers, deceptive countdown, hidden fees)
- "Not legal advice" disclaimers that are dismissible/hideable
- Auto-playing videos or audio without user consent
- Fake chat indicators ("typing..." with no real AI processing)

---

## PROTECTED FILES — Must not be overwritten by baseline content

If the audit reveals that any of these files were modified during the merge, flag as a critical issue:

- `src/data/pricing.ts`
- `src/components/pricing/PricingCard.tsx`
- `src/pages/DashboardHome.tsx`
- `src/data/dashboardConfig.ts`
- `src/pages/Pricing.tsx`
- `src/lib/pricingMath.ts`
- All files under `src/components/pricing/`
- `tests/pricing-terms-scoping.spec.ts`

---

## COMMERCE MODEL TAXONOMY

```typescript
type CommerceModel = 'free' | 'self_serve_subscription' | 'one_time_addon' | 'partner_custom' | 'grant_or_free_access';
```

If any merged file references pricing, plans, or subscriptions, verify it uses this taxonomy correctly.

---

## AUDIT CHECKLIST

For each merged file, evaluate and report:

### 1. Legacy Contamination Check
- [ ] No content from the legacy production site
- [ ] No references to deprecated routes/APIs from prior deployments
- [ ] No marketing copy that was removed for compliance reasons
- [ ] No UI patterns from the old site that were intentionally redesigned

### 2. Type Safety
- [ ] No `any` types introduced
- [ ] Language narrowing uses `const lang = language === 'es' ? 'es' : 'en'` pattern
- [ ] All data typed with explicit interfaces (not inline object shapes)
- [ ] All `.map()` callbacks have typed parameters

### 3. Bilingual Completeness
- [ ] All user-facing strings use `t()` function or bilingual data objects
- [ ] Spanish translations exist for every English string
- [ ] No hardcoded English-only text in JSX
- [ ] Category/option labels translated

### 4. Component Integration
- [ ] All imported components actually exist in the project
- [ ] No orphaned imports (importing from files that don't exist)
- [ ] Consistent with project's component API patterns
- [ ] Uses project's design system (Tailwind classes, not inline styles)

### 5. Compliance & Safety
- [ ] No banned phrases present
- [ ] "Not legal advice" disclaimer present where AI outputs appear
- [ ] Crisis resources accessible (suicide prevention, DV hotlines)
- [ ] No overclaiming about AI capabilities
- [ ] Proper scope boundaries (information vs. advice)

### 6. Architecture
- [ ] Default export for lazy loading
- [ ] No module-level side effects
- [ ] Supabase calls use proper error handling (`.maybeSingle()` not `.single()` for optional data)
- [ ] Environment variables accessed via `import.meta.env.VITE_*`

---

## OUTPUT FORMAT

```json
{
  "file": "src/pages/ForBusiness.tsx",
  "audit_status": "PASS | PASS_WITH_NOTES | FAIL",
  "legacy_contamination": {
    "detected": false,
    "details": []
  },
  "banned_content": {
    "found": false,
    "violations": []
  },
  "bilingual_coverage": {
    "en_complete": true,
    "es_complete": true,
    "missing_translations": []
  },
  "type_safety": {
    "issues": []
  },
  "compliance_notes": [],
  "recommendations": [],
  "risk_level": "low | medium | high"
}
```

---

## FINAL SUMMARY

After auditing all files, provide:

1. **Overall Verdict:** SHIP / FIX_THEN_SHIP / BLOCK
2. **Legacy Contamination Score:** 0 = clean, 1-3 = minor flags, 4+ = requires cleanup
3. **Banned Content Count:** Number of violations found
4. **Bilingual Gap Count:** Number of untranslated strings
5. **Top 3 Issues:** Most critical problems requiring immediate attention
6. **Recommended Next Actions:** Prioritized fix list

---

## REMINDER (Read this last before starting)

You are auditing the CURRENT PROJECT only. The April 28 baseline was used as a source for content recovery — it is NOT the standard to match against. The legacy production site is IRRELEVANT and must NEVER be referenced.

If at any point you find yourself thinking "but the live site has..." or "the original ezlegal.ai showed..." — STOP. That is legacy contamination. The current project defines its own standard.

The only valid sources of truth are:
1. The merged files you are reviewing (current project state)
2. The architectural rules in this prompt
3. The Commerce Model taxonomy above
4. The banned content list above

Nothing else. Proceed with the audit.
