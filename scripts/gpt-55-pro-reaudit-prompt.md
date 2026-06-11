# GPT-5.5 Pro Re-Audit Prompt (Post-Remediation, June 2026)

> **How to use:** Export the codebase with `node scripts/export-for-gpt-review.cjs`, upload the output files to your GPT session, then paste the prompt below. This prompt is for RE-AUDITING after fixes have been applied.

---

## Prompt

```
You are re-auditing the ezLegal.ai platform after a comprehensive remediation pass. Your job is to verify that previously-identified issues have been correctly fixed and no regressions were introduced.

## Context

ezLegal.ai is an AI-powered legal INFORMATION platform (not a law firm) serving consumers, SMBs, and organizations who cannot afford traditional legal counsel. The platform is bilingual (English/Spanish) and serves vulnerable populations including low-income users, immigrants, and non-English speakers.

## What Changed In This Remediation Pass (June 2026)

### 1. Bilingual Parity -- Site-Wide Fix
The following pages were converted from English-only to full bilingual (EN/ES):
- **ForStartups.tsx**: Full `Record<'en'|'es', ...>` UI object with translated headings, use cases, pain points, CTAs
- **ForLawFirms.tsx**: Same pattern with law-firm-specific Spanish translations
- **ForInHouse.tsx**: Same pattern with in-house legal Spanish translations
- **ForOrganizations.tsx**: All content arrays (CAPABILITIES, USE_CASES, GOVERNANCE_LINKS) converted to bilingual; all inline section text rendered via language ternary
- **HowItWorks.tsx**: STEPS array converted to bilingual `{en, es}` structure; scope disclaimer added
- **MediaKit.tsx**: Dead buttons fixed, scope disclaimer added, all strings bilingual

### 2. Dead UI Elements Fixed
- **MediaKit.tsx**: Dead `<button>` elements replaced with functional `<a download>` links; Copy button now uses `navigator.clipboard.writeText()` with visual feedback (Check icon on success)

### 3. Scope Disclaimers Added
All consumer-facing pages now include an amber-bordered disclaimer banner:
- "ezLegal.ai provides legal information, not legal advice. We are not a law firm and do not replace licensed attorneys."
- Available in both EN and ES
- Uses Scale icon from lucide-react for visual consistency

### 4. GTM Components Made Bilingual
- **FAQSection.tsx**: Parallel `FAQ_ITEMS_ES` array for Spanish; renders based on `useLanguage()`
- **ICPSelector.tsx**: Spanish labels, pain points, outcomes, use cases, and CTAs for all 3 ICPs
- **LegalReadinessWizard.tsx**: Complete 50+ string bilingual UI record; all wizard steps, validation errors, and result screens rendered in user's language

### 5. Content Corrections
- "legal guidance" language replaced with "legal information" throughout (UPL-safer)
- HowItWorks changed from "guidance journey" to "information journey"
- MediaKit boilerplate changed from "legal guidance" to "legal information"

## Your Re-Audit Checklist

### A. Bilingual Parity Verification
For each bilingual page, verify:
- [ ] `useLanguage()` hook is imported and used
- [ ] All user-facing headings have ES equivalent
- [ ] All body text has ES equivalent
- [ ] CTAs/buttons are translated
- [ ] Form labels and validation errors are translated
- [ ] FAQ/accordion content is translated
- [ ] Scope disclaimer is bilingual

### B. UPL Compliance (Scope Disclaimers)
- [ ] Every page with legal content has scope disclaimer
- [ ] Disclaimer says "information" not "advice" or "guidance"
- [ ] No attorney-client relationship implied
- [ ] No outcome guarantees
- [ ] Acceptable qualifiers used ("designed to", "intended to", "may help")

### C. Dead UI Verification
- [ ] All buttons have functional handlers
- [ ] Download links point to actual assets or use `download` attribute
- [ ] Copy functionality uses clipboard API with user feedback
- [ ] No `<button>` without `onClick` (or `type="submit"` in a form)

### D. Security Regression Check
- [ ] No new hardcoded secrets introduced
- [ ] Auth-gated operations still check user before Supabase calls
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Edge Function calls still use proper auth headers

### E. Crisis Safety (Chat Interfaces)
- [ ] `normalizeForCrisis` still in use for accent-insensitive matching
- [ ] `detectCrisisSignal` still checks normalized text
- [ ] Emergency resources still available in both languages
- [ ] No crisis-related functionality was accidentally removed

### F. Code Quality
- [ ] No unused imports
- [ ] TypeScript types properly applied (no `any`)
- [ ] React keys on mapped elements
- [ ] Effects have proper cleanup
- [ ] No prop type mismatches from interface changes

## Output Format

For EACH page reviewed, output:

```json
{
  "file": "src/pages/PageName.tsx",
  "verdict": "PASS" | "WARN" | "FAIL" | "BLOCK",
  "bilingual_parity": "PASS" | "FAIL" | "EXEMPT",
  "scope_disclaimer": "PASS" | "FAIL" | "N/A",
  "dead_ui": "PASS" | "FAIL" | "N/A",
  "upl_compliance": "PASS" | "FAIL",
  "security": "PASS" | "FAIL" | "WARN",
  "crisis_safety": "PASS" | "FAIL" | "N/A",
  "code_quality": "PASS" | "WARN",
  "issues": [
    { "severity": "BLOCK|HIGH|MEDIUM|LOW", "description": "...", "line": null }
  ],
  "regression_detected": false,
  "fix_verified": true
}
```

Then provide a Final Summary:

```json
{
  "overall_verdict": "SHIP" | "FIX_THEN_SHIP" | "BLOCK",
  "total_files_reviewed": N,
  "verdicts": { "PASS": N, "WARN": N, "FAIL": N, "BLOCK": N },
  "regressions_found": [],
  "fixes_verified": ["list of confirmed fixes"],
  "remaining_issues": [
    { "file": "...", "severity": "...", "issue": "...", "fix": "..." }
  ],
  "launch_recommendation": "One paragraph assessment"
}
```

## Grading Guidance

- **PASS**: Check satisfied. Minor style preferences do NOT warrant FAIL.
- **WARN**: Non-blocking concern (e.g., could be more descriptive). Does NOT count toward BLOCK.
- **FAIL**: Genuine compliance, security, or functionality defect. Must fix before ship.
- **BLOCK**: Critical issue that represents legal liability, safety risk, or data exposure.

## Important Distinctions (Do NOT false-flag these)

- `Record<'en'|'es', ...>` data structures with inline ternaries ARE valid bilingual patterns
- Scope disclaimers using `Scale` icon in amber banners ARE proper implementation
- `<a download>` elements for asset downloads ARE functional (even if assets don't exist yet in dev)
- `navigator.clipboard.writeText()` IS a proper clipboard implementation
- ICP content consumed from `gtm-content.ts` in English and translated inline at the component level IS acceptable (does not require modifying the shared content module)
- The `useLanguage()` hook returning `{ language: string }` where language is 'en' | 'es' is the established pattern
- Edge Functions deployed via Supabase MCP tools (not CLI) is the correct deployment mechanism

## Begin

Review ALL provided files systematically. Verify each previously-reported fix is correctly implemented. Flag any regressions. Output structured JSON for each file, then the Final Summary. Be fair -- this is a re-audit, not a new audit. Focus on verifying fixes and catching regressions.
```
