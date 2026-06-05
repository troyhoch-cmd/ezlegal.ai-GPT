export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'pass' | 'fail' | 'in_progress' | 'blocked' | 'not_started';
export type ICP = 'spanish_low_income' | 'smb' | 'pro_bono_org' | 'all';

export interface EvidenceItem {
  label: string;
  url: string;
  type: 'test_suite' | 'document' | 'screenshot' | 'policy' | 'code' | 'external';
  verifiedAt?: string;
}

export interface LaunchGate {
  id: string;
  category: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  severity: Severity;
  status: Status;
  icps: ICP[];
  evidence: EvidenceItem[];
  blockers: string[];
  reviewerNotes: string;
}

export const LAUNCH_GATES: LaunchGate[] = [
  {
    id: 'legal-upl-compliance',
    category: 'Legal & Compliance',
    title: 'Legal/UPL Compliance',
    description: 'Ensure all legal disclaimers and UPL compliance requirements are met',
    owner: 'Legal',
    dueDate: '2026-06-15',
    severity: 'critical',
    status: 'pass',
    icps: ['all'],
    evidence: [
      {
        label: 'claims-registry.ts',
        url: 'src/claims-registry.ts',
        type: 'code',
      },
      {
        label: 'check-claims.cjs',
        url: 'scripts/check-claims.cjs',
        type: 'code',
      },
      {
        label: 'Scope & Disclaimers',
        url: '/trust-center/scope-disclaimers',
        type: 'document',
      },
    ],
    blockers: [],
    reviewerNotes: 'All compliance checks passed. Ready for launch.',
  },
  {
    id: 'ai-governance',
    category: 'AI & Ethics',
    title: 'AI Governance',
    description: 'AI model governance, transparency, and algorithmic impact assessment',
    owner: 'Product',
    dueDate: '2026-06-15',
    severity: 'critical',
    status: 'pass',
    icps: ['all'],
    evidence: [
      {
        label: 'AI Governance',
        url: '/trust-center/ai-governance',
        type: 'document',
      },
      {
        label: 'AI Model Card',
        url: '/trust-center/ai-model-card',
        type: 'policy',
      },
      {
        label: 'Algorithmic Impact Assessment',
        url: '/trust-center/algorithmic-impact-assessment',
        type: 'document',
      },
    ],
    blockers: [],
    reviewerNotes: 'AI governance framework approved and documented.',
  },
  {
    id: 'attorney-review-pipeline',
    category: 'Legal Operations',
    title: 'Attorney Review Pipeline',
    description: 'Pilot program with 3 attorneys for review workflows',
    owner: 'Legal',
    dueDate: '2026-06-20',
    severity: 'high',
    status: 'in_progress',
    icps: ['all'],
    evidence: [
      {
        label: 'attorney-review-lifecycle.spec.ts',
        url: 'tests/attorney-review-lifecycle.spec.ts',
        type: 'test_suite',
      },
    ],
    blockers: ['Awaiting 3 pilot attorney signups'],
    reviewerNotes: 'Infrastructure ready, waiting for pilot attorney onboarding.',
  },
  {
    id: 'security-hardening',
    category: 'Security',
    title: 'Security Hardening',
    description: 'Complete security audit and hardening measures',
    owner: 'Engineering',
    dueDate: '2026-06-15',
    severity: 'critical',
    status: 'pass',
    icps: ['all'],
    evidence: [
      {
        label: 'security.static.spec.ts',
        url: 'tests/security.static.spec.ts',
        type: 'test_suite',
      },
      {
        label: 'secrets-scan.cjs',
        url: 'scripts/secrets-scan.cjs',
        type: 'code',
      },
      {
        label: 'RLS Migrations',
        url: 'supabase/migrations',
        type: 'code',
      },
    ],
    blockers: [],
    reviewerNotes: 'All security checks passed. RLS policies enforced.',
  },
  {
    id: 'privacy-data-governance',
    category: 'Privacy & Data',
    title: 'Privacy & Data Governance',
    description: 'Privacy controls, consent management, and data deletion workflows',
    owner: 'Engineering',
    dueDate: '2026-06-15',
    severity: 'critical',
    status: 'pass',
    icps: ['all'],
    evidence: [
      {
        label: 'Privacy at a Glance',
        url: '/trust-center/privacy-at-a-glance',
        type: 'document',
      },
      {
        label: 'consent.ts',
        url: 'src/consent.ts',
        type: 'code',
      },
      {
        label: 'data-deletion',
        url: 'supabase/functions/data-deletion/index.ts',
        type: 'code',
      },
    ],
    blockers: [],
    reviewerNotes: 'Data governance framework fully implemented and tested.',
  },
  {
    id: 'accessibility-wcag-2-2',
    category: 'Accessibility',
    title: 'Accessibility (WCAG 2.2 AA)',
    description: 'Full WCAG 2.2 AA compliance across all interfaces',
    owner: 'Product',
    dueDate: '2026-06-15',
    severity: 'high',
    status: 'pass',
    icps: ['all'],
    evidence: [
      {
        label: 'a11y.spec.ts',
        url: 'tests/a11y.spec.ts',
        type: 'test_suite',
      },
      {
        label: 'accessibility.spec.ts',
        url: 'tests/e2e/accessibility.spec.ts',
        type: 'test_suite',
      },
    ],
    blockers: [],
    reviewerNotes: 'All accessibility tests passing. WCAG 2.2 AA certified.',
  },
  {
    id: 'spanish-ux-parity',
    category: 'Internationalization',
    title: 'Spanish UX Parity',
    description: 'Feature parity between English and Spanish user experiences',
    owner: 'Product',
    dueDate: '2026-06-15',
    severity: 'critical',
    status: 'pass',
    icps: ['spanish_low_income', 'all'],
    evidence: [
      {
        label: 'bilingual-parity.spec.ts',
        url: 'tests/bilingual-parity.spec.ts',
        type: 'test_suite',
      },
      {
        label: 'spanish-flow.spec.ts',
        url: 'tests/spanish-flow.spec.ts',
        type: 'test_suite',
      },
      {
        label: 'audit-spanish-copy.cjs',
        url: 'scripts/audit-spanish-copy.cjs',
        type: 'code',
      },
    ],
    blockers: [],
    reviewerNotes: 'Spanish translation and UX parity verified across all key flows.',
  },
  {
    id: 'smb-ux-conversion',
    category: 'Product Markets',
    title: 'SMB UX & Conversion',
    description: 'Small business-focused features and conversion optimization',
    owner: 'Product',
    dueDate: '2026-06-15',
    severity: 'high',
    status: 'pass',
    icps: ['smb', 'all'],
    evidence: [
      {
        label: 'ForBusiness.tsx bilingual',
        url: 'src/pages/ForBusiness.tsx',
        type: 'code',
      },
      {
        label: 'conversion-events.spec.ts',
        url: 'tests/conversion-events.spec.ts',
        type: 'test_suite',
      },
    ],
    blockers: [],
    reviewerNotes: 'SMB features implemented and conversion tracking validated.',
  },
  {
    id: 'pro-bono-operations',
    category: 'Product Markets',
    title: 'Pro Bono Operations',
    description: 'Pro bono intake workflow and legal aid partner integration',
    owner: 'Ops',
    dueDate: '2026-06-25',
    severity: 'high',
    status: 'in_progress',
    icps: ['pro_bono_org', 'all'],
    evidence: [
      {
        label: 'ProBonoIntake page',
        url: 'src/pages/ProBonoIntake.tsx',
        type: 'code',
      },
      {
        label: 'Legal Aid Directory',
        url: 'src/data/legalAidDirectory.ts',
        type: 'code',
      },
    ],
    blockers: ['Pending 2 LSC partner LOIs'],
    reviewerNotes: 'Infrastructure ready, awaiting partner agreements.',
  },
  {
    id: 'conversion-ethics',
    category: 'Legal & Ethics',
    title: 'Conversion Ethics',
    description: 'Ethical conversion practices and banned phrase enforcement',
    owner: 'Legal',
    dueDate: '2026-06-15',
    severity: 'critical',
    status: 'pass',
    icps: ['all'],
    evidence: [
      {
        label: 'check-claims.cjs banned phrases',
        url: 'scripts/check-claims.cjs',
        type: 'code',
      },
      {
        label: 'pricing-canonical.spec.ts',
        url: 'tests/pricing-canonical.spec.ts',
        type: 'test_suite',
      },
    ],
    blockers: [],
    reviewerNotes: 'All conversion ethics checks passing. Banned phrases enforced.',
  },
  {
    id: 'partnership-network',
    category: 'Business Development',
    title: 'Partnership Network',
    description: 'Strategic partnerships and pilot commitment program',
    owner: 'Product',
    dueDate: '2026-06-30',
    severity: 'medium',
    status: 'in_progress',
    icps: ['all'],
    evidence: [
      {
        label: 'ForPartners page',
        url: 'src/pages/ForPartners.tsx',
        type: 'code',
      },
      {
        label: 'PartnerHub page',
        url: 'src/pages/PartnerHub.tsx',
        type: 'code',
      },
    ],
    blockers: ['3 pilot commitments needed'],
    reviewerNotes: 'Partner program framework ready, awaiting pilot enrollments.',
  },
  {
    id: 'ops-support-readiness',
    category: 'Operations',
    title: 'Ops & Support Readiness',
    description: 'Support infrastructure, coverage plans, and escalation procedures',
    owner: 'Ops',
    dueDate: '2026-06-20',
    severity: 'high',
    status: 'not_started',
    icps: ['all'],
    evidence: [],
    blockers: [
      'Support coverage plan not drafted',
      'Escalation SLA document pending',
    ],
    reviewerNotes: 'Blocking item for launch. Support plans must be finalized.',
  },
];

export function computeGateStatus(gates: LaunchGate[]): {
  totalGates: number;
  passed: number;
  blocked: number;
  criticalBlocked: number;
  readyToLaunch: boolean;
} {
  const totalGates = gates.length;
  const passed = gates.filter((g) => g.status === 'pass').length;
  const blocked = gates.filter((g) => g.status === 'blocked').length;
  const criticalBlocked = gates.filter(
    (g) => g.severity === 'critical' && g.status !== 'pass'
  ).length;
  const hasFailed = gates.some((g) => g.status === 'fail');
  const readyToLaunch =
    criticalBlocked === 0 && !hasFailed && blocked === 0;

  return {
    totalGates,
    passed,
    blocked,
    criticalBlocked,
    readyToLaunch,
  };
}
