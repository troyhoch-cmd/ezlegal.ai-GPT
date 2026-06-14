# ezLegal.ai Automated Full-Site Audit System

## Overview

A comprehensive automated audit harness that evaluates every public route across five dimensions:

1. **Visual & Layout** - Screenshots, responsive overflow, text contrast
2. **Accessibility (WCAG 2.1 AA)** - axe-core checks, heading hierarchy, focus management
3. **Content Quality** - Reading level (Flesch-Kincaid), legal jargon, sentence complexity, Spanish content
4. **Conversion & CTA** - CTA placement, form burden, trust signals
5. **Ethical AI Compliance** - AI disclosure, escalation paths, jurisdiction warnings

## Quick Start

```bash
# Run the complete audit (requires dev server running on localhost:5173)
npm run audit:all
```

This generates `audit-output/FULL_SITE_AUDIT.md` and `audit-output/FULL_SITE_AUDIT.json`.

## Individual Audit Commands

| Command | Description |
|---------|-------------|
| `npm run audit:routes` | Discover and inventory all routes |
| `npm run audit:visual` | Screenshot and layout checks per viewport |
| `npm run audit:a11y` | axe-core accessibility violations |
| `npm run audit:content` | Reading level, jargon, Spanish content |
| `npm run audit:conversion` | CTA hierarchy, forms, trust signals, ethical AI |
| `npm run audit:report` | Combine all results into final report |
| `npm run audit:static` | Legacy static file scanners (headings, readability, images) |

## Prerequisites

- Dev server running (`npm run dev`)
- Playwright browsers installed (`npx playwright install chromium`)

## Configuration

All audit parameters are in `audit.config.json`:

- **baseUrl** - Where the dev server runs
- **viewports** - Mobile (375px), Tablet (768px), Desktop (1440px)
- **icpDefinitions** - Three target personas with their routes
- **contentThresholds** - Max reading grade (8), sentence length (30 words)
- **conversionThresholds** - Max form fields (5), CTAs per viewport (3)
- **excludeRoutes** - Routes to skip (auth callbacks, admin)
- **severityLevels** - Critical, High, Medium, Low with SLA definitions

## Output Structure

```
audit-output/
  route-inventory.json      # All discovered routes with ICP mapping
  visual-audit.json         # Layout/overflow findings + screenshots
  accessibility-audit.json  # axe-core WCAG violations
  content-audit.json        # Reading metrics per route
  conversion-audit.json     # CTA/trust/ethical AI metrics
  FULL_SITE_AUDIT.json      # Combined machine-readable report
  FULL_SITE_AUDIT.md        # Human-readable markdown report
  screenshots/              # Full-page screenshots per route per viewport
```

## ICP Definitions

| ICP | Routes | Key Expectations |
|-----|--------|-----------------|
| Spanish-speaking individuals | `/espanol`, `/es` | Spanish content, bilingual nav |
| Small & Medium Businesses | `/for-business`, `/pricing`, `/features` | Clear pricing, ROI messaging |
| Pro Bono / Legal Service Orgs | `/for-organizations`, `/pro-bono`, `/grant-reporting` | Impact metrics, volume pricing |

## Severity Levels

| Level | Description | SLA |
|-------|-------------|-----|
| Critical | Blocks access or violates compliance | 24 hours |
| High | Significantly degrades UX or conversion | 1 week |
| Medium | Noticeable issue for specific segments | 2 weeks |
| Low | Minor polish or enhancement | Next sprint |

## Architecture

```
scripts/audit/
  discover-routes.mjs         # Static route extraction from routes.ts
  run-visual-audit.mjs        # Playwright screenshot + overflow detection
  run-accessibility-audit.mjs # axe-core + heading hierarchy + focus
  run-content-audit.mjs       # NLP metrics + jargon + Spanish detection
  run-conversion-audit.mjs    # CTA + forms + trust + ethical AI
  generate-full-site-audit.mjs # Report aggregation and markdown generation
```

Each script reads `audit.config.json` and `route-inventory.json`, then outputs its own JSON results. The report generator combines all results into the final deliverables.
