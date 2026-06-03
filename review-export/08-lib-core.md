# ezLegal.ai Code Review - Core Library

> Supabase client, routing, analytics, i18n, and utilities.

Generated: 2026-06-03T00:51:49.804Z
Files included: 17

---

## src/lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter(Boolean).join(', ');
  throw new Error(
    `Missing required environment variable(s): ${missing}. ` +
    'Copy .env.example to .env and fill in your Supabase project values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

```

---

## src/lib/routes.ts

```typescript
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
  FOR_STARTUPS: '/for-startups',
  FOR_LAW_FIRMS: '/for-law-firms',
  FOR_IN_HOUSE: '/for-in-house',
  LEGAL_READINESS_CHECKLIST: '/resources/legal-readiness-checklist',
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

```

---

## src/lib/i18n.ts

```typescript
export type Language = 'en' | 'es' | 'ar' | 'he';
export type Direction = 'ltr' | 'rtl';

export interface LocaleDescriptor {
  code: Language;
  bcp47: string;
  label: string;
  nativeLabel: string;
  dir: Direction;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleDescriptor[] = [
  { code: 'es', bcp47: 'es-US', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr', flag: 'MX' },
  { code: 'en', bcp47: 'en-US', label: 'English', nativeLabel: 'English', dir: 'ltr', flag: 'US' },
  { code: 'ar', bcp47: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', flag: 'SA' },
  { code: 'he', bcp47: 'he-IL', label: 'Hebrew', nativeLabel: 'עברית', dir: 'rtl', flag: 'IL' },
];

export function getLocaleDescriptor(code: Language): LocaleDescriptor {
  return SUPPORTED_LOCALES.find((l) => l.code === code) ?? SUPPORTED_LOCALES[0];
}

export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'es';
  const candidates = [navigator.language, ...(navigator.languages ?? [])].map((l) => l.toLowerCase());
  for (const c of candidates) {
    const primary = c.split('-')[0];
    const match = SUPPORTED_LOCALES.find((l) => l.code === primary);
    if (match) return match.code;
  }
  return 'es';
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function formatDate(
  value: Date | string | number,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  timezone?: string,
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: timezone }).format(d);
}

export function formatDateTime(
  value: Date | string | number,
  locale: string,
  timezone?: string,
): string {
  return formatDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' }, timezone);
}

export function formatRelativeTime(value: Date | string | number, locale: string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), 'day');
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 604800), 'week');
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
  return rtf.format(Math.round(diffSec / 31536000), 'year');
}

export function formatNumber(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  locale: string,
  currency = 'USD',
): string {
  return formatNumber(value, locale, { style: 'currency', currency });
}

export function formatPercent(value: number, locale: string, fractionDigits = 0): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatList(items: string[], locale: string, type: Intl.ListFormatType = 'conjunction'): string {
  try {
    return new Intl.ListFormat(locale, { style: 'long', type }).format(items);
  } catch {
    return items.join(', ');
  }
}

export function selectPlural(
  value: number,
  locale: string,
  forms: { zero?: string; one: string; two?: string; few?: string; many?: string; other: string },
): string {
  const rule = new Intl.PluralRules(locale).select(value);
  return (forms[rule] ?? forms.other).replace(/\{count\}/g, formatNumber(value, locale));
}

export function applyDirectionToDom(dir: Direction, bcp47: string, lang: Language) {
  const root = document.documentElement;
  const descriptor = getLocaleDescriptor(lang);
  const resolvedDir: Direction = descriptor.dir;
  root.lang = lang;
  root.dir = resolvedDir;
  root.dataset.locale = bcp47;
  root.dataset.dir = resolvedDir;
  if (resolvedDir !== dir) {
    console.warn(`[i18n] dir mismatch: requested ${dir} for ${lang}; enforced ${resolvedDir}`);
  }
  if (document.body) {
    document.body.dir = resolvedDir;
  }
}

export type BilingualText = { en: string; es: string };

export function bl(obj: BilingualText, lang: Language): string {
  return lang === 'es' ? obj.es : obj.en;
}

```

---

## src/lib/translations.ts

```typescript
import type { Language } from './i18n';
export type { Language } from './i18n';

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    'nav.features': 'الميزات',
    'nav.pricing': 'الأسعار',
    'nav.freeHelp': 'مساعدة قانونية مجانية',
    'nav.crisis': 'موارد الطوارئ',
    'nav.reads': 'أدلة قانونية',
    'nav.about': 'من نحن',
    'nav.signIn': 'تسجيل الدخول',
    'nav.dashboard': 'لوحة التحكم',
    'nav.startTrial': 'اسأل مجاناً',
    'nav.howItWorks': 'كيف يعمل',
    'nav.contact': 'اتصل بنا',
    'nav.lawyers': 'ابحث عن محامٍ',
    'nav.profile': 'الملف الشخصي',
    'nav.signOut': 'تسجيل الخروج',
    'nav.menu': 'القائمة',
    'nav.close': 'إغلاق القائمة',
    'nav.getHelp': 'المساعد الذكي',
    'nav.getHelpNow': 'احصل على مساعدة قانونية الآن',
    'hero.badge': 'أسئلة مجانية غير محدودة - بدون تسجيل',
    'hero.title1': 'تستحق إجابات قانونية',
    'hero.title2': 'وفق جدولك الزمني',
    'hero.subtitle': 'يقدم ezLegal.ai معلومات قانونية سريعة وأخلاقية ودعماً ذاتياً عبر مساعد ذكي. احصل على إجابات فورية على مدار الساعة، ثم تواصل مع محامين مرخصين عند الحاجة.',
    'hero.cta1': 'اطرح سؤالك مجاناً',
    'hero.cta2': 'تحقق من الأهلية المجانية',
    'hero.noCreditCard': 'لا تحتاج بطاقة ائتمان',
    'hero.available247': 'متاح على مدار الساعة',
    'hero.disclaimer': 'يقدم ezLegal.ai معلومات قانونية لمساعدتك على فهم وضعك. نحن لسنا مكتب محاماة وهذه ليست استشارة قانونية.',
    'home.headline': 'مساعدة قانونية تتحدث لغتك',
    'home.subheadline': 'اطرح أسئلة قانونية، افهم المستندات، واعثر على خطوات آمنة — بالعربية أو الإنجليزية. مجاني للبدء، بدون بطاقة ائتمان.',
    'home.cta': 'اطرح سؤالاً قانونياً مجاناً',
    'home.trustLine': 'خاص. مجاني. ضمانات يشرف عليها محامون.',
    'home.learnMore': 'اعرف المزيد',
    'home.capability.ask': 'اطرح أسئلة قانونية',
    'home.capability.documents': 'افهم المستندات',
    'home.capability.steps': 'اعثر على خطوات آمنة',
    'home.capability.attorney': 'استعد للمحامي',
    'home.capabilitySr': 'ما يمكنك فعله مع ezLegal.ai',
    'home.howTitle': 'كيف يعمل الآن',
    'home.howSubtitle': 'احصل على وضوح حول وضعك القانوني في ثلاث خطوات بسيطة',
    'home.step1.title': 'صِف وضعك',
    'home.step1.desc': 'أخبرنا بما حدث بلغة بسيطة. لا حاجة لمصطلحات قانونية.',
    'home.step2.title': 'احصل على توجيه واضح',
    'home.step2.desc': 'تلقَّ معلومات سهلة الفهم حول حقوقك وخياراتك.',
    'home.step3.title': 'اتخذ إجراء',
    'home.step3.desc': 'اتبع الخطوات التالية الواضحة، مع إحالات لمحامين عند الحاجة.',
    'home.faqTitle': 'الأسئلة الشائعة',
    'home.faq1.q': 'هل ezLegal.ai بديل عن المحامي؟',
    'home.faq1.a': 'لا. نقدم معلومات قانونية لمساعدتك على فهم وضعك — وليس استشارة قانونية. للمسائل المعقدة، نوصلك بمحامين مرخصين.',
    'home.faq2.q': 'هل معلوماتي خاصة؟',
    'home.faq2.a': 'نعم. نشفر محادثاتك بأمان بنكي ولا نستخدمها لتدريب نماذج الذكاء الاصطناعي.',
    'home.faq3.q': 'هل هو مجاني حقاً؟',
    'home.faq3.a': 'نعم. الأسئلة القانونية الأساسية مجانية تماماً بدون بطاقة ائتمان.',
    'home.faq4.q': 'ما الذي يجعل ezLegal.ai أخلاقياً؟',
    'home.faq4.a': 'نحن شفافون بشأن ما يمكن للذكاء الاصطناعي فعله وما لا يمكنه. نخبرك بوضوح عندما تحتاج محامياً.',
    'home.faq5.q': 'ما مدى دقة المعلومات القانونية؟',
    'home.faq5.a': 'ندرب ذكاءنا الاصطناعي على مصادر قانونية رسمية. لكن القوانين تختلف حسب الولاية. للنصيحة الخاصة بقضيتك، استشر محامياً.',
    'home.readyTitle': 'مستعد للبدء؟',
    'home.readySubtitle': 'انضم إلى الآلاف الذين يحصلون على إجابات واضحة لأسئلتهم القانونية',
    'home.startFree': 'ابدأ الآن - مجاناً',
    'home.chatFirst': 'تفضل الدردشة أولاً؟',
    'trust.certified': 'محمي',
    'trust.encrypted': 'مشفر',
    'cta.title': 'مستعد لفهم خياراتك القانونية؟',
    'cta.subtitle': 'اطرح أسئلة غير محدودة مجاناً واحصل على إجابات في دقائق.',
    'crisis.label': 'هل تواجه الإخلاء أو ICE أو العنف الأسري؟',
    'crisis.cta': 'احصل على مساعدة عاجلة',
    'ask.reassurance': 'يمكنك طرح الأسئلة وتلقي الإجابات بالعربية.',
    'audience.whoWeServe': 'من نخدم',
    'audience.title': 'إرشاد قانوني للجميع',
    'audience.subtitle': 'سواء كنت فرداً أو شركة صغيرة أو منظمة معونة قانونية، لدينا حلول مصممة لاحتياجاتك.',
    'audience.individuals': 'الأفراد والعائلات',
    'audience.business': 'الشركات الصغيرة',
    'audience.lso': 'منظمات المعونة القانونية',
    'trust.private': 'خاص افتراضياً',
    'trust.notAdvice': 'ليست استشارة قانونية',
    'trust.licensed': 'محامون مرخصون',
    'scope.title': 'النطاق وإخلاء المسؤولية',
    'scope.subtitle': 'ezLegal.ai يقدم معلومات قانونية، وليس استشارة قانونية. إليك ما نقوم به وما لا نقوم به.',
    'scope.weDo': 'ما نقوم به',
    'scope.weDont': 'ما لا نقوم به',
    'scope.attorneyClient': 'لا يتم إنشاء علاقة محامٍ-عميل من خلال استخدام ezLegal.ai.',
    'crisisResources.title': 'موارد الأزمة',
    'crisisResources.dvHotline': 'الخط الوطني للعنف الأسري',
    'crisisResources.dvNumber': '1-800-799-7233',
    'crisisResources.call911': 'إذا كنت في خطر فوري، اتصل بـ 911.',
    'crisisResources.call211': 'اتصل بـ 211 للحصول على مساعدة قانونية مجانية في منطقتك.',
    'highRisk.title': 'ربما تحتاج إلى محامٍ الآن',
    'highRisk.immediateHelp': 'هل تحتاج إلى مساعدة فورية؟',
    'system.thinking': 'جارٍ التفكير...',
    'system.answerIn': 'إجابة في ~30 ثانية',
    'system.privateSecure': 'خاص وآمن',
    'notFound.title': 'الصفحة غير موجودة',
    'notFound.subtitle': 'الرابط الذي اتبعته ربما مكسور، أو تمت إزالة الصفحة.',
  },
  he: {
    'nav.features': 'תכונות',
    'nav.pricing': 'תמחור',
    'nav.freeHelp': 'סיוע משפטי חינם',
    'nav.crisis': 'משאבי חירום',
    'nav.reads': 'מדריכים משפטיים',
    'nav.about': 'אודות',
    'nav.signIn': 'התחברות',
    'nav.dashboard': 'לוח בקרה',
    'nav.startTrial': 'שאל בחינם',
    'nav.howItWorks': 'איך זה עובד',
    'nav.contact': 'צור קשר',
    'nav.lawyers': 'מצא עורך דין',
    'nav.profile': 'פרופיל',
    'nav.signOut': 'התנתקות',
    'nav.menu': 'תפריט',
    'nav.close': 'סגור תפריט',
    'nav.getHelp': 'עוזר AI',
    'nav.getHelpNow': 'קבל עזרה משפטית עכשיו',
    'hero.badge': 'שאלות חינם ללא הגבלה - ללא הרשמה',
    'hero.title1': 'מגיעות לך תשובות משפטיות',
    'hero.title2': 'בזמן שלך, בתנאים שלך',
    'hero.subtitle': 'ezLegal.ai מספק מידע משפטי מהיר ואתי ותמיכה עצמית באמצעות עוזר AI. קבל תשובות מיידיות 24/7, ואז התחבר לעורכי דין מורשים כשצריך.',
    'hero.cta1': 'שאל את השאלה שלך בחינם',
    'hero.cta2': 'בדוק זכאות לפרו בונו',
    'hero.noCreditCard': 'אין צורך בכרטיס אשראי',
    'hero.available247': 'זמין 24/7',
    'hero.disclaimer': 'ezLegal.ai מספק מידע משפטי שיעזור לך להבין את מצבך. אנחנו לא משרד עורכי דין וזה לא ייעוץ משפטי.',
    'home.headline': 'עזרה משפטית שמדברת בשפה שלך',
    'home.subheadline': 'שאל שאלות משפטיות, הבן מסמכים ומצא צעדים בטוחים — בעברית או באנגלית. חינם להתחלה, בלי כרטיס אשראי.',
    'home.cta': 'שאל שאלה משפטית בחינם',
    'home.trustLine': 'פרטי. חינם. הגנות בפיקוח עורכי דין.',
    'home.learnMore': 'למידע נוסף',
    'home.capability.ask': 'שאל שאלות משפטיות',
    'home.capability.documents': 'הבן מסמכים',
    'home.capability.steps': 'מצא צעדים בטוחים',
    'home.capability.attorney': 'התכונן לעורך דין',
    'home.capabilitySr': 'מה אתה יכול לעשות עם ezLegal.ai',
    'home.howTitle': 'איך זה עובד עכשיו',
    'home.howSubtitle': 'קבל בהירות על מצבך המשפטי בשלושה צעדים פשוטים',
    'home.step1.title': 'תאר את המצב שלך',
    'home.step1.desc': 'ספר לנו מה קרה בשפה פשוטה. לא צריך ז\'רגון משפטי.',
    'home.step2.title': 'קבל הכוונה ברורה',
    'home.step2.desc': 'קבל מידע קל להבנה על הזכויות והאפשרויות שלך.',
    'home.step3.title': 'פעל',
    'home.step3.desc': 'עקוב אחר צעדים ברורים, עם הפניות לעורכי דין בעת הצורך.',
    'home.faqTitle': 'שאלות נפוצות',
    'home.faq1.q': 'האם ezLegal.ai מחליף עורך דין?',
    'home.faq1.a': 'לא. אנחנו מספקים מידע משפטי — לא ייעוץ משפטי. לעניינים מורכבים, אנחנו מחברים אותך עם עורכי דין מורשים.',
    'home.faq2.q': 'האם המידע שלי פרטי?',
    'home.faq2.a': 'כן. אנחנו מצפינים את השיחות שלך באבטחה בנקאית ואף פעם לא משתמשים בהן לאימון AI.',
    'home.faq3.q': 'האם זה באמת בחינם?',
    'home.faq3.a': 'כן. שאלות משפטיות בסיסיות הן בחינם לחלוטין ללא כרטיס אשראי.',
    'home.faq4.q': 'מה עושה את ezLegal.ai אתי?',
    'home.faq4.a': 'אנחנו שקופים לגבי מה ה-AI שלנו יכול ולא יכול לעשות. אנחנו אומרים לך בבירור מתי אתה צריך עורך דין.',
    'home.faq5.q': 'כמה מדויק המידע המשפטי?',
    'home.faq5.a': 'אנחנו מאמנים את ה-AI שלנו על מקורות משפטיים רשמיים. אבל החוקים משתנים לפי מדינה. לייעוץ ספציפי, התייעץ עם עורך דין.',
    'home.readyTitle': 'מוכן להתחיל?',
    'home.readySubtitle': 'הצטרף לאלפים שמקבלים תשובות ברורות לשאלותיהם המשפטיות',
    'home.startFree': 'התחל עכשיו - בחינם',
    'home.chatFirst': 'מעדיף לשוחח קודם?',
    'trust.certified': 'מוגן',
    'trust.encrypted': 'מוצפן',
    'cta.title': 'מוכן להבין את האפשרויות המשפטיות שלך?',
    'cta.subtitle': 'שאל שאלות ללא הגבלה בחינם וקבל תשובות בדקות.',
    'crisis.label': 'מתמודד עם פינוי, ICE או אלימות במשפחה?',
    'crisis.cta': 'קבל עזרה דחופה',
    'ask.reassurance': 'ניתן לשאול שאלות ולקבל תשובות בעברית.',
    'audience.whoWeServe': 'למי אנחנו משרתים',
    'audience.title': 'הדרכה משפטית לכולם',
    'audience.subtitle': 'בין אם אתה יחיד, עסק קטן או ארגון סיוע משפטי, יש לנו פתרונות המותאמים לצרכים שלך.',
    'audience.individuals': 'יחידים ומשפחות',
    'audience.business': 'עסקים קטנים',
    'audience.lso': 'ארגוני סיוע משפטי',
    'trust.private': 'פרטי כברירת מחדל',
    'trust.notAdvice': 'זה לא ייעוץ משפטי',
    'trust.licensed': 'עורכי דין מורשים',
    'scope.title': 'היקף והצהרות',
    'scope.subtitle': 'ezLegal.ai מספק מידע משפטי, לא ייעוץ משפטי. הנה מה שאנחנו עושים ולא עושים.',
    'scope.weDo': 'מה אנחנו עושים',
    'scope.weDont': 'מה אנחנו לא עושים',
    'scope.attorneyClient': 'שימוש ב-ezLegal.ai אינו יוצר יחסי עורך-דין לקוח.',
    'crisisResources.title': 'משאבי חירום',
    'crisisResources.dvHotline': 'קו חם לאומי לאלימות במשפחה',
    'crisisResources.dvNumber': '1-800-799-7233',
    'crisisResources.call911': 'אם אתה בסכנה מיידית, חייג 911.',
    'crisisResources.call211': 'חייג 211 לסיוע משפטי חינם באזור שלך.',
    'highRisk.title': 'ייתכן שאתה צריך עורך דין עכשיו',
    'highRisk.immediateHelp': 'צריך עזרה מיידית?',
    'system.thinking': 'חושב...',
    'system.answerIn': 'תשובה תוך ~30 שניות',
    'system.privateSecure': 'פרטי ומאובטח',
    'notFound.title': 'הדף לא נמצא',
    'notFound.subtitle': 'הקישור שעקבת אחריו עשוי להיות שבור, או שהדף הוסר.',
  },
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.freeHelp': 'Pro Bono Legal Aid',
    'nav.crisis': 'Crisis Resources',
    'nav.reads': 'Legal Guides',
    'nav.about': 'About',
    'nav.signIn': 'Sign In',
    'nav.dashboard': 'Dashboard',
    'nav.startTrial': 'Ask Free',
    'nav.forOrgs': 'For Legal Aid Organizations',
    'nav.forLSOs': 'For LSOs',
    'nav.howItWorks': 'How It Works',
    'nav.contact': 'Contact',
    'nav.lawyers': 'Find Lawyers',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'nav.menu': 'Menú',
    'nav.close': 'Close menu',
    'nav.getHelp': 'AI Chatbot',
    'nav.getHelpNow': 'Get Legal Help Now',
    'nav.legalGuides': 'Legal Guides',
    'nav.findAttorney': 'Find Attorney',
    'nav.askFree': 'Ask My Question Free',
    'nav.trustSafety': 'Trust & Safety',
    'nav.askQuestion': 'Ask Your Question',
    'nav.askQuestionDesc': 'Type any legal question in plain English',
    'nav.browseGuides': 'Browse Legal Guides',
    'nav.browseGuidesDesc': 'Read plain-language articles on common issues',
    'nav.findAttorneyDesc': 'Browse our directory when you need representation',
    'nav.howAiWorks': 'How Our AI Works',
    'nav.scopeDisclaimers': 'Scope & Disclaimers',
    'nav.aiGovernance': 'AI Governance',
    'nav.partnerProgram': 'Partner Program',
    'nav.viewProfile': 'View Profile',
    'nav.adminDashboard': 'Admin Dashboard',

    // Hero Section
    'hero.badge': 'Unlímited Free Questions - No Signup Required',
    'hero.title1': 'You Deserve Legal Answers',
    'hero.title2': 'On Your Schedule, On Your Terms',
    'hero.subtitle': 'ezLegal.ai provides fast, ethical legal information and self-help support through an AI assistant. Get instant answers 24/7, then connect with licensed attorneys when you need them. We work alongside the legal profession to expand access to justice.',
    'hero.cta1': 'Ask My Question Free',
    'hero.cta2': 'Check Pro Bono Eligibility',
    'hero.noCreditCard': 'No credit card required',
    'hero.cancelAnytime': 'Cancel anytime',
    'hero.moneyBack': 'Money-back guarantee',
    'hero.spanish': 'Also available in Spanish',
    'hero.available247': 'Available 24/7',
    'hero.disclaimer': "ezLegal.ai provides legal information to help you understand your situation. We are not a law firm and this is not legal advice. For representation in court, we'll help you find an attorney.",

    // Home page
    'home.headline': 'Understand your legal problem, know your next step, get connected to help',
    'home.subheadline': 'Ask legal questions, understand documents, and find safe next steps — in plain English or Spanish. Free to start, no credit card.',
    'home.cta': 'Ask a free legal question',
    'home.urgentCta': 'Facing eviction, ICE, domestic violence, or a deadline? Get urgent help',
    'home.trustLine': 'Private. Free. Attorney-informed safeguards.',
    'home.learnMore': 'Learn more',
    'home.capability.ask': 'Ask legal questions',
    'home.capability.documents': 'Understand documents',
    'home.capability.steps': 'Find safe next steps',
    'home.capability.attorney': 'Prepare for an attorney',
    'home.capabilitySr': 'What you can do with ezLegal.ai',
    'home.howTitle': 'How It Works Now',
    'home.howSubtitle': 'Get clarity on your legal situation in three simple steps',
    'home.step1.title': 'Describe Your Situation',
    'home.step1.desc': 'Tell us what happened in plain language. No legal jargon required.',
    'home.step2.title': 'Get Clear Guidance',
    'home.step2.desc': 'Receive easy-to-understand information about your rights and options.',
    'home.step3.title': 'Take Action',
    'home.step3.desc': 'Follow clear next steps, with attorney referrals when needed.',
    'home.faqTitle': 'Frequently Asked Questions',
    'home.faq1.q': 'Is ezLegal.ai a replacement for a lawyer?',
    'home.faq1.a': 'No. We provide legal information to help you understand your situation — not legal advice. For complex matters or court representation, we connect you with licensed attorneys through our referral network.',
    'home.faq2.q': 'Is my information private?',
    'home.faq2.a': 'Yes. We encrypt your conversations with bank-level security and never use them to train AI models. We follow California privacy law (CCPA). Note: because we are not a law firm, attorney-client privilege does not apply to these conversations.',
    'home.faq3.q': 'Is it really free?',
    'home.faq3.a': 'Yes. Basic legal Q&A is completely free with no credit card required. You only pay if you choose optional premium features like detailed action plans or document templates.',
    'home.faq4.q': 'What makes ezLegal.ai ethical?',
    'home.faq4.a': 'We are transparent about what our AI can and cannot do. We tell you clearly when you need a lawyer. We never replace a lawyer\'s judgment. We maintain strict privacy standards and monitor every AI response for quality and safety.',
    'home.faq5.q': 'How accurate is the legal information?',
    'home.faq5.a': 'We train our AI on official legal sources, and legal professionals review it regularly. However, laws vary by state and change often. We provide general information — for advice about your specific case, consult a licensed attorney.',
    'home.readyTitle': 'Ready to Get Started?',
    'home.readySubtitle': 'Join thousands getting clear answers to their legal questions',
    'home.startFree': "Start Now - It's Free",
    'home.chatFirst': 'Prefer to chat first?',

    // Stats
    'stats.rating': 'Average Rating',
    'stats.helped': 'People Helped',
    'stats.attorneys': 'Bar-Verified Attorneys',
    'stats.experience': 'Avg. Experience',
    'stats.confidential': 'Confidential',

    // Trust Badges
    'trust.soc2': 'TLS 1.3 + AES-256',
    'trust.certified': 'Protected',
    'trust.ssl': 'TLS 1.3 + AES-256',
    'trust.encrypted': 'Encrypted',
    'trust.aba': 'ABA Compliant',
    'trust.ethics': 'Ethics Standards',
    'trust.barVerified': 'Bar-Verified',
    'trust.allAttorneys': 'All Attorneys',
    'trust.lsos': 'Growing LSO Network',
    'trust.trustUs': 'Trust Us',

    // Quick Actions / Topics
    'topics.title': 'What brought you here today?',
    'topics.subtitle': 'Select your situation to get started with personalized help',
    'topics.immigration': 'Immigration concerns',
    'topics.immigrationDesc': 'Deportation, visas, status',
    'topics.housing': 'Housing & eviction',
    'topics.housingDesc': 'Landlord issues, rent, lease',
    'topics.family': 'Family matters',
    'topics.familyDesc': 'Divorce, custody, support',
    'topics.employment': 'Employment & wages',
    'topics.employmentDesc': 'Unpaid wages, fired unfairly',
    'topics.debt': 'Debt & collections',
    'topics.debtDesc': 'Collectors, bankruptcy',
    'topics.criminal': 'Criminal & bail',
    'topics.criminalDesc': 'Arrests, charges, bail bonds',
    'topics.traffic': 'Traffic & licenses',
    'topics.trafficDesc': 'Tickets, DUI, suspended license',
    'topics.other': 'Something else',
    'topics.otherDesc': 'Ask any legal question',
    'topics.crisis': 'In immediate danger? Get crisis resources',

    // Features Section
    'features.badge': 'Legal Information Made Accessible',
    'features.title': 'Understand Your Legal Options. Make Informed Decisions.',
    'features.subtitle': 'AI-powered legal information and self-help tools that empower you to navigate your situation with confidence. Connect with attorneys when you need them.',
    'features.aiMatch.title': 'AI + Real Lawyer Match',
    'features.aiMatch.quote': '"My eviction notice had me panicking."',
    'features.aiMatch.desc': 'Get instant AI answers PLUS see matching attorneys instantly. Chat with AI, browse real lawyers, and book consultations - all in one place.',
    'features.aiChat.title': '24/7 AI Legal Assistant',
    'features.aiChat.quote': '"It was 2 AM and I needed quick answers."',
    'features.aiChat.desc': 'Simple AI chat for fast legal information. Perfect for quick questions about contracts, employment rights, landlord issues. No lawyer matching - just instant answers.',
    'features.docs.title': 'Legal Documents in Minutes',
    'features.docs.quote': '"I needed a quick NDA before my meeting."',
    'features.docs.desc': 'Choose a template, fill in the blanks, download instantly. NDAs, service agreements, rental contracts, employment offers. For complex documents, connect with an attorney for review.',
    'features.directory.title': 'Vetted Attorney Directory',
    'features.directory.quote': '"I needed a real lawyer, not a marketplace."',
    'features.directory.desc': 'Browse Arizona attorneys by practice area, location, and client ratings. Filter by specialty, see profiles, read reviews, contact directly. No middleman fees.',
    'features.research.title': 'Legal Research Database',
    'features.research.quote': '"I needed to understand the law myself."',
    'features.research.desc': 'Search contract law, employment rights, intellectual property by category. Get summaries of statutes, case law, and legal principles. Research now, no signup needed.',
    'features.cases.title': 'Case & Deadline Manager',
    'features.cases.quote': '"I had 3 legal matters and couldn\'t keep track."',
    'features.cases.desc': 'Organize multiple cases, set deadline reminders, track progress. Store case documents, notes, and contact info. Requires account to save your data.',

    // Calculator
    'calculator.badge': 'Savings Calculator',
    'calculator.title': 'Calculate Your Savings',
    'calculator.subtitle': 'See how much you could save compared to traditional legal fees.',
    'calculator.hours': 'Hours of legal help needed per month',
    'calculator.rate': 'Average attorney hourly rate',
    'calculator.potential': 'Your potential savings',
    'calculator.perMonth': 'per month',
    'calculator.traditional': 'Traditional attorney cost',
    'calculator.ezlegal': 'ezLegal.ai Basic',
    'calculator.save': 'Save',
    'calculator.onLegal': 'on legal costs',
    'calculator.cta': 'Start Saving Today',

    // Testimonials
    'testimonials.title': 'What Our Clients Say',
    'testimonials.subtitle': 'Real stories from real people we\'ve helped',

    // Pricing
    'pricing.title': 'Free to Get Started',
    'pricing.subtitle': 'Ask unlimited questions free. Pay only for Issue Packs when you need them.',
    'pricing.starter': 'Free',
    'pricing.starterPrice': '$0',
    'pricing.starterDesc': 'Unlímited questions forever',
    'pricing.essential': 'Issue Packs',
    'pricing.essentialPrice': '$29-$49',
    'pricing.essentialDesc': 'Action plans when you need them',
    'pricing.professional': 'Business',
    'pricing.professionalPrice': '$99+',
    'pricing.professionalDesc': 'For teams & organizations',
    'pricing.bestValue': 'BEST VALUE',
    'pricing.guarantee': '30-Day Money-Back Guarantee',
    'pricing.guaranteeDesc': 'Try ezLegal.ai risk-free. If you\'re not satisfied, we\'ll refund every penny.',
    'pricing.month': '/month',
    'pricing.annually': 'billed annually',
    'pricing.popular': 'Most Popular',
    'pricing.startFree': 'Start Free',
    'pricing.startTrial': 'Start Free',
    'pricing.contactSales': 'Contact Sales',
    'pricing.feature.questions': 'questions/month',
    'pricing.feature.unlimited': 'Unlimited questions',
    'pricing.feature.aiChat': 'AI legal assistant',
    'pricing.feature.templates': 'Document templates',
    'pricing.feature.research': 'Legal research access',
    'pricing.feature.lawyer': 'Lawyer matching',
    'pricing.feature.priority': 'Priority support',
    'pricing.feature.team': 'Team access',
    'pricing.feature.api': 'API access',

    // CTA
    'cta.title': 'Ready to Understand Your Legal Options?',
    'cta.subtitle': 'Ask unlimited questions free and get answers in minutes, not days.',
    'cta.questions': 'Questions?',
    'cta.contactUs': 'Contact us',
    'cta.anytime': 'anytime.',
    'cta.getStarted': 'Get Started Free',

    // Video
    'video.title': 'See How ezLegal.ai Works',
    'video.subtitle': 'Watch how Maria saved her family\'s home with ezLegal.ai',
    'video.watch': 'Watch Video',
    'video.duration': '2:34',

    // Partners
    'partners.title': 'Trusted by Legal Professionals',
    'partners.subtitle': 'Partnering with Arizona\'s leading legal organizations',
    'partners.featured': 'As Featured In',

    // Footer
    'footer.description': 'Making legal information accessible to everyone through AI-powered assistance.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.support': 'Support',
    'footer.helpCenter': 'Help Center',
    'footer.community': 'Community',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.accessibility': 'Accessibility',
    'footer.aiGovernance': 'AI Governance',
    'footer.trustCenter': 'Trust Center',
    'footer.copyright': 'All rights reserved.',
    'footer.disclaimer': 'ezLegal.ai provides legal information, not legal advice. We are not a law firm.',
    'footer.careers': 'Careers',
    'footer.blog': 'Blog',
    'footer.press': 'Press',
    'footer.legalNotice': 'Important Legal Notice',
    'footer.notLawFirm': 'ezLegal.ai provides legal information, not legal advice.',
    'footer.legalNoticeText': 'We are not a law firm, and use of this service does not create an attorney-client relationship. Your communications with ezLegal.ai are not protected by attorney-client privilege. For complex matters, court representation, or personalized legal advice, please consult with a licensed attorney in your jurisdiction.',
    'footer.crisisResources': 'Crisis Resources',
    'footer.freeLegalAid': 'Free Legal Aid',
    'footer.findAttorney': 'Find an Attorney',
    'footer.poweredBy': 'Powered by',
    'footer.forOrganizations': 'For Organizations',
    'footer.enterpriseSecurity': 'Enterprise Security',
    'footer.reportConcern': 'Report a Concern',
    'footer.howReportsReviewed': 'How Reports Are Reviewed',
    'footer.proBonoServices': 'Pro Bono Services',
    'footer.attorneyDirectory': 'Attorney Directory',
    'footer.aboutAiData': 'About Our AI & Data Practices',
    'footer.dataNotUsed': 'Your data is never used to train our AI models',
    'footer.encrypted': 'TLS 1.3 + AES-256 encryption on SOC 2 Type II certified infrastructure (Supabase)',
    'footer.deleteData': 'You can request deletion of your data at any time',
    'footer.ccpaCompliant': 'We comply with CCPA and honor data access requests',
    'footer.aiCitations': 'AI responses include citations and jurisdiction context where available',
    'footer.legalFreshness': 'Legal Information Freshness',
    'footer.citationDatabase': 'Citation Database',
    'footer.citationUpdated': 'Updated weekly from official state and federal sources',
    'footer.courtInfo': 'Court Information',
    'footer.courtUpdated': 'Refreshed monthly; significant rulings added within 48 hours',
    'footer.verificationCycle': 'Verification Cycle',
    'footer.verificationText': 'Sources verified against official databases every 30 days',
    'footer.lastUpdate': 'Last System Update',
    'footer.lastUpdateDate': 'January 2026',
    'footer.lawsVary': 'Laws vary by jurisdiction and change frequently. Always verify current status with official sources before taking action.',
    'footer.commitmentText': 'ezLegal.ai is committed to ethical AI practices and expanding access to justice. We partner with legal aid organizations and bar associations to help connect individuals with volunteer attorneys. Our "Lawyer Match" feature is an attorney directory, not a referral service - we do not receive compensation for attorney recommendations.',
    'footer.patentPending': 'U.S. PATENT PENDING',
    'footer.patentText': 'Covered technology includes compliance-aware retrieval, provenance tracking, and ethical ingestión constraints.',

    // Auth - Login
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Sign in to your account',
    'auth.login.email': 'Email address',
    'auth.login.password': 'Password',
    'auth.login.remember': 'Remember me',
    'auth.login.forgot': 'Forgot password?',
    'auth.login.submit': 'Sign In',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.signUp': 'Sign up',
    'auth.login.or': 'Or continue with',
    'auth.login.google': 'Continue with Google',
    'auth.login.error': 'Invalid email or password',
    'auth.login.success': 'Welcome back!',
    'login.usersOnline': 'users online now',
    'login.welcomeBack': 'Welcome Back to Affordable Legal Information',
    'login.continueHelp': 'Continue getting the legal assistance you need without breaking the bank.',
    'login.freeToStart': '$0 to Get Started',
    'login.freeForever': 'Free Forever Plan Available',
    'login.noCreditCard': 'No credit card needed. 10 AI legal consultations per month, always free.',
    'login.peopleHelped': 'people have used ezLegal.ai for legal information',
    'login.ethicalAi': 'Ethical AI',
    'login.neverTrains': 'that never trains on your private legal data',
    'login.access247': '24/7 Access',
    'login.wheneverYouNeed': 'to AI legal information whenever you need it',
    'login.bankSecurity': 'TLS 1.3 + AES-256',
    'login.encryption': 'with enterprise-grade encryption',
    'login.recentLogin': 'Recent login from',
    'login.enterPassword': 'Enter your password',
    'login.signingIn': 'Signing in...',
    'login.viewPricing': 'View Pricing Plans',

    // Auth - Signup
    'auth.signup.title': 'Create your account',
    'auth.signup.subtitle': 'Free unlimited questions, no credit card required',
    'auth.signup.name': 'Full name',
    'auth.signup.email': 'Email address',
    'auth.signup.password': 'Password',
    'auth.signup.confirm': 'Confirm password',
    'auth.signup.terms': 'I agree to the',
    'auth.signup.termsLink': 'Terms of Service',
    'auth.signup.and': 'and',
    'auth.signup.privacyLink': 'Privacy Policy',
    'auth.signup.submit': 'Create Account',
    'auth.signup.hasAccount': 'Already have an account?',
    'auth.signup.signIn': 'Sign in',
    'auth.signup.success': 'Account created successfully!',
    'auth.signup.error': 'Failed to create account',
    'auth.signup.passwordMismatch': 'Passwords do not match',
    'auth.signup.passwordWeak': 'Password must be at least 8 characters',

    // Auth - Forgot Password
    'auth.forgot.title': 'Reset your password',
    'auth.forgot.subtitle': 'Enter your email and we\'ll send you a reset link',
    'auth.forgot.email': 'Email address',
    'auth.forgot.submit': 'Send Reset Link',
    'auth.forgot.back': 'Back to sign in',
    'auth.forgot.success': 'Check your email for the reset link',
    'auth.forgot.error': 'Failed to send reset link',

    // Auth - Reset Password
    'auth.reset.title': 'Set new password',
    'auth.reset.subtitle': 'Enter your new password below',
    'auth.reset.password': 'New password',
    'auth.reset.confirm': 'Confirm new password',
    'auth.reset.submit': 'Reset Password',
    'auth.reset.success': 'Password reset successfully',
    'auth.reset.error': 'Failed to reset password',

    // Chatbot
    'chat.title': 'AI Legal Assistant',
    'chat.subtitle': 'Ask any legal question',
    'chat.placeholder': 'Type your legal question...',
    'chat.send': 'Send',
    'chat.thinking': 'Thinking...',
    'chat.disclaimer': 'This is legal information, not legal advice. For specific guidance, consult an attorney.',
    'chat.newChat': 'New Chat',
    'chat.history': 'Chat History',
    'chat.clear': 'Clear Chat',
    'chat.copy': 'Copy',
    'chat.copied': 'Copied!',
    'chat.share': 'Share',
    'chat.download': 'Download',
    'chat.helpful': 'Was this helpful?',
    'chat.yes': 'Yes',
    'chat.no': 'No',
    'chat.connectLawyer': 'Connect with a Lawyer',
    'chat.suggestedQuestions': 'Suggested Questions',
    'chat.welcome': 'Hello! I\'m your AI legal assistant. How can I help you today?',
    'chat.error': 'Sorry, something went wrong. Please try again.',
    'chat.rateLimit': 'You\'ve reached the free question limit. Sign up for unlimited access.',
    'chat.upgrade': 'Upgrade for Unlimited',

    // About Page
    'about.title': 'About ezLegal.ai',
    'about.subtitle': 'Making justice accessible to everyone',
    'about.mission.title': 'Our Mission',
    'about.mission.text': 'To democratize access to legal information and connect people with the legal help they need.',
    'about.story.title': 'Our Story',
    'about.story.text': 'ezLegal.ai was founded to bridge the gap between those who need legal help and those who can provide it.',
    'about.team.title': 'Our Team',
    'about.values.title': 'Our Values',
    'about.values.access': 'Access to Justice',
    'about.values.accessDesc': 'Everyone deserves to understand their legal rights.',
    'about.values.ethics': 'Ethical AI',
    'about.values.ethicsDesc': 'We build AI that is transparent, fair, and accountable.',
    'about.values.privacy': 'Privacy First',
    'about.values.privacyDesc': 'Your data is yours. We protect it like our own.',
    'about.values.quality': 'Quality Information',
    'about.values.qualityDesc': 'Accurate, up-to-date legal information you can trust.',

    // Contact Page
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'re here to help',
    'contact.name': 'Your name',
    'contact.email': 'Email address',
    'contact.subject': 'Subject',
    'contact.message': 'Your message',
    'contact.submit': 'Send Message',
    'contact.success': 'Message sent successfully!',
    'contact.error': 'Failed to send message. Please try again.',
    'contact.office': 'Our Office',
    'contact.hours': 'Business Hours',
    'contact.phone': 'Phone',
    'contact.support': 'Support',
    'contact.sales': 'Sales',
    'contact.partnerships': 'Partnerships',

    // Features Page Overview
    'features.page.title': 'Features',
    'features.page.subtitle': 'Everything you need to navigate legal matters',
    'features.overview.ai.title': 'AI-Powered Assistance',
    'features.overview.ai.desc': 'Get instant answers to your legal questions 24/7',
    'features.overview.documents.title': 'Document Generation',
    'features.overview.documents.desc': 'Create legal documents in minutes',
    'features.overview.lawyers.title': 'Lawyer Matching',
    'features.overview.lawyers.desc': 'Connect with verified attorneys when you need them',
    'features.overview.research.title': 'Legal Research',
    'features.overview.research.desc': 'Access comprehensive legal databases',
    'features.overview.tracking.title': 'Case Tracking',
    'features.overview.tracking.desc': 'Manage deadlines and documents',
    'features.overview.multilingual.title': 'Multilingual Support',
    'features.overview.multilingual.desc': 'Available in English and Spanish',

    // How It Works
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Get legal help in 3 simple steps',
    'howItWorks.step1.title': 'Ask Your Question',
    'howItWorks.step1.desc': 'Type your legal question in plain language',
    'howItWorks.step2.title': 'Get AI Guidance',
    'howItWorks.step2.desc': 'Receive instant, accurate legal information',
    'howItWorks.step3.title': 'Connect if Needed',
    'howItWorks.step3.desc': 'Match with a lawyer for complex matters',

    // Emergency Resources
    'emergency.title': 'Emergency Legal Resources',
    'emergency.subtitle': 'Immediate help when you need it most',
    'emergency.crisis.title': 'In Crisis?',
    'emergency.crisis.desc': 'If you\'re in immediate danger, call 911',
    'emergency.domestic': 'Domestic Violence Hotline',
    'emergency.suicide': 'Suicide Prevention Lifeline',
    'emergency.legal': 'Emergency Legal Aid',
    'emergency.housing': 'Housing Crisis Line',

    // Pro Bono
    'probono.title': 'Pro Bono Legal Aid',
    'probono.subtitle': 'Free legal help for those who qualify',
    'probono.eligibility': 'Check Your Eligibility',
    'probono.income': 'Income Requirements',
    'probono.apply': 'Apply Now',
    'probono.status': 'Check Application Status',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.recentChats': 'Recent Chats',
    'dashboard.savedDocs': 'Saved Documents',
    'dashboard.upcomingDeadlines': 'Upcoming Deadlines',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.usage': 'Usage This Month',
    'dashboard.questionsLeft': 'questions remaining',
    'dashboard.unlimited': 'Unlimited',

    // Common Actions
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.back': 'Back',
    'common.continue': 'Continue',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.or': 'or',
    'common.and': 'and',
    'common.learnMore': 'Learn More',
    'common.seeAll': 'See All',
    'common.viewAll': 'View All',
    'common.showMore': 'Show More',
    'common.showLess': 'Show Less',

    // Form Validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email',
    'validation.phone': 'Please enter a valid phone number',
    'validation.minLength': 'Must be at least {min} characters',
    'validation.maxLength': 'Must be no more than {max} characters',
    'validation.passwordMatch': 'Passwords must match',

    // Errors
    'error.notFound': 'Page not found',
    'error.unauthorized': 'Please sign in to continue',
    'error.forbidden': 'You don\'t have permission to access this',
    'error.server': 'Something went wrong on our end',
    'error.network': 'Please check your internet connection',
    'error.timeout': 'Request timed out. Please try again.',

    // Legal Disclaimers
    'disclaimer.notAdvice': 'This is legal information, not legal advice.',
    'disclaimer.notLawFirm': 'ezLegal.ai is not a law firm.',
    'disclaimer.consultAttorney': 'For specific legal advice, please consult an attorney.',
    'disclaimer.noGuarantee': 'Results may vary based on individual circumstances.',

    // Accessibility
    'a11y.skipToMain': 'Skip to main content',
    'a11y.openMenu': 'Open menu',
    'a11y.closeMenu': 'Close menu',
    'a11y.loading': 'Loading content',
    'a11y.newWindow': 'Opens in new window',

    // Schedule Demo
    'demo.title': 'Schedule a Demo',
    'demo.subtitle': 'See how ezLegal.ai can help your organization',
    'demo.name': 'Your name',
    'demo.email': 'Work email',
    'demo.company': 'Organization name',
    'demo.role': 'Your role',
    'demo.size': 'Organization size',
    'demo.submit': 'Request Demo',
    'demo.success': 'Demo request submitted! We\'ll be in touch soon.',

    // Navigation extras
    'nav.negotiate': 'Negotiate',
    'nav.negotiatePlanner': 'Negotiation Planner',
    'nav.howItWorksMenu': 'How It Works',
    'nav.howEzlegalWorks': 'How ezLegal.ai Works',
    'nav.describeSituation': 'Describe Your Situation',
    'nav.describeSituationDesc': 'Ask any legal question in plain language',
    'nav.getJurisdictionInfo': 'Get Jurisdiction-Specific Info',
    'nav.getJurisdictionInfoDesc': 'See how our AI tailors answers to your location',
    'nav.takeNextSteps': 'Take Clear Next Steps',
    'nav.takeNextStepsDesc': 'Action plans, templates & attorney referrals',

    // Legal Guides
    'ezreads.title': 'Legal Guides',
    'ezreads.subtitle': 'Legal articles written in plain language',
    'ezreads.readMore': 'Read More',
    'ezreads.categories': 'Categories',
    'ezreads.recent': 'Recent Articles',
    'ezreads.popular': 'Popular Articles',
    'ezreads.search': 'Search articles...',
    'ezreads.heroTitle': 'Legal Knowledge Made Simple',
    'ezreads.heroSubtitle': 'Plain-English articles about your legal rights, common legal situations, and how to handle them. Written for real people, not lawyers.',
    'ezreads.browseByCategory': 'Browse by Category',
    'ezreads.allStates': 'All States',
    'ezreads.clearAll': 'Clear All',
    'ezreads.clearSearch': 'Clear search',
    'ezreads.featuredArticle': 'Featured Article',
    'ezreads.popularThisWeek': 'Most popular this week',
    'ezreads.readArticle': 'Read Article',
    'ezreads.generalGuidance': 'General guidance -- laws vary by state',
    'ezreads.recentArticles': 'Recent Articles',
    'ezreads.searchResults': 'Search Results',
    'ezreads.articlesAbout': 'articles about',
    'ezreads.articlesMatching': 'articles matching your search',
    'ezreads.latestGuides': 'Latest legal guides and resources',
    'ezreads.noArticles': 'No articles found',
    'ezreads.noArticlesSearch': 'Try different keywords or browse by category.',
    'ezreads.noArticlesCategory': 'Check back soon for new content in this category.',
    'ezreads.clearAllFilters': 'Clear All Filters',
    'ezreads.stayInformed': 'Stay Informed About Your Legal Rights',
    'ezreads.stayInformedDesc': 'Get the latest legal guides and resources delivered to your inbox. No jargon, just práctical information you can use.',
    'ezreads.enterEmail': 'Enter your email',
    'ezreads.subscribe': 'Subscribe',
    'ezreads.freeResources': 'Free resources - No spam - Unsubscribe anytime',
    'ezreads.loadingArticles': 'Loading articles...',
    'ezreads.showingResults': 'Showing results for',
    'ezreads.attorneyReviewed': 'Attorney Reviewed',
    'ezreads.officialSources': 'Official Sources',
    'ezreads.category.housingLaw': 'Housing Law',
    'ezreads.category.employmentLaw': 'Employment Law',
    'ezreads.category.consumerProtection': 'Consumer Protection',
    'ezreads.category.familyLaw': 'Family Law',
    'ezreads.category.willsProbate': 'Wills & Probate',
    'ezreads.category.civilLaw': 'Civil Law',
    'ezreads.category.housingExamples': 'Repairs, deposits, eviction notices',
    'ezreads.category.employmentExamples': 'Wages, discrimination, wrongful termination',
    'ezreads.category.consumerExamples': 'Debt collectors, scams, refunds',
    'ezreads.category.familyExamples': 'Divorce, custody, child support',
    'ezreads.category.willsExamples': 'Wills, trusts, estate planning',
    'ezreads.category.civilExamples': 'Small claims, lawsuits, disputes',

    // Article Modal
    'article.loading': 'Loading article...',
    'article.backToArticles': 'Back to articles',
    'article.share': 'Share',
    'article.save': 'Save',
    'article.attorneyReviewed': 'Attorney Reviewed',
    'article.officialSources': 'Official Sources',
    'article.generalGuidance': 'General guidance — laws vary by state',
    'article.lastReviewed': 'Last reviewed',
    'article.notFound': 'Article not found',
    'article.goBack': 'Go back',
    'article.needGuidance': 'Need personalized legal guidance?',
    'article.aiCanHelp': 'Our AI assistant can help you understand how these laws apply to your specific situation.',
    'article.askAiAssistant': 'Ask Our AI Assistant',
    'article.closeArticle': 'Close article',

    // Guides Search
    'guides.searchPlaceholder': 'Search guides or describe your situation...',
    'guides.searchLabel': 'Search legal guides',
    'guides.clearSearch': 'Clear search',
    'guides.commonSituations': 'Common situations',
    'guides.popular': 'Popular:',
    'guides.quick.securityDeposit': 'security deposit',
    'guides.quick.eviction': 'eviction',
    'guides.quick.wageTheft': 'wage theft',
    'guides.quick.childCustody': 'child custody',
    'guides.quick.debtCollector': 'debt collector',
    'guides.quick.smallClaims': 'small claims',

    // Urgent Help Banner
    'urgent.housingMessage': 'Facing an eviction or unsafe living conditions?',
    'urgent.housingDetail': 'Free housing counseling is available 24/7.',
    'urgent.familyMessage': 'In an unsafe situation at home?',
    'urgent.familyDetail': 'Confidential support is available 24/7.',
    'urgent.allResources': 'All Resources',

    // Safety Escalation Strip
    'safety.needMore': 'Need more than a guide?',
    'safety.urgentHelp': 'Urgent Help',
    'safety.freeLegalAid': 'Free Legal Aid',
    'safety.findLawyer': 'Find a Lawyer',

    // Signup Page
    'signup.freeBanner': 'Unlímited Free Questions - No Credit Card Required',
    'signup.heroTitle': 'Get Legal Answers',
    'signup.heroHighlight': 'Without the Price Tag',
    'signup.heroSuffix': '',
    'signup.heroSubtitle': 'Ask unlimited legal questions for free. When you need action plans or document help, affordable Issue Packs start at just $29.',
    'signup.benefit1Title': 'Unlimited Free Questions',
    'signup.benefit1Desc': 'Ask as many legal questions as you want, forever. No limits, no tricks.',
    'signup.benefit2Title': 'Save Thousands on Legal Costs',
    'signup.benefit2Desc': 'Issue Packs from $29 vs. $300+/hour attorney fees for basic guidance.',
    'signup.benefit3Title': 'Licensed Attorney Network',
    'signup.benefit3Desc': 'When you need a real lawyer, we connect you with bar-verified attorneys in Arizona.',
    'signup.benefit4Title': 'TLS 1.3 + AES-256 Privacy',
    'signup.benefit4Desc': 'Your data is encrypted and never used to train AI models. SOC 2 certified infrastructure.',
    'signup.socialProof': 'People across Arizona use ezLegal.ai for legal information',
    'signup.mobileTitle': 'Create Your Free Account',
    'signup.mobileSubtitle': 'Unlimited questions, no credit card required',
    'signup.freeForever': 'Free Forever',
    'signup.formTitle': 'Create Your Free Account',
    'signup.formSubtitle': 'Takes less than 30 seconds',
    'signup.unlimitedQuestions': 'Unlimited AI Legal Questions Included',
    'signup.payOnlyForPacks': 'Pay only for Issue Packs when you need action plans',
    'signup.continueGoogle': 'Continue with Google',
    'signup.continueMicrosoft': 'Continue with Microsoft',
    'signup.orEmail': 'or sign up with email',
    'signup.createPassword': 'Create a password',
    'signup.confirmPassword': 'Confirm your password',
    'signup.creating': 'Creating account...',
    'signup.createFreeAccount': 'Create Free Account',
    'signup.guarantee': '30-day guarantee',
    'signup.secure': 'SSL secured',
    'signup.agreeTerms': 'By creating an account, you agree to our',
    'signup.fiveStarRated': '4.8 star rated',
    'signup.savingsAmount': 'Save up to 90% on legal costs',

    // Forgot Password Page
    'forgot.checkEmail': 'Check Your Email',
    'forgot.sentTo': "We've sent a password reset link to",
    'forgot.clickLink': 'Click the link in the email to reset your password.',
    'forgot.checkSpam': "Didn't see it? Check your spam or junk folder.",
    'forgot.tryAgain': 'Try a different email',
    'forgot.sending': 'Sending...',

    // Checkout Page
    'checkout.signInRequired': 'Sign In Required',
    'checkout.signInMessage': 'Please sign in to complete your purchase.',
    'checkout.signInContinue': 'Sign In to Continue',
    'checkout.secureCheckout': 'Secure Checkout',
    'checkout.backToPricing': 'Back to Pricing',
    'checkout.paymentTitle': 'Complete Your Purchase',
    'checkout.paymentSubtitle': 'Secure payment processing powered by Stripe',
    'checkout.stripeSecure': 'Stripe Secure Payments',
    'checkout.stripeSecureDesc': 'Your payment will be processed securely through Stripe. We never store your card details on our servers.',
    'checkout.pciCompliant': 'PCI DSS compliant',
    'checkout.encrypted': 'End-to-end encrypted',
    'checkout.noCardStored': 'No card data stored',
    'checkout.comingSoon': 'Payment Processing Coming Soon',
    'checkout.comingSoonDesc': 'We are finalizing our Stripe integration. In the meantime, you can ask unlimited questions for free or contact us for enterprise pricing.',
    'checkout.moneyBack': '30-Day Money-Back Guarantee',
    'checkout.moneyBackDesc': 'Not satisfied? Get a full refund within 30 days, no questions asked.',
    'checkout.askFreeWhileWaiting': 'Ask Questions Free',
    'checkout.contactUs': 'Contact Us',
    'checkout.orderSummary': 'Order Summary',
    'checkout.plan': 'Plan',
    'checkout.subscription': 'Monthly subscription',
    'checkout.total': 'Total',
    'checkout.whatsIncluded': "What's Included",
    'checkout.feature1': 'Unlimited AI legal questions',
    'checkout.feature2': 'Action plans & next steps',
    'checkout.feature3': 'Document templates & generation',
    'checkout.feature4': 'Attorney matching & directory',
    'checkout.feature5': 'Priority support',
    'checkout.termsNote': 'By purchasing, you agree to our Terms of Service and Privacy Policy.',

    // Login Page
    'login.joinThousands': 'Get affordable AI-powered legal information in Arizona',

    // Dashboard Page
    'dash.welcomeBack': 'Welcome back',
    'dash.aiDashboard': 'Your AI-powered legal assistant dashboard',
    'dash.freeTier': 'Free Tier',
    'dash.upgradeUnlimited': 'Upgrade for unlimited access',
    'dash.todaysUsage': "Today's Usage",
    'dash.monthlyUsage': 'Monthly Usage',
    'dash.freeQuestions': 'Free Questions',
    'dash.askQuestions': 'Ask Questions',
    'dash.whenNeeded': 'When Needed',
    'dash.issuePacks': 'Issue Packs',
    'dash.freeForever': 'Free Forever',
    'dash.noLimit': 'NO LIMIT',
    'dash.unlimitedAi': 'Unlimited AI questions',
    'dash.attorneyAccess': 'Attorney directory access',
    'dash.guidesResources': 'Legal guides & resources',
    'dash.noCreditCard': 'No credit card required',
    'dash.issuePacksPrice': 'Issue Packs ($29-$49) include:',
    'dash.actionPlans': 'Detailed action plans for your issue',
    'dash.docTemplates': 'Document templates & checklists',
    'dash.quickActions': 'Quick Actions',
    'dash.costSavings': 'Estimated time savings on intake organization',
    'dash.aiLawyerMatch': 'AI + Lawyer Match',
    'dash.aiLawyerMatchDesc': 'AI answers + instant attorney recommendations',
    'dash.tryItNow': 'Try it now',
    'dash.aiChatAssistant': 'AI Chat Assistant',
    'dash.aiChatDesc': 'Get instant answers in 5 seconds',
    'dash.startChatting': 'Start chatting',
    'dash.generateDocs': 'Generate Documents',
    'dash.generateDocsDesc': 'Create legal forms and contracts',
    'dash.createDocument': 'Create document',
    'dash.legalResearch': 'Legal Research',
    'dash.legalResearchDesc': 'Search Arizona case law',
    'dash.startResearch': 'Start research',
    'dash.findLawyer': 'Find a Lawyer',
    'dash.findLawyerDesc': 'Connect with verified attorneys',
    'dash.browseLawyers': 'Browse lawyers',
    'dash.outcomeScenarios': 'Outcome Scenarios',
    'dash.outcomeScenariosDesc': 'AI-estimated outcome scenarios',
    'dash.analyzeCase': 'Analyze case',
    'dash.recentActivity': 'Recent Activity',
    'dash.viewAll': 'View all',
    'dash.noActivity': 'No activity yet',
    'dash.startFirst': 'Start your first conversation',
    'dash.yourStats': 'Your Stats',
    'dash.conversations': 'Conversations',
    'dash.estimatedValue': 'Estimated value received',
    'dash.unlimited': 'Unlimited',
    'dash.freeQuestionsAvailable': 'Free questions available',
    'dash.getIssuePack': 'Get Issue Pack - $29-$49',
    'dash.actionPlansTemplates': 'Action plans & document templates',
    'dash.browseByArea': 'Browse by Practice Area',
    'dash.services': 'Services',
    'dash.needHumanAttorney': 'Need a Human Attorney?',
    'dash.aiGuidanceNote': 'While our AI provides excellent guidance, some matters require a licensed attorney. Browse our network of verified, bar-certified lawyers with proven customer satisfaction.',
    'dash.browseAttorneys': 'Browse Attorneys',
    'dash.verifiedNetwork': 'Verified attorney network',
    'dash.whyChoose': 'Why Choose Our Network:',
    'dash.allVerified': 'All attorneys verified & bar-licensed',
    'dash.responseTime': 'Response time: 3-4 minutes average',
    'dash.growingCommunity': 'Growing community of clients',

    // Sidebar Layout
    'sidebar.startNewChat': 'Start New Chat',
    'sidebar.contactUs': 'Contact Us',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.aiLawyerMatch': 'AI + Lawyer Match',
    'sidebar.chatbot': 'ezLegal.ai Chatbot',
    'sidebar.history': 'History',
    'sidebar.documents': 'Documents',
    'sidebar.research': 'Research',
    'sidebar.matters': 'Matters',
    'sidebar.clients': 'Clients',
    'sidebar.lawyerProfiles': 'Lawyer Profiles',
    'sidebar.resources': 'Resources',
    'sidebar.legalGuides': 'Legal Guides',
    'sidebar.aboutUs': 'About Us',
    'sidebar.websiteWidgets': 'Website Widgets',
    'sidebar.widgetIntegration': 'Widget Integration',
    'sidebar.profile': 'Profile',
    'sidebar.adminPanel': 'Admin Panel',
    'sidebar.signOut': 'Sign Out',
    'sidebar.premiumAccount': 'Premium Account',
    'sidebar.freeAccount': 'Free Account',
    'sidebar.tryForFree': 'Try for Free',
    'sidebar.tryForFreeDesc': 'Sign up to save your chat history and access premium features',
    'sidebar.createAccount': 'Create Account',
    'sidebar.signIn': 'Sign In',
    'sidebar.skipToMain': 'Skip to main content',
    'sidebar.chat': 'Chat',
    'sidebar.contact': 'Contact',

    'history.title': 'Activity Center',
    'history.subtitle': 'Track your complete journey across all ezLegal.ai features',
    'history.refresh': 'Refresh',
    'history.export': 'Export',
    'history.newChat': 'New Chat',
    'history.search': 'Search activities...',
    'history.favorites': 'Favorites',
    'history.type': 'Type',
    'history.activityTypes': 'Activity Types',
    'history.active': 'Active',
    'history.allTime': 'All Time',
    'history.today': 'Today',
    'history.last7Days': 'Last 7 Days',
    'history.last30Days': 'Last 30 Days',
    'history.clear': 'Clear',
    'history.noMatch': 'No activities match your filters',
    'history.noActivity': 'No activity yet',
    'history.adjustFilters': 'Try adjusting your filters or search term',
    'history.willAppear': 'Your activity history will appear here as you use ezLegal.ai features',
    'history.clearFilters': 'Clear Filters',
    'history.startChat': 'Start a Chat',
    'history.importHistory': 'Import Chat History',
    'history.loadMore': 'Load More Activities',
    'history.loading': 'Loading...',
    'history.unlockTitle': 'Unlock Your Complete Activity History',
    'history.unlockDesc': 'Get full access to all your activity data with advanced analytics and export capabilities.',
    'history.advancedAnalytics': 'Advanced Analytics',
    'history.unlimitedExports': 'Unlimited Exports',
    'history.fullHistory': 'Full History',
    'history.upgradeNow': 'Upgrade Now',
    'history.exportLimitTitle': 'Export Limit Reached',
    'history.exportLimitDesc': 'Free accounts can export up to 10 activities. Upgrade to Premium for unlimited exports.',
    'history.exportLimitFeature1': 'Unlimited exports to CSV',
    'history.exportLimitFeature2': 'Advanced activity analytics',
    'history.exportLimitFeature3': 'Lifetime activity history',
    'history.maybeLater': 'Maybe Later',
    'history.upgrade': 'Upgrade',
    'history.typeChatSessions': 'Chat Sessions',
    'history.typeLawyerMatches': 'Lawyer Matches',
    'history.typeDocuments': 'Documents',
    'history.typePredictions': 'Predictions',
    'history.typeCases': 'Cases',
    'history.typeSystem': 'System',

    'research.title': 'AI-Powered Legal Research',
    'research.signupPrompt': 'Research now, sign up to save your history',
    'research.createAccount': 'Create Account',
    'research.heading': 'Legal Research',
    'research.subtitle': 'AI-powered search across case law, statutes, regulations, and precedents',
    'research.newResearch': 'New Research',
    'research.researchHistory': 'Research History',
    'research.queryLabel': 'Research Query',
    'research.queryPlaceholder': 'Enter your legal research query...',
    'research.jurisdiction': 'Jurisdiction',
    'research.practiceArea': 'Practice Área',
    'research.allPracticeAreas': 'All Practice Áreas',
    'research.sourceFilters': 'Source Filters',
    'research.caseLaw': 'Case Law',
    'research.caseLawDesc': 'Court decisions & opinions',
    'research.statutes': 'Statutes',
    'research.statutesDesc': 'Enacted laws & codes',
    'research.regulations': 'Regulations',
    'research.regulationsDesc': 'Administrative rules',
    'research.legalPrecedents': 'Legal Precedents',
    'research.legalPrecedentsDesc': 'Binding precedents',
    'research.researching': 'Researching Legal Sources...',
    'research.conductResearch': 'Conduct AI Legal Research',
    'research.selectSource': 'Please select at least one source type',
    'research.summary': 'Research Summary',
    'research.relevantAuthorities': 'Relevant Authorities',
    'research.sourcesFound': 'sources found',
    'research.highRelevance': 'high relevance',
    'research.mediumRelevance': 'medium relevance',
    'research.lowRelevance': 'low relevance',
    'research.keyPoints': 'Key Points',
    'research.practicalGuidance': 'Práctical Guidance',
    'research.results': 'Research Results',
    'research.disclaimer': 'Disclaimer',
    'research.disclaimerText': 'This research is AI-generated and should be verified by a legal professional. Always consult with a licensed attorney for specific legal advice.',
    'research.noHistory': 'No research history',
    'research.startResearching': 'Start Researching',
    'research.researchAgain': 'Research Again',
    'research.showLess': 'Show less',
    'research.showFull': 'Show full results',

    'matters.title': 'Organize Your Legal Matters',
    'matters.signInPrompt': 'Sign in to create and manage your legal matters',
    'matters.signIn': 'Sign In',
    'matters.createAccount': 'Create Account',
    'matters.heading': 'My Matters',
    'matters.subtitle': 'Organize and track all your legal matters in one place',
    'matters.newMatter': 'New Matter',
    'matters.totalMatters': 'Total Matters',
    'matters.active': 'Active',
    'matters.onHold': 'On Hold',
    'matters.closed': 'Closed',
    'matters.searchPlaceholder': 'Search matters...',
    'matters.allStatus': 'All Status',
    'matters.open': 'Open',
    'matters.archived': 'Archived',
    'matters.allPracticeAreas': 'All Practice Áreas',
    'matters.noMatch': 'No matters match your filters',
    'matters.noMatters': 'No matters yet',
    'matters.adjustFilters': 'Try adjusting your search or filters',
    'matters.createFirst': 'Create your first matter to organize your legal activities',
    'matters.createFirstBtn': 'Create Your First Matter',
    'matters.documents': 'documents',
    'matters.participants': 'participants',
    'matters.updated': 'Updated',
    'matters.viewDetails': 'View Details',
    'matters.exportRecord': 'Export Record',
    'matters.createNewMatter': 'Create New Matter',
    'matters.createDesc': 'Create a matter to organize your legal documents, chats, and activities',
    'matters.matterTitle': 'Matter Title',
    'matters.practiceArea': 'Practice Área',
    'matters.selectPracticeArea': 'Select practice area',
    'matters.jurisdictionLabel': 'Jurisdiction',
    'matters.priority': 'Priority',
    'matters.priorityLow': 'Low',
    'matters.priorityMedium': 'Medium',
    'matters.priorityHigh': 'High',
    'matters.priorityUrgent': 'Urgent',
    'matters.status': 'Status',
    'matters.description': 'Description',
    'matters.cancel': 'Cancel',
    'matters.createMatter': 'Create Matter',
    'matters.exportTitle': 'Export Matter Record',
    'matters.exportDesc': 'Download a complete record of this matter including all details, documents, and participant information.',
    'matters.exportIncludes': 'Export includes:',
    'matters.exportItem1': 'Matter details and timeline',
    'matters.exportItem2': 'Document references',
    'matters.exportItem3': 'Participant information',
    'matters.exportItem4': 'Status history',
    'matters.exportJSON': 'Export JSON',
    'matters.exporting': 'Exporting...',

    'clients.title': 'Client Management',
    'clients.subtitle': 'Manage your client information and intake',
    'clients.searchPlaceholder': 'Search clients...',
    'clients.addClient': 'Add Client',
    'clients.added': 'Added',
    'clients.noClients': 'No clients found',
    'clients.adjustSearch': 'Try adjusting your search',
    'clients.addFirst': 'Add your first client to get started',
    'clients.intakeForm': 'Client Intake Form',
    'clients.intakeDesc': 'Add a new client to your system',
    'clients.firstName': 'First Name',
    'clients.lastName': 'Last Name',
    'clients.email': 'Email',
    'clients.phone': 'Phone',
    'clients.address': 'Address',
    'clients.notes': 'Notes',
    'clients.notesPlaceholder': 'Add any additional information about this client...',
    'clients.cancel': 'Cancel',

    'profile.title': 'Account Settings',
    'profile.subtitle': 'Manage your profile and account preferences',
    'profile.tabProfile': 'Profile Information',
    'profile.tabPreferences': 'Preferences',
    'profile.tabSecurity': 'Security',
    'profile.tabData': 'Data & Privacy',
    'profile.photoTitle': 'Profile Photo',
    'profile.photoDesc': 'Click the camera icon to upload a photo (max 2MB)',
    'profile.photoUploading': 'Uploading...',
    'profile.photoFormats': 'Supported formats: JPEG, PNG, WebP, GIF',
    'profile.fullName': 'Full Name',
    'profile.emailAddress': 'Email Address',
    'profile.phoneNumber': 'Phone Number',
    'profile.jobTitle': 'Job Title',
    'profile.company': 'Company / Organization',
    'profile.bio': 'Bio',
    'profile.bioPlaceholder': 'Tell us about yourself...',
    'profile.saveChanges': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.notifTitle': 'Notification Preferences',
    'profile.emailNotif': 'Email Notifications',
    'profile.emailNotifDesc': 'Receive updates and notifications via email',
    'profile.smsNotif': 'SMS Notifications',
    'profile.smsNotifDesc': 'Receive urgent updates via text message',
    'profile.savePreferences': 'Save Preferences',
    'profile.changePassword': 'Change Password',
    'profile.changePasswordDesc': 'Update your password to keep your account secure',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.updatePassword': 'Update Password',
    'profile.updating': 'Updating...',
    'profile.accountInfo': 'Account Information',
    'profile.accountId': 'Account ID:',
    'profile.emailLabel': 'Email:',
    'profile.accountCreated': 'Account Created:',
    'profile.dataRights': 'Your Data Rights',
    'profile.dataRightsDesc': 'You have the right to access, export, and delete your personal data. We comply with CCPA and other privacy regulations. Your data is never used for AI training.',
    'profile.exportTitle': 'Export Your Data',
    'profile.exportDesc': 'Download a copy of all your data including profile information, chat history, and documents.',
    'profile.exportJSON': 'Export as JSON',
    'profile.exportCSV': 'Export as CSV',
    'profile.exportingData': 'Exporting...',
    'profile.recentExports': 'Recent Export Requests',
    'profile.dataRetention': 'Data Retention',
    'profile.chatHistory': 'Chat History',
    'profile.chatRetention': 'Retained for 90 days, then automatically deleted',
    'profile.documentsLabel': 'Documents',
    'profile.docRetention': 'Retained for 1 year, then automatically deleted',
    'profile.deleteTitle': 'Delete Your Data',
    'profile.deleteDesc': 'Request deletion of your chat history and uploaded documents. This action cannot be undone. Your account will remain active but your conversation data will be permanently removed.',
    'profile.deletionPending': 'Deletion Request Pending',
    'profile.cancelRequest': 'Cancel this request',
    'profile.requestDeletion': 'Request Data Deletion',
    'profile.confirmDeletion': 'Confirm Data Deletion',
    'profile.confirmDeletionDesc': 'This will permanently delete your chat history and documents. Type "DELETE" to confirm.',
    'profile.scheduleDeletion': 'Schedule Deletion (7 days)',
    'profile.deleteImmediately': 'Delete Immediately',
    'profile.processing': 'Processing...',
    'profile.deletionHistory': 'Deletion Request History',
    'profile.cancel': 'Cancel',

    'ai.poweredBy': 'Powered by',
    'ai.subtitle': 'Instant answers + verified lawyer matching',
    'ai.responseTime': 'Average AI response time',
    'ai.costSavings': 'Cost savings vs traditional legal',
    'ai.lawyerResponse': 'Lawyer response time',
    'ai.reviewContract': 'Review Contract',
    'ai.reviewContractDesc': 'Get contract analysis',
    'ai.legalDispute': 'Legal Dispute',
    'ai.legalDisputeDesc': 'Understand your options',
    'ai.startBusiness': 'Start Business',
    'ai.startBusinessDesc': 'Formation guidance',
    'ai.employmentIssue': 'Employment Issue',
    'ai.employmentIssueDesc': 'Know your rights',
    'ai.askAnything': 'Ask ezLegal.ai anything about Arizona law',
    'ai.getGuidance': 'Get instant guidance and connect with the right attorney if needed',
    'ai.export': 'Export',
    'ai.browseTopics': 'Browse Topics',
    'ai.tipUpload': 'Tip: Click the upload icon to attach documents (PDF, DOC, TXT)',
    'ai.signedIn': 'Signed in',
    'ai.guestMode': 'Guest mode',
    'ai.askPlaceholder': 'Ask your legal question...',
    'ai.attachedFiles': 'Attached Files',
    'ai.connectAttorneys': 'Connect with Verified Attorneys',
    'ai.allVerified': 'All attorneys are BAR-certified, vetted, and rated by real clients',
    'ai.basedOnQuestion': 'Based on your question, these lawyers can help',
    'ai.readyForAdvice': 'Ready for personalized legal advice?',
    'ai.whileAI': 'While ezLegal.ai provides instant guidance, a real attorney can give you personalized advice, represent you in court, and handle complex legal matters.',
    'ai.freeConsultations': 'Free Consultations',
    'ai.freeConsultationsDesc': 'Most attorneys offer free first calls',
    'ai.verified': '100% Verified',
    'ai.verifiedDesc': 'All lawyers are BAR-certified',
    'ai.clientRated': 'Client-Rated',
    'ai.clientRatedDesc': 'Real reviews from real cases',
    'ai.browseAttorneys': 'Browse Attorneys Now',
    'ai.noObligation': 'No obligation - No credit card required - Response in minutes',
    'ai.talkToAttorney': 'Ready to talk to a real attorney? Scroll down to see verified',
    'ai.viewAttorneys': 'View Attorneys',
    'ai.attorneys': 'Attorneys',
    'ai.responseTimeLabel': 'Response time',
    'ai.barLicensed': 'Bar-licensed',
    'ai.fast': 'Fast',
    'ai.verified2': 'Verified',
  },
  es: {
    // Navigation
    'nav.features': 'Funciones',
    'nav.pricing': 'Precios',
    'nav.freeHelp': 'Ayuda Legal Pro Bono',
    'nav.crisis': 'Recursos de Crisis',
    'nav.reads': 'Guías Legales',
    'nav.about': 'Nosotros',
    'nav.signIn': 'Iniciar Sesión',
    'nav.dashboard': 'Panel',
    'nav.startTrial': 'Preguntar Gratis',
    'nav.forOrgs': 'Para Organizaciones Legales',
    'nav.forLSOs': 'Para LSOs',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.contact': 'Contacto',
    'nav.lawyers': 'Buscar Abogados',
    'nav.profile': 'Perfil',
    'nav.signOut': 'Cerrar Sesión',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar menú',
    'nav.getHelp': 'Chatbot IA',
    'nav.getHelpNow': 'Obtener Ayuda Legal Ahora',
    'nav.legalGuides': 'Guías Legales',
    'nav.findAttorney': 'Encontrar Abogado',
    'nav.askFree': 'Hacer Mi Pregunta Gratis',
    'nav.trustSafety': 'Confianza y Seguridad',
    'nav.askQuestion': 'Haz Tu Pregunta',
    'nav.askQuestionDesc': 'Escribe cualquier pregunta legal en español',
    'nav.browseGuides': 'Explorar Guías Legales',
    'nav.browseGuidesDesc': 'Lee artículos en lenguaje simple sobre problemas comunes',
    'nav.findAttorneyDesc': 'Busca en nuestro directorio cuando necesites representación',
    'nav.howAiWorks': 'Cómo Funciona Nuestra IA',
    'nav.scopeDisclaimers': 'Alcance y Descargos',
    'nav.aiGovernance': 'Gobernanza de IA',
    'nav.partnerProgram': 'Programa de Socios',
    'nav.viewProfile': 'Ver Perfil',
    'nav.adminDashboard': 'Panel de Administrador',

    // Hero Section
    'hero.badge': 'Preguntas Ilimitadas Gratis - Sin Registro',
    'hero.title1': 'Mereces Respuestas Legales',
    'hero.title2': 'En Tu Horario, En Tus Términos',
    'hero.subtitle': 'ezLegal.ai proporciona información legal rápida, ética y precisa a través de un asistente legal con IA. Obtén respuestas instantáneas 24/7, luego conecta con abogados licenciados cuando los necesites. Trabajamos junto a la profesión legal para expandir el acceso a la justicia.',
    'hero.cta1': 'Hacer Mi Pregunta Gratis',
    'hero.cta2': 'Verificar Elegibilidad Pro Bono',
    'hero.noCreditCard': 'Sin tarjeta de crédito',
    'hero.cancelAnytime': 'Cancela cuando quieras',
    'hero.moneyBack': 'Garantía de devolución',
    'hero.spanish': 'También disponible en español',
    'hero.available247': 'Disponible 24/7',
    'hero.disclaimer': 'ezLegal.ai proporciona información legal para ayudarte a entender tu situación. No somos un bufete de abogados y esto no es asesoramiento legal. Para representación en la corte, te ayudamos a encontrar un abogado.',

    // Home page
    'home.headline': 'Entiende tu problema legal, conoce tu próximo paso, conéctate con ayuda',
    'home.subheadline': 'Haz preguntas legales, entiende documentos y encuentra próximos pasos seguros — en español o inglés. Gratis para empezar, sin tarjeta de crédito.',
    'home.cta': 'Haz una pregunta legal gratis',
    'home.urgentCta': 'Desalojo, ICE, violencia doméstica o fecha límite? Obtén ayuda urgente',
    'home.trustLine': 'Privado. Gratis. Protecciones informadas por abogados.',
    'home.learnMore': 'Más información',
    'home.capability.ask': 'Haz preguntas legales',
    'home.capability.documents': 'Entiende documentos',
    'home.capability.steps': 'Encuentra próximos pasos',
    'home.capability.attorney': 'Prepárate para un abogado',
    'home.capabilitySr': 'Lo que puedes hacer con ezLegal.ai',
    'home.howTitle': 'Cómo Funciona Ahora',
    'home.howSubtitle': 'Obtén claridad sobre tu situación legal en tres pasos simples',
    'home.step1.title': 'Describe Tu Situación',
    'home.step1.desc': 'Dinos qué pasó en lenguaje simple. No se requiere jerga legal.',
    'home.step2.title': 'Recibe Orientación Clara',
    'home.step2.desc': 'Recibe información fácil de entender sobre tus derechos y opciones.',
    'home.step3.title': 'Toma Acción',
    'home.step3.desc': 'Sigue los próximos pasos claros, con referencias a abogados cuando sea necesario.',
    'home.faqTitle': 'Preguntas Frecuentes',
    'home.faq1.q': '¿Es ezLegal.ai un reemplazo para un abogado?',
    'home.faq1.a': 'No. Proporcionamos información legal para ayudarte a entender tu situación — no asesoramiento legal. Para asuntos complejos o representación en la corte, te conectamos con abogados licenciados a través de nuestra red de referencias.',
    'home.faq2.q': '¿Es mi información privada?',
    'home.faq2.a': 'Sí. Ciframos tus conversaciones con seguridad de nivel bancario y nunca las usamos para entrenar modelos de IA. Cumplimos con la ley de privacidad de California (CCPA). Nota: como no somos un bufete de abogados, el privilegio abogado-cliente no aplica a estas conversaciones.',
    'home.faq3.q': '¿Es realmente gratis?',
    'home.faq3.a': 'Sí. Las preguntas legales básicas son completamente gratis sin necesidad de tarjeta de crédito. Solo pagas si eliges características premium opcionales como planes de acción detallados o plantillas de documentos.',
    'home.faq4.q': '¿Qué hace a ezLegal.ai ético?',
    'home.faq4.a': 'Somos transparentes sobre lo que nuestra IA puede y no puede hacer. Te decimos claramente cuándo necesitas un abogado. Nunca reemplazamos el juicio de un abogado. Mantenemos estándares estrictos de privacidad y monitoreamos cada respuesta de IA.',
    'home.faq5.q': '¿Qué tan precisa es la información legal?',
    'home.faq5.a': 'Entrenamos nuestra IA con fuentes legales oficiales, y profesionales legales la revisan regularmente. Sin embargo, las leyes varían según el estado y cambian frecuentemente. Proporcionamos información general — para consejo sobre tu caso específico, consulta a un abogado con licencia.',
    'home.readyTitle': '¿Listo Para Comenzar?',
    'home.readySubtitle': 'Únete a miles obteniendo respuestas claras a sus preguntas legales',
    'home.startFree': 'Comenzar Ahora - Es Gratis',
    'home.chatFirst': '¿Prefieres chatear primero?',

    // Stats
    'stats.rating': 'Calificación Promedio',
    'stats.helped': 'Personas Ayudadas',
    'stats.attorneys': 'Abogados Verificados',
    'stats.experience': 'Exp. Promedio',
    'stats.confidential': 'Confidencial',

    // Trust Badges
    'trust.soc2': 'TLS 1.3 + AES-256',
    'trust.certified': 'Protegido',
    'trust.ssl': 'TLS 1.3 + AES-256',
    'trust.encrypted': 'Encriptado',
    'trust.aba': 'Cumple ABA',
    'trust.ethics': 'Estándares Éticos',
    'trust.barVerified': 'Verificado',
    'trust.allAttorneys': 'Todos los Abogados',
    'trust.lsos': 'Red LSO en Crecimiento',
    'trust.trustUs': 'Confían en Nosotros',

    // Quick Actions / Topics
    'topics.title': '¿Qué te trajo aquí hoy?',
    'topics.subtitle': 'Selecciona tu situación para obténer ayuda personalizada',
    'topics.immigration': 'Preocupaciónes de inmigracion',
    'topics.immigrationDesc': 'Deportación, visas, estatus',
    'topics.housing': 'Vivienda y desalojo',
    'topics.housingDesc': 'Problemas con casero, renta',
    'topics.family': 'Asuntos familiares',
    'topics.familyDesc': 'Divorcio, custodia, pensión',
    'topics.employment': 'Empleo y salarios',
    'topics.employmentDesc': 'Salarios no pagados, despido',
    'topics.debt': 'Deudas y cobranzas',
    'topics.debtDesc': 'Cobradores, bancarrota',
    'topics.criminal': 'Criminal y fianzas',
    'topics.criminalDesc': 'Arrestos, cargos, fianzas',
    'topics.traffic': 'Tráfico y licencias',
    'topics.trafficDesc': 'Multas, DUI, licencia suspendida',
    'topics.other': 'Otra cosa',
    'topics.otherDesc': 'Pregunta cualquier cosa',
    'topics.crisis': '¿En peligro inmediato? Obtén recursos de crisis',

    // Features Section
    'features.badge': 'Orientación Legal Accesible',
    'features.title': 'Comprende Tus Opciones Legales. Toma Decisiones Informadas.',
    'features.subtitle': 'Información legal impulsada por IA que te empodera para navegar tu situación con confianza. Conectate con abogados cuando los necesites.',
    'features.aiMatch.title': 'IA + Abogado Real',
    'features.aiMatch.quote': '"Mi aviso de desalojo me tenía en pánico."',
    'features.aiMatch.desc': 'Obtén respuestásinstantáneas de IA MÁS abogados compatibles al instante. Chatea con IA, busca abogados reales y reserva consultas, todo en un solo lugar.',
    'features.aiChat.title': 'Asistente Legal IA 24/7',
    'features.aiChat.quote': '"Eran las 2 AM y necesitaba respuestásrápidas."',
    'features.aiChat.desc': 'Chat simple con IA para orientación legal rápida. Perfecto para preguntas sobre contratos, derechos laborales, problemas con arrendadores.',
    'features.docs.title': 'Documentos Legales en Minutos',
    'features.docs.quote': '"Necesitaba un NDA rápido antes de mi reunión."',
    'features.docs.desc': 'Elige una plantilla, completa los espacios, descarga al instante. NDAs, contratos de servicio, contratos de alquiler, ofertas de empleo. Para documentos complejos, conecta con un abogado para revisión.',
    'features.directory.title': 'Directorio de Abogados Verificados',
    'features.directory.quote': '"Necesitaba un abogado real, no un mercado."',
    'features.directory.desc': 'Busca abogados de Arizona por área de práctica, ubicación y calificaciones. Filtra por especialidad, ve perfiles, lee reseñas.',
    'features.research.title': 'Base de Datos de Investigación Legal',
    'features.research.quote': '"Necesitaba entender la ley yo mismo."',
    'features.research.desc': 'Busca derecho contractual, derechos laborales, propiedad intelectual por categoría. Obtén resúmenes de estatutos y jurisprudencia.',
    'features.cases.title': 'Gestor de Casos y Fechas Límite',
    'features.cases.quote': '"Tenía 3 asuntos legales y no podía hacer seguimiento."',
    'features.cases.desc': 'Organiza múltiples casos, establece recordatorios de fechas límite, rastrea el progreso. Almacena documentos, notas e información de contacto.',

    // Calculator
    'calculator.badge': 'Calculadora de Ahorros',
    'calculator.title': 'Calcula Tu Ahorro',
    'calculator.subtitle': 'Mira cuánto podrías ahorrar comparado con tarifas legales tradicionales.',
    'calculator.hours': 'Horas de ayuda legal necesarias por mes',
    'calculator.rate': 'Tarifa promedio por hora de abogado',
    'calculator.potential': 'Tu ahorro potencial',
    'calculator.perMonth': 'por mes',
    'calculator.traditional': 'Costo de abogado tradicional',
    'calculator.ezlegal': 'ezLegal.ai Básico',
    'calculator.save': 'Ahorra',
    'calculator.onLegal': 'en costos legales',
    'calculator.cta': 'Empieza a Ahorrar Hoy',

    // Testimonials
    'testimonials.title': 'Lo Que Dicen Nuestros Clientes',
    'testimonials.subtitle': 'Historias reales de personas reales que hemos ayudado',

    // Pricing
    'pricing.title': 'Precios Simples y Transparentes',
    'pricing.subtitle': 'Preguntas ilimitadas gratis. Paga solo por Paquetes de Ayuda cuando los necesites.',
    'pricing.starter': 'Gratis',
    'pricing.starterPrice': '$0',
    'pricing.starterDesc': 'Preguntas ilimitadas para siempre',
    'pricing.essential': 'Paquetes de Ayuda',
    'pricing.essentialPrice': '$29-$49',
    'pricing.essentialDesc': 'Planes de acción cuando los necesites',
    'pricing.professional': 'Negocios',
    'pricing.professionalPrice': '$99+',
    'pricing.professionalDesc': 'Para equipos y organizaciónes',
    'pricing.bestValue': 'MEJOR VALOR',
    'pricing.guarantee': 'Garantía de Devolución de 30 Días',
    'pricing.guaranteeDesc': 'Prueba ezLegal.ai sin riesgo. Si no estássatisfecho, te devolvemos cada centavo.',
    'pricing.month': '/mes',
    'pricing.annually': 'facturado anualmente',
    'pricing.popular': 'Más Popular',
    'pricing.startFree': 'Comenzar Gratis',
    'pricing.startTrial': 'Comenzar Gratis',
    'pricing.contactSales': 'Contactar Ventas',
    'pricing.feature.questions': 'preguntas/mes',
    'pricing.feature.unlimited': 'Preguntas ilimitadas',
    'pricing.feature.aiChat': 'Asistente legal IA',
    'pricing.feature.templates': 'Plantillas de documentos',
    'pricing.feature.research': 'Acceso a investigación legal',
    'pricing.feature.lawyer': 'Búsqueda de abogados',
    'pricing.feature.priority': 'Soporte prioritario',
    'pricing.feature.team': 'Acceso de equipo',
    'pricing.feature.api': 'Acceso API',

    // CTA
    'cta.title': '¿Listo para Entender Tus Opciones Legales?',
    'cta.subtitle': 'Comienza tu prueba gratis y obtén respuestásen minutos.',
    'cta.questions': '¿Preguntas?',
    'cta.contactUs': 'Contactaños',
    'cta.anytime': 'en cualquier momento.',
    'cta.getStarted': 'Comenzar Gratis',

    // Video
    'video.title': 'Mira Cómo Funciona ezLegal.ai',
    'video.subtitle': 'Mira cómo María salvó la casa de su familia con ezLegal.ai',
    'video.watch': 'Ver Video',
    'video.duration': '2:34',

    // Partners
    'partners.title': 'Confiado por Profesionales Legales',
    'partners.subtitle': 'Asociados con las principales organizaciónes legales de Arizona',
    'partners.featured': 'Como se Vio en',

    // Footer
    'footer.description': 'Haciendo la información legal accesible para todos a través de asistencia impulsada por IA.',
    'footer.product': 'Producto',
    'footer.company': 'Empresa',
    'footer.legal': 'Legal',
    'footer.support': 'Soporte',
    'footer.helpCenter': 'Centro de Ayuda',
    'footer.community': 'Comunidad',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.accessibility': 'Accesibilidad',
    'footer.aiGovernance': 'Gobernanza de IA',
    'footer.trustCenter': 'Centro de Confíanza',
    'footer.copyright': 'Todos los derechos reservados.',
    'footer.disclaimer': 'ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados.',
    'footer.careers': 'Carreras',
    'footer.blog': 'Blog',
    'footer.press': 'Prensa',
    'footer.legalNotice': 'Aviso Legal Importante',
    'footer.notLawFirm': 'ezLegal.ai proporciona información legal, no asesoramiento legal.',
    'footer.legalNoticeText': 'No somos un bufete de abogados, y el uso de este servicio no crea una relación abogado-cliente. Sus comunicaciones con ezLegal.ai no estánprotegidas por el privilegio abogado-cliente. Para asuntos complejos, representación en corte, o asesoramiento legal personalizado, consulte con un abogado licenciado en su jurisdicción.',
    'footer.crisisResources': 'Recursos de Crisis',
    'footer.freeLegalAid': 'Ayuda Legal Gratuita',
    'footer.findAttorney': 'Encontrar un Abogado',
    'footer.poweredBy': 'Impulsado por',
    'footer.forOrganizations': 'Para Organizaciónes',
    'footer.enterpriseSecurity': 'Seguridad Empresarial',
    'footer.reportConcern': 'Reportar una Preocupación',
    'footer.howReportsReviewed': 'Cómo se Revisan los Reportes',
    'footer.proBonoServices': 'Servicios Pro Bono',
    'footer.attorneyDirectory': 'Directorio de Abogados',
    'footer.aboutAiData': 'Sobre Nuestra IA y Prácticas de Datos',
    'footer.dataNotUsed': 'Sus datos nunca se usan para entrenar nuestros modelos de IA',
    'footer.encrypted': 'Encriptación TLS 1.3 + AES-256 en infraestructura certificada SOC 2 Tipo II (Supabase)',
    'footer.deleteData': 'Puede solicitar la eliminación de sus datos en cualquier momento',
    'footer.ccpaCompliant': 'Cumplimos con CCPA y honramos las solicitudes de acceso a datos',
    'footer.aiCitations': 'Las respuestásde IA incluyen citas y contexto de jurisdicción donde estándisponibles',
    'footer.legalFreshness': 'Actualización de Información Legal',
    'footer.citationDatabase': 'Base de Datos de Citas',
    'footer.citationUpdated': 'Actualizada semanalmente de fuentes oficiales estatales y federales',
    'footer.courtInfo': 'Información de Cortes',
    'footer.courtUpdated': 'Actualizada mensualmente; fallos significativos agregados dentro de 48 horas',
    'footer.verificationCycle': 'Ciclo de Verificación',
    'footer.verificationText': 'Fuentes verificadas contra bases de datos oficiales cada 30 días',
    'footer.lastUpdate': 'Última Actualización del Sistema',
    'footer.lastUpdateDate': 'Enero 2026',
    'footer.lawsVary': 'Las leyes varían por jurisdicción y cambian frecuentemente. Siempre verifique el estado actual con fuentes oficiales antes de tomar acción.',
    'footer.commitmentText': 'ezLegal.ai está comprometido con prácticas éticas de IA y expandir el acceso a la justicia. Nos asociamos con organizaciónes de ayuda legal y colegios de abogados para ayudar a conectar individuos con abogados voluntarios. Nuestra funcion de "Buscar Abogado" es un directorio de abogados, no un servicio de referencia - no recibimos compensación por recomendaciones de abogados.',
    'footer.patentPending': 'PATENTE PENDIENTE EN EE.UU.',
    'footer.patentText': 'La tecnología cubierta incluye recuperación consciente de cumplimiento, seguimiento de procedencia y restricciones éticas de ingestión.',

    // Auth - Login
    'auth.login.title': 'Bienvenido de nuevo',
    'auth.login.subtitle': 'Inicia sesión en tu cuenta',
    'auth.login.email': 'Correo electrónico',
    'auth.login.password': 'Contraseña',
    'auth.login.remember': 'Recordarme',
    'auth.login.forgot': '¿Olvidaste tu contraseña?',
    'auth.login.submit': 'Iniciar Sesión',
    'auth.login.noAccount': '¿No tienes una cuenta?',
    'auth.login.signUp': 'Registrarse',
    'auth.login.or': 'O continuar con',
    'auth.login.google': 'Continuar con Google',
    'auth.login.error': 'Correo o contraseña inválidos',
    'auth.login.success': '¡Bienvenido de nuevo!',
    'login.usersOnline': 'usuarios en línea ahora',
    'login.welcomeBack': 'Bienvenido de Nuevo a Información Legal Accesible',
    'login.continueHelp': 'Continua obténiendo la asistencia legal que necesitas sin arruinarte.',
    'login.freeToStart': '$0 para Comenzar',
    'login.freeForever': 'Plan Gratis para Siempre Disponible',
    'login.noCreditCard': 'Sin tarjeta de crédito. 10 consultas legales con IA por mes, siempre gratis.',
    'login.peopleHelped': 'personas han usado ezLegal.ai para información legal',
    'login.ethicalAi': 'IA Ética',
    'login.neverTrains': 'que nunca entrena con tus datos legales privados',
    'login.access247': 'Acceso 24/7',
    'login.wheneverYouNeed': 'a información legal con IA cuando la necesites',
    'login.bankSecurity': 'TLS 1.3 + AES-256',
    'login.encryption': 'con encriptación de nivel empresarial',
    'login.recentLogin': 'Inicio de sesión reciente desde',
    'login.enterPassword': 'Ingresa tu contraseña',
    'login.signingIn': 'Iniciando sesión...',
    'login.viewPricing': 'Ver Planes de Precios',

    // Auth - Signup
    'auth.signup.title': 'Crea tu cuenta',
    'auth.signup.subtitle': 'Preguntas legales ilimitadas gratis, sin tarjeta de crédito',
    'auth.signup.name': 'Nombre completo',
    'auth.signup.email': 'Correo electrónico',
    'auth.signup.password': 'Contraseña',
    'auth.signup.confirm': 'Confirmar contraseña',
    'auth.signup.terms': 'Acepto los',
    'auth.signup.termsLink': 'Términos de Servicio',
    'auth.signup.and': 'y la',
    'auth.signup.privacyLink': 'Política de Privacidad',
    'auth.signup.submit': 'Crear Cuenta',
    'auth.signup.hasAccount': '¿Ya tienes una cuenta?',
    'auth.signup.signIn': 'Iniciar sesión',
    'auth.signup.success': '¡Cuenta creada exitosamente!',
    'auth.signup.error': 'Error al crear la cuenta',
    'auth.signup.passwordMismatch': 'Las contraseñas no coinciden',
    'auth.signup.passwordWeak': 'La contraseña debe tener al menos 8 caracteres',

    // Auth - Forgot Password
    'auth.forgot.title': 'Restablece tu contraseña',
    'auth.forgot.subtitle': 'Ingresa tu correo y te enviaremos un enlace',
    'auth.forgot.email': 'Correo electrónico',
    'auth.forgot.submit': 'Enviar Enlace',
    'auth.forgot.back': 'Volver a iniciar sesión',
    'auth.forgot.success': 'Revisa tu correo para el enlace de restablecimiento',
    'auth.forgot.error': 'Error al enviar el enlace',

    // Auth - Reset Password
    'auth.reset.title': 'Establece nueva contraseña',
    'auth.reset.subtitle': 'Ingresa tu nueva contraseña abajo',
    'auth.reset.password': 'Nueva contraseña',
    'auth.reset.confirm': 'Confirmar nueva contraseña',
    'auth.reset.submit': 'Restablecer Contraseña',
    'auth.reset.success': 'Contraseña restablecida exitosamente',
    'auth.reset.error': 'Error al restablecer la contraseña',

    // Chatbot
    'chat.title': 'Asistente Legal IA',
    'chat.subtitle': 'Haz cualquier pregunta legal',
    'chat.placeholder': 'Escribe tu pregunta legal...',
    'chat.send': 'Enviar',
    'chat.thinking': 'Pensando...',
    'chat.disclaimer': 'Esta es información legal, no asesoramiento legal. Para orientación específica, consulta a un abogado.',
    'chat.newChat': 'Nuevo Chat',
    'chat.history': 'Historial de Chat',
    'chat.clear': 'Limpiar Chat',
    'chat.copy': 'Copiar',
    'chat.copied': '¡Copiado!',
    'chat.share': 'Compartir',
    'chat.download': 'Descargar',
    'chat.helpful': '¿Fue útil?',
    'chat.yes': 'Sí',
    'chat.no': 'No',
    'chat.connectLawyer': 'Conectar con un Abogado',
    'chat.suggestedQuestions': 'Preguntas Sugeridas',
    'chat.welcome': '¡Hola! Soy tu asistente legal IA. ¿Cómo puedo ayudarte hoy?',
    'chat.error': 'Lo siento, algo salió mal. Por favor intenta de nuevo.',
    'chat.rateLimit': 'Has alcanzado el límite de preguntas gratis. Regístrate para acceso ilimitado.',
    'chat.upgrade': 'Actualizar para Ilimitado',

    // About Page
    'about.title': 'Acerca de ezLegal.ai',
    'about.subtitle': 'Haciendo la justicia accesible para todos',
    'about.mission.title': 'Nuestra Misión',
    'about.mission.text': 'Democratizar el acceso a la información legal y conectar a las personas con la ayuda legal que necesitan.',
    'about.story.title': 'Nuestra Historia',
    'about.story.text': 'ezLegal.ai fue fundada para cerrar la brecha entre quienes necesitan ayuda legal y quienes pueden proporcionarla.',
    'about.team.title': 'Nuestro Equipo',
    'about.values.title': 'Nuestros Valores',
    'about.values.access': 'Acceso a la Justicia',
    'about.values.accessDesc': 'Todos merecen entender sus derechos legales.',
    'about.values.ethics': 'IA Ética',
    'about.values.ethicsDesc': 'Construimos IA que es transparente, justa y responsable.',
    'about.values.privacy': 'Privacidad Primero',
    'about.values.privacyDesc': 'Tus datos son tuyos. Los protegemos como propios.',
    'about.values.quality': 'Información de Calidad',
    'about.values.qualityDesc': 'Información legal precisa y actualizada en la que puedes confiar.',

    // Contact Page
    'contact.title': 'Contactaños',
    'contact.subtitle': 'Estamos aquí para ayudar',
    'contact.name': 'Tu nombre',
    'contact.email': 'Correo electrónico',
    'contact.subject': 'Asunto',
    'contact.message': 'Tu mensaje',
    'contact.submit': 'Enviar Mensaje',
    'contact.success': 'Mensaje enviado exitosamente!',
    'contact.error': 'Error al enviar el mensaje. Por favor intenta de nuevo.',
    'contact.office': 'Nuestra Oficina',
    'contact.hours': 'Horario de Atención',
    'contact.phone': 'Teléfono',
    'contact.support': 'Soporte',
    'contact.sales': 'Ventas',
    'contact.partnerships': 'Alianzas',

    // Features Page Overview
    'features.page.title': 'Funciones',
    'features.page.subtitle': 'Todo lo que necesitas para navegar asuntos legales',
    'features.overview.ai.title': 'Asistencia con IA',
    'features.overview.ai.desc': 'Obtén respuestásinstantáneas a tus preguntas legales 24/7',
    'features.overview.documents.title': 'Generación de Documentos',
    'features.overview.documents.desc': 'Crea documentos legales en minutos',
    'features.overview.lawyers.title': 'Búsqueda de Abogados',
    'features.overview.lawyers.desc': 'Conecta con abogados verificados cuando los necesites',
    'features.overview.research.title': 'Investigación Legal',
    'features.overview.research.desc': 'Accede a bases de datos legales completas',
    'features.overview.tracking.title': 'Seguimiento de Casos',
    'features.overview.tracking.desc': 'Administra fechas límite y documentos',
    'features.overview.multilingual.title': 'Soporte Multilingüe',
    'features.overview.multilingual.desc': 'Disponible en inglés y español',

    // How It Works
    'howItWorks.title': 'Cómo Funciona',
    'howItWorks.subtitle': 'Obtén ayuda legal en 3 simples pasos',
    'howItWorks.step1.title': 'Haz Tu Pregunta',
    'howItWorks.step1.desc': 'Escribe tu pregunta legal en lenguaje simple',
    'howItWorks.step2.title': 'Recibe Orientación IA',
    'howItWorks.step2.desc': 'Recibe información legal instantánea y precisa',
    'howItWorks.step3.title': 'Conecta Si Es Necesario',
    'howItWorks.step3.desc': 'Empareja con un abogado para asuntos complejos',

    // Emergency Resources
    'emergency.title': 'Recursos Legales de Emergencia',
    'emergency.subtitle': 'Ayuda inmediata cuando más la necesitas',
    'emergency.crisis.title': '¿En Crisis?',
    'emergency.crisis.desc': 'Si estásen peligro inmediato, llama al 911',
    'emergency.domestic': 'Línea de Violencia Doméstica',
    'emergency.suicide': 'Línea de Prevención del Suicidio',
    'emergency.legal': 'Ayuda Legal de Emergencia',
    'emergency.housing': 'Línea de Crisis de Vivienda',

    // Pro Bono
    'probono.title': 'Ayuda Legal Pro Bono',
    'probono.subtitle': 'Ayuda legal gratuita para quienes califican',
    'probono.eligibility': 'Verifica Tu Elegibilidad',
    'probono.income': 'Requisitos de Ingresos',
    'probono.apply': 'Solicitar Ahora',
    'probono.status': 'Verificar Estado de Aplicación',

    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.recentChats': 'Chats Recientes',
    'dashboard.savedDocs': 'Documentos Guardados',
    'dashboard.upcomingDeadlines': 'Fechas Límite Próximas',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.usage': 'Uso Este Mes',
    'dashboard.questionsLeft': 'preguntas restantes',
    'dashboard.unlimited': 'Ilimitado',

    // Common Actions
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.retry': 'Intentar de Nuevo',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.download': 'Descargar',
    'common.upload': 'Subir',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.back': 'Volver',
    'common.continue': 'Continuar',
    'common.submit': 'Enviar',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.or': 'o',
    'common.and': 'y',
    'common.learnMore': 'Saber Mas',
    'common.seeAll': 'Ver Todo',
    'common.viewAll': 'Ver Todo',
    'common.showMore': 'Mostrar Más',
    'common.showLess': 'Mostrar Menos',

    // Form Validation
    'validation.required': 'Este campo es requerido',
    'validation.email': 'Por favor ingresa un correo válido',
    'validation.phone': 'Por favor ingresa un teléfono válido',
    'validation.minLength': 'Debe tener al menos {min} caracteres',
    'validation.maxLength': 'Debe tener no más de {max} caracteres',
    'validation.passwordMatch': 'Las contraseñas deben coincidir',

    // Errors
    'error.notFound': 'Página no encontrada',
    'error.unauthorized': 'Por favor inicia sesión para continuar',
    'error.forbidden': 'No tienes permiso para acceder a esto',
    'error.server': 'Algo salió mal de nuestro lado',
    'error.network': 'Por favor verifica tu conexión a internet',
    'error.timeout': 'Solicitud agotada. Por favor intenta de nuevo.',

    // Legal Disclaimers
    'disclaimer.notAdvice': 'Esta es información legal, no asesoramiento legal.',
    'disclaimer.notLawFirm': 'ezLegal.ai no es un bufete de abogados.',
    'disclaimer.consultAttorney': 'Para asesoramiento legal específico, por favor consulta a un abogado.',
    'disclaimer.noGuarantee': 'Los resultados pueden variar según las circunstancias individuales.',

    // Accessibility
    'a11y.skipToMain': 'Saltar al contenido principal',
    'a11y.openMenu': 'Abrir menú',
    'a11y.closeMenu': 'Cerrar menú',
    'a11y.loading': 'Cargando contenido',
    'a11y.newWindow': 'Abre en nueva ventana',

    // Schedule Demo
    'demo.title': 'Programar una Demo',
    'demo.subtitle': 'Mira cómo ezLegal.ai puede ayudar a tu organización',
    'demo.name': 'Tu nombre',
    'demo.email': 'Correo de trabajo',
    'demo.company': 'Nombre de la organización',
    'demo.role': 'Tu rol',
    'demo.size': 'Tamaño de la organización',
    'demo.submit': 'Solicitar Demo',
    'demo.success': 'Solicitud de demo enviada! Te contactaremos pronto.',

    // Navigation extras
    'nav.negotiate': 'Negociar',
    'nav.negotiatePlanner': 'Planificador de Negociación',
    'nav.howItWorksMenu': 'Cómo Funciona',
    'nav.howEzlegalWorks': 'Cómo funciona ezLegal.ai',
    'nav.describeSituation': 'Describe Tu Situación',
    'nav.describeSituationDesc': 'Haz cualquier pregunta legal en lenguaje simple',
    'nav.getJurisdictionInfo': 'Información por Jurisdicción',
    'nav.getJurisdictionInfoDesc': 'Mira cómo nuestra IA adapta respuestas a tu ubicación',
    'nav.takeNextSteps': 'Toma Pasos Claros',
    'nav.takeNextStepsDesc': 'Planes de acción, plantillas y referidos de abogados',

    // Legal Guides
    'ezreads.title': 'Guías Legales',
    'ezreads.subtitle': 'Artículos legales escritos en lenguaje simple',
    'ezreads.readMore': 'Leer Más',
    'ezreads.categories': 'Categorías',
    'ezreads.recent': 'Artículos Recientes',
    'ezreads.popular': 'Artículos Populares',
    'ezreads.search': 'Buscar artículos...',
    'ezreads.heroTitle': 'Conocimiento Legal Simplificado',
    'ezreads.heroSubtitle': 'Artículos en lenguaje simple sobre tus derechos legales, situaciónes legales comunes y cómo manejarlas. Escritos para personas reales, no abogados.',
    'ezreads.browseByCategory': 'Explorar por Categoría',
    'ezreads.allStates': 'Todos los Estados',
    'ezreads.clearAll': 'Limpiar Todo',
    'ezreads.clearSearch': 'Limpiar búsqueda',
    'ezreads.featuredArticle': 'Artículo Destacado',
    'ezreads.popularThisWeek': 'Más popular esta semana',
    'ezreads.readArticle': 'Leer Artículo',
    'ezreads.generalGuidance': 'Orientación general -- las leyes varían por estado',
    'ezreads.recentArticles': 'Artículos Recientes',
    'ezreads.searchResults': 'Resultados de Búsqueda',
    'ezreads.articlesAbout': 'artículos sobre',
    'ezreads.articlesMatching': 'artículos que coinciden con tu búsqueda',
    'ezreads.latestGuides': 'Últimas guías y recursos legales',
    'ezreads.noArticles': 'No se encontraron artículos',
    'ezreads.noArticlesSearch': 'Prueba con diferentes palabras clave o explora por categoría.',
    'ezreads.noArticlesCategory': 'Vuelve pronto para nuevo contenido en esta categoría.',
    'ezreads.clearAllFilters': 'Limpiar Todos los Filtros',
    'ezreads.stayInformed': 'Mantente Informado Sobre Tus Derechos Legales',
    'ezreads.stayInformedDesc': 'Recibe las últimas guías y recursos legales en tu correo. Sin jerga, solo información práctica que puedes usar.',
    'ezreads.enterEmail': 'Ingresa tu correo',
    'ezreads.subscribe': 'Suscribirse',
    'ezreads.freeResources': 'Recursos gratuitos - Sin spam - Cancela cuando quieras',
    'ezreads.loadingArticles': 'Cargando artículos...',
    'ezreads.showingResults': 'Mostrando resultados para',
    'ezreads.attorneyReviewed': 'Revisado por Abogado',
    'ezreads.officialSources': 'Fuentes Oficiales',
    'ezreads.category.housingLaw': 'Derecho de Vivienda',
    'ezreads.category.employmentLaw': 'Derecho Laboral',
    'ezreads.category.consumerProtection': 'Protección al Consumidor',
    'ezreads.category.familyLaw': 'Derecho Familiar',
    'ezreads.category.willsProbate': 'Testamentos y Sucesiones',
    'ezreads.category.civilLaw': 'Derecho Civil',
    'ezreads.category.housingExamples': 'Reparaciones, depósitos, avisos de desalojo',
    'ezreads.category.employmentExamples': 'Salarios, discriminación, despido injusto',
    'ezreads.category.consumerExamples': 'Cobradores de deudas, estafas, reembolsos',
    'ezreads.category.familyExamples': 'Divorcio, custodia, pensión alimenticia',
    'ezreads.category.willsExamples': 'Testamentos, fideicomisos, planificacion patrimonial',
    'ezreads.category.civilExamples': 'Reclamos menores, demandas, disputas',

    // Article Modal
    'article.loading': 'Cargando artículo...',
    'article.backToArticles': 'Volver a artículos',
    'article.share': 'Compartir',
    'article.save': 'Guardar',
    'article.attorneyReviewed': 'Revisado por Abogado',
    'article.officialSources': 'Fuentes Oficiales',
    'article.generalGuidance': 'Orientación general — las leyes varían por estado',
    'article.lastReviewed': 'Última revisión',
    'article.notFound': 'Artículo no encontrado',
    'article.goBack': 'Volver',
    'article.needGuidance': '¿Necesitas orientación legal personalizada?',
    'article.aiCanHelp': 'Nuestro asistente de IA puede ayudarte a entender cómo estas leyes aplican a tu situación específica.',
    'article.askAiAssistant': 'Consultar Asistente de IA',
    'article.closeArticle': 'Cerrar artículo',

    // Guides Search
    'guides.searchPlaceholder': 'Busca guías o describe tu situación...',
    'guides.searchLabel': 'Buscar guías legales',
    'guides.clearSearch': 'Limpiar búsqueda',
    'guides.commonSituations': 'Situaciónes comunes',
    'guides.popular': 'Popular:',
    'guides.quick.securityDeposit': 'depósito de seguridad',
    'guides.quick.eviction': 'desalojo',
    'guides.quick.wageTheft': 'robo de salario',
    'guides.quick.childCustody': 'custodia de hijos',
    'guides.quick.debtCollector': 'cobrador de deudas',
    'guides.quick.smallClaims': 'reclamos menores',

    // Urgent Help Banner
    'urgent.housingMessage': '¿Enfrentando un desalojo o condiciones de vida inseguras?',
    'urgent.housingDetail': 'Asesoría gratuita de vivienda disponible 24/7.',
    'urgent.familyMessage': '¿En una situación insegura en casa?',
    'urgent.familyDetail': 'Apoyo confidencial disponible 24/7.',
    'urgent.allResources': 'Todos los Recursos',

    // Safety Escalation Strip
    'safety.needMore': '¿Necesitas más que una guía?',
    'safety.urgentHelp': 'Ayuda Urgente',
    'safety.freeLegalAid': 'Ayuda Legal Gratuita',
    'safety.findLawyer': 'Encontrar Abogado',

    // Signup Page
    'signup.freeBanner': 'Preguntas Ilimitadas Gratis - Sin Tarjeta de Crédito',
    'signup.heroTitle': 'RespuestásLegales',
    'signup.heroHighlight': 'Sin el Precio Alto',
    'signup.heroSuffix': '',
    'signup.heroSubtitle': 'Haz preguntas legales ilimitadas gratis. Cuando necesites planes de acción o ayuda con documentos, los Paquetes de Ayuda comienzan desde solo $29.',
    'signup.benefit1Title': 'Preguntas Ilimitadas Gratis',
    'signup.benefit1Desc': 'Haz todas las preguntas legales que quieras, para siempre. Sin límites, sin trucos.',
    'signup.benefit2Title': 'Ahorra Miles en Costos Legales',
    'signup.benefit2Desc': 'Paquetes de Ayuda desde $29 vs. $300+/hora de tarifas de abogados para orientación básica.',
    'signup.benefit3Title': 'Red de Abogados Licenciados',
    'signup.benefit3Desc': 'Cuando necesites un abogado real, te conectamos con abogados verificados en Arizona.',
    'signup.benefit4Title': 'Cifrado TLS 1.3 + AES-256',
    'signup.benefit4Desc': 'Tus datos estánencriptados y nunca se usan para entrenar modelos de IA. Infraestructura certificada SOC 2.',
    'signup.socialProof': 'Personas en Arizona usan ezLegal.ai para información legal',
    'signup.mobileTitle': 'Crea Tu Cuenta Gratis',
    'signup.mobileSubtitle': 'Preguntas ilimitadas, sin tarjeta de crédito',
    'signup.freeForever': 'Gratis Para Siempre',
    'signup.formTitle': 'Crea Tu Cuenta Gratis',
    'signup.formSubtitle': 'Toma menos de 30 segúndos',
    'signup.unlimitedQuestions': 'Preguntas Legales IA Ilimitadas Incluidas',
    'signup.payOnlyForPacks': 'Paga solo por Paquetes de Ayuda cuando necesites planes de acción',
    'signup.continueGoogle': 'Continuar con Google',
    'signup.continueMicrosoft': 'Continuar con Microsoft',
    'signup.orEmail': 'o regístrate con correo',
    'signup.createPassword': 'Crea una contraseña',
    'signup.confirmPassword': 'Confirma tu contraseña',
    'signup.creating': 'Creando cuenta...',
    'signup.createFreeAccount': 'Crear Cuenta Gratis',
    'signup.guarantee': 'Garantía de 30 días',
    'signup.secure': 'Protegido con SSL',
    'signup.agreeTerms': 'Al crear una cuenta, aceptas nuestros',
    'signup.fiveStarRated': '4.8 estrellas',
    'signup.savingsAmount': 'Ahorra hasta 90% en costos legales',

    // Forgot Password Page
    'forgot.checkEmail': 'Revisa Tu Correo',
    'forgot.sentTo': 'Hemos enviado un enlace de restablecimiento a',
    'forgot.clickLink': 'Haz clic en el enlace del correo para restablecer tu contraseña.',
    'forgot.checkSpam': '¿No lo ves? Revisa tu carpeta de spam o correo no deseado.',
    'forgot.tryAgain': 'Intentar con otro correo',
    'forgot.sending': 'Enviando...',

    // Checkout Page
    'checkout.signInRequired': 'Inicio de Sesión Requerido',
    'checkout.signInMessage': 'Por favor inicia sesión para completar tu compra.',
    'checkout.signInContinue': 'Iniciar Sesión para Continuar',
    'checkout.secureCheckout': 'Pago Seguro',
    'checkout.backToPricing': 'Volver a Precios',
    'checkout.paymentTitle': 'Completa Tu Compra',
    'checkout.paymentSubtitle': 'Procesamiento de pagos seguro con Stripe',
    'checkout.stripeSecure': 'Pagos Seguros con Stripe',
    'checkout.stripeSecureDesc': 'Tu pago será procesado de forma segura a través de Stripe. Nunca almacenamos los datos de tu tarjeta en nuestros servidores.',
    'checkout.pciCompliant': 'Cumple PCI DSS',
    'checkout.encrypted': 'Encriptado de extremo a extremo',
    'checkout.noCardStored': 'Sin datos de tarjeta almacenados',
    'checkout.comingSoon': 'Procesamiento de Pagos Próximamente',
    'checkout.comingSoonDesc': 'Estamos finalizando nuestra integración con Stripe. Mientras tanto, puedes hacer preguntas ilimitadas gratis o contactarnos para precios empresariales.',
    'checkout.moneyBack': 'Garantía de Devolución de 30 Días',
    'checkout.moneyBackDesc': '¿No estás satisfecho? Obtén un reembolso completo dentro de 30 días, sin preguntas.',
    'checkout.askFreeWhileWaiting': 'Preguntar Gratis',
    'checkout.contactUs': 'Contáctanos',
    'checkout.orderSummary': 'Resumen del Pedido',
    'checkout.plan': 'Plan',
    'checkout.subscription': 'Suscripción mensual',
    'checkout.total': 'Total',
    'checkout.whatsIncluded': 'Qué Incluye',
    'checkout.feature1': 'Preguntas legales IA ilimitadas',
    'checkout.feature2': 'Planes de acción y próximos pasos',
    'checkout.feature3': 'Plantillas y generación de documentos',
    'checkout.feature4': 'Búsqueda de abogados y directorio',
    'checkout.feature5': 'Soporte prioritario',
    'checkout.termsNote': 'Al comprar, aceptas nuestros Términos de Servicio y Política de Privacidad.',

    // Login Page
    'login.joinThousands': 'Únete a miles de personas obténiendo ayuda legal accesible en Arizona',

    // Dashboard Page
    'dash.welcomeBack': 'Bienvenido de nuevo',
    'dash.aiDashboard': 'Tu panel de asistente legal con IA',
    'dash.freeTier': 'Plan Gratuito',
    'dash.upgradeUnlimited': 'Mejora para acceso ilimitado',
    'dash.todaysUsage': 'Uso de Hoy',
    'dash.monthlyUsage': 'Uso Mensual',
    'dash.freeQuestions': 'Preguntas Gratis',
    'dash.askQuestions': 'Hacer Preguntas',
    'dash.whenNeeded': 'Cuando Necesites',
    'dash.issuePacks': 'Paquetes de Ayuda',
    'dash.freeForever': 'Gratis Para Siempre',
    'dash.noLimit': 'SIN LÍMITE',
    'dash.unlimitedAi': 'Preguntas IA ilimitadas',
    'dash.attorneyAccess': 'Acceso al directorio de abogados',
    'dash.guidesResources': 'Guías y recursos legales',
    'dash.noCreditCard': 'Sin tarjeta de crédito',
    'dash.issuePacksPrice': 'Paquetes de Ayuda ($29-$49) incluyen:',
    'dash.actionPlans': 'Planes de acción detallados para tu caso',
    'dash.docTemplates': 'Plantillas de documentos y listas',
    'dash.quickActions': 'Acciones Rápidas',
    'dash.costSavings': 'Ahorro estimado de tiempo en organización de consultas',
    'dash.aiLawyerMatch': 'IA + Abogado',
    'dash.aiLawyerMatchDesc': 'RespuestásIA + recomendaciones de abogados',
    'dash.tryItNow': 'Pruébalo ahora',
    'dash.aiChatAssistant': 'Asistente IA de Chat',
    'dash.aiChatDesc': 'Obtén respuestas en 5 segundos',
    'dash.startChatting': 'Iniciar chat',
    'dash.generateDocs': 'Generar Documentos',
    'dash.generateDocsDesc': 'Crea formularios y contratos legales',
    'dash.createDocument': 'Crear documento',
    'dash.legalResearch': 'Investigación Legal',
    'dash.legalResearchDesc': 'Busca jurisprudencia de Arizona',
    'dash.startResearch': 'Iniciar investigación',
    'dash.findLawyer': 'Encontrar Abogado',
    'dash.findLawyerDesc': 'Conecta con abogados verificados',
    'dash.browseLawyers': 'Ver abogados',
    'dash.outcomeScenarios': 'Escenarios de Resultado',
    'dash.outcomeScenariosDesc': 'Escenarios estimados por IA',
    'dash.analyzeCase': 'Analizar caso',
    'dash.recentActivity': 'Actividad Reciente',
    'dash.viewAll': 'Ver todo',
    'dash.noActivity': 'Sin actividad aún',
    'dash.startFirst': 'Inicia tu primera conversación',
    'dash.yourStats': 'Tus Estadísticas',
    'dash.conversations': 'Conversaciones',
    'dash.estimatedValue': 'Valor estimado recibido',
    'dash.unlimited': 'Ilimitado',
    'dash.freeQuestionsAvailable': 'Preguntas gratis disponibles',
    'dash.getIssuePack': 'Obtener Paquete - $29-$49',
    'dash.actionPlansTemplates': 'Planes de acción y plantillas',
    'dash.browseByArea': 'Explorar por Área de Práctica',
    'dash.services': 'Servicios',
    'dash.needHumanAttorney': '¿Necesitas un Abogado Humano?',
    'dash.aiGuidanceNote': 'Aunque nuestra IA proporciona excelente orientación, algunos asuntos requieren un abogado licenciado. Explora nuestra red de abogados verificados y certificados.',
    'dash.browseAttorneys': 'Ver Abogados',
    'dash.verifiedNetwork': 'Red de abogados verificados',
    'dash.whyChoose': 'Por Qué Elegir Nuestra Red:',
    'dash.allVerified': 'Todos los abogados verificados y licenciados',
    'dash.responseTime': 'Tiempo de respuesta: 3-4 minutos promedio',
    'dash.growingCommunity': 'Comunidad de clientes en crecimiento',

    // Sidebar Layout
    'sidebar.startNewChat': 'Iniciar Nuevo Chat',
    'sidebar.contactUs': 'Contactaños',
    'sidebar.dashboard': 'Panel',
    'sidebar.aiLawyerMatch': 'IA + Abogado',
    'sidebar.chatbot': 'Chatbot ezLegal.ai',
    'sidebar.history': 'Historial',
    'sidebar.documents': 'Documentos',
    'sidebar.research': 'Investigación',
    'sidebar.matters': 'Asuntos',
    'sidebar.clients': 'Clientes',
    'sidebar.lawyerProfiles': 'Perfiles de Abogados',
    'sidebar.resources': 'Recursos',
    'sidebar.legalGuides': 'Guías Legales',
    'sidebar.aboutUs': 'Nosotros',
    'sidebar.websiteWidgets': 'Widgets del Sitio',
    'sidebar.widgetIntegration': 'Integración de Widget',
    'sidebar.profile': 'Perfil',
    'sidebar.adminPanel': 'Panel de Admin',
    'sidebar.signOut': 'Cerrar Sesión',
    'sidebar.premiumAccount': 'Cuenta Premium',
    'sidebar.freeAccount': 'Cuenta Gratuita',
    'sidebar.tryForFree': 'Prueba Gratis',
    'sidebar.tryForFreeDesc': 'Regístrate para guardar tu historial y acceder a funciones premium',
    'sidebar.createAccount': 'Crear Cuenta',
    'sidebar.signIn': 'Iniciar Sesión',
    'sidebar.skipToMain': 'Saltar al contenido principal',
    'sidebar.chat': 'Chat',
    'sidebar.contact': 'Contacto',

    'history.title': 'Centro de Actividad',
    'history.subtitle': 'Sigue tu recorrido completo en todas las funciones de ezLegal.ai',
    'history.refresh': 'Actualizar',
    'history.export': 'Exportar',
    'history.newChat': 'Nuevo Chat',
    'history.search': 'Buscar actividades...',
    'history.favorites': 'Favoritos',
    'history.type': 'Tipo',
    'history.activityTypes': 'Tipos de Actividad',
    'history.active': 'Activo',
    'history.allTime': 'Todo el Tiempo',
    'history.today': 'Hoy',
    'history.last7Days': 'Últimos 7 Días',
    'history.last30Days': 'Últimos 30 Días',
    'history.clear': 'Limpiar',
    'history.noMatch': 'No hay actividades que coincidan con tus filtros',
    'history.noActivity': 'Sin actividad aún',
    'history.adjustFilters': 'Intenta ajustar tus filtros o término de búsqueda',
    'history.willAppear': 'Tu historial de actividad aparecerá aquí mientras usas las funciones de ezLegal.ai',
    'history.clearFilters': 'Limpiar Filtros',
    'history.startChat': 'Iniciar un Chat',
    'history.importHistory': 'Importar Historial de Chat',
    'history.loadMore': 'Cargar Más Actividades',
    'history.loading': 'Cargando...',
    'history.unlockTitle': 'Desbloquea Tu Historial Completo de Actividad',
    'history.unlockDesc': 'Obtén acceso completo a todos tus datos de actividad con análisis avanzado y capacidades de exportación.',
    'history.advancedAnalytics': 'Análisis Avanzado',
    'history.unlimitedExports': 'Exportaciones Ilimitadas',
    'history.fullHistory': 'Historial Completo',
    'history.upgradeNow': 'Mejorar Ahora',
    'history.exportLimitTitle': 'Límite de Exportación Alcanzado',
    'history.exportLimitDesc': 'Las cuentas gratuitas pueden exportar hasta 10 actividades. Mejora a Premium para exportaciónes ilimitadas.',
    'history.exportLimitFeature1': 'Exportaciónes ilimitadas a CSV',
    'history.exportLimitFeature2': 'Análisis avanzado de actividad',
    'history.exportLimitFeature3': 'Historial de actividad de por vida',
    'history.maybeLater': 'Quizás Después',
    'history.upgrade': 'Mejorar',
    'history.typeChatSessions': 'Sesiónes de Chat',
    'history.typeLawyerMatches': 'Coincidencias de Abogados',
    'history.typeDocuments': 'Documentos',
    'history.typePredictions': 'Predicciones',
    'history.typeCases': 'Casos',
    'history.typeSystem': 'Sistema',

    'research.title': 'Investigación Legal con IA',
    'research.signupPrompt': 'Investiga ahora, regístrate para guardar tu historial',
    'research.createAccount': 'Crear Cuenta',
    'research.heading': 'Investigación Legal',
    'research.subtitle': 'Búsqueda con IA en jurisprudencia, estatutos, regulaciones y precedentes',
    'research.newResearch': 'Nueva Investigación',
    'research.researchHistory': 'Historial de Investigación',
    'research.queryLabel': 'Consulta de Investigación',
    'research.queryPlaceholder': 'Ingresa tu consulta de investigación legal...',
    'research.jurisdiction': 'Jurisdicción',
    'research.practiceArea': 'Área de Práctica',
    'research.allPracticeAreas': 'Todas las Áreas',
    'research.sourceFilters': 'Filtros de Fuentes',
    'research.caseLaw': 'Jurisprudencia',
    'research.caseLawDesc': 'Decisiones y opiniones judiciales',
    'research.statutes': 'Estatutos',
    'research.statutesDesc': 'Leyes y codigos promulgados',
    'research.regulations': 'Regulaciones',
    'research.regulationsDesc': 'Normas administrativas',
    'research.legalPrecedents': 'Precedentes Legales',
    'research.legalPrecedentsDesc': 'Precedentes vinculantes',
    'research.researching': 'Investigando Fuentes Legales...',
    'research.conductResearch': 'Realizar Investigación Legal con IA',
    'research.selectSource': 'Por favor selecciona al menos un tipo de fuente',
    'research.summary': 'Resumen de Investigación',
    'research.relevantAuthorities': 'Autoridades Relevantes',
    'research.sourcesFound': 'fuentes encontradas',
    'research.highRelevance': 'alta relevancia',
    'research.mediumRelevance': 'relevancia media',
    'research.lowRelevance': 'baja relevancia',
    'research.keyPoints': 'Puntos Clave',
    'research.practicalGuidance': 'Guia Práctica',
    'research.results': 'Resultados de Investigación',
    'research.disclaimer': 'Aviso Legal',
    'research.disclaimerText': 'Esta investigación es generada por IA y debe ser verificada por un profesiónal legal. Siempre consulte con un abogado licenciado para asesoramiento legal específico.',
    'research.noHistory': 'Sin historial de investigación',
    'research.startResearching': 'Iniciar Investigación',
    'research.researchAgain': 'Investigar de Nuevo',
    'research.showLess': 'Mostrar menos',
    'research.showFull': 'Mostrar resultados completos',

    'matters.title': 'Organiza Tus Asuntos Legales',
    'matters.signInPrompt': 'Inicia sesión para crear y gestionar tus asuntos legales',
    'matters.signIn': 'Iniciar Sesión',
    'matters.createAccount': 'Crear Cuenta',
    'matters.heading': 'Mis Asuntos',
    'matters.subtitle': 'Organiza y da seguimiento a todos tus asuntos legales en un solo lugar',
    'matters.newMatter': 'Nuevo Asunto',
    'matters.totalMatters': 'Total de Asuntos',
    'matters.active': 'Activos',
    'matters.onHold': 'En Espera',
    'matters.closed': 'Cerrados',
    'matters.searchPlaceholder': 'Buscar asuntos...',
    'matters.allStatus': 'Todos los Estados',
    'matters.open': 'Abierto',
    'matters.archived': 'Archivado',
    'matters.allPracticeAreas': 'Todas las Áreas',
    'matters.noMatch': 'No hay asuntos que coincidan con tus filtros',
    'matters.noMatters': 'Sin asuntos aún',
    'matters.adjustFilters': 'Intenta ajustar tu búsqueda o filtros',
    'matters.createFirst': 'Crea tu primer asunto para organizar tus actividades legales',
    'matters.createFirstBtn': 'Crear Tu Primer Asunto',
    'matters.documents': 'documentos',
    'matters.participants': 'participantes',
    'matters.updated': 'Actualizado',
    'matters.viewDetails': 'Ver Detalles',
    'matters.exportRecord': 'Exportar Registro',
    'matters.createNewMatter': 'Crear Nuevo Asunto',
    'matters.createDesc': 'Crea un asunto para organizar tus documentos legales, chats y actividades',
    'matters.matterTitle': 'Título del Asunto',
    'matters.practiceArea': 'Área de Práctica',
    'matters.selectPracticeArea': 'Seleccionar area de práctica',
    'matters.jurisdictionLabel': 'Jurisdicción',
    'matters.priority': 'Prioridad',
    'matters.priorityLow': 'Baja',
    'matters.priorityMedium': 'Media',
    'matters.priorityHigh': 'Alta',
    'matters.priorityUrgent': 'Urgente',
    'matters.status': 'Estado',
    'matters.description': 'Descripción',
    'matters.cancel': 'Cancelar',
    'matters.createMatter': 'Crear Asunto',
    'matters.exportTitle': 'Exportar Registro del Asunto',
    'matters.exportDesc': 'Descarga un registro completo de este asunto incluyendo todos los detalles, documentos e información de participantes.',
    'matters.exportIncludes': 'La exportación incluye:',
    'matters.exportItem1': 'Detalles del asunto y cronología',
    'matters.exportItem2': 'Referencias de documentos',
    'matters.exportItem3': 'Información de participantes',
    'matters.exportItem4': 'Historial de estados',
    'matters.exportJSON': 'Exportar JSON',
    'matters.exporting': 'Exportando...',

    'clients.title': 'Gestión de Clientes',
    'clients.subtitle': 'Gestióna la información e ingreso de tus clientes',
    'clients.searchPlaceholder': 'Buscar clientes...',
    'clients.addClient': 'Agregar Cliente',
    'clients.added': 'Agregado',
    'clients.noClients': 'No se encontraron clientes',
    'clients.adjustSearch': 'Intenta ajustar tu búsqueda',
    'clients.addFirst': 'Agrega tu primer cliente para comenzar',
    'clients.intakeForm': 'Formulario de Ingreso de Cliente',
    'clients.intakeDesc': 'Agrega un nuevo cliente a tu sistema',
    'clients.firstName': 'Nombre',
    'clients.lastName': 'Apellido',
    'clients.email': 'Correo Electrónico',
    'clients.phone': 'Teléfono',
    'clients.address': 'Dirección',
    'clients.notes': 'Notas',
    'clients.notesPlaceholder': 'Agrega cualquier información adicional sobre este cliente...',
    'clients.cancel': 'Cancelar',

    'profile.title': 'Configuración de Cuenta',
    'profile.subtitle': 'Gestióna tu perfil y preferencias de cuenta',
    'profile.tabProfile': 'Información de Perfil',
    'profile.tabPreferences': 'Preferencias',
    'profile.tabSecurity': 'Seguridad',
    'profile.tabData': 'Datos y Privacidad',
    'profile.photoTitle': 'Foto de Perfil',
    'profile.photoDesc': 'Haz clic en el icono de cámara para subir una foto (max 2MB)',
    'profile.photoUploading': 'Subiendo...',
    'profile.photoFormats': 'Formatos compatibles: JPEG, PNG, WebP, GIF',
    'profile.fullName': 'Nombre Completo',
    'profile.emailAddress': 'Correo Electrónico',
    'profile.phoneNumber': 'Número de Teléfono',
    'profile.jobTitle': 'Cargo',
    'profile.company': 'Empresa / Organización',
    'profile.bio': 'Biografía',
    'profile.bioPlaceholder': 'Cuéntaños sobre ti...',
    'profile.saveChanges': 'Guardar Cambios',
    'profile.saving': 'Guardando...',
    'profile.notifTitle': 'Preferencias de Notificación',
    'profile.emailNotif': 'Notificaciónes por Correo',
    'profile.emailNotifDesc': 'Recibe actualizaciones y notificaciones por correo electrónico',
    'profile.smsNotif': 'Notificaciónes por SMS',
    'profile.smsNotifDesc': 'Recibe actualizaciones urgentes por mensaje de texto',
    'profile.savePreferences': 'Guardar Preferencias',
    'profile.changePassword': 'Cambiar Contraseña',
    'profile.changePasswordDesc': 'Actualiza tu contraseña para mantener tu cuenta segura',
    'profile.newPassword': 'Nueva Contraseña',
    'profile.confirmPassword': 'Confirmar Nueva Contraseña',
    'profile.updatePassword': 'Actualizar Contraseña',
    'profile.updating': 'Actualizando...',
    'profile.accountInfo': 'Información de Cuenta',
    'profile.accountId': 'ID de Cuenta:',
    'profile.emailLabel': 'Correo:',
    'profile.accountCreated': 'Cuenta Creada:',
    'profile.dataRights': 'Tus Derechos de Datos',
    'profile.dataRightsDesc': 'Tienes derecho a acceder, exportar y eliminar tus datos personales. Cumplimos con CCPA y otras regulaciones de privacidad. Tus datos nunca se usan para entrenar IA.',
    'profile.exportTitle': 'Exportar Tus Datos',
    'profile.exportDesc': 'Descarga una copia de todos tus datos incluyendo información de perfil, historial de chat y documentos.',
    'profile.exportJSON': 'Exportar como JSON',
    'profile.exportCSV': 'Exportar como CSV',
    'profile.exportingData': 'Exportando...',
    'profile.recentExports': 'Solicitudes de Exportación Recientes',
    'profile.dataRetention': 'Retención de Datos',
    'profile.chatHistory': 'Historial de Chat',
    'profile.chatRetention': 'Se retiene por 90 días, luego se elimina automaticamente',
    'profile.documentsLabel': 'Documentos',
    'profile.docRetention': 'Se retiene por 1 año, luego se elimina automaticamente',
    'profile.deleteTitle': 'Eliminar Tus Datos',
    'profile.deleteDesc': 'Solicita la eliminación de tu historial de chat y documentos subidos. Esta acción no se puede deshacer. Tu cuenta permanecera activa pero tus datos de conversación se eliminaran permanentemente.',
    'profile.deletionPending': 'Solicitud de Eliminación Pendiente',
    'profile.cancelRequest': 'Cancelar esta solicitud',
    'profile.requestDeletion': 'Solicitar Eliminación de Datos',
    'profile.confirmDeletion': 'Confirmar Eliminación de Datos',
    'profile.confirmDeletionDesc': 'Esto eliminara permanentemente tu historial de chat y documentos. Escribe "DELETE" para confirmar.',
    'profile.scheduleDeletion': 'Programar Eliminación (7 días)',
    'profile.deleteImmediately': 'Eliminar Inmediatamente',
    'profile.processing': 'Procesando...',
    'profile.deletionHistory': 'Historial de Solicitudes de Eliminación',
    'profile.cancel': 'Cancelar',

    'ai.poweredBy': 'Desarrollado por',
    'ai.subtitle': 'Respuestásinstantáneas + conexión con abogados verificados',
    'ai.responseTime': 'Tiempo promedio de respuesta de IA',
    'ai.costSavings': 'Ahorro vs asesoría legal tradicional',
    'ai.lawyerResponse': 'Tiempo de respuesta del abogado',
    'ai.reviewContract': 'Revisar Contrato',
    'ai.reviewContractDesc': 'Obtén análisis de contrato',
    'ai.legalDispute': 'Disputa Legal',
    'ai.legalDisputeDesc': 'Conoce tus opciones',
    'ai.startBusiness': 'Iniciar Negocio',
    'ai.startBusinessDesc': 'Guia de formación',
    'ai.employmentIssue': 'Problema Laboral',
    'ai.employmentIssueDesc': 'Conoce tus derechos',
    'ai.askAnything': 'Pregúntale a ezLegal.ai cualquier cosa sobre la ley de Arizona',
    'ai.getGuidance': 'Obtén orientación instantánea y conecta con el abogado adecuado si es necesario',
    'ai.export': 'Exportar',
    'ai.browseTopics': 'Explorar Temas',
    'ai.tipUpload': 'Consejo: Haz clic en el icono de subir para adjuntar documentos (PDF, DOC, TXT)',
    'ai.signedIn': 'Sesión iniciada',
    'ai.guestMode': 'Modo invitado',
    'ai.askPlaceholder': 'Haz tu pregunta legal...',
    'ai.attachedFiles': 'Archivos Adjuntos',
    'ai.connectAttorneys': 'Conecta con Abogados Verificados',
    'ai.allVerified': 'Todos los abogados estáncertificados, verificados y calificados por clientes reales',
    'ai.basedOnQuestion': 'Según tu pregunta, estos abogados pueden ayudarte',
    'ai.readyForAdvice': '¿Listo para asesoría legal personalizada?',
    'ai.whileAI': 'Mientras ezLegal.ai te da orientación instantánea, un abogado real puede darte asesoría personalizada, representarte en la corte y manejar asuntos legales complejos.',
    'ai.freeConsultations': 'Consultas Gratuitas',
    'ai.freeConsultationsDesc': 'La mayoría de abogados ofrecen la primera llamada gratis',
    'ai.verified': '100% Verificados',
    'ai.verifiedDesc': 'Todos los abogados estáncertificados',
    'ai.clientRated': 'Calificados por Clientes',
    'ai.clientRatedDesc': 'Reseñas reales de casos reales',
    'ai.browseAttorneys': 'Ver Abogados Ahora',
    'ai.noObligation': 'Sin compromiso - Sin tarjeta de crédito - Respuesta en minutos',
    'ai.talkToAttorney': '¿Listo para hablar con un abogado real? Desplázate hacia abajo para ver abogados verificados de',
    'ai.viewAttorneys': 'Ver Abogados',
    'ai.attorneys': 'Abogados',
    'ai.responseTimeLabel': 'Tiempo de respuesta',
    'ai.barLicensed': 'Licenciados',
    'ai.fast': 'Rápido',
    'ai.verified2': 'Verificado',
  },
};

```

---

## src/lib/gtm-analytics.ts

```typescript
type EventProperties = Record<string, string | number | boolean | null>;

const STORAGE_KEY = 'ezlegal_analytics_events';

export function getAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {};
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  for (const key of keys) {
    const val = params.get(key);
    if (val) attribution[key] = val;
  }
  attribution.referrer = document.referrer || '';
  attribution.landing_page = window.location.pathname;
  return attribution;
}

export function track(eventName: string, properties?: EventProperties): void {
  const payload = {
    event: eventName,
    properties: { ...properties, ...getAttribution() },
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  if (import.meta.env.DEV) {
    console.debug('[analytics]', eventName, payload);
  }

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(payload);
    if (existing.length > 500) existing.splice(0, existing.length - 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch { /* quota exceeded or private mode */ }

  if (typeof window !== 'undefined' && 'gtag' in window) {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, properties || {});
    }
  }
}

export function identifyLead(email: string, traits?: EventProperties): void {
  track('lead_identified', { email, ...traits });
}

```

---

## src/lib/gtm-content.ts

```typescript
export type ICPKey = 'startups' | 'law_firms' | 'in_house';

export interface ICPContent {
  key: ICPKey;
  label: string;
  pain: string;
  outcome: string;
  useCases: string[];
  cta: string;
  ctaRoute: string;
}

export const ICP_CONTENT: Record<ICPKey, ICPContent> = {
  startups: {
    key: 'startups',
    label: 'Startups & SMBs',
    pain: 'Legal questions pile up around contracts, hiring, privacy, fundraising, and vendor risk.',
    outcome: 'Get organized facts, issue spotting, checklists, and attorney-ready summaries before spending on back-and-forth.',
    useCases: [
      'NDA review prep',
      'Vendor contract triage',
      'Employee/contractor onboarding checklists',
      'Fundraising diligence prep',
      'Privacy policy readiness',
    ],
    cta: 'Check my company\'s legal readiness',
    ctaRoute: '/for-startups',
  },
  law_firms: {
    key: 'law_firms',
    label: 'Law Firms',
    pain: 'Intake, document collection, and first-pass matter summaries consume non-billable time.',
    outcome: 'Standardize client intake, qualify matters faster, and prepare structured summaries for attorney review.',
    useCases: [
      'Client intake automation',
      'Flat-fee package questionnaires',
      'Contract-review intake',
      'Estate/business formation intake',
      'Discovery document organization',
    ],
    cta: 'See intake automation for firms',
    ctaRoute: '/for-law-firms',
  },
  in_house: {
    key: 'in_house',
    label: 'In-House Legal',
    pain: 'Legal teams get scattered requests from sales, HR, procurement, and operations with incomplete facts.',
    outcome: 'Triage requests, collect facts, standardize legal ops workflows, and route matters by urgency.',
    useCases: [
      'NDA intake',
      'Vendor review',
      'Sales contract triage',
      'Employment policy requests',
      'Privacy/security questionnaires',
    ],
    cta: 'Triage legal requests faster',
    ctaRoute: '/for-in-house',
  },
};

export const HERO = {
  headline: 'Resolve legal work faster with AI-powered legal intake, triage, and document workflows.',
  subheadline: 'ezlegal.ai turns legal questions, contracts, and business facts into organized intakes, document checklists, and attorney-ready summaries\u2014without pretending to replace your lawyer.',
  primaryCta: 'Run a free legal readiness check',
  secondaryCta: 'Book a demo',
};

export const PROBLEM_SECTION = {
  title: 'Legal work breaks down before a lawyer even sees it.',
  bullets: [
    'Requests arrive with missing facts.',
    'Documents are scattered across email and drives.',
    'Teams do not know what is urgent.',
    'Lawyers spend time reconstructing context.',
    'Founders and operators delay decisions because next steps are unclear.',
  ],
};

export const WORKFLOW_STEPS = [
  { step: 1, title: 'Ask the right questions', description: 'Guided intake captures facts and context' },
  { step: 2, title: 'Collect facts and documents', description: 'Structured collection replaces scattered emails' },
  { step: 3, title: 'Triage urgency and risk', description: 'Automated scoring surfaces what matters first' },
  { step: 4, title: 'Generate attorney-ready summaries', description: 'Clean briefs ready for legal review' },
  { step: 5, title: 'Route to action', description: 'Self-serve checklist, demo, or legal review' },
];

export interface UseCaseCard {
  title: string;
  icpTag: ICPKey;
  pain: string;
  outcome: string;
  cta: string;
}

export const USE_CASE_CARDS: UseCaseCard[] = [
  { title: 'Contract review intake', icpTag: 'startups', pain: 'Contracts sit unreviewed because teams lack context on what to flag.', outcome: 'AI-guided questionnaire surfaces key terms, risks, and missing clauses.', cta: 'Start contract intake' },
  { title: 'NDA workflow', icpTag: 'in_house', pain: 'Repetitive NDA requests from sales bog down legal teams.', outcome: 'Self-serve NDA intake with pre-approved templates and escalation rules.', cta: 'Automate NDA intake' },
  { title: 'Startup legal readiness', icpTag: 'startups', pain: 'Founders don\'t know what legal gaps exist until it\'s too late.', outcome: 'Comprehensive readiness check identifies gaps before fundraising or scaling.', cta: 'Run readiness check' },
  { title: 'Law firm client intake', icpTag: 'law_firms', pain: 'Initial consultations waste time collecting basic facts.', outcome: 'Pre-consultation intake delivers organized matter summaries.', cta: 'See firm intake tools' },
  { title: 'In-house request triage', icpTag: 'in_house', pain: 'Legal requests arrive via email, Slack, and hallway conversations.', outcome: 'Centralized intake with urgency scoring and automatic routing.', cta: 'Triage requests' },
  { title: 'Fundraising diligence prep', icpTag: 'startups', pain: 'Diligence requests expose disorganized legal records.', outcome: 'Pre-organized document checklists and entity structure summaries.', cta: 'Prep for diligence' },
];

export const PRICING_TIERS = [
  {
    name: 'Pilot',
    audience: 'For founders/operators testing legal workflow automation',
    features: ['Readiness check', 'Basic intake', 'Checklist download', 'Email support'],
    cta: 'Start free check',
    highlighted: false,
  },
  {
    name: 'Team',
    audience: 'For growing teams managing recurring legal requests',
    features: ['Intake workflows', 'Lead/request tracking', 'Analytics-ready events', 'Priority support', 'Team collaboration'],
    cta: 'Book demo',
    highlighted: true,
  },
  {
    name: 'Firm',
    audience: 'For law firms standardizing client intake',
    features: ['Configurable questionnaires', 'Matter summaries', 'Firm-branded workflows', 'API access', 'Dedicated onboarding'],
    cta: 'Talk to us',
    highlighted: false,
  },
];

export const FAQ_ITEMS = [
  { q: 'Is ezlegal.ai a law firm?', a: 'No. ezlegal.ai provides workflow automation and legal information tools. It is not a law firm and does not provide legal advice. No attorney-client relationship is created through use of this platform.' },
  { q: 'Does this replace an attorney?', a: 'No. ezlegal.ai helps organize facts, documents, and workflows so that when you do engage an attorney, the process is faster and more efficient. It does not replace professional legal judgment.' },
  { q: 'What happens after I complete the readiness check?', a: 'You receive a tailored summary of potential legal gaps and recommended next steps. You can download a checklist, book a demo for advanced workflows, or consult an attorney with your organized summary.' },
  { q: 'Can law firms use this for intake?', a: 'Yes. Law firms use ezlegal.ai to standardize client intake, collect documents before consultations, and generate structured matter summaries that save non-billable time.' },
  { q: 'Can in-house teams use this for legal request triage?', a: 'Yes. In-house legal teams use ezlegal.ai to centralize requests from business units, score urgency, collect missing facts, and route matters to the right workflow.' },
  { q: 'Where does my data go?', a: 'Data is stored securely. In production, leads are captured via configured backend endpoints or Supabase. The platform is designed for configurable data handling with privacy controls.' },
  { q: 'Can we connect this to our CRM or case management system?', a: 'The platform is designed with integration in mind. API access is available on Firm-tier plans. Contact us to discuss specific integration requirements.' },
];

export const LEGAL_DISCLAIMER = 'This is legal information and workflow guidance, not legal advice. Using ezlegal.ai does not create an attorney-client relationship.';

export const CHECKLIST_CONTENT = `# Legal Readiness Checklist
## ezlegal.ai

---

## 1. Business Entity & Governance
- [ ] Entity type chosen and formation documents filed
- [ ] Operating agreement or bylaws in place
- [ ] EIN obtained
- [ ] State registrations current
- [ ] Annual filings up to date
- [ ] Board/member resolutions documented

## 2. Contracts & Vendor Obligations
- [ ] Standard contract templates reviewed in last 12 months
- [ ] Vendor agreements organized and accessible
- [ ] Key contract dates (renewals, terminations) tracked
- [ ] Insurance requirements in contracts verified
- [ ] Limitation of liability clauses reviewed

## 3. Employment & Contractor Classification
- [ ] Employee vs. contractor classification documented
- [ ] Offer letters and employment agreements standardized
- [ ] Employee handbook current
- [ ] Non-compete/non-solicitation agreements reviewed
- [ ] Payroll and benefits compliance verified
- [ ] I-9 documentation complete

## 4. Privacy & Data Handling
- [ ] Privacy policy published and current
- [ ] Data processing agreements with vendors
- [ ] Cookie/tracking consent mechanisms in place
- [ ] Data breach response plan documented
- [ ] Employee data handling procedures defined
- [ ] State privacy law compliance assessed (CCPA, etc.)

## 5. IP Ownership
- [ ] IP assignment agreements with employees/contractors
- [ ] Trademark registrations current
- [ ] Trade secret protections documented
- [ ] Open source usage tracked and compliant
- [ ] Domain registrations secured

## 6. Fundraising & Diligence Readiness
- [ ] Cap table current and accessible
- [ ] Prior funding documents organized
- [ ] Material contracts in data room
- [ ] Litigation/disputes disclosed
- [ ] Financial statements available
- [ ] Tax filings up to date

## 7. Litigation & Dispute Red Flags
- [ ] No unresolved demand letters
- [ ] Regulatory complaints addressed
- [ ] Customer disputes documented and tracked
- [ ] Insurance coverage reviewed for potential claims
- [ ] Dispute resolution clauses in key contracts

## 8. When to Consult an Attorney
- Before signing contracts over $50K
- When receiving legal demands or threats
- Before fundraising rounds
- When hiring in new jurisdictions
- When handling sensitive data at scale
- For any IP disputes or infringement claims
- Before major business structure changes

---

DISCLAIMER: This checklist is for informational and organizational purposes only.
It does not constitute legal advice. Consult a licensed attorney for guidance
specific to your situation.

Generated by ezlegal.ai
`;

```

---

## src/lib/ab-test-config.ts

```typescript
import { supabase } from './supabase';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  features: Record<string, boolean | string | number>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  variants: ABTestVariant[];
  metrics: string[];
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export interface ABTestMetric {
  testId: string;
  variantId: string;
  metricName: string;
  value: number;
  sessionId: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export const COGNITIVE_LOAD_TEST: ABTest = {
  id: 'cognitive-load-redesign-v1',
  name: 'Cognitive Load Reduction Redesign',
  description: 'A/B test comparing original chat interface vs. cognitive-load optimized version',
  startDate: '2026-03-26',
  status: 'active',
  variants: [
    {
      id: 'control',
      name: 'Original Chat (Control)',
      weight: 50,
      features: {
        chatVersion: 'v1',
        useTabbedResponses: false,
        useUnifiedTrustStrip: false,
        useMoreHelpDrawer: false,
        useCollapsibleSidebar: false,
        useContextualCrisis: false,
      },
    },
    {
      id: 'treatment',
      name: 'Cognitive Load Optimized',
      weight: 50,
      features: {
        chatVersion: 'v2',
        useTabbedResponses: true,
        useUnifiedTrustStrip: true,
        useMoreHelpDrawer: true,
        useCollapsibleSidebar: true,
        useContextualCrisis: true,
      },
    },
  ],
  metrics: [
    'task_completion_time',
    'misclick_rate',
    'scroll_depth',
    'cta_clarity_score',
    'time_to_first_action',
    'help_drawer_opens',
    'crisis_alert_engagement',
    'session_duration',
    'messages_sent',
    'follow_up_clicks',
    'trust_strip_interactions',
    'tab_switches',
  ],
};

const AB_TEST_STORAGE_KEY = 'ezlegal-ab-test-assignment';

export function getTestAssignment(testId: string): string {
  const storageKey = `${AB_TEST_STORAGE_KEY}-${testId}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;

  const test = testId === COGNITIVE_LOAD_TEST.id ? COGNITIVE_LOAD_TEST : null;
  if (!test) return 'control';

  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedVariant = test.variants[0].id;

  for (const variant of test.variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      selectedVariant = variant.id;
      break;
    }
  }

  localStorage.setItem(storageKey, selectedVariant);
  return selectedVariant;
}

export function getVariantFeatures(testId: string): Record<string, boolean | string | number> {
  const variantId = getTestAssignment(testId);
  const test = testId === COGNITIVE_LOAD_TEST.id ? COGNITIVE_LOAD_TEST : null;
  if (!test) return {};

  const variant = test.variants.find((v) => v.id === variantId);
  return variant?.features || {};
}

export function shouldUseChatV2(): boolean {
  const features = getVariantFeatures(COGNITIVE_LOAD_TEST.id);
  return features.chatVersion === 'v2';
}

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('ezlegal-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('ezlegal-session-id', sessionId);
    }
  }
  return sessionId;
}

export async function trackMetric(
  metricName: string,
  value: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const testId = COGNITIVE_LOAD_TEST.id;
  const variantId = getTestAssignment(testId);

  const metric: ABTestMetric = {
    testId,
    variantId,
    metricName,
    value,
    sessionId: getSessionId(),
    timestamp: new Date(),
    metadata,
  };

  try {
    await supabase.from('engagement_events').insert({
      session_id: metric.sessionId,
      event_type: 'ab_test_metric',
      event_data: {
        test_id: metric.testId,
        variant_id: metric.variantId,
        metric_name: metric.metricName,
        value: metric.value,
        ...metric.metadata,
      },
    });
  } catch (error) {
    console.error('Failed to track A/B test metric:', error);
  }
}

export function trackTaskCompletionTime(startTime: number): void {
  const duration = Date.now() - startTime;
  trackMetric('task_completion_time', duration, { unit: 'ms' });
}

export function trackMisclick(element: string): void {
  trackMetric('misclick_rate', 1, { element });
}

export function trackScrollDepth(depth: number): void {
  trackMetric('scroll_depth', depth, { unit: 'percent' });
}

export function trackCTAClarity(score: number, ctaLabel: string): void {
  trackMetric('cta_clarity_score', score, { cta_label: ctaLabel });
}

export function trackTimeToFirstAction(startTime: number): void {
  const duration = Date.now() - startTime;
  trackMetric('time_to_first_action', duration, { unit: 'ms' });
}

export function trackHelpDrawerOpen(): void {
  trackMetric('help_drawer_opens', 1);
}

export function trackCrisisAlertEngagement(action: 'shown' | 'clicked' | 'dismissed'): void {
  trackMetric('crisis_alert_engagement', 1, { action });
}

export function trackTabSwitch(fromTab: string, toTab: string): void {
  trackMetric('tab_switches', 1, { from_tab: fromTab, to_tab: toTab });
}

export function trackTrustStripInteraction(action: 'expand' | 'collapse' | 'dismiss'): void {
  trackMetric('trust_strip_interactions', 1, { action });
}

export function trackFollowUpClick(questionIndex: number): void {
  trackMetric('follow_up_clicks', 1, { question_index: questionIndex });
}

export const AB_TEST_SUCCESS_CRITERIA = {
  task_completion_time: {
    target: 'decrease',
    threshold: 20,
    unit: 'percent',
    description: 'Users complete tasks 20% faster with new design',
  },
  misclick_rate: {
    target: 'decrease',
    threshold: 30,
    unit: 'percent',
    description: 'Misclicks reduced by 30% with clearer hierarchy',
  },
  scroll_depth: {
    target: 'increase',
    threshold: 15,
    unit: 'percent',
    description: 'Users scroll deeper due to better content chunking',
  },
  cta_clarity_score: {
    target: 'increase',
    threshold: 25,
    unit: 'percent',
    description: 'CTA clarity improved by 25% with single primary action',
  },
  time_to_first_action: {
    target: 'decrease',
    threshold: 25,
    unit: 'percent',
    description: 'Time to first meaningful action reduced by 25%',
  },
  help_drawer_opens: {
    target: 'neutral',
    threshold: 0,
    unit: 'count',
    description: 'Track usage of consolidated help drawer',
  },
  crisis_alert_engagement: {
    target: 'increase',
    threshold: 10,
    unit: 'percent',
    description: 'Contextual crisis alerts have higher engagement',
  },
};

export const INFORMATION_ARCHITECTURE = {
  before: {
    primaryActions: ['Ask Question', 'Crisis Help', 'Free Legal Aid', 'Find Lawyer', 'How AI Works', 'Summary', 'Transcript'],
    secondaryActions: ['Outcome Estimate', 'Issue Packs', 'Export', 'Share', 'Legal Guides', 'Emergency Resources', 'Report Issue'],
    trustElements: ['InFlowTrustStrip', 'LegalDisclaimer banner', 'LegalDisclaimer inline', 'ChatHandoffToolbar warning'],
    sidebarItems: ['Dashboard', 'AI Lawyer Match', 'Case Predictor', 'Browse Topics', 'Recent History', 'Documents', 'Research', 'Lawyer Profiles', 'Share', 'Profile'],
    crisisHandling: 'Always visible in toolbar + modal on detection',
    responseFormat: 'Single block of text with inline citations',
    cognitiveLoadZones: 15,
  },
  after: {
    primaryActions: ['Ask Question'],
    secondaryActions: ['Find Attorney', 'Free Legal Aid', 'Case Estimate', 'Legal Guides', 'Issue Packs', 'Export', 'Share', 'Report'],
    trustElements: ['UnifiedTrustStrip (dismissible)'],
    sidebarItems: ['Dashboard', 'Ask Question', 'Case Predictor', 'Legal Guides', 'Find Attorney', 'Documents', 'Settings'],
    crisisHandling: 'Contextual only when risk signals detected',
    responseFormat: 'Tabbed: Summary | Action Steps | Sources',
    cognitiveLoadZones: 6,
  },
};

export const ACCESSIBILITY_CHECKLIST = {
  contrast: {
    requirement: 'WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)',
    status: 'pass',
    notes: 'All text colors verified against backgrounds',
  },
  focusOrder: {
    requirement: 'Logical tab order following visual layout',
    status: 'pass',
    notes: 'Focus moves: trust strip > main content > input > help drawer',
  },
  readingLevel: {
    requirement: 'Flesch-Kincaid Grade 8 or lower for UI text',
    status: 'pass',
    notes: 'UI microcopy simplified; legal content maintains accuracy',
  },
  scanability: {
    requirement: 'F-pattern layout with clear visual hierarchy',
    status: 'pass',
    notes: 'Tabs create scannable sections; one primary CTA per viewport',
  },
  ariaLabels: {
    requirement: 'All interactive elements have accessible names',
    status: 'pass',
    notes: 'Buttons, tabs, and drawers have aria-labels',
  },
  keyboardNav: {
    requirement: 'All functions accessible via keyboard',
    status: 'pass',
    notes: 'Tab, Enter, Escape, Arrow keys supported',
  },
  screenReader: {
    requirement: 'Content structure conveyed to assistive tech',
    status: 'pass',
    notes: 'Semantic HTML, role attributes, and live regions used',
  },
  motionSafe: {
    requirement: 'Animations respect prefers-reduced-motion',
    status: 'partial',
    notes: 'Using Tailwind animate-in; should add motion-safe classes',
  },
};

export const LAYOUT_SPEC = {
  desktop: {
    sidebar: {
      width: '256px (expanded) / 64px (collapsed)',
      position: 'fixed left',
      collapsedByDefault: false,
      sectionCollapse: ['resources', 'history'],
    },
    mainContent: {
      maxWidth: '768px',
      padding: '24px',
      alignment: 'center',
    },
    trustStrip: {
      position: 'top of main content',
      height: '40px (collapsed) / auto (expanded)',
      dismissible: true,
    },
    inputArea: {
      position: 'bottom sticky',
      maxWidth: '768px',
      padding: '16px',
    },
    moreHelpDrawer: {
      trigger: 'bottom-right of input area',
      direction: 'opens upward',
      width: '320px',
    },
  },
  mobile: {
    sidebar: {
      width: '100%',
      position: 'hidden (toggle via hamburger)',
      collapsedByDefault: true,
    },
    mainContent: {
      maxWidth: '100%',
      padding: '16px',
      alignment: 'full-width',
    },
    trustStrip: {
      position: 'top of viewport',
      height: '32px (collapsed)',
      dismissible: true,
    },
    inputArea: {
      position: 'bottom fixed',
      maxWidth: '100%',
      padding: '12px',
    },
    moreHelpDrawer: {
      trigger: 'bottom-right of input area',
      direction: 'opens upward (bottom sheet style)',
      width: '100%',
    },
  },
};

export const COMPONENT_PRIORITY = {
  primary: [
    { name: 'InputArea', description: 'Single primary action: send question' },
    { name: 'TabbedResponse', description: 'Chunked legal response with tabs' },
  ],
  secondary: [
    { name: 'UnifiedTrustStrip', description: 'Compact, dismissible trust info' },
    { name: 'MoreHelpDrawer', description: 'Consolidated secondary actions' },
    { name: 'FollowUpSuggestions', description: 'Quick follow-up question chips' },
  ],
  tertiary: [
    { name: 'CollapsibleSidebar', description: 'Navigation, collapses by default on sections' },
    { name: 'ContextualCrisisAlert', description: 'Shown only when risk signals detected' },
    { name: 'ModelIndicator', description: 'Small text showing AI model used' },
  ],
};

```

---

## src/lib/consent.ts

```typescript
import { supabase } from './supabase';

export const CONSENT_VERSION = '2026-05-03';

export type ConsentType = 'privacy_notice' | 'ai_processing' | 'marketing';

export async function recordConsent(params: {
  consentType: ConsentType;
  source: string;
  language: string;
  userId?: string | null;
  granted?: boolean;
}): Promise<void> {
  try {
    await supabase.from('consent_records').insert({
      user_id: params.userId ?? null,
      consent_type: params.consentType,
      consent_version: CONSENT_VERSION,
      granted: params.granted ?? true,
      source: params.source,
      language: params.language,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    // Consent logging must never break the user flow.
  }
}

```

---

## src/lib/focus-manager.ts

```typescript
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'details > summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(root: HTMLElement | Document = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  );
}

export function focusFirstIn(root: HTMLElement | null): boolean {
  if (!root) return false;
  const autofocusEl = root.querySelector<HTMLElement>('[data-autofocus]');
  if (autofocusEl) {
    autofocusEl.focus();
    return true;
  }
  const focusables = getFocusableElements(root);
  if (focusables.length > 0) {
    focusables[0].focus();
    return true;
  }
  if (root.tabIndex < 0) root.tabIndex = -1;
  root.focus();
  return true;
}

export function isElementInDOM(el: Element | null): el is HTMLElement {
  return !!el && el instanceof HTMLElement && document.body.contains(el);
}

let liveRegionNode: HTMLDivElement | null = null;

function ensureLiveRegion(): HTMLDivElement {
  if (liveRegionNode && document.body.contains(liveRegionNode)) return liveRegionNode;
  const node = document.createElement('div');
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  node.setAttribute('aria-atomic', 'true');
  node.className = 'sr-only';
  node.id = 'sr-live-region';
  document.body.appendChild(node);
  liveRegionNode = node;
  return node;
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const node = ensureLiveRegion();
  node.setAttribute('aria-live', priority);
  node.textContent = '';
  window.setTimeout(() => {
    node.textContent = message;
  }, 50);
}

```

---

## src/lib/focus-trap.ts

```typescript
import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    ).filter(el => el.offsetParent !== null);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);

      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, getFocusableElements]);

  return containerRef;
}

```

---

## src/lib/error-handler.ts

```typescript
import { supabase } from './supabase';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';
export type ErrorCategory = 'network' | 'api' | 'validation' | 'render' | 'unknown';

export interface ClassifiedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string | null;
  userMessage: { en: string; es: string };
  originalMessage: string;
  retryable: boolean;
}

const SESSION_KEY = (() => {
  if (typeof window === 'undefined') return null;
  const existing = sessionStorage.getItem('ezlegal.error.session');
  if (existing) return existing;
  const fresh =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  sessionStorage.setItem('ezlegal.error.session', fresh);
  return fresh;
})();

const OFFLINE_QUEUE_KEY = 'ezlegal.error.queue';

function loadQueue(): unknown[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveQueue(q: unknown[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q.slice(-50)));
  } catch {
    /* storage full */
  }
}

export function classifyError(err: unknown): ClassifiedError {
  if (err instanceof TypeError && /fetch|network|failed to fetch/i.test(err.message)) {
    return {
      category: 'network',
      severity: 'warning',
      code: null,
      userMessage: {
        en: "We can't reach the internet right now. Check your connection and try again.",
        es: 'No podemos conectarnos ahora. Revisa tu conexion e intenta de nuevo.',
      },
      originalMessage: err.message,
      retryable: true,
    };
  }

  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = Number((err as { status: number }).status);
    if (status >= 500) {
      return {
        category: 'api',
        severity: 'error',
        code: String(status),
        userMessage: {
          en: 'Our servers hit a snag. We logged it and the team is notified. Please try again in a moment.',
          es: 'Nuestros servidores tuvieron un problema. Lo registramos. Intenta de nuevo en un momento.',
        },
        originalMessage: `HTTP ${status}`,
        retryable: true,
      };
    }
    if (status === 401 || status === 403) {
      return {
        category: 'api',
        severity: 'warning',
        code: String(status),
        userMessage: {
          en: "You'll need to sign in again to continue.",
          es: 'Necesitas iniciar sesion de nuevo para continuar.',
        },
        originalMessage: `HTTP ${status}`,
        retryable: false,
      };
    }
    if (status === 404) {
      return {
        category: 'api',
        severity: 'info',
        code: '404',
        userMessage: {
          en: "We couldn't find what you were looking for.",
          es: 'No pudimos encontrar lo que buscabas.',
        },
        originalMessage: 'HTTP 404',
        retryable: false,
      };
    }
    if (status === 429) {
      return {
        category: 'api',
        severity: 'warning',
        code: '429',
        userMessage: {
          en: 'Too many requests at once. Please wait a few seconds and try again.',
          es: 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.',
        },
        originalMessage: 'HTTP 429',
        retryable: true,
      };
    }
    if (status >= 400) {
      return {
        category: 'validation',
        severity: 'warning',
        code: String(status),
        userMessage: {
          en: 'Please review the information and try again.',
          es: 'Revisa la información e intenta de nuevo.',
        },
        originalMessage: `HTTP ${status}`,
        retryable: false,
      };
    }
  }

  const msg = err instanceof Error ? err.message : String(err ?? '');
  return {
    category: 'unknown',
    severity: 'error',
    code: null,
    userMessage: {
      en: 'Something went wrong on our end. Please try again in a moment.',
      es: 'Algo salio mal. Intenta de nuevo en un momento.',
    },
    originalMessage: msg || 'Unknown error',
    retryable: true,
  };
}

export interface LogErrorOptions {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
}

export async function logError(err: unknown, options: LogErrorOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  const classified = classifyError(err);
  const stack = err instanceof Error ? err.stack ?? null : null;

  const { data: auth } = await supabase.auth.getUser().catch(() => ({ data: { user: null } } as const));
  const userId = auth?.user?.id ?? null;

  const row = {
    user_id: userId,
    session_key: SESSION_KEY,
    severity: options.severity ?? classified.severity,
    category: options.category ?? classified.category,
    code: classified.code,
    message: classified.originalMessage.slice(0, 2000),
    stack: stack?.slice(0, 4000) ?? null,
    url: window.location.href,
    user_agent: navigator.userAgent.slice(0, 512),
    context: options.context ?? {},
  };

  if (!navigator.onLine) {
    const queue = loadQueue();
    queue.push(row);
    saveQueue(queue);
    return;
  }

  try {
    await supabase.from('client_error_logs').insert(row);
  } catch {
    const queue = loadQueue();
    queue.push(row);
    saveQueue(queue);
  }
}

export async function flushErrorQueue(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  const queue = loadQueue();
  if (!queue.length) return;
  try {
    await supabase.from('client_error_logs').insert(queue);
    saveQueue([]);
  } catch {
    /* leave queued for next attempt */
  }
}

export function friendlyMessage(err: unknown, locale: 'en' | 'es' = 'en'): string {
  return classifyError(err).userMessage[locale];
}

export interface SafeFetchOptions extends RequestInit {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { retries = 2, retryDelayMs = 600, timeoutMs = 20000, ...init } = options;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: init.signal ?? controller.signal });
      clearTimeout(timer);
      if (res.status >= 500 && attempt < retries) {
        lastError = { status: res.status };
        await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
        continue;
      }
      if (!res.ok) {
        const err = { status: res.status, statusText: res.statusText };
        void logError(err, { category: 'api', context: { url } });
        throw err;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < retries && classifyError(err).retryable) {
        await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
        continue;
      }
      void logError(err, { category: 'network', context: { url, attempt } });
      throw err;
    }
  }
  throw lastError ?? new Error('safeFetch failed');
}

export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (event) => {
    void logError(event.error ?? new Error(event.message), {
      category: 'render',
      severity: 'error',
      context: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    void logError(event.reason, { category: 'render', severity: 'error', context: { unhandled: true } });
  });
  window.addEventListener('online', () => {
    void flushErrorQueue();
  });
  void flushErrorQueue();
}

```

---

## src/lib/leads.ts

```typescript
import { supabase } from './supabase';
import { getAttribution, track } from './gtm-analytics';

export interface LeadData {
  icp: string;
  legalNeed: string;
  urgency: string;
  organizationName: string;
  teamSize: string;
  description: string;
  documentCount?: string;
  firstName: string;
  email: string;
  role: string;
  leadScore: number;
  recommendation: string;
}

export async function submitLead(data: LeadData): Promise<{ success: boolean; method: string }> {
  const attribution = getAttribution();
  const payload = {
    ...data,
    attribution,
    created_at: new Date().toISOString(),
  };

  track('lead_submit_attempt', { icp: data.icp, lead_score: data.leadScore });

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      track('lead_submit_success', { method: 'endpoint', icp: data.icp });
      return { success: true, method: 'endpoint' };
    } catch (err) {
      track('lead_submit_error', { method: 'endpoint', error: String(err) });
    }
  }

  try {
    const { error } = await supabase.from('leads').insert({
      first_name: data.firstName,
      email: data.email,
      role_title: data.role,
      icp: data.icp,
      legal_need: data.legalNeed,
      urgency: data.urgency,
      organization: data.organizationName,
      company_size: data.teamSize,
      description: data.description,
      document_count: data.documentCount ? parseInt(data.documentCount, 10) || null : null,
      lead_score: data.leadScore,
      source_page: window.location.pathname,
      attribution,
      raw_payload: payload,
    });
    if (error) throw error;
    track('lead_submit_success', { method: 'supabase', icp: data.icp });
    return { success: true, method: 'supabase' };
  } catch {
    // Fallback to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('ezlegal_leads') || '[]');
      existing.push(payload);
      localStorage.setItem('ezlegal_leads', JSON.stringify(existing));
    } catch { /* ignore */ }
    track('lead_submit_success', { method: 'localStorage', icp: data.icp });
    return { success: true, method: 'localStorage' };
  }
}

export function calculateLeadScore(data: { urgency: string; legalNeed: string; teamSize: string; email: string }): number {
  let score = 0;
  if (data.urgency === 'today') score += 35;
  else if (data.urgency === 'this_week') score += 25;
  else if (data.urgency === 'this_month') score += 15;

  if (['contract_review', 'legal_intake'].includes(data.legalNeed)) score += 20;
  else if (data.legalNeed !== 'other') score += 10;

  const size = parseInt(data.teamSize, 10);
  if (!isNaN(size) && size > 10) score += 15;
  else if (!isNaN(size) && size > 3) score += 5;

  if (data.email && !data.email.includes('gmail') && !data.email.includes('yahoo') && !data.email.includes('hotmail')) {
    score += 10;
  }

  return score;
}

```

---

## src/lib/plan-context.ts

```typescript
const STORAGE_KEY = 'ezlegal.pendingPlan';

export interface PendingPlan {
  planId: string;
  source?: string;
  timestamp: number;
}

export function setPendingPlan(planId: string, source?: string): void {
  if (typeof window === 'undefined' || !planId) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ planId, source: source ?? '', timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage unavailable
  }
}

export function readPendingPlan(): PendingPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPlan;
    if (!parsed?.planId) return null;
    if (Date.now() - parsed.timestamp > 1000 * 60 * 60 * 2) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPlan(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

```

---

## src/lib/tenant-config.ts

```typescript
interface TenantBranding {
  name: string;
  tagline: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  favicon?: string;
}

interface TenantFeatures {
  enableProBono: boolean;
  enableLawyerDirectory: boolean;
  enableDocumentAnalysis: boolean;
  enableMultiLanguage: boolean;
  enableOutcomePrediction: boolean;
  enableAICaseMatching: boolean;
  enableAIGrantReporting: boolean;
  maxFreeQuestions: number;
  showPricing: boolean;
  customJurisdictions: string[];
}

interface TenantApiEndpoints {
  slimApi: string;
  chatbotApi: string;
  predictionApi: string;
}

interface TenantComplianceConfig {
  enableArizonaValidation: boolean;
  enableBiasMitigation: boolean;
  enableEthicalGuidelines: boolean;
  enableDocumentValidator: boolean;
  enforcementScoreThreshold: number;
}

interface TenantConfig {
  id: string;
  domain: string;
  branding: TenantBranding;
  features: TenantFeatures;
  apiEndpoints: TenantApiEndpoints;
  compliance: TenantComplianceConfig;
  analyticsId?: string;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsUrl: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

const DEFAULT_CONFIG: TenantConfig = {
  id: 'ezlegal',
  domain: 'ezlegal.ai',
  branding: {
    name: 'ezLegal.ai',
    tagline: 'AI-Powered Legal Information for Everyone',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a5f',
    accentColor: '#f59e0b',
  },
  features: {
    enableProBono: true,
    enableLawyerDirectory: true,
    enableDocumentAnalysis: true,
    enableMultiLanguage: true,
    enableOutcomePrediction: true,
    enableAICaseMatching: true,
    enableAIGrantReporting: true,
    maxFreeQuestions: 3,
    showPricing: true,
    customJurisdictions: ['Arizona', 'California', 'Texas', 'New York', 'Florida'],
  },
  apiEndpoints: {
    slimApi: 'https://legalbreeze.com/slim-api/data',
    chatbotApi: `${SUPABASE_URL}/functions/v1`,
    predictionApi: `${SUPABASE_URL}/functions/v1/outcome-prediction`,
  },
  compliance: {
    enableArizonaValidation: true,
    enableBiasMitigation: true,
    enableEthicalGuidelines: true,
    enableDocumentValidator: true,
    enforcementScoreThreshold: 0.7,
  },
  supportEmail: 'support@ezlegal.ai',
  privacyPolicyUrl: '/privacy',
  termsUrl: '/terms',
};

const TENANT_CONFIGS: Record<string, Partial<TenantConfig>> = {
  'ezlegal.ai': {
    id: 'ezlegal',
  },
  'legalbreeze.com': {
    id: 'legalbreeze',
    domain: 'legalbreeze.com',
    branding: {
      name: 'LegalBreeze',
      tagline: 'Legal Solutions Made Simple',
      primaryColor: '#2f60d5',
      secondaryColor: '#1a365d',
      accentColor: '#38a169',
    },
    features: {
      enableProBono: true,
      enableLawyerDirectory: true,
      enableDocumentAnalysis: true,
      enableMultiLanguage: true,
      enableOutcomePrediction: true,
      enableAICaseMatching: true,
      enableAIGrantReporting: true,
      maxFreeQuestions: 5,
      showPricing: true,
      customJurisdictions: ['Arizona'],
    },
    apiEndpoints: {
      slimApi: 'https://legalbreeze.com/slim-api/data',
      chatbotApi: 'https://legalbreeze.com/chatbot-api',
      predictionApi: `${SUPABASE_URL}/functions/v1/outcome-prediction`,
    },
    compliance: {
      enableArizonaValidation: true,
      enableBiasMitigation: true,
      enableEthicalGuidelines: true,
      enableDocumentValidator: true,
      enforcementScoreThreshold: 0.75,
    },
    supportEmail: 'support@legalbreeze.com',
    privacyPolicyUrl: 'https://legalbreeze.com/privacy-policy',
    termsUrl: 'https://legalbreeze.com/terms',
  },
  localhost: {
    id: 'development',
  },
};

function detectTenant(): string {
  const hostname = window.location.hostname;

  if (hostname.includes('legalbreeze')) {
    return 'legalbreeze.com';
  }
  if (hostname.includes('ezlegal')) {
    return 'ezlegal.ai';
  }

  const subdomain = hostname.split('.')[0];
  if (TENANT_CONFIGS[subdomain]) {
    return subdomain;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam && TENANT_CONFIGS[tenantParam]) {
    return tenantParam;
  }

  return 'ezlegal.ai';
}

function mergeTenantConfig(base: TenantConfig, override: Partial<TenantConfig>): TenantConfig {
  return {
    ...base,
    ...override,
    branding: {
      ...base.branding,
      ...override.branding,
    },
    features: {
      ...base.features,
      ...override.features,
    },
    apiEndpoints: {
      ...base.apiEndpoints,
      ...override.apiEndpoints,
    },
    compliance: {
      ...base.compliance,
      ...override.compliance,
    },
  };
}

class TenantManager {
  private config: TenantConfig;
  private tenantKey: string;

  constructor() {
    this.tenantKey = detectTenant();
    const tenantOverride = TENANT_CONFIGS[this.tenantKey] || {};
    this.config = mergeTenantConfig(DEFAULT_CONFIG, tenantOverride);
  }

  getConfig(): TenantConfig {
    return this.config;
  }

  getTenantId(): string {
    return this.config.id;
  }

  getBranding(): TenantBranding {
    return this.config.branding;
  }

  getFeatures(): TenantFeatures {
    return this.config.features;
  }

  isFeatureEnabled(feature: keyof TenantFeatures): boolean {
    const value = this.config.features[feature];
    return typeof value === 'boolean' ? value : true;
  }

  getMaxFreeQuestions(): number {
    return this.config.features.maxFreeQuestions;
  }

  getSupportEmail(): string {
    return this.config.supportEmail;
  }

  getApiEndpoints(): TenantApiEndpoints {
    return this.config.apiEndpoints;
  }

  getComplianceConfig(): TenantComplianceConfig {
    return this.config.compliance;
  }

  getSiteUrl(): string {
    return `https://${this.config.domain}`;
  }

  getPageUrl(path: string): string {
    return `${this.getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  }

  getPredictionApiUrl(): string {
    return this.config.apiEndpoints.predictionApi;
  }

  getChatbotApiUrl(): string {
    return this.config.apiEndpoints.chatbotApi;
  }

  getSlimApiUrl(): string {
    return this.config.apiEndpoints.slimApi;
  }

  applyBrandingToDocument(): void {
    const { branding } = this.config;

    document.documentElement.style.setProperty('--tenant-primary', branding.primaryColor);
    document.documentElement.style.setProperty('--tenant-secondary', branding.secondaryColor);
    document.documentElement.style.setProperty('--tenant-accent', branding.accentColor);

    document.title = `${branding.name} - ${branding.tagline}`;

    if (branding.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon;
      }
    }
  }
}

export const tenantManager = new TenantManager();

export type { TenantConfig, TenantBranding, TenantFeatures, TenantApiEndpoints, TenantComplianceConfig };

```

---

## src/contexts/AuthContext.tsx

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserType = 'individual' | 'business' | 'organization';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  subscription_tier: string;
  user_type: UserType;
  hero_variant_seen?: boolean;
  default_landing_route?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: Provider, redirectTo?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateUserType: (userType: UserType) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, is_admin, subscription_tier, user_type')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) {
      setProfile(data);
      return data;
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signInWithOAuth = async (provider: Provider, redirectTo?: string) => {
    const origin = window.location.origin;
    let finalRedirect = redirectTo || `${origin}/chatbot`;
    try {
      const target = new URL(finalRedirect, origin);
      if (target.origin === origin && target.pathname !== '/auth/callback') {
        const nextPath = `${target.pathname}${target.search}${target.hash}` || '/chatbot';
        finalRedirect = `${origin}/auth/callback?redirect=${encodeURIComponent(nextPath)}`;
      }
    } catch {
      finalRedirect = `${origin}/auth/callback?redirect=${encodeURIComponent('/chatbot')}`;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: finalRedirect,
        queryParams: provider === 'google'
          ? { access_type: 'offline', prompt: 'consent' }
          : undefined,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const updateUserType = async (userType: UserType) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('profiles')
      .update({ user_type: userType })
      .eq('id', user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, user_type: userType } : null);
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithOAuth, signOut, refreshProfile, resetPassword, updatePassword, updateUserType }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

```

---

## src/contexts/LanguageContext.tsx

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { translations } from '../lib/translations';
import {
  type Language,
  type Direction,
  SUPPORTED_LOCALES,
  getLocaleDescriptor,
  detectBrowserLanguage,
  getBrowserTimezone,
  applyDirectionToDom,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatList,
  selectPlural,
} from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { trackEvent, setAnalyticsLanguage } from '../services/analytics-service';

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextType {
  language: Language;
  locale: string;
  dir: Direction;
  timezone: string;
  setLanguage: (lang: Language) => void;
  setLocale: (bcp47: string) => void;
  t: TranslateFn;
  formatDate: (v: Date | string | number, opts?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (v: Date | string | number) => string;
  formatRelativeTime: (v: Date | string | number) => string;
  formatNumber: (v: number, opts?: Intl.NumberFormatOptions) => string;
  formatCurrency: (v: number, currency?: string) => string;
  formatPercent: (v: number, fractionDigits?: number) => string;
  formatList: (items: string[], type?: Intl.ListFormatType) => string;
  plural: (count: number, forms: { zero?: string; one: string; two?: string; few?: string; many?: string; other: string }) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG = 'ezlegal-language';
const STORAGE_LOCALE = 'ezlegal-locale';

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) return saved as Language;
    return detectBrowserLanguage();
  });

  const [locale, setLocaleState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_LOCALE);
    if (saved) return saved;
    return getLocaleDescriptor(language).bcp47;
  });

  const [timezone, setTimezone] = useState<string>(() => getBrowserTimezone());

  const descriptor = useMemo(() => getLocaleDescriptor(language), [language]);
  const dir: Direction = descriptor.dir;

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG, language);
    localStorage.setItem(STORAGE_LOCALE, locale);
    applyDirectionToDom(dir, locale, language);
  }, [language, locale, dir]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user || !active) return;
        const { data } = await supabase
          .from('accessibility_preferences')
          .select('locale, timezone')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!active || !data) return;
        if (data.locale) {
          const code = data.locale.split('-')[0] as Language;
          const match = SUPPORTED_LOCALES.find((l) => l.code === code);
          if (match) {
            setLanguageState(match.code);
            setLocaleState(data.locale);
          }
        }
        if (data.timezone) setTimezone(data.timezone);
      } catch { /* gracefully handle unauthenticated or network errors */ }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (patch: { locale?: string; timezone?: string }) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;
      await supabase
        .from('accessibility_preferences')
        .upsert(
          { user_id: user.id, ...patch, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
    } catch { /* gracefully handle unauthenticated or network errors */ }
  }, []);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      setAnalyticsLanguage(lang);
      trackEvent('language_selected', { language: lang });
      const bcp47 = getLocaleDescriptor(lang).bcp47;
      setLocaleState(bcp47);
      void persist({ locale: bcp47 });
    },
    [persist],
  );

  const setLocale = useCallback(
    (bcp47: string) => {
      setLocaleState(bcp47);
      const code = bcp47.split('-')[0] as Language;
      if (SUPPORTED_LOCALES.some((l) => l.code === code)) setLanguageState(code);
      void persist({ locale: bcp47 });
    },
    [persist],
  );

  const t: TranslateFn = useCallback(
    (key, vars) => {
      const dict = translations[language] ?? translations.en;
      const fallback = translations.en[key] ?? key;
      return interpolate(dict[key] ?? fallback, vars);
    },
    [language],
  );

  const value: LanguageContextType = useMemo(
    () => ({
      language,
      locale,
      dir,
      timezone,
      setLanguage,
      setLocale,
      t,
      formatDate: (v, opts) => formatDate(v, locale, opts, timezone),
      formatDateTime: (v) => formatDateTime(v, locale, timezone),
      formatRelativeTime: (v) => formatRelativeTime(v, locale),
      formatNumber: (v, opts) => formatNumber(v, locale, opts),
      formatCurrency: (v, currency) => formatCurrency(v, locale, currency),
      formatPercent: (v, frac) => formatPercent(v, locale, frac),
      formatList: (items, type) => formatList(items, locale, type),
      plural: (count, forms) => selectPlural(count, locale, forms),
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [language, locale, dir, timezone, setLanguage, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LOCALES } from '../lib/i18n';
export type { Language, Direction } from '../lib/i18n';

```

---

## src/contexts/PersonaContext.tsx

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PersonaType = 'individual' | 'business' | 'legal-aid' | null;

interface PersonaContextValue {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  clearPersona: () => void;
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

const PERSONA_STORAGE_KEY = 'ez_selected_persona';

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored && ['individual', 'business', 'legal-aid'].includes(stored)) {
        setPersonaState(stored as PersonaType);
      }
    } catch {
      // sessionStorage disabled
    }
  }, []);

  const setPersona = (newPersona: PersonaType) => {
    setPersonaState(newPersona);
    try {
      if (newPersona) {
        sessionStorage.setItem(PERSONA_STORAGE_KEY, newPersona);
      } else {
        sessionStorage.removeItem(PERSONA_STORAGE_KEY);
      }
    } catch {
      // sessionStorage disabled
    }
  };

  const clearPersona = () => {
    setPersona(null);
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona, clearPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}

```

---

