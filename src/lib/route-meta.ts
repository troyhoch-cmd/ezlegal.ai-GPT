export interface RouteMeta {
  label: { en: string; es: string };
  parent?: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  '/': { label: { en: 'Home', es: 'Inicio' } },

  '/for-individuals':  { label: { en: 'For Individuals',   es: 'Para Individuos' },        parent: '/' },
  '/for-business':     { label: { en: 'For Business',      es: 'Para Empresas' },          parent: '/' },
  '/for-organizations':{ label: { en: 'For Organizations', es: 'Para Organizaciones' },    parent: '/' },
  '/for-partners':     { label: { en: 'For Partners',      es: 'Para Socios' },            parent: '/' },

  '/pricing':             { label: { en: 'Pricing',            es: 'Precios' },             parent: '/' },
  '/trust-center':        { label: { en: 'Trust Center',       es: 'Centro de Confianza' }, parent: '/' },
  '/case-predictor':      { label: { en: 'Case Predictor',     es: 'Predictor de Casos' },  parent: '/' },
  '/case-predictor/start':{ label: { en: 'Start',              es: 'Comenzar' },            parent: '/case-predictor' },
  '/negotiate':           { label: { en: 'Negotiation Planner',es: 'Planificador de Negociacion' }, parent: '/' },
  '/ezreads':             { label: { en: 'EZReads',            es: 'EZReads' },             parent: '/' },
  '/emergency-resources': { label: { en: 'Emergency Resources',es: 'Recursos de Emergencia' }, parent: '/' },

  '/how-it-works':          { label: { en: 'How It Works',           es: 'Como Funciona' },        parent: '/' },
  '/features':              { label: { en: 'Features',               es: 'Funciones' },            parent: '/' },
  '/about':                 { label: { en: 'About',                  es: 'Acerca de' },            parent: '/' },
  '/contact':               { label: { en: 'Contact',                es: 'Contacto' },             parent: '/' },
  '/accessibility-statement':{label: { en: 'Accessibility Statement',es: 'Declaracion de Accesibilidad' }, parent: '/trust-center' },
  '/privacy-policy':        { label: { en: 'Privacy Policy',         es: 'Politica de Privacidad' }, parent: '/trust-center' },
  '/terms-of-service':      { label: { en: 'Terms of Service',       es: 'Terminos de Servicio' }, parent: '/trust-center' },
  '/sla':                   { label: { en: 'SLA',                    es: 'SLA' },                  parent: '/trust-center' },
  '/scope-disclaimers':     { label: { en: 'Scope & Disclaimers',    es: 'Alcance y Avisos' },     parent: '/trust-center' },
  '/security-faq':          { label: { en: 'Security FAQ',           es: 'Preguntas de Seguridad' },parent: '/trust-center' },
  '/privacy-faq':           { label: { en: 'Privacy FAQ',            es: 'Preguntas de Privacidad' }, parent: '/trust-center' },
  '/enterprise-security':   { label: { en: 'Enterprise Security',    es: 'Seguridad Empresarial' }, parent: '/trust-center' },
  '/how-reports-are-reviewed':{ label: { en: 'How Reports Are Reviewed', es: 'Como se revisan los reportes' }, parent: '/trust-center' },

  '/chat':         { label: { en: 'Chat',         es: 'Chat' },         parent: '/' },
  '/ask':          { label: { en: 'Ask',          es: 'Preguntar' },    parent: '/' },
  '/research':     { label: { en: 'Research',     es: 'Investigacion' },parent: '/' },
  '/documents':    { label: { en: 'Documents',    es: 'Documentos' },   parent: '/' },
  '/matters':      { label: { en: 'Matters',      es: 'Asuntos' },      parent: '/' },
  '/cases':        { label: { en: 'Cases',        es: 'Casos' },        parent: '/' },
  '/clients':      { label: { en: 'Clients',      es: 'Clientes' },     parent: '/' },
  '/history':      { label: { en: 'History',      es: 'Historial' },    parent: '/' },
  '/dashboard':    { label: { en: 'Dashboard',    es: 'Panel' },        parent: '/' },
  '/profile':      { label: { en: 'Profile',      es: 'Perfil' },       parent: '/dashboard' },
  '/schedule-demo':{ label: { en: 'Schedule Demo',es: 'Agendar Demo' }, parent: '/' },
  '/pro-bono':     { label: { en: 'Pro Bono Intake', es: 'Admision Pro Bono' }, parent: '/' },

  '/espanol':        { label: { en: 'En Español',    es: 'En Español' },      parent: '/' },
  '/media-kit':      { label: { en: 'Media Kit',     es: 'Kit de Prensa' },   parent: '/' },
  '/partner-hub':    { label: { en: 'Partner Hub',   es: 'Centro de Socios' },parent: '/for-partners' },
  '/issue-packs':    { label: { en: 'Issue Packs',   es: 'Paquetes de Temas' }, parent: '/' },
  '/site-review':    { label: { en: 'Site Review',   es: 'Revision del Sitio' }, parent: '/' },

  '/ai-governance':              { label: { en: 'AI Governance',              es: 'Gobernanza de IA' },              parent: '/trust-center' },
  '/ai-model-card':              { label: { en: 'AI Model Card',              es: 'Tarjeta de Modelo IA' },          parent: '/ai-governance' },
  '/algorithmic-impact-assessment': { label: { en: 'Impact Assessment',       es: 'Evaluacion de Impacto' },         parent: '/ai-governance' },
  '/bias-monitoring':            { label: { en: 'Bias Monitoring',            es: 'Monitoreo de Sesgo' },            parent: '/ai-governance' },
  '/checkout':                   { label: { en: 'Checkout',                   es: 'Pago' },                          parent: '/' },
  '/toolkit':                    { label: { en: 'Toolkit',                    es: 'Herramientas' },                  parent: '/' },
  '/safety-net':                 { label: { en: 'Legal Safety Net',           es: 'Red de Seguridad Legal' },        parent: '/' },
  '/find-attorney':              { label: { en: 'Find an Attorney',           es: 'Buscar Abogado' },                parent: '/' },
  '/lso-dashboard':              { label: { en: 'LSO Dashboard',              es: 'Panel LSO' },                     parent: '/for-organizations' },
  '/grant-reporting':            { label: { en: 'Grant Reporting',            es: 'Informes de Subvencion' },        parent: '/for-organizations' },
  '/privacy-at-a-glance':       { label: { en: 'Privacy at a Glance',        es: 'Privacidad en Resumen' },         parent: '/trust-center' },
  '/icp-prototype':              { label: { en: 'ICP Prototype',              es: 'Prototipo ICP' },                 parent: '/' },
};

export interface Crumb {
  path: string;
  label: { en: string; es: string };
}

export function resolveBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [];
  const seen = new Set<string>();

  const exact = ROUTE_META[pathname];
  let cursor = exact ? pathname : inferParent(pathname);
  let safety = 10;
  while (cursor && safety-- > 0 && !seen.has(cursor)) {
    seen.add(cursor);
    const meta = ROUTE_META[cursor];
    if (!meta) break;
    crumbs.unshift({ path: cursor, label: meta.label });
    cursor = meta.parent ?? '';
  }

  if (!exact) {
    crumbs.push({ path: pathname, label: inferLabel(pathname) });
  }
  return crumbs;
}

function inferParent(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  const parent = '/' + segments.slice(0, -1).join('/');
  return ROUTE_META[parent] ? parent : '/';
}

function inferLabel(pathname: string): { en: string; es: string } {
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  const titled = last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { en: titled, es: titled };
}
