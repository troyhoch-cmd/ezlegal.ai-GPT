# ezLegal.ai - Dashboard Experience (Authenticated User Hub)

Generated: 2026-05-23T06:30:00.000Z

---

## Dashboard Overview (src/pages/Dashboard.tsx)

The Dashboard is the authenticated user's primary workspace. It adapts based on user_type (individual vs business) and a "More tools" toggle for progressive disclosure.

### Route
`/dashboard` (requires authentication)

---

## Header Banner

- **Background**: Teal gradient (from-teal-600 to-teal-700)
- **Heading**: "Your Action Plan, {firstName}" (or Spanish: "Tu Plan de Accion, {firstName}")
- **Subheading**: "Tasks and next steps for your legal issues"
- **Primary CTA**: "Ask a Question" button -> `/chat` (white pill, MessageSquare icon + ArrowRight)

---

## Conditional Onboarding Components

### PostPurchaseActivation
Shown after a user completes a purchase (issue pack, subscription, etc).

**UI**: White card with progress bar and 4-step checklist:

| Step | Icon | Label | CTA | Route |
|------|------|-------|-----|-------|
| 1 | Download | Download your action plan | Go to Documents | /dashboard/documents |
| 2 | FileText | Fill in your templates | Open Templates | /dashboard/documents |
| 3 | Calendar | Review your deadlines | View Deadlines | /dashboard/matters |
| 4 | Users | See free, low-cost, or attorney options | Find Help | /dashboard/lawyer-profiles |

**Behavior**:
- Checkbox toggles mark steps complete
- State persisted to `localStorage` key `ez_activation_${user.id}`
- Activity logged to `activity_logs` table on toggle
- Dismissible (X button), hidden when all 4 steps completed

### TrialOnboarding
Shown only for `user_type === 'business'` users on trial plans.

**UI**: White card with blue progress bar and 4-step checklist:

| Step | Icon | Label | Route |
|------|------|-------|-------|
| 1 | FileText | Generate your first document | /dashboard/documents |
| 2 | Zap | Browse the template library | /dashboard/documents |
| 3 | Users | Invite a teammate | /dashboard/profile |
| 4 | BarChart3 | Run your first AI compliance check | /dashboard/ai-assistant |

**Footer**: CreditCard icon + "No charge until trial ends. Cancel anytime." with "Manage billing" link to `/dashboard/profile`

**Behavior**:
- Days remaining badge shown if `trialEndDate` prop provided
- State persisted to `localStorage` key `ez_trial_onboard_${user.id}`
- Dismissible, hidden when all steps complete

---

## Main Action Grid ("What do you need help with?")

### Simple Mode (individual users, advanced tools hidden)
3-column grid with 3 tiles:

| Tile | Icon | Icon Color | Title | Description | CTA Text | Route |
|------|------|------------|-------|-------------|----------|-------|
| AI Chat | MessageSquare | teal-600 | AI Chat Assistant | Ask legal questions in plain English | Start chatting | /chat |
| Find Lawyer | Users | orange-600 | Find a Lawyer | Browse verified attorneys by practice area | Browse lawyers | /dashboard/lawyer-profiles |
| Action Plans | FileText | green-600 | Your Action Plans | Step-by-step action plans and document templates | View action plans | /pricing |

### Advanced Mode (toggle "More tools" pill or business/org user_type)
4-column grid with 7 tiles (3 from simple + 4 additional):

| Tile | Icon | Style | Title | Description | CTA Text | Route |
|------|------|-------|-------|-------------|----------|-------|
| AI Lawyer Match | Sparkles | teal gradient (featured) | AI Lawyer Match | Smart matching to the right attorney | Try it now | /dashboard/ai-assistant |
| Documents | FileText | green-600 | Generate Documents | Create legal documents with AI assistance | Create a document | /dashboard/documents |
| Research | Search | teal-600 | Legal Research | Search statutes, case law, and regulations | Start research | /dashboard/research |
| Outcome Prediction | Brain | teal-to-cyan gradient (featured) | Outcome Scenarios | AI analysis of possible case outcomes | Analyze your case | Opens modal |

### "More tools" Toggle
- Pill button in section header (right side)
- Text: "More tools" / "Fewer options" (EN), "Mas herramientas" / "Menos opciones" (ES)
- Zap icon
- Persisted to `localStorage` key `ezlegal-dashboard-advanced`
- Only shown for individual user_type

---

## Purchases & Subscriptions Section

Shown only when user has entitlements (from `user_entitlements` table).

### Header
- Award icon + "Your Purchases & Subscriptions"

### Entitlement Cards (3-col grid)
Each card shows:
- **Product type** (capitalized, replacing underscores): issue_pack, subscription, case_prediction, negotiation_pack
- **Status badge** with color coding:
  - `active`: Green - "Active"
  - `pending`: Amber - "Processing"
  - `expired`: Slate - "Expired"
  - `refunded`: Blue - "Refunded"
  - `payment_failed`: Red - "Payment Failed"
- **Product ID** (human-readable, replacing hyphens with spaces)
- **Expiration date** (if applicable)
- **Action links**:
  - Expired: "Renew" -> `/pricing`
  - Payment failed: "Update payment method" -> `/pricing`

### Data Source
- `getUserEntitlements(user.id)` from entitlement-service.ts
- Queries `user_entitlements` table filtered by user_id, ordered by created_at desc
- Statuses included: active, pending, expired, payment_failed, refunded

---

## Recent Activity Section

Shown only when user has chat history.

### Header
- "Recent Activity" with "View All" link -> `/dashboard/history`

### Activity Items (max 3 shown)
Each item:
- MessageSquare icon in teal circle
- Truncated message text (60 chars + ellipsis)
- Date string (toLocaleDateString)

### Data Source
- `chat_messages` table, user's messages (role = 'user'), ordered by created_at desc, limit 5

---

## Attorney Connections Section (Advanced Mode Only)

Renders `<AttorneyConnections compact limit={3} />` component.

### Pipeline Display
Connections progress through 3 stages:
1. **Requested** (SLA: < 1 day)
2. **In Review** (SLA: 1-3 business days)
3. **Matched** (no SLA)

### Connection Types
- Chat (MessageSquare icon)
- Appointment (Calendar icon)
- Quote (DollarSign icon)

### Card Elements
- Lawyer photo, name, practice areas
- Connection type icon + status badge
- Last activity date
- New connection indicator (< 2 hours old)
- Stale connection warning (pending > 5 days)

### CTAs
- "Find Attorneys" -> `/dashboard/lawyer-profiles`
- "View All Connections" -> `/dashboard?tab=connections`
- "Open Chat" / "View Details" -> Opens LawyerConnectionModal

### Data Source
- `lawyer_connections` table with lawyer_id, lawyer_name, connection_type, status, last_activity_at
- `appointment_requests` table for appointment details
- `quote_requests` table for quote details
- `arizonaLawyers` static data for lawyer profiles

---

## Browse by Practice Area (Advanced Mode Only)

### Header
- "Browse by Area" with BookOpen icon

### Practice Area Grid (5-col on lg, 3-col on md, 2-col on xs)
11 practice areas as expandable buttons:

| Area | Icon | Color |
|------|------|-------|
| Bankruptcy | Landmark | slate |
| Criminal | Scale | red |
| Family | Heart | rose |
| General Practice | Briefcase | blue |
| Immigration | Globe | sky |
| Intellectual Property | Copyright | teal |
| Personal Injury | AlertTriangle | orange |
| Real Estate | Home | green |
| Trusts & Estates | Users | amber |
| Wills & Probate | ScrollText | slate |
| Taxes | (implied) | (implied) |

### Expanded Category Panel
- Animated slide-in panel below grid
- Shows subcategories as clickable links (3-col grid)
- Each subcategory navigates to `/chat` with `state: { topic: "Area: Subcategory" }`
- X button to close panel
- Total 150+ subcategories across all practice areas

### Subcategory Examples
- **Bankruptcy**: Chapter 7, Chapter 13, Proof of Claim, Motions
- **Criminal**: DUI, Assault, Domestic Violence, Expungement, Traffic Violations
- **Family**: Divorce, Custody, Child Support, Adoption, Guardianship
- **Immigration**: H-1B, Green Card, DACA, Citizenship, Deportation
- **Real Estate**: Eviction, Foreclosure, Lease Agreements, Title Search
- **Personal Injury**: Auto Accidents, Medical Malpractice, Wrongful Death

---

## Attorney Referral Footer Banner

Full-width dark banner (bg-navy-900) at page bottom.

- **Shield icon** + "Need a human attorney?" heading
- **Subtext**: AI guidance note (AI is informational, not legal advice)
- **CTA**: "Browse Attorneys" button -> `/dashboard/lawyer-profiles` (Users icon + ArrowRight)
- White button with navy text, rounded-lg

---

## Outcome Prediction Modal (triggered from Brain tile)

Full-screen overlay modal with 2-phase flow:

### Phase 1: PredictionConsentGate
**Header**: Shield icon + "Before You Continue"

**What This Tool Does (teal box)**:
- Analyzes historical case data for estimated outcome scenarios
- Identifies patterns and factors that may influence results
- Predictions are statistical estimates, not deterministic

**What This Tool Does NOT Do (red box)**:
- Provide legal advice or representation
- Guarantee any particular outcome
- Replace a licensed attorney's judgment
- Create an attorney-client relationship

**Required Actions**:
- Select jurisdiction (dropdown)
- Check all 4 acknowledgment items:
  1. Predictions are not guarantees
  2. Based on historical data only
  3. Should consult a licensed attorney
  4. No attorney-client relationship created

**CTAs**:
- "Go Back" -> Closes modal
- "I Understand, Continue" (disabled until all checks) -> Phase 2

### Phase 2: OutcomePredictionWidget
4-step wizard:

**Step 1 - Case Type & Jurisdiction**:
- Jurisdiction dropdown (50 states)
- Case type grid (Consumer, Housing, Employment, Family, Injury, etc.)

**Step 2 - Factor Questions**:
- Dynamic Yes/No and select questions per case type
- Progress bar
- "Why this matters" collapsible explanations

**Step 3 - Review**:
- Summary of Location, Case Type, Factors Analyzed
- AI Analysis Preview

**Step 4 - Results**:
- Circular progress score (0-100)
- Outcome label: "Likely Favorable" / "Settlement Likely" / "Uncertain" / "Challenging Outlook"
- Confidence badge (High/Medium/Low)
- Confidence interval range slider
- Key Factors Analyzed (up to 8) with positive/negative/neutral impact indicators
- Recommended Next Steps (prioritized: immediate, soon, when_ready)
- Strategic Recommendations (up to 5)
- State-specific disclaimers (CA, NY, TX, FL have custom; others get default)

**Prediction Algorithm**:
- Base success rate from case config + jurisdiction modifier
- Factor answers adjust score (boolean: full weight if yes; select: configured option weight)
- Score clamped 0-100, averaged with AI response score
- Confidence intervals: High ±8%, Medium ±15%, Low ±22%

**CTAs in Results**:
- "New Prediction" -> Resets wizard
- "Connect with Attorney" -> `/dashboard/lawyer-profiles`
- "AI Governance" -> `/ai-governance`
- "Full Disclaimers" -> `/scope-disclaimers`

### Data Source
- Edge Function: `/outcome-prediction` (POST)
- Local: `PREDICTION_CASE_TYPES` from `src/data/predictionFactors.ts`

---

## Dashboard Sub-Pages

### /dashboard/history (History.tsx)

**Header**: "Activity Center" with Refresh, Export (CSV), "New Chat" buttons

**Stats Bar**: 30-day activity statistics (ActivityStatsBar component)

**Filters**:
- Search input (text search across titles)
- Favorites toggle (star icon)
- Type filter: Chat, Lawyer Matches, Documents, Predictions, Cases, System
- Date filter: All time, Today, Last 7 days, Last 30 days
- Clear filters button

**Activity Timeline**:
- Grouped by date (Today, Yesterday, This Week, This Month, etc.)
- Each item shows type icon, title, description, timestamp
- Load More pagination
- Free limit: 50 items, then shows premium upgrade banner

**Premium Upgrade Banner (free tier, >50 items)**:
- Crown icon + "Unlock Premium Analytics & Unlimited Exports"
- Features: Advanced Analytics, Unlimited Exports, Full History
- "Upgrade Now" CTA -> `/pricing`

**Export**: CSV download (limited to 10 items for free users; shows modal with upgrade prompt)

**Data Source**: `activity_log` table, `chat_messages` table (for legacy migration)

---

### /dashboard/documents (Documents.tsx)

**Header**: "Legal Documents" + "Generate professional legal documents in minutes"

**Document Intelligence Hub** (collapsible):
- Features: Clause navigation, Risk detection, Clause suggestions, Intake triage, Research planner
- Opens DocumentIntelligencePanel

**User Type Warnings**:
- Organization: "Documents are templates requiring attorney review"
- Business: "Recommended templates for business users"

**Search & Filters**: Title/type search, jurisdiction filter, "Upload to Analyze", "Generate Document"

**Document Grid**: 3-col cards with title, type, preview, date, jurisdiction badge, Analyze/Download buttons

**Generate Document Flow** (4 phases):
1. Template selection (20+ templates or "Custom Document")
2. Form fields (dynamic per template)
3. Custom document form with drafting posture selection:
   - Quick Form (free) - Clean fillable template
   - Associate Draft (free) - Mid-level, jurisdiction-aware
   - Senior Partner (premium) - Multi-pass with authority grounding
4. Preview & Save (editable title, jurisdiction, full preview)

**Templates Available**: 501(c)(3), LLC Formation (single/multi), Corporate Bylaws, NDA, Employment Agreement, Demand Letter, Settlement Agreement, Power of Attorney, Terms of Service, 20+ more

**Data Source**: `documents` table, `drafting_mode_presets` table, Edge Function `/openai-chat`

---

### /dashboard/research (Research.tsx)

**Tabs**: "New Research" | "Research History" (with query count badge)

**Research Form**:
- Query input (required): "Search statutes, case law, regulations, and legal precedents..."
- Jurisdiction selector (Federal + 50 states, default: FED)
- Practice area selector (15 categories)
- Source filters (toggleable): Case Law, Statutes, Regulations, Legal Precedents

**Results Structure**:
1. **Research Summary** (2-3 paragraph overview)
2. **Relevant Authorities** (cards with source type, citation, relevance badge, expandable summary)
3. **Practical Guidance** (considerations, strategies, deadlines, next steps)
4. **Disclaimer Banner** (amber, standard informational-only notice)

**Source Type Color Coding**:
- Case Law: Teal
- Statute: Emerald
- Regulation: Amber
- Precedent: Navy

**History Tab**: Query cards with date, practice area badge, "Research Again" link, results preview

**Data Source**: `research_queries` table, Edge Function `/openai-chat`

---

### /dashboard/ai-assistant (AIAssistant.tsx)

**Header**: "ezLegal.ai (TM)" title + "Powered by Legalbreeze (R)" subtitle

**Stats Grid** (3 items):
- 5 seconds - Response time
- 99.7% - Cost savings
- 2-4 min - Lawyer response time

**Chat Interface**:
- Blue-to-navy gradient header
- 500px height chat window
- Export conversation button (appears after first message)

**Empty State** (4 quick actions in 2x2 grid):
- "Review Contract" - Get contract analysis
- "Legal Dispute" - Understand your options
- "Start Business" - Formation guidance
- "Employment Issue" - Know your rights

**Input Area**:
- File upload button (PDF, DOC, DOCX, TXT, max 10MB)
- Voice input button (Web Speech API, red pulse when listening)
- Text input (multiline)
- Send button

**Practice Area Detection** (19 categories via keyword matching):
- DUIs, Traffic, Guardianship, Consumer Protection, Criminal, Dependency, Employment, Family Law, Healthcare, Housing, Section 8, Immigration, Personal Injury, Rights Restoration, Social Security, Trusts, Wills & Probate

**Browse Topics Library**: 19 expandable categories with 4-5 suggested prompts each

**Attorney Directory Section** (visible after messages):
- "Connect with Attorneys" header
- Practice area filtered from message content
- 2 info boxes: "2-4 min response time", "Verified bar-licensed attorneys"
- RealLawyerDirectory component
- "Browse Attorneys" CTA

**Data Source**: `chat_messages` table, `chat_attachments` table, Edge Function `/openai-chat`

---

### /dashboard/lawyer-profiles (LawyerProfiles.tsx)

Renders the RealLawyerDirectory component with full attorney browsing, filtering, and connection request features. (Documented in site-review-5.)

---

### /dashboard/matters (Matters.tsx)

Case/matter management view with deadline tracking and action plan checklists.

---

## Chat Page Sidebar (from screenshot analysis)

The ChatV2 page shows a left sidebar navigation (visible in the screenshot):

### Sidebar Navigation Links

| Section | Items |
|---------|-------|
| Primary | Workspace, Action Plan, History |
| Tools (expandable) | Documents, Contractor Forms (NEW badge), AI + Lawyer Mat... (NEW badge), Case Outcom... (READY badge), Research, Lawyer Profiles, Website Widgets |
| Resources (expandable) | (collapsed in screenshot) |
| Bottom | Profile, Contact |

### Main Chat Area (from screenshot)

**Top Bar**:
- "AI legal information" label + Lock icon "Encrypted"
- Jurisdiction badge: "IA law" with "Change" link
- X dismiss button

**Welcome Section**:
- AI avatar icon
- "What do you need help with?"
- Disclaimer: "Legal information, not legal advice. Learn more"

**Quick Action Tiles** (2x2 grid):
- "Ask a question" (MessageSquare icon)
- "Upload a document" (FileText icon)
- "Review deadlines" (Calendar icon)
- "Find legal aid" (Users icon)

**Answer Style Selector**:
- Label: "ANSWER STYLE"
- Current: "Simple explanation" with Settings icon dropdown

**GuidedIssueLauncher** (issue cards grid):
- Heading: "What kind of legal issue are you facing?"
- Subheading: "Choose a common issue, or ask in your own words below."
- 6 issue cards visible (2x3 grid):
  - "Housing or eviction" - Rent, repairs, eviction notice, security deposit
  - "Debt or collections" - Debt collectors, medical bills, wage garnishment
  - "Work or wages" - Unpaid wages, wrongful termination, harassment
  - "Family or divorce" - Divorce, custody, child support
  - "Small business" - Contracts, licenses, disputes
  - "Identity theft or scam" - Fraud, identity theft, scams

**Data Source**: `issue_launcher_cards` table with slug, title, description, icon, sort_order, prompt_seed, audience, is_active

**Behavior**: Clicking a card populates the chat input with the card's `prompt_seed`

**Input Area**:
- Placeholder: "Ask in plain English, like 'Can my landlord raise rent mid-lease in IA?'"
- Send button (teal, ArrowUp icon)
- Helper text: "You'll get a plain-language explanation, possible next steps, and trusted resources when available."
- Disclaimer: "AI provides legal information, not legal advice. Always consult a licensed attorney for specific guidance. Privacy"
- Bottom actions: "... More He..." (More Help drawer), "Reading" (reading preferences)

---

## AnswerModeSelector Component

Dropdown pill for selecting AI response format.

### Modes Available

| Mode | Icon | Label | Description |
|------|------|-------|-------------|
| simple | Sparkles | Simple explanation | Plain-language answer for everyday understanding |
| step_by_step | ListChecks | Step-by-step help | A numbered checklist to move forward |
| legal_aid_prep | Scale | Prepare for legal aid | Organize facts, questions, and documents for a lawyer |
| draft | FileEdit | Draft a letter or checklist | Generate a starting document you can edit |
| espanol | Languages | Espanol | Respuesta en espanol |

### Persistence
- Loads from `profiles.answer_mode` (Supabase)
- Saves on change to database
- Falls back to 'simple' if no saved preference

---

## GuidedIssueLauncher Component

### Issue Cards
Loaded from `issue_launcher_cards` Supabase table.

**Card UI**:
- Lucide icon in emerald-colored rounded box
- Title (bold, slate-900)
- Description (small, slate-600)
- Hover: -translate-y-0.5, border shifts to emerald-400

**Grid**: 2 cols mobile, 3 cols sm+

**Audience Filtering**:
- Props accept `audience?: 'all' | 'individual' | 'business' | 'legal_aid'`
- Shows cards where `card.audience === 'all'` OR `card.audience === audience`

**Analytics**: Logs `issue_card_clicked` to `engagement_analytics` table with slug, title

---

## Usage Statistics (loaded on mount)

### Stats Tracked
```typescript
interface UsageStats {
  chatsToday: number;        // from chat_messages (today, role='user')
  chatsThisMonth: number;    // from chat_messages (this month, role='user')
  documentsCreated: number;  // currently hardcoded 0
  researchQueries: number;   // currently hardcoded 0
  dailyLimit: number;        // 5 (free tier)
  monthlyLimit: number;      // 150 (free tier)
}
```

### Data Source
- `chat_messages` table filtered by user_id, role='user', date ranges

---

## State Management

### URL Parameters
- `?prediction=open` -> Auto-opens outcome prediction modal on load (then removed from URL)

### Local Storage Keys
- `ezlegal-dashboard-advanced` -> Toggle state for advanced tools
- `ez_activation_${user.id}` -> Post-purchase activation step completion
- `ez_trial_onboard_${user.id}` -> Trial onboarding step completion

### Auth Context
- `user` -> Supabase auth user (id, email)
- `profile` -> User profile (full_name, user_type, role, answer_mode, preferred_jurisdiction)

---

## Accessibility & Responsive Design

### Responsive Grid Breakpoints
- **Mobile** (< 640px): Single column, full-width tiles
- **sm** (640px): 2-column grids
- **md** (768px): 2-3 column grids depending on mode
- **lg** (1024px): 4-column main grid (advanced), 5-column practice areas
- **xl** (1280px): Max-width container (max-w-7xl)

### Interactive Elements
- All tiles have hover states (border-color change, shadow-xl, translate-x on arrows)
- Focus rings on all clickable elements
- Animated transitions on expand/collapse
- Loading spinner during data fetch

---

## Trust & Safety Elements on Dashboard

| Location | Element |
|----------|---------|
| Header banner | "Your Action Plan" framing (not "legal advice") |
| AI Chat tile | Description says "Ask legal questions in plain English" |
| Attorney footer | "AI is informational, not legal advice" |
| Prediction consent | 4 mandatory acknowledgments before use |
| Documents page | "Templates requiring attorney review" warning |
| Research results | Amber disclaimer banner |
| AI Assistant | Practice area detection -> "Talk to an attorney" prompt |

---

## Analytics & Tracking

### Events from Dashboard
- Feature views tracked via `trackFeatureView()` (engagement-service)
- Entitlement status checks logged
- Activity log entries on post-purchase step completion

### Events from Sub-Pages
- `issue_card_clicked` (GuidedIssueLauncher)
- `logPrediction()` (OutcomePredictionWidget)
- `trackFeatureView('activity_center')` (History)
- `trackExport('activity_center')` (History export)
- Chat messages logged to `chat_messages` table
- Research queries logged to `research_queries` table
- Document generations logged to `document_generation_requests` table
