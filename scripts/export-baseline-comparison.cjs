/**
 * export-baseline-comparison.cjs
 *
 * Fetches key page files from the April 28 baseline on GitHub and pairs them
 * with the current project source for side-by-side GPT-5.5 Pro merge review.
 *
 * GitHub repo: troyhoch-cmd/ezlegal.ai-bolt-eca93c73
 * Commit: 739dfcf178546bfb1600b870bbe71196cbe83b89
 *
 * Output: merge-review/ directory with comparison markdown files
 *
 * Usage: node scripts/export-baseline-comparison.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'merge-review');

const GITHUB_OWNER = 'troyhoch-cmd';
const GITHUB_REPO = 'ezlegal.ai-bolt-eca93c73';
const GITHUB_COMMIT = '739dfcf178546bfb1600b870bbe71196cbe83b89';

// Files requiring merge decisions, ordered by priority
const MERGE_CANDIDATES = {
  'P0 — Critical content regression (>80% size reduction)': [
    'src/pages/ForBusiness.tsx',
    'src/pages/EZReads.tsx',
    'src/pages/Documents.tsx',
  ],
  'P1 — Significant content regression (>40% size reduction)': [
    'src/pages/ChatV2.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Negotiate.tsx',
    'src/pages/Research.tsx',
    'src/pages/IssuePacks.tsx',
  ],
  'P2 — Missing or substantially reduced pages': [
    'src/pages/ForPartners.tsx',
    'src/pages/PartnerHub.tsx',
    'src/pages/CasePredictor.tsx',
    'src/pages/GrantReporting.tsx',
    'src/pages/WebsiteIntegration.tsx',
    'src/pages/SimpleChatbot.tsx',
    'src/pages/TrustCenter.tsx',
    'src/pages/Matters.tsx',
    'src/pages/Profile.tsx',
    'src/pages/Checkout.tsx',
  ],
};

function readLocal(filePath) {
  const abs = path.join(ROOT, filePath);
  try {
    return fs.readFileSync(abs, 'utf-8');
  } catch {
    return null;
  }
}

function fetchFromGitHub(filePath) {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_COMMIT}/${filePath}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        resolve(null);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${filePath}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sizeKB(content) {
  if (!content) return '0';
  return (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
}

function lineCount(content) {
  if (!content) return 0;
  return content.split('\n').length;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n  ezLegal.ai — Baseline Comparison Export');
  console.log('  ========================================\n');
  console.log(`  Baseline: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`  Commit:   ${GITHUB_COMMIT.slice(0, 7)}\n`);

  const allFiles = Object.values(MERGE_CANDIDATES).flat();
  const results = [];

  for (const filePath of allFiles) {
    process.stdout.write(`  Fetching: ${filePath}...`);
    try {
      const baseline = await fetchFromGitHub(filePath);
      const current = readLocal(filePath);
      results.push({ filePath, baseline, current });
      const bSize = sizeKB(baseline);
      const cSize = sizeKB(current);
      console.log(` baseline=${bSize}KB, current=${cSize}KB`);
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
      results.push({ filePath, baseline: null, current: readLocal(filePath), error: err.message });
    }
  }

  // Generate comparison files by priority group
  let chunkIndex = 1;
  for (const [groupLabel, files] of Object.entries(MERGE_CANDIDATES)) {
    const groupResults = results.filter((r) => files.includes(r.filePath));
    let output = `# Merge Review — ${groupLabel}\n\n`;
    output += `Generated: ${new Date().toISOString()}\n`;
    output += `Baseline commit: ${GITHUB_COMMIT}\n\n`;
    output += `---\n\n`;

    for (const { filePath, baseline, current, error } of groupResults) {
      output += `## ${filePath}\n\n`;

      if (error) {
        output += `**ERROR fetching baseline:** ${error}\n\n`;
      }

      output += `| Metric | Baseline (Apr 28) | Current |\n`;
      output += `|--------|-------------------|--------|\n`;
      output += `| Size | ${sizeKB(baseline)} KB | ${sizeKB(current)} KB |\n`;
      output += `| Lines | ${lineCount(baseline)} | ${lineCount(current)} |\n`;
      output += `| Delta | — | ${baseline && current ? ((lineCount(current) / lineCount(baseline)) * 100).toFixed(0) + '% of baseline' : 'N/A'} |\n`;
      output += `\n`;

      output += `### BASELINE VERSION (Apr 28)\n\n`;
      if (baseline) {
        output += '```tsx\n' + baseline + '\n```\n\n';
      } else {
        output += '*File did not exist in baseline*\n\n';
      }

      output += `### CURRENT VERSION\n\n`;
      if (current) {
        output += '```tsx\n' + current + '\n```\n\n';
      } else {
        output += '*File does not exist in current project*\n\n';
      }

      output += `---\n\n`;
    }

    const filename = `${String(chunkIndex).padStart(2, '0')}-merge-${groupLabel.split('—')[0].trim().toLowerCase()}.md`;
    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, output);
    const outSize = (output.length / 1024).toFixed(0);
    console.log(`\n  Written: ${filename} (${outSize} KB)`);
    chunkIndex++;
  }

  // Generate summary manifest
  let manifest = `# Merge Decision Manifest\n\n`;
  manifest += `Generated: ${new Date().toISOString()}\n\n`;
  manifest += `## File Size Comparison\n\n`;
  manifest += `| File | Baseline | Current | Retention | Priority |\n`;
  manifest += `|------|----------|---------|-----------|----------|\n`;

  for (const [groupLabel, files] of Object.entries(MERGE_CANDIDATES)) {
    const priority = groupLabel.split('—')[0].trim();
    for (const filePath of files) {
      const r = results.find((x) => x.filePath === filePath);
      if (r) {
        const bLines = lineCount(r.baseline);
        const cLines = lineCount(r.current);
        const retention = bLines > 0 ? `${((cLines / bLines) * 100).toFixed(0)}%` : 'N/A';
        manifest += `| ${filePath} | ${sizeKB(r.baseline)} KB (${bLines} lines) | ${sizeKB(r.current)} KB (${cLines} lines) | ${retention} | ${priority} |\n`;
      }
    }
  }

  manifest += `\n## Protected Files (DO NOT OVERWRITE)\n\n`;
  manifest += `These files have been explicitly improved since April 29, 2026 and must be preserved:\n\n`;
  manifest += `- \`src/data/pricing.ts\` — Commerce model taxonomy + termsMicrocopy fix\n`;
  manifest += `- \`src/components/pricing/PricingCard.tsx\` — Unified footer rendering\n`;
  manifest += `- \`src/pages/DashboardHome.tsx\` — Role-aware dashboard\n`;
  manifest += `- \`src/data/dashboardConfig.ts\` — Role-based config\n`;
  manifest += `- \`src/components/pricing/PricingTrustStrip.tsx\` — 5-point trust strip\n`;
  manifest += `- \`src/components/pricing/PricingFAQ.tsx\` — Expanded bilingual FAQ\n`;
  manifest += `- \`src/components/pricing/ComparisonTable.tsx\` — Feature comparison matrix\n`;
  manifest += `- \`src/components/pricing/HelpMeChoose.tsx\` — Guided wizard\n`;
  manifest += `- \`src/components/pricing/MarketplaceSection.tsx\` — Referral transparency\n`;
  manifest += `- \`src/pages/Pricing.tsx\` — Billing toggle + trust strip placement\n`;
  manifest += `- \`src/lib/pricingMath.ts\` — Savings calculation utility\n`;
  manifest += `- \`tests/pricing-terms-scoping.spec.ts\` — Commerce model test suite\n`;

  const manifestPath = path.join(OUT_DIR, '00-manifest.md');
  fs.writeFileSync(manifestPath, manifest);

  console.log(`\n  Written: 00-manifest.md`);
  console.log(`\n  Done! Files written to: merge-review/`);
  console.log(`  Next: Upload merge-review/ files + scripts/gpt-merge-decision-prompt.md to GPT-5.5 Pro\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
