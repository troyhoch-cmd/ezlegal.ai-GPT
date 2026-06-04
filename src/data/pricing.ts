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
        id: 'justice_free',
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
  justice_free: {
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
