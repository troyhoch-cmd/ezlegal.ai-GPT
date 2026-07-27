# ezLegal.ai - Conversion & Post-Purchase Flow

Generated: 2026-05-24T06:00:00.000Z

---

## Conversion Funnel Overview

```
Homepage (/) 
  -> "Start with 3 questions" (home_cta_clicked) -> /start (PersonaIntake)
  -> "Ayuda en espanol" (home_cta_clicked) -> /espanol
  -> "Protect my business" (home_cta_clicked) -> /for-business
  -> "Partner with ezLegal" (home_cta_clicked) -> /for-organizations
  -> Guided Issue Grid (issue_card_clicked) -> /chat (with prefill)
  -> Urgent escape (urgent_resources_clicked) -> /emergency-resources

PersonaIntake (/start) - 4-step flow with progress bar:
  Step 1: Persona selection
    -> Individual -> Step 2 (issue selection)
    -> Business -> Step 2 (business issues)
    -> Spanish ("Necesito ayuda en español") -> redirects to /espanol
    -> Legal aid -> Step 2 (legal aid issues)
    -> Organization ("Represento una organización") -> redirects to /for-organizations
  Step 2: Issue selection (6 options per persona, sets chat prefill)
  Step 3: Urgency screening (visually differentiated: neutral/amber/red)
    -> No rush -> Step 4
    -> Deadline (amber border) -> Step 4
    -> Danger (red border) -> redirects to /emergency-resources
  Step 4: Action selection + disclaimer "This does not create an attorney-client relationship."
    -> "Ask AI for legal information" -> /chat
    -> "Find a lawyer or legal help" -> /lawyer-profiles
    -> "View resources and documents" -> /emergency-resources

Spanish Triage (SpanishTriageScreen - Round 7.2):
  Step 1: Affordability -> cannot_pay / low_cost_needed / can_pay
  Step 2: Deadline -> has deadline / no deadline
  Step 3: Risk -> emergency (BLOCKS checkout) / urgent / normal
  Step 4: Jurisdiction -> state selection
  Step 5: Result routing:
    -> Emergency: EmergencyTriageNotice + free resources only
    -> Cannot pay: pro bono first (spanish_free_help_selected) -> /pro-bono?lang=es
    -> Low cost: free options + optional paid path
    -> Can pay: document intake (spanish_paid_document_selected)

SMB Intake (BusinessIntakeSegmentation - Round 7.2):
  Step 1: Need segmentation (5 cards, smb_segment_selected)
  Step 2: Document type detail (9 options)
  Step 3: Attorney review recommendation (if high-risk, smb_attorney_review_selected)
  Step 4: Scope acknowledgment checkbox REQUIRED (smb_checkout_scope_acknowledged)
  Step 5: Confirmation with CTA hierarchy (start document / schedule demo / view pricing)

Organization Partner Intake (OrganizationPartnerIntake - Round 7.2):
  Step 1: Organization type (6 types, org_partner_intake_started)
  Step 2: Issue areas + languages supported (multi-select)
  Step 3: Volume + warm referral + conflict check config
  Step 4: Data consent (checkbox required, org_partner_intake_completed)
  Step 5: Confirmation with demo + governance links

Spanish Landing (/espanol)
  -> Issue cards (espanol_issue_selected) -> /es/chat (with prefill)
  -> Primary CTA "Empezar en español" (espanol_cta_clicked) -> /es/chat
  -> Secondary CTA "Necesito ayuda gratis o de bajo costo" (espanol_cta_clicked) -> /pro-bono?lang=es
  -> Emergency CTA (espanol_cta_clicked) -> /emergency-resources
  -> Hardship section: 3 pathway cards (Ayuda gratuita -> /pro-bono, Bajo costo -> /legal-safety-net, Gratis para siempre -> /es/chat)
  -> TrustCTABlock (compact) linking Trust Center, Privacy, AI Governance, Disclaimers
  -> Language continuity notice (amber): warns some pages may show English

ForBusiness (/for-business)
  -> Problem cards (business_problem_selected) -> /chat (with prefill)
  -> Hero CTA "Start business intake" (business_cta_clicked) -> /start?persona=business
  -> Secondary CTA "Schedule demo" (business_cta_clicked) -> /schedule-demo
  -> Tertiary CTA "View pricing" (business_cta_clicked) -> /pricing
  -> Procurement trust strip: Trust Center, Enterprise Security, SLA & Uptime, AI Governance links
  -> Onboarding cards: 3-step flow (tell concern, get guidance, take action)
  -> "Not sure?" path -> /start (guided questionnaire)
  -> Bottom CTA "Start business intake" (business_cta_clicked) -> /start?persona=business

ForOrganizations (/for-organizations)
  -> Hero CTA "Schedule organization demo" (demo_requested) -> /schedule-demo
  -> Secondary CTA "Create partner intake page" -> /partners
  -> Tertiary CTA "Review AI governance" -> /ai-governance
  -> Workflow sections: intake support, Spanish access, referral/escalation, admin/audit, privacy/consent, reporting
  -> Implementation note cards: human review, local eligibility rules, emergency escalation
  -> Positioning: "We do not claim to replace lawyers or legal aid staff"
  -> Bottom CTA "Schedule a partner demo" (demo_requested) -> /schedule-demo

Chat (/chat)
  -> Free questions (no auth required for first few)
  -> EthicalConversionPanel -> /issue-packs, /checkout
  -> HandoffRequestForm -> attorney connection

Issue Packs (/issue-packs)
  -> Pack selection -> /checkout?plan={packId}

Checkout (/checkout)
  -> Review -> Payment -> Confirmation
  -> Fires: payment_started, payment_completed
```

---

## PersonaIntake (src/pages/PersonaIntake.tsx)

### Flow - 4-Step Progressive Disclosure
1. **Step 1 - Persona**: 5 options (Individual, Business, Spanish, Legal Aid, Organization)
   - Spanish ("Necesito ayuda en español") and Organization immediately redirect to respective pages
   - Others advance to Step 2
   - Accepts `?persona=business` URL param to pre-select and skip to Step 2
2. **Step 2 - Issue**: 6 plain-language issue categories per persona (with "Something else" catch-all)
   - Sets `sessionStorage` prefill for chat context
3. **Step 3 - Urgency**: Three options with visual differentiation
   - "No rush" (neutral border) -> Step 4
   - "I have a deadline coming" (amber border, Clock icon) -> Step 4
   - "I am in danger or this is an emergency" (red border, AlertTriangle icon) -> redirects to `/emergency-resources`
4. **Step 4 - Action**: Three pathways + disclaimer
   - "Ask AI for legal information" -> `/chat`
   - "Find a lawyer or legal help" -> `/lawyer-profiles`
   - "View resources and documents" -> `/emergency-resources`
   - Disclaimer: "This does not create an attorney-client relationship."
   - No save/resume feature (not implemented)

### Analytics Events
- `persona_intake_step` (step number)
- `persona_selected` (persona type)
- `persona_intake_completed` (persona, issue, action)

### UI/UX
- Progress bar showing step X of 4
- Back button navigation between steps
- `ScopeNotice` (compact variant) at bottom of every step
- Clean white background with card-based selections
- No account required, no dark theme

## Spanish Landing (src/pages/EspanolLanding.tsx)

### Structure
- **Emergency warning** (red): "Si está en peligro inmediato, llame al 911" + urgent resources link
- **Hero**: "Ayuda legal clara, paso a paso." with teal "Empezar en español" CTA
  - Subheadline emphasizes: understand situation, find next steps, organize documents, know when lawyer needed
  - Explicit safety copy: "Esto es información legal, no asesoría legal."
  - **Primary CTA**: "Empezar en español" -> `/es/chat`
  - **Secondary CTA** (Round 7.1): "Necesito ayuda gratis o de bajo costo" -> `/pro-bono?lang=es`
  - **Emergency CTA**: "Recursos urgentes" -> `/emergency-resources`
- **Issue cards** (6): Vivienda, Trabajo, Familia, Deudas, Inmigración, Pequeñas reclamaciones
  - Each links to `/es/chat` with Spanish prefill prompt
- **How it works** (4 steps): Explain situation -> We organize -> Action plan -> Documents/resources
- **Trust signals** (4): Información legal no asesoría, encrypted, full Spanish, no judgment
- **SpanishScopeNotice** disclaimer + extended explanation
- **Hardship-aware routing** (Round 7.1): "¿El costo es un problema?" section with 3 pathway cards
  - Ayuda gratuita (pro bono/legal aid) -> `/pro-bono?lang=es`
  - Bajo costo (reduced-cost options) -> `/legal-safety-net`
  - Gratis para siempre (unlimited free questions) -> `/es/chat`
- **Language continuity notice** (Round 7.1): Amber banner explaining some pages may show English, language preference persists
- **Final CTA** (dark): "¿Listo para entender sus opciones?"

### Copy Principles
- Plain, warm, non-technical Spanish
- No overpromising free legal representation
- Emphasizes: understand, next steps, documents, know when a lawyer is needed
- Hardship users see free/low-cost options BEFORE paid options

### Analytics Events
- `espanol_landing_viewed` (on mount)
- `espanol_issue_selected` (on card click)
- `espanol_cta_clicked` (on CTA click with cta identifier: empezar, ayuda_gratis, urgente)

### Behavior
- Sets language to 'es' on mount via `useLanguage`
- `lang="es"` attribute on root div

## ForBusiness (src/pages/ForBusiness.tsx)

### Structure
- **Hero**: "Practical legal workflows for small businesses."
  - Subheadline: Clarifies ezLegal does not replace legal counsel but helps you prepare
  - Primary CTA: "Start business intake" -> `/start?persona=business`
  - Secondary CTA (Round 7.1): "Schedule demo" -> `/schedule-demo`
  - Tertiary CTA (Round 7.1): "View pricing" -> `/pricing`
- **Common problems** (6 cards): Contracts, Employees, Customer disputes, Formation, Compliance, Debt
  - Each links to `/chat` with business-specific prefill prompt
- **Productized workflows** (6): Contract review, Cease & desist, Employee handbook, LLC agreement, Privacy policy, Demand letter
- **Procurement trust strip** (Round 7.1): 4 trust badges + 4 governance link pills
  - Badges: Scope clarity, Encrypted data, Lawyer connection, Speed
  - Link pills: Trust Center, Enterprise Security, SLA & Uptime, AI Governance
- **Business onboarding cards** (Round 7.1): 3-step low-jargon flow
  - Step 1: Tell us your concern
  - Step 2: Get organized guidance
  - Step 3: Take action
- **Pricing preview** (3 tiers): Free ($0) / Business ($99/mo) / Enterprise (Custom)
- **ScopeNotice** disclaimer + plain-language: "ezLegal helps organize legal information and generate documents. It does not replace a lawyer."
- **"Not sure?" path** (Round 7.1): Routes to `/start` guided questionnaire
- **Final CTA** (dark): "Stop guessing. Start protecting your business."

### Copy Principles
- Emphasizes prevention, speed, and practical workflows
- Does not imply ezLegal replaces counsel
- Main CTA: "Start business intake"
- No fear-based pressure, no countdown timers, no dark patterns

### Analytics Events
- `page_view` (on mount)
- `business_problem_selected` (on card click)
- `business_cta_clicked` (on CTA click with cta identifier: hero_start_intake, hero_demo, hero_pricing, bottom)

## ForOrganizations (src/pages/ForOrganizations.tsx)

### Structure
- **Hero**: "AI-assisted intake that multiplies your capacity."
  - Positioning: "We do not claim to replace lawyers or legal aid staff. Our tools support and augment your team."
  - Primary CTA (Round 7.1): "Schedule organization demo" -> `/schedule-demo`
  - Secondary CTA (Round 7.1): "Create partner intake page" -> `/partners`
  - Tertiary CTA (Round 7.1): "Review AI governance" -> `/ai-governance`
- **Capabilities** (6): AI intake, multilingual, triage/escalation, doc generation, reporting/analytics, integration-ready architecture
- **Use cases** (5): Legal aid orgs, Law school clinics, Bar associations, Community orgs, Court self-help centers
- **Governance links** (4 cards): AI Governance, Bias Monitoring, Model Card, Algorithmic Impact Assessment
- **Workflow sections** (Round 7.1, 6 cards): Client-facing intake support, Spanish-language access, Referral and escalation, Admin/audit visibility, Privacy/consent, Reporting
- **Implementation note cards** (Round 7.1, 3 amber cards):
  - "Human review recommended" - AI output should be reviewed by qualified staff
  - "Use with local legal eligibility rules" - Configure for jurisdiction/funding source
  - "Configure emergency and high-risk escalation" - Set up crisis routing
- **Integration-ready**: "Designed to support future integrations" + (4 badges): Encrypted data, partner dashboard, API/widgets, multi-language
- **ScopeNotice** disclaimer
- **Final CTA** (dark): "Ready to expand your reach?"

### Copy Principles
- Positions around triage, intake support, education, referral routing, document preparation support
- Does not claim to replace lawyers or legal aid staff
- Uses "Integration-ready architecture" / "Designed to support future integrations" for unbuilt features
- Implementation notes set proper expectations for deployment
- Does not claim existing integrations unless implemented
- CTA: "Schedule a partner demo"

### Analytics Events
- `page_view` (on mount)
- `demo_requested` (on CTA click with source: org_hero, org_bottom)

---

## Checkout (src/pages/Checkout.tsx)

### Products Available
| ID | Name | Price |
|----|------|-------|
| immigration | Immigration Help Pack | $39 |
| housing | Housing & Eviction Pack | $29 |
| family | Family Matters Pack | $39 |
| employment | Employment & Wages Pack | $29 |
| debt | Debt Defense Pack | $29 |
| negotiation | Negotiation Strategy Planner | $49 |
| predictor | AI Case Predictor | $4.99 |

### Checkout Steps
1. **Review**: Product details, includes list, price display
2. **Payment**: Stripe integration via edge function
3. **Confirmation**: Success state with next steps

### Features
- Bilingual product names and descriptions
- Plan context persistence (survives signup redirect)
- Persona-aware routing (business/org users see different UI)
- Email collection for non-authenticated users
- Fires `payment_started` and `payment_completed` events

---

## Issue Packs (src/pages/IssuePacks.tsx)

### Structure
- Audience tabs: Individuals | Business | Legal Aid
- High-risk pack gate (domestic violence, immigration, custody)
- Deadline screening component
- Preview modal with sample content
- Verifiable trust strip
- Inline email capture
- Attorney referral disclosure

### Pack Categories
- Immigration (high-risk, $39)
- Housing & Eviction (high-risk, $29)
- Family Matters (high-risk, $39)
- Employment & Wages ($29)
- Debt Defense ($29)
- Negotiation Strategy ($49)

### Safety Features
- `HighRiskPackGate`: Extra confirmation for sensitive topics
- `IssuePackDeadlineScreening`: Detects if user has imminent deadline
- `AttorneyReferralDisclosure`: Transparent about referral relationships

---

## Analytics Service (src/services/analytics-service.ts)

### Event Types (ConversionEvent union)
```typescript
'page_view' | 'language_selected' | 'primary_cta_clicked'
| 'intake_started' | 'intake_step_completed' | 'intake_abandoned'
| 'jurisdiction_entered' | 'ai_answer_requested' | 'ai_answer_shown'
| 'source_panel_opened' | 'human_help_clicked'
| 'signup_started' | 'signup_completed'
| 'payment_started' | 'payment_completed'
| 'support_contacted' | 'partner_referral_landed'
| 'handoff_requested' | 'privacy_gate_accepted'
| 'icp_card_clicked' | 'referral_cta_clicked'
| 'urgent_signal_detected' | 'chat_started'
| 'first_question_submitted'
| 'handoff_opened' | 'handoff_submitted' | 'handoff_failed'
| 'partner_referral_clicked' | 'landing_view'
| 'home_viewed' | 'home_cta_clicked'
| 'issue_card_clicked' | 'urgent_resources_clicked'
| 'wizard_started' | 'wizard_completed'
| 'summary_downloaded' | 'partner_cta_clicked'
| 'demo_requested'
| 'espanol_landing_viewed' | 'espanol_issue_selected' | 'espanol_cta_clicked'
| 'business_problem_selected' | 'business_cta_clicked'
| 'persona_intake_step' | 'persona_selected'
| 'persona_intake_completed' | 'save_progress_attempted'
```

### Attribution Tracking
- Captures UTM parameters (source, medium, campaign, content)
- Partner referral codes via `?ref=` or `?partner=`
- Stored in localStorage, attached to all subsequent events
- Fires `partner_referral_landed` on first visit with ref code

### Session Management
- Generates UUID session ID (sessionStorage)
- Attaches language and jurisdiction to all events
- Persists to Supabase `analytics_events` table

### Key Functions
- `trackEvent(name, properties)`: Main event tracker
- `trackPageView(path)`: Page view with attribution
- `captureAttribution()`: UTM/ref capture on app load
- `setAnalyticsLanguage(lang)`: Language context
- `setAnalyticsJurisdiction(jurisdiction)`: Jurisdiction context

### Enriched Event Properties

**first_question_submitted**:
- `jurisdiction`: user's selected state (string | null)
- `language`: 'en' | 'es'
- `prefill_used`: boolean (true if sessionStorage prefill was consumed)

**ai_answer_shown**:
- `model`: string (actual OpenAI model or "Local (network_fallback)" / "Local (api_fallback)")
- `fallback_type`: 'network_fallback' | 'api_fallback' | null

**urgent_signal_detected**:
- `categories`: string[] (e.g. ['eviction', 'court_deadline'])
- `source`: 'chat_input'

### Fallback Tracking (chat-service.ts)

The chat service implements typed fallback detection:
```
Type: FallbackType = 'network_fallback' | 'api_fallback'
```

Detection logic (`isLikelyNetworkError`):
- Matches: TypeError, fetch, network, failed to fetch, load failed, abort, ECONNRESET, ENOTFOUND, ETIMEDOUT
- If matched: `network_fallback`
- If API returns error (non-network): `api_fallback`

Double-fallback: If local knowledge base also fails, returns hardcoded safe message with disclaimer.

---

## Round 7.3 Additions — Production Infrastructure

### Attorney Review Fulfillment (SMB)
- **Types**: `src/lib/attorneyReview/types.ts` — ReviewStatus (draft→submitted→paid→assigned→completed|cancelled), ReviewUrgency (standard/expedited/emergency), ReviewAcknowledgment (4 checkboxes), bilingual acknowledgment texts
- **Pricing**: `src/lib/attorneyReview/pricing.ts` — 3 tiers (Basic $149, Detailed $299, Full Revision $499), urgency multipliers (1x/1.5x/2.5x), turnaround estimates
- **Requests**: `src/lib/attorneyReview/requests.ts` — create, submit, acknowledge scope, cancel, list user requests, get by ID
- **Analytics**: `src/lib/attorneyReview/analytics.ts` — 5 event types pushed to dataLayer
- **UI**: `AttorneyReviewConfirmation` component with tier cards, urgency selector, 4 required acknowledgments, bilingual

### Legal-Aid Matching (Spanish Flow)
- **Types**: `src/lib/legalAid/types.ts` — LegalAidOrganization (VerificationStatus: verified/needs_verification/unavailable)
- **Directory**: 8 placeholder orgs (AZ, CA, TX, NY, FL, IL + National DV Hotline), all `needs_verification`
- **Matching**: Scoring algorithm (jurisdiction +3 mandatory, county +2, language +2, issue area +2, emergency +3, referrals +1), minimum 5 to match

### Partner Dashboard
- Route: `/partner-dashboard` (auth required)
- Tabs: Overview (stats cards), Referrals (accept/decline/conflict actions), Settings
- Uses `getPartnerProfile()` and `getPartnerReferrals()` from persistence layer

### Governance Evidence Panel
- `GovernanceEvidencePanel` in Trust Center: full variant (progress bar + policy list) and compact variant
- Shows published/in-progress/planned status per governance item with links

### Intake Analytics & Recovery
- `src/lib/intake/analytics.ts` — 14 event types covering full intake lifecycle
- `src/lib/intake/recovery.ts` — localStorage save/restore with 72h TTL for abandoned sessions

---

## Ethical Conversion Principles

1. **No dark patterns**: Clear pricing, no hidden fees
2. **Free tier is genuinely useful**: Unlimited urgent-help links, basic Q&A
3. **Urgency is never manufactured**: Only real legal deadlines trigger urgency
4. **Upsells are contextual**: Only shown when paid content genuinely helps
5. **Attorney referrals disclosed**: Revenue-share relationships transparent
6. **High-risk gates**: Extra confirmation before purchasing sensitive-topic packs

---

## Round 7.4 — Security & Disclosure Hardening in Conversion Flows

### Attorney Review Conversion Hardening
- 10-state lifecycle ensures users are not charged before attorney acceptance
- 6 required acknowledgments (up from 4): added timelinesAreEstimates, jurisdictionMayAffect
- Expandable disclosure panel with 7 points and "not included" list
- Price breakdown shows base, urgency multiplier, and final total
- Turnaround labeled "estimated (not guaranteed)"
- Scope disclaimer: "ezLegal is not a law firm. Prices shown are base fee; final charges may vary."

### Legal-Aid Routing Conversion Ethics
- LEGAL_AID_CAVEATS shown on every referral card (5 bilingual caveats)
- Every directory entry has disclaimer field shown to users
- "Needs verification" badge prominently displayed
- "What to expect" steps set realistic expectations
- Matching algorithm boosts Spanish, free-eligible, and verified orgs

### Partner Referral Actions
- Status change requires ownership verification (security.ts)
- "Info Requested" action gives partners pause before accept/decline
- "Complete" action only available on accepted referrals
- All actions logged for audit
- Detail expansion shows consent status and referral source

### Privacy in Conversion Analytics
- sanitizePayload() strips all PII before dataLayer push
- Recovery localStorage stores no case details or legal facts
- User can clear saved progress at any time
