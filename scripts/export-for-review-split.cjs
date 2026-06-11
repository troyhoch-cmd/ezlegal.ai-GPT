/**
 * export-for-review-split.cjs
 *
 * Generates multiple review files sized for GPT-5.5 Pro upload:
 *   - site-review-1-routes-and-config.md (routes, app, config, analytics)
 *   - site-review-2-core-pages.md (Home, Chat, Pricing, Signup, Login, EspanolLanding)
 *   - site-review-3-conversion-flow.md (Checkout, Dashboard, Billing, IssuePacks, Toolkit)
 *   - site-review-4-trust-and-safety.md (Legal pages, disclaimers, crisis, emergency)
 *   - site-review-5-components.md (Navigation, Layout, shared UI, cognitive-load)
 *
 * Usage: node scripts/export-for-review-split.cjs
 * Then upload each file to GPT-5.5 Pro in sequence.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  const abs = path.join(ROOT, rel);
  try { return fs.readFileSync(abs, 'utf-8'); } catch { return `[NOT FOUND: ${rel}]`; }
}

function section(title, filePath, lang) {
  const ext = lang || (filePath.endsWith('.tsx') ? 'tsx' : filePath.endsWith('.ts') ? 'typescript' : 'text');
  return `### ${filePath}\n\n\`\`\`${ext}\n${read(filePath)}\n\`\`\`\n\n---\n\n`;
}

function writeChunk(filename, title, files) {
  let out = `# ezLegal.ai - ${title}\n\nGenerated: ${new Date().toISOString()}\n\n---\n\n`;
  for (const f of files) {
    if (fs.existsSync(path.join(ROOT, f))) {
      out += section(f, f);
    }
  }
  const outPath = path.join(ROOT, filename);
  fs.writeFileSync(outPath, out);
  console.log(`  ${filename} (${(out.length / 1024).toFixed(0)} KB, ${files.length} files)`);
}

console.log('Generating review exports...\n');

writeChunk('site-review-1-routes-and-config.md', 'Routes, App Shell & Configuration', [
  'src/App.tsx',
  'src/lib/routes.ts',
  'src/lib/supabase.ts',
  'src/contexts/AuthContext.tsx',
  'src/contexts/LanguageContext.tsx',
  'src/contexts/PersonaContext.tsx',
  'src/services/analytics-service.ts',
  'src/lib/ab-test-config.ts',
  'src/lib/legal-disclosures.ts',
  'src/lib/microcopy.ts',
  'src/lib/translations.ts',
  'src/data/pricing.ts',
  'tailwind.config.js',
  'index.html',
  'netlify.toml',
]);

writeChunk('site-review-2-core-pages.md', 'Core User Pages (Home, Chat, Pricing, Auth)', [
  'src/pages/Home.tsx',
  'src/pages/ChatV2.tsx',
  'src/pages/Pricing.tsx',
  'src/pages/Signup.tsx',
  'src/pages/Login.tsx',
  'src/pages/ForgotPassword.tsx',
  'src/pages/ResetPassword.tsx',
  'src/pages/EspanolLanding.tsx',
  'src/pages/Ask.tsx',
  'src/pages/PersonaIntake.tsx',
  'src/pages/ForIndividuals.tsx',
  'src/pages/ForBusiness.tsx',
  'src/pages/ForOrganizations.tsx',
  'src/pages/HowItWorks.tsx',
  'src/pages/Features.tsx',
]);

writeChunk('site-review-3-conversion-flow.md', 'Conversion & Post-Purchase Flow', [
  'src/pages/Checkout.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Billing.tsx',
  'src/pages/IssuePacks.tsx',
  'src/pages/Toolkit.tsx',
  'src/pages/Documents.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Negotiate.tsx',
  'src/pages/CasePredictor.tsx',
  'src/pages/CasePredictorStart.tsx',
  'src/pages/History.tsx',
  'src/pages/Matters.tsx',
  'src/pages/Research.tsx',
]);

writeChunk('site-review-4-trust-and-safety.md', 'Trust, Safety & Legal Compliance Pages', [
  'src/pages/PrivacyPolicy.tsx',
  'src/pages/PrivacyAtAGlance.tsx',
  'src/pages/PrivacyFAQ.tsx',
  'src/pages/TermsOfService.tsx',
  'src/pages/ScopeDisclaimers.tsx',
  'src/pages/SecurityFAQ.tsx',
  'src/pages/EnterpriseSecurity.tsx',
  'src/pages/TrustCenter.tsx',
  'src/pages/EmergencyResources.tsx',
  'src/pages/AccessibilityStatement.tsx',
  'src/pages/AIGovernance.tsx',
  'src/pages/AIModelCard.tsx',
  'src/pages/SLA.tsx',
  'src/pages/About.tsx',
  'src/pages/Contact.tsx',
  'src/pages/LawyerProfiles.tsx',
  'src/pages/LegalSafetyNet.tsx',
  'src/pages/ProBonoIntake.tsx',
]);

writeChunk('site-review-5-components.md', 'Core UI Components & Shared Modules', [
  'src/components/Navigation.tsx',
  'src/components/Layout.tsx',
  'src/components/Footer.tsx',
  'src/components/MobileBottomNav.tsx',
  'src/components/MobileDrawer.tsx',
  'src/components/HomeKPIStrip.tsx',
  'src/components/HomeAudienceRouting.tsx',
  'src/components/CrisisStrip.tsx',
  'src/components/ConsentBanner.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/PricingChooser.tsx',
  'src/components/EthicalConversionPanel.tsx',
  'src/components/GuidedIssueLauncher.tsx',
  'src/components/AnswerModeSelector.tsx',
  'src/components/shared/LegalDisclaimer.tsx',
  'src/components/shared/CrisisResourceCard.tsx',
  'src/components/shared/JurisdictionSelector.tsx',
  'src/components/cognitive-load/TabbedResponse.tsx',
  'src/components/cognitive-load/UnifiedTrustStrip.tsx',
  'src/components/cognitive-load/MoreHelpDrawer.tsx',
  'src/components/cognitive-load/ContextualCrisisAlert.tsx',
  'src/services/chat-service.ts',
]);

console.log('\nDone! Upload these files to GPT-5.5 Pro for full-site analysis.');
console.log('Tip: Start with file 1 and 2, then add 3-5 as follow-up context.');
