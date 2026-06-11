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
