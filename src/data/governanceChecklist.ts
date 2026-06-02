export type GovernanceStatus = 'complete' | 'in-progress' | 'not-started' | 'blocked';

export interface GovernanceItem {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  status: GovernanceStatus;
  owner: string;
  evidence: string | null;
  blockerNote: string | null;
  lastUpdated: string;
}

export const governanceChecklist: GovernanceItem[] = [
  {
    id: 'upl-compliance',
    title: {
      en: 'Unauthorized Practice of Law (UPL) compliance',
      es: 'Cumplimiento de práctica no autorizada de la ley (UPL)',
    },
    description: {
      en: 'All copy verified to not imply legal advice, attorney-client relationship, or guaranteed outcomes',
      es: 'Todo el texto verificado para no implicar asesoría legal, relación abogado-cliente o resultados garantizados',
    },
    status: 'in-progress',
    owner: 'Legal counsel',
    evidence: 'AI safety page, intake disclaimers, footer copy reviewed',
    blockerNote: 'Outcome prediction copy needs final UPL review',
    lastUpdated: '2026-05-15',
  },
  {
    id: 'data-privacy-policy',
    title: {
      en: 'Data privacy policy and CCPA compliance',
      es: 'Política de privacidad de datos y cumplimiento CCPA',
    },
    description: {
      en: 'Privacy policy covers data collection, retention, deletion rights, and third-party sharing',
      es: 'La política de privacidad cubre recolección de datos, retención, derechos de eliminación y compartir con terceros',
    },
    status: 'in-progress',
    owner: 'Privacy officer',
    evidence: 'Privacy policy page exists with core disclosures',
    blockerNote: 'CCPA-specific opt-out mechanism needs implementation',
    lastUpdated: '2026-05-20',
  },
  {
    id: 'ai-governance-disclosures',
    title: {
      en: 'AI governance and transparency disclosures',
      es: 'Divulgaciones de gobernanza y transparencia de IA',
    },
    description: {
      en: 'Clear disclosure of AI use, limitations, human escalation paths, and bias mitigation',
      es: 'Divulgación clara del uso de IA, limitaciones, rutas de escalamiento humano y mitigación de sesgos',
    },
    status: 'complete',
    owner: 'AI safety lead',
    evidence: '/ai-safety page with 6 governance sections, pending-review badges on unverified items',
    blockerNote: null,
    lastUpdated: '2026-05-25',
  },
  {
    id: 'crisis-resource-routing',
    title: {
      en: 'Crisis resource routing and safety net',
      es: 'Enrutamiento de recursos de crisis y red de seguridad',
    },
    description: {
      en: 'Urgent situations (DV, court deadlines, detention) route to verified crisis resources',
      es: 'Situaciones urgentes (VD, plazos judiciales, detención) se enrutan a recursos de crisis verificados',
    },
    status: 'complete',
    owner: 'Safety lead',
    evidence: 'Urgent strip on homepage, /urgent-resources page, high-risk detection in intake',
    blockerNote: null,
    lastUpdated: '2026-05-22',
  },
  {
    id: 'accessibility-wcag',
    title: {
      en: 'WCAG 2.1 AA accessibility compliance',
      es: 'Cumplimiento de accesibilidad WCAG 2.1 AA',
    },
    description: {
      en: 'All interactive elements keyboard-accessible, proper ARIA labels, focus management, skip links',
      es: 'Todos los elementos interactivos accesibles por teclado, etiquetas ARIA apropiadas, gestión de enfoque, enlaces de salto',
    },
    status: 'in-progress',
    owner: 'Frontend lead',
    evidence: 'Skip link, focus-ring styles, aria-labels on forms, aria-hidden on icons',
    blockerNote: 'Full axe-core audit pending for all routes',
    lastUpdated: '2026-05-28',
  },
  {
    id: 'bilingual-parity',
    title: {
      en: 'English/Spanish content parity',
      es: 'Paridad de contenido inglés/español',
    },
    description: {
      en: 'All user-facing content available in both English and Spanish at equivalent quality',
      es: 'Todo el contenido dirigido al usuario disponible en inglés y español con calidad equivalente',
    },
    status: 'in-progress',
    owner: 'Content lead',
    evidence: 'Homepage, intake, pricing, AI safety all bilingual. Test suite verifies parity.',
    blockerNote: 'Legal aid directory descriptions need Spanish translation',
    lastUpdated: '2026-05-27',
  },
  {
    id: 'jurisdiction-accuracy',
    title: {
      en: 'Jurisdiction-specific content accuracy',
      es: 'Precisión de contenido específico por jurisdicción',
    },
    description: {
      en: 'State-specific guidance verified against current statutes and regulations',
      es: 'Guía específica del estado verificada contra estatutos y regulaciones vigentes',
    },
    status: 'not-started',
    owner: 'Legal content team',
    evidence: null,
    blockerNote: 'Awaiting bar-admitted reviewer for each target state',
    lastUpdated: '2026-05-10',
  },
  {
    id: 'referral-consent-flow',
    title: {
      en: 'Referral consent and data sharing flow',
      es: 'Flujo de consentimiento de referencia y compartir datos',
    },
    description: {
      en: 'Explicit opt-in before sharing any user data with partner organizations',
      es: 'Consentimiento explícito antes de compartir datos del usuario con organizaciones asociadas',
    },
    status: 'complete',
    owner: 'Product lead',
    evidence: 'ReferralConsentCard with checkbox, consent tracked in analytics, no data shared without opt-in',
    blockerNote: null,
    lastUpdated: '2026-05-25',
  },
  {
    id: 'security-infrastructure',
    title: {
      en: 'Security infrastructure and RLS policies',
      es: 'Infraestructura de seguridad y políticas RLS',
    },
    description: {
      en: 'Row Level Security on all tables, no USING(true) policies, auth.uid() checks, encrypted storage',
      es: 'Seguridad a nivel de fila en todas las tablas, sin políticas USING(true), verificaciones auth.uid(), almacenamiento cifrado',
    },
    status: 'complete',
    owner: 'Security lead',
    evidence: 'RLS enabled on all tables, security migration batches applied, no always-true policies',
    blockerNote: null,
    lastUpdated: '2026-05-20',
  },
];

export function getGovernanceStats() {
  const total = governanceChecklist.length;
  const complete = governanceChecklist.filter((i) => i.status === 'complete').length;
  const inProgress = governanceChecklist.filter((i) => i.status === 'in-progress').length;
  const blocked = governanceChecklist.filter((i) => i.status === 'blocked').length;
  const notStarted = governanceChecklist.filter((i) => i.status === 'not-started').length;
  return { total, complete, inProgress, blocked, notStarted, percentComplete: Math.round((complete / total) * 100) };
}

export function getStatusColorGov(status: GovernanceStatus): string {
  switch (status) {
    case 'complete':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'in-progress':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'not-started':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'blocked':
      return 'bg-red-100 text-red-800 border-red-200';
  }
}
