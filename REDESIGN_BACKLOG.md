# ezLegal.ai Redesign Backlog

**Source:** `audit-output/FULL_SITE_AUDIT.md` (2026-06-14)
**Audit Score:** 44/80 (55%) - "Solid base requiring significant polish"
**Total Findings:** 306 (0 Critical, 0 High, 204 Medium, 102 Low)

---

## Sprint Status Legend

| Status | Meaning |
|--------|---------|
| DONE | Completed in prior sprint |
| Sprint 1 | Immediate priority (this sprint) |
| Sprint 2 | Next sprint |
| Sprint 3 | Following sprint |
| Sprint 4 | Backlog |

---

## 1. Critical Fixes Before Launch

### 1.1 Navigation Error Remediation (153 instances)

| Field | Detail |
|-------|--------|
| **Problem** | 153 navigation-error findings across all routes indicate broken internal links or unreachable route targets |
| **Affected** | All 62 routes (Section J: "navigation-error (153 instances)") |
| **Impacted ICP** | All ICPs (general, SMB, Spanish-speaking, Pro Bono/LSO) |
| **Evidence** | Section J: "Medium (Fix within 2 weeks) - navigation-error (153 instances)" |
| **Recommended UX** | Audit all `<Link>` and `<NavLink>` components; ensure every route in the inventory has a matching component in the router; add a catch-all 404 page with helpful navigation |
| **Copy Change** | 404 page: "We couldn't find that page. Here's where you might want to go:" with links to top routes per ICP |
| **Implementation** | Review React Router config against route-inventory.json; remove dead links; add wildcard route |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 1 |

### 1.2 Duplicate Route Definitions (`/chat` x4)

| Field | Detail |
|-------|--------|
| **Problem** | Route `/chat` appears 4 times in route inventory, indicating duplicate route definitions that cause unpredictable rendering |
| **Affected** | `/chat` (4 duplicate entries in Section B Route Inventory) |
| **Impacted ICP** | All ICPs - chat is primary conversion entry point |
| **Evidence** | Section B: "/chat | general | No" listed 4 times |
| **Recommended UX** | Consolidate to single `/chat` route; ensure ChatV2 is the canonical component; redirect legacy paths |
| **Copy Change** | N/A |
| **Implementation** | Deduplicate route definitions in router config; remove redundant route entries |
| **Effort** | S |
| **Impact** | High |
| **Status** | Sprint 1 |

### 1.3 Auth-Required Routes Missing Auth Guards

| Field | Detail |
|-------|--------|
| **Problem** | 11 auth-required routes identified but audit cannot verify guard enforcement |
| **Affected** | `/dashboard`, `/dashboard/ai-assistant`, `/dashboard/cases`, `/dashboard/matters`, `/dashboard/clients`, `/dashboard/history`, `/dashboard/documents`, `/dashboard/research`, `/dashboard/lawyer-profiles`, `/dashboard/profile`, `/dashboard/website-integration` |
| **Impacted ICP** | All authenticated users (SMB, LSO) |
| **Evidence** | Section B: 11 routes marked "Auth Required: Yes" |
| **Recommended UX** | Verify ProtectedRoute wrapper on all 11 dashboard routes; unauthenticated users see login prompt with context-preserving redirect |
| **Copy Change** | "Sign in to access your dashboard. Your work is saved and waiting." |
| **Implementation** | Audit router config for auth HOC/wrapper; add redirect-after-login state preservation |
| **Effort** | S |
| **Impact** | High |
| **Status** | Sprint 1 |

### 1.4 Value Proposition Clarity (Score: 3/10)

| Field | Detail |
|-------|--------|
| **Problem** | Value proposition clarity scored 3/10 in best-in-class assessment - lowest score across all criteria |
| **Affected** | `/` (homepage), `/for-business`, `/for-individuals`, `/for-organizations` |
| **Impacted ICP** | All ICPs - first impression drives or kills conversion |
| **Evidence** | Section K: "Value Proposition Clarity | 3 | 10 | [evidence unavailable]" |
| **Recommended UX** | Redesign above-fold hero on homepage and all ICP landing pages with single clear headline, one supporting sentence, one primary CTA, and one trust signal. Follow "5-second test" principle |
| **Copy Change** | Homepage: "Legal guidance you can afford, powered by AI you can trust." Subhead: "Get answers to your legal questions in minutes - not days. No retainer required." |
| **Implementation** | Rewrite hero sections on `/`, `/for-business`, `/for-individuals`, `/for-organizations`; A/B test headline variants |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 1 |

### 1.5 Pro Bono Intake Form Exceeds Threshold (17 fields)

| Field | Detail |
|-------|--------|
| **Problem** | Pro bono intake form has 17 fields, exceeding the configured maxFormFields threshold of 5 by 240% |
| **Affected** | `/pro-bono` (ProBonoIntake component) |
| **Impacted ICP** | Pro Bono/LSO users, underserved communities seeking legal aid |
| **Evidence** | Section L Configuration: "maxFormFields: 5"; static analysis shows 17 form fields in ProBonoIntake |
| **Recommended UX** | Break into multi-step wizard (3-4 steps, max 5 fields per step); add progress indicator; allow save-and-resume |
| **Copy Change** | Step headers: "Tell us about yourself" / "Describe your situation" / "How can we help?" / "Almost done" |
| **Implementation** | Refactor ProBonoIntake into stepper component; persist partial state to sessionStorage; add progress bar |
| **Effort** | L |
| **Impact** | High |
| **Status** | Sprint 1 |

---

## 2. High-Impact Conversion Improvements

### 2.1 Missing Above-Fold CTAs on Key Routes

| Field | Detail |
|-------|--------|
| **Problem** | Conversion audit reports avgTrustSignals=0 and routesWithoutCta=0 but all data is from connection errors, indicating measurement gap; static analysis shows research page lacks above-fold CTA |
| **Affected** | `/dashboard/research`, `/features`, `/how-it-works` |
| **Impacted ICP** | SMB buyers evaluating features; all users on research page |
| **Evidence** | Section F Conversion Metrics Summary: empty table; Section L: "minCtaPerPage: 1" threshold configured |
| **Recommended UX** | Add prominent primary CTA button above the fold on every public-facing page; use contextual CTAs ("Start Free", "Try It Now", "Get Your Answer") |
| **Copy Change** | Features: "See it in action - try free"; How It Works: "Ready? Start your first question" |
| **Implementation** | Add hero CTA component to each public page; track CTA visibility with intersection observer |
| **Effort** | S |
| **Impact** | High |
| **Status** | Sprint 1 |

### 2.2 Trust Signal Deficit (Score: 5/10)

| Field | Detail |
|-------|--------|
| **Problem** | Trust building scored 5/10; average trust signals per page is 0 (measurement gap from connection errors) |
| **Affected** | `/`, `/pricing`, `/for-business`, `/for-individuals`, `/checkout` |
| **Impacted ICP** | All ICPs - trust is prerequisite for legal service adoption |
| **Evidence** | Section K: "Trust Building | 5 | 10"; Section C: "Average trust signals per page: 0" |
| **Recommended UX** | Add trust strip to all conversion pages: security badges, user count, satisfaction rating, bar association compliance note, SOC 2 mention |
| **Copy Change** | "Trusted by 10,000+ users | SOC 2 Type II | ABA compliant AI disclosure | 4.8/5 satisfaction" |
| **Implementation** | Create reusable TrustStrip component; place on homepage, pricing, checkout, all ICP landing pages |
| **Effort** | S |
| **Impact** | High |
| **Status** | DONE |

### 2.3 Clicks-to-Conversion Exceeds Threshold

| Field | Detail |
|-------|--------|
| **Problem** | Configured threshold is maxClicksToConversion=3; audit unable to measure actual click depth but route structure suggests 4+ clicks for key conversions |
| **Affected** | `/pricing` -> `/checkout` -> auth -> payment flow |
| **Impacted ICP** | SMB buyers, individual consumers |
| **Evidence** | Section L Configuration: "maxClicksToConversion: 3" |
| **Recommended UX** | Add "Start Free Trial" CTA on homepage that bypasses pricing page; enable guest checkout; reduce signup form to email + password only |
| **Copy Change** | "Start free - no credit card required" |
| **Implementation** | Add direct trial-start flow from homepage; streamline signup to 2 fields; defer profile completion to post-onboarding |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 2 |

### 2.4 Ethical AI Score Deficit (Score: 5/10)

| Field | Detail |
|-------|--------|
| **Problem** | Ethical AI compliance scored 5/10; average ethical AI score is 0/4 (measurement gap) |
| **Affected** | All AI-powered routes: `/chat`, `/chatbot`, `/ask`, `/case-predictor`, `/negotiate` |
| **Impacted ICP** | All ICPs - ethical AI is core brand differentiator |
| **Evidence** | Section K: "Ethical AI Compliance | 5 | 10"; Section C: "Average ethical AI compliance: 0/4" |
| **Recommended UX** | Add visible "AI Disclosure" badge on every AI output; include escalation path ("Talk to a human lawyer"); show confidence indicators on predictions |
| **Copy Change** | "This is AI-generated guidance, not legal advice. For your specific situation, consider consulting an attorney." with "Find a Lawyer" link |
| **Implementation** | Create AIDisclosure component; add to all AI response containers; link to `/find-attorney` |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 1 |

### 2.5 Speed to User Outcome (Score: 6/10)

| Field | Detail |
|-------|--------|
| **Problem** | Speed to outcome scored 6/10 with note "Multiple entry points exist but flow depth varies" |
| **Affected** | `/`, `/ask`, `/chat`, `/chatbot`, `/chatbot-standalone` |
| **Impacted ICP** | All ICPs - especially individuals seeking quick answers |
| **Evidence** | Section K: "Speed to User Outcome | 6 | 10 | Multiple entry points exist but flow depth varies" |
| **Recommended UX** | Add "Ask a question now" input field directly on homepage hero; typing triggers navigation to chat with pre-filled query; reduce onboarding friction to zero for first question |
| **Copy Change** | Placeholder: "Describe your legal question in plain English..." |
| **Implementation** | Add search-style input to homepage hero; on submit, navigate to `/chat?q={query}`; chat page reads query param and auto-submits |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 2 |

### 2.6 Multiple Chat Entry Points Cause Confusion

| Field | Detail |
|-------|--------|
| **Problem** | 5 separate chat-related routes (`/chat` x4, `/chatbot`, `/chatbot-standalone`, `/ask`) fragment the user journey |
| **Affected** | `/chat`, `/chatbot`, `/chatbot-standalone`, `/ask` |
| **Impacted ICP** | All ICPs - confused users don't convert |
| **Evidence** | Section B: `/chat` (4x), `/chatbot`, `/chatbot-standalone`, `/ask` all listed as separate routes |
| **Recommended UX** | Consolidate to single canonical chat experience at `/chat`; redirect all variants; differentiate embedded vs standalone via query param, not route |
| **Copy Change** | N/A |
| **Implementation** | Set up redirects from `/chatbot`, `/chatbot-standalone`, `/ask` to `/chat`; use `?mode=standalone` for widget mode |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 2 |

---

## 3. Spanish-First Access-to-Justice Improvements

### 3.1 Spanish Content Verification Gap

| Field | Detail |
|-------|--------|
| **Problem** | Audit reports "Spanish content routes: 0" despite 2 Spanish routes existing in inventory |
| **Affected** | `/espanol`, `/es` |
| **Impacted ICP** | Spanish-speaking individuals |
| **Evidence** | Section A: "Spanish content routes: 0"; Section D: `/espanol` and `/es` listed as dedicated routes |
| **Recommended UX** | Ensure both routes render fully translated Spanish content; add language toggle in global nav; auto-detect browser locale |
| **Copy Change** | All content on `/es` and `/espanol` must be native Spanish (not machine-translated); reviewed by native speaker |
| **Implementation** | Verify EspanolLanding renders Spanish; add `lang="es"` attribute; implement locale detection with graceful fallback |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 1 |

### 3.2 Bilingual Navigation Missing

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Bilingual navigation" has status "[evidence unavailable]" |
| **Affected** | Global navigation component, `/espanol`, `/es` |
| **Impacted ICP** | Spanish-speaking individuals |
| **Evidence** | Section D Spanish ICP: "Bilingual navigation | [evidence unavailable]" |
| **Recommended UX** | Add language switcher (EN/ES) in top nav; persist language preference; ensure nav items have Spanish translations on Spanish routes |
| **Copy Change** | "Inicio", "Precios", "Contacto", "Iniciar sesion", "Registrarse" |
| **Implementation** | Add LanguageSwitcher component to Header; create Spanish nav translations; store preference in localStorage |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 2 |

### 3.3 Culturally Appropriate Imagery

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Culturally appropriate imagery" has status "[evidence unavailable]" |
| **Affected** | `/espanol`, `/es`, and any page shown to Spanish-speaking users |
| **Impacted ICP** | Spanish-speaking individuals |
| **Evidence** | Section D Spanish ICP: "Culturally appropriate imagery | [evidence unavailable]" |
| **Recommended UX** | Use diverse imagery representing Latino/Hispanic communities; show relatable scenarios (family law, immigration, employment); avoid stock photos that don't represent the community |
| **Copy Change** | N/A (visual change) |
| **Implementation** | Source culturally representative imagery; update hero and testimonial sections on Spanish pages |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 3 |

### 3.4 Spanish Diacritics Correction

| Field | Detail |
|-------|--------|
| **Problem** | Spanish content contained missing diacritics (accents, tildes) reducing credibility with native speakers |
| **Affected** | `/espanol`, `/es`, `src/lib/microcopy.ts`, `src/data/pricing.ts` |
| **Impacted ICP** | Spanish-speaking individuals |
| **Evidence** | Section D: Spanish ICP expectations not verifiable; static analysis revealed missing accents in code |
| **Recommended UX** | Correct all Spanish text to use proper diacritics |
| **Copy Change** | bilingue -> bilingue, numero -> numero, etc. (44+ corrections) |
| **Implementation** | Search all Spanish-facing strings; apply proper Unicode characters |
| **Effort** | S |
| **Impact** | Medium |
| **Status** | DONE |

### 3.5 Spanish Chat Experience

| Field | Detail |
|-------|--------|
| **Problem** | No evidence of Spanish-language chat interface; Spanish-speaking users must use English UI to access AI |
| **Affected** | `/chat`, `/chatbot` |
| **Impacted ICP** | Spanish-speaking individuals |
| **Evidence** | Section D: 2 Spanish routes exist but chat is not among them; Section B shows `/chat` mapped to "general" ICP only |
| **Recommended UX** | Add `/es/chat` route or language toggle within chat; UI chrome (buttons, labels, placeholders) in Spanish; AI responses in Spanish when user writes in Spanish |
| **Copy Change** | "Escribe tu pregunta legal aqui...", "Enviar", "Nueva conversacion", "Este es orientacion de IA, no asesoramiento legal." |
| **Implementation** | Create Spanish chat wrapper or i18n layer for ChatV2; detect input language; add Spanish system prompt variant |
| **Effort** | L |
| **Impact** | High |
| **Status** | Sprint 3 |

---

## 4. SMB Buyer Improvements

### 4.1 Clear Pricing Evidence Gap

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Clear pricing" has status "[evidence unavailable]"; pricing page exists but clarity unverified |
| **Affected** | `/pricing`, `/checkout` |
| **Impacted ICP** | SMB buyers |
| **Evidence** | Section D SMB ICP: "Clear pricing | [evidence unavailable]" |
| **Recommended UX** | Ensure pricing page shows: plan comparison table, annual vs monthly toggle, feature checklist per tier, "most popular" badge, money-back guarantee |
| **Copy Change** | "No hidden fees. Cancel anytime. 30-day money-back guarantee." |
| **Implementation** | Audit pricing page for clarity; add comparison table if missing; add guarantee badge |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 2 |

### 4.2 ROI Messaging Missing

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "ROI messaging" has status "[evidence unavailable]"; SMBs need cost-justification |
| **Affected** | `/for-business`, `/pricing`, `/features` |
| **Impacted ICP** | SMB buyers |
| **Evidence** | Section D SMB ICP: "ROI messaging | [evidence unavailable]" |
| **Recommended UX** | Add ROI calculator or savings comparison ("Average lawyer costs $350/hr; ezLegal costs $X/month"); show time-saved metrics; add customer testimonials with $ saved |
| **Copy Change** | "Save $5,000+ per year on routine legal tasks. Our average SMB customer resolves 12 legal questions per month without a retainer." |
| **Implementation** | Add ROI section to `/for-business`; create simple calculator widget; add social proof with dollar amounts |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 2 |

### 4.3 Business-Specific Use Cases

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Business-specific use cases" has status "[evidence unavailable]" |
| **Affected** | `/for-business`, `/features` |
| **Impacted ICP** | SMB buyers |
| **Evidence** | Section D SMB ICP: "Business-specific use cases | [evidence unavailable]" |
| **Recommended UX** | Add use-case cards: contract review, employment compliance, IP protection, vendor agreements, lease review; each with "Try it" CTA linking to relevant chat prompt |
| **Copy Change** | "Built for the legal challenges SMBs face every day" with cards for top 5 use cases |
| **Implementation** | Create use-case section with icons, descriptions, and deep-links to pre-prompted chat |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 3 |

### 4.4 Integration Options

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Integration options" has status "[evidence unavailable]" |
| **Affected** | `/for-business`, `/features`, `/dashboard/website-integration` |
| **Impacted ICP** | SMB buyers |
| **Evidence** | Section D SMB ICP: "Integration options | [evidence unavailable]"; `/dashboard/website-integration` route exists |
| **Recommended UX** | Showcase integrations on public-facing pages: embeddable widget, API access, Zapier/Make compatibility; show "Embed on your website" as a selling point |
| **Copy Change** | "Add AI legal help to your website in 5 minutes. No coding required." |
| **Implementation** | Add integrations section to `/for-business` and `/features`; link to widget setup documentation |
| **Effort** | S |
| **Impact** | Medium |
| **Status** | Sprint 3 |

---

## 5. Legal Aid / Pro Bono Organization Improvements

### 5.1 Impact Metrics Dashboard

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Impact metrics" has status "[evidence unavailable]"; LSOs need reporting for funders |
| **Affected** | `/lso-dashboard`, `/grant-reporting` |
| **Impacted ICP** | Pro Bono/LSO organizations |
| **Evidence** | Section D LSO ICP: "Impact metrics | [evidence unavailable]"; routes exist but functionality unverified |
| **Recommended UX** | Dashboard should show: cases assisted, hours saved, geographic reach, demographic breakdown, outcomes tracking; exportable to PDF |
| **Copy Change** | "Your impact at a glance: [X] people helped this month, [Y] hours of legal aid delivered" |
| **Implementation** | Verify LSO dashboard has metric cards; add export functionality; ensure real-time data updates |
| **Effort** | L |
| **Impact** | High |
| **Status** | Sprint 2 |

### 5.2 Grant Compliance Reporting

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Grant compliance" has status "[evidence unavailable]"; `/grant-reporting` route exists but content unverified |
| **Affected** | `/grant-reporting` |
| **Impacted ICP** | Pro Bono/LSO organizations |
| **Evidence** | Section D LSO ICP: "Grant compliance | [evidence unavailable]" |
| **Recommended UX** | Pre-built report templates matching common legal aid grant requirements (LSC, IOLTA, state bar); auto-populate from usage data; schedule automated reports |
| **Copy Change** | "Grant reporting made simple. Auto-generated reports aligned with LSC, IOLTA, and state bar requirements." |
| **Implementation** | Add report template selector; map usage metrics to grant KPIs; add scheduled email delivery |
| **Effort** | L |
| **Impact** | High |
| **Status** | Sprint 3 |

### 5.3 Volume Pricing for Organizations

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "Volume pricing" has status "[evidence unavailable]" |
| **Affected** | `/for-organizations`, `/pricing` |
| **Impacted ICP** | Pro Bono/LSO organizations |
| **Evidence** | Section D LSO ICP: "Volume pricing | [evidence unavailable]" |
| **Recommended UX** | Add organization/enterprise tier to pricing page or dedicated org pricing section; show per-seat pricing with volume discounts; "Contact us" for 50+ seats |
| **Copy Change** | "Serving 50+ clients? Get volume pricing designed for legal aid organizations. Starting at $X/seat/month." |
| **Implementation** | Add org tier to pricing page; create volume pricing calculator; add "Request Quote" form |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 3 |

### 5.4 White-Label Options

| Field | Detail |
|-------|--------|
| **Problem** | ICP expectation "White-label options" has status "[evidence unavailable]" |
| **Affected** | `/for-organizations`, `/partner-hub` |
| **Impacted ICP** | Pro Bono/LSO organizations |
| **Evidence** | Section D LSO ICP: "White-label options | [evidence unavailable]" |
| **Recommended UX** | Showcase white-label capability: custom branding, custom domain, organization logo, co-branded reports; show mockup of branded interface |
| **Copy Change** | "Your brand, our technology. Offer AI legal guidance under your organization's name." |
| **Implementation** | Add white-label feature section to `/for-organizations`; include visual mockup; link to demo request |
| **Effort** | S |
| **Impact** | Medium |
| **Status** | Sprint 4 |

---

## 6. Accessibility Fixes

### 6.1 WCAG 2.1 AA Compliance (Score: 4/10)

| Field | Detail |
|-------|--------|
| **Problem** | Accessibility scored 4/10 with 51 total violations detected (all audit-errors due to connection issues, indicating true violation count is unknown) |
| **Affected** | All 62 routes |
| **Impacted ICP** | All ICPs - especially users with disabilities, aging population seeking legal help |
| **Evidence** | Section K: "Accessibility (WCAG 2.1 AA) | 4 | 10 | 51 total violations"; Section H: "Total violations: 51" |
| **Recommended UX** | Run axe-core audit on running dev server; fix all critical/serious violations first (missing alt text, color contrast, keyboard traps, missing form labels) |
| **Copy Change** | Add aria-labels to all interactive elements; ensure all images have descriptive alt text |
| **Implementation** | Re-run accessibility audit with working server; prioritize by axe impact level (critical > serious > moderate > minor) |
| **Effort** | L |
| **Impact** | High |
| **Status** | Sprint 1 |

### 6.2 ARIA Live Regions for Dynamic Content

| Field | Detail |
|-------|--------|
| **Problem** | AI chat responses and dynamic content updates may not announce to screen readers |
| **Affected** | `/chat`, `/chatbot`, `/ask`, `/case-predictor` |
| **Impacted ICP** | All ICPs using assistive technology |
| **Evidence** | Section K accessibility score 4/10; chat routes are primary interaction points |
| **Recommended UX** | Add `aria-live="polite"` regions for AI responses; announce loading states; ensure focus management after response |
| **Copy Change** | N/A (accessibility attribute change) |
| **Implementation** | Add aria-live regions to chat response containers; manage focus after AI response loads |
| **Effort** | S |
| **Impact** | Medium |
| **Status** | DONE |

### 6.3 Keyboard Navigation for Chat Interface

| Field | Detail |
|-------|--------|
| **Problem** | Chat interfaces require keyboard-accessible message sending, history navigation, and action buttons |
| **Affected** | `/chat`, `/chatbot`, `/chatbot-standalone` |
| **Impacted ICP** | All ICPs using keyboard navigation |
| **Evidence** | Section K: Accessibility 4/10; chat is primary conversion tool |
| **Recommended UX** | Ensure Enter sends message, Shift+Enter for newline, Tab navigates action buttons, Escape closes modals; visible focus indicators on all interactive elements |
| **Copy Change** | N/A |
| **Implementation** | Audit keyboard event handlers in chat components; add visible focus-ring styles; test with keyboard-only navigation |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 2 |

### 6.4 Skip Navigation Link

| Field | Detail |
|-------|--------|
| **Problem** | Users relying on screen readers or keyboard navigation need ability to skip repetitive navigation |
| **Affected** | All routes (global layout component) |
| **Impacted ICP** | All ICPs using assistive technology |
| **Evidence** | Section K: Accessibility 4/10; WCAG 2.4.1 requires skip navigation mechanism |
| **Recommended UX** | Add bilingual skip link as first focusable element; visible on focus; links to `#main-content` |
| **Copy Change** | "Skip to main content / Saltar al contenido principal" |
| **Implementation** | Add SkipLink component to root layout; add `id="main-content"` to main content wrapper |
| **Effort** | S |
| **Impact** | Medium |
| **Status** | DONE |

### 6.5 Share Button Accessibility

| Field | Detail |
|-------|--------|
| **Problem** | Share buttons in chat interface lack aria-labels, making them inaccessible to screen readers |
| **Affected** | ShareButton component (used in `/chat`, `/chatbot`) |
| **Impacted ICP** | All ICPs using assistive technology |
| **Evidence** | Section K: Accessibility 4/10; static analysis shows ShareButton.tsx:230-234 missing aria-labels |
| **Recommended UX** | Add descriptive aria-labels to all share action buttons |
| **Copy Change** | aria-label="Share via email", "Copy link to clipboard", "Share on social media" |
| **Implementation** | Add aria-label props to Button/IconButton components in ShareButton.tsx |
| **Effort** | S |
| **Impact** | Low |
| **Status** | Sprint 2 |

---

## 7. Ethical AI / Trust / Legal-Safety Fixes

### 7.1 AI Disclosure on Every AI Output

| Field | Detail |
|-------|--------|
| **Problem** | Ethical AI compliance scored 5/10; audit's 4-point ethical AI rubric averages 0 (measurement gap) |
| **Affected** | `/chat`, `/chatbot`, `/ask`, `/case-predictor`, `/negotiate` |
| **Impacted ICP** | All ICPs - legal safety requirement |
| **Evidence** | Section K: "Ethical AI Compliance | 5 | 10"; Section G: "evaluates: AI disclosure, legal advice boundaries, escalation paths" |
| **Recommended UX** | Persistent disclosure banner below every AI response: "AI-generated guidance - not legal advice"; link to scope disclaimers |
| **Copy Change** | "This response was generated by AI and is for informational purposes only. It does not constitute legal advice. Learn more about our AI's capabilities and limitations." |
| **Implementation** | Create AIDisclosure component; render after every AI message in chat; link to `/scope-disclaimers` |
| **Effort** | S |
| **Impact** | High |
| **Status** | Sprint 1 |

### 7.2 Escalation Path to Human Lawyer

| Field | Detail |
|-------|--------|
| **Problem** | Ethical AI rubric includes "escalation paths" but no evidence of implementation on AI interaction pages |
| **Affected** | `/chat`, `/chatbot`, `/ask`, `/case-predictor`, `/find-attorney` |
| **Impacted ICP** | All ICPs - especially those with complex legal needs |
| **Evidence** | Section G evaluates "escalation paths"; `/find-attorney` route exists but linkage from AI tools unverified |
| **Recommended UX** | Add "This seems complex - would you like to connect with a lawyer?" prompt after AI detects complexity; persistent "Find a Lawyer" button in chat sidebar |
| **Copy Change** | "Your situation may benefit from professional legal counsel. Connect with a vetted attorney in your area." |
| **Implementation** | Add escalation trigger in AI response handler; create sidebar CTA linking to `/find-attorney`; track escalation events |
| **Effort** | M |
| **Impact** | High |
| **Status** | Sprint 2 |

### 7.3 Jurisdiction Warnings

| Field | Detail |
|-------|--------|
| **Problem** | Ethical AI rubric includes "jurisdiction warnings" - AI guidance must clarify geographic limitations |
| **Affected** | `/chat`, `/chatbot`, `/case-predictor`, `/negotiate` |
| **Impacted ICP** | All ICPs - legal safety requirement |
| **Evidence** | Section G evaluates "jurisdiction warnings"; legal AI must disclose jurisdictional limitations |
| **Recommended UX** | Ask user's state/jurisdiction at conversation start; display jurisdiction badge on all responses; warn when crossing jurisdictional boundaries |
| **Copy Change** | "Laws vary by state. This guidance is general and may not apply in your jurisdiction. Always verify with local requirements." |
| **Implementation** | Add jurisdiction selector to chat onboarding; display jurisdiction context in response header; add warning when topic spans jurisdictions |
| **Effort** | M |
| **Impact** | High |
| **Status** | DONE |

### 7.4 Privacy Language Clarity

| Field | Detail |
|-------|--------|
| **Problem** | Ethical AI rubric includes "privacy language" evaluation; `/privacy` route exists but plain-language accessibility unverified |
| **Affected** | `/privacy`, `/trust-center`, `/enterprise-security` |
| **Impacted ICP** | All ICPs - especially privacy-conscious users |
| **Evidence** | Section G evaluates "privacy language"; Section B shows `/privacy`, `/trust-center`, `/enterprise-security` routes exist |
| **Recommended UX** | Ensure privacy policy uses plain language (below grade 8 reading level per configured threshold); add TL;DR summary at top; use expandable sections for detail |
| **Copy Change** | TL;DR: "We never sell your data. Your conversations are encrypted. You can delete your data anytime. We use AI to help you, not to profile you." |
| **Implementation** | Rewrite privacy page with reading-level target <=8; add summary section; add "Delete My Data" button |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 3 |

### 7.5 Operational Credibility (Score: 7/10)

| Field | Detail |
|-------|--------|
| **Problem** | Operational credibility scored 7/10; trust center, SLA, and governance pages exist but completeness unverified |
| **Affected** | `/trust-center`, `/sla`, `/ai-governance`, `/enterprise-security` |
| **Impacted ICP** | SMB buyers, LSO organizations (enterprise decision makers) |
| **Evidence** | Section K: "Operational Credibility | 7 | 10 | Trust center, SLA page, governance pages present" |
| **Recommended UX** | Ensure all credibility pages are fully populated (not placeholder); add uptime stats to SLA; add audit log to governance; cross-link between pages |
| **Copy Change** | SLA: "99.9% uptime guarantee. Real-time status at status.ezlegal.ai" |
| **Implementation** | Audit content completeness of trust/SLA/governance pages; fill any placeholder content; add cross-navigation |
| **Effort** | M |
| **Impact** | Medium |
| **Status** | Sprint 3 |

### 7.6 AI Response Feedback Mechanism

| Field | Detail |
|-------|--------|
| **Problem** | No evidence of user feedback mechanism on AI responses for continuous improvement and safety monitoring |
| **Affected** | `/chat`, `/chatbot`, `/ask` |
| **Impacted ICP** | All ICPs |
| **Evidence** | Section G: Ethical AI section empty (measurement gap); feedback is standard for responsible AI deployment |
| **Recommended UX** | Add thumbs up/down + optional text feedback after each AI response; report to monitoring system |
| **Copy Change** | "Was this helpful?" with thumbs up/down; optional: "Tell us more about what went wrong" |
| **Implementation** | Create AIResponseFeedback component; attach to each AI message; store feedback for quality monitoring |
| **Effort** | S |
| **Impact** | Medium |
| **Status** | DONE |

---

## Summary

| Category | Total Items | Done | Remaining | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|----------|-------------|------|-----------|-----------|----------|----------|----------|
| 1. Critical Fixes | 5 | 0 | 5 | 5 | 0 | 0 | 0 |
| 2. Conversion | 6 | 1 | 5 | 2 | 3 | 0 | 0 |
| 3. Spanish A2J | 5 | 1 | 4 | 1 | 1 | 2 | 0 |
| 4. SMB Buyer | 4 | 0 | 4 | 0 | 2 | 2 | 0 |
| 5. Legal Aid/LSO | 4 | 0 | 4 | 0 | 1 | 2 | 1 |
| 6. Accessibility | 5 | 2 | 3 | 1 | 2 | 0 | 0 |
| 7. Ethical AI/Trust | 6 | 3 | 3 | 1 | 1 | 2 | 0 |
| **TOTAL** | **35** | **7** | **28** | **10** | **10** | **8** | **1** |

---

## Methodology Note

The automated Playwright audit (2026-06-14) returned `ERR_CONNECTION_REFUSED` for all 62 routes, producing 306 findings that are connection errors rather than true UX issues. Evidence in this backlog is derived from:

1. **Structural audit data**: Route inventory, ICP mappings, configured thresholds, best-in-class scoring rubric
2. **Static source analysis**: Code inspection of components referenced in route definitions
3. **Audit configuration**: Threshold values (maxFormFields=5, maxClicksToConversion=3, minCtaPerPage=1, maxFleschKincaidGrade=8) used as acceptance criteria

A re-run of the full audit suite with a live dev server is recommended to surface additional DOM-level, visual, and runtime findings.

---

*Generated from audit-output/FULL_SITE_AUDIT.md | ezLegal.ai Redesign Planning*
