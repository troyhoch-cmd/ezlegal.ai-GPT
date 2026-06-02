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
