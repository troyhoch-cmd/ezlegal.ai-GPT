# ezLegal.ai - Trust, Safety & Legal Compliance

Generated: 2026-05-23T06:00:00.000Z

---

## Trust Architecture Overview

ezLegal.ai implements a multi-layered trust system covering privacy, legal compliance, AI safety, crisis response, and accessibility.

---

## Privacy Policy (src/pages/PrivacyPolicy.tsx)

### "Privacy at a Glance" Section (5 key answers)
1. **AI training**: Conversations and documents are NEVER used to train AI models
2. **Data retention**: Chat history 90 days default; documents until deleted; account data removed 30 days after closure
3. **Data export/delete**: Available anytime via account settings or privacy@ezlegal.ai
4. **Data sharing**: Only on opt-in (lawyer matching), with service providers, or when legally required. Never sold.
5. **Contact**: privacy@ezlegal.ai, 30-day response commitment

### Full Policy Sections
- What we collect
- How we use it
- Who we share with
- Data retention and deletion
- Security measures
- User rights (CCPA, state privacy laws)
- Children's privacy
- Changes notification

---

## Scope Disclaimers (src/pages/ScopeDisclaimers.tsx)

### Purpose
"What We Do & Don't Do" -- transparent service boundaries

### Key Declarations
- "Free legal information -- no attorney-client relationship"
- Clear delineation between information and legal advice
- Lists specific services provided vs. not provided
- Document template registry with:
  - Reviewer name and bar state
  - Last reviewed date
  - Review scope description
  - Per-template disclaimer

### Data Source
Pulls from `document_templates` table (public templates with review metadata)

---

## Trust Center (src/pages/TrustCenter.tsx)

### Sections
- Privacy & Data Practices
- Security measures
- AI governance and transparency
- Compliance framework
- Report a concern (TrustSafetyReportModal)
- Trust FAQ (TrustFAQ component)
- Safe use checklist (SafeUseChecklist component)

### Downloadable PDFs
Generates printable HTML documents for:
- Privacy & Data Practices Policy
- Security practices
- AI governance framework

---

## Urgent Signal Detection (src/lib/urgent-signal-detector.ts)

### Categories & Severity

| Category | Severity | Pattern Examples |
|----------|----------|-----------------|
| domestic_violence | CRITICAL | "domestic violence", "being abused", "afraid for my safety/life" |
| restraining_order | CRITICAL | "restraining order", "order of protection", "stalking" |
| custody_emergency | CRITICAL | "took my kid/child", "emergency custody", "child is in danger" |
| criminal | HIGH | "arrested", "arraignment", "criminal charge", "jail", "bail" |
| eviction | HIGH | "eviction notice", "being evicted", "lockout", "5-day notice" |
| wage_garnishment | HIGH | "wage garnishment", "garnished my wages", "bank levy", "frozen account" |
| court_deadline | HIGH | "court date", "summons", "served papers", "hearing tomorrow" |
| immigration | HIGH | "ICE at my door", "deportation", "removal proceeding", "asylum deadline" |

### Response Guidance (CATEGORY_COPY)
Each category has:
- **Title**: Brief urgency explanation
- **Help**: Specific guidance with verified hotlines/resources

Examples:
- DV: "Call 911 if in immediate danger. National DV Hotline: 1-800-799-7233 (24/7, free, confidential)"
- Criminal: "Do not answer police questions without a lawyer. Ask the court for a public defender."
- Eviction: "Eviction response deadlines can be as short as 5 days. Contact legal aid today."

### Integration Points
- ChatV2: Pre-submission detection, shows UrgentSignalCard before sending
- Analytics: Fires `urgent_signal_detected` with signal categories
- CrisisStrip: Always-visible crisis resource link

---

## Emergency Resources (src/pages/EmergencyResources.tsx)

### Structure
- State-filtered resource directory (AZ, CA, CO, FL, NV, NM, TX, UT + National)
- CrisisTriageGate component for initial assessment
- Categories:
  - Domestic Violence
  - Housing/Eviction
  - Immigration
  - Criminal/Arrest
  - Family Court
  - Benefits/Employment

### Resource Data
- Only verified, real phone numbers and organizations
- National + state-specific resources
- Availability hours noted
- Website links where available
- Bilingual names/descriptions

---

## AI System Prompt Safety Controls

### UPL (Unauthorized Practice of Law) Guardrails
1. Never uses directive language ("you should file", "you must sue")
2. Presents options, risks, and information -- never personalized legal conclusions
3. High-stakes matters: explicitly recommends consulting a licensed attorney
4. Never guarantees outcomes
5. States uncertainty explicitly; never fabricates citations

### Anti-Hallucination Protocol
- No citation if not verified
- Never invents case names, docket numbers, or statute sections
- States "limited verified sources" for unfamiliar jurisdictions
- RAG-only citation when authorities are provided

### Privacy Protection (in system prompt)
- Reminds users not to share unnecessary sensitive information
- SSN, immigration numbers, bank accounts, passwords, full addresses
- "Unless absolutely necessary" qualifier

### Prohibited Actions (in system prompt)
- No instructions for fraud
- No hiding assets guidance
- No law enforcement evasion
- No threatening others
- No falsifying evidence
- No misleading courts or agencies

---

## Consent & Compliance

### ConsentBanner Component
- Cookie/processing consent collection
- Stored in `consent_records` table
- Supports multiple consent types: ai_processing, privacy_notice, data_sharing

### Privacy Gate (ChatPrivacyGate)
- Shown before first chat message
- Explains what data is collected and how it's used
- Must accept to proceed
- Fires `privacy_gate_accepted` event

### Data Governance
- `data_governance_system` tables for policy management
- User data export/deletion via edge functions
- Audit logging for all data access

---

## Security Headers (Production)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
HSTS: max-age=63072000; includeSubDomains; preload
CSP: strict policy with allowlisted domains only
Permissions-Policy: camera=(), microphone=(self), geolocation=()
```

---

## RLS Hardening: Lawyer Connections

### Migration: `allow_anonymous_handoff_requests`
Tightens `lawyer_connections` table access:

- **Revokes**: SELECT, UPDATE, DELETE from `anon` role entirely
- **Anon INSERT**: Only allowed with `user_id IS NULL` (anonymous handoff requests)
- **Authenticated INSERT**: Only with `user_id = auth.uid()` (own connections)
- **Authenticated SELECT**: Only own records (`user_id = auth.uid()`)
- **Authenticated UPDATE**: Only own records (`user_id = auth.uid()`)
- **Authenticated DELETE**: Only own records (`user_id = auth.uid()`)

This prevents anonymous users from reading or modifying any lawyer connection records while still allowing them to submit handoff requests (which store null user_id).

---

## Trust Indicators Throughout UI

| Location | Trust Element |
|----------|--------------|
| Homepage hero | "Private. Free. Attorney-informed safeguards." |
| Homepage section | 4 trust badges (Private, Bilingual, Info/Triage, Not a law firm) |
| Chat input area | "Legal information, not legal advice" with scope link |
| Chat responses | Legal disclaimer appended by AI |
| Pricing | "Free urgent-help links. Not legal advice." |
| Signup | Privacy notice consent recording |
| Issue Packs | VerifiableTrustStrip, AttorneyReferralDisclosure |
| Navigation | Trust Center link |
| Footer | Privacy, Terms, Accessibility links |

---

## Round 7.4 — Security, Privacy & Evidence Hardening

### Supabase RLS Hardening
- `scope_acknowledged_at` column added to attorney_review_requests
- `assigned_attorney_id` column added with FK to auth.users
- Admin read/update policies on attorney_review_requests (via profiles.role = 'admin')
- Assigned attorney read policy on attorney_review_requests
- Admin oversight read policy on referral_routing_records
- All existing RLS preserved; new policies are additive only

### Client-Side Security (src/lib/intake/security.ts)
- `requireAuthenticated()` — fails closed if no user session
- `requirePartnerAccess()` — verifies user owns an org_partner_profiles row
- `requireReferralOwnership()` — verifies referral is assigned to user's partner profile
- `requireRequestOwnership()` — verifies attorney review request belongs to user
- PartnerDashboard uses requirePartnerAccess() + requireReferralOwnership() before mutations

### Privacy-Safe Analytics
- `SanitizedAnalyticsPayload` type: event, anonymousSessionId, icp, stepId, language, issueCategory, timestamp, elapsedMs, completionStatus, uiMetadata
- `sanitizePayload()` strips all fields not in allowlist before pushing to dataLayer
- Privacy constraint documented: no legal narratives, names, emails, phones, addresses, immigration status, financial data, case facts, or document contents

### Recovery Privacy
- localStorage stores only: ICP, stepId, stepIndex, language, and non-sensitive selections (issueCategory, jurisdiction, businessSegment, orgType)
- 72-hour TTL with automatic expiry
- `RECOVERY_COPY` bilingual user-facing text
- `clearSavedProgress()` user-triggered data removal

### Governance Evidence Model (16 items, 6 categories)
Statuses: implemented | partial | planned | blocked
- No "verified" claim unless evidence exists
- No "compliant" unless compliance established
- Each item has: category, status, evidencePath, lastUpdated, owner, userImpact, openGap, nextAction
- Categories: AI Limitations, Privacy & Data, Legal-Aid Referral, Attorney Review, Partner Controls, Accessibility & Language

### Remaining Security Assumptions
- Anonymous sessions use client-generated UUIDs — not cryptographically bound to users
- Attorney assignment relies on admin/service role (not yet operationally staffed)
- Legal-aid directory entries all marked needs_verification — no source URLs confirmed
- Partner profile is 1:1 with user_id (no multi-user org support yet)
