export type RouteAudience =
  | 'individual'
  | 'spanish-individual'
  | 'business'
  | 'legal-aid'
  | 'attorney-partner'
  | 'admin'
  | 'general';

export type RouteRiskLevel = 'low' | 'medium' | 'high';

export type NavGroup =
  | 'get-help'
  | 'business'
  | 'organizations'
  | 'learn'
  | 'trust'
  | 'account'
  | 'admin';

export interface AppRouteMeta {
  path: string;
  label: { en: string; es: string };
  plainLanguageLabel: { en: string; es: string };
  audience: RouteAudience[];
  requiresAuth: boolean;
  availableLanguages: ('en' | 'es')[];
  showEmergencyBanner?: boolean;
  showScopeDisclaimer?: boolean;
  showLegalAidEscalation?: boolean;
  riskLevel: RouteRiskLevel;
  navGroup?: NavGroup;
  hideFromFirstTimeUsers?: boolean;
}

export const APP_ROUTE_META: Record<string, AppRouteMeta> = {
  '/': {
    path: '/',
    label: { en: 'Home', es: 'Inicio' },
    plainLanguageLabel: { en: 'Home', es: 'Inicio' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
  },
  '/start': {
    path: '/start',
    label: { en: 'Get Started', es: 'Comenzar' },
    plainLanguageLabel: { en: 'Answer 3 questions, get your next steps', es: 'Responde 3 preguntas, obtén tus próximos pasos' },
    audience: ['individual', 'spanish-individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/chat': {
    path: '/chat',
    label: { en: 'Chat', es: 'Chat' },
    plainLanguageLabel: { en: 'Ask a legal question', es: 'Haz una pregunta legal' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/es/chat': {
    path: '/es/chat',
    label: { en: 'Chat (Spanish)', es: 'Chat en Español' },
    plainLanguageLabel: { en: 'Ask in Spanish', es: 'Pregunta en español' },
    audience: ['spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/espanol': {
    path: '/espanol',
    label: { en: 'En Español', es: 'En Español' },
    plainLanguageLabel: { en: 'Full experience in Spanish', es: 'Experiencia completa en español' },
    audience: ['spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/emergency-resources': {
    path: '/emergency-resources',
    label: { en: 'Emergency Resources', es: 'Recursos de Emergencia' },
    plainLanguageLabel: { en: 'Immediate help for danger or deadlines', es: 'Ayuda inmediata para peligro o plazos' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'high',
    navGroup: 'get-help',
  },
  '/lawyer-profiles': {
    path: '/lawyer-profiles',
    label: { en: 'Find Legal Help', es: 'Encontrar Ayuda Legal' },
    plainLanguageLabel: { en: 'Browse attorneys and legal aid organizations', es: 'Busca abogados y organizaciones de ayuda legal' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showLegalAidEscalation: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/issue-packs': {
    path: '/issue-packs',
    label: { en: 'Issue Packs', es: 'Paquetes de Temas' },
    plainLanguageLabel: { en: 'Self-help guides for common issues', es: 'Guías de autoayuda para problemas comunes' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/for-business': {
    path: '/for-business',
    label: { en: 'For Business', es: 'Para Negocios' },
    plainLanguageLabel: { en: 'Legal help for small and medium businesses', es: 'Ayuda legal para pequeñas y medianas empresas' },
    audience: ['business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'business',
  },
  '/for-organizations': {
    path: '/for-organizations',
    label: { en: 'For Organizations', es: 'Para Organizaciones' },
    plainLanguageLabel: { en: 'Intake, triage, and partner tools', es: 'Herramientas de intake, triaje y socios' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'organizations',
  },
  '/schedule-demo': {
    path: '/schedule-demo',
    label: { en: 'Schedule Demo', es: 'Agendar Demo' },
    plainLanguageLabel: { en: 'See a live demo of the platform', es: 'Vea una demostración en vivo' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'organizations',
  },
  '/pricing': {
    path: '/pricing',
    label: { en: 'Pricing', es: 'Precios' },
    plainLanguageLabel: { en: 'Plans and pricing', es: 'Planes y precios' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showLegalAidEscalation: true,
    riskLevel: 'low',
  },
  '/checkout': {
    path: '/checkout',
    label: { en: 'Checkout', es: 'Pago' },
    plainLanguageLabel: { en: 'Complete your purchase', es: 'Completa tu compra' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
  },
  '/case-predictor': {
    path: '/case-predictor',
    label: { en: 'Case Predictor', es: 'Predictor de Casos' },
    plainLanguageLabel: { en: 'Estimate possible outcomes for your situation', es: 'Estima resultados posibles para tu situación' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en'],
    showScopeDisclaimer: true,
    showEmergencyBanner: true,
    riskLevel: 'high',
    hideFromFirstTimeUsers: true,
  },
  '/negotiate': {
    path: '/negotiate',
    label: { en: 'Negotiation Planner', es: 'Planificador de Negociación' },
    plainLanguageLabel: { en: 'Build a strategy for disputes', es: 'Crea una estrategia para disputas' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en'],
    showScopeDisclaimer: true,
    riskLevel: 'high',
    navGroup: 'business',
    hideFromFirstTimeUsers: true,
  },
  '/toolkit': {
    path: '/toolkit',
    label: { en: 'Toolkit', es: 'Herramientas' },
    plainLanguageLabel: { en: 'Templates, checklists, and business tools', es: 'Plantillas, listas y herramientas' },
    audience: ['business'],
    requiresAuth: false,
    availableLanguages: ['en'],
    showScopeDisclaimer: true,
    riskLevel: 'medium',
    navGroup: 'business',
    hideFromFirstTimeUsers: true,
  },
  '/safety-net': {
    path: '/safety-net',
    label: { en: 'Legal Safety Net', es: 'Red de Seguridad Legal' },
    plainLanguageLabel: { en: 'Monthly legal checkups and monitoring', es: 'Revisiones legales mensuales y monitoreo' },
    audience: ['individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/pro-bono': {
    path: '/pro-bono',
    label: { en: 'Pro Bono Intake', es: 'Admisión Pro Bono' },
    plainLanguageLabel: { en: 'Apply for free legal assistance', es: 'Solicitar asistencia legal gratuita' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/ezreads': {
    path: '/ezreads',
    label: { en: 'Legal Guides', es: 'Guías Legales' },
    plainLanguageLabel: { en: 'Plain-language articles about common legal issues', es: 'Artículos en lenguaje simple sobre problemas legales comunes' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/how-it-works': {
    path: '/how-it-works',
    label: { en: 'How It Works', es: 'Cómo Funciona' },
    plainLanguageLabel: { en: 'How ezLegal.ai helps you', es: 'Cómo ezLegal.ai te ayuda' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/about': {
    path: '/about',
    label: { en: 'About', es: 'Acerca de' },
    plainLanguageLabel: { en: 'Our mission and team', es: 'Nuestra misión y equipo' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/trust-center': {
    path: '/trust-center',
    label: { en: 'Trust Center', es: 'Centro de Confianza' },
    plainLanguageLabel: { en: 'Privacy, security, and AI governance', es: 'Privacidad, seguridad y gobernanza de IA' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/scope-disclaimers': {
    path: '/scope-disclaimers',
    label: { en: 'Scope & Disclaimers', es: 'Alcance y Avisos' },
    plainLanguageLabel: { en: 'What this tool does and does not do', es: 'Lo que esta herramienta hace y no hace' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/privacy-at-a-glance': {
    path: '/privacy-at-a-glance',
    label: { en: 'Privacy at a Glance', es: 'Privacidad en Resumen' },
    plainLanguageLabel: { en: 'How your data is used', es: 'Cómo se usan tus datos' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/ai-governance': {
    path: '/ai-governance',
    label: { en: 'AI Governance', es: 'Gobernanza de IA' },
    plainLanguageLabel: { en: 'How we build, test, and monitor AI', es: 'Cómo construimos, probamos y monitoreamos la IA' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/report': {
    path: '/report',
    label: { en: 'Report', es: 'Informe' },
    plainLanguageLabel: { en: 'View your legal report', es: 'Ver tu informe legal' },
    audience: ['individual', 'business'],
    requiresAuth: true,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'medium',
  },
  '/ask': {
    path: '/ask',
    label: { en: 'Ask', es: 'Preguntar' },
    plainLanguageLabel: { en: 'Ask a legal question', es: 'Haz una pregunta legal' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    showEmergencyBanner: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/dashboard': {
    path: '/dashboard',
    label: { en: 'Dashboard', es: 'Panel' },
    plainLanguageLabel: { en: 'Your workspace and action plan', es: 'Tu espacio de trabajo y plan de acción' },
    audience: ['general'],
    requiresAuth: true,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'account',
  },
  '/login': {
    path: '/login',
    label: { en: 'Log In', es: 'Iniciar Sesión' },
    plainLanguageLabel: { en: 'Sign in to your account', es: 'Inicia sesión en tu cuenta' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'account',
  },
  '/signup': {
    path: '/signup',
    label: { en: 'Sign Up', es: 'Registrarse' },
    plainLanguageLabel: { en: 'Create an account', es: 'Crea una cuenta' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'account',
  },
  '/contact': {
    path: '/contact',
    label: { en: 'Contact', es: 'Contacto' },
    plainLanguageLabel: { en: 'Get in touch', es: 'Contáctanos' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/urgent-resources': {
    path: '/urgent-resources',
    label: { en: 'Urgent Resources', es: 'Recursos Urgentes' },
    plainLanguageLabel: { en: 'Help for deadlines, danger, or emergencies', es: 'Ayuda para plazos, peligro o emergencias' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'high',
    navGroup: 'get-help',
  },
  '/individuals': {
    path: '/individuals',
    label: { en: 'For Individuals', es: 'Para Personas' },
    plainLanguageLabel: { en: 'Legal help for yourself or your family', es: 'Ayuda legal para ti o tu familia' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showLegalAidEscalation: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/business': {
    path: '/business',
    label: { en: 'For Business', es: 'Para Negocios' },
    plainLanguageLabel: { en: 'Practical legal workflows for small businesses', es: 'Flujos legales prácticos para pequeñas empresas' },
    audience: ['business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'business',
  },
  '/partners': {
    path: '/partners',
    label: { en: 'For Partners', es: 'Para Socios' },
    plainLanguageLabel: { en: 'Intake and triage tools for legal aid organizations', es: 'Herramientas de admisión y triaje para organizaciones' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'organizations',
  },
};

export function getRouteMeta(path: string): AppRouteMeta | undefined {
  return APP_ROUTE_META[path];
}

export function getRoutesByNavGroup(group: NavGroup): AppRouteMeta[] {
  return Object.values(APP_ROUTE_META).filter((r) => r.navGroup === group);
}

export function getRoutesByAudience(audience: RouteAudience): AppRouteMeta[] {
  return Object.values(APP_ROUTE_META).filter((r) => r.audience.includes(audience));
}

export function shouldShowDisclaimer(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.showScopeDisclaimer === true;
}

export function shouldShowEmergencyBanner(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.showEmergencyBanner === true;
}

export function shouldShowLegalAidEscalation(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.showLegalAidEscalation === true;
}

export function isHighRiskRoute(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.riskLevel === 'high';
}

export function routeSupportsLanguage(path: string, lang: 'en' | 'es'): boolean {
  const meta = APP_ROUTE_META[path];
  if (!meta) return true;
  return meta.availableLanguages.includes(lang);
}
