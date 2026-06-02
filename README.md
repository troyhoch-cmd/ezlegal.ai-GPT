# ezLegal.ai

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-cuxdqrk4)

Ethical, best-in-class AI that delivers access to justice for individuals, small
businesses, and legal aid / pro-bono organizations — with bilingual (EN/ES)
support, crisis escalation, and human-reviewed outputs.

## Purpose

ezLegal.ai is a legaltech platform aimed at three primary ICPs:

1. **Spanish-first individuals** who cannot afford an attorney.
2. **SMBs** with or without in-house counsel.
3. **Legal Service Organizations (LSOs)** and pro-bono organizations.

Users can triage a legal question, get plain-language guidance with citations,
generate court-ready documents, see outcome predictions, and — when needed —
escalate to a vetted attorney or crisis hotline.

## Tech stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + React Router 7
- **Icons:** `lucide-react`
- **Backend / data:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI:** OpenAI via the `openai-chat` edge function; LegalBreeze RAG via
  `legalbreeze-rag`
- **PDF / OCR:** `jspdf`, `pdfjs-dist`, `tesseract.js`

## Directory structure

```
src/
  pages/          Route-level screens (Home, Chatbot, Pricing, EZReads, Admin…)
  components/     Reusable UI (Navigation, ReadingPreferencesToolbar, JargonTerm…)
    cognitive-load/  Overload-reduction primitives
    dashboards/      Grant / compliance / beta-exit dashboards
    charts/          Stat cards, line/bar/donut
    espanol/         Spanish-first modules
    intake/          Persona-specific intake flows
    learning-paths/  Guided learning UI
  contexts/       Auth, Language, Demo, Persona, Personalization, Tenant, Modal
  hooks/          useReadingPreferences, useGlossary, useChromePersona, …
  lib/            Supabase client, i18n, routes, legal copy, utils
  services/       Domain services (chat, prediction, activity, asset, …)
  data/           Static reference data (jurisdictions, lawyers, practice areas)
  conformance/    Per-route policy checks + validator
supabase/
  migrations/     All schema + RLS changes (idempotent, summary-documented)
  functions/      Edge functions (openai-chat, outcome-prediction, legal-scraper…)
scripts/          Audits (headings, readability, images, interaction budget) and
                  conformance scaffolding / dashboard generation
public/           Static assets, manifest, service-worker, redirects
```

## Key product surfaces

| Route | Purpose |
|---|---|
| `/` | Landing — two-CTA hero, persona links, trust strip |
| `/start` | Persona intake routing (individual / business / legal-aid) |
| `/chat`, `/simple-chat`, `/ask` | AI assistant flows (basic + advanced modes) |
| `/ezreads` | Plain-language legal articles with jurisdiction + review metadata |
| `/pricing` | Plans + issue packs with JargonTerm plain-language legend |
| `/lawyer-profiles`, `/find-attorney` | Vetted attorney directory + matching |
| `/emergency-resources` | Crisis escalation (988, 911 guidance, shelters) |
| `/admin`, `/lso` | Admin, audit log, grant reporting, KPI dashboards |

## Database

All persistence goes through **Supabase**. Every table ships with:

- Row Level Security enabled.
- Separate SELECT / INSERT / UPDATE / DELETE policies scoped to `auth.uid()`
  (never `using (true)`).
- A documented migration in `supabase/migrations/` with a multi-line summary
  comment, `IF NOT EXISTS` guards, and meaningful defaults.

## Accessibility & cognitive-load commitments

- Bilingual EN/ES across every user-facing surface.
- `ReadingPreferencesToolbar` gives every visitor: text scaling,
  dyslexia-friendly spacing, high contrast, always-underlined links. Preferences
  persist in `accessibility_preferences` for signed-in users.
- First-visit coach-mark introduces the toolbar, dismissal persisted.
- `JargonTerm` wraps legal terms with plain-language tooltips pulled from the
  `glossary_terms` table.
- Persistent "Urgent help" pill in the header; crisis detection in chat flows.
- `<details>`-based progressive disclosure on dense metadata.

## Local development

```bash
npm install
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Supabase `.env` values are pre-provisioned. Never commit secrets.

## Quality gates

```bash
npm run conformance:check            # Per-route policy checks
npm run audit:headings               # Heading structure
npm run audit:readability            # Readability scoring
npm run audit:images                 # Image alt / sizing / weight
npm run test:interaction-budget      # Interaction-budget assertions
npm run check:claims                 # Marketing claim verifier
```

## Conventions

- Match the codebase: Tailwind utility classes, `navy-*` / `teal-*` palette, no
  purple or indigo.
- Reuse existing utilities (`JargonTerm`, `Heading`, charts, shared intake
  modules) before adding new abstractions.
- Keep files cohesive — split only when a module gains an independent concern.
- Never use `USING (true)` in RLS. Never skip RLS on a new table.
- Never mount mutable module-level state; pass dependencies via context / props.