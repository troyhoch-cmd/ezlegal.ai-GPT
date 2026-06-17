# AUDIT_BUNDLE.md — ezLegal.ai Prototype

## App Purpose

ezLegal.ai is an AI-powered legal assistance platform that helps individuals, small businesses, and legal service organizations understand their rights, predict case outcomes, negotiate disputes, and connect with licensed attorneys. The platform is designed specifically to serve users who cannot afford traditional legal representation.

---

## Health Endpoint

`GET /api/health`

Returns JSON with `ok: true`, service name, environment, and timestamp. No auth required.

---

## Frontend Routes

### Public (no login required)

| Route | Page |
|---|---|
| `/` | Home |
| `/start` | Persona intake / onboarding |
| `/for-individuals` | Landing: individuals |
| `/for-business` | Landing: SMBs |
| `/for-organizations` | Landing: legal aid orgs / nonprofits |
| `/for-partners` | Landing: attorney partners |
| `/espanol` | Spanish-language landing |
| `/es` | GTM Spanish landing |
| `/business` | GTM business landing |
| `/partners` | GTM partners landing |
| `/urgent-help` | Urgent legal help (DV, eviction, immigration) |
| `/emergency-resources` | Crisis resources directory |
| `/pricing` | Pricing plans |
| `/checkout` | Checkout (Stripe) |
| `/features` | Features overview |
| `/how-it-works` | How the platform works |
| `/about` | About page |
| `/contact` | Contact form |
| `/ezreads` | EZReads: plain-language legal article library |
| `/ezreads/:slug` | Individual EZReads article |
| `/ask` | Ask a legal question (public) |
| `/ask/:topic` | Topical ask flow |
| `/chat` | AI Legal Chat (free tier, no login) |
| `/case-predictor` | Case outcome predictor |
| `/case-predictor/start` | Case predictor intake form |
| `/negotiate` | Negotiation strategy tool |
| `/issue-packs` | Issue-specific legal packs |
| `/pro-bono` | Pro bono intake form |
| `/safety-net` | Legal Safety Net (DV / crisis) |
| `/find-attorney` | Public lawyer directory |
| `/lawyer-profiles/:slug` | Individual lawyer profile |
| `/partner-hub` | Partner resources hub |
| `/p/:slug` | Custom partner landing |
| `/welcome` | Channel partner landing |
| `/schedule-demo` | Schedule a demo |
| `/media-kit` | Media / press kit |
| `/icp-prototype` | ICP prototype explorer |
| `/toolkit` | Legal toolkit (OCR, PDF, QR) |
| `/help/which-feature` | Feature guide |
| `/share-perspective` | Community feedback |
| `/site-review` | Internal site review tool |
| `/access` | Access gate |
| `/how-reports-are-reviewed` | AI report review explainer |
| `/login` | Login |
| `/signup` | Sign up |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset confirm |
| `/auth/callback` | Auth OAuth callback |

### Trust / Legal / Policy (public)

| Route | Page |
|---|---|
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/privacy-at-a-glance` | Privacy summary |
| `/privacy-faq` | Privacy FAQ |
| `/security-faq` | Security FAQ |
| `/trust-center` | Trust Center |
| `/enterprise-security` | Enterprise security detail |
| `/accessibility` | Accessibility Statement |
| `/scope-disclaimers` | Scope & disclaimers |
| `/sla` | Service Level Agreement |
| `/ai-governance` | AI Governance Policy |
| `/ai-model-card` | AI Model Card |
| `/algorithmic-impact-assessment` | Algorithmic Impact Assessment |
| `/bias-monitoring` | Bias monitoring dashboard |

### Authenticated (requires login or demo mode)

| Route | Page |
|---|---|
| `/dashboard` | Redirects to `/chat` |
| `/dashboard/action-plan` | Personal action plan |
| `/dashboard/ai-assistant` | AI assistant |
| `/dashboard/cases` | Cases list |
| `/dashboard/matters` | Legal matters |
| `/dashboard/clients` | Clients (attorney/org mode) |
| `/dashboard/history` | Chat history |
| `/dashboard/documents` | Document vault |
| `/dashboard/icp-templates` | ICP document template library |
| `/dashboard/research` | Legal research |
| `/dashboard/lawyer-profiles` | Manage lawyer profile |
| `/dashboard/profile` | User profile |
| `/dashboard/billing` | Billing / subscription |
| `/dashboard/website-integration` | Widget embed settings |
| `/lso-dashboard` | Legal service org dashboard |
| `/grant-reporting` | Grant reporting (nonprofits) |
| `/admin` | Admin panel (admin role required) |
| `/admin/users` | User management |
| `/admin/content` | Content management |
| `/admin/chat` | Chat management |
| `/admin/partners` | Partner management |
| `/admin/system` | System settings |
| `/admin/audit-log` | Admin audit log |
| `/admin/collateral` | Collateral studio |
| `/admin/collateral/:id` | Collateral editor |

---

## Demo / Audit Mode

To bypass authentication and access protected routes without an account, append `?demo=audit` to any URL:

```
https://[your-deploy-url]/dashboard/action-plan?demo=audit
https://[your-deploy-url]/dashboard/documents?demo=audit
https://[your-deploy-url]/lso-dashboard?demo=audit
```

Or, once on any page, open browser console and run:
```js
sessionStorage.setItem('ezlegal_demo_mode', 'true')
location.reload()
```

---

## Backend / API Routes (Supabase Edge Functions)

All functions are deployed to the Supabase project at `https://qwzpcswjlhxbsghbnkrn.supabase.co/functions/v1/`.

| Function slug | Purpose | Auth required |
|---|---|---|
| `openai-chat` | AI legal chat (OpenAI proxy) | Yes (anon key) |
| `analyze-document` | OCR + AI document analysis | Yes |
| `explain-document` | Plain-language doc explanation | Yes |
| `outcome-prediction` | Case outcome probability | Yes |
| `legalbreeze-rag` | RAG-based legal research | Yes |
| `sitemap` | Dynamic XML sitemap | No |
| `image-sitemap` | Image sitemap | No |
| `grant-report` | Nonprofit grant report generation | Yes |
| `send-legal-guide` | Email legal guide to user | No |
| `send-asset-email` | Send partner asset by email | Yes |
| `lead-welcome-email` | Welcome email for new leads | No |
| `embed-widget` | Embedded widget JS | No |
| `data-export` | GDPR data export | Yes |
| `data-deletion` | GDPR data deletion | Yes |
| `data-cleanup` | Internal data cleanup | Admin only |
| `stripe-checkout-session` | Create Stripe checkout | Yes |
| `stripe-webhook` | Handle Stripe webhooks | Webhook sig |
| `legal-scraper` | Internal statute scraper | Admin only |
| `ars-scraper` | Arizona statute scraper | Admin only |

---

## Auth Requirements

- Auth provider: Supabase email/password
- Email confirmation: OFF (users can log in immediately after signup)
- No OAuth providers configured by default
- Role field: `profiles.role` — values: `user`, `admin`, `attorney`, `org_admin`
- Demo/audit mode bypasses auth entirely (see above)

---

## Test Account Creation

To create a test account:
1. Go to `/signup`
2. Use any email + password (min 8 chars)
3. No email confirmation required — login immediately

For admin access, after creating an account, promote via Supabase dashboard:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Environment Variables Required

| Variable | Type | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Public | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public | Supabase anon/public key |

All other secrets (OpenAI key, Stripe keys, service role key) are stored as Supabase Edge Function secrets and are never exposed to the frontend or committed to the repository.

---

## AI Model / Provider Touchpoints

| Feature | Provider | Model |
|---|---|---|
| Legal chat | OpenAI (via Supabase Edge Function) | GPT-4o / configurable per `ai_models` table |
| Document analysis | OpenAI | GPT-4o |
| Document explanation | OpenAI | GPT-4o |
| Outcome prediction | OpenAI | GPT-4o + local scoring |
| RAG legal research | OpenAI + pgvector | GPT-4o + embeddings |
| Grant report generation | OpenAI | GPT-4o |

AI model selection is configurable per-session via the `AIModelSelector` component. The `ai_models` table in Supabase contains available models and their configuration.

---

## Data Storage

| Data type | Location |
|---|---|
| User profiles & auth | Supabase Auth + `profiles` table |
| Chat messages | `chat_messages` table |
| Documents | `documents` table + Supabase Storage (`avatars` bucket) |
| Cases / matters | `cases`, `matters` tables |
| Lawyer profiles | `lawyer_profiles` table |
| EZReads articles | `ezreads_articles` table |
| Issue packs | `issue_pack_previews` table |
| Outcome predictions | `outcome_predictions` table |
| Activity log | `unified_activity_log` table |
| Analytics events | `analytics_events` table |
| Consent records | `consent_records` table |
| Pro bono intake | `pro_bono_intakes` table |
| Safety net plans | `safety_net_plans` table |

All tables have Row Level Security (RLS) enabled. Users can only access their own data.

---

## Known Mocked / Stubbed Functionality

- **Outcome prediction scores**: Algorithm uses a combination of real OpenAI analysis and local heuristic scoring. Probabilities shown are illustrative.
- **Lawyer directory**: Pre-populated with Arizona lawyers from public bar data. Real connection requests are stored in `lawyer_connections`.
- **Grant reporting**: Report generation is AI-assisted but not connected to external grant databases.
- **Stripe checkout**: Configured for test mode by default. Use Stripe test cards (e.g. `4242 4242 4242 4242`).
- **Legal scraper**: Arizona Revised Statutes scraper is functional; other states are configured but may not be fully scraped yet.
- **Case predictor**: Uses historical pattern matching. Not a substitute for legal advice.

---

## ICP-Specific Flows

### A. Spanish-Speaking Individuals Who Cannot Afford a Lawyer

Entry points:
- `/espanol` — Full Spanish-language landing with WhatsApp chat option
- `/es` — GTM Spanish landing
- `/emergency-resources` — Crisis resources in English and Spanish
- `/urgent-help` — Urgent situations (eviction, DV, immigration)
- `/pro-bono` — Pro bono intake form
- `/chat` — Free AI chat (no login, no payment required)

Key features:
- Language toggle in navigation (English / Spanish)
- Spanish translations via `LanguageContext` throughout the app
- WhatsApp opt-in for users without reliable internet
- Immigration status checker (never stores immigration status)
- Notario fraud checker
- Know Your Rights section
- `?demo=audit` mode to explore authenticated features

### B. Small/Medium Businesses (SMBs)

Entry points:
- `/for-business` — Business-specific landing
- `/business` — GTM business landing
- `/pricing` — Business tier pricing
- `/issue-packs` — Business issue packs (contracts, employment, IP)
- `/case-predictor` — Business dispute outcome prediction
- `/negotiate` — Contract negotiation strategy tool
- `/find-attorney` — Find a business attorney
- `/schedule-demo` — Request a sales demo

Key features:
- Business intake form (`BusinessIntake` component)
- Contract analysis via document upload
- Negotiation strategy planner with scripts
- Outcome prediction for business disputes
- Issue packs for common business legal matters
- `?demo=audit` to explore dashboard features

### C. Pro Bono Intake and Legal Service Organizations (LSOs)

Entry points:
- `/pro-bono` — Public pro bono intake
- `/for-organizations` — LSO-specific landing
- `/lso-dashboard` — LSO case management dashboard (requires login)
- `/grant-reporting` — Grant impact reporting
- `/partner-hub` — Partner resources and assets
- `/schedule-demo` — Demo for org onboarding

Key features:
- Pro bono intake system with eligibility screening
- LSO dashboard with client management
- Grant reporting with AI-generated narrative
- Partner asset library (flyers, social templates, presentations)
- Collateral studio for custom branded materials
- Monthly impact dashboard
- Spanish parity panel to check bilingual coverage
- `?demo=audit` to explore org admin features

---

## Build Information

- Framework: React 18.3.1 + Vite 5.4.2 + TypeScript 5.5.3
- Routing: React Router DOM v7.11.0 (client-side, SPA fallback required)
- Styling: Tailwind CSS 3.4.1
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Bundle: ~119 JS chunks, ~34s build time
- SPA fallback: `public/_redirects` + `netlify.toml` both specify `/* -> /index.html`
