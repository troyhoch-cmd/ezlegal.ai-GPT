/**
 * Export the A2J Legal AI prototype source into a single markdown file
 * suitable for upload to GPT-5.5 Pro or any LLM that cannot render SPAs.
 *
 * Usage: node export-for-review.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, "prototype-review.md");

const files = [
  "package.json",
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "src/main.tsx",
  "src/App.tsx",
  "src/index.css"
];

let md = `# A2J Legal AI Prototype - Full Source Export

**Exported:** ${new Date().toISOString()}

## Overview

This is a production-quality Vite + React + TypeScript single-page app for an AI-assisted legal access product. It implements:

1. **Spanish-first experience** with English toggle
2. **Three ICP paths:** Spanish-speaking individuals who cannot afford lawyers, SMBs, and pro bono/legal service organizations
3. **One-question-at-a-time intake wizard** to reduce cognitive overload
4. **Plain-language legal information only** - no legal advice claims
5. **High-risk issue detection** and human-escalation prompts
6. **Consent-first AI workflow** - no client-side paid LLM/API key use
7. **Deterministic mock "AI plan" generator** with transparent limitations and source-registry requirements
8. **Strong conversion optimization:** segmented CTAs, trust indicators, progress bar, optional contact capture, referral CTA tracking
9. **Accessibility:** semantic HTML, keyboard-friendly buttons, high contrast, larger text toggle, ARIA labels
10. **Admin dashboard** for funnel analytics, governance checklist, data deletion, and A2J readiness gaps
11. **Strategic partnership and revenue-share simulator** for banks, fintechs, employers, CPAs, payroll providers, insurers, and legal service organizations
12. **Explicit warnings** for ethical sourcing, legal-source verification, fee-sharing, UPL, privacy, and jurisdictional review gaps

## Architecture

- **Framework:** React 18 + TypeScript + Vite
- **Routing:** Client-side state (no router library)
- **State:** React hooks + localStorage persistence
- **Styling:** Plain CSS with custom properties
- **External dependencies:** None beyond React + Vite
- **AI:** Deterministic rule-based plan generator (no LLM calls)
- **Data:** Browser-only localStorage (no server, no Supabase in this prototype)

## Pages / Routes

| Route | Description |
|-------|-------------|
| home | Hero, ICP persona cards, feature cards, trust indicators |
| intake | 6-step wizard: persona, issue, location, facts, consent, plan |
| partners | Partnership opportunities (6 verticals), revenue-share simulator, model cards |
| admin | Funnel metrics, governance checklist, pre-production gaps, event log, data deletion |

## Key Design Decisions

- Spanish is the default language; English is a toggle
- Every screen shows "not legal advice" disclaimer
- High-risk issues (immigration, family, immediate urgency) trigger escalation warnings
- No data leaves the browser; consent is required before plan generation
- The governance dashboard explicitly lists gaps that must be filled before production
- Revenue-share simulator includes UPL/fee-sharing/privacy warnings

---

`;

for (const filePath of files) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    md += `## ${filePath}\n\n*File not found*\n\n---\n\n`;
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const ext = path.extname(filePath).slice(1);
  const lang = ext === "tsx" ? "tsx" : ext === "ts" ? "typescript" : ext === "css" ? "css" : ext === "json" ? "json" : "html";

  md += `## ${filePath}\n\n`;
  md += `\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
}

md += `## Analysis Prompts

When reviewing this prototype, consider:

1. **GTM Readiness:** Is the conversion funnel clear for each ICP? Are CTAs segmented properly?
2. **Cognitive Load:** Does the one-question-per-screen wizard reduce overwhelm for stressed users?
3. **Ethical AI:** Are the disclaimers, consent gates, and gap disclosures sufficient?
4. **Spanish-First:** Is the Spanish copy natural and accessible (not just translated)?
5. **Accessibility:** Are ARIA labels, keyboard navigation, and contrast sufficient?
6. **Partnership Strategy:** Do the 6 partner verticals and revenue models make business sense?
7. **Governance:** Does the admin checklist cover the right pre-production requirements?
8. **UPL/Compliance:** Are the fee-sharing and referral warnings adequate?
9. **Conversion Optimization:** Is the funnel instrumentation comprehensive enough?
10. **Competitive Position:** How does this compare to existing legal access tools?
`;

fs.writeFileSync(OUTPUT, md, "utf-8");

const stats = fs.statSync(OUTPUT);
const sizeKB = Math.round(stats.size / 1024);

console.log(`\nExported: ${OUTPUT}`);
console.log(`Size: ${sizeKB} KB`);
console.log(`\nUpload this file to GPT-5.5 Pro with your analysis prompt.`);
console.log(`The file contains all source code, architecture notes, and suggested review questions.`);
