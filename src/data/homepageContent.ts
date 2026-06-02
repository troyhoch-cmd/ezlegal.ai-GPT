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
