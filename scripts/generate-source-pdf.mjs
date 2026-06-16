/**
 * Generates a structured PDF containing the source code of every
 * forward-facing page component for visual UI/UX review by GPT 5.5 Pro.
 *
 * Since the React app cannot render in the sandbox, this provides
 * the complete JSX + Tailwind source that GPT 5.5 can analyze
 * for layout, typography, color, spacing, and UX patterns.
 */
import { jsPDF } from 'jspdf';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, basename } from 'path';

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

function generatePdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function addHeader(text, size = 16) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(30, 30, 30);
    doc.text(text, margin, y);
    y += size + 8;
  }

  function addSubheader(text) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(text, margin, y);
    y += 14;
  }

  function addCodeBlock(code) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(40, 40, 40);

    const lines = code.split('\n');
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      const wrappedLines = doc.splitTextToSize(line || ' ', contentWidth);
      for (const wl of wrappedLines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(wl, margin, y);
        y += 8;
      }
    }
    y += 10;
  }

  function addSeparator() {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
  }

  // Title page
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(20, 20, 20);
  doc.text('ezLegal.ai - Complete UI Source Audit', margin, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text('For GPT 5.5 Pro Visual UI/UX Review', margin, 110);
  doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, margin, 130);
  doc.text(`Total pages: ${PAGES.length}`, margin, 150);
  doc.text('Stack: React + TypeScript + Tailwind CSS + Vite', margin, 170);
  doc.text('', margin, 190);

  doc.setFontSize(10);
  doc.text('INSTRUCTIONS FOR REVIEWER:', margin, 210);
  doc.text('Each section contains the full JSX source of a page component.', margin, 225);
  doc.text('Tailwind CSS classes define all visual styling (colors, spacing, typography, layout).', margin, 240);
  doc.text('Analyze for: visual hierarchy, accessibility, responsive design, cognitive load,', margin, 255);
  doc.text('color contrast, typography consistency, CTA placement, and UX flow.', margin, 270);

  // Table of contents
  doc.addPage();
  y = margin;
  addHeader('TABLE OF CONTENTS', 18);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  for (let i = 0; i < PAGES.length; i++) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(`${i + 1}. [${PAGES[i].route}] ${PAGES[i].label} - ${PAGES[i].file}`, margin, y);
    y += 12;
  }

  // Global design files first
  doc.addPage();
  y = margin;
  addHeader('GLOBAL DESIGN SYSTEM FILES', 18);
  y += 5;

  for (const gf of GLOBAL_FILES) {
    const filePath = resolve(gf.file);
    if (!existsSync(filePath)) {
      addSubheader(`[MISSING] ${gf.file}`);
      continue;
    }
    addSeparator();
    addHeader(gf.label, 12);
    addSubheader(`File: ${gf.file}`);
    const content = readFileSync(filePath, 'utf-8');
    addCodeBlock(content);
  }

  // Each page component
  let pageNum = 0;
  for (const page of PAGES) {
    pageNum++;
    doc.addPage();
    y = margin;

    addHeader(`[${pageNum}/${PAGES.length}] ${page.label}`, 14);
    addSubheader(`Route: ${page.route}  |  File: ${page.file}`);
    addSeparator();

    const filePath = resolve(page.file);
    if (!existsSync(filePath)) {
      addSubheader(`[FILE NOT FOUND: ${page.file}]`);
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    addCodeBlock(content);
  }

  // Write PDF
  const pdfPath = resolve(OUT_DIR, 'ezlegal-ui-source-audit.pdf');
  const buffer = doc.output('arraybuffer');
  writeFileSync(pdfPath, Buffer.from(buffer));
  console.log(`PDF generated: ${pdfPath}`);
  console.log(`Size: ${(Buffer.from(buffer).length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Pages included: ${pageNum} page components + global design files`);
}

generatePdf();
