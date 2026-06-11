export type EvidenceStatus = 'verified' | 'needs-evidence' | 'removed';

export interface TrustClaim {
  id: string;
  displayEn: string;
  displayEs: string;
  evidenceStatus: EvidenceStatus;
  tooltipEn: string;
  tooltipEs: string;
  href?: string;
}

export const TRUST_CLAIMS: TrustClaim[] = [
  {
    id: 'available-24-7',
    displayEn: '24/7',
    displayEs: '24/7',
    evidenceStatus: 'verified',
    tooltipEn: 'AI-powered responses available any time, day or night.',
    tooltipEs: 'Respuestas con IA disponibles en cualquier momento, de día o de noche.',
  },
  {
    id: 'bilingual',
    displayEn: 'English & Spanish',
    displayEs: 'Inglés y español',
    evidenceStatus: 'verified',
    tooltipEn: 'Full experience available in English and Spanish.',
    tooltipEs: 'Experiencia completa disponible en inglés y español.',
  },
  {
    id: 'free-help-links',
    displayEn: 'Legal-aid links',
    displayEs: 'Enlaces a ayuda legal',
    evidenceStatus: 'verified',
    tooltipEn: 'Find legal-aid and pro bono options in your area.',
    tooltipEs: 'Encuentra opciones de asistencia legal gratuita en tu área.',
    href: '/pro-bono',
  },
  {
    id: 'privacy-controls',
    displayEn: 'Private by default',
    displayEs: 'Privado por defecto',
    evidenceStatus: 'verified',
    tooltipEn: 'TLS in transit, encrypted at rest. See Privacy at a glance.',
    tooltipEs: 'TLS en tránsito, cifrado en reposo. Ver Privacidad de un vistazo.',
    href: '/privacy-at-a-glance',
  },
  {
    id: 'encrypted',
    displayEn: 'Encrypted',
    displayEs: 'Cifrado',
    evidenceStatus: 'removed',
    tooltipEn: 'Replaced by "Private by default" — more specific and verifiable.',
    tooltipEs: 'Reemplazado por "Privado por defecto" — más específico y verificable.',
  },
  {
    id: '50-states',
    displayEn: '50 states',
    displayEs: '50 estados',
    evidenceStatus: 'removed',
    tooltipEn: 'Removed: no verified coverage matrix exists yet.',
    tooltipEs: 'Eliminado: no existe una matriz de cobertura verificada.',
  },
  {
    id: 'legal-aid-friendly',
    displayEn: 'Legal-aid friendly',
    displayEs: 'Amigable con asistencia legal',
    evidenceStatus: 'removed',
    tooltipEn: 'Replaced with "Legal-aid links" — factual feature exists.',
    tooltipEs: 'Reemplazado con "Enlaces a ayuda legal" — la función existe.',
  },
];

export function getVerifiedClaims(): TrustClaim[] {
  return TRUST_CLAIMS.filter((c) => c.evidenceStatus === 'verified');
}
