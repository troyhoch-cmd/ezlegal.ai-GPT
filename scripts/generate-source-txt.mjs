/**
 * Generates a single consolidated .txt file of all page source code
 * optimized for pasting into GPT 5.5 Pro for visual UI/UX review.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const OUT_DIR = resolve('audit-output');
mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { route: '/', file: 'src/pages/Home.tsx', label: 'Home' },
  { route: '/about', file: 'src/pages/About.tsx', label: 'About' },
  { route: '/accessibility', file: 'src/pages/AccessibilityStatement.tsx', label: 'Accessibility Statement' },
  { route: '/ai-governance', file: 'src/pages/AIGovernance.tsx', label: 'AI Governance' },
  { route: '/ai-model-card', file: 'src/pages/AIModelCard.tsx', label: 'AI Model Card' },
  { route: '/algorithmic-impact-assessment', file: 'src/pages/AlgorithmicImpactAssessment.tsx', label: 'Algorithmic Impact Assessment' },
  { route: '/ask', file: 'src/pages/Ask.tsx', label: 'Ask' },
  { route: '/bias-monitoring', file: 'src/pages/BiasMonitoring.tsx', label: 'Bias Monitoring' },
  { route: '/case-predictor', file: 'src/pages/CasePredictor.tsx', label: 'Case Predictor' },
  { route: '/chat', file: 'src/pages/ChatV2.tsx', label: 'Chat' },
  { route: '/contact', file: 'src/pages/Contact.tsx', label: 'Contact' },
  { route: '/emergency-resources', file: 'src/pages/EmergencyResources.tsx', label: 'Emergency Resources' },
  { route: '/enterprise-security', file: 'src/pages/EnterpriseSecurity.tsx', label: 'Enterprise Security' },
  { route: '/espanol', file: 'src/pages/EspanolLanding.tsx', label: 'Espanol Landing' },
  { route: '/ezreads', file: 'src/pages/EZReads.tsx', label: 'EZReads' },
  { route: '/features', file: 'src/pages/Features.tsx', label: 'Features' },
  { route: '/find-attorney', file: 'src/pages/LawyerProfiles.tsx', label: 'Find Attorney' },
  { route: '/for-business', file: 'src/pages/ForBusiness.tsx', label: 'For Business' },
  { route: '/for-individuals', file: 'src/pages/ForIndividuals.tsx', label: 'For Individuals' },
  { route: '/for-organizations', file: 'src/pages/ForOrganizations.tsx', label: 'For Organizations' },
  { route: '/for-partners', file: 'src/pages/ForPartners.tsx', label: 'For Partners' },
  { route: '/forgot-password', file: 'src/pages/ForgotPassword.tsx', label: 'Forgot Password' },
  { route: '/grant-reporting', file: 'src/pages/GrantReporting.tsx', label: 'Grant Reporting' },
  { route: '/help/which-feature', file: 'src/pages/FeatureGuide.tsx', label: 'Feature Guide' },
  { route: '/how-it-works', file: 'src/pages/HowItWorks.tsx', label: 'How It Works' },
  { route: '/how-reports-are-reviewed', file: 'src/pages/HowReportsAreReviewed.tsx', label: 'How Reports Are Reviewed' },
  { route: '/icp-prototype', file: 'src/pages/IcpPrototype.tsx', label: 'ICP Prototype' },
  { route: '/issue-packs', file: 'src/pages/IssuePacks.tsx', label: 'Issue Packs' },
  { route: '/login', file: 'src/pages/Login.tsx', label: 'Login' },
  { route: '/media-kit', file: 'src/pages/MediaKit.tsx', label: 'Media Kit' },
  { route: '/negotiate', file: 'src/pages/Negotiate.tsx', label: 'Negotiate' },
  { route: '/partner-hub', file: 'src/pages/PartnerHub.tsx', label: 'Partner Hub' },
  { route: '/pricing', file: 'src/pages/Pricing.tsx', label: 'Pricing' },
  { route: '/privacy', file: 'src/pages/PrivacyPolicy.tsx', label: 'Privacy Policy' },
  { route: '/privacy-at-a-glance', file: 'src/pages/PrivacyAtAGlance.tsx', label: 'Privacy At A Glance' },
  { route: '/privacy-faq', file: 'src/pages/PrivacyFAQ.tsx', label: 'Privacy FAQ' },
  { route: '/pro-bono', file: 'src/pages/ProBonoIntake.tsx', label: 'Pro Bono Intake' },
  { route: '/safety-net', file: 'src/pages/LegalSafetyNet.tsx', label: 'Legal Safety Net' },
  { route: '/schedule-demo', file: 'src/pages/ScheduleDemo.tsx', label: 'Schedule Demo' },
  { route: '/scope-disclaimers', file: 'src/pages/ScopeDisclaimers.tsx', label: 'Scope Disclaimers' },
  { route: '/security-faq', file: 'src/pages/SecurityFAQ.tsx', label: 'Security FAQ' },
  { route: '/share-perspective', file: 'src/pages/SharePerspective.tsx', label: 'Share Perspective' },
  { route: '/signup', file: 'src/pages/Signup.tsx', label: 'Signup' },
  { route: '/site-review', file: 'src/pages/SiteReview.tsx', label: 'Site Review' },
  { route: '/sla', file: 'src/pages/SLA.tsx', label: 'SLA' },
  { route: '/start', file: 'src/pages/PersonaIntake.tsx', label: 'Persona Intake' },
  { route: '/terms', file: 'src/pages/TermsOfService.tsx', label: 'Terms of Service' },
  { route: '/toolkit', file: 'src/pages/Toolkit.tsx', label: 'Toolkit' },
  { route: '/trust-center', file: 'src/pages/TrustCenter.tsx', label: 'Trust Center' },
  { route: '/welcome', file: 'src/pages/ChannelLanding.tsx', label: 'Channel Landing' },
  { route: '/dashboard', file: 'src/pages/Dashboard.tsx', label: 'Dashboard Home' },
  { route: '/dashboard/cases', file: 'src/pages/Cases.tsx', label: 'Cases' },
  { route: '/dashboard/matters', file: 'src/pages/Matters.tsx', label: 'Matters' },
  { route: '/dashboard/history', file: 'src/pages/History.tsx', label: 'History' },
  { route: '/dashboard/documents', file: 'src/pages/Documents.tsx', label: 'Documents' },
  { route: '/dashboard/research', file: 'src/pages/Research.tsx', label: 'Research' },
  { route: '/dashboard/profile', file: 'src/pages/Profile.tsx', label: 'Profile' },
  { route: '/dashboard/billing', file: 'src/pages/Billing.tsx', label: 'Billing' },
];

const GLOBAL_FILES = [
  { file: 'tailwind.config.js', label: 'Tailwind Config (Design System)' },
  { file: 'src/index.css', label: 'Global CSS' },
  { file: 'src/components/Layout.tsx', label: 'App Layout Shell' },
  { file: 'src/components/Navbar.tsx', label: 'Navigation Bar' },
  { file: 'src/components/Footer.tsx', label: 'Footer' },
];

const lines = [];

lines.push('='.repeat(80));
lines.push('ezLegal.ai - COMPLETE UI SOURCE CODE FOR VISUAL AUDIT');
lines.push('='.repeat(80));
lines.push('');
lines.push('PURPOSE: Visual UI/UX review of every forward-facing page.');
lines.push('STACK: React + TypeScript + Tailwind CSS + Vite');
lines.push(`DATE: ${new Date().toISOString().split('T')[0]}`);
lines.push(`TOTAL PAGES: ${PAGES.length}`);
lines.push('');
lines.push('HOW TO REVIEW:');
lines.push('- Tailwind CSS classes define ALL visual styling');
lines.push('- Classes like "text-xl font-bold text-gray-900" = large bold dark text');
lines.push('- "grid grid-cols-3 gap-6" = 3-column grid with spacing');
lines.push('- "bg-blue-600 hover:bg-blue-700" = blue button with darker hover');
lines.push('- Analyze for: visual hierarchy, cognitive load, accessibility,');
lines.push('  responsive design, CTA placement, typography, color contrast.');
lines.push('');
lines.push('='.repeat(80));
lines.push('TABLE OF CONTENTS');
lines.push('='.repeat(80));
lines.push('');

for (let i = 0; i < PAGES.length; i++) {
  lines.push(`  ${String(i + 1).padStart(2)}. [${PAGES[i].route}] ${PAGES[i].label}`);
}

lines.push('');
lines.push('='.repeat(80));
lines.push('SECTION 1: GLOBAL DESIGN SYSTEM');
lines.push('='.repeat(80));
lines.push('');

for (const gf of GLOBAL_FILES) {
  lines.push('-'.repeat(80));
  lines.push(`FILE: ${gf.file}`);
  lines.push(`ROLE: ${gf.label}`);
  lines.push('-'.repeat(80));

  const filePath = resolve(gf.file);
  if (existsSync(filePath)) {
    lines.push(readFileSync(filePath, 'utf-8'));
  } else {
    lines.push('[FILE NOT FOUND]');
  }
  lines.push('');
}

lines.push('');
lines.push('='.repeat(80));
lines.push('SECTION 2: ALL PAGE COMPONENTS');
lines.push('='.repeat(80));
lines.push('');

let num = 0;
for (const page of PAGES) {
  num++;
  lines.push('');
  lines.push('#'.repeat(80));
  lines.push(`# PAGE ${num}/${PAGES.length}: ${page.label}`);
  lines.push(`# ROUTE: ${page.route}`);
  lines.push(`# FILE: ${page.file}`);
  lines.push('#'.repeat(80));
  lines.push('');

  const filePath = resolve(page.file);
  if (existsSync(filePath)) {
    lines.push(readFileSync(filePath, 'utf-8'));
  } else {
    lines.push('[FILE NOT FOUND]');
  }
  lines.push('');
}

const output = lines.join('\n');
const outPath = resolve(OUT_DIR, 'ezlegal-full-ui-audit.txt');
writeFileSync(outPath, output);
console.log(`Text audit file: ${outPath}`);
console.log(`Size: ${(Buffer.byteLength(output) / 1024).toFixed(0)} KB`);
console.log(`Total characters: ${output.length.toLocaleString()}`);
