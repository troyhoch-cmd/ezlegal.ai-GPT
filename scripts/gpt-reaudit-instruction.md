# GPT-5.5 Pro Final Re-Audit Instruction (Round 4)

> Upload this file + `scripts/gpt-post-merge-audit-prompt.md` + `scripts/output/merged-audit-bundle.md`
> Then paste the prompt at the bottom of this file.

---

## Context: Why This Re-Audit Exists

Your third audit (June 9, 2026) returned a **FIX_THEN_SHIP** verdict with all 6 files at PASS_WITH_NOTES. All identified notes have now been addressed.

---

## Fixes Applied (This Round)

### Checkout.tsx: PASS_WITH_NOTES -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| Payment button becomes enabled via `disabled={!acknowledgedScope}` | Changed to `disabled` (permanently disabled, unconditionally) |
| A2J copy promises "direct you to the right plan" but doesn't route | Changed to "Help us understand who you are so we can serve you better" — no routing promise |

### Documents.tsx: PASS_WITH_NOTES -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| 30+ JSX branches use raw `language === 'en'` instead of `en` boolean | All replaced with `en` / `!en` pattern |
| Silent Supabase errors in loadDocuments and handleSaveDocument | Added `errorMessage` state + visible error alert for both operations |

### ForBusiness.tsx: PASS_WITH_NOTES -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| "jurisdiction-specific accuracy" (unsubstantiated) | Changed to "jurisdiction-aware information" |
| "attorney-reviewed templates" (no evidence) | Changed to "structured templates" |
| "reviewed by practicing attorneys" | Changed to "designed for legal workflows" |
| "CCPA Compliant" badge (no certification) | Changed to "CCPA-Aligned Practices" |
| "we're CCPA compliant" in FAQ | Changed to "we follow CCPA-aligned data handling practices" |
| "under 30 minutes" setup claim | Changed to "quickly" |
| "vetted attorneys" | Changed to "licensed attorneys" |
| "built-in compliance monitoring" | Changed to "compliance checklists and guidance" |

### ChatV2.tsx: PASS_WITH_NOTES -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| Crisis detection doesn't normalize accents | Added `normalizeForCrisis()` utility (Unicode NFD diacritic stripping) — imported from `src/lib/text-utils.ts` |
| `detectCrisis` uses raw `.toLowerCase()` | Now uses `normalizeForCrisis(text)` which handles accented characters like "dano" -> "dano" |

### Ask.tsx: PASS_WITH_NOTES -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| "has been recorded" implies persistence | Changed to "has been submitted in this session" |
| Crisis detection doesn't normalize accents | Added `normalizeForCrisis()` import and usage in `handleQuestionChange` |

### EZReads.tsx: PASS_WITH_NOTES -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| Newsletter insert fire-and-forget `.then(() => {})` | Replaced with async/await + error state. Shows user-facing error message on failure. |

---

## What to Verify in This Audit

1. **Checkout**: Payment button is `disabled` (not conditional). A2J copy makes no routing promise.
2. **Documents**: No remaining `language === 'en'` in JSX (only in `const lang` definition). Error states visible for Supabase failures.
3. **ForBusiness**: All previously-flagged claims softened with qualified language. No absolute claims remain.
4. **ChatV2 & Ask**: Both import and use `normalizeForCrisis()` for accent-insensitive crisis keyword matching.
5. **EZReads**: Newsletter insert uses async/await with `{ error }` destructuring and shows error UI on failure.
6. **All 6 files**: lang narrowing pattern `const lang = language === 'es' ? 'es' : 'en'` remains intact.

---

## Expected Outcome

All previously-noted issues have been resolved. The expected verdict is **SHIP**.

---

## Prompt to Paste

```
Audit the 6 merged files in the attached bundle using the post-merge audit prompt (also attached).

This is a FOURTH-ROUND RE-AUDIT. The previous verdict was FIX_THEN_SHIP with all files at PASS_WITH_NOTES. All notes have now been addressed:

- Checkout: Payment button is now permanently disabled (`disabled` attribute, no condition). A2J copy changed from "direct you to the right plan" to "serve you better" (no routing promise).
- Documents: All `language === 'en'` in JSX replaced with `en` boolean. Added `errorMessage` state + visible error alerts for Supabase operations.
- ForBusiness: All unsubstantiated claims softened — "jurisdiction-aware" not "jurisdiction-specific accuracy", "CCPA-Aligned Practices" not "CCPA Compliant", "licensed attorneys" not "vetted attorneys", "quickly" not "under 30 minutes".
- ChatV2 & Ask: Both now import `normalizeForCrisis()` from `src/lib/text-utils.ts` which strips Unicode diacritical marks (NFD normalization) before crisis keyword matching.
- EZReads: Newsletter Supabase insert now uses async/await with error handling and shows a visible error message to the user on failure.

Please:
1. Verify each previously-noted issue is now resolved
2. Run the full audit checklist on all 6 files
3. Output one JSON block per file
4. Provide the Final Summary with updated verdict

Key verification points:
- Checkout button must have `disabled` attribute (no condition)
- Documents must have zero `language === 'en'` in JSX (only in lang definition line)
- ForBusiness must not contain: "jurisdiction-specific accuracy", "attorney-reviewed", "CCPA compliant", "vetted attorneys", "under 30 minutes"
- ChatV2 and Ask must import and use `normalizeForCrisis` 
- EZReads newsletter must use await + error destructuring (no `.then(() => {})`)
- All files must use lang narrowing: const lang = language === 'es' ? 'es' : 'en'
```
