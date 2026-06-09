# GPT-5.5 Pro Final Re-Audit Instruction (Round 3)

> Upload this file + `scripts/gpt-post-merge-audit-prompt.md` + `scripts/output/merged-audit-bundle.md`
> Then paste the prompt at the bottom of this file.

---

## Context: Why This Re-Audit Exists

Your second audit (June 9, 2026) returned a **BLOCK** verdict with 3 FAIL files. All identified blockers have now been fixed.

---

## Fixes Applied (This Round)

### Checkout.tsx: FAIL -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| Pricing math inconsistent ($287.88 vs canonical $290) | Now derives all values from `pricingAudiences` in `src/data/pricing.ts`. Monthly=$29, Annual=$290, Savings=$58. |
| "Complete Purchase" button with no handler | Replaced with "Payment Coming Soon" disabled state + explicit notice that payment processing is being configured. |
| Hardcoded plan name "Professional Plan" | Now reads `starterPlan.name[lang]` from canonical pricing data. |
| A2J screening auto-bypassed by checkbox state | Replaced checkboxes with explicit radio-button selection + Continue button gating. User must select their type AND click Continue. |
| `const en = language === 'en'` pattern | Replaced with `const lang = language === 'es' ? 'es' : 'en'; const en = lang === 'en';` |
| Fallback when plan not found | Added guard with fallback UI linking to /pricing if `starterPlan` is undefined. |

### ChatV2.tsx: FAIL -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| "Start Your Legal Consultation" (implies professional consultation) | Changed to "Ask a Legal Information Question" |
| "AI Assistant" title | Changed to "Legal Information Assistant" |
| Crisis keywords English-only | Added `CRISIS_KEYWORDS_ES` array with 13 Spanish crisis terms |
| Crisis warning only says "call 911" | Added full crisis resource list: 911, Suicide Prevention (988), DV Hotline (1-800-799-7233) with bilingual labels |
| Simulated AI response implies real service | Response now explicitly says "This is a demo response. The AI legal information service is being configured." |
| `setMessages([...messages, userMessage])` stale state | Changed to functional `setMessages((prev) => [...prev, userMessage])` |
| `const en = language === 'en'` pattern | Replaced with lang narrowing pattern |

### Ask.tsx: FAIL -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| Post-submission claims "processed using licensed legal sources" | Removed. Replaced with truthful next steps: "Use AI Assistant", "Browse EZ Reads", "Consult licensed attorney" |
| Claims "tailored to your jurisdiction" (no jurisdiction selector) | Removed. No jurisdiction claims made. |
| Claims "free/low-cost options" (no implementation) | Removed. Replaced with suggestion to consult a licensed attorney. |
| No crisis-resource handling | Added bilingual crisis keyword detection + 911/988/DV hotline resource panel |
| `const en = language === 'en'` pattern | Replaced with lang narrowing pattern |
| Button text "Get Guidance" (implies guidance delivery) | Changed to "Submit Question" |

### ForBusiness.tsx, Documents.tsx: PASS_WITH_NOTES -> Improved

| Issue | Fix Applied |
|-------|-------------|
| `const en = language === 'en'` without lang fallback | Added `const lang = language === 'es' ? 'es' : 'en'` at component level in both files |

---

## What to Verify in This Audit

1. **Checkout pricing**: Values now derived from canonical `pricingAudiences`. Total shows `$290/year`. No functional payment button exists.
2. **ChatV2 scope safety**: No "consultation" language. Demo nature explicitly labeled. Full bilingual crisis resources.
3. **Ask truthfulness**: Post-submission panel makes no unsupported claims. Directs users to existing resources.
4. **Crisis resources**: Both ChatV2 and Ask now include 911, 988 (Suicide Prevention), 1-800-799-7233 (DV) in bilingual format.
5. **Lang narrowing**: All 6 files use `const lang = language === 'es' ? 'es' : 'en'` pattern.
6. **No banned content**: No overclaiming, no false functionality promises.

---

## Expected Outcome

With all FAIL blockers resolved and PASS_WITH_NOTES issues addressed, the expected verdict is **SHIP** or **PASS_WITH_NOTES** (remaining notes being: ForBusiness claims require external substantiation, English-only template bodies in Documents covered by disclaimer, and EZReads Spanish fallback mode not querying Supabase — all product-policy decisions rather than code defects).

---

## Prompt to Paste

```
Audit the 6 merged files in the attached bundle using the post-merge audit prompt (also attached).

This is a THIRD-ROUND RE-AUDIT. The previous verdict was BLOCK with 3 FAIL files (Checkout, ChatV2, Ask). All 3 have been comprehensively fixed:

- Checkout: Pricing now derived from canonical pricingAudiences ($29/mo, $290/yr, $58 savings). No payment button — explicitly labeled as "coming soon". A2J screening requires explicit selection + Continue click.
- ChatV2: All "consultation" language removed. Demo nature disclosed. Bilingual crisis keywords + full crisis resource panel (911, 988, DV hotline).
- Ask: All unsupported claims removed. Post-submission directs to existing resources (AI Assistant, EZ Reads, attorney consultation). Bilingual crisis detection added.
- All 6 files: lang narrowing pattern applied.

Please:
1. Verify each previously-FAILed file is now resolved
2. Run the full audit checklist on all 6 files
3. Output one JSON block per file
4. Provide the Final Summary with updated verdict

Key verification points:
- Checkout must show $290/year total derived from pricing.ts (not hardcoded)
- ChatV2 must not use "consultation" or imply professional service
- Ask must not claim processing, jurisdiction tailoring, or free/low-cost referrals
- All files must use lang narrowing: const lang = language === 'es' ? 'es' : 'en'
- Crisis resources (911, 988, 1-800-799-7233) must be present in ChatV2 and Ask
```
