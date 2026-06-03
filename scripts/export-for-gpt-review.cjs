/**
 * export-for-gpt-review.cjs
 *
 * Exports the full ezLegal.ai codebase into organized chunks for GPT-5.5 review.
 * Each chunk is sized to fit within a single upload to ChatGPT (~80K tokens max).
 *
 * Output: review-export/ directory with numbered markdown files by category:
 *   01-architecture.md    - package.json, configs, routes, app structure
 *   02-pages-core.md      - Home, ChatV2, Login, Signup, Pricing
 *   03-pages-features.md  - Dashboard, Documents, Negotiate, CasePredictor, etc.
 *   04-components-ui.md   - Navigation, Layout, shared components
 *   05-components-chat.md - Chat components, cognitive-load, intake
 *   06-components-trust.md - Trust, safety, disclaimers, crisis components
 *   07-services.md        - All service files
 *   08-lib-core.md        - Core lib files (supabase, routes, analytics, i18n)
 *   09-lib-safety.md      - Safety config, legal disclosures, intake logic
 *   10-edge-functions.md  - All Supabase edge functions
 *   11-migrations-1.md    - First half of database migrations
 *   12-migrations-2.md    - Second half of database migrations
 *   13-tests.md           - Test files
 *   14-data.md            - Data files (copy, content, config)
 *
 * Usage: node scripts/export-for-gpt-review.cjs
 */

const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'review-export');

function read(rel) {
  const abs = path.join(ROOT, rel);
  try { return fs.readFileSync(abs, 'utf-8'); } catch { return `[FILE NOT FOUND: ${rel}]`; }
}

function fileSection(filePath) {
  const ext = filePath.endsWith('.tsx') ? 'tsx'
    : filePath.endsWith('.ts') ? 'typescript'
    : filePath.endsWith('.sql') ? 'sql'
    : filePath.endsWith('.json') ? 'json'
    : filePath.endsWith('.js') || filePath.endsWith('.cjs') ? 'javascript'
    : 'text';
  const content = read(filePath);
  return `## ${filePath}\n\n\`\`\`${ext}\n${content}\n\`\`\`\n\n---\n\n`;
}

function writeChunk(filename, title, description, files) {
  const validFiles = files.filter(f => fs.existsSync(path.join(ROOT, f)));
  let out = `# ezLegal.ai Code Review - ${title}\n\n`;
  out += `> ${description}\n\n`;
  out += `Generated: ${new Date().toISOString()}\n`;
  out += `Files included: ${validFiles.length}\n\n---\n\n`;

  for (const f of validFiles) {
    out += fileSection(f);
  }

  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, out);
  const sizeKB = (out.length / 1024).toFixed(0);
  const approxTokens = Math.round(out.length / 4);
  console.log(`  ${filename} - ${sizeKB} KB (~${(approxTokens/1000).toFixed(0)}K tokens, ${validFiles.length} files)`);
}

function globFiles(pattern) {
  return glob.sync(pattern, { cwd: ROOT }).sort();
}

// --- Main ---

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('\n  ezLegal.ai - GPT-5.5 Review Export\n');
console.log('  Generating review chunks...\n');

// 01 - Architecture
writeChunk('01-architecture.md', 'Architecture & Configuration', 'Project structure, routing, build config, and dependencies.', [
  'package.json',
  'tsconfig.app.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'index.html',
  'netlify.toml',
  'src/App.tsx',
  'src/main.tsx',
  'src/config/routes.ts',
  'src/lib/routes.ts',
  'src/lib/navigation.ts',
  'src/lib/dynamic-imports.ts',
]);

// 02 - Core Pages
writeChunk('02-pages-core.md', 'Core Pages', 'Homepage, chat, authentication, and pricing pages.', [
  'src/pages/Home.tsx',
  'src/pages/ChatV2.tsx',
  'src/pages/Login.tsx',
  'src/pages/Signup.tsx',
  'src/pages/ForgotPassword.tsx',
  'src/pages/ResetPassword.tsx',
  'src/pages/Pricing.tsx',
  'src/pages/Checkout.tsx',
]);

// 03 - Feature Pages
writeChunk('03-pages-features.md', 'Feature Pages', 'Dashboard, documents, tools, and feature pages.', [
  'src/pages/Dashboard.tsx',
  'src/pages/Documents.tsx',
  'src/pages/Negotiate.tsx',
  'src/pages/CasePredictor.tsx',
  'src/pages/IssuePacks.tsx',
  'src/pages/Toolkit.tsx',
  'src/pages/LawyerProfiles.tsx',
  'src/pages/EZReads.tsx',
  'src/pages/ForBusiness.tsx',
  'src/pages/ForStartups.tsx',
  'src/pages/ForLawFirms.tsx',
  'src/pages/ForOrganizations.tsx',
  'src/pages/EspanolLanding.tsx',
  'src/pages/PersonaIntake.tsx',
]);

// 04 - UI Components
writeChunk('04-components-ui.md', 'UI Components', 'Navigation, layout, and shared interface components.', [
  'src/components/Navigation.tsx',
  'src/components/Layout.tsx',
  'src/components/Footer.tsx',
  'src/components/MobileBottomNav.tsx',
  'src/components/MobileDrawer.tsx',
  'src/components/UserMenu.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/Breadcrumbs.tsx',
  'src/components/LocalePicker.tsx',
  'src/components/ThemeToggle.tsx',
  'src/components/SkipLink.tsx',
  'src/components/home/index.ts',
  'src/components/home/HomeShell.tsx',
  'src/components/home/HeroIntake.tsx',
  'src/components/home/SituationExplorer.tsx',
  'src/components/home/MobileStickyBar.tsx',
  'src/components/home/FinalCTA.tsx',
  'src/components/home/UrgentStrip.tsx',
]);

// 05 - Chat Components
writeChunk('05-components-chat.md', 'Chat & Cognitive Load Components', 'Chat interface, AI responses, cognitive load reduction.', [
  'src/components/chat/index.ts',
  'src/components/chat/ChatDisclaimer.tsx',
  'src/components/chat/FinalActionCards.tsx',
  'src/components/chat/IssueCategoryGrid.tsx',
  'src/components/chat/JurisdictionModal.tsx',
  'src/components/chat/UrgencyScreening.tsx',
  'src/components/cognitive-load/index.ts',
  'src/components/cognitive-load/TabbedResponse.tsx',
  'src/components/cognitive-load/CollapsibleSidebar.tsx',
  'src/components/cognitive-load/ContextualCrisisAlert.tsx',
  'src/components/cognitive-load/MoreHelpDrawer.tsx',
  'src/components/cognitive-load/TabbedResponse.tsx',
  'src/components/cognitive-load/UnifiedTrustStrip.tsx',
  'src/components/ChatPrivacyGate.tsx',
  'src/components/HandoffRequestForm.tsx',
  'src/components/UrgentSignalCard.tsx',
  'src/components/CrisisStrip.tsx',
  'src/components/AnswerModeSelector.tsx',
]);

// 06 - Trust & Safety Components
writeChunk('06-components-trust.md', 'Trust, Safety & Legal Components', 'Disclaimers, safety gates, trust signals, intake flows.', [
  'src/components/trust/AccessToJusticeCard.tsx',
  'src/components/trust/AIGovernanceSummary.tsx',
  'src/components/trust/DataUsePlainLanguage.tsx',
  'src/components/trust/GovernanceEvidencePanel.tsx',
  'src/components/trust/HumanEscalationCard.tsx',
  'src/components/trust/ScopeBoundaryCard.tsx',
  'src/components/trust/TrustCTABlock.tsx',
  'src/components/shared/AISafetyMicrocopy.tsx',
  'src/components/shared/LegalDisclaimer.tsx',
  'src/components/shared/CrisisResourceCard.tsx',
  'src/components/shared/AttorneyServiceDisclosure.tsx',
  'src/components/shared/UrgentHelpLink.tsx',
  'src/components/intake/GuidedIntakeShell.tsx',
  'src/components/intake/IndividualIntake.tsx',
  'src/components/intake/BusinessIntake.tsx',
  'src/components/intake/LegalAidIntake.tsx',
  'src/components/intake/EmergencyTriageNotice.tsx',
  'src/components/intake/ProgressStepper.tsx',
]);

// 07 - Services
writeChunk('07-services.md', 'Services', 'Backend service modules for chat, analytics, predictions, and more.', [
  'src/services/chat-service.ts',
  'src/services/analytics-service.ts',
  'src/services/prediction-service.ts',
  'src/services/safety-net-service.ts',
  'src/services/engagement-service.ts',
  'src/services/entitlement-service.ts',
  'src/services/case-matching-service.ts',
  'src/services/activity-service.ts',
  'src/services/asset-service.ts',
  'src/services/beta-metrics-service.ts',
  'src/services/contextual-prediction-service.ts',
  'src/services/distribution-service.ts',
  'src/services/icp-template-service.ts',
  'src/services/pdf-export-service.ts',
  'src/services/ui-preferences-service.ts',
]);

// 08 - Core Lib
writeChunk('08-lib-core.md', 'Core Library', 'Supabase client, routing, analytics, i18n, and utilities.', [
  'src/lib/supabase.ts',
  'src/lib/routes.ts',
  'src/lib/i18n.ts',
  'src/lib/translations.ts',
  'src/lib/gtm-analytics.ts',
  'src/lib/gtm-content.ts',
  'src/lib/ab-test-config.ts',
  'src/lib/consent.ts',
  'src/lib/focus-manager.ts',
  'src/lib/focus-trap.ts',
  'src/lib/error-handler.ts',
  'src/lib/leads.ts',
  'src/lib/plan-context.ts',
  'src/lib/tenant-config.ts',
  'src/contexts/AuthContext.tsx',
  'src/contexts/LanguageContext.tsx',
  'src/contexts/PersonaContext.tsx',
]);

// 09 - Safety Lib
writeChunk('09-lib-safety.md', 'Safety & Legal Library', 'Safety config, legal disclosures, intake logic, attorney review.', [
  'src/lib/legalSafetyConfig.ts',
  'src/lib/legal-disclosures.ts',
  'src/lib/urgent-signal-detector.ts',
  'src/lib/legalbreeze-api.ts',
  'src/lib/globalLegalAIStandards.ts',
  'src/lib/claims-registry.ts',
  'src/lib/intake/types.ts',
  'src/lib/intake/routes.ts',
  'src/lib/intake/persistence.ts',
  'src/lib/intake/recovery.ts',
  'src/lib/intake/security.ts',
  'src/lib/intake/scopeBoundaries.ts',
  'src/lib/intake/analytics.ts',
  'src/lib/attorneyReview/index.ts',
  'src/lib/attorneyReview/types.ts',
  'src/lib/attorneyReview/requests.ts',
  'src/lib/attorneyReview/pricing.ts',
  'src/lib/legalAid/types.ts',
  'src/lib/legalAid/matching.ts',
  'src/lib/legalAid/directory.ts',
]);

// 10 - Edge Functions
writeChunk('10-edge-functions.md', 'Supabase Edge Functions', 'All serverless edge functions.', [
  'supabase/functions/openai-chat/index.ts',
  'supabase/functions/stripe-checkout-session/index.ts',
  'supabase/functions/stripe-webhook/index.ts',
  'supabase/functions/legalbreeze-rag/index.ts',
  'supabase/functions/outcome-prediction/index.ts',
  'supabase/functions/analyze-document/index.ts',
  'supabase/functions/explain-document/index.ts',
  'supabase/functions/data-export/index.ts',
  'supabase/functions/data-deletion/index.ts',
  'supabase/functions/data-cleanup/index.ts',
  'supabase/functions/grant-report/index.ts',
  'supabase/functions/send-asset-email/index.ts',
  'supabase/functions/send-legal-guide/index.ts',
  'supabase/functions/embed-widget/index.ts',
  'supabase/functions/legal-scraper/index.ts',
  'supabase/functions/ars-scraper/index.ts',
  'supabase/functions/sitemap/index.ts',
  'supabase/functions/image-sitemap/index.ts',
]);

// 11 & 12 - Migrations (split in half)
const allMigrations = globFiles('supabase/migrations/*.sql');
const midpoint = Math.ceil(allMigrations.length / 2);

writeChunk('11-migrations-1.md', 'Database Migrations (Part 1)', `First ${midpoint} migrations - schema creation and early features.`, allMigrations.slice(0, midpoint));
writeChunk('12-migrations-2.md', 'Database Migrations (Part 2)', `Remaining ${allMigrations.length - midpoint} migrations - features and security hardening.`, allMigrations.slice(midpoint));

// 13 - Tests
writeChunk('13-tests.md', 'Test Suite', 'End-to-end tests, security tests, and spec files.', [
  'playwright.config.ts',
  'tests/e2e/smoke.spec.ts',
  'tests/e2e/accessibility.spec.ts',
  'tests/e2e/safety-contracts.spec.ts',
  'tests/e2e/spanish-flow.spec.ts',
  'tests/e2e/responsive.spec.ts',
  'tests/e2e/cta-rendered-text.spec.ts',
  'tests/e2e/chat-prefill-smoke.spec.ts',
  'tests/security/secrets-scan.cjs',
  'tests/security.static.spec.ts',
]);

// 14 - Data files
writeChunk('14-data.md', 'Data & Content', 'Static data, copy, pricing, and configuration content.', [
  'src/data/safetyCopy.ts',
  'src/data/homepageContent.ts',
  'src/data/audiencePaths.ts',
  'src/data/practiceAreas.ts',
  'src/data/jurisdictions.ts',
  'src/data/pricing.ts',
  'src/data/trustSignals.ts',
  'src/data/icpRoutes.ts',
  'src/data/intakeQuestions.ts',
  'src/data/governanceCopy.ts',
  'src/data/governanceChecklist.ts',
  'src/data/aiSafety.ts',
  'src/data/conversionEvents.ts',
  'src/data/homeCopy.ts',
  'src/data/legalContentStatus.ts',
]);

// Summary
console.log('\n  Done! Files written to: review-export/');
console.log('\n  Upload instructions:');
console.log('  1. Open ChatGPT with GPT-5.5 model');
console.log('  2. Upload files in order (01 through 14)');
console.log('  3. Use the audit prompts from scripts/gpt-audit-prompts.md');
console.log('  4. Or upload all at once for a comprehensive review\n');
