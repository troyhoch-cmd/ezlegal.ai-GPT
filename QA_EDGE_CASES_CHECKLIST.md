# QA Edge Cases & Launch Gate Checklist

## Critical Path Testing Routes

Base URL: `[YOUR-STAGING-URL]`

### Primary User Flows
```
/                    → Home landing page
/start               → Persona intake (Start Now)
/how-it-works        → See How It Works
/signup              → Sign up flow
/login               → Login
/dashboard           → Main dashboard (NEW SIDEBAR)
/chat-v2             → Chat interface (NEW SIDEBAR)
/chatbot             → Free standalone chat (no login)
```

### Authenticated Routes (Sidebar Testing)
```
/dashboard/history       → History page
/dashboard/ai-assistant  → AI + Lawyer Match
/dashboard/documents     → Documents
/dashboard/profile       → Profile
/contact                 → Contact support
```

---

## Copy Verification Checklist

### ✅ Home Hero (`/`)
- [ ] H1: "Get plain‑English legal help in minutes"
- [ ] Subhead: "Ethical AI built for individuals, small businesses, and legal aid. Start free—no credit card."
- [ ] Primary CTA: "Start now free"
- [ ] Secondary CTA: "See how it works"
- [ ] Tertiary link: "Try the free chat"

### ✅ Persona Intake (`/start`)
- [ ] Title: "Who are you here for today?"
- [ ] Help text: "This helps us tailor examples and documents. You can change it later."
- [ ] Options visible: Individual, Small business, Legal aid/pro bono org, Volunteer attorney, Other
- [ ] "Skip for now" link present
- [ ] "Back to home" link present

### ✅ Chat Interface (`/chat-v2`)
- [ ] Placeholder: "Ask in plain English, like 'Can my landlord raise rent mid‑lease in Texas?'"
- [ ] Examples shown:
  - "Can my landlord raise rent mid-lease in Arizona?"
  - "What happens if I miss my court date?"
  - "How do I get my security deposit back?"
  - (Plus 3 more on expand)

### ✅ Collapsible Sidebar Tooltips (Hover on Icons)
- [ ] Home: "Overview and recent activity"
- [ ] Chat: "Ask questions, draft documents"
- [ ] History: "Past chats"
- [ ] Tools dropdown: "Contract review, Clause finder, Summarize"
- [ ] Documents: "Your uploads and drafts"
- [ ] Resources dropdown: "Guides, Templates, Referrals"
- [ ] Profile: "Account and billing"
- [ ] Contact: "Get help or talk to a person"

---

## Edge Cases QA Must Cover

### 🔐 Authentication Edge Cases

#### Magic Link Cross-Device Flow
**Test Case**: User opens magic link on a different device than where they initiated signup/login
- [ ] Persona selection is preserved via URL params or session storage
- [ ] After auth, user is redirected to intended route (not just `/dashboard`)
- [ ] If persona was selected before signup, it persists post-auth
- [ ] Test on: Mobile phone → Desktop, Desktop → Mobile phone
- [ ] Test with: Incognito/private browsing mode

**Expected Behavior**:
- Persona stored in localStorage or passed via URL state param
- Redirect route captured in auth callback with `?redirect_to=` param
- On successful auth, navigate to stored redirect or default to `/dashboard`

**Failure Mode**: User lands on generic dashboard without persona context

---

#### Auth Expiration During Chat
**Test Case**: User is mid-chat when JWT expires
- [ ] System detects 401/403 response from API
- [ ] Non-destructive prompt appears: "Your session expired. Please log in again to continue."
- [ ] Draft message in input field is preserved (localStorage backup)
- [ ] After re-auth, user returns to chat with draft intact
- [ ] Chat history is NOT lost

**Expected Behavior**:
- Auto-save draft to `localStorage` key: `ezlegal-chat-draft-${sessionId}`
- Show inline banner (not modal): "Session expired. [Log in again]"
- On auth redirect back, restore draft from localStorage
- Clear draft only after successful send

**Failure Mode**: User loses typed message, returns to empty chat

---

### 📱 Touch & Accessibility Edge Cases

#### Hover-Only Features on Touch Devices
**Test Case**: Sidebar expand/collapse on mobile/tablet
- [ ] Sidebar can be expanded by tapping anywhere on the 64px rail (not just icons)
- [ ] Expanded sidebar has visible close button (X icon) in top-right
- [ ] Tapping outside expanded sidebar collapses it
- [ ] Tooltips (hover on desktop) are accessible via tap-and-hold on mobile
- [ ] Dropdown menus (Tools, Resources) expand on tap, not just hover
- [ ] All navigation items reachable without hover state

**Expected Behavior**:
- `onTouchStart` + `onClick` handlers for sidebar rail
- Modal overlay behind expanded sidebar captures outside taps
- Tooltips use `onTouchEnd` with 300ms delay for mobile
- ARIA live regions announce state changes for screen readers

**Failure Mode**: Users can't access sidebar features on touch devices

---

### 🤖 Chat Streaming Edge Cases

#### Rate Limiting & Timeout Resilience
**Test Case**: Chat API returns 429 (rate limit) or times out
- [ ] User sees friendly error message: "We're experiencing high demand. [Retry in 10s]"
- [ ] Automatic retry after countdown (10s, 30s, 60s with exponential backoff)
- [ ] Manual "Retry now" button available
- [ ] Original user message preserved and visible in chat
- [ ] Loading spinner stops, error state clearly indicated
- [ ] After successful retry, response streams normally

**Implementation**:
```typescript
const handleRateLimitError = async (retryAfter: number) => {
  setError({
    type: 'rate_limit',
    message: `High demand. Retrying in ${retryAfter}s...`,
    retryAfter
  });

  await wait(retryAfter * 1000);

  return retryMessage(lastUserMessage);
};
```

**Failure Mode**: Error swallows user message, no way to retry

---

### 📄 Document Upload Edge Cases

#### File Size Limit Exceeded
**Test Case**: User uploads document > 10 MB
- [ ] Upload is rejected before reaching server (client-side validation)
- [ ] Clear error message: "File too large (15 MB). Max size: 10 MB. [Learn how to compress]"
- [ ] Link to guide on splitting/compressing PDFs
- [ ] Suggested tools: Adobe Acrobat, iLovePDF, Smallpdf
- [ ] File input resets, allowing immediate re-upload
- [ ] No broken UI state or stuck loading spinner

**Copy**:
```
❌ File size limit exceeded

[filename.pdf] is 15.2 MB. Our limit is 10 MB.

Options:
• Compress your PDF using [Adobe Acrobat] or [iLovePDF]
• Split into multiple files
• Remove unnecessary pages

[Upload a different file]
```

**Failure Mode**: Silent failure, file appears to upload but never processes

---

### 🚨 Crisis Detection Edge Cases

#### Immediate Safety Resource Escalation
**Test Case**: User message contains crisis keywords
- [ ] Crisis banner appears immediately above chat (before AI response)
- [ ] Banner shows: National hotlines, local resources, "Talk to crisis counselor" button
- [ ] Banner persists throughout session (does not disappear on new messages)
- [ ] AI response includes gentle crisis-aware language
- [ ] "Report concern" option available to admins/moderators

**Crisis Keywords**: suicide, self-harm, domestic violence, immediate danger, stalking

**Expected Behavior**:
- Client-side regex detection (before sending to server)
- Banner with: "🆘 If you're in crisis, help is available 24/7"
- Links: 988 Suicide & Crisis Lifeline, National DV Hotline (1-800-799-7233)
- Server logs crisis incident for admin review (privacy-compliant)

**Failure Mode**: System treats crisis message like normal legal query

---

## Go/No-Go Checklist

### 🚫 Blockers (No-Go if ANY Fail)

#### Critical Path Functionality
- [ ] **All primary routes load (no 404/500)**: `/`, `/start`, `/how-it-works`, `/signup`, `/login`, `/dashboard`, `/chat-v2`, `/chatbot`
- [ ] **Signup magic link works**: User can register, receive email, click link, and land authenticated on `/dashboard`
- [ ] **Google OAuth works**: User can sign up with Google and land authenticated
- [ ] **Persona selection persists**: Selected persona on `/start` carries through to dashboard/chat context
- [ ] **Sidebar expand/collapse works**: On both desktop (hover) and mobile (tap)
- [ ] **Chat produces first token < 1.5s**: On broadband connection (> 10 Mbps), first AI response streams in under 1.5 seconds

#### Data Integrity
- [ ] **Chat history persists**: Messages saved to database, visible in `/dashboard/history`
- [ ] **Auth tokens refresh**: Sessions don't expire mid-chat without warning
- [ ] **Document uploads save**: Files stored in Supabase Storage, accessible from `/dashboard/documents`

---

### ⚠️ Majors (Ship with Plan if Necessary)

#### UI/UX Polish
- [ ] **Sidebar tooltips present**: All 8 icons show descriptive tooltips on hover/tap
- [ ] **Sticky CTA on `/how-it-works`**: Floating "Start now" button visible during scroll
- [ ] **Chatbot gate copy implemented**: Free chat shows upgrade prompt after 5 messages
- [ ] **Mobile responsive**: Sidebar, chat, and dashboard render correctly on 375px width (iPhone SE)

#### Edge Case Handling
- [ ] **Rate limit retry UI**: If 429 error, user sees retry countdown and button
- [ ] **File size validation**: Document upload rejects > 10 MB with helpful error
- [ ] **Auth expiration prompt**: If session expires, non-destructive "log in again" banner appears

---

## Post-Launch Watchlist (First 72 Hours)

### ⏱️ Time-to-Value Metrics
- [ ] **Home → First answer < 4 min median**: Track from landing on `/` to receiving first helpful AI response
- [ ] **Signup conversion**: % of users who click "Start now free" → complete signup → send first message
- [ ] **Persona distribution sanity check**:
  - Individual: 55–75%
  - Small business: 20–35%
  - Legal aid: 5–15%
  - **If outside range**: Routing confusion detected, review `/start` flow

### 💬 Chat Quality Metrics
- [ ] **Helpfulness upvote rate > 40%**: In first 3 answers per session
- [ ] **Follow-up question rate > 25%**: Users ask at least one follow-up in 25% of sessions
- [ ] **Crisis escalation rate < 2%**: Crisis banner triggered in < 2% of sessions (higher = review keyword sensitivity)

### 🎯 Sidebar Engagement
- [ ] **Sidebar expand usage > 60%**: Of authenticated sessions, 60%+ expand sidebar at least once
  - **If lower**: Consider always-on labels at `md` breakpoint instead of icons-only
- [ ] **Tools dropdown click-through > 15%**: Of expanded sidebar sessions, 15%+ click into Tools menu
- [ ] **Documents navigation > 10%**: Of users with uploaded files, 10%+ navigate to Documents page

### 🚨 Error Rate Monitoring
- [ ] **Chat API error rate < 1%**: Successful responses / total requests > 99%
- [ ] **Auth failure rate < 2%**: Magic link + Google OAuth combined success rate > 98%
- [ ] **Document upload failure < 3%**: Files successfully stored / upload attempts > 97%

---

## Testing Tools & Commands

### Build Verification
```bash
npm run build
# Expected: No TypeScript errors, no missing imports, dist/ folder created
```

### Local Testing
```bash
npm run dev
# Visit http://localhost:5173
# Test all routes in Critical Path section
```

### Lighthouse Performance Budget
- **Desktop**: Interaction to Next Paint (INP) < 200ms
- **Mobile**: INP < 500ms
- **First Contentful Paint**: < 1.5s on Fast 3G

### Browser Compatibility
- [ ] Chrome 120+ (desktop & mobile)
- [ ] Safari 17+ (desktop & iOS)
- [ ] Firefox 120+
- [ ] Edge 120+

---

## Edge Case Implementation Notes

### Magic Link Persona Persistence
**Implementation Location**: `src/contexts/AuthContext.tsx`

```typescript
// Before sending magic link
const handleMagicLinkSignup = async (email: string, persona?: string) => {
  const redirectTo = persona
    ? `${window.location.origin}/dashboard?persona=${persona}`
    : `${window.location.origin}/dashboard`;

  await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });
};
```

### Auth Expiration Draft Recovery
**Implementation Location**: `src/pages/ChatV2.tsx`

```typescript
useEffect(() => {
  const draftKey = `ezlegal-chat-draft-${sessionId}`;
  const savedDraft = localStorage.getItem(draftKey);
  if (savedDraft) setInput(savedDraft);
}, [sessionId]);

useEffect(() => {
  if (input) {
    const draftKey = `ezlegal-chat-draft-${sessionId}`;
    localStorage.setItem(draftKey, input);
  }
}, [input, sessionId]);
```

### Touch Sidebar Expansion
**Implementation Location**: `src/components/cognitive-load/CollapsibleSidebar.tsx`

```typescript
const handleTapExpand = () => {
  if (window.innerWidth < 1024) {
    setExpanded(true);
  }
};

// On sidebar rail
<aside
  onClick={handleTapExpand}
  onTouchEnd={handleTapExpand}
  className="w-16 lg:w-64..."
>
```

---

## QA Sign-Off

### Completed By
- [ ] QA Engineer: _________________
- [ ] Product Manager: _________________
- [ ] Engineering Lead: _________________

### Date
- [ ] QA Pass 1: _______
- [ ] QA Pass 2 (post-fixes): _______
- [ ] Final Go/No-Go: _______

### Decision
- [ ] ✅ **GO**: All blockers resolved, majors have mitigation plan
- [ ] 🚫 **NO-GO**: Critical blockers remain, requires additional dev sprint

---

## Quick Reference: Staging URL Template

```
Staging URL: https://[your-site].netlify.app

Test These Routes:
✅ https://[your-site].netlify.app/
✅ https://[your-site].netlify.app/start
✅ https://[your-site].netlify.app/how-it-works
✅ https://[your-site].netlify.app/signup
✅ https://[your-site].netlify.app/dashboard
✅ https://[your-site].netlify.app/chat-v2
✅ https://[your-site].netlify.app/chatbot

GPT-5.4 Nano Prompt:
"Analyze these flows for cognitive overload: anonymous user → signup → chat. Check sidebar usability on mobile. Verify copy matches spec. Go/no-go for launch?"
```

---

**End of QA Checklist**
*Last Updated: 2026-03-30*
