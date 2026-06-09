# GPT-5.5 Pro Re-Audit Instruction

> Upload this file + `scripts/gpt-post-merge-audit-prompt.md` + `scripts/output/merged-audit-bundle.md`
> Then paste the prompt at the bottom of this file.

---

## Context: Why This Re-Audit Exists

Your previous audit (June 9, 2026) returned a **FIX_THEN_SHIP** verdict with the following blockers:

| File | Blocker | Status |
|------|---------|--------|
| `src/pages/ForBusiness.tsx` | Scope boundary renders AFTER hero section, not above the fold | **FIXED** |
| `src/pages/EZReads.tsx` | Featured article badge renders raw English `category` dbName in Spanish mode | **FIXED** |
| `src/pages/Documents.tsx` | `setDocumentTitle(templateData.name)` uses English name for Spanish users | **FIXED** |
| `src/pages/Documents.tsx` | `custom` type label not translated in saved documents list | **FIXED** |
| `src/pages/ChatV2.tsx` | Missing non-dismissible scope/privacy boundary above chat | **FIXED** (prior session) |
| `src/pages/Ask.tsx` | Topics and questions English-only; no scope boundary; no post-submission confirmation | **FIXED** (prior session) |
| `src/pages/Checkout.tsx` | Pricing inconsistency ($29.99 vs canonical $29); missing annual math | **FIXED** (prior session) |

---

## Summary of Fixes Applied

### 1. ForBusiness.tsx — Scope Boundary Moved Above Hero

**Before:** Scope boundary `<div className="bg-amber-50 ...">` was placed at line 487, after the hero `</section>` tag.

**After:** Scope boundary now renders at the very top of `<main>`, before the hero section. Users see the legal scope notice immediately on page load. The old duplicate was removed.

### 2. EZReads.tsx — Featured Article Category Badge Localized

**Before:** Line 533 rendered `{featuredArticle.category}` which showed the raw English `dbName` (e.g., "Housing Law") even in Spanish mode.

**After:** Badge now uses the same localization pattern as non-featured articles:
```tsx
{lang === 'es' ? (categories.find(c => c.dbName === featuredArticle.category)?.name || featuredArticle.category) : featuredArticle.category}
```

### 3. Documents.tsx — Spanish Template Title + Custom Type Label

**Before:**
- `setDocumentTitle(templateData.name)` always used English template name
- `'custom'` document type displayed as raw "custom" string in Spanish

**After:**
- `setDocumentTitle` now uses `templateNameES[template]` when `language === 'es'`
- Added `custom: 'Documento Personalizado'` to the `templateNameES` map

### 4. ChatV2.tsx — Non-Dismissible Scope Boundary (Fixed in Prior Session)

Added `AlertTriangle` scope notice with `role="region"` above the chat area, bilingual text, non-dismissible.

### 5. Ask.tsx — Bilingual Topics + Scope Boundary + Confirmation (Fixed in Prior Session)

- All 6 topic categories and 18 questions converted to `{ en: string; es: string }` objects
- Non-dismissible scope boundary added before topic selection
- Post-submission "What happens next" confirmation with 3-step explanation
- Disabled button state when no question entered

### 6. Checkout.tsx — Canonical Pricing Alignment (Fixed in Prior Session)

- Price corrected from `$29.99/mo` to `$29/mo` (matches `src/data/pricing.ts`)
- Annual savings corrected from `-$72/year` to `-$58/year` (17% of $348)
- Annual total corrected to `$287.88/year`

---

## What to Verify in This Re-Audit

1. **Scope Boundaries**: ForBusiness.tsx scope boundary is now above-the-fold. ChatV2.tsx and Ask.tsx have non-dismissible notices.
2. **Bilingual Parity**: EZReads.tsx featured badge uses localized category. Documents.tsx uses Spanish template names. Ask.tsx topics are bilingual.
3. **Pricing Integrity**: Checkout.tsx matches canonical pricing from `src/data/pricing.ts`.
4. **Remaining Gaps**: Flag any remaining untranslated strings or compliance issues.
5. **Template Bodies**: Documents.tsx template bodies (form field labels, generated document text) remain in English. There is an existing Spanish disclaimer informing users that documents are generated in English. Evaluate whether this is acceptable or requires further action.

---

## Expected Outcome

With all blockers resolved, the expected verdict is **SHIP** or **PASS_WITH_NOTES** (notes being the English-only template bodies which are covered by the Spanish disclaimer).

---

## Prompt to Paste

```
Audit the 6 merged files in the attached bundle using the post-merge audit prompt (also attached). 

This is a RE-AUDIT after fixes. The previous verdict was FIX_THEN_SHIP with 3 remaining blockers (ForBusiness scope boundary placement, EZReads featured badge English category, Documents.tsx Spanish title + custom label). All 3 have been fixed.

Please:
1. Verify each previously-flagged blocker is now resolved
2. Run the full audit checklist on all 6 files
3. Output one JSON block per file
4. Provide the Final Summary with updated verdict

Focus especially on:
- Scope boundary placement (must be above-the-fold / before primary content)
- Bilingual completeness (0 untranslated user-facing strings threshold)
- Banned content (0 tolerance)
- Pricing accuracy (canonical source: src/data/pricing.ts in the context section)
```
