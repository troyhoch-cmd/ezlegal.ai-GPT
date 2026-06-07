export type CommerceModel =
  | 'free'
  | 'self_serve_subscription'
  | 'one_time_addon'
  | 'partner_custom'
  | 'grant_or_free_access';

export interface TermsMicrocopy {
  cancel?: { en: string; es: string };
  refund?: { en: string; es: string };
  data?: { en: string; es: string };
}

export interface PricingPlan {
  id: string;
  name: { en: string; es: string };
  audience: 'individuals' | 'business' | 'legal-aid';
  commerceModel: CommerceModel;
  termsMicrocopy?: TermsMicrocopy;
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceDisplay: { en: string; es: string };
  annualPriceDisplay?: { en: string; es: string };
  priceNote?: { en: string; es: string };
  description: { en: string; es: string };
  features: { en: string[]; es: string[] };
  ctaLabel: { en: string; es: string };
  ctaHref: string;
  recommended?: boolean;
  badge?: { en: string; es: string };
  ethicalNote?: { en: string; es: string };
  isFinalPrice: boolean;
  isFoundingPrice: boolean;
  isAddOn?: boolean;
  isStartingAt?: boolean;
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
        commerceModel: 'free',
        monthlyPrice: 0,
        annualPrice: 0,
        priceDisplay: { en: '$0', es: '$0' },
        priceNote: { en: 'forever', es: 'siempre' },
        isFinalPrice: true,
        isFoundingPrice: false,
        description: {
          en: 'For basic legal questions and safe next steps.',
          es: 'Para preguntas legales básicas y próximos pasos seguros.',
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
            'Haz preguntas legales en inglés o español',
            'Recibe explicaciones en lenguaje simple',
            'Entiende documentos legales comunes',
            'Encuentra ayuda gratuita o de bajo costo',
            'Enlaces de ayuda urgente siempre gratis',
            'Sin tarjeta de crédito',
          ],
        },
        ctaLabel: { en: 'Start free', es: 'Comenzar gratis' },
        ctaHref: '/chat',
        ethicalNote: {
          en: 'No credit card required',
          es: 'Sin tarjeta de crédito',
        },
      },
      {
        id: 'everyday-plus',
        name: { en: 'Everyday Plus', es: 'Diario Plus' },
        audience: 'individuals',
        commerceModel: 'self_serve_subscription',
        termsMicrocopy: {
          cancel: { en: 'Cancel anytime', es: 'Cancela cuando quieras' },
          refund: { en: '7-day refund guarantee', es: 'Garantía de reembolso de 7 días' },
          data: { en: 'Your data never trains AI', es: 'Tus datos nunca entrenan IA' },
        },
        monthlyPrice: 9,
        annualPrice: 89,
        priceDisplay: { en: '$9/mo', es: '$9/mes' },
        annualPriceDisplay: { en: '$89/year', es: '$89/año' },
        isFinalPrice: false,
        isFoundingPrice: true,
        recommended: true,
        description: {
          en: 'For people handling an active legal issue.',
          es: 'Para personas manejando un problema legal activo.',
        },
        features: {
          en: [
            'Saved matter history and reminders',
            'Document analysis and summaries',
            'Next-step action plans',
            'Priority document processing',
            'Downloadable summaries for attorney review',
            'Cancel anytime',
          ],
          es: [
            'Historial de asuntos guardados y recordatorios',
            'Análisis y resúmenes de documentos',
            'Planes de acción con próximos pasos',
            'Procesamiento prioritario de documentos',
            'Resúmenes descargables para revisión de abogado',
            'Cancela cuando quieras',
          ],
        },
        ctaLabel: { en: 'Get Everyday Plus', es: 'Obtener Diario Plus' },
        ctaHref: '/chat?plan=everyday-plus',
        ethicalNote: {
          en: 'Cancel anytime. 7-day refund guarantee.',
          es: 'Cancela cuando quieras. Garantía de reembolso de 7 días.',
        },
      },
      {
        id: 'family',
        name: { en: 'Family', es: 'Familia' },
        audience: 'individuals',
        commerceModel: 'self_serve_subscription',
        termsMicrocopy: {
          cancel: { en: 'Cancel anytime', es: 'Cancela cuando quieras' },
          refund: { en: '7-day refund guarantee', es: 'Garantía de reembolso de 7 días' },
          data: { en: 'Your data never trains AI', es: 'Tus datos nunca entrenan IA' },
        },
        monthlyPrice: 19,
        annualPrice: 189,
        priceDisplay: { en: '$19/mo', es: '$19/mes' },
        annualPriceDisplay: { en: '$189/year', es: '$189/año' },
        isFinalPrice: false,
        isFoundingPrice: true,
        description: {
          en: 'For households supporting multiple people.',
          es: 'Para hogares que apoyan a varias personas.',
        },
        features: {
          en: [
            'Everything in Everyday Plus',
            'Multiple household members',
            'Shared document organization',
            'Family safety planning resources',
            'Higher monthly usage limits',
            'Priority email support',
          ],
          es: [
            'Todo en Diario Plus',
            'Múltiples miembros del hogar',
            'Organización compartida de documentos',
            'Recursos de planificación de seguridad familiar',
            'Límites de uso mensual más altos',
            'Soporte prioritario por correo',
          ],
        },
        ctaLabel: { en: 'Choose Family', es: 'Elegir Familia' },
        ctaHref: '/chat?plan=family',
        ethicalNote: {
          en: 'Cancel anytime. 7-day refund guarantee.',
          es: 'Cancela cuando quieras. Garantía de reembolso de 7 días.',
        },
      },
      {
        id: 'boost',
        name: { en: 'Boost', es: 'Boost' },
        audience: 'individuals',
        commerceModel: 'one_time_addon',
        termsMicrocopy: {
          data: { en: 'Your data never trains AI', es: 'Tus datos nunca entrenan IA' },
        },
        monthlyPrice: null,
        annualPrice: null,
        priceDisplay: { en: '$5', es: '$5' },
        priceNote: { en: 'one-time', es: 'único pago' },
        isFinalPrice: true,
        isFoundingPrice: false,
        isAddOn: true,
        description: {
          en: 'Need one urgent document or deadline?',
          es: '¿Necesitas un documento urgente o fecha límite?',
        },
        features: {
          en: [
            'One-time document boost',
            'Faster processing',
            'Deadline checklist',
            'Referral-ready summary',
          ],
          es: [
            'Impulso de documento único',
            'Procesamiento más rápido',
            'Lista de fechas límite',
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
      en: 'Reduce legal spend and get answers before questions become expensive problems.',
      es: 'Reduce gastos legales y obtén respuestas antes de que las preguntas se vuelvan problemas costosos.',
    },
    plans: [
      {
        id: 'business-starter',
        name: { en: 'Business Starter', es: 'Negocio Inicial' },
        audience: 'business',
        commerceModel: 'self_serve_subscription',
        termsMicrocopy: {
          cancel: { en: 'Cancel anytime', es: 'Cancela cuando quieras' },
          refund: { en: '7-day refund guarantee', es: 'Garantía de reembolso de 7 días' },
          data: { en: 'Your data never trains AI', es: 'Tus datos nunca entrenan IA' },
        },
        monthlyPrice: 29,
        annualPrice: 290,
        priceDisplay: { en: '$29/mo', es: '$29/mes' },
        annualPriceDisplay: { en: '$290/year', es: '$290/año' },
        isFinalPrice: false,
        isFoundingPrice: true,
        recommended: true,
        description: {
          en: 'For solo owners and small teams.',
          es: 'Para dueños individuales y equipos pequeños.',
        },
        features: {
          en: [
            'Contract and document summaries',
            'Compliance checklists',
            'Dispute preparation tools',
            'Employment and vendor issue spotting',
            'Save and organize business matters',
            'Cancel anytime',
          ],
          es: [
            'Resúmenes de contratos y documentos',
            'Listas de cumplimiento',
            'Herramientas de preparación de disputas',
            'Detección de problemas laborales y de proveedores',
            'Guarda y organiza asuntos de negocio',
            'Cancela cuando quieras',
          ],
        },
        ctaLabel: { en: 'Start Business', es: 'Comenzar Negocio' },
        ctaHref: '/signup?plan=business-starter',
        ethicalNote: {
          en: 'Cancel anytime. Attorney review available separately.',
          es: 'Cancela cuando quieras. Revisión de abogado disponible por separado.',
        },
      },
      {
        id: 'business-plus',
        name: { en: 'Business Plus', es: 'Negocio Plus' },
        audience: 'business',
        commerceModel: 'self_serve_subscription',
        termsMicrocopy: {
          cancel: { en: 'Cancel anytime', es: 'Cancela cuando quieras' },
          refund: { en: '7-day refund guarantee', es: 'Garantía de reembolso de 7 días' },
          data: { en: 'Your data never trains AI', es: 'Tus datos nunca entrenan IA' },
        },
        monthlyPrice: 79,
        annualPrice: 790,
        priceDisplay: { en: '$79/mo', es: '$79/mes' },
        annualPriceDisplay: { en: '$790/year', es: '$790/año' },
        isFinalPrice: false,
        isFoundingPrice: true,
        description: {
          en: 'For recurring legal workflows and growing teams.',
          es: 'Para flujos legales recurrentes y equipos en crecimiento.',
        },
        features: {
          en: [
            'Everything in Business Starter',
            'Team access (up to 5 seats)',
            'Higher document volume',
            'Matter organization and tracking',
            'Policy and contract review workflows',
            'Referral-ready packets for attorney handoff',
          ],
          es: [
            'Todo en Negocio Inicial',
            'Acceso de equipo (hasta 5 puestos)',
            'Mayor volumen de documentos',
            'Organización y seguimiento de asuntos',
            'Flujos de revisión de políticas y contratos',
            'Paquetes listos para transferencia a abogado',
          ],
        },
        ctaLabel: { en: 'Choose Business Plus', es: 'Elegir Negocio Plus' },
        ctaHref: '/signup?plan=business-plus',
        ethicalNote: {
          en: 'Cancel anytime. Attorney review available separately.',
          es: 'Cancela cuando quieras. Revisión de abogado disponible por separado.',
        },
      },
      {
        id: 'business-pro',
        name: { en: 'Business Pro', es: 'Negocio Pro' },
        audience: 'business',
        commerceModel: 'partner_custom',
        monthlyPrice: null,
        annualPrice: null,
        priceDisplay: { en: 'Custom', es: 'Personalizado' },
        isFinalPrice: true,
        isFoundingPrice: false,
        description: {
          en: 'For teams needing admin controls, integrations, and priority support.',
          es: 'Para equipos que necesitan controles admin, integraciones y soporte prioritario.',
        },
        features: {
          en: [
            'Everything in Business Plus',
            'Custom seat count',
            'Admin controls and reporting',
            'Priority support',
            'Integration options',
            'Referral workflows when professional help is appropriate',
          ],
          es: [
            'Todo en Negocio Plus',
            'Cantidad personalizada de puestos',
            'Controles administrativos y reportes',
            'Soporte prioritario',
            'Opciones de integración',
            'Flujos de referencia cuando se necesita ayuda profesional',
          ],
        },
        ctaLabel: { en: 'Talk to us', es: 'Contáctanos' },
        ctaHref: '/schedule-demo',
      },
    ],
  },
  {
    id: 'legal-aid',
    label: { en: 'Legal Aid', es: 'Ayuda Legal' },
    headline: { en: 'Expand access to justice', es: 'Ampliar el acceso a la justicia' },
    subline: {
      en: 'People seeking legal-aid help are not monetized. Sponsored and coalition models expand access.',
      es: 'Las personas que buscan ayuda legal no son monetizadas. Los modelos patrocinados y de coalición amplían el acceso.',
    },
    plans: [
      {
        id: 'verified-legal-aid',
        name: { en: 'Verified Legal Aid', es: 'Ayuda Legal Verificada' },
        audience: 'legal-aid',
        commerceModel: 'grant_or_free_access',
        monthlyPrice: 0,
        annualPrice: 0,
        priceDisplay: { en: 'Free / Sponsored', es: 'Gratis / Patrocinado' },
        isFinalPrice: true,
        isFoundingPrice: false,
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
            'Human-review workflows for staff',
          ],
          es: [
            'Soporte de admisión y triaje',
            'Flujos de autoayuda multilingües',
            'Resúmenes de documentos',
            'Enrutamiento de referencias',
            'Flujos de seguridad y ayuda urgente',
            'Flujos de revisión humana para personal',
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
        name: { en: 'Coalition / Statewide', es: 'Coalición / Estatal' },
        audience: 'legal-aid',
        commerceModel: 'partner_custom',
        monthlyPrice: 499,
        annualPrice: null,
        priceDisplay: { en: 'Starting at $499/mo', es: 'Desde $499/mes' },
        isFinalPrice: true,
        isFoundingPrice: false,
        isStartingAt: true,
        badge: { en: 'Best for networks', es: 'Mejor para redes' },
        description: {
          en: 'For regional networks, bar associations, clinics, and nonprofits.',
          es: 'Para redes regionales, colegios de abogados, clínicas y organizaciones sin fines de lucro.',
        },
        features: {
          en: [
            'Multi-organization routing',
            'Shared referral workflows',
            'Aggregated reporting and grant support',
            'Spanish-first access campaigns',
            'Configurable issue areas',
            'Implementation and onboarding support',
          ],
          es: [
            'Enrutamiento multi-organizacional',
            'Flujos de referencia compartidos',
            'Reportes agregados y soporte de subvenciones',
            'Campañas de acceso en español primero',
            'Áreas de problemas configurables',
            'Soporte de implementación e incorporación',
          ],
        },
        ctaLabel: { en: 'Talk to partnerships', es: 'Hablar con asociaciones' },
        ctaHref: '/schedule-demo',
        ethicalNote: {
          en: 'Annual invoicing and grant billing available',
          es: 'Facturación anual y facturación de subvenciones disponible',
        },
      },
      {
        id: 'enterprise-gov',
        name: { en: 'Enterprise / Government', es: 'Empresa / Gobierno' },
        audience: 'legal-aid',
        commerceModel: 'partner_custom',
        monthlyPrice: null,
        annualPrice: null,
        priceDisplay: { en: 'Custom', es: 'Personalizado' },
        isFinalPrice: true,
        isFoundingPrice: false,
        description: {
          en: 'For funders, courts, agencies, and large service networks.',
          es: 'Para financiadores, tribunales, agencias y grandes redes de servicios.',
        },
        features: {
          en: [
            'Secure deployment options',
            'Audit trail and compliance reporting',
            'Human-review workflows',
            'Custom content and jurisdiction routing',
            'Implementation support',
            'Sponsor a clinic or county deployment',
          ],
          es: [
            'Opciones de implementación segura',
            'Auditoría y reportes de cumplimiento',
            'Flujos de revisión humana',
            'Contenido personalizado y enrutamiento jurisdiccional',
            'Soporte de implementación',
            'Patrocinar una clínica o despliegue estatal',
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
    q: { en: 'Is this legal advice?', es: '¿Esto es asesoramiento legal?' },
    a: {
      en: 'No. ezLegal.ai provides legal information in plain language. We help you understand situations, documents, and next steps, but we do not provide legal advice or representation. For advice specific to your situation, consult a licensed attorney.',
      es: 'No. ezLegal.ai proporciona información legal en lenguaje simple. Te ayudamos a entender situaciones, documentos y próximos pasos, pero no proporcionamos asesoramiento ni representación legal. Para asesoramiento específico, consulta con un abogado licenciado.',
    },
  },
  {
    q: { en: 'When should I talk to a lawyer?', es: '¿Cuándo debo hablar con un abogado?' },
    a: {
      en: 'When you need someone to represent you in court, negotiate on your behalf, or provide advice that accounts for your specific legal situation. ezLegal.ai helps you prepare for that conversation and can connect you to legal aid, pro bono services, or vetted attorneys.',
      es: 'Cuando necesitas que alguien te represente en la corte, negocie en tu nombre, o proporcione asesoramiento específico a tu situación. ezLegal.ai te ayuda a prepararte para esa conversación y puede conectarte con ayuda legal, servicios pro bono o abogados verificados.',
    },
  },
  {
    q: { en: 'What happens if I hit my monthly limit?', es: '¿Qué pasa si alcanzo mi límite mensual?' },
    a: {
      en: 'You can upgrade your plan, purchase a Boost for one-time extra usage, or wait until your next billing cycle. Urgent-help resources and safety links remain available regardless of plan limits.',
      es: 'Puedes mejorar tu plan, comprar un Boost para uso extra único, o esperar hasta tu próximo ciclo de facturación. Los recursos de ayuda urgente y enlaces de seguridad permanecen disponibles sin importar los límites del plan.',
    },
  },
  {
    q: { en: 'Can I cancel anytime?', es: '¿Puedo cancelar cuando quiera?' },
    a: {
      en: 'Yes. All paid plans can be canceled at any time with no penalty. Annual plans receive a prorated refund for unused months. We also offer a 7-day refund guarantee on all new subscriptions.',
      es: 'Sí. Todos los planes pagados se pueden cancelar en cualquier momento sin penalización. Los planes anuales reciben un reembolso prorrateado por meses no usados. También ofrecemos una garantía de reembolso de 7 días en todas las nuevas suscripciones.',
    },
  },
  {
    q: { en: 'Is Spanish fully supported?', es: '¿El español está completamente soportado?' },
    a: {
      en: 'Yes. ezLegal.ai works in both English and Spanish. You can ask questions, upload documents, and receive guidance in either language. All pricing, safety resources, and urgent help are available in Spanish.',
      es: 'Sí. ezLegal.ai funciona en inglés y español. Puedes hacer preguntas, subir documentos y recibir orientación en cualquier idioma. Todos los precios, recursos de seguridad y ayuda urgente están disponibles en español.',
    },
  },
  {
    q: { en: 'Do legal-aid users pay?', es: '¿Los usuarios de ayuda legal pagan?' },
    a: {
      en: 'No. People seeking legal-aid help are not monetized. Qualified legal-aid organizations access the platform at no cost. Access is expanded through sponsored deployments, coalition partnerships, and grant funding.',
      es: 'No. Las personas que buscan ayuda legal no son monetizadas. Las organizaciones calificadas de ayuda legal acceden a la plataforma sin costo. El acceso se amplía a través de despliegues patrocinados, asociaciones de coalición y financiamiento de subvenciones.',
    },
  },
  {
    q: { en: 'Is my data used to train AI models?', es: '¿Se usan mis datos para entrenar modelos de IA?' },
    a: {
      en: 'No. Your data is never used to train AI models. All communications are encrypted in transit and at rest. You can request data deletion at any time.',
      es: 'No. Tus datos nunca se usan para entrenar modelos de IA. Todas las comunicaciones están encriptadas en tránsito y en reposo. Puedes solicitar la eliminación de datos en cualquier momento.',
    },
  },
  {
    q: { en: 'Are urgent-help resources free?', es: '¿Son gratis los recursos de ayuda urgente?' },
    a: {
      en: 'Always. Safety information, crisis hotlines, legal-aid finder, and urgent-help resources are never behind a paywall.',
      es: 'Siempre. La información de seguridad, líneas de crisis, buscador de ayuda legal y recursos de ayuda urgente nunca están detrás de un muro de pago.',
    },
  },
  {
    q: { en: 'How does renewal work and are there taxes?', es: '¿Cómo funciona la renovación y hay impuestos?' },
    a: {
      en: 'Plans renew automatically at the end of each billing cycle (monthly or annual). You will receive a reminder email 7 days before renewal. Applicable sales tax is calculated at checkout based on your billing address. Prices shown exclude tax unless otherwise noted.',
      es: 'Los planes se renuevan automáticamente al final de cada ciclo de facturación (mensual o anual). Recibirás un correo recordatorio 7 días antes de la renovación. El impuesto de venta aplicable se calcula al pagar según tu dirección de facturación. Los precios mostrados no incluyen impuestos a menos que se indique lo contrario.',
    },
  },
  {
    q: { en: 'What happens after the founding-price period?', es: '¿Qué pasa después del período de precio fundador?' },
    a: {
      en: 'Founding prices are locked for 12 months from your signup date. After that, your plan may adjust to the then-current standard rate. We will notify you at least 30 days in advance of any price change, and you can cancel or downgrade before it takes effect.',
      es: 'Los precios fundadores están fijados por 12 meses desde tu fecha de registro. Después, tu plan puede ajustarse a la tarifa estándar vigente. Te notificaremos al menos 30 días antes de cualquier cambio de precio, y puedes cancelar o cambiar de plan antes de que entre en vigor.',
    },
  },
  {
    q: { en: 'How do refunds work?', es: '¿Cómo funcionan los reembolsos?' },
    a: {
      en: 'New subscriptions include a 7-day money-back guarantee — no questions asked. After 7 days, monthly plans are not refundable but you can cancel to stop future charges. Annual plans receive a prorated refund for remaining whole months. Refunds are processed within 5-10 business days.',
      es: 'Las nuevas suscripciones incluyen una garantía de devolución de 7 días — sin preguntas. Después de 7 días, los planes mensuales no son reembolsables, pero puedes cancelar para detener cargos futuros. Los planes anuales reciben un reembolso prorrateado por meses completos restantes. Los reembolsos se procesan en 5-10 días hábiles.',
    },
  },
  {
    q: { en: 'What does human review include and what does it cost?', es: '¿Qué incluye la revisión humana y cuánto cuesta?' },
    a: {
      en: 'Human review is available on all paid plans at no extra cost for safety-critical outputs (e.g., court filings, custody matters). A trained reviewer checks AI-generated content for accuracy, completeness, and safety. Reviews typically complete within 24 hours on business days. High-priority matters may be expedited.',
      es: 'La revisión humana está disponible en todos los planes pagados sin costo adicional para resultados críticos de seguridad (ej., documentos judiciales, asuntos de custodia). Un revisor capacitado verifica el contenido generado por IA en cuanto a precisión, completitud y seguridad. Las revisiones típicamente se completan dentro de 24 horas en días hábiles. Los asuntos de alta prioridad pueden ser acelerados.',
    },
  },
];

export const comparisonFeatures = [
  { key: 'questions', en: 'Questions per month', es: 'Preguntas por mes' },
  { key: 'documents', en: 'Document analysis', es: 'Análisis de documentos' },
  { key: 'matters', en: 'Saved matters', es: 'Asuntos guardados' },
  { key: 'spanish', en: 'Spanish support', es: 'Soporte en español' },
  { key: 'summaries', en: 'Referral-ready summaries', es: 'Resúmenes para referencia' },
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
    spanish: { en: 'Yes', es: 'Sí' },
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
    spanish: { en: 'Yes', es: 'Sí' },
    summaries: { en: 'Yes', es: 'Sí' },
    priority: { en: 'Yes', es: 'Sí' },
    team: { en: '--', es: '--' },
    org: { en: '--', es: '--' },
    support: { en: 'Email', es: 'Correo' },
  },
  family: {
    questions: { en: '200/month', es: '200/mes' },
    documents: { en: '40/month', es: '40/mes' },
    matters: { en: '25', es: '25' },
    spanish: { en: 'Yes', es: 'Sí' },
    summaries: { en: 'Yes', es: 'Sí' },
    priority: { en: 'Yes', es: 'Sí' },
    team: { en: 'Household', es: 'Hogar' },
    org: { en: '--', es: '--' },
    support: { en: 'Priority email', es: 'Correo prioritario' },
  },
};
