# ezLegal.ai - Routes, App Shell & Configuration

Generated: 2026-05-23T06:00:00.000Z

---

## Route Map (src/App.tsx)

### Public Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Home | Landing page with outcome-focused hero, 5 ICP cards, trust badges |
| `/start` | PersonaIntake | Segmented onboarding (individual / business / legal-aid) |
| `/login` | Login | Email/password + OAuth (Google, Azure) |
| `/signup` | Signup | Registration with age gate, consent recording |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset completion |
| `/auth/callback` | AuthCallback | OAuth callback handler |
| `/pricing` | Pricing | Audience-segmented pricing (individuals/business/legal-aid) |
| `/checkout` | Checkout | Issue pack purchase flow |
| `/contact` | Contact | Contact form |
| `/features` | Features | Feature overview |
| `/about` | About | Company info |
| `/ezreads` | EZReads | Legal education articles |
| `/pro-bono` | ProBonoIntake | Pro bono intake |
| `/emergency-resources` | EmergencyResources | Crisis hotlines and verified resources |
| `/for-organizations` | ForOrganizations | Legal-aid org landing |
| `/for-business` | ForBusiness | Employer/business landing |
| `/for-individuals` | ForIndividuals | Individual user landing |
| `/for-partners` | ForPartners | Attorney partner landing |
| `/scope-disclaimers` | ScopeDisclaimers | What we do / don't do |
| `/schedule-demo` | ScheduleDemo | Demo booking |
| `/espanol`, `/es` | EspanolLanding | Spanish landing page |
| `/es/chat` | SpanishChatRedirect | Sets language to Spanish, redirects to /chat |
| `/chat` | ChatV2 | Main AI chat interface |
| `/ask`, `/ask/:topic` | Ask | Topic-guided question entry |
| `/issue-packs` | IssuePacks | Purchasable action packs |
| `/case-predictor` | CasePredictor | AI case outcome predictor |
| `/negotiate` | Negotiate | Negotiation strategy planner |
| `/toolkit` | Toolkit | Document tools (OCR, QR, CSV, PDF) |
| `/report` | Report | Generated report viewer |
| `/find-attorney` | LawyerProfiles (public) | Public attorney directory |
| `/trust-center` | TrustCenter | Privacy/security trust center |
| `/privacy` | PrivacyPolicy | Full privacy policy |
| `/privacy-at-a-glance` | PrivacyAtAGlance | Simplified privacy |
| `/privacy-faq` | PrivacyFAQ | Privacy questions |
| `/security-faq` | SecurityFAQ | Security questions |
| `/terms` | TermsOfService | Terms of service |
| `/enterprise-security` | EnterpriseSecurity | Enterprise security info |
| `/how-it-works` | HowItWorks | Process explanation |
| `/accessibility` | AccessibilityStatement | WCAG compliance |
| `/sla` | SLA | Service level agreement |
| `/ai-governance` | AIGovernance | AI governance framework |
| `/ai-model-card` | AIModelCard | Model transparency card |
| `/algorithmic-impact-assessment` | AlgorithmicImpactAssessment | Algorithmic impact |
| `/bias-monitoring` | BiasMonitoring | Bias monitoring dashboard |
| `/site-review` | SiteReview | Internal review page |
| `/partner-hub` | PartnerHub | Partner management |
| `/p/:slug` | PartnerLanding | Dynamic partner pages |
| `/welcome` | ChannelLanding | Channel onboarding |
| `/media-kit` | MediaKit | Press resources |
| `/safety-net` | LegalSafetyNet | Legal safety net tool |
| `/help/which-feature` | FeatureGuide | Feature selector |
| `/icp-prototype` | IcpPrototype | ICP prototype page |

### Protected Routes (require auth or demo mode)

| Path | Component |
|------|-----------|
| `/admin` | AdminLayout (index: AdminOverview) |
| `/admin/users` | Admin |
| `/admin/content` | Admin |
| `/admin/chat` | Admin |
| `/admin/partners` | Admin |
| `/admin/system` | Admin |
| `/admin/audit-log` | AdminAuditLog |
| `/admin/collateral` | CollateralStudio |
| `/admin/collateral/:id` | CollateralEditor |
| `/dashboard` | Layout wrapper |
| `/dashboard/action-plan` | Dashboard |
| `/dashboard/ai-assistant` | AIAssistant |
| `/dashboard/cases` | Cases |
| `/dashboard/matters` | Matters |
| `/dashboard/clients` | Clients |
| `/dashboard/history` | History |
| `/dashboard/documents` | Documents |
| `/dashboard/icp-templates` | ICPTemplateLibrary |
| `/dashboard/research` | Research |
| `/dashboard/lawyer-profiles` | LawyerProfiles |
| `/dashboard/profile` | Profile |
| `/dashboard/billing` | Billing |
| `/dashboard/website-integration` | WebsiteIntegration |

### Deprecated Route Redirects (301)

| Old Path | New Path |
|----------|----------|
| `/billing` | `/dashboard/billing` |
| `/ez-reads` | `/ezreads` |
| `/terms-of-service` | `/terms` |
| `/privacy-policy` | `/privacy` |
| `/trust-safety` | `/trust-center` |
| `/chatbot-standalone` | `/chat` |
| `/chat-v2` | `/chat` |
| `/chatbot` | `/chat` |
| `/simple-chatbot` | `/chat` |
| `/app` | `/chat` (Navigate) |

---

## App Shell Architecture

```
BrowserRouter
  ScrollToTop (tracks page views)
  RouteFocusManager (a11y focus management)
  TenantProvider
    LanguageProvider
      PersonaProvider
        AuthProvider
          DemoProvider
            ModalProvider
              PersonalizationProvider
                FloatingChromeProvider
                  SkipLink
                  PreferenceLoader (accessibility + theme)
                  ReadingPreferencesToolbar
                  DemoModeBanner
                  OfflineBanner
                  ConsentBanner
                  PWAInstallPrompt
                  ErrorBoundary
                    Suspense (PageLoader)
                      Routes...
```

---

## Build Configuration (vite.config.ts)

- Target: ES2020
- CSS code splitting: enabled
- Sourcemaps: disabled (production)
- Chunk strategy:
  - `react-vendor`: react + react-dom
  - `react-router`: react-router-dom
  - `supabase`: @supabase/*
  - `icons`: lucide-react
  - `pdfjs`: pdfjs-dist
  - `jspdf`: jspdf
  - `html2canvas`: html2canvas
  - `ocr-tools`: tesseract.js
  - `qr`: qrcode
  - `vendor`: all other node_modules
- Test config: includes `tests/security.static.spec.ts`
- Dev server: strict filesystem, no auto-open

---

## Deployment (netlify.toml)

- Build command: `npx vite build`
- Publish: `dist`
- SPA redirect: `/* -> /index.html` (200)
- Security headers:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - HSTS: max-age=63072000; includeSubDomains; preload
  - CSP: default-src 'self'; connect-src supabase + openai + stripe; frame-src stripe

---

## Redirects (_redirects)

```
/sitemap.xml -> supabase edge function (200 proxy)
/chatbot -> /chat (301)
/chat-v2 -> /chat (301)
/chatbot-standalone -> /chat (301)
/* -> /index.html (200 SPA fallback)
```

---

## Tailwind Configuration

- Breakpoints: xs(360), sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
- Font families: Inter (sans), Playfair Display (serif)
- Color system: primary, brand, accent, gold, teal, navy, success, warning, error (full ramps)
- Custom animations: count-up, fade-in-up, fade-in, slide-up, slide-in-left, slide-in-right, pulse-soft
- Safe area spacing for mobile
- Typography plugin enabled

---

## Route Metadata System (src/config/routes.ts)

Added 2026-05-24: Centralized route metadata configuration.

### Architecture

- **AppRouteMeta interface**: Each route has `path`, `label` (en/es), `plainLanguageLabel` (en/es), `audience[]`, `requiresAuth`, `availableLanguages`, `riskLevel`, optional `showEmergencyBanner`, `showScopeDisclaimer`, `showLegalAidEscalation`, `navGroup`, `hideFromFirstTimeUsers`
- **Audiences**: individual, spanish-individual, business, legal-aid, attorney-partner, admin, general
- **Risk levels**: low, medium, high
- **Nav groups**: get-help, business, organizations, learn, trust, account, admin

### Helper Functions

- `getRouteMeta(path)` - lookup route metadata
- `getRoutesByNavGroup(group)` - filter by nav group
- `getRoutesByAudience(audience)` - filter by audience
- `shouldShowDisclaimer(path)` - check if disclaimer banner needed
- `shouldShowEmergencyBanner(path)` - check if emergency banner needed
- `shouldShowLegalAidEscalation(path)` - check if legal-aid link needed
- `isHighRiskRoute(path)` - check if high-risk acknowledgment needed
- `routeSupportsLanguage(path, lang)` - check Spanish availability

### Navigation Guardrails (Layout)

- **RouteDisclaimerBanner** (`src/components/RouteDisclaimerBanner.tsx`): Compact banner below header. Dismissible on low/medium risk routes, persistent on high-risk. Shows legal-aid escalation link. Exports `HighRiskAcknowledgment` modal for case-predictor/negotiate.
- **LanguageContinuityGuard** (`src/components/LanguageContinuityGuard.tsx`): Amber banner shown when Spanish-language user visits a page not yet available in Spanish. Links back to `/es/chat`.
- Both integrated into `Layout.tsx` between header and main content.

### Access-to-Justice Screening (Checkout)

- **AccessToJusticeScreening** (`src/components/AccessToJusticeScreening.tsx`): Shown before checkout for individual users (not business/org). Asks if paying would be a hardship. If yes, shows links to pro-bono, safety-net, and lawyer-profiles. User can still proceed. Session-persisted so only shown once per session.

---

## SEO & Meta (index.html)

- Schema.org: WebSite with SearchAction
- Open Graph + Twitter Card meta
- PWA: manifest.webmanifest, theme-color, apple-mobile-web-app
- Geo targeting: US-AZ, Tucson
- Languages: en-US, es-US
- Preconnect: Google Fonts
- RTL support: auto-detects from localStorage language preference
