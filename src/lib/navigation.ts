import { supabase } from './supabase';

export interface NavGroup {
  id: string;
  slug: string;
  label_en: string;
  label_es: string;
  sort_order: number;
  audiences: string[];
  items: NavItem[];
}

export interface NavItem {
  id: string;
  group_id: string | null;
  slug: string;
  route: string;
  icon: string;
  label_en: string;
  label_es: string;
  description_en: string;
  description_es: string;
  breadcrumb_label_en: string;
  breadcrumb_label_es: string;
  sort_order: number;
  is_primary: boolean;
  is_bottom_nav: boolean;
  is_cta: boolean;
  highlight: boolean;
  audiences: string[];
}

const FALLBACK_GROUPS: NavGroup[] = [
  {
    id: 'fallback-individuals', slug: 'individuals', label_en: 'For Individuals', label_es: 'Para Personas', sort_order: 1, audiences: ['individual'],
    items: [
      { id: 'f-individuals', group_id: 'fallback-individuals', slug: 'individuals', route: '/for-individuals', icon: 'User', label_en: 'For Individuals', label_es: 'Para Personas', description_en: 'Understand your rights, prepare documents, find help', description_es: 'Entiende tus derechos, prepara documentos, encuentra ayuda', breadcrumb_label_en: 'Individuals', breadcrumb_label_es: 'Personas', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-start', group_id: 'fallback-individuals', slug: 'start', route: '/start', icon: 'Sparkles', label_en: 'Start with 3 Questions', label_es: 'Empieza con 3 Preguntas', description_en: 'Answer 3 questions, get your next steps', description_es: 'Responde 3 preguntas, obt\u00e9n tus pr\u00f3ximos pasos', breadcrumb_label_en: 'Start', breadcrumb_label_es: 'Empezar', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-emergency', group_id: 'fallback-individuals', slug: 'emergency', route: '/emergency-resources', icon: 'AlertTriangle', label_en: 'Urgent / Safety', label_es: 'Urgente / Seguridad', description_en: 'Immediate help for danger or deadlines', description_es: 'Ayuda inmediata para peligro o plazos', breadcrumb_label_en: 'Emergency', breadcrumb_label_es: 'Emergencia', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: true, audiences: [] },
    ],
  },
  {
    id: 'fallback-business', slug: 'business', label_en: 'For Business', label_es: 'Para Negocios', sort_order: 2, audiences: ['smb'],
    items: [
      { id: 'f-business', group_id: 'fallback-business', slug: 'business', route: '/for-business', icon: 'Building2', label_en: 'For Business', label_es: 'Para Negocios', description_en: 'Contracts, compliance, and everyday legal questions', description_es: 'Contratos, cumplimiento y preguntas legales cotidianas', breadcrumb_label_en: 'Business', breadcrumb_label_es: 'Negocios', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-toolkit', group_id: 'fallback-business', slug: 'toolkit', route: '/toolkit', icon: 'Wrench', label_en: 'Business Toolkit', label_es: 'Kit de Herramientas', description_en: 'Templates, checklists, and tools', description_es: 'Plantillas, listas y herramientas', breadcrumb_label_en: 'Toolkit', breadcrumb_label_es: 'Herramientas', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-negotiate', group_id: 'fallback-business', slug: 'negotiate', route: '/negotiate', icon: 'Scale', label_en: 'Negotiation Planner', label_es: 'Planificador de Negociaci\u00f3n', description_en: 'Build a strategy for disputes', description_es: 'Crea una estrategia para disputas', breadcrumb_label_en: 'Negotiate', breadcrumb_label_es: 'Negociar', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-orgs', slug: 'organizations', label_en: 'For Organizations', label_es: 'Para Organizaciones', sort_order: 3, audiences: ['org'],
    items: [
      { id: 'f-orgs', group_id: 'fallback-orgs', slug: 'organizations', route: '/for-organizations', icon: 'Users', label_en: 'For Organizations', label_es: 'Para Organizaciones', description_en: 'Intake, triage, and referral tools for your team', description_es: 'Herramientas de intake, triaje y referencia para su equipo', breadcrumb_label_en: 'Organizations', breadcrumb_label_es: 'Organizaciones', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-partner-hub', group_id: 'fallback-orgs', slug: 'partner-hub', route: '/partner-hub', icon: 'Heart', label_en: 'Partner Hub', label_es: 'Centro de Socios', description_en: 'Manage your partnership', description_es: 'Administra tu asociaci\u00f3n', breadcrumb_label_en: 'Partners', breadcrumb_label_es: 'Socios', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-ai-governance', group_id: 'fallback-orgs', slug: 'ai-governance', route: '/ai-governance', icon: 'Shield', label_en: 'AI Governance', label_es: 'Gobernanza de IA', description_en: 'Transparency, bias monitoring, impact assessments', description_es: 'Transparencia, monitoreo de sesgo, evaluaciones de impacto', breadcrumb_label_en: 'AI Governance', breadcrumb_label_es: 'Gobernanza IA', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-pricing', slug: 'pricing', label_en: 'Pricing', label_es: 'Precios', sort_order: 4, audiences: [],
    items: [
      { id: 'f-pricing', group_id: 'fallback-pricing', slug: 'pricing', route: '/pricing', icon: 'CreditCard', label_en: 'Pricing', label_es: 'Precios', description_en: 'Plans and pricing', description_es: 'Planes y precios', breadcrumb_label_en: 'Pricing', breadcrumb_label_es: 'Precios', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-trust', slug: 'trust', label_en: 'Trust Center', label_es: 'Centro de Confianza', sort_order: 5, audiences: [],
    items: [
      { id: 'f-trust', group_id: 'fallback-trust', slug: 'trust-center', route: '/trust-center', icon: 'Shield', label_en: 'Trust Center', label_es: 'Centro de Confianza', description_en: 'Privacy, security, and AI governance', description_es: 'Privacidad, seguridad y gobernanza de IA', breadcrumb_label_en: 'Trust', breadcrumb_label_es: 'Confianza', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-scope', group_id: 'fallback-trust', slug: 'scope', route: '/scope-disclaimers', icon: 'Info', label_en: 'Scope & Disclaimers', label_es: 'Alcance y Avisos', description_en: 'What this tool does and does not do', description_es: 'Lo que esta herramienta hace y no hace', breadcrumb_label_en: 'Scope', breadcrumb_label_es: 'Alcance', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
];

const NAV_CACHE_KEY = 'ezlegal_nav_cache';

function getCachedNav(): NavGroup[] | null {
  try {
    const raw = sessionStorage.getItem(NAV_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > 5 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedNav(groups: NavGroup[]): void {
  try {
    sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify({ data: groups, ts: Date.now() }));
  } catch {}
}

export async function fetchNavigation(): Promise<NavGroup[]> {
  const cached = getCachedNav();
  if (cached) return cached;

  const [groupsRes, itemsRes] = await Promise.all([
    supabase.from('navigation_groups').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('navigation_items').select('*').eq('is_active', true).order('sort_order'),
  ]);
  const groups = (groupsRes.data ?? []) as Omit<NavGroup, 'items'>[];
  const items = (itemsRes.data ?? []) as NavItem[];

  if (groups.length === 0) return FALLBACK_GROUPS;

  const result = groups.map((g) => ({ ...g, items: items.filter((i) => i.group_id === g.id) }));
  setCachedNav(result);
  return result;
}

export async function fetchBottomNavItems(): Promise<NavItem[]> {
  const { data } = await supabase
    .from('navigation_items')
    .select('*')
    .eq('is_active', true)
    .eq('is_bottom_nav', true)
    .order('sort_order');
  return (data ?? []) as NavItem[];
}

/**
 * Consolidates four legacy top-level groups (Get Help, Solutions, Resources, Trust)
 * into three action-first groups. Deterministic, pure function — safe to call in render.
 *
 *  - "get-help"    → Action-first entry points (keeps Get Help + urgent routes)
 *  - "why-ezlegal" → Merges Solutions + Resources + Trust behind one hub
 *  - "pricing"     → Pricing group preserved as-is
 *
 * Any group not matching these three slugs is passed through so DB-configured
 * extras continue to render while content teams migrate.
 */
export function consolidateNavGroups(groups: NavGroup[]): NavGroup[] {
  const bySlug = new Map(groups.map((g) => [g.slug, g]));
  const get = (slug: string) => bySlug.get(slug);

  const getHelp = get('get-help');
  const solutions = get('solutions');
  const resources = get('resources');
  const trust = get('trust');
  const pricing = get('pricing');

  const consolidated: NavGroup[] = [];

  if (getHelp) consolidated.push(getHelp);

  if (solutions || resources || trust) {
    const merged: NavGroup = {
      id: solutions?.id ?? resources?.id ?? trust?.id ?? 'why-ezlegal',
      slug: 'why-ezlegal',
      label_en: 'Why ezLegal',
      label_es: '¿Por qué ezLegal?',
      sort_order: solutions?.sort_order ?? 2,
      audiences: [],
      items: [
        ...(solutions?.items ?? []),
        ...(resources?.items ?? []),
        ...(trust?.items ?? []),
      ],
    };
    consolidated.push(merged);
  }

  if (pricing) consolidated.push(pricing);

  const known = new Set(['get-help', 'solutions', 'resources', 'trust', 'pricing']);
  for (const g of groups) {
    if (!known.has(g.slug)) consolidated.push(g);
  }

  return consolidated;
}

export async function fetchRouteLabels(): Promise<Map<string, { en: string; es: string }>> {
  const { data } = await supabase
    .from('navigation_items')
    .select('route, breadcrumb_label_en, breadcrumb_label_es')
    .eq('is_active', true);
  const map = new Map<string, { en: string; es: string }>();
  for (const r of data ?? []) {
    map.set(r.route, {
      en: r.breadcrumb_label_en || r.route,
      es: r.breadcrumb_label_es || r.breadcrumb_label_en || r.route,
    });
  }
  return map;
}
