# GPT-5.5 Audit Prompts for ezLegal.ai

Use these prompts sequentially after uploading the review-export files.

---

## Pass 1: Security Audit

Upload: `01-architecture.md`, `07-services.md`, `08-lib-core.md`, `10-edge-functions.md`, `11-migrations-1.md`, `12-migrations-2.md`

**Prompt:**
```
You are a senior security engineer auditing a legal-tech SaaS application. Review the uploaded code for:

1. Authentication & Authorization: Are auth flows secure? Any bypasses?
2. RLS Policies: Are all tables locked down? Any always-true policies or missing ownership checks?
3. Edge Functions: Are CORS headers correct? Any secrets exposed? Input validation gaps?
4. SQL Injection: Any raw SQL built from user input?
5. XSS: Any dangerouslySetInnerHTML or unescaped user content?
6. IDOR: Can users access other users' data?
7. Rate Limiting: Are expensive operations rate-limited?
8. Secrets: Any hardcoded keys, tokens, or credentials?

For each issue found, provide:
- Severity (Critical/High/Medium/Low)
- File and line reference
- Description of the vulnerability
- Recommended fix

Format as a structured security report.
```

---

## Pass 2: Performance & Architecture

Upload: `01-architecture.md`, `02-pages-core.md`, `07-services.md`, `08-lib-core.md`

**Prompt:**
```
You are a senior frontend architect reviewing a React + Vite + Supabase application. Analyze for:

1. Bundle Size: Are there unnecessary dependencies? Missing code splitting?
2. Re-renders: Any components that re-render excessively?
3. Data Fetching: N+1 queries? Missing caching? Waterfall requests?
4. Lazy Loading: Are heavy pages and components lazy-loaded?
5. State Management: Prop drilling? Context overuse causing cascading renders?
6. Memory Leaks: Uncleared intervals, listeners, or subscriptions?
7. Database: Missing indexes? Inefficient queries?

Provide a prioritized list of performance improvements with estimated impact.
```

---

## Pass 3: UX & Accessibility

Upload: `02-pages-core.md`, `04-components-ui.md`, `05-components-chat.md`, `06-components-trust.md`

**Prompt:**
```
You are a UX expert specializing in legal-tech applications for vulnerable populations. Audit for:

1. Cognitive Overload: Too many choices per screen? Dense text? Unclear hierarchy?
2. Accessibility: Missing aria labels? Keyboard navigation gaps? Contrast issues?
3. Mobile UX: Touch targets < 44px? Scrollable areas that trap focus? Modals that overflow?
4. Plain Language: Legal jargon without tooltips? Reading level above 8th grade?
5. Spanish Parity: Are all user-facing strings translated? Any English-only CTAs?
6. Trust Signals: Is "not legal advice" visible without being overwhelming?
7. Crisis Pathways: Can a user in danger reach help within 1 tap from any screen?

Rate each component on a 1-5 accessibility scale and flag critical issues.
```

---

## Pass 4: Legal & Ethical AI Compliance

Upload: `05-components-chat.md`, `06-components-trust.md`, `09-lib-safety.md`, `14-data.md`

**Prompt:**
```
You are a legal-tech compliance officer reviewing an AI-powered legal information platform. Evaluate:

1. Unauthorized Practice of Law (UPL): Does any feature cross from information to advice?
2. Disclaimers: Is "not legal advice / no attorney-client relationship" shown at every decision point?
3. Jurisdiction Handling: Can the system give state-specific info without confirming the state?
4. Crisis Safety: Are domestic violence, self-harm, and imminent danger properly escalated?
5. Data Minimization: Is sensitive data (SSN, bank info) blocked or warned about?
6. Source Transparency: Are AI responses marked as AI-generated? Are sources cited?
7. Human Escalation: Can users always reach a human? Is the path clear?
8. Bias & Fairness: Any patterns that could disadvantage protected classes?

Flag any compliance risks with severity and remediation steps.
```

---

## Pass 5: Code Quality & Maintainability

Upload: `02-pages-core.md`, `03-pages-features.md`, `07-services.md`, `08-lib-core.md`

**Prompt:**
```
You are a staff engineer conducting a code quality review. Evaluate:

1. DRY: Duplicated logic that should be extracted?
2. Type Safety: Any `any` types? Missing error types? Unsafe casts?
3. Error Handling: Silent catches? Missing user feedback on errors?
4. Naming: Inconsistent conventions? Unclear variable/function names?
5. Dead Code: Unused imports, unreachable branches, commented-out code?
6. Testing: Are critical paths covered? What's missing?
7. Documentation: Are complex algorithms or business rules explained?

Provide actionable refactoring suggestions prioritized by impact.
```

---

## Pass 6: Full Comprehensive Audit (if using Projects/long context)

Upload all 14 files.

**Prompt:**
```
You are the CTO of a legal-tech startup reviewing the complete codebase before launch. Provide a comprehensive audit covering:

1. Launch Readiness: Is this production-ready? What's blocking launch?
2. Security: Top 5 security risks
3. Performance: Top 5 performance bottlenecks
4. UX: Top 5 usability issues for non-technical users
5. Legal Compliance: Top 5 regulatory risks
6. Technical Debt: Top 5 code quality issues
7. Missing Features: What's expected but missing for a legal-tech platform?

For each item, provide severity, location, description, and recommended fix.
End with a Go/No-Go recommendation and a prioritized 2-week action plan.
```
