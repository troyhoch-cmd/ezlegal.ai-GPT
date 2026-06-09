# GPT-5.5 Pro Final Re-Audit Instruction (Round 5)

> Upload this file + `scripts/gpt-post-merge-audit-prompt.md` + `scripts/output/merged-audit-bundle.md`
> Then paste the prompt at the bottom of this file.

---

## Context: Why This Re-Audit Exists

Your fourth audit (June 9, 2026) returned a **FIX_THEN_SHIP** verdict. 5 of 6 files passed (Checkout, Documents, ChatV2, Ask, EZReads). ForBusiness.tsx was the sole FAIL due to three remaining issues that were missed in prior rounds because only the FAQ section was addressed while other UI sections contained the same claims.

---

## Fixes Applied (This Round)

### ForBusiness.tsx: FAIL -> Fixed

| Issue | Fix Applied |
|-------|-------------|
| Trust Bar badge "Attorney-Reviewed Templates" with title "Document templates and legal content reviewed by licensed attorneys" | Changed to "Structured Templates" with title "Structured templates designed for common business legal workflows" (EN+ES) |
| Hero checkmark "Setup in 30 minutes" / "Configuracion en 30 minutos" | Changed to "Quick setup" / "Configuracion rapida" |
| Spanish value prop "monitoreo de cumplimiento integrado" (stronger than softened English) | Changed to "listas de verificacion de cumplimiento y guia para CCPA, ley laboral y mas" (matches English) |
| Citation popover bug: `activeCitation` keyed by `citationId` but citationId 1 reused by multiple pain points | Changed to key by pain-point array index (`activeCitationIndex`) so each card opens its own popover |

### All Other Files: Already PASS (No Changes)

- Checkout.tsx: PASS (no changes needed)
- Documents.tsx: PASS (no changes needed)
- ChatV2.tsx: PASS (no changes needed)
- Ask.tsx: PASS (no changes needed)
- EZReads.tsx: PASS (no changes needed)

---

## What to Verify in This Audit

1. **ForBusiness Trust Bar**: Must say "Structured Templates" (not "Attorney-Reviewed Templates"). Title must not reference attorneys.
2. **ForBusiness Hero**: Must say "Quick setup" (not "Setup in 30 minutes" or any time claim).
3. **ForBusiness Spanish Value Props**: Compliance description must say "listas de verificacion de cumplimiento y guia" (not "monitoreo de cumplimiento integrado").
4. **ForBusiness Citation Popover**: State is now keyed by pain-point index, not citationId. Each card opens independently.
5. **All 6 files**: lang narrowing pattern `const lang = language === 'es' ? 'es' : 'en'` remains intact.

---

## Grep Verification (Zero Matches Confirmed)

The following search across ForBusiness.tsx returns ZERO results:
- "Attorney-Reviewed"
- "reviewed by" (in attorney/abogado context)
- "30 minutes" / "30 minutos"
- "monitoreo de cumplimiento integrado"

---

## Expected Outcome

All previously-noted issues have been resolved. The expected verdict is **SHIP**.

---

## Prompt to Paste

```
Audit the 6 merged files in the attached bundle using the post-merge audit prompt (also attached).

This is a FIFTH-ROUND RE-AUDIT. The previous verdict was FIX_THEN_SHIP with ForBusiness.tsx as the sole FAIL. All issues have now been fixed:

- ForBusiness Trust Bar: "Attorney-Reviewed Templates" replaced with "Structured Templates". Title changed from "Document templates and legal content reviewed by licensed attorneys" to "Structured templates designed for common business legal workflows".
- ForBusiness Hero: "Setup in 30 minutes" replaced with "Quick setup" (EN) / "Configuracion rapida" (ES).
- ForBusiness Spanish Value Props: "monitoreo de cumplimiento integrado" replaced with "listas de verificacion de cumplimiento y guia para CCPA, ley laboral y mas" — now matches the softened English copy.
- ForBusiness Citation Bug: activeCitation state now keyed by pain-point array index (activeCitationIndex) instead of citationId, so cards sharing citationId 1 open independently.
- All other 5 files remain unchanged from Round 4 where they all PASSED.

Please:
1. Verify each previously-noted issue is now resolved
2. Run the full audit checklist on all 6 files
3. Output one JSON block per file
4. Provide the Final Summary with updated verdict

Key verification points:
- ForBusiness must NOT contain: "Attorney-Reviewed", "reviewed by licensed attorneys", "Setup in 30 minutes", "30 minutos", "monitoreo de cumplimiento integrado"
- ForBusiness MUST contain: "Structured Templates", "Quick setup", "Configuracion rapida", "listas de verificacion de cumplimiento"
- ForBusiness citation state must use `activeCitationIndex` (not `activeCitation` keyed by citationId)
- Checkout button must have unconditional `disabled` attribute
- Documents must have zero `language === 'en'` in JSX
- ChatV2 and Ask must import and use `normalizeForCrisis`
- EZReads newsletter must use await + error destructuring
- All files must use lang narrowing: const lang = language === 'es' ? 'es' : 'en'
```
