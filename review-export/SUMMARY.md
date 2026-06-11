# GPT 5.5 Pro Audit Export Summary
# Baseline: v869 (restored 2026-06-11)
# Project: ezLegal.ai

## Stats
- Pages: 77
- Components: 166
- Services: 14
- Migrations: 178
- Edge Functions: 18

## Key Architecture
- Framework: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- Router: React Router v7
- Icons: Lucide React
- Hosting: Netlify (SPA with _redirects)
- i18n: Custom bilingual EN/ES via LanguageContext

## Audit Mode
Append ?demo=audit to any URL to bypass auth gates for full crawlability.

## Files in This Export
- ROUTE_MANIFEST.md - All routes with component mappings
- PAGE_INVENTORY.md - All page files with feature flags
- COMPONENT_INVENTORY.md - All components with line counts
- MIGRATION_INVENTORY.md - All database migrations
- AUDIT_PROMPT.md - Instructions for GPT 5.5 Pro audit
- App.tsx - Main router configuration
- index.html - Entry HTML
- pages/ - All page source files
- components/ - Top-level component source files
- services/ - Service layer source files
- lib/ - Key utility files
