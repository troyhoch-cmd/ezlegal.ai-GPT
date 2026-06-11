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
