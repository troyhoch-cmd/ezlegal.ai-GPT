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
    en: 'Understand your legal options in 2 minutes',
    es: 'Entiende tus opciones legales en 2 minutos',
  },
  subline: {
    en: 'Free tools to help you figure out what to do next \u2014 in plain language.',
    es: 'Herramientas gratuitas para ayudarte a saber qu\u00e9 hacer \u2014 en lenguaje simple.',
  },
  scopeLine: {
    en: 'Not a law firm. Not legal advice. No account needed.',
    es: 'No es un bufete. No es asesor\u00eda legal. Sin cuenta necesaria.',
  },
  inputLabel: {
    en: 'What happened?',
    es: '\u00bfQu\u00e9 pas\u00f3?',
  },
  inputPlaceholder: {
    en: 'e.g. I got an eviction notice and I have 5 days\u2026',
    es: 'ej. Me lleg\u00f3 un aviso de desalojo y tengo 5 d\u00edas\u2026',
  },
  inputAriaLabel: {
    en: 'Describe your legal situation',
    es: 'Describe tu situaci\u00f3n legal',
  },
  primaryCta: {
    en: 'Start free checkup',
    es: 'Comenzar revisi\u00f3n gratis',
  },
  urgentPrompt: {
    en: 'In danger or facing a deadline?',
    es: '\u00bfEn peligro o enfrentas un plazo?',
  },
  urgentLink: {
    en: 'Get emergency help now',
    es: 'Obtener ayuda de emergencia ahora',
  },
  spanishReassurance: 'Disponible completamente en espa\u00f1ol. Sin cuenta necesaria.',
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
    en: 'Ready to understand your options?',
    es: '\u00bfListo para entender tus opciones?',
  },
  subline: {
    en: 'Free legal information in plain language. English or Spanish. No sign-up needed.',
    es: 'Informaci\u00f3n legal gratis en lenguaje simple. Ingl\u00e9s o espa\u00f1ol. Sin registro.',
  },
  primaryCta: {
    en: 'Start free checkup',
    es: 'Comenzar revisi\u00f3n gratis',
  },
  spanishCta: 'Comenzar en espa\u00f1ol',
};
