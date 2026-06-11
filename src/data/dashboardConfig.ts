import type { LucideIcon } from 'lucide-react';

export type UserType = 'individual' | 'business' | 'organization';

export interface DashboardAction {
  id: string;
  icon: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  href: string;
  primary?: boolean;
}

export interface DashboardMatter {
  id: string;
  title: { en: string; es: string };
  status: 'active' | 'needs_review' | 'referred' | 'resolved';
  lastUpdated: string;
  nextStep: { en: string; es: string };
}

export interface DashboardRightRail {
  showPlanCard: boolean;
  planLabel: { en: string; es: string };
  planCTALabel: { en: string; es: string };
  planCTAHref: string;
  showReferrals: boolean;
  showUrgentHelp: boolean;
  showCapacityOverview: boolean;
  showGovernance: boolean;
}

export interface DashboardConfig {
  quickActions: DashboardAction[];
  mattersHeading: { en: string; es: string };
  sampleMatters: DashboardMatter[];
  rightRail: DashboardRightRail;
  trustCopy: { en: string; es: string };
}

export const DASHBOARD_CONFIGS: Record<UserType, DashboardConfig> = {
  individual: {
    quickActions: [
      {
        id: 'new-question',
        icon: 'Sparkles',
        label: { en: 'Ask a legal question', es: 'Hacer una pregunta legal' },
        description: { en: 'Get instant guidance on your situation', es: 'Obtén orientación instantánea sobre tu situación' },
        href: '/chat',
        primary: true,
      },
      {
        id: 'documents',
        icon: 'FileText',
        label: { en: 'My Documents', es: 'Mis Documentos' },
        description: { en: 'Uploads, drafts, and generated forms', es: 'Cargas, borradores y formularios generados' },
        href: '/dashboard/documents',
      },
      {
        id: 'history',
        icon: 'Clock',
        label: { en: 'Past Questions', es: 'Preguntas Anteriores' },
        description: { en: 'Review previous consultations', es: 'Revisa consultas anteriores' },
        href: '/dashboard/history',
      },
      {
        id: 'find-help',
        icon: 'Users',
        label: { en: 'Find Legal Help', es: 'Encontrar Ayuda Legal' },
        description: { en: 'Attorneys, legal aid, and pro bono', es: 'Abogados, ayuda legal y pro bono' },
        href: '/find-attorney',
      },
    ],
    mattersHeading: { en: 'My Legal Matters', es: 'Mis Asuntos Legales' },
    sampleMatters: [
      {
        id: '1',
        title: { en: 'Review eviction notice deadline', es: 'Revisar fecha límite de aviso de desalojo' },
        status: 'active',
        lastUpdated: '2026-06-05',
        nextStep: { en: 'Prepare response letter', es: 'Preparar carta de respuesta' },
      },
      {
        id: '2',
        title: { en: 'Employment complaint filing', es: 'Presentación de queja laboral' },
        status: 'needs_review',
        lastUpdated: '2026-06-03',
        nextStep: { en: 'Human review in progress', es: 'Revisión humana en progreso' },
      },
      {
        id: '3',
        title: { en: 'Small claims preparation', es: 'Preparación de reclamo menor' },
        status: 'resolved',
        lastUpdated: '2026-05-28',
        nextStep: { en: 'Documents ready for filing', es: 'Documentos listos para presentar' },
      },
    ],
    rightRail: {
      showPlanCard: true,
      planLabel: { en: 'Free access', es: 'Acceso gratuito' },
      planCTALabel: { en: 'See free and paid options', es: 'Ver opciones gratuitas y de pago' },
      planCTAHref: '/pricing',
      showReferrals: true,
      showUrgentHelp: true,
      showCapacityOverview: false,
      showGovernance: false,
    },
    trustCopy: {
      en: 'ezLegal.ai is not a law firm. AI guidance can be incomplete or wrong. For complex or urgent matters, request human review or contact a lawyer.',
      es: 'ezLegal.ai no es un bufete de abogados. La guía de IA puede ser incompleta o incorrecta. Para asuntos complejos o urgentes, solicita revisión humana o contacta a un abogado.',
    },
  },

  business: {
    quickActions: [
      {
        id: 'business-question',
        icon: 'Sparkles',
        label: { en: 'Get business legal guidance', es: 'Obtener orientación legal empresarial' },
        description: { en: 'Contracts, compliance, disputes, and more', es: 'Contratos, cumplimiento, disputas y más' },
        href: '/chat',
        primary: true,
      },
      {
        id: 'contracts',
        icon: 'FileText',
        label: { en: 'Review a Contract', es: 'Revisar un Contrato' },
        description: { en: 'Upload and analyze contracts or agreements', es: 'Carga y analiza contratos o acuerdos' },
        href: '/dashboard/documents',
      },
      {
        id: 'compliance',
        icon: 'Shield',
        label: { en: 'Compliance Check', es: 'Verificación de Cumplimiento' },
        description: { en: 'Employment, vendor, and regulatory checks', es: 'Verificaciones laborales, de proveedores y regulatorias' },
        href: '/chat',
      },
      {
        id: 'attorney',
        icon: 'Users',
        label: { en: 'Talk to an Attorney', es: 'Hablar con un Abogado' },
        description: { en: 'Get a referral for your business needs', es: 'Obtén una referencia para las necesidades de tu negocio' },
        href: '/find-attorney',
      },
    ],
    mattersHeading: { en: 'Business Matters', es: 'Asuntos de Negocio' },
    sampleMatters: [
      {
        id: '1',
        title: { en: 'Review vendor contract terms', es: 'Revisar términos del contrato de proveedor' },
        status: 'active',
        lastUpdated: '2026-06-05',
        nextStep: { en: 'Flag key clauses for review', es: 'Marcar cláusulas clave para revisión' },
      },
      {
        id: '2',
        title: { en: 'Independent contractor agreement', es: 'Acuerdo de contratista independiente' },
        status: 'needs_review',
        lastUpdated: '2026-06-03',
        nextStep: { en: 'Confirm classification compliance', es: 'Confirmar cumplimiento de clasificación' },
      },
      {
        id: '3',
        title: { en: 'Demand letter response', es: 'Respuesta a carta de demanda' },
        status: 'resolved',
        lastUpdated: '2026-05-28',
        nextStep: { en: 'Letter sent and acknowledged', es: 'Carta enviada y confirmada' },
      },
    ],
    rightRail: {
      showPlanCard: true,
      planLabel: { en: 'Business plan', es: 'Plan empresarial' },
      planCTALabel: { en: 'Compare business plans', es: 'Comparar planes empresariales' },
      planCTAHref: '/pricing?tab=business',
      showReferrals: false,
      showUrgentHelp: false,
      showCapacityOverview: false,
      showGovernance: false,
    },
    trustCopy: {
      en: 'ezLegal.ai is not a law firm. AI analysis may miss nuances. For binding decisions, always confirm with a licensed business attorney.',
      es: 'ezLegal.ai no es un bufete de abogados. El análisis de IA puede omitir matices. Para decisiones vinculantes, siempre confirma con un abogado empresarial licenciado.',
    },
  },

  organization: {
    quickActions: [
      {
        id: 'intake-queue',
        icon: 'Inbox',
        label: { en: 'Review Intake Queue', es: 'Revisar Cola de Admisión' },
        description: { en: 'New client intakes awaiting triage', es: 'Nuevas admisiones de clientes pendientes de triaje' },
        href: '/dashboard/matters',
        primary: true,
      },
      {
        id: 'referrals',
        icon: 'Users',
        label: { en: 'Referral Network', es: 'Red de Referencias' },
        description: { en: 'Manage partner referrals and connections', es: 'Gestionar referencias y conexiones de socios' },
        href: '/find-attorney',
      },
      {
        id: 'reports',
        icon: 'BarChart3',
        label: { en: 'Reports & Grants', es: 'Reportes y Subvenciones' },
        description: { en: 'Aggregated reporting and grant support', es: 'Reportes agregados y soporte de subvenciones' },
        href: '/dashboard/documents',
      },
      {
        id: 'governance',
        icon: 'Shield',
        label: { en: 'AI Governance', es: 'Gobernanza de IA' },
        description: { en: 'Review safety, audit logs, and compliance', es: 'Revisar seguridad, registros de auditoría y cumplimiento' },
        href: '/ai-governance',
      },
    ],
    mattersHeading: { en: 'Client Matters', es: 'Asuntos de Clientes' },
    sampleMatters: [
      {
        id: '1',
        title: { en: 'Spanish housing intakes (12 pending)', es: 'Admisiones de vivienda en español (12 pendientes)' },
        status: 'active',
        lastUpdated: '2026-06-05',
        nextStep: { en: 'Triage and assign', es: 'Clasificar y asignar' },
      },
      {
        id: '2',
        title: { en: 'Benefits appeals awaiting review', es: 'Apelaciones de beneficios pendientes de revisión' },
        status: 'needs_review',
        lastUpdated: '2026-06-03',
        nextStep: { en: 'Staff review required', es: 'Revisión del personal requerida' },
      },
      {
        id: '3',
        title: { en: 'Referrals pending partner acceptance', es: 'Referencias pendientes de aceptación del socio' },
        status: 'referred',
        lastUpdated: '2026-05-30',
        nextStep: { en: 'Follow up with partner org', es: 'Dar seguimiento con la organización socia' },
      },
    ],
    rightRail: {
      showPlanCard: true,
      planLabel: { en: 'Partnership', es: 'Asociación' },
      planCTALabel: { en: 'Partnership settings', es: 'Configuración de asociación' },
      planCTAHref: '/schedule-demo',
      showReferrals: false,
      showUrgentHelp: false,
      showCapacityOverview: true,
      showGovernance: true,
    },
    trustCopy: {
      en: 'ezLegal.ai is not a law firm. AI-generated outputs require staff review before client delivery. Do not submit emergencies through AI chat.',
      es: 'ezLegal.ai no es un bufete de abogados. Los resultados generados por IA requieren revisión del personal antes de la entrega al cliente. No envíe emergencias a través del chat de IA.',
    },
  },
};
