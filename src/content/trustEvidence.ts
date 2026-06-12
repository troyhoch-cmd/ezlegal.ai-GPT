export type EvidenceStatus = 'verified' | 'needs-evidence' | 'removed';

export interface TrustClaim {
  id: string;
  displayEn: string;
  displayEs: string;
  evidenceStatus: EvidenceStatus;
  tooltipEn: string;
  tooltipEs: string;
  href?: string;
  fallbackEn?: string;
  fallbackEs?: string;
}

/**
 * Single source of truth for every public trust, privacy, pricing,
 * performance, attorney, availability, and access-to-justice claim
 * rendered on the homepage or in marketing copy.
 *
 * Rules:
 * - A claim MUST have evidenceStatus === 'verified' to render publicly.
 * - 'needs-evidence' claims have fallback copy that may render instead.
 * - 'removed' claims are documented here for audit trail only.
 */
export const TRUST_CLAIMS: TrustClaim[] = [
  // --- VERIFIED CLAIMS ---
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
    id: 'free-question',
    displayEn: 'Free to start',
    displayEs: 'Gratis para comenzar',
    evidenceStatus: 'verified',
    tooltipEn: 'Ask your first legal question at no cost, no credit card required.',
    tooltipEs: 'Haz tu primera pregunta legal sin costo, sin tarjeta de crédito.',
  },
  {
    id: 'urgent-help-routing',
    displayEn: 'Urgent-help routing',
    displayEs: 'Derivación a ayuda urgente',
    evidenceStatus: 'verified',
    tooltipEn: 'Crisis situations are routed to verified emergency resources and hotlines.',
    tooltipEs: 'Las situaciones de crisis se derivan a recursos de emergencia y líneas de ayuda verificadas.',
    href: '/emergency-resources',
  },

  // --- NEEDS-EVIDENCE CLAIMS ---
  // These render fallback copy, not the bold claim.
  {
    id: 'privacy-controls',
    displayEn: 'Private by default',
    displayEs: 'Privado por defecto',
    evidenceStatus: 'needs-evidence',
    tooltipEn: 'Awaiting published privacy architecture documentation and third-party audit.',
    tooltipEs: 'Pendiente de documentación de arquitectura de privacidad y auditoría externa.',
    href: '/privacy-at-a-glance',
    fallbackEn: 'See our privacy approach',
    fallbackEs: 'Conoce nuestro enfoque de privacidad',
  },
  {
    id: 'no-signup-required',
    displayEn: 'No signup required',
    displayEs: 'Sin registro',
    evidenceStatus: 'needs-evidence',
    tooltipEn: 'Free questions work without signup, but claim needs verification of the exact flow boundary.',
    tooltipEs: 'Las preguntas gratis funcionan sin registro, pero el alcance necesita verificación.',
    fallbackEn: 'Start without an account',
    fallbackEs: 'Comienza sin una cuenta',
  },
  {
    id: 'attorney-informed',
    displayEn: 'Attorney-informed safeguards',
    displayEs: 'Protecciones informadas por abogados',
    evidenceStatus: 'needs-evidence',
    tooltipEn: 'Blocked: no published attorney reviewer scope, date, or version evidence exists yet.',
    tooltipEs: 'Bloqueado: no existe evidencia publicada del alcance, fecha o versión del revisor abogado.',
    fallbackEn: 'Learn about our safeguards',
    fallbackEs: 'Conoce nuestras protecciones',
  },

  // --- REMOVED CLAIMS ---
  // Documented for audit trail. Never render.
  {
    id: 'in-minutes',
    displayEn: 'Get answers in minutes',
    displayEs: 'Respuestas en minutos',
    evidenceStatus: 'removed',
    tooltipEn: 'Removed: no latency SLA or benchmark data published. Speed claims create expectations we cannot guarantee.',
    tooltipEs: 'Eliminado: no hay datos de latencia publicados. Las afirmaciones de velocidad crean expectativas no garantizables.',
  },
  {
    id: 'encrypted',
    displayEn: 'Encrypted',
    displayEs: 'Cifrado',
    evidenceStatus: 'removed',
    tooltipEn: 'Removed: replaced by "privacy-controls" — more specific and verifiable once evidence is published.',
    tooltipEs: 'Eliminado: reemplazado por "privacy-controls" — más específico y verificable.',
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
    tooltipEn: 'Removed: replaced with "free-help-links" — factual feature exists.',
    tooltipEs: 'Eliminado: reemplazado con "free-help-links" — la función existe.',
  },
  {
    id: 'bank-level-security',
    displayEn: 'Bank-level security',
    displayEs: 'Seguridad de nivel bancario',
    evidenceStatus: 'removed',
    tooltipEn: 'Removed: vague marketing claim with no SOC2 or equivalent published. Use specific privacy policy references instead.',
    tooltipEs: 'Eliminado: afirmación vaga de marketing. Sin SOC2 publicado.',
  },
];

// --- HELPERS ---

export function getClaim(id: string): TrustClaim | undefined {
  return TRUST_CLAIMS.find((c) => c.id === id);
}

export function getVerifiedClaims(): TrustClaim[] {
  return TRUST_CLAIMS.filter((c) => c.evidenceStatus === 'verified');
}

export function canRenderClaim(id: string): boolean {
  const claim = getClaim(id);
  return claim?.evidenceStatus === 'verified';
}

export function renderClaimOrFallback(
  id: string,
  language: 'en' | 'es',
  fallbackText?: string
): string {
  const claim = getClaim(id);
  if (!claim) return fallbackText ?? '';
  if (claim.evidenceStatus === 'verified') {
    return language === 'en' ? claim.displayEn : claim.displayEs;
  }
  const builtInFallback = language === 'en' ? claim.fallbackEn : claim.fallbackEs;
  return builtInFallback ?? fallbackText ?? '';
}
