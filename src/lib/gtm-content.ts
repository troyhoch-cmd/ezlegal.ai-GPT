export type ICPKey = 'startups' | 'law_firms' | 'in_house';

export interface ICPContent {
  key: ICPKey;
  label: string;
  pain: string;
  outcome: string;
  useCases: string[];
  cta: string;
  ctaRoute: string;
}

export const ICP_CONTENT: Record<ICPKey, ICPContent> = {
  startups: {
    key: 'startups',
    label: 'Startups & SMBs',
    pain: 'Legal questions pile up around contracts, hiring, privacy, fundraising, and vendor risk.',
    outcome: 'Get organized facts, issue spotting, checklists, and attorney-ready summaries before spending on back-and-forth.',
    useCases: [
      'NDA review prep',
      'Vendor contract triage',
      'Employee/contractor onboarding checklists',
      'Fundraising diligence prep',
      'Privacy policy readiness',
    ],
    cta: 'Check my company\'s legal readiness',
    ctaRoute: '/for-startups',
  },
  law_firms: {
    key: 'law_firms',
    label: 'Law Firms',
    pain: 'Intake, document collection, and first-pass matter summaries consume non-billable time.',
    outcome: 'Standardize client intake, qualify matters faster, and prepare structured summaries for attorney review.',
    useCases: [
      'Client intake automation',
      'Flat-fee package questionnaires',
      'Contract-review intake',
      'Estate/business formation intake',
      'Discovery document organization',
    ],
    cta: 'See intake automation for firms',
    ctaRoute: '/for-law-firms',
  },
  in_house: {
    key: 'in_house',
    label: 'In-House Legal',
    pain: 'Legal teams get scattered requests from sales, HR, procurement, and operations with incomplete facts.',
    outcome: 'Triage requests, collect facts, standardize legal ops workflows, and route matters by urgency.',
    useCases: [
      'NDA intake',
      'Vendor review',
      'Sales contract triage',
      'Employment policy requests',
      'Privacy/security questionnaires',
    ],
    cta: 'Triage legal requests faster',
    ctaRoute: '/for-in-house',
  },
};

export const HERO = {
  headline: 'Resolve legal work faster with AI-powered legal intake, triage, and document workflows.',
  subheadline: 'ezlegal.ai turns legal questions, contracts, and business facts into organized intakes, document checklists, and attorney-ready summaries\u2014without pretending to replace your lawyer.',
  primaryCta: 'Run a free legal readiness check',
  secondaryCta: 'Book a demo',
};

export const PROBLEM_SECTION = {
  title: 'Legal work breaks down before a lawyer even sees it.',
  bullets: [
    'Requests arrive with missing facts.',
    'Documents are scattered across email and drives.',
    'Teams do not know what is urgent.',
    'Lawyers spend time reconstructing context.',
    'Founders and operators delay decisions because next steps are unclear.',
  ],
};

export const WORKFLOW_STEPS = [
  { step: 1, title: 'Ask the right questions', description: 'Guided intake captures facts and context' },
  { step: 2, title: 'Collect facts and documents', description: 'Structured collection replaces scattered emails' },
  { step: 3, title: 'Triage urgency and risk', description: 'Automated scoring surfaces what matters first' },
  { step: 4, title: 'Generate attorney-ready summaries', description: 'Clean briefs ready for legal review' },
  { step: 5, title: 'Route to action', description: 'Self-serve checklist, demo, or legal review' },
];

export interface UseCaseCard {
  title: string;
  icpTag: ICPKey;
  pain: string;
  outcome: string;
  cta: string;
}

export const USE_CASE_CARDS: UseCaseCard[] = [
  { title: 'Contract review intake', icpTag: 'startups', pain: 'Contracts sit unreviewed because teams lack context on what to flag.', outcome: 'AI-guided questionnaire surfaces key terms, risks, and missing clauses.', cta: 'Start contract intake' },
  { title: 'NDA workflow', icpTag: 'in_house', pain: 'Repetitive NDA requests from sales bog down legal teams.', outcome: 'Self-serve NDA intake with pre-approved templates and escalation rules.', cta: 'Automate NDA intake' },
  { title: 'Startup legal readiness', icpTag: 'startups', pain: 'Founders don\'t know what legal gaps exist until it\'s too late.', outcome: 'Comprehensive readiness check identifies gaps before fundraising or scaling.', cta: 'Run readiness check' },
  { title: 'Law firm client intake', icpTag: 'law_firms', pain: 'Initial consultations waste time collecting basic facts.', outcome: 'Pre-consultation intake delivers organized matter summaries.', cta: 'See firm intake tools' },
  { title: 'In-house request triage', icpTag: 'in_house', pain: 'Legal requests arrive via email, Slack, and hallway conversations.', outcome: 'Centralized intake with urgency scoring and automatic routing.', cta: 'Triage requests' },
  { title: 'Fundraising diligence prep', icpTag: 'startups', pain: 'Diligence requests expose disorganized legal records.', outcome: 'Pre-organized document checklists and entity structure summaries.', cta: 'Prep for diligence' },
];

export const PRICING_TIERS = [
  {
    name: 'Pilot',
    audience: 'For founders/operators testing legal workflow automation',
    features: ['Readiness check', 'Basic intake', 'Checklist download', 'Email support'],
    cta: 'Start free check',
    highlighted: false,
  },
  {
    name: 'Team',
    audience: 'For growing teams managing recurring legal requests',
    features: ['Intake workflows', 'Lead/request tracking', 'Analytics-ready events', 'Priority support', 'Team collaboration'],
    cta: 'Book demo',
    highlighted: true,
  },
  {
    name: 'Firm',
    audience: 'For law firms standardizing client intake',
    features: ['Configurable questionnaires', 'Matter summaries', 'Firm-branded workflows', 'API access', 'Dedicated onboarding'],
    cta: 'Talk to us',
    highlighted: false,
  },
];

export const FAQ_ITEMS = [
  { q: 'Is ezlegal.ai a law firm?', a: 'No. ezlegal.ai provides workflow automation and legal information tools. It is not a law firm and does not provide legal advice. No attorney-client relationship is created through use of this platform.' },
  { q: 'Does this replace an attorney?', a: 'No. ezlegal.ai helps organize facts, documents, and workflows so that when you do engage an attorney, the process is faster and more efficient. It does not replace professional legal judgment.' },
  { q: 'What happens after I complete the readiness check?', a: 'You receive a tailored summary of potential legal gaps and recommended next steps. You can download a checklist, book a demo for advanced workflows, or consult an attorney with your organized summary.' },
  { q: 'Can law firms use this for intake?', a: 'Yes. Law firms use ezlegal.ai to standardize client intake, collect documents before consultations, and generate structured matter summaries that save non-billable time.' },
  { q: 'Can in-house teams use this for legal request triage?', a: 'Yes. In-house legal teams use ezlegal.ai to centralize requests from business units, score urgency, collect missing facts, and route matters to the right workflow.' },
  { q: 'Where does my data go?', a: 'Data is stored securely. In production, leads are captured via configured backend endpoints or Supabase. The platform is designed for configurable data handling with privacy controls.' },
  { q: 'Can we connect this to our CRM or case management system?', a: 'The platform is designed with integration in mind. API access is available on Firm-tier plans. Contact us to discuss specific integration requirements.' },
];

export const LEGAL_DISCLAIMER = 'This is legal information and workflow guidance, not legal advice. Using ezlegal.ai does not create an attorney-client relationship.';

export const CHECKLIST_CONTENT = `# Legal Readiness Checklist
## ezlegal.ai

---

## 1. Business Entity & Governance
- [ ] Entity type chosen and formation documents filed
- [ ] Operating agreement or bylaws in place
- [ ] EIN obtained
- [ ] State registrations current
- [ ] Annual filings up to date
- [ ] Board/member resolutions documented

## 2. Contracts & Vendor Obligations
- [ ] Standard contract templates reviewed in last 12 months
- [ ] Vendor agreements organized and accessible
- [ ] Key contract dates (renewals, terminations) tracked
- [ ] Insurance requirements in contracts verified
- [ ] Limitation of liability clauses reviewed

## 3. Employment & Contractor Classification
- [ ] Employee vs. contractor classification documented
- [ ] Offer letters and employment agreements standardized
- [ ] Employee handbook current
- [ ] Non-compete/non-solicitation agreements reviewed
- [ ] Payroll and benefits compliance verified
- [ ] I-9 documentation complete

## 4. Privacy & Data Handling
- [ ] Privacy policy published and current
- [ ] Data processing agreements with vendors
- [ ] Cookie/tracking consent mechanisms in place
- [ ] Data breach response plan documented
- [ ] Employee data handling procedures defined
- [ ] State privacy law compliance assessed (CCPA, etc.)

## 5. IP Ownership
- [ ] IP assignment agreements with employees/contractors
- [ ] Trademark registrations current
- [ ] Trade secret protections documented
- [ ] Open source usage tracked and compliant
- [ ] Domain registrations secured

## 6. Fundraising & Diligence Readiness
- [ ] Cap table current and accessible
- [ ] Prior funding documents organized
- [ ] Material contracts in data room
- [ ] Litigation/disputes disclosed
- [ ] Financial statements available
- [ ] Tax filings up to date

## 7. Litigation & Dispute Red Flags
- [ ] No unresolved demand letters
- [ ] Regulatory complaints addressed
- [ ] Customer disputes documented and tracked
- [ ] Insurance coverage reviewed for potential claims
- [ ] Dispute resolution clauses in key contracts

## 8. When to Consult an Attorney
- Before signing contracts over $50K
- When receiving legal demands or threats
- Before fundraising rounds
- When hiring in new jurisdictions
- When handling sensitive data at scale
- For any IP disputes or infringement claims
- Before major business structure changes

---

DISCLAIMER: This checklist is for informational and organizational purposes only.
It does not constitute legal advice. Consult a licensed attorney for guidance
specific to your situation.

Generated by ezlegal.ai
`;
