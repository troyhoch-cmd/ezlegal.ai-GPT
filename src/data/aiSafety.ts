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
