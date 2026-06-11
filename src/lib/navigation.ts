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
    id: 'fallback-help', slug: 'get-help', label_en: 'Get Help', label_es: 'Obtener Ayuda', sort_order: 1, audiences: [],
    items: [
      { id: 'f-chat', group_id: 'fallback-help', slug: 'chat', route: '/chat', icon: 'Sparkles', label_en: 'AI Legal Chat', label_es: 'Chat Legal IA', description_en: 'Ask legal questions and get instant guidance', description_es: 'Haga preguntas legales y obtenga orientacion', breadcrumb_label_en: 'Chat', breadcrumb_label_es: 'Chat', sort_order: 1, is_primary: true, is_bottom_nav: true, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-ask', group_id: 'fallback-help', slug: 'ask', route: '/ask', icon: 'BookOpen', label_en: 'Ask a Question', label_es: 'Hacer una Pregunta', description_en: 'Browse topics and guided answers', description_es: 'Explore temas y respuestas guiadas', breadcrumb_label_en: 'Ask', breadcrumb_label_es: 'Preguntar', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-emergency', group_id: 'fallback-help', slug: 'emergency', route: '/emergency-resources', icon: 'AlertTriangle', label_en: 'Emergency Resources', label_es: 'Recursos de Emergencia', description_en: 'Immediate help for urgent situations', description_es: 'Ayuda inmediata para situaciones urgentes', breadcrumb_label_en: 'Emergency', breadcrumb_label_es: 'Emergencia', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: true, audiences: [] },
    ],
  },
  {
    id: 'fallback-solutions', slug: 'solutions', label_en: 'Solutions', label_es: 'Soluciones', sort_order: 2, audiences: [],
    items: [
      { id: 'f-individuals', group_id: 'fallback-solutions', slug: 'individuals', route: '/for-individuals', icon: 'User', label_en: 'For Individuals', label_es: 'Para Individuos', description_en: 'Personal legal guidance and documents', description_es: 'Orientacion legal personal y documentos', breadcrumb_label_en: 'Individuals', breadcrumb_label_es: 'Individuos', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-business', group_id: 'fallback-solutions', slug: 'business', route: '/for-business', icon: 'Building2', label_en: 'For Business', label_es: 'Para Empresas', description_en: 'SMB legal tools and compliance', description_es: 'Herramientas legales para PYMES', breadcrumb_label_en: 'Business', breadcrumb_label_es: 'Empresas', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-orgs', group_id: 'fallback-solutions', slug: 'organizations', route: '/for-organizations', icon: 'Users', label_en: 'For Organizations', label_es: 'Para Organizaciones', description_en: 'Legal aid and LSO tools', description_es: 'Herramientas para organizaciones legales', breadcrumb_label_en: 'Organizations', breadcrumb_label_es: 'Organizaciones', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-pricing', slug: 'pricing', label_en: 'Pricing', label_es: 'Precios', sort_order: 3, audiences: [],
    items: [
      { id: 'f-pricing', group_id: 'fallback-pricing', slug: 'pricing', route: '/pricing', icon: 'CreditCard', label_en: 'Pricing', label_es: 'Precios', description_en: 'Plans and pricing', description_es: 'Planes y precios', breadcrumb_label_en: 'Pricing', breadcrumb_label_es: 'Precios', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
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
