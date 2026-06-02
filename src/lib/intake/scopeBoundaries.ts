export interface ScopeBoundaryText {
  canHelp: string[];
  cannotDo: string[];
  contactLawyer: string[];
  seekEmergencyHelp: string[];
}

export const SCOPE_BOUNDARIES: Record<'en' | 'es', ScopeBoundaryText> = {
  en: {
    canHelp: [
      'Explain legal concepts in plain language',
      'Help you understand your rights in general terms',
      'Generate document drafts based on your answers',
      'Identify possible next steps for your situation',
      'Connect you with attorney directories and legal aid resources',
      'Organize deadlines and action items',
    ],
    cannotDo: [
      'Provide legal advice for your specific case',
      'Represent you in court or before any agency',
      'Guarantee any legal outcome',
      'Replace a licensed attorney',
      'Make legal decisions on your behalf',
      'Certify documents as legally binding',
    ],
    contactLawyer: [
      'You have a court date or legal deadline approaching',
      'You are considering signing a contract with significant financial impact',
      'You face criminal charges or arrest risk',
      'Your situation involves child custody or safety',
      'You need someone to represent you in a dispute',
      'A government agency is investigating you',
    ],
    seekEmergencyHelp: [
      'You are in immediate physical danger — call 911',
      'You are experiencing domestic violence — call 1-800-799-7233',
      'You are being evicted with less than 48 hours notice',
      'A child is in danger',
      'You have been arrested or detained',
    ],
  },
  es: {
    canHelp: [
      'Explicar conceptos legales en lenguaje simple',
      'Ayudarte a entender tus derechos en términos generales',
      'Generar borradores de documentos basados en tus respuestas',
      'Identificar posibles próximos pasos para tu situación',
      'Conectarte con directorios de abogados y recursos de ayuda legal',
      'Organizar fechas límite y tareas pendientes',
    ],
    cannotDo: [
      'Dar asesoría legal para tu caso específico',
      'Representarte en tribunal o ante una agencia',
      'Garantizar resultados legales',
      'Reemplazar a un abogado licenciado',
      'Tomar decisiones legales por ti',
      'Certificar documentos como legalmente vinculantes',
    ],
    contactLawyer: [
      'Tienes una fecha de tribunal o plazo legal próximo',
      'Estás considerando firmar un contrato con impacto financiero significativo',
      'Enfrentas cargos penales o riesgo de arresto',
      'Tu situación involucra custodia o seguridad de menores',
      'Necesitas que alguien te represente en una disputa',
      'Una agencia del gobierno te está investigando',
    ],
    seekEmergencyHelp: [
      'Estás en peligro físico inmediato — llama al 911',
      'Estás sufriendo violencia doméstica — llama al 1-800-799-7233',
      'Te están desalojando con menos de 48 horas de aviso',
      'Un niño está en peligro',
      'Has sido arrestado o detenido',
    ],
  },
};

export const SCOPE_DISCLAIMER = {
  en: 'ezLegal provides legal information and tools, not legal advice. For legal advice, contact a licensed attorney.',
  es: 'ezLegal proporciona información y herramientas legales, no asesoría legal. Para asesoría legal, contacte a un abogado licenciado.',
} as const;

export const CHECKOUT_ACKNOWLEDGMENT = {
  en: 'ezLegal is not a law firm and does not provide legal advice. You can choose attorney review if you need legal advice.',
  es: 'ezLegal no es un bufete de abogados y no proporciona asesoría legal. Puedes elegir revisión de abogado si necesitas asesoría legal.',
} as const;

export const LEGAL_AID_CAUTION = {
  en: 'We can help you search for options. Availability depends on your location, income, and type of issue.',
  es: 'Podemos ayudarle a buscar opciones. La disponibilidad depende de su ubicación, ingresos y tipo de problema.',
} as const;

export const DATA_CONSENT_ORG = {
  en: {
    referralSharing: 'Client intake information may be shared with partner organizations for referral purposes, only with explicit client consent.',
    accessLimits: 'Organization administrators can view aggregated intake data and individual records only for clients who have given consent.',
    deletion: 'Clients and organizations can request full data deletion at any time.',
    noSale: 'Sensitive intake data is never sold to third parties.',
  },
  es: {
    referralSharing: 'La información de admisión puede compartirse con organizaciones asociadas para fines de referencia, solo con consentimiento explícito del cliente.',
    accessLimits: 'Los administradores de la organización pueden ver datos agregados y registros individuales solo de clientes que han dado su consentimiento.',
    deletion: 'Los clientes y organizaciones pueden solicitar la eliminación completa de datos en cualquier momento.',
    noSale: 'Los datos sensibles de admisión nunca se venden a terceros.',
  },
} as const;
