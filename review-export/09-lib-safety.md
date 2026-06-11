# ezLegal.ai Code Review - Safety & Legal Library

> Safety config, legal disclosures, intake logic, attorney review.

Generated: 2026-06-03T00:51:49.806Z
Files included: 20

---

## src/lib/legalSafetyConfig.ts

```typescript
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

```

---

## src/lib/legal-disclosures.ts

```typescript
import type { Language } from './translations';

export type DisclosureKey =
  | 'notAdvice'
  | 'notLawFirm'
  | 'noAttorneyClient'
  | 'noPrivilege'
  | 'consultAttorney'
  | 'noGuarantee'
  | 'informationOnly'
  | 'aiNotAttorney'
  | 'doNotSharePII'
  | 'dataEncrypted'
  | 'noTrainingOnData'
  | 'scopeFull'
  | 'privilegeFull'
  | 'dataFull'
  | 'matchingNeutrality'
  | 'retentionDeletion'
  | 'ccpaCompliant'
  | 'predictionNotGuarantee'
  | 'predictionHistorical'
  | 'predictionConsultAttorney'
  | 'selfHelpOnly'
  | 'educationalPurposes'
  | 'orgSupervisorReview'
  | 'orgClientConsent'
  | 'orgNoPII'
  | 'verifiedDefinition'
  | 'freeDefinition'
  | 'attorneyServiceScope'
  | 'attorneyNoRelationship'
  | 'attorneyFeesSeparate'
  | 'attorneyGeographicLimits';

type SupportedLang = 'en' | 'es';
type DisclosureRecord = Record<SupportedLang, string>;

const disclosures: Record<DisclosureKey, DisclosureRecord> = {
  notAdvice: {
    en: 'This is legal information, not legal advice.',
    es: 'Esta es información legal, no asesoramiento legal.',
  },
  notLawFirm: {
    en: 'ezLegal.ai is not a law firm.',
    es: 'ezLegal.ai no es un bufete de abogados.',
  },
  noAttorneyClient: {
    en: 'Use of this service does not create an attorney-client relationship.',
    es: 'El uso de este servicio no crea una relacion abogado-cliente.',
  },
  noPrivilege: {
    en: 'Your conversations with ezLegal.ai are not protected by attorney-client privilege.',
    es: 'Tus conversaciones con ezLegal.ai no estan protegidas por el privilegio abogado-cliente.',
  },
  consultAttorney: {
    en: 'For specific legal advice, please consult a licensed attorney in your jurisdiction.',
    es: 'Para asesoramiento legal especifico, consulte a un abogado licenciado en su jurisdicción.',
  },
  noGuarantee: {
    en: 'Results may vary based on individual circumstances.',
    es: 'Los resultados pueden variar segun las circunstancias individuales.',
  },
  informationOnly: {
    en: 'Responses are for informational purposes only.',
    es: 'Las respuestas son solo para fines informativos.',
  },
  aiNotAttorney: {
    en: 'I am an AI assistant, not a licensed attorney.',
    es: 'Soy un asistente de IA, no un abogado licenciado.',
  },
  doNotSharePII: {
    en: 'Do not share Social Security numbers, bank account numbers, credit card information, passwords, or other sensitive identifiers.',
    es: 'No comparta numeros de Seguro Social, numeros de cuentas bancarias, información de tarjetas de credito, contrasenas u otros identificadores sensibles.',
  },
  dataEncrypted: {
    en: 'Your conversations are encrypted with TLS 1.3 + AES-256.',
    es: 'Tus conversaciones estan encriptadas con TLS 1.3 + AES-256.',
  },
  noTrainingOnData: {
    en: 'Your data is never used to train our AI models.',
    es: 'Sus datos nunca se usan para entrenar nuestros modelos de IA.',
  },
  scopeFull: {
    en: 'ezLegal.ai provides legal information and self-help support. This is not legal advice and does not create an attorney-client relationship.',
    es: 'ezLegal.ai proporciona información legal y apoyo de autoayuda. Esto no es asesoramiento legal y no crea una relacion abogado-cliente.',
  },
  privilegeFull: {
    en: 'Your conversations with ezLegal.ai are NOT protected by attorney-client privilege. Do not share information you would only share with a lawyer.',
    es: 'Tus conversaciones con ezLegal.ai NO estan protegidas por el privilegio abogado-cliente. No compartas información que solo compartirias con un abogado.',
  },
  dataFull: {
    en: 'Your conversations are encrypted. We do not train AI models on your data.',
    es: 'Tus conversaciones estan encriptadas. No entrenamos modelos de IA con tus datos.',
  },
  matchingNeutrality: {
    en: 'Our attorney directory is not a referral service. We do not receive compensation for attorney recommendations.',
    es: 'Nuestro directorio de abogados no es un servicio de referencia. No recibimos compensacion por recomendaciones de abogados.',
  },
  retentionDeletion: {
    en: 'You can request deletion of your data at any time.',
    es: 'Puede solicitar la eliminacion de sus datos en cualquier momento.',
  },
  ccpaCompliant: {
    en: 'We comply with CCPA and honor data access requests.',
    es: 'Cumplimos con CCPA y honramos las solicitudes de acceso a datos.',
  },
  predictionNotGuarantee: {
    en: 'This tool provides estimated outcome scenarios, NOT guarantees or legal advice.',
    es: 'Esta herramienta proporciona escenarios estimados, NO garantias ni asesoramiento legal.',
  },
  predictionHistorical: {
    en: 'Results are based on historical data patterns and may not reflect my specific circumstances.',
    es: 'Los resultados se basan en patrones de datos historicos y pueden no reflejar mis circunstancias.',
  },
  predictionConsultAttorney: {
    en: 'I should consult a licensed attorney before making legal decisions based on these estimates.',
    es: 'Debo consultar a un abogado licenciado antes de tomar decisiones legales basadas en estas estimaciones.',
  },
  selfHelpOnly: {
    en: 'This provides legal information for self-help purposes only, not legal advice.',
    es: 'Esto proporciona información legal solo para fines de autoayuda, no asesoramiento legal.',
  },
  educationalPurposes: {
    en: 'You can still use this tool for educational purposes, but please have an attorney review any communications before sending.',
    es: 'Aun puede usar esta herramienta con fines educativos, pero consulte a un abogado antes de enviar cualquier comunicacion.',
  },
  orgSupervisorReview: {
    en: 'All AI outputs must be reviewed by a supervising attorney before client use.',
    es: 'Todas las respuestas de IA deben ser revisadas por un abogado supervisor antes de uso con el cliente.',
  },
  orgClientConsent: {
    en: 'Confirm client has given informed consent for AI-assisted research.',
    es: 'Confirme que el cliente dio consentimiento informado para investigacion asistida por IA.',
  },
  orgNoPII: {
    en: 'Do not enter PII (SSN, DOB, case numbers) into AI chat.',
    es: 'No ingrese datos personales (SSN, fecha de nacimiento, numeros de caso) en el chat de IA.',
  },
  verifiedDefinition: {
    en: 'Bar-verified means each attorney\'s active bar license has been confirmed through official state bar records.',
    es: 'Verificado por el colegio significa que la licencia activa de cada abogado ha sido confirmada a traves de registros oficiales del colegio de abogados estatal.',
  },
  freeDefinition: {
    en: 'Free means unlimited AI legal questions at no cost, forever. Issue Packs and premium features are paid.',
    es: 'Gratis significa preguntas legales de IA ilimitadas sin costo, para siempre. Los Paquetes de Ayuda y funciones premium son de pago.',
  },
  attorneyServiceScope: {
    en: 'ezLegal.ai is a legal information platform, not a law firm. Attorney referrals are informational and do not constitute endorsement or guarantee of representation.',
    es: 'ezLegal.ai es una plataforma de información legal, no un bufete. Las referencias a abogados son informativas y no constituyen respaldo ni garantia de representacion.',
  },
  attorneyNoRelationship: {
    en: 'No attorney-client relationship is created through ezLegal.ai. Any engagement is directly between you and the attorney.',
    es: 'No se crea relacion abogado-cliente a traves de ezLegal.ai. Cualquier contratacion es directamente entre usted y el abogado.',
  },
  attorneyFeesSeparate: {
    en: 'Attorney fees are separate from ezLegal.ai subscription costs. Confirm all fees directly with any attorney before engagement.',
    es: 'Los honorarios del abogado son separados de los costos de suscripcion de ezLegal.ai. Confirme todos los honorarios directamente con cualquier abogado.',
  },
  attorneyGeographicLimits: {
    en: 'Attorney availability varies by jurisdiction. Not all practice areas are covered in all states.',
    es: 'La disponibilidad de abogados varia por jurisdicción. No todas las areas de practica estan cubiertas en todos los estados.',
  },
};

export function getDisclosure(key: DisclosureKey, language: Language): string {
  const lang: SupportedLang = language === 'es' ? 'es' : 'en';
  return disclosures[key][lang];
}

export function getDisclosures(keys: DisclosureKey[], language: Language): string[] {
  const lang: SupportedLang = language === 'es' ? 'es' : 'en';
  return keys.map(key => disclosures[key][lang]);
}

export interface CrisisResource {
  name: Record<SupportedLang, string>;
  phone: string;
  url: string;
  type: 'dv' | 'crisis' | 'housing' | 'general';
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: { en: 'National Domestic Violence Hotline', es: 'Linea Nacional de Violencia Domestica' },
    phone: '1-800-799-7233',
    url: 'https://www.thehotline.org',
    type: 'dv',
  },
  {
    name: { en: 'Crisis Text Line', es: 'Linea de Texto de Crisis' },
    phone: 'Text HOME to 741741',
    url: 'https://www.crisistextline.org',
    type: 'crisis',
  },
  {
    name: { en: '988 Suicide & Crisis Lifeline', es: '988 Linea de Suicidio y Crisis' },
    phone: '988',
    url: 'https://988lifeline.org',
    type: 'crisis',
  },
  {
    name: { en: 'HUD Housing Counseling', es: 'Consejeria de Vivienda HUD' },
    phone: '1-800-569-4287',
    url: 'https://www.hud.gov/findhelp',
    type: 'housing',
  },
];

export function getCrisisResources(language: Language, type?: CrisisResource['type']): Array<{ name: string; phone: string; url: string }> {
  const lang: SupportedLang = language === 'es' ? 'es' : 'en';
  const filtered = type ? CRISIS_RESOURCES.filter(r => r.type === type) : CRISIS_RESOURCES;
  return filtered.map(r => ({
    name: r.name[lang],
    phone: r.phone,
    url: r.url,
  }));
}

```

---

## src/lib/urgent-signal-detector.ts

```typescript
export type UrgentCategory =
  | 'eviction'
  | 'court_deadline'
  | 'domestic_violence'
  | 'wage_garnishment'
  | 'restraining_order'
  | 'immigration'
  | 'criminal'
  | 'custody_emergency';

export interface UrgentSignal {
  category: UrgentCategory;
  matchedPhrase: string;
  severity: 'high' | 'critical';
}

const PATTERNS: Array<{ category: UrgentCategory; severity: 'high' | 'critical'; re: RegExp }> = [
  { category: 'domestic_violence', severity: 'critical', re: /\b(domestic violence|being abused|my (husband|wife|partner|boyfriend|girlfriend) hit|afraid for my (safety|life)|he hit me|she hit me)\b/i },
  { category: 'restraining_order', severity: 'critical', re: /\b(restraining order|order of protection|protective order|stalking)\b/i },
  { category: 'custody_emergency', severity: 'critical', re: /\b(took my (kid|child|children)|emergency custody|child is in danger)\b/i },
  { category: 'criminal', severity: 'high', re: /\b(arrested|arraignment|criminal charge|jail|bail|miranda)\b/i },
  { category: 'eviction', severity: 'high', re: /\b(eviction notice|being evicted|lockout|sheriff.*evict|writ of restitution|notice to (quit|vacate)|5[- ]day notice|30[- ]day notice)\b/i },
  { category: 'wage_garnishment', severity: 'high', re: /\b(wage garnishment|garnish(ed|ing)? (my )?(wages|pay(check)?)|bank (account )?levy|frozen (bank )?account)\b/i },
  { category: 'court_deadline', severity: 'high', re: /\b(court date|summons|subpoena|served (with )?papers|response is due|answer is due|hearing (tomorrow|today|this week))\b/i },
  { category: 'immigration', severity: 'high', re: /\b(ice (is )?at (my|the) door|deportation|removal proceeding|notice to appear|asylum deadline)\b/i },
];

export function detectUrgentSignals(text: string): UrgentSignal[] {
  if (!text || text.length < 3) return [];
  const hits: UrgentSignal[] = [];
  for (const { category, severity, re } of PATTERNS) {
    const match = text.match(re);
    if (match) hits.push({ category, matchedPhrase: match[0], severity });
  }
  return hits;
}

export function getHighestSeverity(signals: UrgentSignal[]): 'high' | 'critical' | null {
  if (signals.length === 0) return null;
  return signals.some((s) => s.severity === 'critical') ? 'critical' : 'high';
}

export const CATEGORY_COPY: Record<UrgentCategory, { title: string; help: string }> = {
  eviction: {
    title: 'Eviction notices have tight deadlines',
    help: 'Eviction response deadlines can be as short as 5 days. Contact a legal aid office or tenants-rights hotline today.',
  },
  court_deadline: {
    title: 'Court papers have strict deadlines',
    help: 'Missing a response deadline can mean a default judgment against you. File a response or contact legal aid immediately.',
  },
  domestic_violence: {
    title: 'Your safety comes first',
    help: 'If you are in immediate danger, call 911. The National DV Hotline is 1-800-799-7233 (24/7, free, confidential).',
  },
  wage_garnishment: {
    title: 'Garnishments can often be reduced or stopped',
    help: 'Some garnishments can be challenged or exempted. Contact a consumer-rights legal aid office today.',
  },
  restraining_order: {
    title: 'Protective orders move quickly',
    help: 'Courts can often issue same-day emergency orders. Contact your local court self-help center or legal aid now.',
  },
  immigration: {
    title: 'Immigration deadlines are unforgiving',
    help: 'Missing an immigration deadline can cause permanent consequences. Contact an accredited immigration legal aid org today.',
  },
  criminal: {
    title: 'Criminal matters require a lawyer',
    help: 'Do not answer police questions without a lawyer. If you cannot afford one, ask the court for a public defender.',
  },
  custody_emergency: {
    title: 'Emergency custody matters move fast',
    help: 'Courts have emergency custody procedures. Contact a family-law legal aid office or court self-help center today.',
  },
};

```

---

## src/lib/legalbreeze-api.ts

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_EDGE_FUNCTION = true;

interface ChatRequest {
  query: string;
  sessionId: string;
  tenantId: string;
  jurisdiction?: string;
  category?: string;
  subcategory?: string;
  includeCompliance?: boolean;
}

interface OutcomePredictionRequest {
  caseId?: string;
  caseSource?: 'lso_client_intakes' | 'pro_bono_applications' | 'cases';
  tenantId?: string;
  caseData?: {
    caseType: string;
    jurisdiction: string;
    urgencyLevel: string;
    incomeEligible: boolean;
    hasDocumentation: boolean;
    documentationQuality: 'none' | 'partial' | 'complete' | 'excellent';
    hasOpposingCounsel: boolean;
    attorneySpecialtyMatch: boolean;
    attorneyYearsExperience: number;
    caseComplexity?: 'simple' | 'medium' | 'complex' | 'very_complex';
    householdSize?: number;
    issueDescription?: string;
  };
}

interface PredictionFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface OutcomePredictionResponse {
  prediction: {
    score: number;
    confidence: 'low' | 'medium' | 'high';
    predictedOutcome: 'favorable' | 'unfavorable' | 'likely_settled' | 'uncertain';
    factors: PredictionFactor[];
    recommendations: string[];
  };
  modelInfo: {
    version: string;
    overallAccuracy: number;
    caseTypeAccuracy: number | null;
  };
  tenantId: string;
}

interface ChatResponse {
  response: string;
  citations: Citation[];
  complianceManifest?: ComplianceManifest;
  enforcementScore?: number;
  modelUsed?: string;
}

interface Citation {
  source: string;
  title: string;
  authorityType: 'statute' | 'case_law' | 'regulation' | 'secondary';
  jurisdiction: string;
  url?: string;
  excerpt?: string;
  recency?: string;
}

interface ComplianceManifest {
  jurisdictionValidated: boolean;
  citationComplete: boolean;
  biasScreened: boolean;
  provenanceHash: string;
  enforcementScore: number;
  auditTrailId: string;
}

interface DocumentAnalysisRequest {
  document: File | string;
  analysisType: 'summarize' | 'extract_terms' | 'check_enforceability' | 'identify_risks';
  tenantId: string;
  jurisdiction?: string;
}

interface DocumentAnalysisResponse {
  summary?: string;
  extractedTerms?: string[];
  enforcementIssues?: string[];
  risks?: RiskItem[];
  complianceScore?: number;
}

interface RiskItem {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  clause?: string;
  recommendation?: string;
}

class LegalbreezeAPI {
  private tenantId: string;
  private apiUrl: string;

  constructor(tenantId: string = 'ezlegal') {
    this.tenantId = tenantId;
    this.apiUrl = `${SUPABASE_URL}/functions/v1`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Tenant-ID': this.tenantId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private async requestEdgeFunction<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Tenant-ID': this.tenantId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge function error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    if (USE_EDGE_FUNCTION) {
      return this.requestEdgeFunction<ChatResponse>('legalbreeze-rag', {
        query: request.query,
        sessionId: request.sessionId,
        jurisdiction: request.jurisdiction,
        category: request.category,
        subcategory: request.subcategory,
        includeCompliance: request.includeCompliance,
      });
    }

    const url = `https://legalbreeze.com/slim-api/data/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
      },
      body: JSON.stringify({
        ...request,
        tenantId: this.tenantId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Legalbreeze API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResponse> {
    if (request.document instanceof File) {
      const formData = new FormData();
      formData.append('document', request.document);
      formData.append('analysisType', request.analysisType);
      formData.append('tenantId', this.tenantId);
      if (request.jurisdiction) {
        formData.append('jurisdiction', request.jurisdiction);
      }

      const response = await fetch(`${this.apiUrl}/document/analyze`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': this.tenantId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Document analysis failed: ${response.status}`);
      }

      return response.json();
    }

    return this.request<DocumentAnalysisResponse>('document/analyze', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        tenantId: this.tenantId,
      }),
    });
  }

  async getPromptTaxonomy(): Promise<{ categories: string[]; subcategories: Record<string, string[]> }> {
    return this.request('taxonomy');
  }

  async validateJurisdiction(query: string, jurisdiction: string): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestedJurisdiction?: string;
  }> {
    return this.request('validate/jurisdiction', {
      method: 'POST',
      body: JSON.stringify({ query, jurisdiction }),
    });
  }

  async getComplianceReport(auditTrailId: string): Promise<{
    timestamp: string;
    query: string;
    response: string;
    citations: Citation[];
    complianceChecks: {
      name: string;
      passed: boolean;
      details: string;
    }[];
    provenanceChain: string[];
  }> {
    return this.request(`compliance/report/${auditTrailId}`);
  }

  setTenant(tenantId: string): void {
    this.tenantId = tenantId;
  }

  async predictOutcome(request: OutcomePredictionRequest): Promise<OutcomePredictionResponse> {
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/outcome-prediction`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'X-Tenant-ID': this.tenantId,
      },
      body: JSON.stringify({
        ...request,
        tenantId: this.tenantId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Outcome prediction failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async predictOutcomeFromCaseData(caseData: OutcomePredictionRequest['caseData']): Promise<OutcomePredictionResponse> {
    return this.predictOutcome({ caseData });
  }

  async predictOutcomeForCase(
    caseId: string,
    caseSource: 'lso_client_intakes' | 'pro_bono_applications' | 'cases'
  ): Promise<OutcomePredictionResponse> {
    return this.predictOutcome({ caseId, caseSource });
  }

  async getModelPerformance(): Promise<{
    version: string;
    accuracy: number;
    byCaseType: Record<string, number>;
    totalPredictions: number;
  }> {
    return this.request('prediction/model-performance');
  }
}

export const legalbreezeAPI = new LegalbreezeAPI();

export type {
  ChatRequest,
  ChatResponse,
  Citation,
  ComplianceManifest,
  DocumentAnalysisRequest,
  DocumentAnalysisResponse,
  RiskItem,
  OutcomePredictionRequest,
  OutcomePredictionResponse,
  PredictionFactor,
};

```

---

## src/lib/globalLegalAIStandards.ts

```typescript
/**
 * Global Legal AI Standards
 * Canonical audit checklist for ezlegal.ai
 *
 * Every requirement has an id, category, priority, and implementation status.
 * Use this file as the single source of truth for compliance audits.
 */

export type StandardStatus = 'implemented' | 'partial' | 'missing' | 'not_applicable';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Category =
  | 'access_to_justice'
  | 'legal_ai_safety'
  | 'ai_reliability'
  | 'privacy_data_protection'
  | 'upl_controls'
  | 'conversion_ux'
  | 'professional_standards';

export interface Standard {
  id: string;
  category: Category;
  priority: Priority;
  requirement: string;
  status: StandardStatus;
  implementedIn?: string[];
  notes?: string;
}

export const GLOBAL_LEGAL_AI_STANDARDS: Standard[] = [
  // ─── 1. ACCESS TO JUSTICE ───────────────────────────────────────────────────
  {
    id: 'A2J-001',
    category: 'access_to_justice',
    priority: 'critical',
    requirement: 'Plain-language UX: all user-facing text at 8th-grade reading level or below',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/TabbedResponse.tsx', 'src/hooks/useReadingPreferences.ts'],
    notes: 'Reading preferences exist but not all pages enforce plain-language defaults',
  },
  {
    id: 'A2J-002',
    category: 'access_to_justice',
    priority: 'critical',
    requirement: 'Spanish-first or bilingual support: users can access all primary flows in Spanish without going through English first',
    status: 'partial',
    implementedIn: ['src/pages/EspanolLanding.tsx', 'src/contexts/LanguageContext.tsx', 'src/lib/translations.ts'],
    notes: 'Spanish landing and context exist but not all flows are fully translated',
  },
  {
    id: 'A2J-003',
    category: 'access_to_justice',
    priority: 'high',
    requirement: 'Low cognitive load: one primary action per screen, progressive disclosure, minimal form fields',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/', 'src/components/GuidedIssueLauncher.tsx'],
    notes: 'Cognitive load components exist; some pages still show too much content at once',
  },
  {
    id: 'A2J-004',
    category: 'access_to_justice',
    priority: 'critical',
    requirement: 'Mobile-friendly flows: all primary user journeys usable on 320px viewport',
    status: 'partial',
    implementedIn: ['src/components/MobileBottomNav.tsx', 'src/components/MobileDrawer.tsx'],
    notes: 'Mobile nav exists; need responsive audit of intake flows',
  },
  {
    id: 'A2J-005',
    category: 'access_to_justice',
    priority: 'high',
    requirement: 'Clear next steps for users who cannot afford a lawyer: free options, legal aid referrals, self-help resources',
    status: 'partial',
    implementedIn: ['src/pages/EmergencyResources.tsx', 'src/pages/ProBonoIntake.tsx', 'src/components/PersonaNextSteps.tsx'],
    notes: 'Emergency resources and pro bono intake exist; need unified "I cannot afford a lawyer" path',
  },
  {
    id: 'A2J-006',
    category: 'access_to_justice',
    priority: 'high',
    requirement: 'Referrals to legal aid, pro bono, court self-help, or emergency resources when appropriate',
    status: 'partial',
    implementedIn: ['src/components/CrisisEscalationCard.tsx', 'src/components/shared/CrisisResourceCard.tsx'],
    notes: 'Crisis cards exist; need contextual triggering in chat/triage flows',
  },

  // ─── 2. LEGAL AI SAFETY ─────────────────────────────────────────────────────
  {
    id: 'SAFE-001',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Clear disclaimer: product provides legal information, not legal advice',
    status: 'implemented',
    implementedIn: ['src/components/shared/LegalDisclaimer.tsx', 'src/components/templates/LegalDisclosureModule.tsx'],
  },
  {
    id: 'SAFE-002',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'No attorney-client relationship unless explicitly created by a licensed provider',
    status: 'implemented',
    implementedIn: ['src/components/shared/AttorneyServiceDisclosure.tsx', 'src/lib/legal-disclosures.ts'],
  },
  {
    id: 'SAFE-003',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Jurisdiction-aware responses: AI must identify and limit answers to relevant jurisdiction',
    status: 'partial',
    implementedIn: ['src/components/shared/JurisdictionSelector.tsx', 'src/data/jurisdictions.ts'],
    notes: 'Selector exists but chat service does not always enforce jurisdiction context',
  },
  {
    id: 'SAFE-004',
    category: 'legal_ai_safety',
    priority: 'high',
    requirement: 'No unsupported guarantees about legal outcomes',
    status: 'implemented',
    implementedIn: ['src/components/OutcomePredictionWidget.tsx', 'src/components/PredictionConsentGate.tsx'],
  },
  {
    id: 'SAFE-005',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Encourage lawyer review for high-risk matters',
    status: 'partial',
    implementedIn: ['src/components/HighRiskPackGate.tsx', 'src/components/NextBestStep.tsx'],
    notes: 'Gate exists; need consistent triggering across all high-risk detection points',
  },
  {
    id: 'SAFE-006',
    category: 'legal_ai_safety',
    priority: 'critical',
    requirement: 'Escalation paths for emergencies: eviction, immigration, DV, criminal, court deadlines',
    status: 'partial',
    implementedIn: ['src/components/CrisisTriageGate.tsx', 'src/components/CrisisStrip.tsx', 'src/lib/urgent-signal-detector.ts'],
    notes: 'Detection logic exists; need to wire it into all chat entry points',
  },

  // ─── 3. AI RELIABILITY ──────────────────────────────────────────────────────
  {
    id: 'REL-001',
    category: 'ai_reliability',
    priority: 'critical',
    requirement: 'Avoid hallucinated citations: never fabricate case names, statutes, or agency names',
    status: 'partial',
    implementedIn: ['src/components/CitationDisplay.tsx', 'src/lib/claims-registry.ts'],
    notes: 'Citation display exists; edge function prompt needs hallucination-prevention instructions',
  },
  {
    id: 'REL-002',
    category: 'ai_reliability',
    priority: 'high',
    requirement: 'When law, forms, deadlines, or eligibility rules are uncertain, explicitly say so',
    status: 'partial',
    implementedIn: ['src/components/CoverageConfidenceIndicator.tsx'],
    notes: 'Confidence indicator exists; AI prompt must include uncertainty disclosure instructions',
  },
  {
    id: 'REL-003',
    category: 'ai_reliability',
    priority: 'high',
    requirement: 'Prefer cited, verifiable sources where available',
    status: 'partial',
    implementedIn: ['src/components/CitationDisplay.tsx', 'supabase/functions/legalbreeze-rag/index.ts'],
    notes: 'RAG function exists; citation rendering implemented',
  },
  {
    id: 'REL-004',
    category: 'ai_reliability',
    priority: 'high',
    requirement: 'Ask clarifying questions before generating legal documents',
    status: 'partial',
    implementedIn: ['src/components/CourtReadyOutputBuilder.tsx'],
    notes: 'Builder has steps; need pre-generation confirmation gate',
  },
  {
    id: 'REL-005',
    category: 'ai_reliability',
    priority: 'critical',
    requirement: 'Do not fabricate laws, case names, agencies, or filing rules',
    status: 'partial',
    implementedIn: ['src/lib/claims-registry.ts'],
    notes: 'Claims registry validates known sources; AI system prompt must reinforce this',
  },

  // ─── 4. PRIVACY AND DATA PROTECTION ────────────────────────────────────────
  {
    id: 'PRIV-001',
    category: 'privacy_data_protection',
    priority: 'critical',
    requirement: 'Minimize collection of sensitive personal data',
    status: 'partial',
    implementedIn: ['src/components/PrivacyMicroPanel.tsx', 'src/lib/consent.ts'],
    notes: 'Consent framework exists; some forms collect more than needed',
  },
  {
    id: 'PRIV-002',
    category: 'privacy_data_protection',
    priority: 'critical',
    requirement: 'Warn users before they enter confidential information',
    status: 'partial',
    implementedIn: ['src/components/DocumentUploadWarning.tsx'],
    notes: 'Document warning exists; chat input needs pre-submission warning for sensitive topics',
  },
  {
    id: 'PRIV-003',
    category: 'privacy_data_protection',
    priority: 'high',
    requirement: 'Do not expose user data in logs, analytics, prompts, or error messages',
    status: 'partial',
    implementedIn: ['src/lib/error-handler.ts'],
    notes: 'Error handler sanitizes; need audit of analytics events for PII leakage',
  },
  {
    id: 'PRIV-004',
    category: 'privacy_data_protection',
    priority: 'high',
    requirement: 'Deletion and export pathways for user data',
    status: 'implemented',
    implementedIn: ['supabase/functions/data-deletion/index.ts', 'supabase/functions/data-export/index.ts'],
  },
  {
    id: 'PRIV-005',
    category: 'privacy_data_protection',
    priority: 'critical',
    requirement: 'Protect especially sensitive data: immigration status, health, finances, DV, minors, criminal',
    status: 'partial',
    implementedIn: ['src/lib/urgent-signal-detector.ts'],
    notes: 'Signal detector identifies sensitive topics; need data-handling policy enforcement in storage',
  },

  // ─── 5. UNAUTHORIZED PRACTICE OF LAW CONTROLS ──────────────────────────────
  {
    id: 'UPL-001',
    category: 'upl_controls',
    priority: 'critical',
    requirement: 'Do not tell users what they "should" do as legal strategy',
    status: 'partial',
    implementedIn: ['src/lib/legal-disclosures.ts'],
    notes: 'Disclosures exist; AI system prompt must avoid directive language',
  },
  {
    id: 'UPL-002',
    category: 'upl_controls',
    priority: 'critical',
    requirement: 'Present options, risks, and general information rather than personalized legal conclusions',
    status: 'partial',
    implementedIn: ['src/components/LegalResponseFormatter.tsx'],
    notes: 'Formatter structures responses; AI prompt must reinforce options-based framing',
  },
  {
    id: 'UPL-003',
    category: 'upl_controls',
    priority: 'high',
    requirement: 'Include "consult a lawyer/legal aid" pathways for complex or high-stakes matters',
    status: 'partial',
    implementedIn: ['src/components/NextBestStep.tsx', 'src/components/AttorneyConnections.tsx'],
    notes: 'Components exist; need consistent display after every AI response on high-risk topics',
  },

  // ─── 6. CONVERSION AND UX STANDARDS ────────────────────────────────────────
  {
    id: 'CUX-001',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Minimize form fields: no field without clear purpose',
    status: 'partial',
    implementedIn: ['src/components/ValidatedFormField.tsx'],
    notes: 'Validated fields exist; some intake forms have unnecessary fields',
  },
  {
    id: 'CUX-002',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Progressive disclosure: show details only when relevant',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/CollapsibleSidebar.tsx', 'src/components/cognitive-load/TabbedResponse.tsx'],
  },
  {
    id: 'CUX-003',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Avoid long walls of text: chunk content, use headings, bullets',
    status: 'partial',
    implementedIn: ['src/components/cognitive-load/TabbedResponse.tsx'],
  },
  {
    id: 'CUX-004',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Clear primary CTA per screen',
    status: 'partial',
    implementedIn: ['src/pages/Home.tsx', 'src/pages/Pricing.tsx'],
    notes: 'Main pages have CTAs; some interior pages lack clear primary action',
  },
  {
    id: 'CUX-005',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Trust-building copy without overclaiming',
    status: 'implemented',
    implementedIn: ['src/components/TrustBadges.tsx', 'src/components/VerifiableTrustStrip.tsx', 'src/lib/claims-registry.ts'],
  },
  {
    id: 'CUX-006',
    category: 'conversion_ux',
    priority: 'high',
    requirement: 'Pricing, free options, or eligibility paths are clear',
    status: 'implemented',
    implementedIn: ['src/pages/Pricing.tsx', 'src/components/pricing/'],
  },
  {
    id: 'CUX-007',
    category: 'conversion_ux',
    priority: 'critical',
    requirement: 'Spanish-language users not forced through English-first flows',
    status: 'partial',
    implementedIn: ['src/pages/EspanolLanding.tsx', 'src/contexts/LanguageContext.tsx'],
    notes: 'Landing page exists; chat and triage flows still default to English',
  },

  // ─── 7. PROFESSIONAL / LSO STANDARDS ───────────────────────────────────────
  {
    id: 'PRO-001',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Support referral workflows between AI triage and human lawyers',
    status: 'implemented',
    implementedIn: ['src/components/ChatHandoffToolbar.tsx', 'src/components/LawyerConnectionModal.tsx'],
  },
  {
    id: 'PRO-002',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Support intake triage for legal service organizations',
    status: 'implemented',
    implementedIn: ['src/components/TriageIntake.tsx', 'src/components/intake/'],
  },
  {
    id: 'PRO-003',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Admin review capability for AI-generated outputs',
    status: 'implemented',
    implementedIn: ['src/pages/Admin.tsx', 'src/pages/AdminAuditLog.tsx'],
  },
  {
    id: 'PRO-004',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Audit trails for all AI-generated legal outputs',
    status: 'implemented',
    implementedIn: ['supabase/migrations/20260327225238_enhance_admin_audit_log_system.sql'],
  },
  {
    id: 'PRO-005',
    category: 'professional_standards',
    priority: 'high',
    requirement: 'Human override and review capability for AI recommendations',
    status: 'partial',
    implementedIn: ['src/components/ChatHandoffToolbar.tsx'],
    notes: 'Handoff toolbar exists; need explicit "flag for review" action on any AI output',
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

export function getStandardsByCategory(category: Category): Standard[] {
  return GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.category === category);
}

export function getStandardsByStatus(status: StandardStatus): Standard[] {
  return GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === status);
}

export function getCriticalGaps(): Standard[] {
  return GLOBAL_LEGAL_AI_STANDARDS.filter(
    s => s.priority === 'critical' && (s.status === 'missing' || s.status === 'partial')
  );
}

export function getComplianceScore(): { total: number; implemented: number; partial: number; missing: number; percentage: number } {
  const total = GLOBAL_LEGAL_AI_STANDARDS.length;
  const implemented = GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === 'implemented').length;
  const partial = GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === 'partial').length;
  const missing = GLOBAL_LEGAL_AI_STANDARDS.filter(s => s.status === 'missing').length;
  const percentage = Math.round(((implemented + partial * 0.5) / total) * 100);
  return { total, implemented, partial, missing, percentage };
}

export function getAuditSummary(): string {
  const score = getComplianceScore();
  const criticalGaps = getCriticalGaps();
  return `Compliance: ${score.percentage}% (${score.implemented} implemented, ${score.partial} partial, ${score.missing} missing of ${score.total}). Critical gaps: ${criticalGaps.length}.`;
}

```

---

## src/lib/claims-registry.ts

```typescript
export type ClaimType = 'security' | 'privacy' | 'compliance' | 'coverage' | 'performance' | 'service' | 'pricing';

export interface ClaimEntry {
  claim: string;
  claim_type: ClaimType;
  evidence: string;
  scope: string;
  owner: string;
  surfaces: string[];
  lastReviewed: string;
}

export const CLAIMS_REGISTRY: Record<string, ClaimEntry> = {
  'tls-encryption': {
    claim: 'TLS 1.3 encryption in transit',
    claim_type: 'security',
    evidence: 'Supabase infrastructure uses TLS 1.3 for all connections',
    scope: 'Data in transit between client and server only',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['VerifiableTrustStrip', 'ForBusiness', 'ForPartners', 'EnterpriseSecurity', 'SLA'],
    lastReviewed: '2026-02',
  },
  'aes-256-encryption': {
    claim: 'AES-256 encryption at rest',
    claim_type: 'security',
    evidence: 'Supabase/AWS encrypts stored data with AES-256',
    scope: 'Data at rest in database and storage only',
    owner: 'Infrastructure (Supabase/AWS)',
    surfaces: ['VerifiableTrustStrip', 'ForBusiness', 'ForPartners', 'ForOrganizations', 'EnterpriseSecurity'],
    lastReviewed: '2026-02',
  },
  'soc2-type2': {
    claim: 'SOC 2 Type II certified infrastructure',
    claim_type: 'compliance',
    evidence: 'Supabase holds SOC 2 Type II certification for its managed cloud infrastructure',
    scope: 'Infrastructure provider certification; does not cover ezLegal application layer',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['ForPartners', 'EnterpriseSecurity', 'ForBusiness FAQ'],
    lastReviewed: '2026-02',
  },
  'zero-training': {
    claim: 'We never use your data to train AI models',
    claim_type: 'privacy',
    evidence: 'Internal policy: no client data used for model training; OpenAI API data not used for training per API ToS',
    scope: 'All user-submitted data including chat messages, documents, and prediction inputs',
    owner: 'ezLegal Engineering',
    surfaces: ['VerifiableTrustStrip', 'ForBusiness', 'TrustCenter', 'PrivacyPolicy'],
    lastReviewed: '2026-02',
  },
  'ccpa-compliance': {
    claim: 'CCPA compliant',
    claim_type: 'compliance',
    evidence: 'Data export, deletion, and opt-out endpoints implemented; 45-day fulfillment target',
    scope: 'California residents; data rights per CCPA requirements',
    owner: 'ezLegal Legal/Engineering',
    surfaces: ['VerifiableTrustStrip', 'PrivacyPolicy', 'ForPartners'],
    lastReviewed: '2026-02',
  },
  'attorney-reviewed-templates': {
    claim: 'Attorney-reviewed template library',
    claim_type: 'service',
    evidence: 'Templates reviewed by licensed attorneys for legal accuracy at the template level',
    scope: 'Review is at template level, not per-user or per-purchase; does not constitute legal advice; does not create attorney-client relationship',
    owner: 'ezLegal Legal/Content',
    surfaces: ['IssuePacks', 'Pricing', 'PricingChooser', 'ForIndividuals', 'ForBusiness', 'TrustLogos'],
    lastReviewed: '2026-02',
  },
  'fifty-state-coverage': {
    claim: '50-state US coverage',
    claim_type: 'coverage',
    evidence: 'Jurisdiction selector includes all 50 US states; AI responses are jurisdiction-aware',
    scope: 'Coverage depth varies by state and case type; not all legal areas have equal data density',
    owner: 'ezLegal Engineering/Content',
    surfaces: ['Home', 'ForBusiness', 'CasePredictor'],
    lastReviewed: '2026-02',
  },
  'source-coverage-indicator': {
    claim: 'Source coverage 25-95% confidence indicator',
    claim_type: 'performance',
    evidence: 'Estimated from text pattern matching against citation database; not verified retrieval accuracy',
    scope: 'Indicates breadth of citation support, not prediction accuracy; high coverage does not equal correctness; laws vary by jurisdiction',
    owner: 'ezLegal Engineering',
    surfaces: ['Chatbot'],
    lastReviewed: '2026-02',
  },
  'target-uptime-999': {
    claim: '99.9% target uptime',
    claim_type: 'service',
    evidence: 'Target based on Supabase infrastructure SLA; not a contractual guarantee at base tier',
    scope: 'Starter/Individual/Pro plans; ~43 min/month max downtime; excludes scheduled maintenance',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['ForPartners', 'SLA'],
    lastReviewed: '2026-02',
  },
  'target-uptime-9995': {
    claim: '99.95% target uptime',
    claim_type: 'service',
    evidence: 'Enterprise-tier target; contractual SLA available on request',
    scope: 'Enterprise/LSO Professional plans only; ~22 min/month max downtime',
    owner: 'Infrastructure (Supabase)',
    surfaces: ['ForPartners', 'SLA'],
    lastReviewed: '2026-02',
  },
  'bilingual-support': {
    claim: 'Bilingual English/Spanish support',
    claim_type: 'service',
    evidence: 'LanguageContext with translation keys; Spanish landing page; bilingual components',
    scope: 'UI text and common legal terms; not full legal translation service',
    owner: 'ezLegal Engineering/Content',
    surfaces: ['Home', 'Navigation', 'EspanolLanding', 'IssuePacks', 'CasePredictor'],
    lastReviewed: '2026-02',
  },
  'crisis-detection': {
    claim: 'Crisis detection and emergency resource escalation',
    claim_type: 'service',
    evidence: 'Keyword-based crisis detection in CrisisEscalationCard; routes to verified hotlines',
    scope: 'Keyword matching only; not clinical assessment; resources are third-party hotlines',
    owner: 'ezLegal Engineering',
    surfaces: ['Chatbot', 'EmergencyResources'],
    lastReviewed: '2026-02',
  },
  'case-predictor-methodology': {
    claim: 'Data-informed probability range estimate',
    claim_type: 'performance',
    evidence: 'Statistical model comparing user inputs against publicly available case outcome data',
    scope: 'Estimate only, not legal advice or guarantee; based on public data which excludes settlements; varies by state/case type; updated periodically, not real-time. GOVERNANCE: performance-type claim -- requires methodology disclosure on every surface',
    owner: 'ezLegal Engineering',
    surfaces: ['CasePredictor', 'OutcomePredictionWidget'],
    lastReviewed: '2026-02',
  },
  'case-predictor-sample-preview': {
    claim: 'Sample prediction report with illustrative data (hundreds of cases compared, 65-78% probability range)',
    claim_type: 'performance',
    evidence: 'Fictional example for marketing illustration; no real case data displayed; all values are representative, not measured',
    scope: 'Hero preview on CasePredictor page only; labeled "Illustrative Example" with disclaimer footer; does not represent actual system output or real case analysis',
    owner: 'ezLegal Marketing/Engineering',
    surfaces: ['CasePredictor'],
    lastReviewed: '2026-02',
  },
  'money-back-guarantee': {
    claim: '30-day money-back guarantee',
    claim_type: 'pricing',
    evidence: 'Refund policy implemented in checkout flow',
    scope: 'Applies to Issue Pack purchases; Stripe-processed refunds',
    owner: 'ezLegal Business',
    surfaces: ['IssuePacks', 'Checkout', 'Pricing'],
    lastReviewed: '2026-02',
  },
  'negotiation-preparation-stat': {
    claim: '73% of prepared negotiators get better outcomes',
    claim_type: 'performance',
    evidence: 'General negotiation research (Harvard PON, Malhotra & Bazerman); not an ezLegal-specific metric',
    scope: 'Industry research statistic, not an ezLegal performance claim. Refers to negotiation preparation in general, not to this specific tool. GOVERNANCE: must always include source attribution',
    owner: 'ezLegal Content',
    surfaces: ['Negotiate'],
    lastReviewed: '2026-02',
  },
  'anchoring-improvement-stat': {
    claim: '2-3x initial offer improvement from anchoring',
    claim_type: 'performance',
    evidence: 'General negotiation research on anchoring effects (Galinsky & Mussweiler, 2001); not an ezLegal-specific metric',
    scope: 'Academic research on anchoring technique effectiveness, not an ezLegal performance claim. Actual results vary by situation. GOVERNANCE: must always include source attribution',
    owner: 'ezLegal Content',
    surfaces: ['Negotiate'],
    lastReviewed: '2026-02',
  },
  '24-7-availability': {
    claim: '24/7 AI availability',
    claim_type: 'service',
    evidence: 'AI chatbot runs on Supabase + OpenAI API infrastructure; no business-hours restriction',
    scope: 'AI responses only; attorney matching and human support are business-hours only; subject to uptime SLA and API provider availability',
    owner: 'ezLegal Engineering',
    surfaces: ['Home', 'Features', 'ChannelLanding', 'ForBusiness'],
    lastReviewed: '2026-02',
  },
};

export const BANNED_PHRASES = [
  'attorney-approved',
  'bank-level security',
  'guaranteed results',
  '100% accurate',
  'always correct',
  'never wrong',
  'join thousands',
  'trusted by thousands',
  '10,000+ businesses',
  '50+ active partners',
  'serving 3x more',
  '29,000+ satisfied',
  '50k+ questions',
  '4.8/5',
  'save 80%',
];

export const DISCLAIMER_TERMS = [
  'attorney-client privilege',
  'guaranteed outcome',
];

export function getClaimEntry(key: string): ClaimEntry | undefined {
  return CLAIMS_REGISTRY[key];
}

export function getClaimSurfaces(key: string): string[] {
  return CLAIMS_REGISTRY[key]?.surfaces || [];
}

export function validateClaimText(text: string): string[] {
  const violations: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      violations.push(phrase);
    }
  }
  return violations;
}

```

---

## src/lib/intake/types.ts

```typescript
export type ICP = 'individual_es' | 'smb' | 'organization';

export type TriageRiskLevel = 'normal' | 'urgent' | 'emergency';

export type AffordabilityStatus = 'cannot_pay' | 'low_cost_needed' | 'can_pay';

export type HumanEscalationType =
  | 'legal_aid'
  | 'attorney_review'
  | 'partner_org'
  | 'emergency_resource';

export interface IntakeStep {
  id: string;
  titleEn: string;
  titleEs: string;
  requiresScopeBoundary: boolean;
  allowsCheckout: boolean;
  escalationTriggers?: TriageRiskLevel[];
}

export interface IntakeRouteDecision {
  icp: ICP;
  affordability: AffordabilityStatus;
  risk: TriageRiskLevel;
  destination: string;
  escalation?: HumanEscalationType;
  blockCheckout: boolean;
}

export interface IntakeSession {
  icp: ICP;
  currentStep: number;
  totalSteps: number;
  language: 'en' | 'es';
  affordability?: AffordabilityStatus;
  risk?: TriageRiskLevel;
  jurisdiction?: string;
  scopeBoundaryShown: boolean;
  completedAt?: string;
}

export interface SMBSegment {
  id: string;
  labelEn: string;
  labelEs: string;
  requiresAttorneyReview: boolean;
}

export interface OrgPartnerProfile {
  orgType: string;
  jurisdictions: string[];
  issueAreas: string[];
  languages: string[];
  intakeVolume: string;
  referralCapacity: string;
  dataNeeds: string;
  acceptsWarmReferrals: boolean;
  requiresConflictCheck: boolean;
}

export const SMB_SEGMENTS: SMBSegment[] = [
  { id: 'create_contract', labelEn: 'Create or update a contract', labelEs: 'Crear o actualizar un contrato', requiresAttorneyReview: false },
  { id: 'review_document', labelEn: 'Review a document', labelEs: 'Revisar un documento', requiresAttorneyReview: false },
  { id: 'recurring_docs', labelEn: 'Manage recurring legal documents', labelEs: 'Gestionar documentos legales recurrentes', requiresAttorneyReview: false },
  { id: 'attorney_review', labelEn: 'Need attorney review', labelEs: 'Necesito revisión de abogado', requiresAttorneyReview: true },
  { id: 'not_sure', labelEn: 'Not sure yet', labelEs: 'No estoy seguro todavía', requiresAttorneyReview: false },
];

export const ATTORNEY_REVIEW_TRIGGERS = [
  'employment_contract',
  'investor_funding',
  'litigation_dispute',
  'government_regulatory',
  'high_value_transaction',
] as const;

```

---

## src/lib/intake/routes.ts

```typescript
import type { ICP, IntakeStep, IntakeRouteDecision, AffordabilityStatus, TriageRiskLevel } from './types';

export const INTAKE_STEPS: Record<ICP, IntakeStep[]> = {
  individual_es: [
    { id: 'triage', titleEn: 'Triage', titleEs: 'Evaluación inicial', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'affordability', titleEn: 'Affordability', titleEs: 'Capacidad de pago', requiresScopeBoundary: false, allowsCheckout: false, escalationTriggers: ['emergency'] },
    { id: 'issue', titleEn: 'Issue type', titleEs: 'Tipo de problema', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'details', titleEn: 'Details', titleEs: 'Detalles', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'confirmation', titleEn: 'Next steps', titleEs: 'Próximos pasos', requiresScopeBoundary: true, allowsCheckout: true },
  ],
  smb: [
    { id: 'segment', titleEn: 'Business need', titleEs: 'Necesidad del negocio', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'details', titleEn: 'Details', titleEs: 'Detalles', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'review_option', titleEn: 'Review option', titleEs: 'Opción de revisión', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'acknowledgment', titleEn: 'Scope acknowledgment', titleEs: 'Reconocimiento de alcance', requiresScopeBoundary: true, allowsCheckout: true },
    { id: 'confirmation', titleEn: 'Confirmation', titleEs: 'Confirmación', requiresScopeBoundary: false, allowsCheckout: false },
  ],
  organization: [
    { id: 'org_type', titleEn: 'Organization type', titleEs: 'Tipo de organización', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'jurisdictions', titleEn: 'Jurisdictions', titleEs: 'Jurisdicciones', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'capacity', titleEn: 'Capacity', titleEs: 'Capacidad', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'data_consent', titleEn: 'Data consent', titleEs: 'Consentimiento de datos', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'confirmation', titleEn: 'Confirmation', titleEs: 'Confirmación', requiresScopeBoundary: false, allowsCheckout: false },
  ],
};

export function resolveIntakeRoute(
  icp: ICP,
  affordability: AffordabilityStatus,
  risk: TriageRiskLevel
): IntakeRouteDecision {
  if (risk === 'emergency') {
    return {
      icp,
      affordability,
      risk,
      destination: '/emergency-resources',
      escalation: 'emergency_resource',
      blockCheckout: true,
    };
  }

  if (icp === 'individual_es') {
    if (affordability === 'cannot_pay') {
      return {
        icp,
        affordability,
        risk,
        destination: '/pro-bono',
        escalation: 'legal_aid',
        blockCheckout: true,
      };
    }
    if (affordability === 'low_cost_needed') {
      return {
        icp,
        affordability,
        risk,
        destination: '/legal-safety-net',
        escalation: 'legal_aid',
        blockCheckout: false,
      };
    }
  }

  if (icp === 'smb') {
    return {
      icp,
      affordability,
      risk,
      destination: '/start?persona=business',
      escalation: risk === 'urgent' ? 'attorney_review' : undefined,
      blockCheckout: false,
    };
  }

  if (icp === 'organization') {
    return {
      icp,
      affordability,
      risk,
      destination: '/schedule-demo',
      escalation: 'partner_org',
      blockCheckout: true,
    };
  }

  return {
    icp,
    affordability,
    risk,
    destination: '/chat',
    blockCheckout: false,
  };
}

export function shouldRecommendAttorneyReview(segment: string): boolean {
  const triggers = ['employment_contract', 'investor_funding', 'litigation_dispute', 'government_regulatory', 'high_value_transaction'];
  return triggers.includes(segment);
}

```

---

## src/lib/intake/persistence.ts

```typescript
import { supabase } from '../supabase';
import type { ICP, AffordabilityStatus, TriageRiskLevel } from './types';

function getAnonymousSessionId(): string {
  const KEY = 'ez_anonymous_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function buildIdentity(userId: string | null) {
  return userId
    ? { user_id: userId, anonymous_session_id: null }
    : { user_id: null, anonymous_session_id: getAnonymousSessionId() };
}

export async function saveSpanishTriageSession(params: {
  jurisdiction: string | null;
  affordabilityStatus: AffordabilityStatus;
  riskLevel: TriageRiskLevel;
  hasDeadline: boolean;
  status?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('spanish_triage_sessions')
    .insert({
      ...identity,
      jurisdiction: params.jurisdiction,
      affordability_status: params.affordabilityStatus,
      risk_level: params.riskLevel,
      has_deadline: params.hasDeadline,
      status: params.status ?? 'completed',
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] saveSpanishTriageSession error:', error.message);
    return null;
  }
  return data;
}

export async function saveBusinessIntakeSession(params: {
  jurisdiction?: string | null;
  businessSegment: string;
  documentType?: string | null;
  attorneyReviewRecommended: boolean;
  scopeAcknowledged: boolean;
  status?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('business_intake_sessions')
    .insert({
      ...identity,
      jurisdiction: params.jurisdiction ?? null,
      business_segment: params.businessSegment,
      document_type: params.documentType ?? null,
      attorney_review_recommended: params.attorneyReviewRecommended,
      scope_acknowledged: params.scopeAcknowledged,
      status: params.status ?? 'completed',
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] saveBusinessIntakeSession error:', error.message);
    return null;
  }
  return data;
}

export async function saveOrganizationPartnerProfile(params: {
  orgType: string;
  jurisdictionsServed: string[];
  issueAreas: string[];
  languagesSupported: string[];
  intakeVolume: string;
  acceptsWarmReferrals: boolean;
  requiresConflictCheck: boolean;
  consentGiven: boolean;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('org_partner_profiles')
    .insert({
      ...identity,
      org_type: params.orgType,
      jurisdictions_served: params.jurisdictionsServed,
      issue_areas: params.issueAreas,
      languages_supported: params.languagesSupported,
      intake_volume: params.intakeVolume,
      accepts_warm_referrals: params.acceptsWarmReferrals,
      requires_conflict_check: params.requiresConflictCheck,
      consent_given: params.consentGiven,
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] saveOrganizationPartnerProfile error:', error.message);
    return null;
  }
  return data;
}

export async function createAttorneyReviewRequest(params: {
  businessSessionId?: string | null;
  businessSegment?: string;
  jurisdiction?: string | null;
  issueArea?: string;
  triggerReasons: string[];
  documentType?: string | null;
  urgency?: string;
  priceCents?: number | null;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('attorney_review_requests')
    .insert({
      ...identity,
      business_session_id: params.businessSessionId ?? null,
      business_segment: params.businessSegment ?? null,
      jurisdiction: params.jurisdiction ?? null,
      issue_area: params.issueArea ?? null,
      trigger_reasons: params.triggerReasons,
      document_type: params.documentType ?? null,
      urgency: params.urgency ?? 'normal',
      status: 'draft',
      price_cents: params.priceCents ?? null,
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] createAttorneyReviewRequest error:', error.message);
    return null;
  }
  return data;
}

export async function createReferralRoutingRecord(params: {
  triageSessionId?: string | null;
  partnerProfileId?: string | null;
  jurisdiction?: string | null;
  language?: string;
  issueArea?: string;
  affordabilityStatus?: string;
  riskLevel?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('referral_routing_records')
    .insert({
      ...identity,
      triage_session_id: params.triageSessionId ?? null,
      partner_profile_id: params.partnerProfileId ?? null,
      jurisdiction: params.jurisdiction ?? null,
      language: params.language ?? null,
      issue_area: params.issueArea ?? null,
      affordability_status: params.affordabilityStatus ?? null,
      risk_level: params.riskLevel ?? null,
      referral_status: 'new',
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] createReferralRoutingRecord error:', error.message);
    return null;
  }
  return data;
}

export async function recordConsent(params: {
  consentType: string;
  consentText: string;
  granted: boolean;
  icp?: ICP;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('intake_consent_records')
    .insert({
      ...identity,
      consent_type: params.consentType,
      consent_text: params.consentText,
      granted: params.granted,
      icp: params.icp ?? null,
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] recordConsent error:', error.message);
    return null;
  }
  return data;
}

export async function recordAuditEvent(params: {
  eventType: string;
  icp?: ICP;
  stepId?: string;
  jurisdiction?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { error } = await supabase
    .from('intake_audit_events')
    .insert({
      ...identity,
      event_type: params.eventType,
      icp: params.icp ?? null,
      step_id: params.stepId ?? null,
      jurisdiction: params.jurisdiction ?? null,
      language: params.language ?? null,
      metadata: params.metadata ?? {},
    });

  if (error) {
    console.error('[intake/persistence] recordAuditEvent error:', error.message);
  }
}

export async function getPartnerProfile(): Promise<{
  id: string;
  org_type: string;
  jurisdictions_served: string[];
  issue_areas: string[];
  languages_supported: string[];
  intake_volume: string;
  accepts_warm_referrals: boolean;
  requires_conflict_check: boolean;
  status: string;
} | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('org_partner_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] getPartnerProfile error:', error.message);
    return null;
  }
  return data;
}

export async function getPartnerReferrals(partnerProfileId: string): Promise<Array<{
  id: string;
  jurisdiction: string | null;
  language: string | null;
  issue_area: string | null;
  affordability_status: string | null;
  risk_level: string | null;
  referral_status: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('referral_routing_records')
    .select('id, jurisdiction, language, issue_area, affordability_status, risk_level, referral_status, created_at')
    .eq('partner_profile_id', partnerProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[intake/persistence] getPartnerReferrals error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function updateReferralStatus(referralId: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('referral_routing_records')
    .update({ referral_status: status })
    .eq('id', referralId);

  if (error) {
    console.error('[intake/persistence] updateReferralStatus error:', error.message);
    return false;
  }
  return true;
}

```

---

## src/lib/intake/recovery.ts

```typescript
/**
 * PRIVACY CONSTRAINT: Recovery state must NEVER store:
 * - Legal narratives or case descriptions
 * - Names, emails, phone numbers, addresses
 * - Document contents or uploaded file data
 * - Immigration status or financial details
 *
 * Only store the minimum needed to resume: ICP, step position,
 * language, and non-sensitive UI selections (e.g., category chosen).
 */

import type { ICP } from './types';

const RECOVERY_KEY = 'ez_intake_recovery';
const RECOVERY_TTL_HOURS = 72;

export interface RecoveryState {
  icp: ICP;
  stepId: string;
  stepIndex: number;
  language: string;
  savedAt: string;
  selections: {
    issueCategory?: string;
    jurisdiction?: string;
    businessSegment?: string;
    orgType?: string;
  };
}

export const RECOVERY_COPY = {
  en: {
    resumeBanner: 'You have saved progress. Would you like to continue where you left off?',
    resumeButton: 'Resume saved progress',
    clearButton: 'Start fresh',
    clearedMessage: 'Saved progress cleared.',
    expiryNote: 'Saved progress expires after 72 hours.',
  },
  es: {
    resumeBanner: 'Tiene progreso guardado. ¿Le gustaría continuar donde lo dejó?',
    resumeButton: 'Continuar progreso guardado',
    clearButton: 'Empezar de nuevo',
    clearedMessage: 'Progreso guardado eliminado.',
    expiryNote: 'El progreso guardado expira después de 72 horas.',
  },
} as const;

export function saveRecoveryState(state: RecoveryState): void {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function getRecoveryState(): RecoveryState | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as RecoveryState;
    if (isExpired(state.savedAt)) {
      clearRecoveryState();
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearRecoveryState(): void {
  localStorage.removeItem(RECOVERY_KEY);
}

export function hasRecoverableSession(): boolean {
  return getRecoveryState() !== null;
}

export function getRecoveryExpiration(): Date | null {
  const state = getRecoveryState();
  if (!state) return null;
  const savedAt = new Date(state.savedAt).getTime();
  return new Date(savedAt + RECOVERY_TTL_HOURS * 60 * 60 * 1000);
}

export function clearSavedProgress(): void {
  clearRecoveryState();
}

function isExpired(savedAt: string): boolean {
  const savedTime = new Date(savedAt).getTime();
  const hoursSince = (Date.now() - savedTime) / (1000 * 60 * 60);
  return hoursSince > RECOVERY_TTL_HOURS;
}

```

---

## src/lib/intake/security.ts

```typescript
import { supabase } from '../supabase';

export type SecurityCheckResult =
  | { ok: true; userId: string }
  | { ok: false; reason: string };

export type PartnerSecurityResult =
  | { ok: true; userId: string; partnerProfileId: string }
  | { ok: false; reason: string };

export async function requireAuthenticated(): Promise<SecurityCheckResult> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { ok: false, reason: 'not_authenticated' };
  }
  return { ok: true, userId: data.user.id };
}

export async function requirePartnerAccess(): Promise<PartnerSecurityResult> {
  const authCheck = await requireAuthenticated();
  if (!authCheck.ok) {
    return authCheck;
  }

  const { data: profile, error } = await supabase
    .from('org_partner_profiles')
    .select('id')
    .eq('user_id', authCheck.userId)
    .maybeSingle();

  if (error || !profile) {
    return { ok: false, reason: 'no_partner_profile' };
  }

  return { ok: true, userId: authCheck.userId, partnerProfileId: profile.id };
}

export async function requireReferralOwnership(referralId: string): Promise<PartnerSecurityResult> {
  const partnerCheck = await requirePartnerAccess();
  if (!partnerCheck.ok) {
    return partnerCheck;
  }

  const { data: referral, error } = await supabase
    .from('referral_routing_records')
    .select('id, partner_profile_id')
    .eq('id', referralId)
    .maybeSingle();

  if (error || !referral) {
    return { ok: false, reason: 'referral_not_found' };
  }

  if (referral.partner_profile_id !== partnerCheck.partnerProfileId) {
    return { ok: false, reason: 'referral_not_assigned_to_partner' };
  }

  return partnerCheck;
}

export async function requireRequestOwnership(requestId: string): Promise<SecurityCheckResult> {
  const authCheck = await requireAuthenticated();
  if (!authCheck.ok) {
    return authCheck;
  }

  const { data: request, error } = await supabase
    .from('attorney_review_requests')
    .select('id, user_id')
    .eq('id', requestId)
    .maybeSingle();

  if (error || !request) {
    return { ok: false, reason: 'request_not_found' };
  }

  if (request.user_id !== authCheck.userId) {
    return { ok: false, reason: 'request_not_owned_by_user' };
  }

  return authCheck;
}

```

---

## src/lib/intake/scopeBoundaries.ts

```typescript
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

```

---

## src/lib/intake/analytics.ts

```typescript
/**
 * PRIVACY CONSTRAINT: Analytics events must NEVER include:
 * - Full legal narratives or case descriptions
 * - Names, emails, phone numbers, street addresses
 * - Immigration status or financial account details
 * - Case-specific facts or uploaded document contents
 * - Any data that could identify a specific legal matter
 *
 * Only non-sensitive categorical metadata is permitted.
 */

import type { ICP } from './types';

export interface SanitizedAnalyticsPayload {
  event: string;
  anonymousSessionId?: string;
  icp?: ICP;
  stepId?: string;
  stepIndex?: number;
  totalSteps?: number;
  language?: string;
  issueCategory?: string;
  timestamp: string;
  elapsedMs?: number;
  completionStatus?: 'completed' | 'abandoned' | 'escalated';
  uiMetadata?: {
    deviceType?: 'mobile' | 'desktop';
    entryPoint?: string;
    variant?: string;
  };
}

export type IntakeEvent =
  | { event: 'intake_started'; icp: ICP; language: string }
  | { event: 'intake_step_completed'; icp: ICP; stepId: string; stepIndex: number; totalSteps: number }
  | { event: 'intake_completed'; icp: ICP; language: string; durationMs: number }
  | { event: 'intake_abandoned'; icp: ICP; lastStepId: string; stepIndex: number; totalSteps: number; durationMs: number }
  | { event: 'intake_emergency_detected'; icp: ICP; riskLevel: string }
  | { event: 'intake_scope_boundary_shown'; icp: ICP; context: string }
  | { event: 'intake_legal_aid_matched'; jurisdiction: string; matchCount: number; hasVerified: boolean }
  | { event: 'intake_attorney_review_recommended'; businessSegment: string; documentType: string | null; triggerReasons: string[] }
  | { event: 'intake_attorney_review_cta_clicked'; businessSegment: string; tierId: string }
  | { event: 'intake_attorney_review_declined'; businessSegment: string }
  | { event: 'intake_consent_recorded'; consentType: string; granted: boolean }
  | { event: 'intake_partner_profile_created'; orgType: string }
  | { event: 'intake_referral_routed'; jurisdiction: string | null; issueArea: string | null }
  | { event: 'intake_resume_attempted'; icp: ICP; stepId: string };

function sanitizePayload(payload: IntakeEvent): SanitizedAnalyticsPayload {
  const base: SanitizedAnalyticsPayload = {
    event: payload.event,
    timestamp: new Date().toISOString(),
  };

  if ('icp' in payload) base.icp = payload.icp;
  if ('stepId' in payload) base.stepId = payload.stepId;
  if ('stepIndex' in payload) base.stepIndex = payload.stepIndex;
  if ('totalSteps' in payload) base.totalSteps = payload.totalSteps;
  if ('language' in payload) base.language = payload.language;
  if ('durationMs' in payload) base.elapsedMs = payload.durationMs;
  if ('issueArea' in payload && payload.issueArea) base.issueCategory = payload.issueArea;

  if (payload.event === 'intake_completed') base.completionStatus = 'completed';
  if (payload.event === 'intake_abandoned') base.completionStatus = 'abandoned';
  if (payload.event === 'intake_emergency_detected') base.completionStatus = 'escalated';

  return base;
}

export function trackIntakeEvent(payload: IntakeEvent): void {
  const sanitized = sanitizePayload(payload);
  if (typeof window !== 'undefined' && 'dataLayer' in window) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push(sanitized);
  }
}

const INTAKE_START_KEY = 'ez_intake_start_ts';

export function markIntakeStart(): void {
  sessionStorage.setItem(INTAKE_START_KEY, Date.now().toString());
}

export function getIntakeDurationMs(): number {
  const start = sessionStorage.getItem(INTAKE_START_KEY);
  if (!start) return 0;
  return Date.now() - parseInt(start, 10);
}

export function clearIntakeStart(): void {
  sessionStorage.removeItem(INTAKE_START_KEY);
}

```

---

## src/lib/attorneyReview/index.ts

```typescript
export * from './types';
export * from './pricing';
export * from './requests';

```

---

## src/lib/attorneyReview/types.ts

```typescript
export type ReviewStatus =
  | 'draft'
  | 'submitted'
  | 'pending_conflict_check'
  | 'accepted_by_attorney'
  | 'declined'
  | 'in_review'
  | 'changes_requested'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type ReviewUrgency = 'standard' | 'expedited' | 'emergency';

export interface AttorneyReviewRequest {
  id: string;
  userId: string | null;
  anonymousSessionId: string | null;
  businessSegment: string;
  jurisdiction: string | null;
  issueArea: string | null;
  triggerReasons: string[];
  urgency: ReviewUrgency;
  documentType: string | null;
  status: ReviewStatus;
  priceCents: number | null;
  scopeAcknowledgedAt: string | null;
  assignedAttorneyId: string | null;
  attorneyAcceptedAt: string | null;
  completedAt: string | null;
  conflictCheckStatus: 'pending' | 'cleared' | 'flagged' | null;
  requestedTurnaround: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAcknowledgment {
  notLegalAdviceUntilReviewed: boolean;
  attorneyMayDecline: boolean;
  separateEngagement: boolean;
  noGuaranteedOutcome: boolean;
  timelinesAreEstimates: boolean;
  jurisdictionMayAffect: boolean;
}

export const REVIEW_ACKNOWLEDGMENT_TEXTS = {
  en: {
    notLegalAdviceUntilReviewed: 'I understand that documents generated by ezLegal are not legal advice until reviewed by a licensed attorney.',
    attorneyMayDecline: 'I understand that submitting a request does not guarantee attorney availability. An attorney may decline if it falls outside their expertise or involves a conflict.',
    separateEngagement: 'I understand that attorney review is a separate engagement. Attorney-client relationship terms depend on the attorney\'s own engagement terms, not ezLegal.',
    noGuaranteedOutcome: 'I understand that attorney review does not guarantee any particular legal outcome.',
    timelinesAreEstimates: 'I understand that turnaround times are estimates unless confirmed by the assigned attorney.',
    jurisdictionMayAffect: 'I understand that my jurisdiction may affect attorney availability and review scope.',
  },
  es: {
    notLegalAdviceUntilReviewed: 'Entiendo que los documentos generados por ezLegal no son asesoría legal hasta ser revisados por un abogado licenciado.',
    attorneyMayDecline: 'Entiendo que enviar una solicitud no garantiza la disponibilidad de un abogado. Un abogado puede rechazar si cae fuera de su experiencia o involucra un conflicto.',
    separateEngagement: 'Entiendo que la revisión de abogado es un compromiso separado. Los términos de la relación abogado-cliente dependen de los términos del abogado, no de ezLegal.',
    noGuaranteedOutcome: 'Entiendo que la revisión de abogado no garantiza ningún resultado legal en particular.',
    timelinesAreEstimates: 'Entiendo que los plazos de entrega son estimaciones a menos que sean confirmados por el abogado asignado.',
    jurisdictionMayAffect: 'Entiendo que mi jurisdicción puede afectar la disponibilidad del abogado y el alcance de la revisión.',
  },
} as const;

export interface ReviewStatusDisplay {
  label: string;
  description: string;
  color: string;
}

export const REVIEW_STATUS_DISPLAY: Record<ReviewStatus, ReviewStatusDisplay> = {
  draft: { label: 'Draft', description: 'Request started but not yet submitted', color: 'gray' },
  submitted: { label: 'Submitted', description: 'Request submitted, awaiting processing', color: 'blue' },
  pending_conflict_check: { label: 'Conflict Check', description: 'Awaiting conflict of interest clearance', color: 'amber' },
  accepted_by_attorney: { label: 'Accepted', description: 'Attorney accepted, review beginning', color: 'teal' },
  declined: { label: 'Declined', description: 'Attorney declined the request', color: 'red' },
  in_review: { label: 'In Review', description: 'Attorney actively reviewing document', color: 'blue' },
  changes_requested: { label: 'Changes Requested', description: 'Attorney requested additional information', color: 'amber' },
  completed: { label: 'Completed', description: 'Attorney review complete', color: 'green' },
  cancelled: { label: 'Cancelled', description: 'Request cancelled by user', color: 'red' },
  refunded: { label: 'Refunded', description: 'Payment refunded', color: 'slate' },
};

export const ATTORNEY_REVIEW_DISCLOSURES = {
  en: {
    headline: 'Important Information About Attorney Review',
    points: [
      'AI document generation is informational only — it is not legal advice.',
      'Attorney review is only provided after an attorney accepts your request.',
      'Submitting a request does not guarantee that an attorney will be available.',
      'Turnaround times are estimates. Actual timelines depend on attorney availability and case complexity.',
      'Attorney-client relationship terms are set by the reviewing attorney, not by ezLegal.',
      'Your jurisdiction may affect which attorneys are available to review your document.',
      'ezLegal is not a law firm and does not provide legal advice.',
    ],
    notIncluded: [
      'Ongoing legal representation',
      'Court filings or appearances',
      'Legal advice beyond the specific document reviewed',
      'Guarantee of legal outcome',
    ],
  },
  es: {
    headline: 'Información Importante Sobre la Revisión de Abogado',
    points: [
      'La generación de documentos por IA es solo informativa — no es asesoría legal.',
      'La revisión de abogado solo se proporciona después de que un abogado acepta su solicitud.',
      'Enviar una solicitud no garantiza que un abogado estará disponible.',
      'Los plazos de entrega son estimaciones. Los tiempos reales dependen de la disponibilidad del abogado y la complejidad del caso.',
      'Los términos de la relación abogado-cliente los establece el abogado revisor, no ezLegal.',
      'Su jurisdicción puede afectar qué abogados están disponibles para revisar su documento.',
      'ezLegal no es un bufete de abogados y no proporciona asesoría legal.',
    ],
    notIncluded: [
      'Representación legal continua',
      'Presentaciones o comparecencias en tribunal',
      'Asesoría legal más allá del documento específico revisado',
      'Garantía de resultado legal',
    ],
  },
} as const;

```

---

## src/lib/attorneyReview/requests.ts

```typescript
import { supabase } from '../supabase';
import type { AttorneyReviewRequest, ReviewUrgency } from './types';

function getAnonymousSessionId(): string {
  const KEY = 'ez_anonymous_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function createReviewRequest(params: {
  businessSegment: string;
  jurisdiction?: string | null;
  issueArea?: string | null;
  triggerReasons: string[];
  urgency: ReviewUrgency;
  documentType?: string | null;
  priceCents?: number | null;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const anonymousSessionId = userId ? null : getAnonymousSessionId();

  const { data, error } = await supabase
    .from('attorney_review_requests')
    .insert({
      user_id: userId,
      anonymous_session_id: anonymousSessionId,
      business_segment: params.businessSegment,
      jurisdiction: params.jurisdiction ?? null,
      issue_area: params.issueArea ?? null,
      trigger_reasons: params.triggerReasons,
      urgency: params.urgency,
      document_type: params.documentType ?? null,
      status: 'draft',
      price_cents: params.priceCents ?? null,
      metadata: {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[attorneyReview/requests] createReviewRequest error:', error.message);
    return null;
  }
  return data;
}

export async function submitReviewRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('attorney_review_requests')
    .update({ status: 'submitted', metadata: { submitted_at: new Date().toISOString() } })
    .eq('id', requestId)
    .eq('status', 'draft');

  if (error) {
    console.error('[attorneyReview/requests] submitReviewRequest error:', error.message);
    return false;
  }
  return true;
}

export async function acknowledgeScope(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('attorney_review_requests')
    .update({ scope_acknowledged_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) {
    console.error('[attorneyReview/requests] acknowledgeScope error:', error.message);
    return false;
  }
  return true;
}

export async function cancelReviewRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('attorney_review_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .in('status', ['draft', 'submitted']);

  if (error) {
    console.error('[attorneyReview/requests] cancelReviewRequest error:', error.message);
    return false;
  }
  return true;
}

export async function getUserReviewRequests(): Promise<AttorneyReviewRequest[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('attorney_review_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[attorneyReview/requests] getUserReviewRequests error:', error.message);
    return [];
  }

  return (data ?? []).map(mapDbToRequest);
}

export async function getReviewRequestById(id: string): Promise<AttorneyReviewRequest | null> {
  const { data, error } = await supabase
    .from('attorney_review_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('[attorneyReview/requests] getReviewRequestById error:', error?.message);
    return null;
  }

  return mapDbToRequest(data);
}

function mapDbToRequest(row: Record<string, unknown>): AttorneyReviewRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string | null,
    anonymousSessionId: row.anonymous_session_id as string | null,
    businessSegment: row.business_segment as string,
    jurisdiction: row.jurisdiction as string | null,
    issueArea: row.issue_area as string | null,
    triggerReasons: row.trigger_reasons as string[],
    urgency: row.urgency as ReviewUrgency,
    documentType: row.document_type as string | null,
    status: row.status as AttorneyReviewRequest['status'],
    priceCents: row.price_cents as number | null,
    scopeAcknowledgedAt: row.scope_acknowledged_at as string | null,
    assignedAttorneyId: row.assigned_attorney_id as string | null,
    attorneyAcceptedAt: row.attorney_accepted_at as string | null,
    completedAt: row.completed_at as string | null,
    conflictCheckStatus: row.conflict_check_status as AttorneyReviewRequest['conflictCheckStatus'],
    requestedTurnaround: row.requested_turnaround as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

```

---

## src/lib/attorneyReview/pricing.ts

```typescript
import type { ReviewUrgency } from './types';

export interface ReviewPricingTier {
  id: string;
  label: string;
  description: string;
  basePriceCents: number;
  urgencyMultiplier: Record<ReviewUrgency, number>;
  estimatedTurnaround: Record<ReviewUrgency, string>;
  includes: string[];
}

export const REVIEW_PRICING_TIERS: ReviewPricingTier[] = [
  {
    id: 'basic_review',
    label: 'Basic Document Review',
    description: 'Attorney reviews your document for completeness, accuracy, and identifies potential issues.',
    basePriceCents: 14900,
    urgencyMultiplier: { standard: 1.0, expedited: 1.5, emergency: 2.5 },
    estimatedTurnaround: { standard: '3-5 business days', expedited: '1-2 business days', emergency: 'Same day' },
    includes: [
      'Completeness check',
      'Accuracy verification',
      'Issue identification',
      'Brief written summary',
    ],
  },
  {
    id: 'detailed_review',
    label: 'Detailed Review with Recommendations',
    description: 'Comprehensive review with specific improvement recommendations and risk assessment.',
    basePriceCents: 29900,
    urgencyMultiplier: { standard: 1.0, expedited: 1.5, emergency: 2.5 },
    estimatedTurnaround: { standard: '5-7 business days', expedited: '2-3 business days', emergency: '1 business day' },
    includes: [
      'Everything in Basic Review',
      'Risk assessment',
      'Specific improvement recommendations',
      'Alternative clause suggestions',
      'Jurisdiction-specific notes',
    ],
  },
  {
    id: 'full_revision',
    label: 'Full Review and Revision',
    description: 'Attorney reviews and revises your document, returning a finalized version.',
    basePriceCents: 49900,
    urgencyMultiplier: { standard: 1.0, expedited: 1.5, emergency: 2.5 },
    estimatedTurnaround: { standard: '7-10 business days', expedited: '3-5 business days', emergency: '1-2 business days' },
    includes: [
      'Everything in Detailed Review',
      'Full document revision',
      'One round of follow-up questions',
      'Finalized document version',
    ],
  },
];

export function calculateReviewPrice(tierId: string, urgency: ReviewUrgency): number | null {
  const tier = REVIEW_PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;
  return Math.round(tier.basePriceCents * tier.urgencyMultiplier[urgency]);
}

export function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getEstimatedTurnaround(tierId: string, urgency: ReviewUrgency): string | null {
  const tier = REVIEW_PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;
  return tier.estimatedTurnaround[urgency];
}

```

---

## src/lib/legalAid/types.ts

```typescript
export type VerificationStatus = 'verified' | 'needs_verification' | 'unavailable';

export interface LegalAidOrganization {
  id: string;
  name: string;
  statesServed: string[];
  countiesServed?: string[];
  languages: string[];
  issueAreas: string[];
  eligibilityNotes: string;
  intakeUrl?: string;
  phone?: string;
  email?: string;
  acceptsReferrals: boolean;
  emergencyAvailable: boolean;
  emergencyExclusion?: boolean;
  lastVerifiedAt: string | null;
  sourceUrl: string | null;
  sourceLabel?: string;
  disclaimer?: string;
  status: VerificationStatus;
}

export interface LegalAidMatchParams {
  jurisdiction: string;
  county?: string;
  language: string;
  issueArea: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  affordabilityStatus: 'cannot_pay' | 'low_cost_needed' | 'can_pay';
}

export interface LegalAidMatchResult {
  organization: LegalAidOrganization;
  matchScore: number;
  matchReasons: string[];
}

export const LEGAL_AID_CAVEATS = {
  en: {
    availabilityNotGuaranteed: 'Availability is not guaranteed. Organizations may have waitlists or limited capacity.',
    eligibilityDetermined: 'Eligibility is determined by the organization, not by ezLegal.',
    emergencyNote: 'Emergency legal matters require immediate local emergency or legal help. Call 911 for immediate danger.',
    notProvider: 'ezLegal is not a legal-aid provider. We help you find organizations that may be able to assist.',
    verificationNote: 'Organization information may change. Contact the organization directly to confirm current services.',
  },
  es: {
    availabilityNotGuaranteed: 'La disponibilidad no está garantizada. Las organizaciones pueden tener listas de espera o capacidad limitada.',
    eligibilityDetermined: 'La elegibilidad es determinada por la organización, no por ezLegal.',
    emergencyNote: 'Los asuntos legales de emergencia requieren ayuda legal o de emergencia local inmediata. Llame al 911 en caso de peligro inmediato.',
    notProvider: 'ezLegal no es un proveedor de ayuda legal. Le ayudamos a encontrar organizaciones que puedan asistirle.',
    verificationNote: 'La información de las organizaciones puede cambiar. Contacte a la organización directamente para confirmar los servicios actuales.',
  },
} as const;

```

---

## src/lib/legalAid/matching.ts

```typescript
import type { LegalAidMatchParams, LegalAidMatchResult, LegalAidOrganization } from './types';
import { LEGAL_AID_DIRECTORY } from './directory';

export function matchLegalAidOrganizations(params: LegalAidMatchParams): LegalAidMatchResult[] {
  const results: LegalAidMatchResult[] = [];

  for (const org of LEGAL_AID_DIRECTORY) {
    if (org.status === 'unavailable') continue;

    let score = 0;
    const reasons: string[] = [];

    if (org.statesServed.includes(params.jurisdiction)) {
      score += 3;
      reasons.push('serves_jurisdiction');
    } else {
      continue;
    }

    if (params.county && org.countiesServed?.includes(params.county)) {
      score += 2;
      reasons.push('serves_county');
    }

    if (org.languages.includes(params.language)) {
      score += 2;
      reasons.push('supports_language');
    }

    if (params.language === 'es' && org.languages.includes('es')) {
      score += 1;
      reasons.push('spanish_priority');
    }

    if (org.issueAreas.includes(params.issueArea)) {
      score += 2;
      reasons.push('covers_issue_area');
    }

    if (params.urgency === 'emergency' && org.emergencyAvailable) {
      score += 3;
      reasons.push('emergency_available');
    }

    if (params.affordabilityStatus === 'cannot_pay' && org.acceptsReferrals) {
      score += 1;
      reasons.push('free_legal_aid');
    }

    if (org.acceptsReferrals) {
      score += 1;
      reasons.push('accepts_referrals');
    }

    if (org.status === 'verified') {
      score += 1;
      reasons.push('verified_organization');
    }

    if (org.lastVerifiedAt) {
      const daysSinceVerification = (Date.now() - new Date(org.lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceVerification < 90) {
        score += 1;
        reasons.push('recently_verified');
      }
    }

    if (score >= 5) {
      results.push({ organization: org, matchScore: score, matchReasons: reasons });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function getEmergencyResources(jurisdiction: string, language: string): LegalAidOrganization[] {
  return LEGAL_AID_DIRECTORY.filter(
    (org) =>
      org.emergencyAvailable &&
      !org.emergencyExclusion &&
      org.statesServed.includes(jurisdiction) &&
      org.languages.includes(language) &&
      org.status !== 'unavailable'
  );
}

export function hasVerifiedMatch(results: LegalAidMatchResult[]): boolean {
  return results.some((r) => r.organization.status === 'verified');
}

export function getNeedsVerificationCount(): number {
  return LEGAL_AID_DIRECTORY.filter((org) => org.status === 'needs_verification').length;
}

```

---

## src/lib/legalAid/directory.ts

```typescript
import type { LegalAidOrganization } from './types';

/**
 * Legal-aid directory data.
 * Status indicates verification level:
 * - verified: Information confirmed from public source
 * - needs_verification: Information may be outdated or unconfirmed
 * - unavailable: Organization may no longer operate or accept referrals
 *
 * IMPORTANT: Do not fabricate sourceUrl values. Set to null if unknown.
 * Do not invent organization names or contact info.
 */
export const LEGAL_AID_DIRECTORY: LegalAidOrganization[] = [
  {
    id: 'az-legal-aid-001',
    name: 'Community Legal Services (Arizona)',
    statesServed: ['AZ'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'debt', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Generally serves individuals at or below 125% of the federal poverty level.',
    phone: '(602) 258-3434',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Contact directly to confirm current intake availability and eligibility requirements.',
    status: 'needs_verification',
  },
  {
    id: 'az-legal-aid-002',
    name: 'Southern Arizona Legal Aid',
    statesServed: ['AZ'],
    countiesServed: ['Pima', 'Cochise', 'Graham', 'Greenlee', 'Santa Cruz'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'debt', 'immigration', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Serves southern Arizona counties.',
    phone: '(520) 623-9465',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Service area limited to southern Arizona. Contact directly for current availability.',
    status: 'needs_verification',
  },
  {
    id: 'ca-legal-aid-001',
    name: 'Legal Aid Foundation (California)',
    statesServed: ['CA'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'immigration', 'debt'],
    eligibilityNotes: 'Income-based eligibility. Covers Los Angeles County primarily.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Primarily serves Los Angeles County. Eligibility and services may vary.',
    status: 'needs_verification',
  },
  {
    id: 'tx-legal-aid-001',
    name: 'Texas RioGrande Legal Aid',
    statesServed: ['TX'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'immigration', 'debt', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Serves 68 counties in southwest Texas.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Serves southwest Texas counties only. Contact to confirm coverage area.',
    status: 'needs_verification',
  },
  {
    id: 'ny-legal-aid-001',
    name: 'Legal Aid Society (New York)',
    statesServed: ['NY'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'criminal', 'immigration', 'debt'],
    eligibilityNotes: 'Income-based eligibility. Serves New York City boroughs.',
    acceptsReferrals: true,
    emergencyAvailable: true,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Primarily serves NYC boroughs. Emergency assistance may be limited.',
    status: 'needs_verification',
  },
  {
    id: 'fl-legal-aid-001',
    name: 'Florida Legal Services',
    statesServed: ['FL'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'immigration', 'benefits', 'debt'],
    eligibilityNotes: 'Income-based eligibility. Statewide coverage.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Statewide organization. Services vary by location and capacity.',
    status: 'needs_verification',
  },
  {
    id: 'il-legal-aid-001',
    name: 'Legal Aid Chicago',
    statesServed: ['IL'],
    languages: ['en', 'es'],
    issueAreas: ['housing', 'family', 'employment', 'debt', 'benefits'],
    eligibilityNotes: 'Income-based eligibility. Serves Cook County primarily.',
    acceptsReferrals: true,
    emergencyAvailable: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'Organization website',
    disclaimer: 'Primarily serves Cook County. Contact for current eligibility criteria.',
    status: 'needs_verification',
  },
  {
    id: 'national-dv-001',
    name: 'National Domestic Violence Hotline',
    statesServed: ['AZ', 'CA', 'TX', 'NY', 'FL', 'IL'],
    languages: ['en', 'es'],
    issueAreas: ['family'],
    eligibilityNotes: 'No income requirement. Available 24/7 for anyone experiencing domestic violence.',
    phone: '1-800-799-7233',
    acceptsReferrals: false,
    emergencyAvailable: true,
    emergencyExclusion: false,
    lastVerifiedAt: null,
    sourceUrl: null,
    sourceLabel: 'National hotline',
    disclaimer: 'Crisis support hotline. Not a legal representation service.',
    status: 'needs_verification',
  },
];

```

---

