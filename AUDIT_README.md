# ezLegal.ai Automated Full-Site Audit System

## Overview

A comprehensive automated audit harness that evaluates every public route across five dimensions:

1. **Visual & Layout** - Screenshots, responsive overflow, text contrast
2. **Accessibility (WCAG 2.1 AA)** - axe-core checks, heading hierarchy, focus management
3. **Content Quality** - Reading level (Flesch-Kincaid), legal jargon, sentence complexity, Spanish content
4. **Conversion & CTA** - CTA placement, form burden, trust signals
5. **Ethical AI Compliance** - AI disclosure, escalation paths, jurisdiction warnings

Supports two audit modes:
- **Local** - Audits the local dev server (`localhost:5173`)
- **Live** - Crawls and audits the deployed site (`https://dev.ezlegal.ai`)

## Quick Start

```bash
# Audit local dev server (requires server running on localhost:5173)
npm run audit:all:local

# Audit the live deployed site
npm run audit:all:live
```

Output is written to separate directories:
- `audit-output/local/` for local audits
- `audit-output/live/` for live site audits

## All Audit Commands

| Command | Description |
|---------|-------------|
| `npm run audit:all:local` | Full audit against local dev server |
| `npm run audit:all:live` | Full audit against live site with crawling |
| `npm run audit:all` | Full audit using default mode from config |
| `npm run audit:routes` | Discover routes (source-based or crawl-based) |
| `npm run audit:visual` | Screenshot and layout checks per viewport |
| `npm run audit:a11y` | axe-core accessibility violations |
| `npm run audit:content` | Reading level, jargon, Spanish content |
| `npm run audit:conversion` | CTA hierarchy, forms, trust signals, ethical AI |
| `npm run audit:report` | Combine all results into final report |
| `npm run audit:static` | Legacy static file scanners (headings, readability, images) |

Individual scripts also accept `--local` or `--live` flags:
```bash
node scripts/audit/discover-routes.mjs --live
node scripts/audit/run-visual-audit.mjs --live
```

## Prerequisites

- **Local mode:** Dev server running (`npm run dev`) + Playwright Chromium
- **Live mode:** Network access to `https://dev.ezlegal.ai` + Playwright Chromium

Install Playwright browsers:
```bash
npx playwright install chromium
```

## Configuration

All audit parameters are in `audit.config.json`:

### Mode & URLs
| Field | Description |
|-------|-------------|
| `mode` | Default mode: `"local"` or `"live"` |
| `localBaseUrl` | Local dev server URL (default: `http://localhost:5173`) |
| `liveBaseUrl` | Live site URL (default: `https://dev.ezlegal.ai`) |

### Live Crawl Settings
| Field | Description |
|-------|-------------|
| `liveCrawl.maxDepth` | Maximum link-following depth (default: 3) |
| `liveCrawl.maxPages` | Maximum pages to crawl (default: 100) |
| `liveCrawl.respectRobotsTxt` | Honor robots.txt disallow rules (default: true) |
| `liveCrawl.crawlDelay` | Milliseconds between requests (default: 500) |
| `liveCrawl.userAgent` | User-Agent string for crawl requests |

### Audit Parameters
| Field | Description |
|-------|-------------|
| `viewports` | Mobile (375px), Tablet (768px), Desktop (1440px) |
| `icpDefinitions` | Three target personas with their routes |
| `contentThresholds` | Max reading grade (8), sentence length (30 words) |
| `conversionThresholds` | Max form fields (5), CTAs per viewport (3) |
| `excludeRoutes` | Routes to skip (auth callbacks, admin) |
| `severityLevels` | Critical, High, Medium, Low with SLA definitions |

## Output Structure

```
audit-output/
  local/                        # Local dev server results
    route-inventory.json
    visual-audit.json
    page-dom-inventory.json
    accessibility-audit.json
    content-audit.json
    conversion-audit.json
    FULL_SITE_AUDIT.json
    FULL_SITE_AUDIT.md
    screenshots/
  live/                         # Live site results
    route-inventory.json
    visual-audit.json
    page-dom-inventory.json
    accessibility-audit.json
    content-audit.json
    conversion-audit.json
    FULL_SITE_AUDIT.json
    FULL_SITE_AUDIT.md
    screenshots/
```

## How Route Discovery Works

### Local Mode
Routes are extracted statically from `src/lib/routes.ts` by regex-matching path strings. Fast and deterministic.

### Live Mode
Routes are discovered by crawling:
1. Starts at the `liveBaseUrl` root (`/`)
2. Loads each page with Playwright, extracts all internal `<a href>` links
3. Follows links up to `maxDepth` levels deep
4. Respects `robots.txt` disallow rules
5. Stops after `maxPages` pages or when no new links are found
6. Applies `crawlDelay` between requests to avoid overwhelming the server

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
  resolve-config.mjs            # Shared config resolver (mode, paths)
  discover-routes.mjs           # Static route extraction OR live crawl
  run-visual-audit.mjs          # Playwright screenshot + overflow detection
  run-accessibility-audit.mjs   # axe-core + heading hierarchy + focus
  run-content-audit.mjs         # NLP metrics + jargon + Spanish detection
  run-conversion-audit.mjs      # CTA + forms + trust + ethical AI
  generate-full-site-audit.mjs  # Report aggregation and markdown generation
```

Each script imports `resolve-config.mjs` which determines mode from CLI flags (`--local`/`--live`) or the config file's `mode` field. Output goes to mode-specific subdirectories.

## Comparing Local vs Live Results

After running both audits, you can compare results:
```bash
# Run both
npm run audit:all:local
npm run audit:all:live

# Compare finding counts
cat audit-output/local/FULL_SITE_AUDIT.json | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('Local:',d.summary.totalFindings,'findings')"
cat audit-output/live/FULL_SITE_AUDIT.json | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('Live:',d.summary.totalFindings,'findings')"
```
