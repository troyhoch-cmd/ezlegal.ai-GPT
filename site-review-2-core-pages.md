# ezLegal.ai - Core User Pages (Home, Chat, Pricing, Auth)

Generated: 2026-05-24T06:00:00.000Z

---

## Home Page (src/pages/Home.tsx)

### Hero Section (compact above-the-fold layout)
- **Headline** (i18n): "Legal help you can understand — in English or Spanish."
- **Subheadline**: "Clear next steps for your legal situation. No jargon. No hourly fees. Plain-language information, documents, and referrals when you need a professional."
- **Primary CTA** (strongest emphasis): "Start with 3 questions" -> `/start` (PersonaIntake)
- **Secondary CTA** (border outline): "Ayuda en español" -> `/espanol`
- **Tertiary CTAs** (small outline pills): "Protect my business" -> `/for-business`, "Partner with ezLegal" -> `/for-organizations`
- **Scope disclaimer**: "This is legal information, not legal advice. No account required to start."
- All CTAs fire `home_cta_clicked` analytics event with cta identifier
- All button-style Links have `no-underline` class + global CSS rule preventing underlines on `a[class*="rounded-full"]`

### Trust & Scope Strip
- `TrustAndScopeStrip` component with 5 trust items (compact py-3)

### Urgent / Danger Escape Path
- Softened red banner (bg-red-50/70): "I may be in danger or facing an urgent deadline"
- CTA: "Get urgent resources" -> `/emergency-resources`
- Has `aria-label` for accessibility
- Fires `urgent_resources_clicked` event

### Three ICP Path Cards
- `ICPPathCards` component: Individuals & Families, Business Owners, Organizations
- Each routes to respective landing page

### Guided Issue Grid (6 cards)
- Housing & eviction, Employment & wages, Family & custody, Debt & collections, Small claims, Contracts & documents
- Each card links to `/chat` with `sessionStorage` prefill prompt
- Fires `issue_card_clicked` event

### Spanish Access Panel
- Bilingual banner: "Experiencia completa en español"
- CTA: "Empezar en español" -> `/espanol`

### Business Protection Panel
- Banner: "Own a business?"
- CTA: "Business legal help" -> `/for-business`

### Organization Partner Panel
- Banner: "Legal aid org or clinic?"
- CTA: "Partner with us" -> `/for-organizations`

### AI Governance Preview
- Banner: "Responsible AI, published publicly"
- CTA: "View governance" -> `/ai-governance`

### How It Works (2-column layout)
- Left card (teal): 3 numbered steps (Answer questions -> Get personalized guidance -> Take next step)
- Right card (white): "Built for trust and clarity" - 6 bullet points covering scope, language, encryption, referrals

### FAQ Accordion (4 questions)
- Is ezlegal.ai a law firm?
- Can I use this in Spanish?
- Is my information private?
- What if I need a real lawyer?

### Final CTA (dark background)
- "Ready to understand your options?"
- Scope disclaimer inline
- Two CTAs: "Start with 3 questions" + "Ayuda en español"

### Behavior
- Authenticated users auto-redirect to `/chat`
- Fires `home_viewed` event on mount
- Full bilingual support (EN/ES via useLanguage)

---

## Chat Page (src/pages/ChatV2.tsx)

### Core Features
- AI-powered legal Q&A with tabbed response parsing (Summary / Action Steps / Sources)
- **Jurisdiction modal** (JurisdictionModal): searchable centered modal replaces native dropdown
  - Search input filters states in real-time
  - Two-column grid of state buttons with selected state highlighted
  - Confirm button: "Use [State Name]"
  - Triggered by "Change" link in compact trust bar
- Compact trust/jurisdiction bar in header: "AI legal information | Encrypted | [State] law [Change]"
- **Urgency screening** (UrgencyScreening): 4-card screening at top of empty chat
  - Court date/deadline (amber), Losing housing/income (amber), Unsafe/threatened (red), No deadline (neutral)
  - Selecting "unsafe" shows 911 emergency alert
- **Issue category grid** (IssueCategoryGrid): 8 bilingual category cards
  - Housing, Family, Debt, Work, Immigration, Small business, Documents, Something else
  - Each sets a prefill prompt and focuses the input
- **Final action cards** (FinalActionCards): 4-CTA grid after each AI answer
  - View My Next Steps, Find Legal Help, Get Document Help, Ask a Follow-Up
- **Chat disclaimer** (ChatDisclaimer): expandable "How this works" with legal scope info
- Language toggle (EN/ES) with answer mode selector
- AI model selector (admin-only advanced models)
- Urgent signal detection (8 categories: eviction, court deadline, DV, wage garnishment, restraining order, immigration, criminal, custody)

### Sidebar (CollapsibleSidebar)
Outcome-based navigation (hover-expand/collapse):
- **Primary**: Ask a Question, My Next Steps, Find Legal Help, Past Questions
- **Document Help** (dropdown): My Documents, Contractor Forms, Find a Lawyer, Check My Chances, Research, Lawyer Directory, Website Widgets
- **Learn More** (dropdown): Legal Guides, Negotiation Planner, About Us
- **Account** (bottom): Profile, Privacy, Contact Support
- Admin Panel link (conditionally shown for admins)
- Crisis strip always visible
- Privacy gate before first message
- Handoff request form (connect to attorney)
- Ethical conversion panel (upsell to paid packs)

### Chat Prefill System
- Reads from `sessionStorage` key `ez_chatbot_prefill` on mount (consumed once, StrictMode-safe)
- Sanitizes: strips HTML tags, script/style blocks, collapses whitespace, caps at 1000 chars
- Does NOT auto-submit -- user must manually click Send
- Focuses textarea and sets cursor to end of prefilled text
- Tracks `prefill_used: true` in `first_question_submitted` event

### Urgency Detection
- Uses `detectUrgentSignals()` from `src/lib/urgent-signal-detector.ts`
- 8 regex patterns covering critical legal situations
- Shows `UrgentSignalCard` with category-specific guidance and hotlines
- Fires `urgent_signal_detected` analytics event

### Disclaimer
- Shown above input: "Legal information, not legal advice." with link to `/scope-disclaimers`
- Contextual crisis alerts when AI detects crisis signals in response

### Jurisdiction Collection
- Dropdown with US states, shown at top of chat
- Persists to localStorage and Supabase `profiles.preferred_jurisdiction`
- Fires `jurisdiction_entered` analytics event

### Fallback Handling (chat-service.ts)
- On API failure: detects network vs API errors via `isLikelyNetworkError()`
- Falls back to local knowledge base with typed `FallbackType`
- Response model shows "Local (network_fallback)" or "Local (api_fallback)"
- If local fallback also fails: returns hardcoded safe message
- Tracks fallback type in `ai_answer_shown` event

### Analytics Events Tracked
- `chat_started`, `first_question_submitted` (with jurisdiction, language, prefill_used)
- `intake_started`, `intake_step_completed`, `intake_abandoned`
- `ai_answer_requested`, `ai_answer_shown`
- `jurisdiction_entered`
- `urgent_signal_detected`
- `human_help_clicked`

---

## Pricing Page (src/pages/Pricing.tsx)

### Structure
- Audience tabs: Individuals | Business | Legal Aid
- Tab selection fires `pricing_tab_selected` engagement event
- Plans rendered via `PricingCard` component
- Comparison table for feature diff
- "Help me choose" wizard
- FAQ section
- Marketplace section

### Hero
- "Start free. Upgrade only when you need more help."
- Trust indicators: free urgent-help links, plain-language, bilingual

---

## Login Page (src/pages/Login.tsx)

- Email/password form with OAuth (Google, Azure)
- Bilingual (EN/ES toggle in top-right)
- Trust badges and security disclosure
- Redirect support via `?redirect=` param
- Error messages use `translateAuthError()` for localized display
- Left panel: brand, "Free to Start" messaging

---

## Signup Page (src/pages/Signup.tsx)

- Email/password with confirmation
- Age gate: must confirm 13+ to create account
- OAuth support (Google, Azure)
- Records consent (`privacy_notice` type) on signup
- Plan context: preserves pending plan for post-signup checkout redirect
- Fires `signup_started` and `signup_completed` events
- Redirect chain: signup -> checkout (if plan) or dashboard

---

## Edge Function: OpenAI Chat (supabase/functions/openai-chat/index.ts)

### System Prompt (server-side only)
The AI system prompt includes:
- Identity: "EZLegal AI, powered by LegalBreeze technology"
- Not a lawyer, no attorney-client relationship
- Always responds in user's language (Spanish if user writes in Spanish)
- Asks for jurisdiction when needed
- May provide general info while noting local rules vary
- Never fabricates citations, deadlines, agencies, phone numbers
- Never guarantees outcomes
- Uses "consider," "you may want to," "common next steps include" language
- Does not provide instructions for fraud, hiding assets, evading law enforcement
- Protects privacy (reminds users not to share SSN, bank accounts, etc.)
- Recommends lawyers for high-stakes matters
- Drafts preparation materials with "lawyer should review" caveat

### Code Debugging Prompt
- Analyzes real code as inert text (no execution)
- Identifies bugs and provides corrections
- If `{{code_snippet}}` placeholder detected, asks user to paste actual code
- Prefers TypeScript/React/Supabase guidance for ezLegal codebase questions

### Placeholder Guard
- Regex: `/\{\{\s*code_snippet\s*\}\}/i`
- If matched in last user message, returns early with clarification request (no OpenAI call)

### Document Drafting Mode
- Partner mode (Am Law 100 quality) and Associate mode
- Multi-pass drafting (up to 3 critique passes)
- Document detection with enhanced max tokens (16384)

### Safety Controls
- Anti-hallucination protocol (no fabricated citations)
- RAG degradation pattern when no authoritative sources exist
- UPL (Unauthorized Practice of Law) guardrails
- Mandatory hyperlinked legal citations
- Thinking details panel for transparency
- Follow-up questions (3 contextual questions per response)

### Model Selection
- Configurable via database (`ai_models` table)
- No hardcoded model strings
- Temperature: 0.2-0.4 for legal responses (configurable)
