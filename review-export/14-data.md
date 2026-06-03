# ezLegal.ai Code Review - Data & Content

> Static data, copy, pricing, and configuration content.

Generated: 2026-06-03T00:51:49.857Z
Files included: 15

---

## src/data/safetyCopy.ts

```typescript
export const safetyCopy = {
  urgentStrip: {
    heading: { en: 'Urgent deadline or danger?', es: '¿Tiene una fecha límite o peligro urgente?' },
    examples: { en: 'Court papers, eviction, abuse, detention, deadline today/tomorrow, shutoff, lockout', es: 'Papeles de corte, desalojo, abuso, detención, plazo hoy/mañana, corte de servicios, cierre' },
    cta: { en: 'Get help now', es: 'Obtener ayuda ahora' },
  },
  inputSafety: {
    noSSN: { en: 'Do not share Social Security numbers, passwords, bank accounts, or full identity documents.', es: 'No comparta números de Seguro Social, contraseñas, cuentas bancarias ni documentos completos de identidad.' },
    notAdvice: { en: 'ezLegal provides legal information, not legal advice.', es: 'ezLegal provee información legal, no asesoría legal.' },
    urgentFallback: { en: 'If your issue involves a deadline, court papers, detention, abuse, eviction, or immediate danger, use', es: 'Si tu asunto involucra un plazo, papeles de corte, detención, abuso, desalojo o peligro inmediato, usa' },
    urgentLinkText: { en: 'urgent resources', es: 'recursos urgentes' },
  },
  trustNote: {
    en: 'Not a law firm. Not legal advice. We help you understand options, prepare documents, and connect with qualified help.',
    es: 'No somos un bufete. No es asesoría legal. Te ayudamos a entender opciones, preparar documentos y conectar con ayuda calificada.',
  },
  lawyerEscalation: {
    en: "If your situation may require a lawyer, we'll say so and help you find human help when available.",
    es: 'Si tu situación puede requerir un abogado, te lo diremos y te ayudaremos a encontrar ayuda humana cuando esté disponible.',
  },
  saveProgress: {
    en: 'Save and continue later — your progress is never lost.',
    es: 'Guarda y continúa después — tu progreso nunca se pierde.',
  },
};

```

---

## src/data/homepageContent.ts

```typescript
export interface BilingualText {
  en: string;
  es: string;
}

export interface HomepageHero {
  headline: BilingualText;
  subline: BilingualText;
  scopeLine: BilingualText;
  inputLabel: BilingualText;
  inputPlaceholder: BilingualText;
  inputAriaLabel: BilingualText;
  primaryCta: BilingualText;
  urgentPrompt: BilingualText;
  urgentLink: BilingualText;
  spanishReassurance: string;
}

export interface HomepageSMB {
  heading: BilingualText;
  description: BilingualText;
  capabilities: BilingualText[];
  primaryCta: BilingualText;
  secondaryCta: BilingualText;
  primaryHref: string;
  secondaryHref: string;
}

export interface HomepagePartner {
  heading: BilingualText;
  description: BilingualText;
  capabilities: BilingualText[];
  primaryCta: BilingualText;
  secondaryCta: BilingualText;
  primaryHref: string;
  secondaryHref: string;
}

export interface HomepageFinalCTA {
  heading: BilingualText;
  subline: BilingualText;
  primaryCta: BilingualText;
  spanishCta: string;
}

export const homepageHero: HomepageHero = {
  headline: {
    en: 'Free legal help tools in English or Spanish',
    es: 'Herramientas legales gratuitas en ingl\u00e9s o espa\u00f1ol',
  },
  subline: {
    en: 'Understand your options before you decide what to do next.',
    es: 'Entiende tus opciones antes de decidir qu\u00e9 hacer.',
  },
  scopeLine: {
    en: 'Not a law firm. Not legal advice. No account needed to start.',
    es: 'No es un bufete. No es asesor\u00eda legal. Sin necesidad de cuenta para empezar.',
  },
  inputLabel: {
    en: 'What legal problem do you need help with?',
    es: '\u00bfCon qu\u00e9 problema legal necesitas ayuda?',
  },
  inputPlaceholder: {
    en: 'I received eviction papers and have a deadline\u2026',
    es: 'Recib\u00ed papeles de desalojo y tengo un plazo\u2026',
  },
  inputAriaLabel: {
    en: 'Describe your legal situation',
    es: 'Describe tu situaci\u00f3n legal',
  },
  primaryCta: {
    en: 'Start free 2-minute checkup',
    es: 'Comenzar revisión gratis de 2 minutos',
  },
  urgentPrompt: {
    en: 'Need urgent help?',
    es: '\u00bfNecesitas ayuda urgente?',
  },
  urgentLink: {
    en: 'View emergency and deadline resources',
    es: 'Ver recursos de emergencia y plazos',
  },
  spanishReassurance: 'Puedes usar esta herramienta en espa\u00f1ol. No necesitas una cuenta para empezar.',
};

export const homepageSMB: HomepageSMB = {
  heading: {
    en: 'For small businesses',
    es: 'Para peque\u00f1os negocios',
  },
  description: {
    en: 'Get plain-language help with contracts, compliance, employment, leases, and business documents.',
    es: 'Obt\u00e9n ayuda en lenguaje sencillo con contratos, cumplimiento, empleo, arrendamientos y documentos de negocio.',
  },
  capabilities: [
    { en: 'Contracts and agreements', es: 'Contratos y acuerdos' },
    { en: 'Compliance and licensing', es: 'Cumplimiento y licencias' },
    { en: 'Employment issues', es: 'Problemas de empleo' },
    { en: 'Leases and vendor agreements', es: 'Arrendamientos y acuerdos con proveedores' },
    { en: 'Document preparation', es: 'Preparaci\u00f3n de documentos' },
    { en: 'Know when to talk to a lawyer', es: 'Saber cu\u00e1ndo hablar con un abogado' },
  ],
  primaryCta: {
    en: 'Check a business issue',
    es: 'Revisar un problema de negocio',
  },
  secondaryCta: {
    en: 'View SMB plans',
    es: 'Ver planes para negocios',
  },
  primaryHref: '/start?path=smb',
  secondaryHref: '/pricing',
};

export const homepagePartner: HomepagePartner = {
  heading: {
    en: 'For legal-aid and pro bono teams',
    es: 'Para equipos de ayuda legal y pro bono',
  },
  description: {
    en: 'Consent-based referrals, triage queues, partner capacity controls, bilingual intake, and exportable referral packets.',
    es: 'Referencias basadas en consentimiento, colas de triaje, controles de capacidad, intake bilingue y paquetes de referencia exportables.',
  },
  capabilities: [
    { en: 'Consent-based referrals', es: 'Referencias basadas en consentimiento' },
    { en: 'Triage queue', es: 'Cola de triaje' },
    { en: 'Urgency, language, and issue filters', es: 'Filtros de urgencia, idioma y asunto' },
    { en: 'Partner capacity controls', es: 'Controles de capacidad de socios' },
    { en: 'Referral export', es: 'Exportaci\u00f3n de referencias' },
    { en: 'Consent audit log', es: 'Registro de auditor\u00eda de consentimiento' },
  ],
  primaryCta: {
    en: 'View partner dashboard demo',
    es: 'Ver demo del panel de socios',
  },
  secondaryCta: {
    en: 'Talk to partnerships',
    es: 'Hablar con alianzas',
  },
  primaryHref: '/partner-dashboard-demo',
  secondaryHref: '/contact?subject=partnerships',
};

export const homepageFinalCTA: HomepageFinalCTA = {
  heading: {
    en: 'Tell us what happened.',
    es: 'Dinos qu\u00e9 pas\u00f3.',
  },
  subline: {
    en: 'Legal information, not legal advice. Start free, in English or Spanish. No sign-up needed.',
    es: 'Informaci\u00f3n legal, no asesor\u00eda legal. Comienza gratis, en ingl\u00e9s o espa\u00f1ol. Sin registro.',
  },
  primaryCta: {
    en: 'Ask a question',
    es: 'Hacer una pregunta',
  },
  spanishCta: 'Ayuda en espa\u00f1ol',
};

```

---

## src/data/audiencePaths.ts

```typescript
export type AudiencePath = 'legal-aid' | 'smb' | 'organizations';
export type Locale = 'en' | 'es';

interface BilingualText {
  en: string;
  es: string;
}

interface TopTask {
  label: BilingualText;
  route: string;
}

interface PathConfig {
  heroEyebrow: BilingualText;
  headline: BilingualText;
  subhead: BilingualText;
  primaryCTA: { label: BilingualText; route: string };
  secondaryCTA: { label: BilingualText; route: string };
  topTasks: TopTask[];
  whatHappensNext: { step: string; title: BilingualText; text: BilingualText }[];
  pricingExpectation: BilingualText;
  safetyReminders: BilingualText[];
  trustProof: BilingualText[];
}

export const audiencePaths: Record<AudiencePath, PathConfig> = {
  'legal-aid': {
    heroEyebrow: {
      en: 'Free legal help tools',
      es: 'Herramientas legales gratuitas',
    },
    headline: {
      en: 'Understand your legal options, step by step.',
      es: 'Entiende tus opciones legales, paso a paso.',
    },
    subhead: {
      en: 'AI-guided tools to help you figure out what to do next — in English or Spanish, at no cost.',
      es: 'Herramientas guiadas por IA para ayudarte a entender qué hacer — en inglés o español, sin costo.',
    },
    primaryCTA: {
      label: { en: 'Start a free legal checkup', es: 'Iniciar un chequeo legal gratis' },
      route: '/start?path=legal-aid',
    },
    secondaryCTA: {
      label: { en: 'Find urgent resources', es: 'Encontrar recursos urgentes' },
      route: '/urgent-resources',
    },
    topTasks: [
      { label: { en: 'Eviction or rent problem', es: 'Problema de desalojo o renta' }, route: '/start?path=legal-aid&issue=eviction' },
      { label: { en: 'Family or custody issue', es: 'Problema familiar o de custodia' }, route: '/start?path=legal-aid&issue=family' },
      { label: { en: 'Debt or collections', es: 'Deuda o cobros' }, route: '/start?path=legal-aid&issue=debt' },
      { label: { en: 'Immigration question', es: 'Pregunta de inmigración' }, route: '/start?path=legal-aid&issue=immigration' },
      { label: { en: 'Workers\u2019 rights', es: 'Derechos laborales' }, route: '/start?path=legal-aid&issue=employment' },
    ],
    whatHappensNext: [
      { step: '1', title: { en: 'Tell us what happened', es: 'Cuéntanos qué pasó' }, text: { en: 'Answer a few questions about your situation. No sign-up needed.', es: 'Responde algunas preguntas sobre tu situación. Sin necesidad de registrarte.' } },
      { step: '2', title: { en: 'Get a plain-language summary', es: 'Recibe un resumen en lenguaje sencillo' }, text: { en: 'See your options explained clearly, with next steps you can take.', es: 'Ve tus opciones explicadas claramente, con los pasos a seguir.' } },
      { step: '3', title: { en: 'Connect to help if needed', es: 'Conéctate con ayuda si es necesario' }, text: { en: 'Find legal aid, pro bono lawyers, or community resources near you.', es: 'Encuentra ayuda legal, abogados pro bono o recursos comunitarios cerca de ti.' } },
    ],
    pricingExpectation: {
      en: 'The legal checkup is always free. You will never be charged without seeing a price first.',
      es: 'El chequeo legal siempre es gratis. Nunca se te cobrará sin que veas un precio primero.',
    },
    safetyReminders: [
      { en: 'Do not enter Social Security numbers, account numbers, or immigration IDs.', es: 'No ingreses números de Seguro Social, números de cuenta o identificaciones de inmigración.' },
      { en: 'This is legal information, not legal advice. A lawyer has not reviewed your situation.', es: 'Esto es información legal, no asesoría legal. Un abogado no ha revisado tu situación.' },
      { en: 'If you are in immediate danger, call 911 or your local emergency number.', es: 'Si estás en peligro inmediato, llama al 911 o a tu número de emergencia local.' },
    ],
    trustProof: [
      { en: 'No account required to start', es: 'No se requiere cuenta para empezar' },
      { en: 'Available in English and Spanish', es: 'Disponible en inglés y español' },
      { en: 'Free legal-aid referrals included', es: 'Referencias legales gratuitas incluidas' },
      { en: 'Human help available when AI is not enough', es: 'Ayuda humana disponible cuando la IA no es suficiente' },
      { en: 'Your information is not shared without consent', es: 'Tu información no se comparte sin tu consentimiento' },
    ],
  },

  smb: {
    heroEyebrow: {
      en: 'Legal tools for small business',
      es: 'Herramientas legales para pequeñas empresas',
    },
    headline: {
      en: 'Handle legal tasks without a retainer.',
      es: 'Maneja tareas legales sin un anticipo.',
    },
    subhead: {
      en: 'Draft contracts, respond to disputes, and stay compliant — with optional lawyer review when you need it.',
      es: 'Redacta contratos, responde a disputas y mantente en cumplimiento — con revisión de abogado opcional cuando lo necesites.',
    },
    primaryCTA: {
      label: { en: 'Start business intake', es: 'Iniciar proceso empresarial' },
      route: '/start?path=smb',
    },
    secondaryCTA: {
      label: { en: 'See pricing', es: 'Ver precios' },
      route: '/pricing',
    },
    topTasks: [
      { label: { en: 'Review or draft a contract', es: 'Revisar o redactar un contrato' }, route: '/start?path=smb&issue=contracts' },
      { label: { en: 'Handle an employee issue', es: 'Manejar un problema laboral' }, route: '/start?path=smb&issue=employment' },
      { label: { en: 'Respond to a demand letter', es: 'Responder una carta de demanda' }, route: '/start?path=smb&issue=demand' },
      { label: { en: 'Prepare a lease or vendor agreement', es: 'Preparar un contrato de arrendamiento' }, route: '/start?path=smb&issue=lease' },
      { label: { en: 'Organize compliance deadlines', es: 'Organizar plazos de cumplimiento' }, route: '/start?path=smb&issue=compliance' },
    ],
    whatHappensNext: [
      { step: '1', title: { en: 'Describe your situation', es: 'Describe tu situación' }, text: { en: 'Tell us about the business issue. We ask targeted questions to narrow down your options.', es: 'Cuéntanos sobre el problema de tu negocio. Hacemos preguntas específicas para identificar tus opciones.' } },
      { step: '2', title: { en: 'Get an action plan', es: 'Recibe un plan de acción' }, text: { en: 'See a clear summary of what you can do yourself and where professional help may be needed.', es: 'Ve un resumen claro de lo que puedes hacer tú mismo y dónde puede ser necesaria ayuda profesional.' } },
      { step: '3', title: { en: 'Use tools or request review', es: 'Usa herramientas o solicita revisión' }, text: { en: 'Draft documents with AI, or request optional paid lawyer review before sending.', es: 'Redacta documentos con IA, o solicita revisión pagada opcional de un abogado antes de enviar.' } },
    ],
    pricingExpectation: {
      en: 'Self-guided tools start at $29/month. Lawyer review is optional and priced per document. You always see the cost before you pay.',
      es: 'Las herramientas autoguiadas empiezan en $29/mes. La revisión de abogado es opcional y se cobra por documento. Siempre ves el costo antes de pagar.',
    },
    safetyReminders: [
      { en: 'Do not enter employee Social Security numbers or sensitive financial account details.', es: 'No ingreses números de Seguro Social de empleados o detalles de cuentas financieras sensibles.' },
      { en: 'AI-generated documents are drafts. Have a lawyer review before signing or sending anything with legal consequences.', es: 'Los documentos generados por IA son borradores. Haz que un abogado los revise antes de firmar o enviar algo con consecuencias legales.' },
      { en: 'This is not legal advice. Results depend on your specific jurisdiction and circumstances.', es: 'Esto no es asesoría legal. Los resultados dependen de tu jurisdicción y circunstancias específicas.' },
    ],
    trustProof: [
      { en: 'No retainer or long-term contract', es: 'Sin anticipo ni contrato a largo plazo' },
      { en: 'See cost before you pay', es: 'Ve el costo antes de pagar' },
      { en: 'Cancel anytime', es: 'Cancela en cualquier momento' },
      { en: 'Optional lawyer review available', es: 'Revisión de abogado opcional disponible' },
      { en: 'Documents are your property', es: 'Los documentos son tu propiedad' },
    ],
  },

  organizations: {
    heroEyebrow: {
      en: 'For legal-aid and pro bono partners',
      es: 'Para organizaciones de ayuda legal y pro bono',
    },
    headline: {
      en: 'Extend your reach with AI-assisted triage.',
      es: 'Extiende tu alcance con triaje asistido por IA.',
    },
    subhead: {
      en: 'Help more people with referral-ready intake summaries, multilingual access, and configurable workflow tools.',
      es: 'Ayuda a más personas con resúmenes de admisión listos para referencia, acceso multilingüe y herramientas de flujo de trabajo configurables.',
    },
    primaryCTA: {
      label: { en: 'Request a partner pilot', es: 'Solicitar un piloto para socios' },
      route: '/for-organizations',
    },
    secondaryCTA: {
      label: { en: 'See how it works', es: 'Ver cómo funciona' },
      route: '/for-organizations#workflow',
    },
    topTasks: [
      { label: { en: 'Review triage summaries', es: 'Revisar resúmenes de triaje' }, route: '/for-organizations#triage' },
      { label: { en: 'Configure intake workflow', es: 'Configurar flujo de admisión' }, route: '/for-organizations#workflow' },
      { label: { en: 'Export referral packets', es: 'Exportar paquetes de referencia' }, route: '/for-organizations#export' },
      { label: { en: 'Multilingual issue spotting', es: 'Detección de problemas multilingüe' }, route: '/for-organizations#multilingual' },
    ],
    whatHappensNext: [
      { step: '1', title: { en: 'Client completes intake', es: 'El cliente completa la admisión' }, text: { en: 'Guided questions in English or Spanish, with urgency detection and crisis routing.', es: 'Preguntas guiadas en inglés o español, con detección de urgencia y enrutamiento de crisis.' } },
      { step: '2', title: { en: 'AI generates triage summary', es: 'La IA genera un resumen de triaje' }, text: { en: 'Structured summary with issue type, urgency, jurisdiction, and recommended next steps.', es: 'Resumen estructurado con tipo de problema, urgencia, jurisdicción y próximos pasos recomendados.' } },
      { step: '3', title: { en: 'Your team reviews and acts', es: 'Tu equipo revisa y actúa' }, text: { en: 'Accept referrals, assign cases, or export packets to your case management system.', es: 'Acepta referencias, asigna casos o exporta paquetes a tu sistema de gestión de casos.' } },
    ],
    pricingExpectation: {
      en: 'Partner pilots are free. Volume pricing available for organizations serving 100+ clients per month.',
      es: 'Los pilotos para socios son gratuitos. Precios por volumen disponibles para organizaciones que atienden más de 100 clientes por mes.',
    },
    safetyReminders: [
      { en: 'Client data is not shared with your organization without explicit consent.', es: 'Los datos del cliente no se comparten con tu organización sin consentimiento explícito.' },
      { en: 'AI summaries are triage aids, not legal conclusions. Attorney review is required before action.', es: 'Los resúmenes de IA son ayudas de triaje, no conclusiones legales. Se requiere revisión de abogado antes de actuar.' },
      { en: 'Referral consent is collected from the client before packet generation.', es: 'El consentimiento de referencia se recopila del cliente antes de generar el paquete.' },
    ],
    trustProof: [
      { en: 'Client consent required before sharing data', es: 'Se requiere consentimiento del cliente antes de compartir datos' },
      { en: 'No data used for AI training', es: 'Datos no utilizados para entrenamiento de IA' },
      { en: 'Configurable retention policies', es: 'Políticas de retención configurables' },
      { en: 'Audit log for all access', es: 'Registro de auditoría para todo acceso' },
      { en: 'Demo data clearly labeled', es: 'Datos de demostración claramente etiquetados' },
    ],
  },
};

export function getPathConfig(path: string | null): PathConfig {
  if (path === 'smb') return audiencePaths.smb;
  if (path === 'organizations') return audiencePaths.organizations;
  return audiencePaths['legal-aid'];
}

```

---

## src/data/practiceAreas.ts

```typescript
import {
  Landmark, Scale, Heart, Briefcase, Globe, Copyright,
  AlertTriangle, Home, Users, ScrollText
} from 'lucide-react';

export interface Subcategory {
  id: string;
  name: string;
}

export interface PracticeArea {
  id: string;
  name: string;
  icon: typeof Landmark;
  color: string;
  subcategories: Subcategory[];
}

export const practiceAreas: PracticeArea[] = [
  {
    id: 'bankruptcy',
    name: 'Bankruptcy',
    icon: Landmark,
    color: 'slate',
    subcategories: [
      { id: 'chapter-13-company-employed', name: 'Chapter 13 Filing - Company Employed Debtors' },
      { id: 'chapter-13-includes-filing-fee', name: 'Chapter 13 Filing - Includes Bankruptcy Court Filing Fee and Credit Report' },
      { id: 'chapter-13-national-average', name: 'Chapter 13 Filing - National Average' },
      { id: 'chapter-13-self-employed', name: 'Chapter 13 Filing - Self-Employed Debtors' },
      { id: 'chapter-13-motion-relief', name: 'Chapter 13 Motion for Relief' },
      { id: 'chapter-13-objection-plan', name: 'Chapter 13 Objection to Plan' },
      { id: 'chapter-13-presumptive-fee', name: 'Chapter 13 Presumptively Reasonable Fee' },
      { id: 'chapter-13-proof-claim', name: 'Chapter 13 Proof of Claim Review and Preparation' },
      { id: 'chapter-7-13-court-fee', name: 'Chapter 7 and Chapter 13 Bankruptcy Court Filing Fee' },
      { id: 'chapter-7-court-fee', name: 'Chapter 7 Bankruptcy Court Filing Fee' },
      { id: 'chapter-7-individual-below-median', name: 'Chapter 7 Filing - Individual and Below Median Income' },
      { id: 'chapter-7-married-above-median', name: 'Chapter 7 Filing - Married and Above Median Income' },
      { id: 'chapter-7-married-below-median', name: 'Chapter 7 Filing - Married and Below Median Income' },
      { id: 'chapter-7-no-assets', name: 'Chapter 7 Filing - No Assets' },
      { id: 'chapter-7-simple-normal', name: 'Chapter 7 Filing - Simple - Normal Employment - Less than 40 Creditors' },
      { id: 'chapter-7-with-creditors', name: 'Chapter 7 Filing - With Creditors' },
      { id: 'chapter-7-court-accounting', name: 'Chapter 7 Filing Including Court Accounting' },
      { id: 'chapter-7-involving-real-estate', name: 'Chapter 7 Filing Involving Real Estate' },
      { id: 'chapter-7-not-involving-real-estate', name: 'Chapter 7 Filing Not Involving Real Estate' },
      { id: 'chapter-7-motion-relief', name: 'Chapter 7 Motion for Relief' },
      { id: 'chapter-7-proof-claim', name: 'Chapter 7 Proof of Claim Review and Preparation' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'mediation-first', name: 'Mediation - First Session' },
      { id: 'mediation-second', name: 'Mediation - Second Session' },
      { id: 'response-final-cure', name: 'Response to Final Cure Payment' },
    ],
  },
  {
    id: 'criminal',
    name: 'Criminal',
    icon: Scale,
    color: 'red',
    subcategories: [
      { id: 'aggravated-assault', name: 'Aggravated Assault' },
      { id: 'aggravated-domestic-violence', name: 'Aggravated Domestic Violence' },
      { id: 'aggravated-dui', name: 'Aggravated DUI' },
      { id: 'animal-cruelty', name: 'Animal Cruelty' },
      { id: 'appeal', name: 'Appeal' },
      { id: 'arson', name: 'Arson' },
      { id: 'assault', name: 'Assault' },
      { id: 'bail-hearing', name: 'Bail Hearing' },
      { id: 'burglary', name: 'Burglary' },
      { id: 'child-abuse', name: 'Child Abuse' },
      { id: 'conspiracy', name: 'Conspiracy' },
      { id: 'disorderly-conduct', name: 'Disorderly Conduct' },
      { id: 'domestic-violence', name: 'Domestic Violence' },
      { id: 'drug-possession', name: 'Drug Possession' },
      { id: 'dui-first-offense', name: 'DUI - First Offense' },
      { id: 'dui-second-offense', name: 'DUI - Second Offense' },
      { id: 'expungement', name: 'Expungement' },
      { id: 'felony-defense', name: 'Felony Defense' },
      { id: 'fraud', name: 'Fraud' },
      { id: 'harassment', name: 'Harassment' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'juvenile-defense', name: 'Juvenile Defense' },
      { id: 'misdemeanor-defense', name: 'Misdemeanor Defense' },
      { id: 'probation-violation', name: 'Probation Violation' },
      { id: 'restraining-order', name: 'Restraining Order' },
      { id: 'robbery', name: 'Robbery' },
      { id: 'theft', name: 'Theft' },
      { id: 'traffic-violations', name: 'Traffic Violations' },
      { id: 'weapons-charges', name: 'Weapons Charges' },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    icon: Heart,
    color: 'rose',
    subcategories: [
      { id: 'adoption-agency', name: 'Adoptions - Agency Adoption' },
      { id: 'adoption-contested', name: 'Adoptions - Contested' },
      { id: 'adoption-direct-placement', name: 'Adoptions - Direct Placement' },
      { id: 'adoption-stepparent', name: 'Adoptions - Stepparent' },
      { id: 'alimony-modification', name: 'Alimony Modification' },
      { id: 'annulment', name: 'Annulment' },
      { id: 'child-custody', name: 'Child Custody' },
      { id: 'child-support', name: 'Child Support' },
      { id: 'child-support-modification', name: 'Child Support Modification' },
      { id: 'custody-modification', name: 'Custody Modification' },
      { id: 'divorce-contested', name: 'Divorce - Contested' },
      { id: 'divorce-uncontested', name: 'Divorce - Uncontested' },
      { id: 'domestic-partnership', name: 'Domestic Partnership' },
      { id: 'guardianship', name: 'Guardianship' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'legal-separation', name: 'Legal Separation' },
      { id: 'mediation', name: 'Mediation' },
      { id: 'name-change', name: 'Name Change' },
      { id: 'paternity', name: 'Paternity' },
      { id: 'prenuptial-agreement', name: 'Prenuptial Agreement' },
      { id: 'postnuptial-agreement', name: 'Postnuptial Agreement' },
      { id: 'protective-order', name: 'Protective Order' },
      { id: 'relocation', name: 'Relocation' },
      { id: 'visitation-rights', name: 'Visitation Rights' },
    ],
  },
  {
    id: 'general-practice',
    name: 'General Practice',
    icon: Briefcase,
    color: 'blue',
    subcategories: [
      { id: '501c3-formation', name: '501(c)(3) Formation' },
      { id: 'general-partnership', name: 'General Partnership Formation' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'llc-dissolution', name: 'LLC Dissolution' },
      { id: 'llc-formation', name: 'LLC Formation' },
      { id: 'business-contracts', name: 'Business Contracts' },
      { id: 'contract-review', name: 'Contract Review' },
      { id: 'corporate-formation', name: 'Corporate Formation' },
      { id: 'employment-agreement', name: 'Employment Agreement' },
      { id: 'independent-contractor', name: 'Independent Contractor Agreement' },
      { id: 'non-compete-agreement', name: 'Non-Compete Agreement' },
      { id: 'non-disclosure-agreement', name: 'Non-Disclosure Agreement' },
      { id: 'operating-agreement', name: 'Operating Agreement' },
      { id: 'partnership-agreement', name: 'Partnership Agreement' },
      { id: 'shareholder-agreement', name: 'Shareholder Agreement' },
    ],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    icon: Globe,
    color: 'sky',
    subcategories: [
      { id: 'b1-b2-visa', name: 'B-1/B-2 Nonimmigrant Visa' },
      { id: 'certificate-citizenship', name: 'Certificate of Citizenship' },
      { id: 'change-status-f1', name: 'Change of Status to F-1 Student' },
      { id: 'citizenship-application', name: 'Citizenship Application' },
      { id: 'daca-renewal', name: 'DACA Renewal' },
      { id: 'deportation-defense', name: 'Deportation Defense' },
      { id: 'eb-1-visa', name: 'EB-1 Visa' },
      { id: 'eb-2-visa', name: 'EB-2 Visa' },
      { id: 'eb-3-visa', name: 'EB-3 Visa' },
      { id: 'family-based-green-card', name: 'Family-Based Green Card' },
      { id: 'fiance-visa-k1', name: 'Fiance Visa (K-1)' },
      { id: 'green-card-renewal', name: 'Green Card Renewal' },
      { id: 'h1b-visa', name: 'H-1B Visa' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'l1-visa', name: 'L-1 Visa' },
      { id: 'naturalization', name: 'Naturalization' },
      { id: 'o-1-visa', name: 'O-1 Visa' },
      { id: 'removal-proceedings', name: 'Removal Proceedings' },
      { id: 'spousal-visa', name: 'Spousal Visa' },
      { id: 'travel-document', name: 'Travel Document' },
      { id: 'visa-appeal', name: 'Visa Appeal' },
      { id: 'work-permit', name: 'Work Permit (EAD)' },
    ],
  },
  {
    id: 'intellectual-property',
    name: 'Intellectual Property',
    icon: Copyright,
    color: 'teal',
    subcategories: [
      { id: 'appeal-brief', name: 'Appeal Brief' },
      { id: 'copyright-application', name: 'Copyright Application' },
      { id: 'design-patent', name: 'Design Patent Application' },
      { id: 'extended-search', name: 'Extended Search' },
      { id: 'foreign-filing', name: 'Foreign Filing' },
      { id: 'infringement-analysis', name: 'Infringement Analysis' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'licensing-agreement', name: 'Licensing Agreement' },
      { id: 'patent-application', name: 'Patent Application' },
      { id: 'patent-prosecution', name: 'Patent Prosecution' },
      { id: 'patent-search', name: 'Patent Search' },
      { id: 'trademark-application', name: 'Trademark Application' },
      { id: 'trademark-opposition', name: 'Trademark Opposition' },
      { id: 'trademark-renewal', name: 'Trademark Renewal' },
      { id: 'trademark-search', name: 'Trademark Search' },
      { id: 'trade-secret-protection', name: 'Trade Secret Protection' },
      { id: 'utility-patent', name: 'Utility Patent Application' },
    ],
  },
  {
    id: 'personal-injury',
    name: 'Personal Injury',
    icon: AlertTriangle,
    color: 'orange',
    subcategories: [
      { id: '3m-earplugs', name: '3M Combat Arms Earplugs, Version 2' },
      { id: 'accutane', name: 'Accutane' },
      { id: 'actos', name: 'Actos' },
      { id: 'auto-accidents', name: 'Auto Accidents' },
      { id: 'avandia', name: 'Avandia' },
      { id: 'bicycle-accidents', name: 'Bicycle Accidents' },
      { id: 'birth-injury', name: 'Birth Injury' },
      { id: 'brain-injury', name: 'Brain Injury' },
      { id: 'burn-injury', name: 'Burn Injury' },
      { id: 'construction-accidents', name: 'Construction Accidents' },
      { id: 'dog-bites', name: 'Dog Bites' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'medical-malpractice', name: 'Medical Malpractice' },
      { id: 'motorcycle-accidents', name: 'Motorcycle Accidents' },
      { id: 'nursing-home-abuse', name: 'Nursing Home Abuse' },
      { id: 'pedestrian-accidents', name: 'Pedestrian Accidents' },
      { id: 'premises-liability', name: 'Premises Liability' },
      { id: 'product-liability', name: 'Product Liability' },
      { id: 'slip-and-fall', name: 'Slip and Fall' },
      { id: 'spinal-cord-injury', name: 'Spinal Cord Injury' },
      { id: 'truck-accidents', name: 'Truck Accidents' },
      { id: 'workers-compensation', name: 'Workers Compensation' },
      { id: 'wrongful-death', name: 'Wrongful Death' },
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: Home,
    color: 'green',
    subcategories: [
      { id: 'landlord-tenant-consultation', name: 'Consultation on Landlord and Tenant Matters' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'commercial-lease', name: 'Prepare Commercial Lease' },
      { id: 'commercial-purchase', name: 'Commercial Property Purchase' },
      { id: 'commercial-sale', name: 'Commercial Property Sale' },
      { id: 'deed-preparation', name: 'Deed Preparation' },
      { id: 'easement-agreement', name: 'Easement Agreement' },
      { id: 'eviction', name: 'Eviction' },
      { id: 'foreclosure-defense', name: 'Foreclosure Defense' },
      { id: 'home-purchase', name: 'Home Purchase' },
      { id: 'home-sale', name: 'Home Sale' },
      { id: 'landlord-representation', name: 'Landlord Representation' },
      { id: 'lease-agreement', name: 'Lease Agreement' },
      { id: 'lease-review', name: 'Lease Review' },
      { id: 'property-dispute', name: 'Property Dispute' },
      { id: 'quiet-title', name: 'Quiet Title Action' },
      { id: 'refinance', name: 'Refinance' },
      { id: 'tenant-representation', name: 'Tenant Representation' },
      { id: 'title-search', name: 'Title Search' },
      { id: 'zoning-issues', name: 'Zoning Issues' },
    ],
  },
  {
    id: 'trusts-estates',
    name: 'Trusts & Estates',
    icon: Users,
    color: 'amber',
    subcategories: [
      { id: 'estate-plan-complex', name: 'Estate Plan - Complex' },
      { id: 'estate-plan-routine', name: 'Estate Plan - Routine' },
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'asset-protection-trust', name: 'Asset Protection Trust' },
      { id: 'charitable-trust', name: 'Charitable Trust' },
      { id: 'estate-administration', name: 'Estate Administration' },
      { id: 'estate-litigation', name: 'Estate Litigation' },
      { id: 'family-trust', name: 'Family Trust' },
      { id: 'generation-skipping-trust', name: 'Generation-Skipping Trust' },
      { id: 'irrevocable-trust', name: 'Irrevocable Trust' },
      { id: 'living-trust', name: 'Living Trust' },
      { id: 'medicaid-planning', name: 'Medicaid Planning' },
      { id: 'pet-trust', name: 'Pet Trust' },
      { id: 'power-of-attorney', name: 'Power of Attorney' },
      { id: 'revocable-trust', name: 'Revocable Trust' },
      { id: 'special-needs-trust', name: 'Special Needs Trust' },
      { id: 'spendthrift-trust', name: 'Spendthrift Trust' },
      { id: 'trust-amendment', name: 'Trust Amendment' },
      { id: 'trust-funding', name: 'Trust Funding' },
    ],
  },
  {
    id: 'wills-probate',
    name: 'Wills & Probate',
    icon: ScrollText,
    color: 'slate',
    subcategories: [
      { id: 'initial-consultation', name: 'Initial Consultation' },
      { id: 'basic-family-will', name: 'Prepare Basic Family Will Plan' },
      { id: 'basic-will', name: 'Prepare Basic Will Plan' },
      { id: 'complex-will', name: 'Prepare Complex Will' },
      { id: 'advance-directive', name: 'Advance Directive' },
      { id: 'codicil', name: 'Codicil' },
      { id: 'estate-inventory', name: 'Estate Inventory' },
      { id: 'healthcare-proxy', name: 'Healthcare Proxy' },
      { id: 'holographic-will', name: 'Holographic Will' },
      { id: 'living-will', name: 'Living Will' },
      { id: 'pour-over-will', name: 'Pour-Over Will' },
      { id: 'probate-administration', name: 'Probate Administration' },
      { id: 'probate-contested', name: 'Probate - Contested' },
      { id: 'probate-uncontested', name: 'Probate - Uncontested' },
      { id: 'small-estate-affidavit', name: 'Small Estate Affidavit' },
      { id: 'will-contest', name: 'Will Contest' },
      { id: 'will-review', name: 'Will Review' },
    ],
  },
];

```

---

## src/data/jurisdictions.ts

```typescript
export interface Jurisdiction {
  code: string;
  name: string;
  type: 'us-state' | 'federal' | 'territory' | 'international';
}

export interface JurisdictionGroup {
  label: string;
  options: Jurisdiction[];
}

export const US_STATES: Jurisdiction[] = [
  { code: 'AL', name: 'Alabama', type: 'us-state' },
  { code: 'AK', name: 'Alaska', type: 'us-state' },
  { code: 'AZ', name: 'Arizona', type: 'us-state' },
  { code: 'AR', name: 'Arkansas', type: 'us-state' },
  { code: 'CA', name: 'California', type: 'us-state' },
  { code: 'CO', name: 'Colorado', type: 'us-state' },
  { code: 'CT', name: 'Connecticut', type: 'us-state' },
  { code: 'DE', name: 'Delaware', type: 'us-state' },
  { code: 'FL', name: 'Florida', type: 'us-state' },
  { code: 'GA', name: 'Georgia', type: 'us-state' },
  { code: 'HI', name: 'Hawaii', type: 'us-state' },
  { code: 'ID', name: 'Idaho', type: 'us-state' },
  { code: 'IL', name: 'Illinois', type: 'us-state' },
  { code: 'IN', name: 'Indiana', type: 'us-state' },
  { code: 'IA', name: 'Iowa', type: 'us-state' },
  { code: 'KS', name: 'Kansas', type: 'us-state' },
  { code: 'KY', name: 'Kentucky', type: 'us-state' },
  { code: 'LA', name: 'Louisiana', type: 'us-state' },
  { code: 'ME', name: 'Maine', type: 'us-state' },
  { code: 'MD', name: 'Maryland', type: 'us-state' },
  { code: 'MA', name: 'Massachusetts', type: 'us-state' },
  { code: 'MI', name: 'Michigan', type: 'us-state' },
  { code: 'MN', name: 'Minnesota', type: 'us-state' },
  { code: 'MS', name: 'Mississippi', type: 'us-state' },
  { code: 'MO', name: 'Missouri', type: 'us-state' },
  { code: 'MT', name: 'Montana', type: 'us-state' },
  { code: 'NE', name: 'Nebraska', type: 'us-state' },
  { code: 'NV', name: 'Nevada', type: 'us-state' },
  { code: 'NH', name: 'New Hampshire', type: 'us-state' },
  { code: 'NJ', name: 'New Jersey', type: 'us-state' },
  { code: 'NM', name: 'New Mexico', type: 'us-state' },
  { code: 'NY', name: 'New York', type: 'us-state' },
  { code: 'NC', name: 'North Carolina', type: 'us-state' },
  { code: 'ND', name: 'North Dakota', type: 'us-state' },
  { code: 'OH', name: 'Ohio', type: 'us-state' },
  { code: 'OK', name: 'Oklahoma', type: 'us-state' },
  { code: 'OR', name: 'Oregon', type: 'us-state' },
  { code: 'PA', name: 'Pennsylvania', type: 'us-state' },
  { code: 'RI', name: 'Rhode Island', type: 'us-state' },
  { code: 'SC', name: 'South Carolina', type: 'us-state' },
  { code: 'SD', name: 'South Dakota', type: 'us-state' },
  { code: 'TN', name: 'Tennessee', type: 'us-state' },
  { code: 'TX', name: 'Texas', type: 'us-state' },
  { code: 'UT', name: 'Utah', type: 'us-state' },
  { code: 'VT', name: 'Vermont', type: 'us-state' },
  { code: 'VA', name: 'Virginia', type: 'us-state' },
  { code: 'WA', name: 'Washington', type: 'us-state' },
  { code: 'WV', name: 'West Virginia', type: 'us-state' },
  { code: 'WI', name: 'Wisconsin', type: 'us-state' },
  { code: 'WY', name: 'Wyoming', type: 'us-state' },
];

export const FEDERAL_JURISDICTIONS: Jurisdiction[] = [
  { code: 'FED', name: 'Federal (All Circuits)', type: 'federal' },
  { code: 'SCOTUS', name: 'U.S. Supreme Court', type: 'federal' },
  { code: '1CIR', name: '1st Circuit', type: 'federal' },
  { code: '2CIR', name: '2nd Circuit', type: 'federal' },
  { code: '3CIR', name: '3rd Circuit', type: 'federal' },
  { code: '4CIR', name: '4th Circuit', type: 'federal' },
  { code: '5CIR', name: '5th Circuit', type: 'federal' },
  { code: '6CIR', name: '6th Circuit', type: 'federal' },
  { code: '7CIR', name: '7th Circuit', type: 'federal' },
  { code: '8CIR', name: '8th Circuit', type: 'federal' },
  { code: '9CIR', name: '9th Circuit', type: 'federal' },
  { code: '10CIR', name: '10th Circuit', type: 'federal' },
  { code: '11CIR', name: '11th Circuit', type: 'federal' },
  { code: 'DCCIR', name: 'D.C. Circuit', type: 'federal' },
  { code: 'FEDCIR', name: 'Federal Circuit', type: 'federal' },
];

export const US_TERRITORIES: Jurisdiction[] = [
  { code: 'DC', name: 'District of Columbia', type: 'territory' },
  { code: 'PR', name: 'Puerto Rico', type: 'territory' },
  { code: 'GU', name: 'Guam', type: 'territory' },
  { code: 'VI', name: 'U.S. Virgin Islands', type: 'territory' },
  { code: 'AS', name: 'American Samoa', type: 'territory' },
  { code: 'MP', name: 'Northern Mariana Islands', type: 'territory' },
];

export const INTERNATIONAL_JURISDICTIONS: Jurisdiction[] = [
  { code: 'UK', name: 'United Kingdom', type: 'international' },
  { code: 'CA-CAN', name: 'Canada', type: 'international' },
  { code: 'AU', name: 'Australia', type: 'international' },
  { code: 'EU', name: 'European Union', type: 'international' },
  { code: 'DE', name: 'Germany', type: 'international' },
  { code: 'FR', name: 'France', type: 'international' },
  { code: 'JP', name: 'Japan', type: 'international' },
  { code: 'IN', name: 'India', type: 'international' },
  { code: 'BR', name: 'Brazil', type: 'international' },
  { code: 'MX', name: 'Mexico', type: 'international' },
];

export const JURISDICTION_GROUPS: JurisdictionGroup[] = [
  { label: 'Federal', options: FEDERAL_JURISDICTIONS },
  { label: 'U.S. States', options: US_STATES },
  { label: 'U.S. Territories', options: US_TERRITORIES },
  { label: 'International', options: INTERNATIONAL_JURISDICTIONS },
];

export const ALL_JURISDICTIONS: Jurisdiction[] = [
  ...FEDERAL_JURISDICTIONS,
  ...US_STATES,
  ...US_TERRITORIES,
  ...INTERNATIONAL_JURISDICTIONS,
];

export function getJurisdictionByCode(code: string): Jurisdiction | undefined {
  return ALL_JURISDICTIONS.find(j => j.code === code);
}

export function getJurisdictionName(code: string): string {
  const jurisdiction = getJurisdictionByCode(code);
  return jurisdiction?.name || code;
}

```

---

## src/data/pricing.ts

```typescript
export interface PricingPlan {
  id: string;
  name: { en: string; es: string };
  audience: 'individuals' | 'business' | 'legal-aid';
  price: { en: string; es: string };
  priceNote?: { en: string; es: string };
  description: { en: string; es: string };
  features: { en: string[]; es: string[] };
  ctaLabel: { en: string; es: string };
  ctaHref: string;
  recommended?: boolean;
  badge?: { en: string; es: string };
  ethicalNote?: { en: string; es: string };
  isFinalPrice: boolean;
  isAddOn?: boolean;
}

export interface PricingAudience {
  id: 'individuals' | 'business' | 'legal-aid';
  label: { en: string; es: string };
  headline: { en: string; es: string };
  subline?: { en: string; es: string };
  plans: PricingPlan[];
}

export const pricingAudiences: PricingAudience[] = [
  {
    id: 'individuals',
    label: { en: 'Individuals', es: 'Personas' },
    headline: { en: 'Legal clarity for you and your family', es: 'Claridad legal para ti y tu familia' },
    plans: [
      {
        id: 'free',
        name: { en: 'Free', es: 'Gratis' },
        audience: 'individuals',
        price: { en: '$0', es: '$0' },
        priceNote: { en: 'forever', es: 'siempre' },
        isFinalPrice: true,
        description: {
          en: 'For basic legal questions and safe next steps.',
          es: 'Para preguntas legales basicas y proximos pasos seguros.',
        },
        features: {
          en: [
            'Ask legal questions in English or Spanish',
            'Get plain-language explanations',
            'Understand common legal documents',
            'Find free or low-cost help',
            'Urgent-help links always free',
            'No credit card required',
          ],
          es: [
            'Haz preguntas legales en ingles o espanol',
            'Recibe explicaciones en lenguaje simple',
            'Entiende documentos legales comunes',
            'Encuentra ayuda gratuita o de bajo costo',
            'Enlaces de ayuda urgente siempre gratis',
            'Sin tarjeta de credito',
          ],
        },
        ctaLabel: { en: 'Start free', es: 'Comenzar gratis' },
        ctaHref: '/chat',
        ethicalNote: {
          en: 'No credit card required',
          es: 'Sin tarjeta de credito',
        },
      },
      {
        id: 'everyday-plus',
        name: { en: 'Everyday Plus', es: 'Diario Plus' },
        audience: 'individuals',
        price: { en: '$9/mo', es: '$9/mes' },
        isFinalPrice: false,
        recommended: true,
        description: {
          en: 'For people handling an active legal issue.',
          es: 'Para personas manejando un problema legal activo.',
        },
        features: {
          en: [
            'More questions per month',
            'More document analysis',
            'Next-step plans',
            'Save and organize matters',
            'Priority document processing',
            'Downloadable summaries for attorney review',
          ],
          es: [
            'Mas preguntas por mes',
            'Mas analisis de documentos',
            'Planes de proximos pasos',
            'Guarda y organiza asuntos',
            'Procesamiento prioritario de documentos',
            'Resumenes descargables para revision de abogado',
          ],
        },
        ctaLabel: { en: 'Get Everyday Plus', es: 'Obtener Diario Plus' },
        ctaHref: '/chat?plan=everyday-plus',
        ethicalNote: {
          en: 'Cancel anytime',
          es: 'Cancela cuando quieras',
        },
      },
      {
        id: 'family',
        name: { en: 'Family', es: 'Familia' },
        audience: 'individuals',
        price: { en: '$19/mo', es: '$19/mes' },
        isFinalPrice: false,
        description: {
          en: 'For households supporting multiple people.',
          es: 'Para hogares que apoyan a varias personas.',
        },
        features: {
          en: [
            'Multiple household matters',
            'Shared document organization',
            'Spanish and English support',
            'Family safety planning resources',
            'More monthly usage',
          ],
          es: [
            'Multiples asuntos del hogar',
            'Organizacion compartida de documentos',
            'Soporte en espanol e ingles',
            'Recursos de planificacion de seguridad familiar',
            'Mas uso mensual',
          ],
        },
        ctaLabel: { en: 'Choose Family', es: 'Elegir Familia' },
        ctaHref: '/chat?plan=family',
        ethicalNote: {
          en: 'Cancel anytime',
          es: 'Cancela cuando quieras',
        },
      },
      {
        id: 'boost',
        name: { en: 'Boost', es: 'Boost' },
        audience: 'individuals',
        price: { en: '$5', es: '$5' },
        priceNote: { en: 'one-time', es: 'unico pago' },
        isFinalPrice: false,
        isAddOn: true,
        description: {
          en: 'Need one urgent document or deadline?',
          es: 'Necesitas un documento urgente o fecha limite?',
        },
        features: {
          en: [
            'One-time document boost',
            'Faster processing',
            'Deadline checklist',
            'Referral-ready summary',
          ],
          es: [
            'Impulso de documento unico',
            'Procesamiento mas rapido',
            'Lista de fechas limite',
            'Resumen listo para referencia',
          ],
        },
        ctaLabel: { en: 'Buy Boost', es: 'Comprar Boost' },
        ctaHref: '/chat?plan=boost',
      },
    ],
  },
  {
    id: 'business',
    label: { en: 'Business', es: 'Negocios' },
    headline: { en: 'Legal clarity for your business', es: 'Claridad legal para tu negocio' },
    subline: {
      en: 'Spend less time sorting legal questions before they become expensive.',
      es: 'Dedica menos tiempo a resolver preguntas legales antes de que se vuelvan costosas.',
    },
    plans: [
      {
        id: 'business-starter',
        name: { en: 'Business Starter', es: 'Negocio Inicial' },
        audience: 'business',
        price: { en: '$29/mo', es: '$29/mes' },
        isFinalPrice: false,
        recommended: true,
        description: {
          en: 'For solo owners and small teams.',
          es: 'Para duenos individuales y equipos pequenos.',
        },
        features: {
          en: [
            'Contract and document summaries',
            'Compliance checklists',
            'Dispute prep',
            'Employment and vendor issue spotting',
            'Save business matters',
          ],
          es: [
            'Resumenes de contratos y documentos',
            'Listas de cumplimiento',
            'Preparacion de disputas',
            'Deteccion de problemas laborales y de proveedores',
            'Guarda asuntos de negocio',
          ],
        },
        ctaLabel: { en: 'Start Business', es: 'Comenzar Negocio' },
        ctaHref: '/signup?plan=business-starter',
        ethicalNote: {
          en: 'Cancel anytime',
          es: 'Cancela cuando quieras',
        },
      },
      {
        id: 'business-plus',
        name: { en: 'Business Plus', es: 'Negocio Plus' },
        audience: 'business',
        price: { en: '$79/mo', es: '$79/mes' },
        isFinalPrice: false,
        description: {
          en: 'For recurring legal workflows and team use.',
          es: 'Para flujos legales recurrentes y uso de equipo.',
        },
        features: {
          en: [
            'More document volume',
            'Team access',
            'Matter organization',
            'Policy and contract review workflows',
            'Referral-ready packets',
          ],
          es: [
            'Mayor volumen de documentos',
            'Acceso de equipo',
            'Organizacion de asuntos',
            'Flujos de revision de politicas y contratos',
            'Paquetes listos para referencia',
          ],
        },
        ctaLabel: { en: 'Choose Business Plus', es: 'Elegir Negocio Plus' },
        ctaHref: '/signup?plan=business-plus',
        ethicalNote: {
          en: 'Cancel anytime',
          es: 'Cancela cuando quieras',
        },
      },
      {
        id: 'business-pro',
        name: { en: 'Business Pro', es: 'Negocio Pro' },
        audience: 'business',
        price: { en: 'Custom', es: 'Personalizado' },
        isFinalPrice: true,
        description: {
          en: 'Professional referral workflows, admin controls, and integrations.',
          es: 'Flujos de referencia profesional, controles admin e integraciones.',
        },
        features: {
          en: [
            'Referral workflows when professional help is appropriate',
            'Admin controls',
            'Reporting',
            'Priority support',
            'Integration options',
          ],
          es: [
            'Flujos de referencia cuando se necesita ayuda profesional',
            'Controles administrativos',
            'Reportes',
            'Soporte prioritario',
            'Opciones de integracion',
          ],
        },
        ctaLabel: { en: 'Talk to us', es: 'Contactanos' },
        ctaHref: '/schedule-demo',
      },
    ],
  },
  {
    id: 'legal-aid',
    label: { en: 'Legal Aid', es: 'Ayuda Legal' },
    headline: { en: 'Expand access to justice', es: 'Ampliar el acceso a la justicia' },
    subline: {
      en: 'People seeking legal-aid help are not monetized. Sponsored and coalition models help expand access.',
      es: 'Las personas que buscan ayuda legal no son monetizadas. Los modelos patrocinados y de coalición ayudan a ampliar el acceso.',
    },
    plans: [
      {
        id: 'verified-legal-aid',
        name: { en: 'Verified Legal Aid', es: 'Ayuda Legal Verificada' },
        audience: 'legal-aid',
        price: { en: 'Free / Sponsored', es: 'Gratis / Patrocinado' },
        isFinalPrice: true,
        badge: { en: 'Best place to start', es: 'Mejor para empezar' },
        description: {
          en: 'For qualified legal-aid and pro bono teams.',
          es: 'Para equipos calificados de ayuda legal y pro bono.',
        },
        features: {
          en: [
            'Intake and triage support',
            'Multilingual self-help workflows',
            'Document summaries',
            'Referral routing',
            'Safety and urgent-help flows',
          ],
          es: [
            'Soporte de admision y triaje',
            'Flujos de autoayuda multilingues',
            'Resumenes de documentos',
            'Enrutamiento de referencias',
            'Flujos de seguridad y ayuda urgente',
          ],
        },
        ctaLabel: { en: 'Apply for access', es: 'Solicitar acceso' },
        ctaHref: '/pro-bono',
        ethicalNote: {
          en: 'No cost for qualified organizations',
          es: 'Sin costo para organizaciones calificadas',
        },
      },
      {
        id: 'coalition',
        name: { en: 'Coalition', es: 'Coalicion' },
        audience: 'legal-aid',
        price: { en: 'Custom', es: 'Personalizado' },
        isFinalPrice: true,
        badge: { en: 'Best for networks', es: 'Mejor para redes' },
        description: {
          en: 'For regional networks, bar associations, clinics, and nonprofits.',
          es: 'Para redes regionales, colegios de abogados, clinicas y organizaciones sin fines de lucro.',
        },
        features: {
          en: [
            'Multi-organization routing',
            'Shared referral workflows',
            'Aggregated reporting',
            'Spanish-first access campaigns',
            'Configurable issue areas',
          ],
          es: [
            'Enrutamiento multi-organizacional',
            'Flujos de referencia compartidos',
            'Reportes agregados',
            'Campanas de acceso en espanol primero',
            'Areas de problemas configurables',
          ],
        },
        ctaLabel: { en: 'Build a coalition', es: 'Construir una coalicion' },
        ctaHref: '/schedule-demo',
      },
      {
        id: 'enterprise-gov',
        name: { en: 'Enterprise / Government', es: 'Empresa / Gobierno' },
        audience: 'legal-aid',
        price: { en: 'Custom', es: 'Personalizado' },
        isFinalPrice: true,
        description: {
          en: 'For funders, courts, agencies, and large service networks.',
          es: 'Para financiadores, tribunales, agencias y grandes redes de servicios.',
        },
        features: {
          en: [
            'Secure deployment options',
            'Audit and reporting',
            'Human-review workflows',
            'Custom content and jurisdiction routing',
            'Implementation support',
          ],
          es: [
            'Opciones de implementacion segura',
            'Auditoria y reportes',
            'Flujos de revision humana',
            'Contenido personalizado y enrutamiento jurisdiccional',
            'Soporte de implementacion',
          ],
        },
        ctaLabel: { en: 'Schedule a pilot', es: 'Programar un piloto' },
        ctaHref: '/schedule-demo',
      },
    ],
  },
];

export const pricingFAQ = [
  {
    q: { en: 'Is ezLegal.ai a lawyer?', es: 'Es ezLegal.ai un abogado?' },
    a: {
      en: 'No. ezLegal.ai is an AI-powered legal information tool. We help you understand legal situations, documents, and next steps, but we are not a law firm and do not provide legal advice or representation.',
      es: 'No. ezLegal.ai es una herramienta de informacion legal impulsada por IA. Te ayudamos a entender situaciones legales, documentos y proximos pasos, pero no somos un bufete de abogados y no proporcionamos asesoramiento ni representacion legal.',
    },
  },
  {
    q: { en: 'Is this legal advice?', es: 'Esto es asesoramiento legal?' },
    a: {
      en: 'No. We provide legal information in plain language. For legal advice specific to your situation, consult a licensed attorney. We can help you prepare for that conversation.',
      es: 'No. Proporcionamos informacion legal en lenguaje simple. Para asesoramiento legal especifico a tu situacion, consulta con un abogado licenciado. Podemos ayudarte a prepararte para esa conversacion.',
    },
  },
  {
    q: { en: 'What is free?', es: 'Que es gratis?' },
    a: {
      en: 'Basic legal questions, plain-language explanations, understanding common documents, finding free or low-cost help, and all urgent-help resources are completely free. No credit card needed.',
      es: 'Las preguntas legales basicas, explicaciones en lenguaje simple, entender documentos comunes, encontrar ayuda gratuita o de bajo costo, y todos los recursos de ayuda urgente son completamente gratis. Sin tarjeta de credito.',
    },
  },
  {
    q: { en: 'Do you support Spanish?', es: 'Ofrecen soporte en espanol?' },
    a: {
      en: 'Yes. ezLegal.ai works in both English and Spanish. You can ask questions, upload documents, and get guidance in either language.',
      es: 'Si. ezLegal.ai funciona en ingles y espanol. Puedes hacer preguntas, subir documentos y recibir orientacion en cualquier idioma.',
    },
  },
  {
    q: { en: 'Can I get help from a real lawyer?', es: 'Puedo obtener ayuda de un abogado real?' },
    a: {
      en: 'Yes. When you need professional legal help, we can connect you with legal aid organizations, pro bono services, or vetted attorneys in your area.',
      es: 'Si. Cuando necesitas ayuda legal profesional, podemos conectarte con organizaciones de ayuda legal, servicios pro bono, o abogados verificados en tu area.',
    },
  },
  {
    q: { en: 'How do legal-aid organizations use this?', es: 'Como usan esto las organizaciones de ayuda legal?' },
    a: {
      en: 'Legal-aid organizations can use ezLegal.ai for intake support, multilingual self-help tools, document review, triage, and referral routing. Qualified organizations may access these tools at no cost.',
      es: 'Las organizaciones de ayuda legal pueden usar ezLegal.ai para soporte de admision, herramientas de autoayuda multilingues, revision de documentos, triaje y enrutamiento de referencias. Las organizaciones calificadas pueden acceder sin costo.',
    },
  },
  {
    q: { en: 'Are urgent-help resources free?', es: 'Son gratis los recursos de ayuda urgente?' },
    a: {
      en: 'Always. Safety information, crisis hotlines, legal-aid finder, and urgent-help resources are never behind a paywall.',
      es: 'Siempre. La informacion de seguridad, lineas de crisis, buscador de ayuda legal y recursos de ayuda urgente nunca estan detras de un muro de pago.',
    },
  },
  {
    q: { en: 'How do referrals work?', es: 'Como funcionan las referencias?' },
    a: {
      en: 'Free legal-aid referrals are based on your needs and location. Paid professional referrals, if available, are clearly labeled and must meet our suitability and ethics standards. We never rank free help by who pays us.',
      es: 'Las referencias gratuitas de ayuda legal se basan en tus necesidades y ubicacion. Las referencias profesionales de pago, si estan disponibles, estan claramente etiquetadas y deben cumplir nuestros estandares de idoneidad y etica.',
    },
  },
];

export const comparisonFeatures = [
  { key: 'questions', en: 'Questions per month', es: 'Preguntas por mes' },
  { key: 'documents', en: 'Document analysis', es: 'Analisis de documentos' },
  { key: 'matters', en: 'Saved matters', es: 'Asuntos guardados' },
  { key: 'spanish', en: 'Spanish support', es: 'Soporte en espanol' },
  { key: 'summaries', en: 'Referral-ready summaries', es: 'Resumenes para referencia' },
  { key: 'priority', en: 'Priority processing', es: 'Procesamiento prioritario' },
  { key: 'team', en: 'Team access', es: 'Acceso de equipo' },
  { key: 'org', en: 'Organization workflows', es: 'Flujos organizacionales' },
  { key: 'support', en: 'Support level', es: 'Nivel de soporte' },
];

export const comparisonData: Record<string, Record<string, { en: string; es: string }>> = {
  free: {
    questions: { en: '10/month', es: '10/mes' },
    documents: { en: '3/month', es: '3/mes' },
    matters: { en: '1', es: '1' },
    spanish: { en: 'Yes', es: 'Si' },
    summaries: { en: '--', es: '--' },
    priority: { en: '--', es: '--' },
    team: { en: '--', es: '--' },
    org: { en: '--', es: '--' },
    support: { en: 'Community', es: 'Comunidad' },
  },
  'everyday-plus': {
    questions: { en: '100/month', es: '100/mes' },
    documents: { en: '20/month', es: '20/mes' },
    matters: { en: '10', es: '10' },
    spanish: { en: 'Yes', es: 'Si' },
    summaries: { en: 'Yes', es: 'Si' },
    priority: { en: 'Yes', es: 'Si' },
    team: { en: '--', es: '--' },
    org: { en: '--', es: '--' },
    support: { en: 'Email', es: 'Correo' },
  },
  family: {
    questions: { en: '200/month', es: '200/mes' },
    documents: { en: '40/month', es: '40/mes' },
    matters: { en: '25', es: '25' },
    spanish: { en: 'Yes', es: 'Si' },
    summaries: { en: 'Yes', es: 'Si' },
    priority: { en: 'Yes', es: 'Si' },
    team: { en: 'Household', es: 'Hogar' },
    org: { en: '--', es: '--' },
    support: { en: 'Priority email', es: 'Correo prioritario' },
  },
};

```

---

## src/data/trustSignals.ts

```typescript
export interface TrustSignal {
  id: string;
  text: { en: string; es: string };
  icon: string;
}

export const heroTrustItems: TrustSignal[] = [
  {
    id: 'free-to-start',
    text: { en: 'Free to start', es: 'Gratis para comenzar' },
    icon: 'CheckCircle',
  },
  {
    id: 'bilingual',
    text: { en: 'English and Spanish', es: 'Ingl\u00e9s y espa\u00f1ol' },
    icon: 'Globe',
  },
  {
    id: 'not-law-firm',
    text: { en: 'Not a law firm / not legal advice', es: 'No es bufete / no es asesor\u00eda legal' },
    icon: 'AlertCircle',
  },
  {
    id: 'privacy-first',
    text: { en: 'Privacy-first / no sensitive IDs requested', es: 'Privacidad primero / no pedimos IDs sensibles' },
    icon: 'Lock',
  },
];

export const trustStripClaims: TrustSignal[] = [
  {
    id: 'not-law-firm',
    text: { en: 'Not a law firm', es: 'No somos un bufete' },
    icon: 'AlertCircle',
  },
  {
    id: 'legal-info-not-advice',
    text: { en: 'Legal information, not legal advice', es: 'Informaci\u00f3n legal, no asesor\u00eda legal' },
    icon: 'Info',
  },
  {
    id: 'privacy-first',
    text: { en: 'Privacy-first intake', es: 'Intake con privacidad primero' },
    icon: 'Lock',
  },
  {
    id: 'human-help',
    text: { en: 'Human help options', es: 'Opciones de ayuda humana' },
    icon: 'Users',
  },
  {
    id: 'bilingual-support',
    text: { en: 'Spanish and English support', es: 'Soporte en espa\u00f1ol e ingl\u00e9s' },
    icon: 'Globe',
  },
];

export const riskReducers: TrustSignal[] = [
  {
    id: 'save-progress',
    text: { en: 'Save your progress', es: 'Guarda tu progreso' },
    icon: 'Bookmark',
  },
  {
    id: 'plain-language',
    text: { en: 'Plain-language explanations', es: 'Explicaciones en lenguaje simple' },
    icon: 'MessageSquare',
  },
  {
    id: 'spanish-first',
    text: { en: 'Spanish-first support', es: 'Soporte en espa\u00f1ol' },
    icon: 'Globe',
  },
  {
    id: 'human-review',
    text: { en: 'Human review available', es: 'Revisi\u00f3n humana disponible' },
    icon: 'UserCheck',
  },
  {
    id: 'no-retainer',
    text: { en: 'No retainer required', es: 'Sin anticipo requerido' },
    icon: 'Shield',
  },
  {
    id: 'encrypted',
    text: { en: 'Private and encrypted', es: 'Privado y cifrado' },
    icon: 'Lock',
  },
];

```

---

## src/data/icpRoutes.ts

```typescript
export interface ICPRoute {
  id: 'personal' | 'business' | 'partner';
  heading: { en: string; es: string };
  description: { en: string; es: string };
  cta: { en: string; es: string };
  href: string;
  iconName: string;
  accentColor: string;
}

export const icpRoutes: ICPRoute[] = [
  {
    id: 'personal',
    heading: { en: 'I need legal help for myself', es: 'Necesito ayuda legal para mí' },
    description: { en: 'Eviction, debt, court papers, family, immigration, benefits, or other personal legal issues.', es: 'Desalojo, deudas, papeles de corte, familia, inmigración, beneficios u otros problemas legales personales.' },
    cta: { en: 'Start personal intake', es: 'Iniciar intake personal' },
    href: '/start',
    iconName: 'Heart',
    accentColor: 'teal',
  },
  {
    id: 'business',
    heading: { en: 'I need legal help for my business', es: 'Necesito ayuda legal para mi negocio' },
    description: { en: 'Contracts, leases, employees, customers, compliance, collections, or business disputes.', es: 'Contratos, arrendamientos, empleados, clientes, cumplimiento, cobros o disputas de negocio.' },
    cta: { en: 'Start business intake', es: 'Iniciar intake de negocio' },
    href: '/for-business',
    iconName: 'Building2',
    accentColor: 'sky',
  },
  {
    id: 'partner',
    heading: { en: 'I work with a legal aid or pro bono organization', es: 'Trabajo con una organización de ayuda legal o pro bono' },
    description: { en: 'Bilingual AI intake, triage, referral routing, and document preparation for legal service teams.', es: 'Intake bilingüe con IA, triaje, enrutamiento de referencias y preparación de documentos para equipos legales.' },
    cta: { en: 'Explore partner workflow', es: 'Explorar flujo de socios' },
    href: '/for-organizations',
    iconName: 'Users',
    accentColor: 'emerald',
  },
];

```

---

## src/data/intakeQuestions.ts

```typescript
export type ICPPath = 'legal-aid' | 'smb' | 'consumer' | 'organization';

export interface IntakeOption {
  value: string;
  label: { en: string; es: string };
}

export interface IntakeQuestion {
  id: string;
  path: ICPPath[];
  label: { en: string; es: string };
  help?: { en: string; es: string };
  type: 'single' | 'multi' | 'text' | 'date' | 'state' | 'zip';
  options?: IntakeOption[];
  piiWarning?: boolean;
  required?: boolean;
}

export const intakeQuestions: IntakeQuestion[] = [
  {
    id: 'issue-type',
    path: ['legal-aid', 'consumer', 'smb', 'organization'],
    label: { en: 'What kind of issue is this?', es: '¿Qué tipo de problema es?' },
    help: { en: 'Choose the closest match. If unsure, select "I don\'t know."', es: 'Elige la opción más cercana. Si no estás seguro, selecciona "No sé."' },
    type: 'single',
    required: true,
    options: [
      { value: 'housing', label: { en: 'Housing or eviction', es: 'Vivienda o desalojo' } },
      { value: 'debt', label: { en: 'Debt or consumer problem', es: 'Deuda o problema de consumo' } },
      { value: 'family', label: { en: 'Family or safety concern', es: 'Familia o preocupación de seguridad' } },
      { value: 'immigration', label: { en: 'Immigration', es: 'Inmigración' } },
      { value: 'employment', label: { en: 'Employment', es: 'Empleo' } },
      { value: 'court', label: { en: 'Court papers or deadline', es: 'Documentos del tribunal o plazo' } },
      { value: 'contract', label: { en: 'Contract or lease', es: 'Contrato o arrendamiento' } },
      { value: 'business-dispute', label: { en: 'Business dispute or demand letter', es: 'Disputa de negocio o carta de demanda' } },
      { value: 'compliance', label: { en: 'Compliance or licensing', es: 'Cumplimiento o licencias' } },
      { value: 'unknown', label: { en: "I don't know", es: 'No sé' } },
    ],
  },
  {
    id: 'urgency',
    path: ['legal-aid', 'consumer', 'smb', 'organization'],
    label: { en: 'Is anything urgent?', es: '¿Hay algo urgente?' },
    help: { en: 'This helps us prioritize the right information.', es: 'Esto nos ayuda a priorizar la información correcta.' },
    type: 'single',
    required: true,
    options: [
      { value: 'court-date', label: { en: 'I have a court date or deadline', es: 'Tengo una fecha de tribunal o plazo' } },
      { value: 'unsafe', label: { en: 'I may be unsafe', es: 'Puedo estar en peligro' } },
      { value: 'legal-papers', label: { en: 'I received legal papers', es: 'Recibí documentos legales' } },
      { value: 'eviction', label: { en: 'I am facing eviction or detention', es: 'Enfrento desalojo o detención' } },
      { value: 'soon', label: { en: 'I need help soon but not today', es: 'Necesito ayuda pronto pero no hoy' } },
      { value: 'none', label: { en: 'Not urgent / just exploring', es: 'No es urgente / solo estoy explorando' } },
    ],
  },
  {
    id: 'state',
    path: ['legal-aid', 'consumer', 'smb', 'organization'],
    label: { en: 'What state are you in?', es: '¿En qué estado estás?' },
    help: { en: 'Laws vary by state. This helps us give better information.', es: 'Las leyes varían por estado. Esto nos ayuda a dar mejor información.' },
    type: 'state',
    required: false,
  },
  {
    id: 'zip',
    path: ['legal-aid', 'consumer'],
    label: { en: 'ZIP code or county (optional)', es: 'Código ZIP o condado (opcional)' },
    help: { en: 'Helps us find local resources.', es: 'Nos ayuda a encontrar recursos locales.' },
    type: 'zip',
    required: false,
  },
  {
    id: 'household-size',
    path: ['legal-aid'],
    label: { en: 'Household size', es: 'Tamaño del hogar' },
    help: { en: 'Used only to check if you may qualify for free help. We do not store this.', es: 'Se usa solo para verificar si puedes calificar para ayuda gratuita. No almacenamos esto.' },
    type: 'single',
    required: false,
    options: [
      { value: '1', label: { en: '1 person', es: '1 persona' } },
      { value: '2', label: { en: '2 people', es: '2 personas' } },
      { value: '3', label: { en: '3 people', es: '3 personas' } },
      { value: '4', label: { en: '4 people', es: '4 personas' } },
      { value: '5+', label: { en: '5 or more', es: '5 o más' } },
      { value: 'unknown', label: { en: "I don't know / prefer not to say", es: 'No sé / prefiero no decir' } },
    ],
  },
  {
    id: 'income-range',
    path: ['legal-aid'],
    label: { en: 'Approximate household income range', es: 'Rango aproximado de ingreso del hogar' },
    help: { en: 'Many free legal services have income limits. We never ask for exact amounts.', es: 'Muchos servicios legales gratuitos tienen límites de ingreso. Nunca pedimos cantidades exactas.' },
    type: 'single',
    required: false,
    options: [
      { value: 'under-25k', label: { en: 'Under $25,000/year', es: 'Menos de $25,000/año' } },
      { value: '25k-50k', label: { en: '$25,000–$50,000/year', es: '$25,000–$50,000/año' } },
      { value: '50k-75k', label: { en: '$50,000–$75,000/year', es: '$50,000–$75,000/año' } },
      { value: 'over-75k', label: { en: 'Over $75,000/year', es: 'Más de $75,000/año' } },
      { value: 'unknown', label: { en: "I don't know / prefer not to say", es: 'No sé / prefiero no decir' } },
    ],
  },
  {
    id: 'business-type',
    path: ['smb'],
    label: { en: 'What kind of business?', es: '¿Qué tipo de negocio?' },
    type: 'single',
    required: false,
    options: [
      { value: 'sole-prop', label: { en: 'Sole proprietor / freelancer', es: 'Propietario único / freelancer' } },
      { value: 'llc', label: { en: 'LLC or partnership', es: 'LLC o sociedad' } },
      { value: 'corp', label: { en: 'Corporation', es: 'Corporación' } },
      { value: 'nonprofit', label: { en: 'Nonprofit', es: 'Sin fines de lucro' } },
      { value: 'not-formed', label: { en: 'Not yet formed', es: 'Aún no formado' } },
      { value: 'unknown', label: { en: "I don't know", es: 'No sé' } },
    ],
  },
  {
    id: 'describe-situation',
    path: ['legal-aid', 'consumer', 'smb'],
    label: { en: 'Briefly describe your situation (optional)', es: 'Describe brevemente tu situación (opcional)' },
    help: { en: 'A few sentences is enough. Do not include sensitive numbers.', es: 'Unas pocas oraciones son suficientes. No incluyas números sensibles.' },
    type: 'text',
    piiWarning: true,
    required: false,
  },
];

export const URGENT_VALUES = ['court-date', 'unsafe', 'legal-papers', 'eviction'];

export function isUrgent(urgencyValue: string): boolean {
  return URGENT_VALUES.includes(urgencyValue);
}

export function getQuestionsForPath(path: ICPPath): IntakeQuestion[] {
  return intakeQuestions.filter((q) => q.path.includes(path));
}

```

---

## src/data/governanceCopy.ts

```typescript
interface BilingualText {
  en: string;
  es: string;
}

export interface GovernanceSection {
  id: string;
  title: BilingualText;
  content: BilingualText;
  status: 'implemented' | 'pending-review';
  statusNote?: BilingualText;
}

export const governanceSections: GovernanceSection[] = [
  {
    id: 'what-ai-does',
    title: {
      en: 'What AI does and does not do',
      es: 'Qué hace y qué no hace la IA',
    },
    content: {
      en: 'Our AI reads your description, identifies possible legal issues, and suggests next steps based on public legal information. It does NOT give legal advice, represent you in court, file documents on your behalf, or guarantee outcomes. A lawyer has not reviewed your specific situation unless you separately request paid attorney review.',
      es: 'Nuestra IA lee tu descripción, identifica posibles problemas legales y sugiere próximos pasos basados en información legal pública. NO da asesoría legal, no te representa en un tribunal, no presenta documentos en tu nombre ni garantiza resultados. Un abogado no ha revisado tu situación específica a menos que solicites por separado una revisión pagada de abogado.',
    },
    status: 'implemented',
  },
  {
    id: 'data-not-to-enter',
    title: {
      en: 'Data we ask you not to enter',
      es: 'Datos que te pedimos que no ingreses',
    },
    content: {
      en: 'Do not type Social Security numbers, full bank or credit card numbers, immigration document numbers (A-numbers, visa numbers), passwords, or medical record identifiers. If you are in immediate danger, close this page and call 911 or your local emergency number.',
      es: 'No escribas números de Seguro Social, números completos de banco o tarjeta de crédito, números de documentos de inmigración (números A, números de visa), contraseñas o identificadores de registros médicos. Si estás en peligro inmediato, cierra esta página y llama al 911 o a tu número de emergencia local.',
    },
    status: 'implemented',
  },
  {
    id: 'human-help',
    title: {
      en: 'How human help works',
      es: 'Cómo funciona la ayuda humana',
    },
    content: {
      en: 'If your issue is complex, urgent, or involves a court deadline, we show you how to connect with a real lawyer or legal-aid organization. Free referrals to legal-aid programs are based on your needs and location. Paid attorney review is optional, clearly labeled, and priced before you pay. We never rank free help by who pays us.',
      es: 'Si tu problema es complejo, urgente o involucra un plazo judicial, te mostramos cómo conectarte con un abogado real o una organización de ayuda legal. Las referencias gratuitas a programas de ayuda legal se basan en tus necesidades y ubicación. La revisión pagada de abogado es opcional, está claramente etiquetada y el precio se muestra antes de pagar. Nunca clasificamos la ayuda gratuita según quién nos paga.',
    },
    status: 'implemented',
  },
  {
    id: 'reducing-wrong-answers',
    title: {
      en: 'How we reduce wrong answers',
      es: 'Cómo reducimos las respuestas incorrectas',
    },
    content: {
      en: 'We ask for your state and ZIP code so answers reflect your jurisdiction. Responses cite the type of source used (statute, regulation, or general legal information). When the AI is uncertain, it says so. We flag when a human review is recommended. We do not guarantee accuracy — legal situations are complex and fact-specific.',
      es: 'Pedimos tu estado y código postal para que las respuestas reflejen tu jurisdicción. Las respuestas citan el tipo de fuente utilizada (estatuto, regulación o información legal general). Cuando la IA no está segura, lo dice. Señalamos cuándo se recomienda una revisión humana. No garantizamos exactitud — las situaciones legales son complejas y dependen de los hechos específicos.',
    },
    status: 'implemented',
  },
  {
    id: 'limits-and-when-to-contact',
    title: {
      en: 'Limits and when to contact a lawyer or legal aid',
      es: 'Límites y cuándo contactar a un abogado o ayuda legal',
    },
    content: {
      en: 'Contact a lawyer or legal-aid program immediately if: you have a court deadline within 7 days, you received legal papers you do not understand, you face eviction or foreclosure, you are in a custody dispute, you are detained or face deportation, or someone\u2019s safety is at risk. Our AI cannot replace professional legal judgment in these situations.',
      es: 'Contacta a un abogado o programa de ayuda legal de inmediato si: tienes un plazo judicial dentro de 7 días, recibiste documentos legales que no entiendes, enfrentas desalojo o ejecución hipotecaria, estás en una disputa de custodia, estás detenido o enfrentas deportación, o la seguridad de alguien está en riesgo. Nuestra IA no puede reemplazar el juicio legal profesional en estas situaciones.',
    },
    status: 'implemented',
  },
  {
    id: 'data-handling',
    title: {
      en: 'Data handling and retention',
      es: 'Manejo y retención de datos',
    },
    content: {
      en: 'Your conversation data is stored in our database to provide your session history. We do not sell your data. We do not use your legal questions to train AI models. Data retention and deletion policies are being finalized with legal counsel.',
      es: 'Los datos de tu conversación se almacenan en nuestra base de datos para proporcionar tu historial de sesión. No vendemos tus datos. No usamos tus preguntas legales para entrenar modelos de IA. Las políticas de retención y eliminación de datos se están finalizando con asesoría legal.',
    },
    status: 'pending-review',
    statusNote: {
      en: 'Pending legal/security review: Formal data retention schedule, deletion automation, and third-party audit are not yet finalized.',
      es: 'Pendiente de revisión legal/seguridad: El calendario formal de retención de datos, la automatización de eliminación y la auditoría de terceros aún no están finalizados.',
    },
  },
];

export const governanceDisclaimer: BilingualText = {
  en: 'ezLegal.ai is not a law firm and does not provide legal advice. We provide AI-assisted legal information tools. The information on this page describes our current practices and design principles. Items marked "Pending legal/security review" are in development and have not yet been independently verified.',
  es: 'ezLegal.ai no es un bufete de abogados y no proporciona asesoría legal. Proporcionamos herramientas de información legal asistidas por IA. La información en esta página describe nuestras prácticas actuales y principios de diseño. Los elementos marcados como "Pendiente de revisión legal/seguridad" están en desarrollo y aún no han sido verificados de forma independiente.',
};

export const reportProblemCTA: BilingualText = {
  en: 'Report an AI problem or inaccuracy',
  es: 'Reportar un problema o inexactitud de la IA',
};

```

---

## src/data/governanceChecklist.ts

```typescript
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

```

---

## src/data/aiSafety.ts

```typescript
export interface AISafetySection {
  id: string;
  heading: { en: string; es: string };
  items: { text: { en: string; es: string }; verified: boolean }[];
}

export const aiSafetySections: AISafetySection[] = [
  {
    id: 'what-ai-does',
    heading: { en: 'What AI does', es: 'Qué hace la IA' },
    items: [
      { text: { en: 'Helps you understand your legal situation in plain language.', es: 'Te ayuda a entender tu situación legal en lenguaje simple.' }, verified: true },
      { text: { en: 'Identifies the type of legal issue you may be facing.', es: 'Identifica el tipo de problema legal que puedes estar enfrentando.' }, verified: true },
      { text: { en: 'Suggests next steps based on general legal information.', es: 'Sugiere próximos pasos basados en información legal general.' }, verified: true },
      { text: { en: 'Helps organize your facts for a lawyer or legal-aid meeting.', es: 'Ayuda a organizar tus datos para una reunión con abogado o ayuda legal.' }, verified: true },
    ],
  },
  {
    id: 'what-ai-does-not-do',
    heading: { en: 'What AI does not do', es: 'Qué NO hace la IA' },
    items: [
      { text: { en: 'Does not give legal advice or make legal decisions.', es: 'No da asesoría legal ni toma decisiones legales.' }, verified: true },
      { text: { en: 'Does not represent you in court or before any authority.', es: 'No te representa en corte ni ante ninguna autoridad.' }, verified: true },
      { text: { en: 'Does not guarantee outcomes or accuracy of information.', es: 'No garantiza resultados ni precisión de la información.' }, verified: true },
      { text: { en: 'Does not create an attorney-client relationship.', es: 'No crea una relación abogado-cliente.' }, verified: true },
    ],
  },
  {
    id: 'legal-info-vs-advice',
    heading: { en: 'Legal information vs legal advice', es: 'Información legal vs asesoría legal' },
    items: [
      { text: { en: 'Legal information explains how laws generally work.', es: 'La información legal explica cómo funcionan las leyes en general.' }, verified: true },
      { text: { en: 'Legal advice tells you what to do in your specific situation.', es: 'La asesoría legal te dice qué hacer en tu situación específica.' }, verified: true },
      { text: { en: 'Only a licensed attorney can provide legal advice.', es: 'Solo un abogado licenciado puede dar asesoría legal.' }, verified: true },
      { text: { en: 'We help you prepare to have that conversation with a professional.', es: 'Te ayudamos a prepararte para tener esa conversación con un profesional.' }, verified: true },
    ],
  },
  {
    id: 'human-review',
    heading: { en: 'Human review and escalation', es: 'Revisión humana y escalación' },
    items: [
      { text: { en: 'When your issue may need a lawyer, we say so clearly.', es: 'Cuando tu asunto puede necesitar un abogado, lo decimos claramente.' }, verified: true },
      { text: { en: 'We provide referral resources to legal aid and attorneys.', es: 'Proporcionamos recursos de referencia a ayuda legal y abogados.' }, verified: true },
      { text: { en: 'Urgent situations trigger immediate safety resource links.', es: 'Situaciones urgentes activan enlaces inmediatos a recursos de seguridad.' }, verified: true },
      { text: { en: 'AI output is not reviewed by an attorney before you see it.', es: 'La salida de la IA no es revisada por un abogado antes de que la veas.' }, verified: true },
    ],
  },
  {
    id: 'privacy',
    heading: { en: 'Privacy and sensitive information', es: 'Privacidad e información sensible' },
    items: [
      { text: { en: 'We do not sell your data or use it to train AI models.', es: 'No vendemos tus datos ni los usamos para entrenar modelos de IA.' }, verified: true },
      { text: { en: 'Conversations are stored with access controls.', es: 'Las conversaciones se almacenan con controles de acceso.' }, verified: true },
      { text: { en: 'You control what you share and can delete your data.', es: 'Tú controlas lo que compartes y puedes eliminar tus datos.' }, verified: true },
      { text: { en: 'Encryption details: We are documenting this.', es: 'Detalles de cifrado: Estamos documentando esto.' }, verified: false },
    ],
  },
  {
    id: 'source-grounding',
    heading: { en: 'Source grounding and jurisdiction limits', es: 'Fuentes y límites jurisdiccionales' },
    items: [
      { text: { en: 'AI responses are based on general legal information, not case-specific research.', es: 'Las respuestas de IA se basan en información legal general, no en investigación específica de casos.' }, verified: true },
      { text: { en: 'We ask for your state because laws differ by jurisdiction.', es: 'Preguntamos tu estado porque las leyes difieren por jurisdicción.' }, verified: true },
      { text: { en: 'State-specific accuracy is not guaranteed. Verify with a local professional.', es: 'La precisión estatal no está garantizada. Verifica con un profesional local.' }, verified: true },
      { text: { en: 'Source citation for specific statutes: Not yet implemented.', es: 'Citación de fuentes para estatutos específicos: Aún no implementado.' }, verified: false },
    ],
  },
  {
    id: 'bias-language',
    heading: { en: 'Bias and language access', es: 'Sesgo y acceso lingüístico' },
    items: [
      { text: { en: 'We provide full functionality in English and Spanish.', es: 'Proporcionamos funcionalidad completa en inglés y español.' }, verified: true },
      { text: { en: 'AI outputs may contain errors or biases. Report problems to us.', es: 'Las salidas de IA pueden contener errores o sesgos. Repórtanos los problemas.' }, verified: true },
      { text: { en: 'Formal bias auditing process: We are documenting this.', es: 'Proceso formal de auditoría de sesgo: Estamos documentando esto.' }, verified: false },
    ],
  },
  {
    id: 'report-problem',
    heading: { en: 'How to report a problem', es: 'Cómo reportar un problema' },
    items: [
      { text: { en: 'Use the "Report a problem" link available on every page.', es: 'Usa el enlace "Reportar un problema" disponible en cada página.' }, verified: true },
      { text: { en: 'Contact us at support@ezlegal.ai for safety concerns.', es: 'Contáctanos en support@ezlegal.ai para preocupaciones de seguridad.' }, verified: true },
      { text: { en: 'We review reports and update AI behavior accordingly.', es: 'Revisamos reportes y actualizamos el comportamiento de la IA.' }, verified: true },
    ],
  },
];

export const sensitiveInfoWarnings = [
  { text: { en: 'Do not include your Social Security number.', es: 'No incluyas tu número de seguro social.' } },
  { text: { en: 'Do not include full financial account numbers.', es: 'No incluyas números completos de cuentas financieras.' } },
  { text: { en: 'Do not include immigration A-numbers unless specifically required by a secure partner workflow.', es: 'No incluyas números A de inmigración a menos que sea requerido específicamente por un flujo de trabajo seguro de un socio.' } },
  { text: { en: 'If you are in immediate danger, use urgent resources.', es: 'Si estás en peligro inmediato, usa recursos urgentes.' } },
];

export const sourceConfidenceLevels = [
  { id: 'general', label: { en: 'Based on general legal information', es: 'Basado en información legal general' }, color: 'slate' },
  { id: 'state-needed', label: { en: 'State-specific source needed', es: 'Se necesita fuente estatal específica' }, color: 'amber' },
  { id: 'human-review', label: { en: 'Human review recommended', es: 'Se recomienda revisión humana' }, color: 'rose' },
] as const;

```

---

## src/data/conversionEvents.ts

```typescript
export type ConversionEvent =
  | 'home_viewed'
  | 'home_cta_clicked'
  | 'issue_chip_clicked'
  | 'urgent_resources_clicked'
  | 'language_toggled';

export interface ConversionMeta {
  cta?: string;
  chip?: string;
  language?: string;
  source?: string;
  path?: string;
}

export const CONVERSION_EVENTS: Record<ConversionEvent, { description: string; safeFields: string[] }> = {
  home_viewed: { description: 'User landed on homepage', safeFields: ['language'] },
  home_cta_clicked: { description: 'User clicked a CTA button', safeFields: ['cta'] },
  issue_chip_clicked: { description: 'User selected an issue chip', safeFields: ['chip'] },
  urgent_resources_clicked: { description: 'User navigated to urgent resources', safeFields: ['source'] },
  language_toggled: { description: 'User switched language', safeFields: ['language'] },
};

```

---

## src/data/homeCopy.ts

```typescript
export const homeCopy = {
  pathStrip: {
    heading: { en: 'Choose your path', es: 'Elige tu camino' },
    paths: [
      {
        id: 'legal-aid' as const,
        label: { en: "I can't afford a lawyer", es: 'No puedo pagar un abogado' },
        href: '/start?path=legal-aid',
      },
      {
        id: 'smb' as const,
        label: { en: 'I run a small business', es: 'Tengo un pequeño negocio' },
        href: '/start?path=smb',
      },
      {
        id: 'organization' as const,
        label: { en: 'I work with a legal-aid/pro bono organization', es: 'Trabajo con una organización de ayuda legal/pro bono' },
        href: '/for-organizations',
      },
    ],
  },
  whatHappensNext: {
    heading: { en: 'What happens next', es: 'Qué pasa después' },
    steps: [
      { number: 1, text: { en: 'Tell us what is happening.', es: 'Cuéntanos qué está pasando.' } },
      { number: 2, text: { en: 'We check urgency, location, language, and cost options.', es: 'Verificamos urgencia, ubicación, idioma y opciones de costo.' } },
      { number: 3, text: { en: 'You get plain-language next steps and human help options.', es: 'Recibes próximos pasos en lenguaje simple y opciones de ayuda humana.' } },
    ],
  },
  trustProof: {
    claims: [
      { text: { en: 'Not a law firm', es: 'No somos un bufete' } },
      { text: { en: 'Legal information, not legal advice', es: 'Información legal, no asesoría legal' } },
      { text: { en: 'Privacy-first intake', es: 'Intake con privacidad primero' } },
      { text: { en: 'Human help options', es: 'Opciones de ayuda humana' } },
      { text: { en: 'Spanish and English support', es: 'Soporte en español e inglés' } },
    ],
  },
  pricingPreview: {
    heading: { en: 'Start free. Pay only when you choose extra help.', es: 'Empieza gratis. Paga solo cuando elijas ayuda extra.' },
    subline: { en: 'No retainers. No hidden fees. No surprises.', es: 'Sin anticipos. Sin cargos ocultos. Sin sorpresas.' },
    disclaimer: { en: 'You will see any cost before you pay.', es: 'Verás cualquier costo antes de pagar.' },
  },
};

```

---

## src/data/legalContentStatus.ts

```typescript
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

```

---

