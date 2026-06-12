import type { EvidenceStatus } from './trustEvidence';

export interface GovernanceSection {
  id: string;
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  evidenceStatus: EvidenceStatus;
  unverifiedNoticeEn?: string;
  unverifiedNoticeEs?: string;
  lastReviewedDate?: string;
  reviewerRole?: string;
}

/**
 * Trust Center content architecture.
 *
 * Rules:
 * - If evidenceStatus is NOT 'verified', the unverifiedNotice copy renders
 *   instead of the body. This prevents marketing copy from appearing without
 *   supporting evidence.
 * - Do NOT claim encryption, private-by-default, attorney review, legal-aid
 *   endorsement, or model safety unless evidenceStatus === 'verified'.
 * - Every section MUST have EN/ES parity.
 */
export const GOVERNANCE_SECTIONS: GovernanceSection[] = [
  {
    id: 'legal-information-not-advice',
    titleEn: 'Legal information, not legal advice',
    titleEs: 'Informacion legal, no asesoria legal',
    bodyEn:
      'ezLegal.ai provides general legal information to help you understand your situation. We do not provide legal advice tailored to your specific circumstances. The information on this platform should not be relied upon as a substitute for consultation with a licensed attorney.',
    bodyEs:
      'ezLegal.ai proporciona informacion legal general para ayudarte a entender tu situacion. No brindamos asesoria legal adaptada a tus circunstancias especificas. La informacion en esta plataforma no debe utilizarse como sustituto de una consulta con un abogado con licencia.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-06-01',
    reviewerRole: 'Legal Compliance Lead',
  },
  {
    id: 'no-attorney-client-relationship',
    titleEn: 'We are not a law firm; no attorney-client relationship',
    titleEs: 'No somos un bufete de abogados; no existe relacion abogado-cliente',
    bodyEn:
      'ezLegal.ai is a technology company, not a law firm. Using this platform does not create an attorney-client relationship. Communications through this platform are not protected by attorney-client privilege. We do not represent you in any legal matter.',
    bodyEs:
      'ezLegal.ai es una empresa de tecnologia, no un bufete de abogados. El uso de esta plataforma no crea una relacion abogado-cliente. Las comunicaciones a traves de esta plataforma no estan protegidas por el privilegio abogado-cliente. No te representamos en ningun asunto legal.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-06-01',
    reviewerRole: 'Legal Compliance Lead',
  },
  {
    id: 'ai-can-be-wrong',
    titleEn: 'AI can be wrong; verify important information',
    titleEs: 'La IA puede equivocarse; verifica la informacion importante',
    bodyEn:
      'AI-generated responses may contain errors, omissions, or outdated information. Laws change frequently and vary by jurisdiction. Always verify critical information with official sources, court websites, or a licensed attorney before taking legal action.',
    bodyEs:
      'Las respuestas generadas por IA pueden contener errores, omisiones o informacion desactualizada. Las leyes cambian frecuentemente y varian segun la jurisdiccion. Siempre verifica la informacion critica con fuentes oficiales, sitios web de tribunales o un abogado con licencia antes de tomar accion legal.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-06-01',
    reviewerRole: 'AI Ethics Reviewer',
  },
  {
    id: 'when-to-contact-lawyer',
    titleEn: 'When to contact a lawyer',
    titleEs: 'Cuando contactar a un abogado',
    bodyEn:
      'You should consult a licensed attorney for: court appearances or filings, complex disputes involving substantial sums, child custody or family law matters, criminal charges or investigations, immigration proceedings, real estate transactions, business formation or contracts over $5,000, and any situation where legal representation is required.',
    bodyEs:
      'Debes consultar a un abogado con licencia para: comparecencias o presentaciones judiciales, disputas complejas que involucren sumas sustanciales, asuntos de custodia de menores o derecho familiar, cargos o investigaciones penales, procedimientos migratorios, transacciones inmobiliarias, formacion de empresas o contratos superiores a $5,000, y cualquier situacion que requiera representacion legal.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-06-01',
    reviewerRole: 'Legal Compliance Lead',
  },
  {
    id: 'crisis-urgent-help-routing',
    titleEn: 'Crisis and urgent-help routing',
    titleEs: 'Derivacion de crisis y ayuda urgente',
    bodyEn:
      'When our system detects indicators of immediate danger, domestic violence, imminent eviction, or other crisis situations, we route you to verified emergency resources and hotlines. Crisis routing is available 24/7 and does not require an account.',
    bodyEs:
      'Cuando nuestro sistema detecta indicadores de peligro inmediato, violencia domestica, desalojo inminente u otras situaciones de crisis, te dirigimos a recursos de emergencia y lineas de ayuda verificadas. La derivacion de crisis esta disponible 24/7 y no requiere una cuenta.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-05-15',
    reviewerRole: 'Safety & Trust Lead',
  },
  {
    id: 'privacy-basics',
    titleEn: 'Privacy basics',
    titleEs: 'Privacidad basica',
    bodyEn:
      'Your conversations are transmitted over encrypted connections (TLS) and stored in encrypted databases managed by our infrastructure provider (Supabase, SOC 2 Type II certified). We do not sell your personal data to third parties. Attorney-client privilege does NOT apply to conversations on this platform.',
    bodyEs:
      'Tus conversaciones se transmiten a traves de conexiones cifradas (TLS) y se almacenan en bases de datos cifradas administradas por nuestro proveedor de infraestructura (Supabase, certificado SOC 2 Tipo II). No vendemos tus datos personales a terceros. El privilegio abogado-cliente NO aplica a las conversaciones en esta plataforma.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-05-20',
    reviewerRole: 'Security Engineering Lead',
  },
  {
    id: 'data-retention-deletion',
    titleEn: 'Data retention and deletion',
    titleEs: 'Retencion y eliminacion de datos',
    bodyEn:
      'Chat history is retained for 90 days for registered users and deleted automatically thereafter. Documents uploaded for analysis are retained for up to 1 year. Free chat sessions without an account expire after 24 hours of inactivity. You can request immediate data deletion at any time from your account settings or by contacting privacy@ezlegal.ai.',
    bodyEs:
      'El historial de chat se retiene durante 90 dias para usuarios registrados y se elimina automaticamente despues. Los documentos cargados para analisis se retienen hasta 1 ano. Las sesiones de chat gratuitas sin cuenta expiran despues de 24 horas de inactividad. Puedes solicitar la eliminacion inmediata de datos en cualquier momento desde la configuracion de tu cuenta o contactando a privacy@ezlegal.ai.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-05-20',
    reviewerRole: 'Data Protection Officer',
  },
  {
    id: 'no-training-on-user-data',
    titleEn: 'Your inputs are not used to train AI models',
    titleEs: 'Tus datos no se usan para entrenar modelos de IA',
    bodyEn:
      'Your questions, conversations, and uploaded documents are NEVER used to train, fine-tune, or improve foundational AI models. Our architecture uses pre-trained models in inference-only mode. Your data is processed to generate responses and then stored only for your session history, never fed into training pipelines.',
    bodyEs:
      'Tus preguntas, conversaciones y documentos cargados NUNCA se usan para entrenar, ajustar o mejorar modelos de IA fundamentales. Nuestra arquitectura utiliza modelos preentrenados en modo de solo inferencia. Tus datos se procesan para generar respuestas y luego se almacenan solo para tu historial de sesion, nunca se alimentan a canales de entrenamiento.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-05-20',
    reviewerRole: 'AI Engineering Lead',
  },
  {
    id: 'ai-model-vendor-provenance',
    titleEn: 'AI model and vendor provenance',
    titleEs: 'Procedencia del modelo y proveedor de IA',
    bodyEn:
      'ezLegal.ai uses commercial large language models from OpenAI (GPT-4o series) as its primary AI provider. Models are accessed via API and run in inference-only mode. We do not host or modify the base models. Model selection and configuration are managed by our AI engineering team with oversight from our governance framework.',
    bodyEs:
      'ezLegal.ai utiliza modelos de lenguaje grandes comerciales de OpenAI (serie GPT-4o) como su proveedor principal de IA. Los modelos se acceden via API y se ejecutan en modo de solo inferencia. No alojamos ni modificamos los modelos base. La seleccion y configuracion de modelos son gestionadas por nuestro equipo de ingenieria de IA con supervision de nuestro marco de gobernanza.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-06-01',
    reviewerRole: 'AI Engineering Lead',
  },
  {
    id: 'human-review-escalation',
    titleEn: 'Human review and escalation for high-risk matters',
    titleEs: 'Revision humana y escalamiento para asuntos de alto riesgo',
    bodyEn:
      'We are documenting this and do not make this claim yet. Our goal is to implement human review for high-risk legal topics (criminal defense, immigration removal, child welfare) before providing AI-generated responses. This section will be updated when the review process is verified and operational.',
    bodyEs:
      'Estamos documentando esto y aun no hacemos esta afirmacion. Nuestro objetivo es implementar revision humana para temas legales de alto riesgo (defensa penal, deportacion migratoria, bienestar infantil) antes de proporcionar respuestas generadas por IA. Esta seccion se actualizara cuando el proceso de revision este verificado y operativo.',
    evidenceStatus: 'needs-evidence',
    unverifiedNoticeEn: 'We are documenting this and do not make this claim yet. Human review for high-risk matters is a planned capability, not a current feature.',
    unverifiedNoticeEs: 'Estamos documentando esto y aun no hacemos esta afirmacion. La revision humana para asuntos de alto riesgo es una capacidad planificada, no una funcion actual.',
    reviewerRole: 'Product & Safety Lead',
  },
  {
    id: 'spanish-language-review',
    titleEn: 'Spanish-language content review process',
    titleEs: 'Proceso de revision de contenido en espanol',
    bodyEn:
      'We are documenting this and do not make this claim yet. Our goal is to have all Spanish-language legal information reviewed by bilingual legal professionals to ensure accuracy and cultural appropriateness. Currently, Spanish content is machine-translated and reviewed by bilingual team members but not formally verified by licensed attorneys.',
    bodyEs:
      'Estamos documentando esto y aun no hacemos esta afirmacion. Nuestro objetivo es que toda la informacion legal en espanol sea revisada por profesionales legales bilingues para garantizar precision y adecuacion cultural. Actualmente, el contenido en espanol es traducido automaticamente y revisado por miembros bilingues del equipo, pero no verificado formalmente por abogados con licencia.',
    evidenceStatus: 'needs-evidence',
    unverifiedNoticeEn: 'We are documenting this and do not make this claim yet. Spanish content is currently team-reviewed but not formally verified by licensed bilingual attorneys.',
    unverifiedNoticeEs: 'Estamos documentando esto y aun no hacemos esta afirmacion. El contenido en espanol actualmente es revisado por el equipo pero no verificado formalmente por abogados bilingues con licencia.',
    reviewerRole: 'Localization Lead',
  },
  {
    id: 'legal-aid-referral-review',
    titleEn: 'Legal-aid and referral resource review process',
    titleEs: 'Proceso de revision de recursos de ayuda legal y referidos',
    bodyEn:
      'We are documenting this and do not make this claim yet. Our legal-aid directory links to publicly listed organizations. We do not endorse, vet, or guarantee the quality of any legal-aid provider. Links are periodically checked for accuracy but are not verified against accreditation databases. We are working toward a formal review process.',
    bodyEs:
      'Estamos documentando esto y aun no hacemos esta afirmacion. Nuestro directorio de ayuda legal enlaza a organizaciones listadas publicamente. No respaldamos, evaluamos ni garantizamos la calidad de ningun proveedor de ayuda legal. Los enlaces se verifican periodicamente pero no se contrastan con bases de datos de acreditacion. Estamos trabajando hacia un proceso de revision formal.',
    evidenceStatus: 'needs-evidence',
    unverifiedNoticeEn: 'We are documenting this and do not make this claim yet. Legal-aid links are periodically checked but not formally verified against accreditation databases.',
    unverifiedNoticeEs: 'Estamos documentando esto y aun no hacemos esta afirmacion. Los enlaces de ayuda legal se verifican periodicamente pero no se contrastan formalmente con bases de datos de acreditacion.',
    reviewerRole: 'Partnerships Lead',
  },
  {
    id: 'accessibility-commitments',
    titleEn: 'Accessibility commitments',
    titleEs: 'Compromisos de accesibilidad',
    bodyEn:
      'ezLegal.ai is committed to WCAG 2.1 AA compliance. We provide keyboard navigation, screen reader compatibility, adjustable text sizes, and high-contrast mode. Our platform supports both English and Spanish. We continuously audit and improve accessibility. Report issues to accessibility@ezlegal.ai.',
    bodyEs:
      'ezLegal.ai esta comprometido con el cumplimiento WCAG 2.1 AA. Proporcionamos navegacion por teclado, compatibilidad con lectores de pantalla, tamanos de texto ajustables y modo de alto contraste. Nuestra plataforma es compatible con ingles y espanol. Auditamos y mejoramos continuamente la accesibilidad. Reporta problemas a accessibility@ezlegal.ai.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-05-10',
    reviewerRole: 'Accessibility Lead',
  },
  {
    id: 'last-reviewed',
    titleEn: 'Last reviewed',
    titleEs: 'Ultima revision',
    bodyEn:
      'This Trust Center was last comprehensively reviewed on June 1, 2026 by the ezLegal.ai Legal Compliance Lead and AI Ethics Reviewer. Individual sections may have more recent review dates noted above. We commit to reviewing this document quarterly or whenever material changes occur.',
    bodyEs:
      'Este Centro de Confianza fue revisado integralmente por ultima vez el 1 de junio de 2026 por el Lider de Cumplimiento Legal y el Revisor de Etica de IA de ezLegal.ai. Las secciones individuales pueden tener fechas de revision mas recientes indicadas arriba. Nos comprometemos a revisar este documento trimestralmente o cuando ocurran cambios materiales.',
    evidenceStatus: 'verified',
    lastReviewedDate: '2026-06-01',
    reviewerRole: 'Legal Compliance Lead',
  },
];

// --- Helpers ---

export function getGovernanceSection(id: string): GovernanceSection | undefined {
  return GOVERNANCE_SECTIONS.find((s) => s.id === id);
}

export function getVerifiedSections(): GovernanceSection[] {
  return GOVERNANCE_SECTIONS.filter((s) => s.evidenceStatus === 'verified');
}

export function getNeedsEvidenceSections(): GovernanceSection[] {
  return GOVERNANCE_SECTIONS.filter((s) => s.evidenceStatus === 'needs-evidence');
}

export function renderSectionContent(
  section: GovernanceSection,
  lang: 'en' | 'es'
): string {
  if (section.evidenceStatus === 'verified') {
    return lang === 'es' ? section.bodyEs : section.bodyEn;
  }
  return lang === 'es'
    ? (section.unverifiedNoticeEs || section.bodyEs)
    : (section.unverifiedNoticeEn || section.bodyEn);
}
