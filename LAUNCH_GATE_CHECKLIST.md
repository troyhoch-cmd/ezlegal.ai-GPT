# Launch Gate Checklist — Persona Routing v1.0

**Target Launch:** Monday, March 31, 2026
**Feature:** Persona-specific intake routing (3-step flows)
**Pass Criteria:** All ✓ checked before production deployment

---

## 📋 Pre-Flight Summary

### Routing Logic
- **Route:** `/start` → PersonaIntake orchestrator
- **Flow Doc:** `PERSONA_ROUTING_QA_GUIDE.md` (30-second test matrix)
- **Persona Storage:** `sessionStorage.ez_selected_persona`
- **Database Tracking:** `persona_intake_sessions` table (RLS enabled)

### Current Tracking Events
```typescript
// Existing events available:
trackPageVisit('/start')              // PersonalizationContext
trackFeatureView('persona_intake')    // engagement-service
trackConversion('persona_selected')   // engagement-service

// New events to add:
'persona_selector_viewed'             // When /start loads
'persona_selected'                    // When user clicks persona
'intake_step_completed'               // Each step completion
'intake_flow_completed'               // Final "Continue" clicked
'intake_abandoned'                    // User navigates away mid-flow
```

### Mobile Breakpoints
- **Tailwind defaults:** sm: 640px, md: 768px, lg: 1024px
- **All flows use:** `grid sm:grid-cols-2` (mobile = 1 column)
- **Touch targets:** `min-h-[44px]` (iOS/Android standard)

---

## ✅ GATE 1: Routing & Navigation (10 min)

### A1. Homepage Integration
- [ ] "Start Now" button routes to `/start` (not `/ask`)
- [ ] Persona chips route to `/start` with pre-selected persona
- [ ] Clicking "Individuals" chip sets `sessionStorage.ez_selected_persona = 'individual'`
- [ ] Clicking "Businesses" chip sets persona to `'business'`
- [ ] Clicking "Legal Aid" chip sets persona to `'legal-aid'`

**Test Command:**
```javascript
// In browser console after clicking chip:
console.log(sessionStorage.getItem('ez_selected_persona'));
// Should output: 'individual', 'business', or 'legal-aid'
```

### A2. Persona Selector Logic
- [ ] If no persona selected → Shows "Who is this for?" selector
- [ ] If persona already selected → Skips selector, goes to intake flow
- [ ] Selector shows 3 options: Individuals, Businesses, Legal Aid
- [ ] Each option has correct icon, color, and label

### A3. Individual Flow Routing
- [ ] Category selected → Shows urgency step (not summary)
- [ ] Urgency selected → Shows summary step
- [ ] "Continue to Questions" button → Routes to `/ask/{category}`
- [ ] Housing category → `/ask/housing`
- [ ] Family category → `/ask/family`
- [ ] Back button works at each step

**Manual Test:**
1. Homepage → "Individuals" chip → "Start Now"
2. Select "Housing" → Select "Urgent"
3. Click "Continue to Questions"
4. **✓ Pass:** URL = `/ask/housing`
5. **✗ Fail:** Any other route or error

### A4. Business Flow Routing
- [ ] Context selected → Shows timeline step
- [ ] Timeline selected → Shows summary step
- [ ] "Start Business Chat" button → Routes to `/chatbot`
- [ ] Urgency warning shows if "deadline" selected
- [ ] Back button works at each step

**Manual Test:**
1. Homepage → "Businesses" chip → "Start Now"
2. Select "Contract Review" → Select "I have a deadline"
3. **✓ Pass:** Red urgency warning appears
4. Click "Start Business Chat"
5. **✓ Pass:** URL = `/chatbot`

### A5. Legal Aid Flow Routing
- [ ] Workflow selected → Shows scale step
- [ ] Scale selected → Shows summary step
- [ ] "Individual Client Intake" workflow → Routes to `/pro-bono-intake`
- [ ] Other workflows → Route to `/partner-hub`
- [ ] Back button works at each step

**Manual Test:**
1. Homepage → "Legal Aid" chip → "Start Now"
2. Select "Individual Client Intake" → Select "10-50 matters/week"
3. Click "Start Client Intake"
4. **✓ Pass:** URL = `/pro-bono-intake`
5. Go back, select "Bulk Triage" → Click continue
6. **✓ Pass:** URL = `/partner-hub`

---

## ✅ GATE 2: Mobile Responsiveness (5 min)

### B1. Viewport Testing
Test on these breakpoints:
- [ ] **Mobile (375px):** iPhone SE, Galaxy S8
- [ ] **Tablet (768px):** iPad, Surface
- [ ] **Desktop (1440px):** MacBook, Windows laptop

**Quick Test Method:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at 375px, 768px, 1440px widths

### B2. Mobile Layout Checks (375px width)

**Homepage:**
- [ ] "Start Now" button: Full width, visible, tappable
- [ ] Persona chips: Stack vertically, no horizontal scroll
- [ ] Touch target size: All buttons ≥44px height
- [ ] Text readable: No truncation, proper line breaks

**Persona Selector (/start):**
- [ ] Cards stack vertically (not side-by-side)
- [ ] Each card occupies full width
- [ ] Icons scale properly (not pixelated)
- [ ] "Back to home" link visible

**Individual Intake:**
- [ ] Step 1: Category cards in 1 column (not 2)
- [ ] Step 2: Urgency buttons in 1 column
- [ ] Step 3: Summary box readable, not squished
- [ ] Progress indicator ("Step X of 3") visible at top
- [ ] "Continue" button: Full width, easily tappable

**Business Intake:**
- [ ] Context cards in 1 column
- [ ] Timeline options in 1 column
- [ ] Urgency warning banner: Readable, not cut off
- [ ] "Start Business Chat" button: Full width

**Legal Aid Intake:**
- [ ] Workflow cards in 1 column
- [ ] Scale options in 1 column
- [ ] Trust badge text: Readable, proper wrapping
- [ ] "Start Client Intake" button: Full width

### B3. Tablet Layout Checks (768px width)

**All Flows:**
- [ ] Category/Context cards: 2 columns (grid-cols-2)
- [ ] Buttons: Centered, max-width applied
- [ ] Text: Proper spacing, not cramped
- [ ] Icons: Proper size, aligned

### B4. Desktop Layout Checks (1440px width)

**All Flows:**
- [ ] Content centered with max-width
- [ ] No excessive white space
- [ ] Cards: 2-3 columns based on design
- [ ] Readable without zooming

### B5. Touch Target Validation

**iOS/Android Requirement:** All interactive elements ≥44x44px

- [ ] All buttons meet minimum size
- [ ] Persona chips: ≥44px height
- [ ] Category cards: Entire card is tappable
- [ ] Back links: ≥44px touch area
- [ ] Progress indicators: Non-interactive (correct)

**Test Command:**
```javascript
// In browser console:
document.querySelectorAll('button, a').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.height < 44) {
    console.warn('Touch target too small:', el, rect.height);
  }
});
```

---

## ✅ GATE 3: Analytics & Tracking (5 min)

### C1. Event Tracking Implementation

**Required Events:**
```typescript
// When /start loads:
trackFeatureView('persona_intake', { from: 'homepage' });

// When persona selected:
trackFunnelEvent('persona_selected', {
  persona: 'individual' | 'business' | 'legal-aid',
  preSelected: boolean
});

// When intake step completed:
trackEngagement({
  featureName: 'persona_intake_step',
  engagementType: 'complete',
  metadata: {
    persona: string,
    step: 1 | 2 | 3,
    selection: string
  }
});

// When final "Continue" clicked:
trackConversion('persona_intake', persona);

// When user abandons (navigates away):
trackEngagement({
  featureName: 'persona_intake_abandoned',
  engagementType: 'view',
  metadata: {
    persona: string,
    lastStep: number
  }
});
```

### C2. Database Logging Checks

**Verify `persona_intake_sessions` table receives data:**

1. Complete one intake flow (any persona)
2. Open Supabase dashboard → Table Editor
3. Check `persona_intake_sessions` table

**Expected columns filled:**
- [ ] `id`: UUID present
- [ ] `persona_type`: 'individual', 'business', or 'legal-aid'
- [ ] `intake_data`: JSON with selections
- [ ] `completed`: `true` if flow finished
- [ ] `converted_to_chat`: `false` initially
- [ ] `session_id`: Present (browser session)
- [ ] `created_at`: Timestamp present

**SQL Test Query:**
```sql
SELECT
  persona_type,
  intake_data,
  completed,
  created_at
FROM persona_intake_sessions
ORDER BY created_at DESC
LIMIT 5;
```

### C3. Session Persistence

- [ ] `sessionStorage.ez_selected_persona` persists on refresh
- [ ] `sessionStorage.ez_intake_data` contains intake selections
- [ ] Clearing session → Resets persona selection
- [ ] Multiple tabs → Separate sessions (correct behavior)

**Test:**
1. Select persona, complete step 1
2. Refresh page (F5)
3. **✓ Pass:** Returns to step 2 (progress saved)
4. **✗ Fail:** Starts from step 1 again

---

## ✅ GATE 4: Trust & Compliance (5 min)

### D1. Privacy Disclosures

**Required on ALL flows within first 10 seconds:**

**Individuals:**
- [ ] "Private by default • Not legal advice" visible on step 1
- [ ] Shield icon present
- [ ] Expansion text: "We provide legal information to help you understand your options"

**Businesses:**
- [ ] "Confidential • Business guidance only • Not legal advice"
- [ ] Shield icon present
- [ ] Expansion text present

**Legal Aid:**
- [ ] "Designed for ethical access to justice • Compliant with LSO guidelines"
- [ ] Shield icon present
- [ ] Attorney review language visible on step 3

### D2. LSO Compliance (Legal Aid only)

- [ ] "Access to justice focused" badge on summary step
- [ ] "All outputs include oversight flags" language present
- [ ] "Designed for attorney review" visible
- [ ] No consumer-facing guarantees or promises

### D3. Urgency Warnings

**Business Flow:**
- [ ] Red alert shows when "deadline" timeline selected
- [ ] Warning text: "Consider consulting with a business attorney if you have an active deadline"
- [ ] AlertTriangle icon present
- [ ] Warning appears BEFORE "Continue" button

---

## ✅ GATE 5: User Experience (5 min)

### E1. Loading States

- [ ] PersonaIntake page: Shows PageLoader while lazy loading
- [ ] No flash of unstyled content (FOUC)
- [ ] Smooth transitions between steps
- [ ] No layout shift when data loads

### E2. Error Handling

**Test invalid states:**
- [ ] Direct URL to `/start` with no persona → Shows selector (correct)
- [ ] Direct URL to `/ask/invalid-category` → 404 page (correct)
- [ ] Back button to `/start` mid-flow → Returns to previous step (correct)
- [ ] Browser back from final page → Doesn't re-submit (correct)

### E3. Keyboard Navigation

- [ ] Tab key: Cycles through buttons/cards
- [ ] Enter key: Activates focused button
- [ ] Escape key: Not used (no modals in flow)
- [ ] Screen reader: All buttons have aria-labels

**Test:**
1. Tab through persona selector
2. **✓ Pass:** All 3 options focusable, visible focus ring
3. Press Enter on focused option
4. **✓ Pass:** Navigates to intake flow

### E4. Animation & Performance

- [ ] No janky scrolling
- [ ] Button hover states: Smooth transitions
- [ ] Card scaling: `group-hover:scale-110` smooth
- [ ] No animation delays >300ms
- [ ] Page loads in <2 seconds (check Network tab)

---

## ✅ GATE 6: Cross-Browser Testing (5 min)

### F1. Browser Compatibility

**Required browsers:**
- [ ] Chrome 90+ (Desktop + Mobile)
- [ ] Safari 14+ (Desktop + iOS)
- [ ] Firefox 88+
- [ ] Edge 90+

**Quick test (any browser):**
1. Open `/start`
2. Complete intake flow
3. Check for console errors (F12)

**✓ Pass:** No errors, flow completes
**✗ Fail:** Console errors, broken layout, routing fails

### F2. Browser-Specific Issues

**Safari:**
- [ ] Touch targets work on iOS
- [ ] Back button doesn't break state
- [ ] sessionStorage persists

**Firefox:**
- [ ] Grid layouts render correctly
- [ ] Icons load properly (Lucide React)
- [ ] No CORS errors

**Edge:**
- [ ] Chromium-based, should match Chrome
- [ ] No IE11 fallback needed (IE11 unsupported)

---

## ✅ GATE 7: Security & Privacy (5 min)

### G1. Data Security

- [ ] No PII stored in `persona_intake_sessions` without consent
- [ ] No email/name collected in intake flows
- [ ] Session IDs are cryptographically random (UUIDs)
- [ ] RLS policies enforced (users can only see their own sessions)

**Test RLS:**
```sql
-- As authenticated user A, try to read user B's sessions:
SELECT * FROM persona_intake_sessions
WHERE user_id != auth.uid();
-- Expected: 0 rows (RLS blocks)
```

### G2. XSS Prevention

- [ ] No `dangerouslySetInnerHTML` in intake components
- [ ] User input not rendered without sanitization
- [ ] All text rendered via React (automatic escaping)

**Test:**
```javascript
// Try to inject script in sessionStorage:
sessionStorage.setItem('ez_selected_persona', '<script>alert("XSS")</script>');
// Navigate to /start
// Expected: Script NOT executed, treated as text
```

### G3. CSRF Protection

- [ ] No state-changing actions on GET requests
- [ ] All form submissions use POST (none in this flow)
- [ ] Supabase handles CSRF for database operations

---

## ✅ GATE 8: Performance (5 min)

### H1. Lighthouse Scores

**Target metrics (Desktop):**
- [ ] Performance: ≥90
- [ ] Accessibility: ≥95
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

**Run Lighthouse:**
1. Open DevTools → Lighthouse tab
2. Select "Desktop" mode
3. Click "Generate report" for `/start`

### H2. Bundle Size

**Current (from build output):**
- PersonaIntake chunk: 29.49 kB (gzipped: 5.61 kB) ✓
- Total bundle: ~200 kB (acceptable)

- [ ] No new dependencies added
- [ ] Lazy loading working (PersonaIntake not in main bundle)
- [ ] Icons tree-shaken (only used icons imported)

### H3. Network Performance

- [ ] First Contentful Paint (FCP): <1.5s
- [ ] Time to Interactive (TTI): <3s
- [ ] Total page size: <500 KB
- [ ] No blocking resources >300ms

**Test:**
1. DevTools → Network tab
2. Throttle: "Fast 3G"
3. Reload `/start`
4. **✓ Pass:** Page usable in <3s

---

## 🚀 Final Launch Checklist (Before Deploy)

### Pre-Deploy Verification
- [ ] All gates 1-8 passed (✓ checked)
- [ ] `npm run build` succeeds with no errors
- [ ] No console errors on `/start` page
- [ ] Database migration applied successfully
- [ ] `.env` variables correct (Supabase keys)

### Deploy Checklist
- [ ] Merge feature branch to `main`
- [ ] Run `npm run build` on production server
- [ ] Verify `/start` route works in production
- [ ] Test one complete flow in production (smoke test)
- [ ] Monitor Supabase logs for errors (first 10 min)
- [ ] Check analytics dashboard for incoming events

### Post-Deploy Monitoring (First Hour)
- [ ] No 500 errors in server logs
- [ ] Analytics events flowing to database
- [ ] No user reports of broken flows
- [ ] Conversion rate matches expectations (baseline)

### Rollback Plan (If Needed)
1. Revert to previous commit
2. Redeploy previous version
3. Clear sessionStorage keys if needed
4. Disable `/start` route temporarily

---

## 📊 Success Metrics (First Week)

**Track these KPIs:**
- **Adoption Rate:** % of homepage visitors who click "Start Now" → `/start`
- **Completion Rate:** % who reach final "Continue" button
- **Drop-off Points:** Which step users abandon most
- **Persona Distribution:** % Individual vs Business vs Legal Aid
- **Conversion to Chat:** % who continue to /chatbot or /ask after intake
- **Mobile vs Desktop:** Completion rates by device type

**Target baselines (estimate):**
- Adoption: ≥40% of homepage visitors
- Completion: ≥70% who start flow
- Conversion to chat: ≥60% of completed intakes

**SQL for monitoring:**
```sql
-- Completion rate by persona
SELECT
  persona_type,
  COUNT(*) as total_sessions,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN completed THEN 1 ELSE 0 END) / COUNT(*), 1) as completion_rate,
  SUM(CASE WHEN converted_to_chat THEN 1 ELSE 0 END) as converted,
  ROUND(100.0 * SUM(CASE WHEN converted_to_chat THEN 1 ELSE 0 END) / COUNT(*), 1) as conversion_rate
FROM persona_intake_sessions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY persona_type;
```

---

## ✅ Launch Gate Approval

**Before deploying to production, confirm:**

- [ ] All gates 1-8: 100% ✓ checked
- [ ] No known blockers or critical bugs
- [ ] Rollback plan documented and tested
- [ ] Team notified of launch timing
- [ ] Monitoring dashboard ready

**Approved by:** _________________
**Date:** _________________
**Deployment Time:** _________________

---

## 🆘 Troubleshooting Quick Reference

### Issue: "Start Now" doesn't route to /start
- Check: `Home.tsx` line 30: `navigate('/start')`
- Fix: Verify route in `App.tsx` line 163

### Issue: Persona not persisting on refresh
- Check: `PersonaContext.tsx` sessionStorage logic
- Fix: Ensure browser allows sessionStorage

### Issue: Database not logging sessions
- Check: Supabase migration applied
- Fix: Run `mcp__supabase__apply_migration` tool

### Issue: Mobile layout broken
- Check: Tailwind classes `sm:grid-cols-2`
- Fix: Verify no custom CSS overriding grid

### Issue: Analytics not firing
- Check: `engagement-service.ts` trackEngagement calls
- Fix: Add console.log to debug event flow

### Issue: 404 on /ask/{category}
- Check: Ask.tsx route params: `/ask/:topic`
- Fix: Verify category names match routes

---

**Document Version:** 1.0
**Last Updated:** March 29, 2026
**Next Review:** Post-launch (1 week)
