export const urgentKeywords = [
  'eviction', 'evicted', 'lockout', 'notice to quit', 'notice to vacate',
  'court date', 'summons', 'subpoena', 'served papers', 'response is due',
  'hearing tomorrow', 'hearing today', 'hearing this week',
  'domestic violence', 'abused', 'hit me', 'afraid for my safety',
  'restraining order', 'protective order', 'stalking',
  'arrested', 'arraignment', 'criminal charge', 'jail', 'bail',
  'deportation', 'ice at my door', 'removal proceeding', 'asylum deadline',
  'took my child', 'emergency custody', 'child is in danger',
  'wage garnishment', 'frozen account', 'bank levy',
  'desalojo', 'orden de protección', 'violencia doméstica',
  'fecha de corte', 'papeles de corte', 'detenido', 'deportación',
  'custodia de emergencia', 'embargo de salario',
];

export const sensitiveDataPatterns = [
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, label: 'SSN' },
  { pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))\s?\d{4}\s?\d{4}\s?\d{4}\b/, label: 'credit_card' },
  { pattern: /\b\d{9,10}\b(?=.*(?:routing|account|aba))/i, label: 'bank_routing' },
  { pattern: /\b(?:my\s+)?(?:password|contraseña)\s*(?:is|es|:|=)\s*.{3,}/i, label: 'password' },
  { pattern: /\b(?:passport|pasaporte)\s*(?:#|number|número|num)?\s*[:=]?\s*[A-Z0-9]{6,12}\b/i, label: 'passport' },
  { pattern: /\b(?:driver'?s?\s*license|licencia\s*de\s*conducir)\s*(?:#|number|número)?\s*[:=]?\s*[A-Z0-9]{5,15}\b/i, label: 'drivers_license' },
];

export const highRiskIssueTypes = [
  'domestic_violence',
  'child_abuse',
  'self_harm',
  'criminal_defense',
  'immigration_detention',
  'eviction_immediate',
  'restraining_order',
];

export const disclaimerCopy = {
  legalBoundary: {
    en: 'This is legal information, not legal advice. Using this tool does not create an attorney-client relationship.',
    es: 'Esto es información legal, no asesoría legal. Usar esta herramienta no crea una relación abogado-cliente.',
  },
  sourcesAvailable: {
    en: 'Sources shown when available.',
    es: 'Fuentes mostradas cuando están disponibles.',
  },
  sourcesUnavailable: {
    en: 'Sources unavailable in this prototype. Verify with a lawyer, court self-help center, legal-aid organization, or official court website.',
    es: 'Fuentes no disponibles en este prototipo. Verifique con un abogado, centro de autoayuda del tribunal, organización de ayuda legal, o sitio web oficial del tribunal.',
  },
  sensitiveDataWarning: {
    en: 'Please remove highly sensitive personal data before continuing. Do not share Social Security numbers, passwords, bank account numbers, or complete identity documents.',
    es: 'Por favor elimine datos personales altamente sensibles antes de continuar. No comparta números de Seguro Social, contraseñas, cuentas bancarias ni documentos completos de identidad.',
  },
  privacyWarning: {
    en: 'Do not share Social Security numbers, passwords, bank accounts, or full identity documents.',
    es: 'No comparta números de Seguro Social, contraseñas, cuentas bancarias ni documentos completos de identidad.',
  },
};

export const escalationMessages = {
  urgentDeadline: {
    en: 'You may have an urgent deadline. Deadlines in legal matters can be very short. Consider contacting a legal aid office or court self-help center today.',
    es: 'Puede tener un plazo urgente. Los plazos en asuntos legales pueden ser muy cortos. Considere contactar una oficina de ayuda legal o centro de autoayuda del tribunal hoy.',
  },
  safetyFirst: {
    en: 'Your safety comes first. If you are in immediate danger, call 911. The National Domestic Violence Hotline is 1-800-799-7233 (24/7, free, confidential).',
    es: 'Su seguridad es lo primero. Si está en peligro inmediato, llame al 911. La Línea Nacional de Violencia Doméstica es 1-800-799-7233 (24/7, gratis, confidencial).',
  },
  needsLawyer: {
    en: 'This situation may require a licensed attorney. We can help you find free or low-cost legal help.',
    es: 'Esta situación puede requerir un abogado licenciado. Podemos ayudarle a encontrar ayuda legal gratuita o de bajo costo.',
  },
  criminalMatter: {
    en: 'Criminal matters require legal representation. Do not answer police questions without a lawyer. Ask the court for a public defender if you cannot afford one.',
    es: 'Asuntos penales requieren representación legal. No responda preguntas de la policía sin un abogado. Pida al tribunal un defensor público si no puede pagar uno.',
  },
};

export const HIGH_RISK_DOCUMENT_TYPES = [
  'employee_severance',
  'employee_stock_option',
  'employment_agreement',
  'non_compete_agreement',
  'demand_letter',
  'settlement_agreement',
  'power_of_attorney',
  'shareholder_agreement',
  'buy_sell_agreement',
  'asset_sale_purchase',
];

export const HIGH_RISK_DOCUMENT_KEYWORDS = [
  'termination', 'severance', 'firing', 'layoff',
  'investor', 'funding', 'securities', 'equity',
  'litigation', 'dispute', 'lawsuit', 'claim',
  'government', 'regulatory', 'compliance', 'filing',
  'immigration', 'visa', 'deportation', 'asylum',
  'custody', 'divorce', 'domestic', 'restraining',
  'high-value', 'real estate', 'merger', 'acquisition',
];

export function isHighRiskDocument(templateKey: string, documentType: string): boolean {
  if (HIGH_RISK_DOCUMENT_TYPES.includes(templateKey)) return true;
  const lower = documentType.toLowerCase();
  return HIGH_RISK_DOCUMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

export const DOCUMENT_DRAFT_FOOTER = {
  en: 'DRAFT FOR INFORMATIONAL PURPOSES ONLY. This is not legal advice. No attorney-client relationship is created. Attorney review is recommended before use.',
  es: 'BORRADOR SOLO CON FINES INFORMATIVOS. Esto no es asesoría legal. No se crea una relación abogado-cliente. Se recomienda revision de un abogado antes de usar.',
};

export const SOURCES_UNAVAILABLE_NOTICE = {
  en: 'Sources unavailable for this draft. Do not rely on any statute numbers or case citations without independent verification. If specific citations are needed, consult an attorney or official legal database.',
  es: 'Fuentes no disponibles para este borrador. No confíe en números de estatutos o citas de casos sin verificación independiente. Si necesita citas específicas, consulte a un abogado o base de datos legal oficial.',
};

export function detectSensitiveData(text: string): { detected: boolean; types: string[] } {
  if (!text || text.length < 5) return { detected: false, types: [] };
  const types: string[] = [];
  for (const { pattern, label } of sensitiveDataPatterns) {
    if (pattern.test(text)) {
      types.push(label);
    }
  }
  return { detected: types.length > 0, types };
}

export function containsUrgentKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return urgentKeywords.some((kw) => lower.includes(kw.toLowerCase()));
}
