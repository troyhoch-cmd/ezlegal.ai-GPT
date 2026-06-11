export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRICING: '/pricing',
  CHECKOUT: '/checkout',
  CONTACT: '/contact',
  FEATURES: '/features',
  ABOUT: '/about',
  EZREADS: '/ezreads',
  PRO_BONO: '/pro-bono',
  EMERGENCY_RESOURCES: '/emergency-resources',
  FOR_ORGANIZATIONS: '/for-organizations',
  FOR_BUSINESS: '/for-business',
  FOR_INDIVIDUALS: '/for-individuals',
  FOR_PARTNERS: '/for-partners',
  SHARE_PERSPECTIVE: '/share-perspective',
  SCOPE_DISCLAIMERS: '/scope-disclaimers',
  SCHEDULE_DEMO: '/schedule-demo',
  LSO_DASHBOARD: '/lso-dashboard',
  GRANT_REPORTING: '/grant-reporting',
  AI_GOVERNANCE: '/ai-governance',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  TRUST_CENTER: '/trust-center',
  ENTERPRISE_SECURITY: '/enterprise-security',
  HOW_IT_WORKS: '/how-it-works',
  PARTNER_HUB: '/partner-hub',
  MEDIA_KIT: '/media-kit',
  HOW_REPORTS_REVIEWED: '/how-reports-are-reviewed',
  ESPANOL: '/espanol',
  ES: '/es',
  BUSINESS: '/business',
  PARTNERS: '/partners',
  URGENT_HELP: '/urgent-help',
  ACCESSIBILITY: '/accessibility',
  ACCESS_GATE: '/access',
  NEGOTIATE: '/negotiate',
  SITE_REVIEW: '/site-review',
  SLA: '/sla',
  FIND_ATTORNEY: '/find-attorney',
  ASK: '/ask',
  ISSUE_PACKS: '/issue-packs',
  CASE_PREDICTOR: '/case-predictor',
  CASE_PREDICTOR_START: '/case-predictor/start',
  CHATBOT: '/chatbot',
  CHATBOT_STANDALONE: '/chatbot-standalone',
  DASHBOARD: '/dashboard',
  DASHBOARD_AI_ASSISTANT: '/dashboard/ai-assistant',
  DASHBOARD_CASES: '/dashboard/cases',
  DASHBOARD_MATTERS: '/dashboard/matters',
  DASHBOARD_CLIENTS: '/dashboard/clients',
  DASHBOARD_HISTORY: '/dashboard/history',
  DASHBOARD_DOCUMENTS: '/dashboard/documents',
  DASHBOARD_RESEARCH: '/dashboard/research',
  DASHBOARD_LAWYER_PROFILES: '/dashboard/lawyer-profiles',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_WEBSITE_INTEGRATION: '/dashboard/website-integration',
  ADMIN: '/admin',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

const REDIRECT_MAP: Record<string, string> = {
  '/ez-reads': ROUTES.EZREADS,
  '/terms-of-service': ROUTES.TERMS,
  '/privacy-policy': ROUTES.PRIVACY,
  '/trust-safety': ROUTES.TRUST_CENTER,
  '/app': '/chat',
  '/chatbot': '/chat',
  '/chat-v2': '/chat',
  '/chatbot-standalone': '/chat',
};

const DYNAMIC_PATTERNS = [
  /^\/ask\/[a-z-]+$/,
  /^\/p\/[a-z0-9-]+$/,
  /^\/admin\/.+$/,
  /^\/dashboard\/.+$/,
];

const ALL_STATIC_ROUTES = new Set([
  ...Object.values(ROUTES),
  ...Object.keys(REDIRECT_MAP),
  '/welcome',
]);

export function isValidRoute(path: string): boolean {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (ALL_STATIC_ROUTES.has(cleanPath)) return true;
  return DYNAMIC_PATTERNS.some((p) => p.test(cleanPath));
}

export function getRedirectTarget(path: string): string | null {
  return REDIRECT_MAP[path] || null;
}

export function askTopicRoute(topic: string): string {
  return `${ROUTES.ASK}/${topic}`;
}

export function issuePacksRoute(topic?: string): string {
  return topic ? `${ROUTES.ISSUE_PACKS}?topic=${topic}` : ROUTES.ISSUE_PACKS;
}

export function signupRoute(plan?: string, trial?: number): string {
  const params = new URLSearchParams();
  if (plan) params.set('plan', plan);
  if (trial) params.set('trial', String(trial));
  const qs = params.toString();
  return qs ? `${ROUTES.SIGNUP}?${qs}` : ROUTES.SIGNUP;
}

export function chatbotRoute(query?: string): string {
  if (!query) return '/chat';
  return `/chat?q=${encodeURIComponent(query)}`;
}

export function checkoutRoute(plan: string): string {
  return `${ROUTES.CHECKOUT}?plan=${plan}`;
}
