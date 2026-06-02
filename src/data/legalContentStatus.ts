export type ReviewStatus =
  | 'draft'
  | 'ai-generated'
  | 'pending-review'
  | 'under-review'
  | 'approved'
  | 'needs-revision'
  | 'expired';

export type ContentCategory =
  | 'legal-information'
  | 'ai-safety-disclosure'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'jurisdiction-guidance'
  | 'intake-flow'
  | 'referral-copy'
  | 'marketing-claim';

export interface ReviewRecord {
  id: string;
  contentId: string;
  category: ContentCategory;
  status: ReviewStatus;
  jurisdictions: string[];
  lastReviewedAt: string | null;
  reviewerRole: string | null;
  nextReviewDue: string | null;
  notes: string;
  sourceReference: string | null;
}

export interface LegalContentEntry {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  category: ContentCategory;
  currentStatus: ReviewStatus;
  jurisdictions: string[];
  lastReviewedAt: string | null;
  reviewerRole: string | null;
  sourceUrl: string | null;
  expiresAt: string | null;
  flaggedIssues: string[];
}

export const contentRegistry: LegalContentEntry[] = [
  {
    id: 'ai-scope-disclosure',
    title: {
      en: 'AI scope and limitations disclosure',
      es: 'Divulgación de alcance y limitaciones de IA',
    },
    description: {
      en: 'Explains what AI does and does not do on the platform',
      es: 'Explica lo que la IA hace y no hace en la plataforma',
    },
    category: 'ai-safety-disclosure',
    currentStatus: 'approved',
    jurisdictions: ['US-general'],
    lastReviewedAt: '2026-04-15',
    reviewerRole: 'compliance-lead',
    sourceUrl: null,
    expiresAt: '2026-10-15',
    flaggedIssues: [],
  },
  {
    id: 'not-a-law-firm-disclaimer',
    title: {
      en: 'Not a law firm disclaimer',
      es: 'Aviso de que no somos un bufete de abogados',
    },
    description: {
      en: 'Core disclaimer stating ezLegal provides legal information, not legal advice',
      es: 'Aviso principal que indica que ezLegal proporciona información legal, no asesoría legal',
    },
    category: 'legal-information',
    currentStatus: 'approved',
    jurisdictions: ['US-general'],
    lastReviewedAt: '2026-03-01',
    reviewerRole: 'legal-counsel',
    sourceUrl: null,
    expiresAt: '2027-03-01',
    flaggedIssues: [],
  },
  {
    id: 'jurisdiction-accuracy-az',
    title: {
      en: 'Arizona jurisdiction guidance',
      es: 'Guía de jurisdicción de Arizona',
    },
    description: {
      en: 'State-specific legal information for Arizona residents',
      es: 'Información legal específica del estado para residentes de Arizona',
    },
    category: 'jurisdiction-guidance',
    currentStatus: 'pending-review',
    jurisdictions: ['US-AZ'],
    lastReviewedAt: null,
    reviewerRole: null,
    sourceUrl: 'https://www.azleg.gov/arstitle/',
    expiresAt: null,
    flaggedIssues: ['Statute references need verification against 2026 legislative session'],
  },
  {
    id: 'jurisdiction-accuracy-ca',
    title: {
      en: 'California jurisdiction guidance',
      es: 'Guía de jurisdicción de California',
    },
    description: {
      en: 'State-specific legal information for California residents',
      es: 'Información legal específica del estado para residentes de California',
    },
    category: 'jurisdiction-guidance',
    currentStatus: 'pending-review',
    jurisdictions: ['US-CA'],
    lastReviewedAt: null,
    reviewerRole: null,
    sourceUrl: 'https://leginfo.legislature.ca.gov/',
    expiresAt: null,
    flaggedIssues: ['Pending 2026 housing law updates'],
  },
  {
    id: 'referral-consent-copy',
    title: {
      en: 'Referral consent language',
      es: 'Idioma de consentimiento de referencia',
    },
    description: {
      en: 'Language used when obtaining user consent for referral to legal aid organizations',
      es: 'Idioma usado al obtener consentimiento del usuario para referencia a organizaciones de ayuda legal',
    },
    category: 'referral-copy',
    currentStatus: 'under-review',
    jurisdictions: ['US-general'],
    lastReviewedAt: '2026-05-01',
    reviewerRole: 'compliance-lead',
    sourceUrl: null,
    expiresAt: null,
    flaggedIssues: ['Needs plain-language audit for 6th-grade reading level'],
  },
  {
    id: 'pricing-claims',
    title: {
      en: 'Pricing transparency claims',
      es: 'Reclamaciones de transparencia de precios',
    },
    description: {
      en: 'All claims about free features and cost visibility',
      es: 'Todas las reclamaciones sobre funciones gratuitas y visibilidad de costos',
    },
    category: 'marketing-claim',
    currentStatus: 'approved',
    jurisdictions: ['US-general'],
    lastReviewedAt: '2026-04-20',
    reviewerRole: 'product-lead',
    sourceUrl: null,
    expiresAt: '2026-10-20',
    flaggedIssues: [],
  },
  {
    id: 'data-handling-disclosure',
    title: {
      en: 'Data handling and retention disclosure',
      es: 'Divulgación de manejo y retención de datos',
    },
    description: {
      en: 'How user data is stored, processed, and deleted',
      es: 'Cómo se almacenan, procesan y eliminan los datos del usuario',
    },
    category: 'privacy-policy',
    currentStatus: 'pending-review',
    jurisdictions: ['US-general', 'US-CA'],
    lastReviewedAt: null,
    reviewerRole: null,
    sourceUrl: null,
    expiresAt: null,
    flaggedIssues: ['CCPA-specific language needs legal review', 'Retention periods need confirmation'],
  },
  {
    id: 'intake-safety-copy',
    title: {
      en: 'Intake safety microcopy',
      es: 'Microcopia de seguridad de admisión',
    },
    description: {
      en: 'Safety warnings displayed during intake (SSN, sensitive info, crisis resources)',
      es: 'Advertencias de seguridad mostradas durante la admisión',
    },
    category: 'intake-flow',
    currentStatus: 'approved',
    jurisdictions: ['US-general'],
    lastReviewedAt: '2026-05-10',
    reviewerRole: 'safety-lead',
    sourceUrl: null,
    expiresAt: '2026-11-10',
    flaggedIssues: [],
  },
  {
    id: 'outcome-prediction-disclaimer',
    title: {
      en: 'Outcome prediction limitations',
      es: 'Limitaciones de predicción de resultados',
    },
    description: {
      en: 'Disclaimers for AI-generated case outcome predictions',
      es: 'Descargos de responsabilidad para predicciones de resultados generadas por IA',
    },
    category: 'ai-safety-disclosure',
    currentStatus: 'pending-review',
    jurisdictions: ['US-general'],
    lastReviewedAt: null,
    reviewerRole: null,
    sourceUrl: null,
    expiresAt: null,
    flaggedIssues: ['Must not imply specific outcomes', 'Needs UPL compliance review'],
  },
];

export function getContentByStatus(status: ReviewStatus): LegalContentEntry[] {
  return contentRegistry.filter((entry) => entry.currentStatus === status);
}

export function getContentByCategory(category: ContentCategory): LegalContentEntry[] {
  return contentRegistry.filter((entry) => entry.category === category);
}

export function getContentNeedingReview(): LegalContentEntry[] {
  return contentRegistry.filter(
    (entry) =>
      entry.currentStatus === 'pending-review' ||
      entry.currentStatus === 'needs-revision' ||
      (entry.expiresAt && new Date(entry.expiresAt) <= new Date())
  );
}

export function getStatusColor(status: ReviewStatus): string {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-800';
    case 'under-review':
      return 'bg-amber-100 text-amber-800';
    case 'pending-review':
      return 'bg-slate-100 text-slate-700';
    case 'needs-revision':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-red-50 text-red-600';
    case 'ai-generated':
      return 'bg-sky-100 text-sky-800';
    case 'draft':
      return 'bg-slate-50 text-slate-500';
  }
}

export function getStatusLabel(status: ReviewStatus, locale: string = 'en'): string {
  const labels: Record<ReviewStatus, { en: string; es: string }> = {
    draft: { en: 'Draft', es: 'Borrador' },
    'ai-generated': { en: 'AI-generated', es: 'Generado por IA' },
    'pending-review': { en: 'Pending review', es: 'Pendiente de revisión' },
    'under-review': { en: 'Under review', es: 'En revisión' },
    approved: { en: 'Approved', es: 'Aprobado' },
    'needs-revision': { en: 'Needs revision', es: 'Necesita revisión' },
    expired: { en: 'Expired', es: 'Expirado' },
  };
  const key = locale === 'es' ? 'es' : 'en';
  return labels[status][key];
}
