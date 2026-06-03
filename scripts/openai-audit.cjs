/**
 * openai-audit.cjs
 *
 * Automated codebase audit using OpenAI API (GPT-5.5 or GPT-4o).
 *
 * Prerequisites:
 *   npm install openai fast-glob
 *   export OPENAI_API_KEY=sk-...
 *
 * Usage:
 *   node scripts/openai-audit.cjs                    # Full audit (all passes)
 *   node scripts/openai-audit.cjs --pass security    # Single pass
 *   node scripts/openai-audit.cjs --pass performance
 *   node scripts/openai-audit.cjs --pass ux
 *   node scripts/openai-audit.cjs --pass legal
 *   node scripts/openai-audit.cjs --pass quality
 *   node scripts/openai-audit.cjs --model gpt-4o    # Override model
 *
 * Output: audit-results/ directory with timestamped markdown reports
 */

const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit-results');

// --- Configuration ---

const DEFAULT_MODEL = 'gpt-5.5';
const MAX_TOKENS_PER_CHUNK = 80000; // ~80K tokens input budget per request
const MAX_CHARS_PER_CHUNK = MAX_TOKENS_PER_CHUNK * 4; // rough char estimate

const PASSES = {
  security: {
    title: 'Security Audit',
    files: [
      'src/lib/supabase.ts',
      'src/contexts/AuthContext.tsx',
      'src/services/chat-service.ts',
      'src/lib/leads.ts',
      'src/lib/intake/security.ts',
      'src/lib/intake/persistence.ts',
      'supabase/functions/openai-chat/index.ts',
      'supabase/functions/stripe-webhook/index.ts',
      'supabase/functions/stripe-checkout-session/index.ts',
      'supabase/functions/data-export/index.ts',
      'supabase/functions/data-deletion/index.ts',
      'supabase/functions/legalbreeze-rag/index.ts',
    ],
    migrationPattern: 'supabase/migrations/*security*.sql',
    systemPrompt: `You are a senior security engineer specializing in web application security and legal-tech platforms. You have deep expertise in Supabase RLS, PostgreSQL security, React XSS prevention, and OWASP Top 10.`,
    userPrompt: `Perform a comprehensive security audit of this legal-tech application code. Focus on:

1. **Authentication Bypasses** - Can unauthenticated users access protected resources?
2. **Authorization Flaws** - Can users access other users' data (IDOR)?
3. **Input Validation** - SQL injection, XSS, command injection risks?
4. **Sensitive Data Exposure** - Are API keys, tokens, or PII leaked?
5. **Edge Function Security** - Proper CORS, JWT verification, rate limiting?
6. **RLS Policy Gaps** - Any tables without proper row-level security?
7. **Dependency Risks** - Known vulnerable packages?

For each finding, provide:
- **Severity**: Critical / High / Medium / Low
- **Location**: File path and relevant code section
- **Issue**: Clear description of the vulnerability
- **Impact**: What an attacker could do
- **Fix**: Specific remediation steps

End with an overall security score (1-10) and top 3 priority fixes.`,
  },

  performance: {
    title: 'Performance Audit',
    files: [
      'package.json',
      'vite.config.ts',
      'src/App.tsx',
      'src/pages/Home.tsx',
      'src/pages/ChatV2.tsx',
      'src/pages/Dashboard.tsx',
      'src/services/chat-service.ts',
      'src/services/analytics-service.ts',
      'src/lib/dynamic-imports.ts',
      'src/components/Navigation.tsx',
      'src/components/cognitive-load/CollapsibleSidebar.tsx',
    ],
    systemPrompt: `You are a senior frontend performance engineer with deep expertise in React, Vite, bundle optimization, and Supabase query patterns.`,
    userPrompt: `Perform a performance audit of this React + Vite + Supabase application. Analyze:

1. **Bundle Size** - Unnecessary dependencies? Missing tree-shaking? Code splitting gaps?
2. **Render Performance** - Excessive re-renders? Missing memoization? Heavy computations in render?
3. **Data Fetching** - Waterfall requests? Missing caching? N+1 patterns?
4. **Lazy Loading** - Are heavy routes/components code-split?
5. **Memory** - Event listener leaks? Uncleaned subscriptions? Growing state?
6. **Network** - Redundant API calls? Missing optimistic updates?
7. **Core Web Vitals** - What would hurt LCP, FID, CLS?

For each finding, estimate the performance impact (High/Medium/Low) and provide specific fix code where possible.

End with a prioritized list of top 5 optimizations by expected impact.`,
  },

  ux: {
    title: 'UX & Accessibility Audit',
    files: [
      'src/pages/Home.tsx',
      'src/pages/ChatV2.tsx',
      'src/components/home/HeroIntake.tsx',
      'src/components/Navigation.tsx',
      'src/components/MobileBottomNav.tsx',
      'src/components/cognitive-load/TabbedResponse.tsx',
      'src/components/cognitive-load/CollapsibleSidebar.tsx',
      'src/components/chat/FinalActionCards.tsx',
      'src/components/chat/UrgencyScreening.tsx',
      'src/components/intake/GuidedIntakeShell.tsx',
      'src/components/intake/IndividualIntake.tsx',
      'src/components/shared/LegalDisclaimer.tsx',
      'src/data/safetyCopy.ts',
      'src/data/homepageContent.ts',
    ],
    systemPrompt: `You are a UX accessibility expert specializing in legal-tech applications for vulnerable populations including non-English speakers, people in crisis, and individuals with low digital literacy.`,
    userPrompt: `Perform a UX and accessibility audit for this legal-tech platform serving people who cannot afford lawyers. Evaluate:

1. **Cognitive Overload** - More than one primary decision per screen? Dense paragraphs?
2. **WCAG 2.1 AA** - Missing aria-labels? Color contrast < 4.5:1? Keyboard traps?
3. **Mobile** - Touch targets < 44px? Content overflow? Sticky elements blocking content?
4. **Plain Language** - Legal jargon without explanation? Reading level too high?
5. **Spanish Parity** - Any untranslated strings? Cultural appropriateness?
6. **Crisis UX** - Can someone in danger reach help in 1 tap from any screen?
7. **Trust Indicators** - Is "not legal advice" clear without causing alarm?
8. **Progressive Disclosure** - Is complexity revealed gradually?

Score each area 1-5 and provide specific fixes for anything below 4.`,
  },

  legal: {
    title: 'Legal & Ethical AI Compliance Audit',
    files: [
      'src/lib/legalSafetyConfig.ts',
      'src/lib/legal-disclosures.ts',
      'src/lib/urgent-signal-detector.ts',
      'src/lib/globalLegalAIStandards.ts',
      'src/lib/claims-registry.ts',
      'src/components/chat/ChatDisclaimer.tsx',
      'src/components/cognitive-load/TabbedResponse.tsx',
      'src/components/shared/AISafetyMicrocopy.tsx',
      'src/components/shared/LegalDisclaimer.tsx',
      'src/components/trust/ScopeBoundaryCard.tsx',
      'src/components/ChatPrivacyGate.tsx',
      'src/components/CrisisStrip.tsx',
      'src/components/UrgentSignalCard.tsx',
      'src/data/safetyCopy.ts',
      'src/data/aiSafety.ts',
      'supabase/functions/openai-chat/index.ts',
    ],
    systemPrompt: `You are a legal-tech compliance officer with expertise in Unauthorized Practice of Law (UPL) regulations, AI ethics frameworks, ABA Model Rules, and access-to-justice best practices.`,
    userPrompt: `Audit this AI-powered legal information platform for legal and ethical compliance:

1. **UPL Risk** - Does any feature cross from information into legal advice? Specific situations?
2. **Disclaimers** - Is "not legal advice / no attorney-client relationship" at every decision point?
3. **Jurisdiction Handling** - Can state-specific info be shown without state confirmation?
4. **Crisis Protocols** - Are DV, self-harm, child endangerment properly escalated?
5. **Data Minimization** - Is PII (SSN, financials) blocked/warned?
6. **AI Transparency** - Are responses marked as AI-generated? Sources cited when possible?
7. **Human Escalation** - Can users always opt for human help? Is the path < 2 clicks?
8. **Bias Risk** - Any patterns disadvantaging protected classes or limiting access?

Rate overall compliance readiness (Red/Yellow/Green) with specific remediation for Yellow/Red items.`,
  },

  quality: {
    title: 'Code Quality Audit',
    files: [
      'src/pages/ChatV2.tsx',
      'src/pages/Dashboard.tsx',
      'src/services/chat-service.ts',
      'src/services/analytics-service.ts',
      'src/lib/supabase.ts',
      'src/contexts/AuthContext.tsx',
      'src/contexts/LanguageContext.tsx',
      'src/components/Navigation.tsx',
      'src/components/cognitive-load/CollapsibleSidebar.tsx',
      'src/lib/intake/persistence.ts',
      'src/lib/leads.ts',
    ],
    systemPrompt: `You are a staff software engineer conducting a code quality review with expertise in TypeScript, React patterns, and maintainable architecture.`,
    userPrompt: `Review this codebase for code quality and maintainability:

1. **Type Safety** - Any \`any\` types? Missing generics? Unsafe casts?
2. **DRY** - Duplicated logic that should be extracted into utilities?
3. **Error Handling** - Silent catches? Missing user feedback? Unhandled promises?
4. **Component Design** - Components doing too much? Prop drilling? Missing composition?
5. **State Management** - Unnecessary state? Derived state that should be computed?
6. **Dead Code** - Unused imports, unreachable branches, stale comments?
7. **Naming** - Inconsistent conventions? Unclear intent?
8. **Testing Gaps** - What critical paths lack test coverage?

For each finding, provide the specific code location and a refactored version where applicable.`,
  },
};

// --- Helpers ---

function readFile(rel) {
  const abs = path.join(ROOT, rel);
  try { return fs.readFileSync(abs, 'utf-8'); } catch { return null; }
}

function buildCodeContext(files, migrationPattern) {
  let context = '';
  const included = [];

  for (const file of files) {
    const content = readFile(file);
    if (content && context.length + content.length < MAX_CHARS_PER_CHUNK) {
      context += `\n\n--- FILE: ${file} ---\n\n${content}`;
      included.push(file);
    }
  }

  if (migrationPattern) {
    const migrations = glob.sync(migrationPattern, { cwd: ROOT }).sort().slice(-10);
    for (const m of migrations) {
      const content = readFile(m);
      if (content && context.length + content.length < MAX_CHARS_PER_CHUNK) {
        context += `\n\n--- FILE: ${m} ---\n\n${content}`;
        included.push(m);
      }
    }
  }

  return { context, included };
}

async function runAuditPass(passName, model) {
  const pass = PASSES[passName];
  if (!pass) {
    console.error(`Unknown pass: ${passName}. Available: ${Object.keys(PASSES).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n  Running: ${pass.title}...`);
  console.log(`  Model: ${model}`);

  const { context, included } = buildCodeContext(pass.files, pass.migrationPattern);
  console.log(`  Files included: ${included.length} (~${(context.length / 1024).toFixed(0)} KB)`);

  const OpenAI = require('openai');
  const client = new OpenAI();

  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: 8000,
      temperature: 0.2,
      messages: [
        { role: 'system', content: pass.systemPrompt },
        {
          role: 'user',
          content: `${pass.userPrompt}\n\n---\n\nHere is the codebase to audit:\n\n${context}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content || 'No response generated.';
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const tokens = response.usage;

    console.log(`  Completed in ${elapsed}s (${tokens?.total_tokens || '?'} tokens)`);

    return {
      pass: passName,
      title: pass.title,
      model,
      filesAudited: included,
      result,
      tokensUsed: tokens?.total_tokens || 0,
      elapsed: parseFloat(elapsed),
    };
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    if (err.message?.includes('model')) {
      console.error(`  Try: node scripts/openai-audit.cjs --model gpt-4o`);
    }
    return {
      pass: passName,
      title: pass.title,
      model,
      filesAudited: included,
      result: `ERROR: ${err.message}`,
      tokensUsed: 0,
      elapsed: 0,
    };
  }
}

function writeReport(results) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `audit-${timestamp}.md`;
  const filepath = path.join(OUT_DIR, filename);

  let report = `# ezLegal.ai Automated Audit Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Model:** ${results[0]?.model || 'unknown'}\n`;
  report += `**Passes:** ${results.length}\n\n`;
  report += `---\n\n`;

  for (const r of results) {
    report += `## ${r.title}\n\n`;
    report += `- Files audited: ${r.filesAudited.length}\n`;
    report += `- Tokens used: ${r.tokensUsed.toLocaleString()}\n`;
    report += `- Time: ${r.elapsed}s\n\n`;
    report += `${r.result}\n\n`;
    report += `---\n\n`;
  }

  // Summary stats
  const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);
  const totalTime = results.reduce((sum, r) => sum + r.elapsed, 0);
  report += `## Summary\n\n`;
  report += `- Total tokens: ${totalTokens.toLocaleString()}\n`;
  report += `- Total time: ${totalTime.toFixed(1)}s\n`;
  report += `- Estimated cost: ~$${(totalTokens * 0.00003).toFixed(2)} (GPT-4o pricing)\n`;

  fs.writeFileSync(filepath, report);
  console.log(`\n  Report saved: audit-results/${filename}`);
  return filepath;
}

// --- CLI ---

async function main() {
  const args = process.argv.slice(2);
  const passIndex = args.indexOf('--pass');
  const modelIndex = args.indexOf('--model');

  const selectedPass = passIndex !== -1 ? args[passIndex + 1] : null;
  const model = modelIndex !== -1 ? args[modelIndex + 1] : DEFAULT_MODEL;

  if (!process.env.OPENAI_API_KEY) {
    console.error('\n  ERROR: OPENAI_API_KEY environment variable is required.');
    console.error('  Set it with: export OPENAI_API_KEY=sk-...\n');
    process.exit(1);
  }

  console.log('\n  ====================================');
  console.log('   ezLegal.ai - Automated Code Audit');
  console.log('  ====================================\n');

  const passesToRun = selectedPass ? [selectedPass] : Object.keys(PASSES);
  const results = [];

  for (const passName of passesToRun) {
    const result = await runAuditPass(passName, model);
    results.push(result);
  }

  const reportPath = writeReport(results);

  console.log('\n  ====================================');
  console.log('   Audit Complete!');
  console.log('  ====================================');
  console.log(`\n  Open the report: ${reportPath}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
