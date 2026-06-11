# GPT 5.5 Pro Audit Prompt - ezLegal.ai v869 Baseline

## Context

You are auditing ezLegal.ai, an AI-powered legal information platform serving consumers and SMBs who cannot afford traditional legal counsel. The platform is bilingual (English/Spanish) and operates under strict ethical guardrails (legal information, not legal advice).

**Baseline version:** v869 (May 15, 2026)
**Tech stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase + React Router v7
**Hosting:** Netlify SPA with client-side routing
**Live URL:** https://dev.ezlegal.ai (append `?demo=audit` to bypass auth)

## Audit Scope

### 1. Crawlability & SEO Structure

For each public route, verify:
- [ ] Semantic HTML (proper heading hierarchy h1 > h2 > h3)
- [ ] Unique, descriptive `<title>` and meta description
- [ ] Structured data (JSON-LD where appropriate)
- [ ] Open Graph / social meta tags
- [ ] Proper canonical URLs
- [ ] Internal linking health (no dead links)
- [ ] Image alt attributes
- [ ] Mobile-first responsive design

### 2. Content Completeness (v869 Baseline)

Verify each page contains the expected v869 content:

| Route | Expected Content |
|-------|-----------------|
| `/` | Hero with KPI strip, audience routing, trust badges, feature sections |
| `/features` | Full feature showcase with AI capabilities |
| `/pricing` | Tiered pricing (Free, Pro, Business, Enterprise) with comparison table |
| `/about` | Company mission, team, access-to-justice focus |
| `/how-it-works` | Step-by-step user flow explanation |
| `/for-partners` | Partner program overview with CTA |
| `/partner-hub` | Partner registration, tiers, integration details |
| `/media-kit` | Partner Media Kit with 3 tabs (Social Posts, Flyer Content, Partner Assets) |
| `/for-organizations` | Org-focused value prop and integration paths |
| `/for-business` | Business tier features and ROI |
| `/for-individuals` | Consumer-focused benefits |
| `/espanol` | Full Spanish-language landing with culturally relevant features |
| `/trust-center` | Security, compliance, ethical AI disclosures |
| `/ai-governance` | AI transparency, bias monitoring, methodology |
| `/issue-packs` | Purchasable legal topic packages |
| `/case-predictor` | Outcome prediction tool |
| `/negotiate` | Negotiation strategy planner |
| `/chat` | Primary AI chat interface |
| `/ask` | Quick-ask legal questions by topic |
| `/ezreads` | Legal education articles |
| `/find-attorney` | Lawyer directory with profiles |
| `/emergency-resources` | Crisis resources and hotlines |
| `/pro-bono` | Pro bono intake form |
| `/safety-net` | Legal safety net monitoring |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/sla` | Service Level Agreement |
| `/accessibility` | Accessibility statement |
| `/scope-disclaimers` | Legal disclaimers and scope limitations |

### 3. Conversion Flow Audit

Evaluate the user journey from landing to paid subscription:
- [ ] Clear value proposition above the fold
- [ ] Trust signals visible early (KPI strip, badges)
- [ ] Friction-free signup flow
- [ ] Trial-to-paid conversion path
- [ ] Email capture at appropriate touchpoints
- [ ] CTAs are action-oriented and contextually relevant
- [ ] Pricing clarity (no hidden costs)
- [ ] Social proof integration

### 4. Ethical Compliance

- [ ] Every page with legal content shows "legal information, not legal advice" disclaimer
- [ ] Attorney-client relationship is never implied
- [ ] No guaranteed outcomes claims
- [ ] Crisis resources accessible from all chat interfaces
- [ ] Scope limitations clearly disclosed before engagement
- [ ] User consent collected before data processing
- [ ] Data deletion/export accessible

### 5. Bilingual Parity (EN/ES)

- [ ] All public pages support language toggle
- [ ] Spanish content is culturally adapted, not machine-translated
- [ ] Navigation labels switch correctly
- [ ] Legal disclaimers available in both languages
- [ ] Emergency resources include Spanish-language hotlines

### 6. Technical Quality

- [ ] No TypeScript errors (strict mode)
- [ ] All routes lazy-loaded for code splitting
- [ ] Supabase RLS policies on every table
- [ ] No exposed secrets or API keys in client code
- [ ] Error boundaries at route level
- [ ] Loading states for async operations
- [ ] 404 handling for unknown routes
- [ ] Proper redirect handling for deprecated routes

### 7. Accessibility (WCAG 2.1 AA)

- [ ] Skip-to-content link present
- [ ] Focus management on route transitions
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ratios meet AA (4.5:1 text, 3:1 large text)
- [ ] Keyboard navigation functional throughout
- [ ] Screen reader announcements for dynamic content
- [ ] Reading preferences toolbar available

### 8. Performance

- [ ] Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Images optimized (WebP/AVIF where possible)
- [ ] Code splitting reduces initial bundle
- [ ] No render-blocking resources
- [ ] Service worker for offline capability (PWA)

## Output Format

For each section, provide:
1. **Score** (1-10)
2. **Issues found** (specific file:line references)
3. **Recommendations** (actionable fixes with priority)
4. **Pass/Fail** per checklist item

## Final Deliverable

Produce a structured audit report with:
- Executive summary (overall readiness score)
- Critical issues (must-fix before launch)
- High priority (fix within sprint)
- Medium priority (fix within quarter)
- Low priority (nice-to-have improvements)
- Comparison to v869 baseline (any regressions flagged)
