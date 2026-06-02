# ezLegal.ai - Key Components & Shared UI

Generated: 2026-05-24T06:00:00.000Z

---

## ICPPathCards (src/components/ICPPathCards.tsx)

### Purpose
Three-audience path cards on the homepage. Simplified ICP routing focused on the three main segments.

### 3 Path Cards

| Audience | Icon | Title (EN) | CTA (EN) | Route |
|----------|------|-----------|----------|-------|
| Individuals & Families | Users | Individuals & Families | Get started | /start |
| Business Owners | Building2 | Business Owners | Protect my business | /for-business |
| Organizations | Heart | Organizations | Partner with us | /for-organizations |

### Behavior
- Bilingual: all cards have EN + ES copy via `useLanguage`
- Grid: 1 col mobile, 3 col lg
- Each card includes description text and arrow icon
- Clean white cards with border, hover shadow effect

---

## TrustAndScopeStrip (src/components/TrustAndScopeStrip.tsx)

### Purpose
Horizontal strip of 5 trust signals displayed between hero and content sections.

### Trust Items
1. "Not a law firm" (Shield)
2. "Encrypted conversations" (Lock)
3. "English + Spanish" (Globe)
4. "No data sold" (Lock)
5. "Attorney referrals when needed" (Users)

### Behavior
- Bilingual (EN/ES)
- Centered flex-wrap layout with gap spacing
- Slate background with border, compact py-3 padding
- Inline links (privacy, scope) have underlines; these are legal info links, not button CTAs

---

## Chat Components (src/components/chat/)

### JurisdictionModal
- Searchable state selection modal replacing native `<select>`
- Real-time search filtering of all US states and territories
- Two-column button grid with selected state highlighted (teal border)
- Confirm button: "Use [State Name]" / "Usar [Estado]"
- Closes on backdrop click, Escape key, or confirm
- Fully bilingual (EN/ES)

### UrgencyScreening
- 4-option urgency card grid shown at top of empty chat state
- Options: Court date/deadline, Losing housing/income, Unsafe/threatened, No deadline
- Visual differentiation: amber borders for time-sensitive, red for safety
- Selecting "unsafe" shows inline 911 emergency alert
- Fires analytics events on selection

### IssueCategoryGrid
- 8 bilingual category cards: Housing, Family, Debt, Work, Immigration, Small business, Documents, Something else
- Heading: "What legal issue can we help you understand?" / "¿Qué problema legal podemos ayudarle a entender?"
- Subtext: "You do not need to know the legal category." / "No necesita saber la categoría legal."
- Each card sets a prefill prompt in the text input and focuses it

### FinalActionCards
- 4-CTA grid shown after each AI response
- Actions: View My Next Steps, Find Legal Help, Get Document Help, Ask a Follow-Up
- Fully bilingual, maps to existing conversion actions

### ChatDisclaimer
- Compact disclaimer: "This is legal information, not legal advice. Using this does not create an attorney-client relationship."
- Expandable "How this works" section with 4 bullet points
- Links to scope-disclaimers and privacy pages

---

## AISafetyMicrocopy (src/components/shared/AISafetyMicrocopy.tsx)

### Purpose
Reusable safety and scope disclosure components used across all pages.

### Components Exported
| Component | Default Variant | Purpose |
|-----------|----------------|---------|
| ScopeNotice | info | "Legal information, not legal advice" + link to scope-disclaimers |
| NotLegalAdviceBanner | info | "This is legal information, not legal advice." (standardized phrasing) |
| HumanEscalationCard | info | "You may need a lawyer" + link to lawyer-profiles |
| PrivacyMicrocopy | info | "Do not upload sensitive docs" + encryption notice |
| DeadlineWarning | warning | "Deadlines matter" reminder |
| SpanishScopeNotice | info | Spanish-only scope/safety notice |
| UrgentSafetyNotice | urgent | "Call 911 if in danger" with emergency resources link |

### Variant System
All components accept `variant?: 'info' | 'warning' | 'urgent' | 'compact'` and `className?: string`

| Variant | Styles |
|---------|--------|
| info | bg-slate-100, border-slate-200, text-slate-700 |
| warning | bg-amber-50, border-amber-200, text-amber-900 |
| urgent | bg-red-50, border-red-200, text-red-900 |
| compact | no background/border, text-slate-500, smaller text |

### Behavior
- Bilingual: all components use `useLanguage` hook (except SpanishScopeNotice which is Spanish-only)
- Compact variant omits padding, border, links
- Used in: EspanolLanding, ForBusiness, ForOrganizations, PersonaIntake, ChatV2, IssuePacks

---

## HomeAudienceRouting (src/components/HomeAudienceRouting.tsx) [LEGACY]

### Note
This component has been superseded by `ICPPathCards` on the homepage. It may still exist but is no longer the primary routing mechanism on the home page.

### Original 5 ICP Cards

| Key | Icon | Title (EN) | CTA (EN) | Route |
|-----|------|-----------|----------|-------|
| individual | User | Legal help made understandable | Start with a question | /chat |
| spanish | Globe | Ayuda legal en espanol | Hacer una pregunta en espanol | /es/chat |
| legal_aid | Heart | Reduce intake burden | Explore organization tools | /for-organizations |
| business | Building2 | A safe first step for employee legal issues | Explore employee support | /for-business |
| attorney | Briefcase | Better-prepared potential clients | Join attorney network | /for-partners |

### Behavior
- Bilingual: all cards have EN + ES copy
- On click: fires `icp_card_clicked` analytics event
- Records to `persona_intake_sessions` table (user_id, persona_type, intake_data)
- Navigates to card's href
- Grid: 1 col mobile, 2 col sm, 3 col lg, 5 col xl

---

## Navigation (src/components/Navigation.tsx)

### Features
- Responsive: desktop nav + mobile hamburger drawer
- Logo links to `/`
- Language toggle (EN/ES)
- Auth-aware: shows Login/Signup or UserMenu
- Active route highlighting
- Mobile: slide-in drawer with full nav tree
- Skip-to-content link support
- CrisisStrip integration

### Key Links
- Home, Chat, Pricing, How It Works, Trust Center
- For Business, For Organizations, For Partners
- Emergency Resources (highlighted)
- Admin (if user is admin)

---

## Footer (src/components/Footer.tsx)

### Sections
- Brand column: logo, tagline, social links
- Product: Chat, Issue Packs, Pricing, Features
- Resources: EZReads, Emergency Resources, How It Works
- Legal: Privacy, Terms, Accessibility, Trust Center
- Partners: For Partners, Partner Hub, Schedule Demo

### Trust Footer
- "Not a law firm" disclaimer
- "Legal information, not legal advice" notice
- Copyright with current year

---

## CrisisStrip (src/components/CrisisStrip.tsx)

### Purpose
Always-visible crisis resource banner for users in immediate danger.

### Variants
- `inline`: Compact single-line for embedding in hero sections
- `full`: Multi-resource strip with hotline numbers

### Content
- National DV Hotline: 1-800-799-7233
- Crisis Text Line: Text HOME to 741741
- 911 reminder for immediate danger
- Link to `/emergency-resources` for full directory

### Design
- Yellow/amber warning colors
- Shield icon
- Never hidden by user preference (safety-critical)

---

## HomeKPIStrip (src/components/HomeKPIStrip.tsx)

### Purpose
Social proof counters on homepage showing platform usage metrics.

### Metrics Displayed
- Questions answered
- Attorneys in network
- States covered
- Languages supported

### Data Source
- Pulls from `home_kpi_counters` Supabase table
- Animated count-up on scroll into view
- Fallback static values if fetch fails

---

## UrgentSignalCard (src/components/UrgentSignalCard.tsx)

### Purpose
Shown when user's message triggers urgent signal detection (before message is sent).

### UI
- Category-specific title and help text from CATEGORY_COPY
- Severity indicator (high / critical)
- "Continue anyway" button (sends message)
- "Get help now" button (links to /emergency-resources)
- "Dismiss" option

### Props
- signals: UrgentSignal[]
- onContinue: () => void
- onDismiss: () => void

---

## ResumeBanner (src/components/ResumeBanner.tsx)

### Purpose
Welcomes returning users and offers to resume their last conversation.

### Behavior
- Shows if user has previous chat sessions
- "Continue where you left off" CTA
- Dismissible for the session
- Links to most recent chat context

---

## Cognitive Load Components (src/components/cognitive-load/)

### UnifiedTrustStrip
Consolidated trust indicators shown contextually in chat.

### TabbedResponse
Parses AI responses into tabs: Summary | Action Steps | Sources

### MoreHelpDrawer
Slide-out drawer with additional resources, attorney connection, emergency contacts.

### CollapsibleSidebar
Collapsible panel for secondary information (thinking details, sources).

### ContextualCrisisAlert
In-response crisis detection -- shows alert if AI response discusses crisis topics.

---

## Shared Components (src/components/shared/)

### JurisdictionSelector
- Dropdown with US states
- Persistence to localStorage + profile
- Used in Chat, Checkout, and intake flows

### LegalDisclaimer
- Standard "not legal advice" disclaimer block
- Bilingual
- Multiple variants: inline, banner, footer

### CrisisResourceCard
- Individual resource display (hotline name, number, hours)
- Used in EmergencyResources and MoreHelpDrawer

### AttorneyServiceDisclosure
- Explains attorney referral relationships
- Revenue-share transparency

### AcknowledgmentChecklist
- Multi-item acknowledgment (used for high-risk pack purchases)

---

## Pricing Components (src/components/pricing/)

### PricingCard
- Plan name, price, features list, CTA button
- Highlighted "popular" variant
- Bilingual content

### HelpMeChoose
- Interactive wizard for plan selection
- Questions about use case, volume, urgency

### ComparisonTable
- Side-by-side feature comparison across tiers

### PricingFAQ
- Accordion FAQ specific to pricing

### MarketplaceSection
- Add-on products and one-time purchases

---

## Analytics Integration Pattern

All interactive components follow this pattern:
```typescript
import { trackEvent } from '../services/analytics-service';

// On user action:
trackEvent('event_name', { 
  source: 'component_name',
  ...contextual_properties 
});
```

### Events Fired by Components

| Component | Event | When |
|-----------|-------|------|
| HomeAudienceRouting | icp_card_clicked | Card click |
| Home hero | referral_cta_clicked | Urgent CTA click |
| Home hero | primary_cta_clicked | Main CTA click |
| ChatV2 | urgent_signal_detected | Urgent regex match |
| ChatV2 | jurisdiction_entered | Jurisdiction change |
| ChatV2 | ai_answer_requested | Message sent |
| ChatV2 | human_help_clicked | Help button |
| Signup | signup_started | Form submit |
| Signup | signup_completed | Success |
| Checkout | payment_started | Payment init |
| Checkout | payment_completed | Payment success |

---

## E2E Smoke Tests (tests/e2e/chat-prefill-smoke.spec.ts)

### Test: Prefill Consumption
- Injects HTML-tagged string into `sessionStorage['ez_chatbot_prefill']`
- Navigates to `/chat`
- Accepts privacy gate if visible
- Asserts textarea contains sanitized text (HTML stripped)
- Asserts sessionStorage key is cleared (consumed once)
- Waits 1.5s and asserts no assistant message appeared (no auto-submit)

### Test: Fallback on API Failure
- Routes all `/functions/v1/openai-chat` requests to 503
- Navigates to `/chat`, accepts privacy gate
- Fills and sends a question manually
- Asserts an assistant response appears within 15s (local fallback or error message)

### Route Mock Pattern
```typescript
await page.route('**/functions/v1/openai-chat**', (route) => {
  route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"forced"}' });
});
```

---

## Design System Summary

### Colors
- Primary actions: teal-500 / teal-600
- Backgrounds: navy-900 (dark), white/slate-50 (light)
- Text: navy-900 (headings), navy-600 (body)
- Urgent/crisis: red-300/red-600, amber/yellow for warnings
- Success: green/teal
- No purple/indigo used anywhere

### Typography
- Headings: Inter 700/800
- Body: Inter 400/500
- Display: Playfair Display (sparingly)

### Spacing
- 8px base grid
- Section padding: py-12 to py-20
- Card padding: p-4 to p-6
- Gap: gap-3 to gap-8

### Responsive Breakpoints
- xs: 360px (small mobile)
- sm: 640px (large mobile)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (wide)

### Accessibility
- Skip links on all pages
- Focus rings on all interactive elements
- aria-labels on icon-only buttons
- aria-expanded on accordions/drawers
- Minimum touch target: 44px
- Reading preferences toolbar (font size, contrast)
- Reduced motion support

---

## Guided Intake Framework (Round 7.1)

### Components (src/components/intake/)

| Component | Purpose |
|-----------|---------|
| GuidedIntakeShell | Mobile-first shell with progress bar, back button, save notice, scope disclaimer |
| ProgressStepper | "Step X of Y" with percentage bar and optional labels, bilingual |
| SaveAndResumeNotice | Reassurance copy ("Progress saved on this device"), banner or inline variant |
| PlainLanguageHelp | Expandable "Why we ask this" helpers at legal decision points, bilingual |
| NextStepConfirmation | Post-submit "What happens next" with 4 step cards and CTAs |
| EmergencyTriageNotice | Danger/crisis banner with DV hotline (1-800-799-7233) and emergency resource links |

### Design Principles
- Mobile-first layout
- Clear step count visible at all times
- Save-and-resume reassurance (localStorage persistence)
- Plain-language helper text at every legal decision point
- Confirmation screen after submission
- English and Spanish copy via LanguageProvider
- Always includes scope disclaimer: "ezLegal provides legal information and tools, not legal advice."
- No legal advice wording anywhere

---

## Ethical AI Trust Components (Round 7.1)

### Components (src/components/trust/)

| Component | Purpose | Variants |
|-----------|---------|----------|
| ScopeBoundaryCard | Can/cannot do lists with Trust Center link | compact, full |
| AIGovernanceSummary | 4 AI principles with governance page links | card, strip |
| AccessToJusticeCard | Hardship screening, free tier, pro bono links | full, compact |
| HumanEscalationCard | Context-aware attorney/legal-aid escalation | chat, intake, checkout, general |
| DataUsePlainLanguage | What/how/who/delete data explainer | full, compact |

### Reusability
- Used across landing pages, checkout, chat, and intake flows
- All components are fully bilingual (EN/ES)
- All components link to existing trust routes (/trust-center, /ai-governance, /privacy, /pro-bono)
- No unsupported claims (no "100% secure", "guaranteed outcome", "lawyer-approved")

### ScopeBoundaryCard Content
**Can do**: Explain concepts, help understand rights, generate documents, identify next steps, connect with directories
**Cannot do**: Provide legal advice, represent in court, guarantee outcomes, replace an attorney

---

## Governed Intake Architecture (Round 7.2)

### Type System (src/lib/intake/types.ts)

| Type | Values |
|------|--------|
| ICP | individual_es, smb, organization |
| TriageRiskLevel | normal, urgent, emergency |
| AffordabilityStatus | cannot_pay, low_cost_needed, can_pay |
| HumanEscalationType | legal_aid, attorney_review, partner_org, emergency_resource |

### Route Config (src/lib/intake/routes.ts)

| ICP | Steps | Checkout Gating |
|-----|-------|-----------------|
| individual_es | triage, affordability, issue, details, confirmation | Emergency blocks; cannot_pay blocks |
| smb | segment, details, review_option, acknowledgment, confirmation | Checkbox acknowledgment required |
| organization | org_type, jurisdictions, capacity, data_consent, confirmation | Partner demo only (no checkout) |

### Acceptance Checks
- No intake route submits without showing scope boundary at least once (requiresScopeBoundary flag)
- No emergency triage state proceeds to paid checkout (blockCheckout flag)
- No SMB checkout without checkbox acknowledgment (CHECKOUT_ACKNOWLEDGMENT text)
- Attorney review recommended for: employment_contract, investor_funding, litigation_dispute, government_regulatory, high_value_transaction

### SpanishTriageScreen (src/components/intake/SpanishTriageScreen.tsx)
- 5-step bilingual triage
- Affordability screening first (shows free help before paid)
- Emergency detection blocks checkout entirely
- Cautious legal-aid language: "Podemos ayudarle a buscar opciones"
- Analytics: spanish_triage_started, spanish_free_help_selected, spanish_emergency_triage_shown, spanish_paid_document_selected

### BusinessIntakeSegmentation (src/components/intake/BusinessIntakeSegmentation.tsx)
- Need segmentation: create_contract, review_document, recurring_docs, attorney_review, not_sure
- Attorney review recommendation on high-risk document types
- Scope acknowledgment checkbox required before proceeding
- Analytics: smb_segment_selected, smb_attorney_review_selected, smb_checkout_scope_acknowledged, smb_intake_completed

### OrganizationPartnerIntake (src/components/intake/OrganizationPartnerIntake.tsx)
- 5-step partner profile collection
- Data consent language (referral sharing, access limits, deletion, no-sale)
- Warm referral and conflict-check configuration
- Cautious reporting language: "Designed to support reporting workflows"
- Analytics: org_partner_intake_started, org_partner_intake_completed, org_demo_clicked

### TrustCTABlock (src/components/trust/TrustCTABlock.tsx)
- Reusable trust link block (standard/compact variants)
- Links: Trust Center, Privacy, AI Governance, Scope & Disclaimers
- Added to: EspanolLanding, ForBusiness, ForOrganizations

### Governance Evidence Status (src/lib/intake/governanceStatus.ts)
- 8 governance items with PolicyStatus tracking
- Available (with URL): training_data_policy, retention_policy, human_review_policy, bias_monitoring, language_limitations
- Not published: model_provider, evaluation_policy, incident_response

---

## Round 7.3 — Production Infrastructure Components

### AttorneyReviewConfirmation (src/components/intake/AttorneyReviewConfirmation.tsx)
- Tier selection (Basic/Detailed/Full Revision) with pricing and includes list
- Urgency picker (Standard/Expedited/Emergency) with turnaround estimates
- 4 required acknowledgment checkboxes (bilingual EN/ES)
- Confirm/Decline actions; price displayed on confirm button
- Scope disclaimer at bottom

### GovernanceEvidencePanel (src/components/trust/GovernanceEvidencePanel.tsx)
- Full variant: progress bar, completion percentage, policy list with status badges (Published/In Progress/Planned), links to published policies
- Compact variant: progress bar only with count summary
- Integrated into Trust Center page below AI Governance section

### PartnerDashboard (src/pages/PartnerDashboard.tsx)
- Auth-gated page at /partner-dashboard
- Overview tab: stat cards (total, new, accepted, declined referrals), profile summary
- Referrals tab: referral cards with status badges, accept/decline/conflict actions for new referrals
- Settings tab: read-only profile display
- Empty state directs to /for-organizations intake
- Requires partner profile via getPartnerProfile() persistence call

### Attorney Review Library (src/lib/attorneyReview/)
- types.ts: ReviewStatus (6 states), ReviewUrgency (3 levels), AttorneyReviewRequest interface, ReviewAcknowledgment, bilingual REVIEW_ACKNOWLEDGMENT_TEXTS, REVIEW_STATUS_DISPLAY
- pricing.ts: 3 pricing tiers with urgency multipliers, calculateReviewPrice(), formatPriceCents(), getEstimatedTurnaround()
- requests.ts: createReviewRequest(), submitReviewRequest(), acknowledgeScope(), cancelReviewRequest(), getUserReviewRequests(), getReviewRequestById()
- analytics.ts: 5 attorney-review-specific dataLayer events

### Legal-Aid Matching Library (src/lib/legalAid/)
- types.ts: LegalAidOrganization (14 fields including VerificationStatus), LegalAidMatchParams, LegalAidMatchResult
- directory.ts: 8 organizations (AZ x2, CA, TX, NY, FL, IL, National DV Hotline), all needs_verification
- matching.ts: matchLegalAidOrganizations() scoring algorithm, getEmergencyResources(), hasVerifiedMatch()

### Intake Analytics (src/lib/intake/analytics.ts)
- 14 typed event definitions covering full intake lifecycle
- markIntakeStart(), getIntakeDurationMs(), clearIntakeStart() session timing
- Pushes to window.dataLayer when available

### Intake Recovery (src/lib/intake/recovery.ts)
- saveRecoveryState(): persists ICP, step, language, arbitrary data to localStorage
- getRecoveryState(): retrieves with 72-hour TTL (auto-clears expired)
- clearRecoveryState(), hasRecoveryState() utilities

---

## Round 7.4 — Security, Privacy & Evidence Hardening

### Security Helpers (src/lib/intake/security.ts)
- SecurityCheckResult / PartnerSecurityResult types
- requireAuthenticated(): returns userId or fails with reason
- requirePartnerAccess(): verifies partner profile ownership, returns partnerProfileId
- requireReferralOwnership(referralId): verifies referral belongs to user's partner org
- requireRequestOwnership(requestId): verifies attorney review request belongs to user
- All functions fail closed — return { ok: false, reason } on any missing state

### Privacy-Safe Analytics (src/lib/intake/analytics.ts)
- SanitizedAnalyticsPayload enforced type: event, anonymousSessionId, icp, stepId, stepIndex, totalSteps, language, issueCategory, timestamp, elapsedMs, completionStatus, uiMetadata
- sanitizePayload() strips non-allowlisted fields before pushing to dataLayer
- Privacy constraint documented at top of file

### Recovery Privacy (src/lib/intake/recovery.ts)
- RecoveryState stores only: icp, stepId, stepIndex, language, selections (issueCategory, jurisdiction, businessSegment, orgType)
- RECOVERY_COPY: bilingual banner/button text for resume/clear UX
- clearSavedProgress(), getRecoveryExpiration(), hasRecoverableSession()

### Attorney Review Types (src/lib/attorneyReview/types.ts) — v2
- 10-state ReviewStatus: draft, submitted, pending_conflict_check, accepted_by_attorney, declined, in_review, changes_requested, completed, cancelled, refunded
- 6 ReviewAcknowledgment fields (added timelinesAreEstimates, jurisdictionMayAffect)
- ATTORNEY_REVIEW_DISCLOSURES: 7 disclosure points + notIncluded list, bilingual
- Fulfillment fields: assignedAttorneyId, attorneyAcceptedAt, completedAt, conflictCheckStatus, requestedTurnaround

### LegalAidReferralCard (src/components/shared/LegalAidReferralCard.tsx)
- Shows organization name, eligibility notes, verification status badge
- Match reason chips with bilingual labels (10 reasons)
- Contact: phone link, website link
- Languages, geographic area, last verified date
- Organization disclaimer
- "What to expect" 3-step guidance
- LEGAL_AID_CAVEATS footer caveat

### Legal-Aid Matching v2 (src/lib/legalAid/matching.ts)
- Spanish priority boost (+1 for es language match)
- Affordability boost (+1 for cannot_pay + accepts_referrals)
- Verification boost (+1 for verified status)
- Recency boost (+1 if lastVerifiedAt < 90 days)
- emergencyExclusion field respected in getEmergencyResources()
- getNeedsVerificationCount() helper

### Governance Evidence Model v2 (src/lib/intake/governanceStatus.ts)
- PolicyStatus: implemented | partial | planned | blocked
- GovernanceCategory: 6 categories
- 16 evidence items with: category, evidencePath, lastUpdated, owner, userImpactEn/Es, openGap, nextAction
- GOVERNANCE_CATEGORY_LABELS bilingual
- GOVERNANCE_TRUST_STATEMENTS bilingual status explanations
- Helpers: getPublishedPolicies, getPartialPolicies, getPlannedPolicies, getEvidenceByCategory

### GovernanceEvidencePanel v2 (src/components/trust/GovernanceEvidencePanel.tsx)
- Full variant: progress bar, implemented/remaining counts, category sections, per-item: status badge, user impact, open gap, last updated
- Compact variant: progress bar with count
- Uses 4-state status (implemented/partial/planned/blocked)
- Disclaimer explaining status terminology
