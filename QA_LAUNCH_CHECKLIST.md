# ezLegal.ai Homepage Launch QA Checklist

**Version:** 1.0
**Date:** 2026-03-26
**Target:** External launch readiness
**Pass Threshold:** 9/10 rubric items

---

## Pre-QA Setup

1. Open Chrome DevTools (F12)
2. Clear site data: Application > Storage > Clear site data
3. Set viewport to 1280x800 (desktop) initially
4. Open Console tab to monitor analytics events
5. Have a stopwatch ready for timing tests

---

## 1. Analytics Integrity (CRITICAL - BLOCKER)

### 1.1 Page View Event

| Step | Action | Expected | Pass/Fail | Screenshot |
|------|--------|----------|-----------|------------|
| 1.1.1 | Navigate to homepage | Console shows `[Analytics] page_view` with `_dedup: "SENT"` | [ ] | Required |
| 1.1.2 | Refresh page | Console shows `[Analytics] page_view` with `_dedup: "SKIPPED_ALREADY_LOGGED"` | [ ] | Required |
| 1.1.3 | Check variant tag | `variant` field is either `"control"` or `"variant_a"` | [ ] | |
| 1.1.4 | Check metadata | `viewport_width`, `viewport_height`, `icp_track`, `language` all present | [ ] | |

### 1.2 Scroll 50% Event

| Step | Action | Expected | Pass/Fail | Screenshot |
|------|--------|----------|-----------|------------|
| 1.2.1 | Scroll past 50% of page | Console shows `[Analytics] scroll_50` with `_dedup: "SENT"` | [ ] | Required |
| 1.2.2 | Continue scrolling | No additional `scroll_50` events logged | [ ] | |
| 1.2.3 | Scroll back up, then down past 50% again | No duplicate `scroll_50` event | [ ] | |

### 1.3 CTA Click Events

| Step | Action | Expected | Pass/Fail | Screenshot |
|------|--------|----------|-----------|------------|
| 1.3.1 | Click hero CTA button | Console shows `cta_click` with `cta_id: "hero_primary_cta"` | [ ] | Required |
| 1.3.2 | Close modal, click same CTA within 5 seconds | Event marked as `SKIPPED_RAPID_CLICK` | [ ] | |
| 1.3.3 | Wait 6 seconds, click CTA again | New `cta_click` event fires | [ ] | |

### 1.4 StrictMode Protection

| Step | Action | Expected | Pass/Fail | Screenshot |
|------|--------|----------|-----------|------------|
| 1.4.1 | Check mount count in console | `Component mounted (count: N)` logged | [ ] | |
| 1.4.2 | Run `window.__ezAnalyticsDebug()` in console | Returns debug object with event log | [ ] | Required |
| 1.4.3 | Verify no duplicate events in `events` array | Each event type appears only once | [ ] | |

### 1.5 Supabase Verification

| Step | Action | Expected | Pass/Fail | Screenshot |
|------|--------|----------|-----------|------------|
| 1.5.1 | Open Supabase Dashboard > engagement_events | Recent events visible | [ ] | Required |
| 1.5.2 | Check `metadata` column | Contains `variant`, `idempotency_key` | [ ] | |
| 1.5.3 | Verify no duplicate `idempotency_key` values | All keys unique | [ ] | |

**Analytics Section Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

## 2. 5-Second Value Prop Test

### Test Setup
- Recruit 3-5 users (internal team or friends)
- Show homepage for exactly 5 seconds, then hide
- Ask: "What does this product do?"

### Scoring Criteria
Correct answer must include at least 2 of:
- Legal help/information
- AI-powered
- Free to start
- For people who cannot afford lawyers

| Tester | Response Summary | Correct (Y/N) |
|--------|-----------------|---------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

**Pass Rate:** ___/5 = ___%
**Threshold:** 80% (4/5)
**Result:** [ ] PASS / [ ] FAIL

---

## 3. First-Click Conversion Test

### Test Setup
- Recruit 5 users
- Task: "You have a legal question about your landlord. Use this site to get help."
- Record first click location

### Target CTAs (Count as conversion)
- Hero CTA ("Start: Tell Us Your Legal Issue")
- Mobile sticky CTA
- Housing topic card
- Footer CTA

| Tester | First Click Location | Conversion (Y/N) |
|--------|---------------------|------------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

**Pass Rate:** ___/5 = ___%
**Threshold:** 80% (4/5)
**Result:** [ ] PASS / [ ] FAIL

---

## 4. Accessibility Audit (CRITICAL)

### 4.1 Keyboard Navigation

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 4.1.1 | Press Tab from page load | Skip link appears, focused | [ ] |
| 4.1.2 | Press Enter on skip link | Focus moves to main content | [ ] |
| 4.1.3 | Tab through hero section | All interactive elements receive focus | [ ] |
| 4.1.4 | Tab to hero CTA | Visible focus ring (teal) | [ ] |
| 4.1.5 | Press Enter on hero CTA | Modal opens | [ ] |
| 4.1.6 | Press Escape in modal | Modal closes | [ ] |
| 4.1.7 | Tab to ICP tabs | Focus moves to active tab | [ ] |
| 4.1.8 | Press ArrowRight/ArrowLeft | Tabs switch correctly | [ ] |
| 4.1.9 | Tab through FAQ section | Each FAQ button focusable | [ ] |
| 4.1.10 | Press Enter on FAQ | FAQ expands/collapses | [ ] |

### 4.2 Focus Visibility

| Element | Focus Ring Visible | Color | Pass/Fail |
|---------|-------------------|-------|-----------|
| Hero CTA | [ ] | Teal | [ ] |
| ICP Tab buttons | [ ] | Teal | [ ] |
| Topic cards (links) | [ ] | Teal | [ ] |
| FAQ buttons | [ ] | Teal | [ ] |
| Footer CTA | [ ] | Teal | [ ] |
| Mobile sticky CTA | [ ] | Teal | [ ] |

### 4.3 Contrast Verification (AA Standard: 4.5:1)

| Element | Background | Text Color | Contrast Ratio | Pass/Fail |
|---------|------------|------------|----------------|-----------|
| Hero heading | navy-900 | white | 16.1:1 | [ ] |
| Hero subtext | navy-900 | navy-100 | 10.4:1 | [ ] |
| "Free to start" text | navy-900 | teal-100 | 12.7:1 | [ ] |
| FAQ question text | white | navy-900 | 16.1:1 | [ ] |
| FAQ answer text | navy-50 | navy-600 | 6.2:1 | [ ] |

**Tool:** Use Chrome DevTools Lighthouse or axe DevTools extension

### 4.4 Screen Reader Testing (Optional but recommended)

| Test | Action | Expected |
|------|--------|----------|
| 4.4.1 | Page load announcement | "ezLegal.ai - Facing a Legal Problem?" |
| 4.4.2 | Navigate to hero CTA | Button label announced clearly |
| 4.4.3 | ICP tabs | Tab role and selection state announced |
| 4.4.4 | FAQ buttons | Expanded/collapsed state announced |

**Accessibility Section Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

## 5. Mobile Viewport Testing (375px)

### Setup
1. Open DevTools
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" or set custom 375x667

### 5.1 Layout Verification

| Check | Expected | Pass/Fail | Screenshot |
|-------|----------|-----------|------------|
| Hero text | Readable, no overflow | [ ] | Required |
| Hero CTA | Full width, 48px+ height | [ ] | |
| ICP tabs | Horizontally scrollable | [ ] | |
| Topic cards | 1 column layout | [ ] | |
| FAQ section | No horizontal overflow | [ ] | |
| Sticky CTA bar | Visible at bottom | [ ] | Required |
| Footer | Readable, stacked layout | [ ] | |

### 5.2 Tap Target Verification (44x44px minimum)

| Element | Measured Size | Pass/Fail |
|---------|--------------|-----------|
| Hero CTA button | ___px height | [ ] |
| ICP tab buttons | ___px height | [ ] |
| Topic card links | ___px height | [ ] |
| FAQ buttons | ___px height | [ ] |
| Mobile sticky CTA | ___px height | [ ] |

**How to measure:** Inspect element > Computed > box model

### 5.3 Touch Interaction

| Test | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 5.3.1 | Tap hero CTA | Modal opens smoothly | [ ] |
| 5.3.2 | Tap ICP tabs | Tab switches without delay | [ ] |
| 5.3.3 | Tap FAQ question | FAQ expands | [ ] |
| 5.3.4 | Tap mobile sticky CTA | Modal opens | [ ] |
| 5.3.5 | Swipe ICP tabs | Scrolls horizontally | [ ] |

**Mobile Section Result:** [ ] PASS / [ ] FAIL
**Notes:**

---

## 6. Cross-Browser Verification (Optional)

| Browser | Version | Page Load | CTA Works | Analytics | Pass/Fail |
|---------|---------|-----------|-----------|-----------|-----------|
| Chrome | Latest | [ ] | [ ] | [ ] | [ ] |
| Firefox | Latest | [ ] | [ ] | [ ] | [ ] |
| Safari | Latest | [ ] | [ ] | [ ] | [ ] |
| Edge | Latest | [ ] | [ ] | [ ] | [ ] |

---

## Final Summary

| Section | Result | Notes |
|---------|--------|-------|
| 1. Analytics Integrity | [ ] PASS / [ ] FAIL | |
| 2. 5-Second Value Prop | ___% | |
| 3. First-Click Conversion | ___% | |
| 4. Accessibility | [ ] PASS / [ ] FAIL | |
| 5. Mobile (375px) | [ ] PASS / [ ] FAIL | |
| 6. Cross-Browser | [ ] PASS / [ ] FAIL | |

### Rubric Score

| # | Item | Status |
|---|------|--------|
| 1 | Value prop clarity | [ ] |
| 2 | Trust signals | [x] |
| 3 | Conversion path | [x] |
| 4 | Legal compliance | [x] |
| 5 | First-click test | [ ] |
| 6 | Accessibility | [ ] |
| 7 | Readability | [ ] |
| 8 | Mobile verification | [ ] |
| 9 | Analytics | [x] |
| 10 | A/B test ready | [x] |

**Total Score:** ___/10

---

## Decision

| Outcome | Criteria |
|---------|----------|
| **GO** | All critical checks pass AND total rubric >= 9/10 |
| **NO-GO** | Analytics integrity fails OR conversion-path test < 80% |

**Final Decision:** [ ] GO / [ ] NO-GO

**QA Conducted By:** _______________
**Date:** _______________
**Sign-off:** _______________
