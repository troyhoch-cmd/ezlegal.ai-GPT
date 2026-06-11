import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { UserType } from '../components/PersonaSelector';

interface PersonaRoute {
  label: string;
  href: string;
  icon: string;
  priority: number;
}

interface PersonaCTA {
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}

interface PersonaContent {
  dashboardHeadline: string;
  chatFollowUp: PersonaRoute[];
  quickActions: PersonaRoute[];
  upgradeCTA: PersonaCTA;
  pricingAnchor: string;
  featureHighlights: string[];
}

const PERSONA_CONTENT: Record<string, { en: PersonaContent; es: PersonaContent }> = {
  individual: {
    en: {
      dashboardHeadline: 'Your Legal Assistant',
      chatFollowUp: [
        { label: 'Find an Attorney', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 1 },
        { label: 'Check Pro Bono Eligibility', href: '/pro-bono', icon: 'heart', priority: 2 },
        { label: 'Get an Issue Pack', href: '/pricing', icon: 'file-text', priority: 3 },
        { label: 'Outcome Scenarios', href: '/dashboard?prediction=open', icon: 'brain', priority: 4 },
      ],
      quickActions: [
        { label: 'Ask a Question', href: '/ask', icon: 'message-square', priority: 1 },
        { label: 'Find a Lawyer', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 2 },
        { label: 'Negotiation Planner', href: '/negotiate', icon: 'handshake', priority: 3 },
        { label: 'Legal Guides', href: '/ezreads', icon: 'book-open', priority: 4 },
      ],
      upgradeCTA: {
        primary: { label: 'Get Issue Pack - $29', href: '/pricing' },
        secondary: { label: 'Check Pro Bono Eligibility', href: '/pro-bono' },
      },
      pricingAnchor: 'individuals',
      featureHighlights: [
        'Unlimited AI questions',
        'Attorney matching',
        'Document templates',
        'Negotiation scripts',
      ],
    },
    es: {
      dashboardHeadline: 'Tu Asistente Legal',
      chatFollowUp: [
        { label: 'Buscar un Abogado', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 1 },
        { label: 'Verificar Elegibilidad Pro Bono', href: '/pro-bono', icon: 'heart', priority: 2 },
        { label: 'Obtener Paquete de Ayuda', href: '/pricing', icon: 'file-text', priority: 3 },
        { label: 'Escenarios de Resultados', href: '/dashboard?prediction=open', icon: 'brain', priority: 4 },
      ],
      quickActions: [
        { label: 'Hacer una Pregunta', href: '/ask', icon: 'message-square', priority: 1 },
        { label: 'Buscar un Abogado', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 2 },
        { label: 'Planificador de Negociacion', href: '/negotiate', icon: 'handshake', priority: 3 },
        { label: 'Guias Legales', href: '/ezreads', icon: 'book-open', priority: 4 },
      ],
      upgradeCTA: {
        primary: { label: 'Obtener Paquete - $29', href: '/pricing' },
        secondary: { label: 'Verificar Elegibilidad Pro Bono', href: '/pro-bono' },
      },
      pricingAnchor: 'individuals',
      featureHighlights: [
        'Preguntas ilimitadas con IA',
        'Conexion con abogados',
        'Plantillas de documentos',
        'Guiones de negociacion',
      ],
    },
  },
  business: {
    en: {
      dashboardHeadline: 'Business Legal Hub',
      chatFollowUp: [
        { label: 'Generate Contract', href: '/dashboard/documents', icon: 'file-text', priority: 1 },
        { label: 'Compliance Checklist', href: '/chatbot?topic=compliance', icon: 'shield', priority: 2 },
        { label: 'Find Business Attorney', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 3 },
        { label: 'Business Formation Guide', href: '/ezreads', icon: 'book-open', priority: 4 },
      ],
      quickActions: [
        { label: 'Contract Review', href: '/chatbot?topic=contracts', icon: 'file-text', priority: 1 },
        { label: 'Compliance Check', href: '/chatbot?topic=compliance', icon: 'shield', priority: 2 },
        { label: 'Business Attorney', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 3 },
        { label: 'Employment Law', href: '/chatbot?topic=employment', icon: 'briefcase', priority: 4 },
      ],
      upgradeCTA: {
        primary: { label: 'View Business Plans', href: '/for-business' },
        secondary: { label: 'Schedule Demo', href: '/schedule-demo' },
      },
      pricingAnchor: 'business',
      featureHighlights: [
        'Contract drafting & review',
        'Compliance monitoring',
        'Team access & collaboration',
        'Business attorney network',
      ],
    },
    es: {
      dashboardHeadline: 'Centro Legal Empresarial',
      chatFollowUp: [
        { label: 'Generar Contrato', href: '/dashboard/documents', icon: 'file-text', priority: 1 },
        { label: 'Lista de Cumplimiento', href: '/chatbot?topic=compliance', icon: 'shield', priority: 2 },
        { label: 'Buscar Abogado Empresarial', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 3 },
        { label: 'Guia de Formacion Empresarial', href: '/ezreads', icon: 'book-open', priority: 4 },
      ],
      quickActions: [
        { label: 'Revision de Contratos', href: '/chatbot?topic=contracts', icon: 'file-text', priority: 1 },
        { label: 'Verificacion de Cumplimiento', href: '/chatbot?topic=compliance', icon: 'shield', priority: 2 },
        { label: 'Abogado Empresarial', href: '/dashboard/lawyer-profiles', icon: 'users', priority: 3 },
        { label: 'Derecho Laboral', href: '/chatbot?topic=employment', icon: 'briefcase', priority: 4 },
      ],
      upgradeCTA: {
        primary: { label: 'Ver Planes Empresariales', href: '/for-business' },
        secondary: { label: 'Agendar Demo', href: '/schedule-demo' },
      },
      pricingAnchor: 'business',
      featureHighlights: [
        'Redaccion y revision de contratos',
        'Monitoreo de cumplimiento',
        'Acceso de equipo y colaboracion',
        'Red de abogados empresariales',
      ],
    },
  },
  organization: {
    en: {
      dashboardHeadline: 'Organization Command Center',
      chatFollowUp: [
        { label: 'Grant Reporting', href: '/dashboard/grant-reporting', icon: 'bar-chart-3', priority: 1 },
        { label: 'Client Intake', href: '/dashboard/cases', icon: 'clipboard', priority: 2 },
        { label: 'Pro Bono Hours', href: '/dashboard/grant-reporting', icon: 'clock', priority: 3 },
        { label: 'Team Management', href: '/admin', icon: 'users', priority: 4 },
      ],
      quickActions: [
        { label: 'Grant Reports', href: '/dashboard/grant-reporting', icon: 'bar-chart-3', priority: 1 },
        { label: 'Client Intake', href: '/dashboard/cases', icon: 'clipboard', priority: 2 },
        { label: 'AI Case Matching', href: '/chatbot', icon: 'brain', priority: 3 },
        { label: 'LSO Dashboard', href: '/dashboard/lso', icon: 'gauge', priority: 4 },
      ],
      upgradeCTA: {
        primary: { label: 'View Organization Plans', href: '/for-organizations' },
        secondary: { label: 'Schedule Demo', href: '/schedule-demo' },
      },
      pricingAnchor: 'organizations',
      featureHighlights: [
        'Grant reporting dashboards',
        'Client intake automation',
        'Pro bono hour tracking',
        'Multi-jurisdiction support',
      ],
    },
    es: {
      dashboardHeadline: 'Centro de Control de la Organizacion',
      chatFollowUp: [
        { label: 'Reportes de Subsidios', href: '/dashboard/grant-reporting', icon: 'bar-chart-3', priority: 1 },
        { label: 'Admision de Clientes', href: '/dashboard/cases', icon: 'clipboard', priority: 2 },
        { label: 'Horas Pro Bono', href: '/dashboard/grant-reporting', icon: 'clock', priority: 3 },
        { label: 'Gestion de Equipo', href: '/admin', icon: 'users', priority: 4 },
      ],
      quickActions: [
        { label: 'Reportes de Subsidios', href: '/dashboard/grant-reporting', icon: 'bar-chart-3', priority: 1 },
        { label: 'Admision de Clientes', href: '/dashboard/cases', icon: 'clipboard', priority: 2 },
        { label: 'Emparejamiento de Casos IA', href: '/chatbot', icon: 'brain', priority: 3 },
        { label: 'Panel LSO', href: '/dashboard/lso', icon: 'gauge', priority: 4 },
      ],
      upgradeCTA: {
        primary: { label: 'Ver Planes para Organizaciones', href: '/for-organizations' },
        secondary: { label: 'Agendar Demo', href: '/schedule-demo' },
      },
      pricingAnchor: 'organizations',
      featureHighlights: [
        'Paneles de reportes de subsidios',
        'Automatizacion de admision de clientes',
        'Seguimiento de horas pro bono',
        'Soporte multi-jurisdicción',
      ],
    },
  },
};

export default function usePersonaRouting() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const persona = (profile?.user_type as UserType) || 'individual';
  const lang = language === 'es' ? 'es' : 'en';
  const content = PERSONA_CONTENT[persona]?.[lang] || PERSONA_CONTENT.individual.en;

  return {
    persona,
    content,
    isIndividual: persona === 'individual',
    isBusiness: persona === 'business',
    isOrganization: persona === 'organization',
  };
}
