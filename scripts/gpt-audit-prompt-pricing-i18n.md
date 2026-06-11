# GPT 5.5 Pro Audit Prompt: Pricing Page Redesign + i18n Restoration

## Context for the Auditor

You are auditing the ezLegal.ai platform -- the #1 AI company in legal tech focused on converting consumers and SMBs who cannot afford a lawyer. The platform is a Vite 5 + React 18 + TypeScript 5.9 + Tailwind CSS 3.4 application with bilingual EN/ES support, WCAG 2.2 AA compliance, and Supabase backend.

This audit covers TWO changes made in response to your previous audit findings:

1. **i18n Restoration**: The full `translations.ts` file was regenerated with ~747 keys per language (EN/ES), covering all 70+ routes. No page should now fall back to raw key strings.

2. **Pricing Page Redesign**: Per your previous audit's specific code prompt, the pricing architecture was updated to meet best-in-class subscription conversion standards.

---

## What Changed (Pricing)

### Data Layer (`src/data/pricing.ts`)

**New PricingPlan interface:**
```typescript
export interface PricingPlan {
  id: string;
  name: { en: string; es: string };
  audience: 'individuals' | 'business' | 'legal-aid';
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceDisplay: { en: string; es: string };
  annualPriceDisplay?: { en: string; es: string };
  priceNote?: { en: string; es: string };
  description: { en: string; es: string };
  features: { en: string[]; es: string[] };
  ctaLabel: { en: string; es: string };
  ctaHref: string;
  recommended?: boolean;
  badge?: { en: string; es: string };
  ethicalNote?: { en: string; es: string };
  isFinalPrice: boolean;
  isFoundingPrice: boolean;
  isAddOn?: boolean;
  isStartingAt?: boolean;
}
```

**Key changes:**
- Old `price: { en; es }` replaced with separate `priceDisplay` (monthly) and `annualPriceDisplay` (annual)
- Numeric `monthlyPrice` and `annualPrice` fields enable dynamic savings calculations
- `isFoundingPrice: boolean` replaces old "pilot pricing" language
- `isStartingAt: boolean` for coalition/variable pricing
- Annual prices: Plus $89/yr, Family $189/yr, Biz Starter $290/yr, Biz Plus $790/yr (all ~2 months free vs monthly)
- Enhanced FAQ expanded to 8 bilingual questions covering: legal advice boundary, when to talk to a lawyer, monthly limits, cancellation, Spanish support, legal-aid monetization, data training, urgent-help access

**Plan lineup:**
| Tab | Plans |
|-----|-------|
| Individuals | Free ($0), Everyday Plus ($9/mo or $89/yr), Family ($19/mo or $189/yr), Boost ($5 one-time add-on) |
| Business | Starter ($29/mo or $290/yr), Plus ($79/mo or $790/yr), Pro (Custom) |
| Legal Aid | Verified Legal Aid (Free/Sponsored), Coalition (Starting at $499/mo), Enterprise/Government (Custom) |

---

### New Component: `PricingTrustStrip.tsx`

A reusable trust strip placed both below the hero AND below the pricing cards:

```tsx
const safeguards = [
  { icon: Server, en: 'Your data never trains AI models', es: '...' },
  { icon: Lock, en: 'Encrypted in transit and at rest', es: '...' },
  { icon: Eye, en: 'Human review available on every plan', es: '...' },
  { icon: Scale, en: 'Not legal advice — clear boundaries always', es: '...' },
  { icon: Shield, en: 'SOC 2 controls & ABA AI ethics aligned', es: '...' },
];
```

Renders as a horizontal strip of 5 safeguard badges with teal icons and navy text.

---

### Updated Component: `PricingCard.tsx`

**New props:** `billingCycle?: 'monthly' | 'annual'`

**Key behaviors:**
- Displays `plan.priceDisplay` when monthly, `plan.annualPriceDisplay` when annual
- Shows dynamic savings line: "Save vs monthly ($X off/year)" when annual is selected and plan has both prices
- Replaces old "pilot pricing" amber text with: `"Founding price -- locked 12 mo"` in a teal badge when `plan.isFoundingPrice === true`
- Shows "base price" note for `isStartingAt` plans
- Added `aria-label` on CTA links: `${plan.ctaLabel[l]} - ${plan.name[l]}`
- Feature list with expand/collapse (4 visible by default)
- Ethical note below CTA (cancel policy, refund guarantee)

---

### Updated Page: `Pricing.tsx`

**New state:** `billingCycle: 'monthly' | 'annual'` (defaults to `'annual'`)

**Billing toggle:**
- Renders Monthly / Annual buttons with active state
- "2 months free" badge appears next to Annual when selected
- `aria-label` attributes on both toggle buttons
- Only shows when current tab has plans with annual pricing

**Trust strip placement:**
- `<PricingTrustStrip>` renders below hero section
- `<PricingTrustStrip>` renders again below pricing cards (before comparison table)

**Other updates:**
- Paid plan disclaimer now checks `plan.monthlyPrice > 0` instead of string parsing
- Add-on section uses `plan.priceDisplay[l]` instead of old `plan.price[l]`
- Tab buttons have descriptive `aria-label`
- Audience headline and subline render for all tabs

**Full page flow:**
1. Hero (value prop + bilingual notice)
2. Trust strip (5 safeguards)
3. Audience tabs (Individuals / Business / Legal Aid)
4. Billing toggle (Monthly / Annual with "2 months free")
5. Audience headline + subline
6. Plan cards grid (3-col or 4-col responsive)
7. Paid plan disclaimer
8. Access to Justice card (individuals tab)
9. Org quick-links (legal-aid tab)
10. Add-on cards (Boost)
11. Help Me Choose wizard trigger + wizard
12. Trust strip (repeated)
13. Comparison table (individuals tab)
14. Marketplace section (referral model transparency)
15. FAQ (8 questions, accordion)
16. Ethical pricing footer line

---

### Updated Service: `pricingService.ts`

The `dbTierToFrontend()` function now outputs the new interface fields:
- `monthlyPrice`, `annualPrice` (numeric)
- `priceDisplay`, `annualPriceDisplay` (formatted strings)
- `isFoundingPrice: true` for all paid subscription plans from DB
- Removed old `price` field entirely

---

## What Changed (i18n)

### `src/lib/translations.ts`

- **1499 lines**, ~747 keys per language (EN and ES blocks)
- Coverage spans all namespaces: nav, hero, home, common, login, signup, forgot, auth, features, pricing, checkout, crisis, safety, urgent, highRisk, trust, footer, guides, articles, topics, CTA, clients, a11y, errors, success, user, dashboard, dash, partner, database, contact, about, howItWorks, forBusiness, forOrgs, issuePacks, chat, documents, research, profile, billing, matters, privacy, terms, accessibility, ezreads, negotiate, mediaKit, admin, lso, partnerHub, trustCenter, aiGovernance, scheduleDemo, featureGuide, toolkit, cases, siteAudit, espanol, offline, pwa
- All 70+ lazy-loaded routes have corresponding translation keys
- No page should show raw key fallbacks (e.g., `pricing.title` instead of actual text)

---

## Audit Criteria

Please evaluate against these dimensions, scoring each 1-5 (1=critical gap, 5=unconditional best-in-class):

### A. Subscription Conversion Architecture (Pricing)
1. **Billing toggle UX**: Is the monthly/annual toggle clear, accessible, and does it create urgency with savings display?
2. **Price anchoring**: Does the annual default + savings callout effectively anchor value?
3. **Trust proximity**: Are trust signals placed close enough to CTAs to reduce friction?
4. **Founding member psychology**: Does the "locked for 12 months" language create appropriate urgency without being manipulative?
5. **Progressive disclosure**: Is the information density appropriate (features collapsed, FAQ accordion, comparison table)?
6. **Ethical conversion**: Does the page maintain ethical boundaries (no dark patterns, clear "not legal advice" disclaimers, free tier genuinely useful)?
7. **CTA hierarchy**: Is the visual hierarchy of CTAs clear across Free/Paid/Enterprise paths?
8. **FAQ completeness**: Do the 8 FAQ items address the top objections for legal-tech subscription conversion?

### B. Accessibility & Bilingual Parity
9. **ARIA implementation**: Are tab roles, aria-expanded, aria-selected, and aria-labels correctly applied?
10. **Spanish parity**: Is the Spanish copy equivalent in tone, completeness, and conversion power to English?
11. **Responsive behavior**: Does the layout degrade gracefully (grid columns, toggle wrapping, trust strip wrapping)?

### C. i18n Coverage
12. **Key completeness**: With 747 keys per language, are there likely gaps for any of the 70+ routes?
13. **Namespace organization**: Is the key naming convention consistent and maintainable?
14. **Fallback safety**: If a key is missing, does the system fail gracefully?

### D. Data Architecture
15. **Interface design**: Is the PricingPlan interface future-proof for adding new plans, tiers, or billing models?
16. **Service layer**: Does the pricingService correctly transform DB rows to the new frontend interface?
17. **Static fallback**: Is the static-first approach (with DB override) appropriate for a pricing page?

### E. Competitive Position
18. **vs. LegalZoom/Rocket Lawyer**: Does the pricing page communicate differentiation (ethical AI, bilingual, access-to-justice mission)?
19. **vs. SaaS best practices**: Does the page follow Stripe Atlas / Notion / Linear patterns for SaaS pricing?
20. **Trust differentiation**: Do the 5 safeguard points adequately distinguish ezLegal.ai from generic AI legal tools?

---

## Scoring Request

For each of the 20 criteria above, provide:
- Score (1-5)
- One-line rationale
- If score < 5: specific code-level recommendation to reach 5

Then provide:
- **Overall verdict**: "Unconditional best-in-class" / "Conditional best-in-class (with fixes)" / "Competitive but not yet best-in-class"
- **Top 3 remaining gaps** (if any) with specific Bolt code prompts to fix them
- **Top 3 strengths** that should be preserved

---

## Files for Reference

If you need to see full source code, the key files are:
- `src/data/pricing.ts` (545 lines - full plan data + FAQ + comparison matrix)
- `src/pages/Pricing.tsx` (268 lines - main page with toggle, tabs, trust strips)
- `src/components/pricing/PricingCard.tsx` (103 lines - card with billing cycle support)
- `src/components/pricing/PricingTrustStrip.tsx` (52 lines - 5-point safeguard strip)
- `src/components/pricing/PricingFAQ.tsx` (58 lines - accordion FAQ)
- `src/components/pricing/ComparisonTable.tsx` (82 lines - expandable feature matrix)
- `src/components/pricing/HelpMeChoose.tsx` (167 lines - guided wizard)
- `src/components/pricing/MarketplaceSection.tsx` (92 lines - referral transparency)
- `src/services/pricingService.ts` (180 lines - DB-to-frontend transformer)
- `src/lib/translations.ts` (1499 lines - full EN/ES i18n with 747 keys per language)
