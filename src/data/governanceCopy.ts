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
