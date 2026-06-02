#!/usr/bin/env node
/**
 * Bug Severity Gate
 *
 * Runs automated checks for P0 and P1 issues that block launch.
 * Exit code 0 = clear to launch. Non-zero = blocked.
 *
 * Severity definitions:
 *   P0 - Security leak, broken auth, payment failure, AI gives unsafe legal
 *        guidance, Spanish flow unusable, production crash → Block launch
 *   P1 - Intake broken, jurisdiction not captured, disclaimer missing,
 *        human-help path broken, serious accessibility issue → Block launch unless fixed
 *   P2 - Non-critical UX issue, copy issue, minor layout bug → Launch only with owner/date
 *   P3 - Cosmetic polish or A/B hypothesis → Post-launch backlog
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const results = { P0: [], P1: [], P2: [], P3: [] };

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function findFiles(dir, ext, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findFiles(full, ext, collected);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      collected.push(full);
    }
  }
  return collected;
}

// ─── P0 Checks ───────────────────────────────────────────────────────────────

function checkSecurityLeaks() {
  const envFile = readFile(path.join(ROOT, '.env'));
  if (!envFile) return;
  const tsxFiles = findFiles(SRC, '.tsx').concat(findFiles(SRC, '.ts'));
  for (const file of tsxFiles) {
    const content = readFile(file);
    if (!content) continue;
    // Hardcoded secrets (not env var references)
    if (/(?:sk_live|sk_test|supabase_service_role)_[A-Za-z0-9]{20,}/i.test(content)) {
      results.P0.push(`SECURITY: Hardcoded secret found in ${path.relative(ROOT, file)}`);
    }
  }
}

function checkAuthFlow() {
  const loginPage = readFile(path.join(SRC, 'pages/Login.tsx'));
  const signupPage = readFile(path.join(SRC, 'pages/Signup.tsx'));
  const authContext = readFile(path.join(SRC, 'contexts/AuthContext.tsx'));

  if (!loginPage) results.P0.push('AUTH: Login page missing (src/pages/Login.tsx)');
  if (!signupPage) results.P0.push('AUTH: Signup page missing (src/pages/Signup.tsx)');
  if (!authContext) results.P0.push('AUTH: AuthContext missing (src/contexts/AuthContext.tsx)');
  if (authContext && !authContext.includes('signInWithPassword')) {
    results.P0.push('AUTH: signInWithPassword not found in AuthContext');
  }
}

function checkPaymentFlow() {
  const checkout = readFile(path.join(SRC, 'pages/Checkout.tsx'));
  const stripeEdge = readFile(path.join(ROOT, 'supabase/functions/stripe-checkout-session/index.ts'));
  if (!checkout) results.P0.push('PAYMENT: Checkout page missing');
  if (!stripeEdge) results.P0.push('PAYMENT: Stripe checkout edge function missing');
  if (checkout && !checkout.includes('stripe-checkout-session')) {
    results.P0.push('PAYMENT: Checkout page does not call stripe-checkout-session function');
  }
}

function checkAISafety() {
  const chatService = readFile(path.join(SRC, 'services/chat-service.ts'));
  const openaiEdge = readFile(path.join(ROOT, 'supabase/functions/openai-chat/index.ts'));

  if (!openaiEdge) {
    results.P0.push('AI_SAFETY: openai-chat edge function missing');
    return;
  }
  // Must include disclaimer in system prompt
  if (!openaiEdge.includes('not constitute legal advice') && !openaiEdge.includes('legal information')) {
    results.P0.push('AI_SAFETY: System prompt missing legal-information-not-advice disclaimer');
  }
  // Must include jurisdiction injection
  if (!openaiEdge.includes('CURRENT JURISDICTION')) {
    results.P0.push('AI_SAFETY: System prompt missing jurisdiction context injection');
  }
}

function checkSpanishFlow() {
  const espanol = readFile(path.join(SRC, 'pages/EspanolLanding.tsx'));
  if (!espanol) {
    results.P0.push('SPANISH: EspanolLanding page missing');
    return;
  }
  if (!espanol.includes('data-testid="primary-cta"')) {
    results.P0.push('SPANISH: EspanolLanding missing primary CTA');
  }

  const chatV2 = readFile(path.join(SRC, 'pages/ChatV2.tsx'));
  if (chatV2 && !chatV2.includes("'spanish'")) {
    results.P0.push('SPANISH: ChatV2 does not support spanish answer mode');
  }
}

function checkProductionCrash() {
  const main = readFile(path.join(SRC, 'main.tsx'));
  const app = readFile(path.join(SRC, 'App.tsx'));
  if (!main) results.P0.push('CRASH: main.tsx entry point missing');
  if (!app) results.P0.push('CRASH: App.tsx missing');
  if (app && !app.includes('ErrorBoundary')) {
    results.P0.push('CRASH: No ErrorBoundary wrapping app - unhandled errors will crash the page');
  }
}

// ─── P1 Checks ───────────────────────────────────────────────────────────────

function checkIntakeFlow() {
  const chatV2 = readFile(path.join(SRC, 'pages/ChatV2.tsx'));
  if (!chatV2) {
    results.P1.push('INTAKE: ChatV2 page missing');
    return;
  }
  if (!chatV2.includes('dispatchMessage') && !chatV2.includes('handleSend')) {
    results.P1.push('INTAKE: ChatV2 missing message send handler');
  }
}

function checkJurisdictionCapture() {
  const chatV2 = readFile(path.join(SRC, 'pages/ChatV2.tsx'));
  if (!chatV2) return;
  if (!chatV2.includes('jurisdictionConfirmed')) {
    results.P1.push('JURISDICTION: No jurisdiction confirmation gate before AI answers');
  }
  if (!chatV2.includes('JurisdictionSelector')) {
    results.P1.push('JURISDICTION: JurisdictionSelector component not present in chat');
  }
}

function checkDisclaimerPresence() {
  const footer = readFile(path.join(SRC, 'components/Footer.tsx'));
  const chatV2 = readFile(path.join(SRC, 'pages/ChatV2.tsx'));

  if (footer && !footer.includes('data-testid="legal-disclaimer"')) {
    results.P1.push('DISCLAIMER: Footer missing legal-disclaimer test id');
  }
  if (chatV2 && !chatV2.includes('legal information') && !chatV2.includes('informacion legal')) {
    results.P1.push('DISCLAIMER: ChatV2 missing legal information disclaimer text');
  }
}

function checkHumanHelpPath() {
  const chatV2 = readFile(path.join(SRC, 'pages/ChatV2.tsx'));
  if (!chatV2) return;
  if (!chatV2.includes('human-help-link') && !chatV2.includes('lawyer-profiles')) {
    results.P1.push('HUMAN_HELP: No human-help link found in chat interface');
  }

  const urgentDetector = readFile(path.join(SRC, 'lib/urgent-signal-detector.ts'));
  if (!urgentDetector) {
    results.P1.push('HUMAN_HELP: Urgent signal detector missing');
  }

  const urgentCard = readFile(path.join(SRC, 'components/UrgentSignalCard.tsx'));
  if (!urgentCard) {
    results.P1.push('HUMAN_HELP: UrgentSignalCard component missing');
  }
}

function checkAccessibility() {
  const skipLink = readFile(path.join(SRC, 'components/SkipLink.tsx'));
  if (!skipLink) {
    results.P1.push('A11Y: SkipLink component missing');
  }

  const app = readFile(path.join(SRC, 'App.tsx'));
  if (app && !app.includes('SkipLink')) {
    results.P1.push('A11Y: SkipLink not used in App.tsx');
  }

  // Check main landmark exists
  const layout = readFile(path.join(SRC, 'components/Layout.tsx'));
  if (layout && !layout.includes('role="main"') && !layout.includes('<main')) {
    results.P1.push('A11Y: No <main> landmark in Layout');
  }
}

// ─── Run all checks ──────────────────────────────────────────────────────────

console.log('\n  Bug Severity Gate - Launch Readiness Check\n');
console.log('  ─────────────────────────────────────────────\n');

// P0 checks
checkSecurityLeaks();
checkAuthFlow();
checkPaymentFlow();
checkAISafety();
checkSpanishFlow();
checkProductionCrash();

// P1 checks
checkIntakeFlow();
checkJurisdictionCapture();
checkDisclaimerPresence();
checkHumanHelpPath();
checkAccessibility();

// ─── Report ──────────────────────────────────────────────────────────────────

let exitCode = 0;

if (results.P0.length > 0) {
  console.log('  P0 - LAUNCH BLOCKERS (must fix before launch):');
  results.P0.forEach((msg) => console.log(`    [FAIL] ${msg}`));
  console.log('');
  exitCode = 1;
} else {
  console.log('  P0 - No launch blockers found.\n');
}

if (results.P1.length > 0) {
  console.log('  P1 - LAUNCH BLOCKERS (unless explicitly accepted):');
  results.P1.forEach((msg) => console.log(`    [WARN] ${msg}`));
  console.log('');
  exitCode = 1;
} else {
  console.log('  P1 - No critical issues found.\n');
}

if (results.P2.length > 0) {
  console.log('  P2 - Non-critical (launch with owner/date):');
  results.P2.forEach((msg) => console.log(`    [INFO] ${msg}`));
  console.log('');
}

if (results.P3.length > 0) {
  console.log('  P3 - Cosmetic/backlog:');
  results.P3.forEach((msg) => console.log(`    [NOTE] ${msg}`));
  console.log('');
}

const total = results.P0.length + results.P1.length + results.P2.length + results.P3.length;

if (exitCode === 0) {
  console.log('  RESULT: CLEAR TO LAUNCH');
  console.log(`  ${total === 0 ? 'All checks passed.' : `${results.P2.length + results.P3.length} non-blocking items noted.`}\n`);
} else {
  console.log(`  RESULT: LAUNCH BLOCKED`);
  console.log(`  ${results.P0.length} P0 + ${results.P1.length} P1 issues must be resolved.\n`);
}

process.exit(exitCode);
