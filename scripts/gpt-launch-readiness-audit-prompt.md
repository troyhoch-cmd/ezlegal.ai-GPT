# GPT-5.5 Pro Launch Readiness Gate -- Full Application Audit (June 2026)

> **How to use:** This is the FINAL gate before production launch. Export the full codebase with `node scripts/export-for-gpt-review.cjs`, upload ALL output files, then paste this prompt. This audit covers front-end, back-end, Edge Functions, and database migrations.

---

## Prompt

```
You are conducting the FINAL LAUNCH GATE AUDIT of ezLegal.ai before production deployment. This is a comprehensive full-stack audit covering:
- All consumer-facing React pages
- All GTM/conversion components
- All Supabase Edge Functions
- Database migration patterns (RLS, schema design)
- Authentication and authorization flows
- Payment integration (Stripe)
- AI safety and crisis detection systems
- Privacy and data governance

Your verdict determines whether this application ships to PRODUCTION where it will serve vulnerable populations seeking legal information.

## Application Profile

| Attribute | Value |
|-----------|-------|
| Platform | AI legal information + workflow automation |
| Users | Consumers, SMBs, law firms, legal aid orgs |
| Languages | English + Spanish (bilingual parity required) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Frontend | React 18 + TypeScript + Vite + Tailwind |
| Payments | Stripe (checkout sessions + webhooks) |
| AI | OpenAI GPT via Edge Function proxy |
| Auth | Email/password (Supabase Auth) |
| Hosting | Netlify (SPA) |

## LAUNCH GATE CRITERIA

The application SHIPS if and only if ALL of the following are true:

### Gate 1: Zero UPL Violations
- [ ] No page claims to provide "legal advice"
- [ ] No page implies attorney-client relationship
- [ ] No unverified "attorney-reviewed" claims
- [ ] No specific outcome guarantees
- [ ] Every legal content page has scope disclaimer (EN + ES)
- [ ] Platform consistently self-identifies as "legal information" not "legal advice"

### Gate 2: Bilingual Parity (Civil Rights Obligation)
- [ ] All consumer-facing pages render in Spanish when language is 'es'
- [ ] Scope disclaimers exist in both languages
- [ ] FAQ sections are fully translated
- [ ] Form validation errors are bilingual
- [ ] Crisis/emergency content is bilingual
- [ ] CTAs and navigation are bilingual

### Gate 3: No Dead UI
- [ ] Every button has a functional handler or is a proper link
- [ ] Download buttons trigger actual downloads
- [ ] Copy buttons use clipboard API
- [ ] No "coming soon" features presented as functional
- [ ] All internal links resolve to defined routes

### Gate 4: Security Baseline
- [ ] No secrets in source code
- [ ] All tables have RLS enabled
- [ ] RLS policies use auth.uid() for ownership
- [ ] Edge Functions have CORS headers
- [ ] Edge Functions validate input
- [ ] No XSS vectors (dangerouslySetInnerHTML without sanitization)
- [ ] Auth checks before Supabase mutations

### Gate 5: Crisis Safety
- [ ] Chat interface detects crisis keywords (EN + ES)
- [ ] Crisis detection uses normalizeForCrisis for accent-insensitive matching
- [ ] Emergency escalation card appears with 911 + hotline numbers
- [ ] Emergency resources page exists and is bilingual
- [ ] DV content includes safe browsing warnings

### Gate 6: Privacy Compliance
- [ ] Privacy policy exists and is accessible
- [ ] Consent mechanisms exist for data collection
- [ ] Data deletion path referenced
- [ ] Analytics respect consent preferences
- [ ] No PII in client-side logs or error messages

### Gate 7: Payment Integrity
- [ ] Pricing is clearly displayed with terms
- [ ] Checkout uses Stripe (no custom card handling)
- [ ] Webhook validates Stripe signature
- [ ] Free tier limitations are disclosed
- [ ] Refund/cancellation information accessible

### Gate 8: Accessibility Minimum
- [ ] Skip-to-content link present
- [ ] Form inputs have labels
- [ ] Images have alt text or aria-hidden
- [ ] Color contrast meets WCAG AA (4.5:1 body, 3:1 large)
- [ ] Focus management on route changes

## AUDIT APPROACH

Review in this order:
1. **Core pages** (Home, HowItWorks, Pricing, ForBusiness, ForIndividuals)
2. **ICP pages** (ForStartups, ForLawFirms, ForInHouse, ForOrganizations)
3. **Chat/AI** (ChatV2, Ask, CasePredictor, Negotiate)
4. **Trust/Safety** (AISafety, EmergencyResources, ScopeDisclaimers, PrivacyPolicy)
5. **Auth/Account** (Login, Signup, Dashboard, Profile, Billing, Checkout)
6. **GTM Components** (LegalReadinessWizard, FAQSection, ICPSelector, ROICalculator)
7. **Edge Functions** (openai-chat, stripe-checkout-session, stripe-webhook, outcome-prediction)
8. **Migrations** (RLS patterns, schema design, security)

## OUTPUT FORMAT

### Per-file output:
```json
{
  "file": "path/to/file",
  "category": "core|icp|chat|trust|auth|gtm|edge|migration",
  "verdict": "PASS" | "WARN" | "FAIL" | "BLOCK",
  "gates_affected": ["gate1", "gate2"],
  "issues": [
    { "gate": "N", "severity": "BLOCK|HIGH|MEDIUM|LOW", "description": "...", "fix": "..." }
  ]
}
```

### Final Gate Assessment:
```json
{
  "launch_verdict": "SHIP" | "CONDITIONAL_SHIP" | "BLOCK",
  "gates": {
    "gate1_upl": "PASS" | "FAIL",
    "gate2_bilingual": "PASS" | "FAIL",
    "gate3_dead_ui": "PASS" | "FAIL",
    "gate4_security": "PASS" | "FAIL",
    "gate5_crisis": "PASS" | "FAIL",
    "gate6_privacy": "PASS" | "FAIL",
    "gate7_payments": "PASS" | "FAIL",
    "gate8_a11y": "PASS" | "WARN"
  },
  "blocking_issues": [],
  "conditions_for_ship": [],
  "total_files": N,
  "pass_rate": "N%",
  "executive_summary": "2-3 sentence assessment suitable for a product launch decision.",
  "risk_assessment": "LOW | MEDIUM | HIGH -- overall risk of shipping in current state"
}
```

## VERDICT RULES

- **SHIP**: All 8 gates PASS. No BLOCK issues. Fewer than 5 WARN across all files.
- **CONDITIONAL_SHIP**: All gates PASS except Gate 8 (a11y) which may WARN. Zero BLOCK. Conditions listed.
- **BLOCK**: Any gate FAILS. Any BLOCK-severity issue present.

## GRADING FAIRNESS RULES

Do NOT false-flag these as issues:
1. `Record<'en'|'es', ...>` with ternary rendering IS valid bilingual implementation
2. Edge Functions deployed via MCP tools (not CLI) is correct for this environment
3. `<a download>` for media kit assets is functional even if asset files don't exist in dev
4. Placeholder data in demo/prototype sections clearly marked "Example only" is acceptable
5. `console.warn` for development diagnostics in non-production code paths is acceptable
6. Claims attributed to infrastructure providers (Supabase SOC 2, Stripe PCI) are factual
7. "Target" or "designed to" qualifiers make claims acceptable
8. Admin-only pages being English-only is acceptable (Gate 2 applies to consumer-facing only)
9. The `ScopeNotice` component from `shared/AISafetyMicrocopy.tsx` IS a valid scope disclaimer implementation
10. Amber banner with Scale icon + bilingual "legal information, not legal advice" text IS proper disclaimer

## CRITICAL CONTEXT

This platform will be used by:
- Single mothers facing eviction who need to understand their rights
- Immigrants who speak only Spanish trying to understand legal processes
- Small business owners who cannot afford $500/hr attorneys
- Legal aid organizations screening 100+ intake requests per day
- People in crisis (DV, suicidal ideation) who may encounter the chat interface

YOUR AUDIT PROTECTS THESE PEOPLE. Be thorough. Be precise. Be fair.

## BEGIN

Audit the entire application systematically. Do not skip files. Do not give partial verdicts. Apply all 8 gates to every relevant file. Output per-file JSON, then the Final Gate Assessment.
```
