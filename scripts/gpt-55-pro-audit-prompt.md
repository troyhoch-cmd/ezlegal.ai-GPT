# GPT-5.5 Pro Full-Stack Audit Prompt -- ezLegal.ai (June 2026)

> **How to use:** Export the codebase bundle with `node scripts/export-for-gpt-review.cjs`, then upload the resulting files to your GPT session. Paste the prompt below. For partial audits, upload only the relevant section files from `review-export/`.

---

## Prompt

```
You are conducting a PRODUCTION LAUNCH readiness audit of ezLegal.ai -- an AI-powered legal information platform serving consumers, SMBs, and organizations who cannot afford traditional legal counsel. The platform is bilingual (English/Spanish) and serves vulnerable populations including immigrants, low-income individuals, and non-English speakers.

## Your Role

You are a senior full-stack auditor with 20 years of combined expertise in:
1. Legal technology compliance (UPL avoidance, scope disclaimers, advertising ethics)
2. Front-end engineering (React 18, TypeScript, Tailwind CSS, accessibility/WCAG 2.1 AA)
3. Back-end security (Supabase/PostgreSQL, RLS policies, Edge Functions, API security)
4. Internationalization (bilingual EN/ES parity as a civil rights obligation)
5. AI safety (hallucination guardrails, crisis detection, human escalation)
6. Privacy and data governance (consent management, data minimization, CCPA/GDPR awareness)

## Platform Architecture

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + React Router v7
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Storage + RLS)
- **AI Integration:** OpenAI API via Edge Functions (openai-chat, legalbreeze-rag, outcome-prediction)
- **Auth:** Supabase email/password (no magic links, no social)
- **Payments:** Stripe (checkout sessions + webhooks via Edge Functions)
- **Hosting:** Netlify with SPA redirects
- **State:** React Context (LanguageContext, AuthContext, PersonaContext, DemoContext)

## AUDIT DIMENSIONS (apply to every file reviewed)

---

### 1. UNAUTHORIZED PRACTICE OF LAW (UPL) -- SEVERITY: CRITICAL

**Automatic BLOCK if any of these appear:**
- "legal advice" offered or implied (except in disclaimers saying "we do NOT provide legal advice")
- "attorney-client relationship" created or implied
- "reviewed by licensed attorneys" or "attorney-reviewed" (unless provably true with named attorneys)
- Specific outcome guarantees ("win your case", "guaranteed result", "you will receive")
- Personalized legal recommendations without disclaimer ("you should file...", "your best option is...")

**Required on every page with legal content:**
- Scope disclaimer: "This is legal information, not legal advice"
- No attorney-client relationship language
- Escalation path to licensed attorney when appropriate

**Acceptable language:**
- "legal information", "legal guidance", "legal workflow automation"
- "structured templates", "designed for common legal workflows"
- "educational purposes", "informational purposes"
- "consult a licensed attorney for advice specific to your situation"

---

### 2. BILINGUAL PARITY (EN/ES) -- SEVERITY: CRITICAL

**Automatic BLOCK if:**
- Any user-facing page lacks Spanish translation when the page uses `useLanguage()`
- Spanish copy is materially weaker, shorter, or missing sections vs. English
- CTA buttons, error messages, or form labels are English-only on bilingual pages
- Scope disclaimers exist in EN but not ES

**Required patterns:**
- `const { language } = useLanguage();` on all consumer-facing pages
- `const lang = language === 'es' ? 'es' : 'en' as const;` (preferred narrowing)
- OR `const en = language === 'en';` with ternary rendering
- Record<'en' | 'es', ...> data structures for static content arrays
- FAQ, use cases, wizard steps, form validation errors all translated

**Exempt pages (English-only is acceptable):**
- Internal admin dashboards (Admin.tsx, AdminAuditLog.tsx, AdminOverview.tsx)
- Developer tools (RouteAudit.tsx, SiteAudit.tsx, DesignSystem.tsx, QADashboard.tsx)
- Partner-only dashboards (PartnerDashboard.tsx, GrantReporting.tsx)

---

### 3. DEAD UI / NON-FUNCTIONAL ELEMENTS -- SEVERITY: HIGH

**BLOCK if:**
- `<button>` elements without `onClick` handlers or meaningful action
- Download buttons that don't trigger actual downloads
- Copy buttons that don't use clipboard API
- Forms that submit to nowhere / have no handler
- Links to non-existent routes (verify against src/App.tsx route definitions)

**WARN if:**
- Buttons with only `console.log` handlers in production code
- "Coming soon" features presented as functional

---

### 4. SECURITY -- SEVERITY: CRITICAL

**Automatic BLOCK if:**
- Hardcoded API keys, secrets, or tokens in source code
- `dangerouslySetInnerHTML` without DOMPurify or equivalent sanitization
- Supabase calls without auth checks on protected operations
- SQL injection vectors (raw string interpolation in queries)
- XSS vectors (user input rendered without escaping)
- Missing RLS policies on tables containing user data
- Edge Functions without CORS headers
- Edge Functions that expose service_role_key to client

**WARN if:**
- Error messages expose internal implementation details
- Console.log statements with sensitive data
- Missing rate limiting on public endpoints
- Auth state checked client-side only (no server-side verification)

---

### 5. UNVERIFIED CLAIMS -- SEVERITY: HIGH

**BLOCK if:**
- Statistics without attribution ("98% accuracy", "10,000+ users served")
- Time claims without basis ("answers in seconds", "setup in 30 minutes")
- Implied partnerships or endorsements without evidence
- "AI-powered" claims that overstate actual capabilities
- Testimonials or case studies that aren't clearly marked as fictional/demo

**Acceptable:**
- Claims marked "based on internal testing" or "simulated data for demonstration"
- Statistics with clear source attribution
- Features described with "designed to" or "intended to" hedging

---

### 6. CRISIS SAFETY -- SEVERITY: CRITICAL

**BLOCK if:**
- Chat/AI interfaces lack crisis detection (suicide, DV, emergency keywords)
- Crisis detection doesn't use `normalizeForCrisis()` for accent-insensitive Spanish matching
- No 911/emergency escalation path when crisis is detected
- Crisis resources missing Spanish translations
- DV safety information missing "safe browsing" warnings

**Required in chat interfaces:**
- Import and use `normalizeForCrisis` from text-utils
- `detectCrisisSignal(normalizeForCrisis(message))` pattern
- Immediate escalation card with 911, National DV Hotline, Crisis Text Line
- Emergency resources available in both EN and ES

---

### 7. ACCESSIBILITY (WCAG 2.1 AA) -- SEVERITY: HIGH

**BLOCK if:**
- Images without alt text (or aria-hidden for decorative)
- Form inputs without associated labels
- Color contrast below 4.5:1 for body text, 3:1 for large text
- No skip-to-main-content link
- Modal dialogs without focus trap
- Dynamic content changes without ARIA live regions

**WARN if:**
- Missing landmark roles on major sections
- Tab order doesn't follow visual order
- Touch targets below 44x44px on mobile
- Missing aria-expanded on collapsible sections

---

### 8. REACT / TYPESCRIPT QUALITY -- SEVERITY: MEDIUM

**WARN if:**
- Unused imports or dead code
- Missing TypeScript types (any usage)
- Effects without cleanup (potential memory leaks)
- Missing key props on mapped elements
- Prop drilling beyond 3 levels (should use context)
- Components exceeding 400 lines without extraction

---

### 9. SUPABASE / BACKEND -- SEVERITY: CRITICAL

**Review migrations for:**
- Every table has `ENABLE ROW LEVEL SECURITY`
- Policies use `auth.uid()` not `current_user`
- No `USING (true)` on sensitive tables (defeats RLS)
- Foreign key indexes present for query performance
- No destructive operations (DROP COLUMN, DELETE FROM without WHERE)

**Review Edge Functions for:**
- CORS headers on every response (including errors and OPTIONS)
- Input validation on request body
- Service role key usage only server-side
- Error responses don't leak internal details
- Rate limiting or abuse prevention

---

### 10. PRIVACY & DATA GOVERNANCE -- SEVERITY: HIGH

**BLOCK if:**
- PII collected without consent disclosure
- Analytics tracking without consent mechanism
- User data shared with third parties without disclosure
- No data deletion mechanism referenced
- Chat messages stored without encryption disclosure

**WARN if:**
- Excessive data collection for stated purpose
- Missing data retention policies
- No privacy policy link from data collection points

---

### 11. CONVERSION INTEGRITY -- SEVERITY: MEDIUM

**WARN if:**
- Pricing displayed without clear terms
- Free tier limitations not disclosed upfront
- Upsell pressure uses dark patterns (countdown timers, fake scarcity)
- Checkout flow lacks cancellation/refund information
- Demo mode not clearly distinguished from production features

---

## OUTPUT FORMAT

For each file or functional area reviewed, output:

```json
{
  "file": "src/pages/PageName.tsx",
  "verdict": "PASS" | "WARN" | "FAIL" | "BLOCK",
  "checks": {
    "upl_compliance": "PASS" | "FAIL" | "N/A",
    "bilingual_parity": "PASS" | "FAIL" | "EXEMPT",
    "dead_ui": "PASS" | "FAIL",
    "security": "PASS" | "FAIL" | "WARN",
    "unverified_claims": "PASS" | "FAIL" | "WARN",
    "crisis_safety": "PASS" | "FAIL" | "N/A",
    "accessibility": "PASS" | "WARN" | "FAIL",
    "code_quality": "PASS" | "WARN",
    "privacy": "PASS" | "WARN" | "FAIL",
    "scope_disclaimer": "PASS" | "FAIL" | "N/A"
  },
  "issues": [
    { "severity": "BLOCK|HIGH|MEDIUM|LOW", "description": "...", "line": N }
  ],
  "recommendations": ["..."]
}
```

---

## FINAL SUMMARY (required at end)

```json
{
  "overall_verdict": "SHIP" | "FIX_THEN_SHIP" | "BLOCK",
  "total_files_reviewed": N,
  "verdicts": { "PASS": N, "WARN": N, "FAIL": N, "BLOCK": N },
  "blocking_issues": [
    { "file": "...", "issue": "...", "fix": "..." }
  ],
  "high_priority_fixes": [
    { "file": "...", "issue": "...", "fix": "..." }
  ],
  "positive_findings": ["..."],
  "architecture_notes": "...",
  "launch_recommendation": "One paragraph final assessment with specific conditions for SHIP if conditional."
}
```

---

## VERDICT CRITERIA

- **SHIP:** Zero BLOCK issues. Fewer than 3 HIGH issues. All consumer-facing pages have bilingual parity and scope disclaimers.
- **FIX_THEN_SHIP:** Zero BLOCK issues but 3+ HIGH issues that can be fixed in <1 day. No UPL violations.
- **BLOCK:** Any BLOCK-severity issue present. UPL violations. Missing crisis safety in chat. Security vulnerabilities exposing user data.

---

## CRITICAL CONTEXT

1. This platform serves VULNERABLE POPULATIONS. Errors are not just bugs -- they can cause real harm (missed court dates, immigration consequences, DV escalation).
2. UPL violations can result in criminal prosecution in most US states. This is the #1 legal risk.
3. Bilingual parity is not a "nice to have" -- the target audience includes monolingual Spanish speakers who deserve equal access to information.
4. The platform DOES NOT replace lawyers. It organizes facts, generates informational documents, and routes to licensed attorneys. Every page must reflect this.
5. "ezLegal.ai" is a legal INFORMATION and WORKFLOW platform. It is NOT a law firm. It does NOT provide legal advice.
6. Edge Functions use Deno runtime. They proxy OpenAI calls so API keys never reach the client.
7. The `normalizeForCrisis` function strips Unicode combining characters so "auxilio" matches whether typed with or without accent marks -- critical for crisis detection in Spanish.
8. The platform uses Supabase Auth with email/password only. No social login. No magic links. Email confirmation is OFF.

## BEGIN

Review ALL provided files systematically. Do NOT skip any file. Do NOT give partial reviews. For each file, apply ALL 11 audit dimensions. Output structured JSON for each file, then the Final Summary. Be thorough, be specific, cite line numbers when possible.

If a file PASSES all checks, still output the JSON block with "PASS" -- do not silently skip passing files.
```
