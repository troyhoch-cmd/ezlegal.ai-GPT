# Persona-Specific Routing QA Guide

## Implementation Complete ✓

Your 30-second persona-specific intake flows are now live. Here's exactly what to test on Monday.

---

## Flow Architecture

**Start Now Button Behavior:**
- Homepage → `/start` (PersonaIntake page)
- **Option 1:** User clicks persona chip first → Goes directly to that persona's intake
- **Option 2:** User clicks "Start Now" without selecting → Shows persona selector (Who is this for?)

**Route:** `/start`

---

## 30-Second QA Matrix

### A) Individuals — "I have a legal issue"

#### Expected Flow (30 seconds)
```
Screen 1 (0-10s): Category Picker
  - Title: "What type of legal issue do you have?"
  - Trust strip: "Private by default • Not legal advice"
  - 6 categories: Housing, Family, Employment, Debt, Immigration, Criminal
  - Each with icon + color

Screen 2 (10-20s): Urgency Selector
  - Title: "How urgent is this issue?"
  - Options:
    • Urgent (happening now or within days) [RED]
    • Soon (within weeks) [AMBER]
    • Planning ahead [GREEN]

Screen 3 (20-30s): Summary + Continue
  - Shows selected category + urgency
  - "Continue to Questions" button → navigates to /ask/{category}
```

#### QA Checklist
- [ ] **Step 1 visible within 10s?** Category picker shows immediately
- [ ] **"Continue" enabled/disabled correctly?** Only works after selection
- [ ] **Trust line visible?** "Private by default • Not legal advice" shows early
- [ ] **No business questions?** Must show individual categories only
- [ ] **Back button works?** Can return to previous step
- [ ] **Routing correct?** Housing → /ask/housing, Immigration → /ask/immigration, etc.

**Fail If:**
- User lands on business triage questions
- Sees multi-step forms immediately
- Doesn't reach first question within ~30 seconds
- Generic "Type your question" box appears first

---

### B) SMBs (Businesses) — "I need help for my business"

#### Expected Flow (30 seconds)
```
Screen 1 (0-10s): Business Context Picker
  - Title: "What type of business need is this?"
  - Trust strip: "Confidential • Business guidance only • Not legal advice"
  - 6 contexts:
    • Contract Review/Drafting
    • Business Dispute
    • Employment/HR Issue
    • Compliance/Regulations
    • Business Formation/Structure
    • Other Business Matter

Screen 2 (10-20s): Timeline Selector
  - Title: "What is your timeline?"
  - Options:
    • I have a deadline or notice [RED]
    • Ongoing issue that needs attention [AMBER]
    • Planning/preventative [GREEN]

Screen 3 (20-30s): Summary + Continue
  - Shows business context + timeline
  - If deadline detected → Shows urgency warning
  - "Start Business Chat" button → navigates to /chatbot
```

#### QA Checklist
- [ ] **Business-relevant first question?** Shows contracts/disputes/compliance (not housing)
- [ ] **Disclaimers present early?** Business-specific trust language visible
- [ ] **Urgency warning?** Red alert shows for "deadline" timeline
- [ ] **Routing correct?** Navigates to /chatbot with business context stored
- [ ] **Simple language?** No legal jargon in options
- [ ] **Back button works?** Can return to business context picker

**Fail If:**
- First step shows "choose landlord issue"
- Flow identical to individuals without SMB relevance
- No differentiation for business vs. personal matters

---

### C) Legal Aid / Pro Bono — "I'm triaging for an organization"

#### Expected Flow (30 seconds)
```
Screen 1 (0-10s): Workflow Mode Selector
  - Title: "Select your workflow mode"
  - Trust strip: "Designed for ethical access to justice • Compliant with LSO guidelines"
  - 4 modes:
    • Individual Client Intake
    • Group/Bulk Triage
    • Self-Help/Clinic Support
    • Staff-Assisted Workflow

Screen 2 (10-20s): Scale/Capacity Question
  - Title: "What is your typical volume?"
  - Options:
    • 1-10 matters per week
    • 10-50 matters per week
    • 50-100 matters per week
    • 100+ matters per week

Screen 3 (20-30s): Summary + Continue
  - Shows workflow mode + scale
  - Green trust badge: "Access to justice focused"
  - "Start Client Intake" (if individual) OR "Go to Partner Hub" (if bulk)
```

#### QA Checklist
- [ ] **Workflow mode shows first?** Not consumer intake questions
- [ ] **Operational fit language?** Questions about triage/workflow/capacity
- [ ] **Routing correct?** Individual mode → /pro-bono-intake, Bulk → /partner-hub
- [ ] **LSO compliance language?** Trust Center references visible
- [ ] **Human oversight mentioned?** Ethics/attorney review language present
- [ ] **No consumer flow?** Legal aid users don't see same intake as individuals

**Fail If:**
- Legal aid users forced through client-style intake
- No workflow mode selection within first 30 seconds
- Routing goes to generic /ask or /chatbot

---

## Launch Monday QA Run (15 minutes)

### Test 1: No Persona Selected
1. Go to homepage
2. Click "Start Now" (don't click persona chips)
3. **Expected:** Persona selector appears within 10s
4. **Expected:** 3 options: Individuals, Businesses, Legal Aid
5. Select each and verify routing

**✓ Pass if:** Selector appears, routing works
**✗ Fail if:** Goes to /ask directly, no persona prompt

---

### Test 2: Individuals Flow
1. Go to homepage
2. Click "Individuals" persona chip
3. Click "Start Now"
4. **Expected:** Category picker within 10s
5. Select "Housing"
6. **Expected:** Urgency picker within 20s
7. Select "Urgent"
8. **Expected:** Summary + Continue within 30s
9. Click "Continue"
10. **Expected:** Lands on /ask/housing

**✓ Pass if:** All steps appear in order, routing to /ask/housing works
**✗ Fail if:** Skips steps, shows business questions, wrong route

---

### Test 3: SMBs Flow
1. Go to homepage
2. Click "Businesses" persona chip
3. Click "Start Now"
4. **Expected:** Business context picker within 10s
5. Select "Contract Review"
6. **Expected:** Timeline picker within 20s
7. Select "I have a deadline"
8. **Expected:** Red urgency warning + Summary within 30s
9. Click "Start Business Chat"
10. **Expected:** Lands on /chatbot

**✓ Pass if:** Business-specific screens, urgency warning appears, routes to /chatbot
**✗ Fail if:** Shows individual categories, no business context

---

### Test 4: Legal Aid Flow
1. Go to homepage
2. Click "Legal Aid / Pro Bono" chip
3. Click "Start Now"
4. **Expected:** Workflow mode selector within 10s
5. Select "Individual Client Intake"
6. **Expected:** Volume/scale question within 20s
7. Select "10-50 matters per week"
8. **Expected:** Summary + trust badge within 30s
9. Click "Start Client Intake"
10. **Expected:** Lands on /pro-bono-intake

**✓ Pass if:** Workflow selection appears, routes to pro bono intake
**✗ Fail if:** Shows consumer flow, routes to /ask

---

## Data Tracking (Analytics Ready)

New database table created: `persona_intake_sessions`

**Tracks:**
- Persona type selected (individual/business/legal-aid)
- Intake data (category, urgency, context, timeline, workflow, scale)
- Completion rate
- Conversion to chat
- Session ID for anonymous users

**Use for:**
- Conversion funnel analysis
- Persona-specific drop-off points
- A/B testing different flows
- Product usage analytics

---

## Technical Implementation Summary

**New Files Created:**
1. `/src/contexts/PersonaContext.tsx` - Session-based persona tracking
2. `/src/components/intake/IndividualIntake.tsx` - 3-step individual flow
3. `/src/components/intake/BusinessIntake.tsx` - 3-step business flow
4. `/src/components/intake/LegalAidIntake.tsx` - 3-step legal aid flow
5. `/src/pages/PersonaIntake.tsx` - Orchestrator component

**Modified Files:**
1. `/src/App.tsx` - Added PersonaProvider + /start route
2. `/src/pages/Home.tsx` - Persona chips now trigger intake flows

**Database:**
- Migration applied: `persona_intake_sessions` table
- RLS policies configured
- Indexes added for performance

**Routing:**
- `/start` → PersonaIntake page
- Individuals → `/ask/{category}` after intake
- Businesses → `/chatbot` after intake
- Legal Aid → `/pro-bono-intake` or `/partner-hub` based on workflow

---

## Best Practices Implemented

### 1. **Clear Progress Indicators**
Every screen shows "Step X of 3" with visual progress

### 2. **Early Trust Signals**
Privacy + "Not legal advice" disclaimers visible within first 10 seconds

### 3. **Persona-Specific Language**
- Individuals: "legal issue", "urgency"
- Businesses: "business need", "timeline", "deadline"
- Legal Aid: "workflow mode", "capacity", "oversight"

### 4. **Visual Hierarchy**
Icons, colors, and clear CTAs guide users through flow

### 5. **No Dead Ends**
Every screen has "Back" button, clear next steps

### 6. **Mobile Responsive**
All flows tested on desktop + mobile breakpoints

---

## Known Issues / Future Enhancements

**None blocking for Monday launch**

Potential enhancements:
- Add keyboard navigation (arrow keys)
- Animate transitions between steps
- Pre-populate from query parameters
- Add "Skip" option for returning users
- Multi-language support (Spanish ready in context)

---

## Monday Morning Checklist

1. [ ] Test all 4 scenarios above (15 min)
2. [ ] Check mobile responsiveness (5 min)
3. [ ] Verify database logging (check Supabase dashboard)
4. [ ] Test "Back" buttons in each flow
5. [ ] Verify routing to correct endpoints
6. [ ] Check analytics tracking fires
7. [ ] Test with browser back button
8. [ ] Test with no persona selected
9. [ ] Test with each persona chip clicked first
10. [ ] Verify trust language appears on all screens

---

## Support / Questions

If any flow doesn't match the specification above:
1. Check browser console for errors
2. Verify sessionStorage has `ez_selected_persona` key
3. Check Supabase for `persona_intake_sessions` entries
4. Review routing in App.tsx

All code is production-ready and built successfully. Ready to launch Monday! 🚀
