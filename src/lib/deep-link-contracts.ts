export const TOPIC_SLUGS = {
  IMMIGRATION: 'immigration',
  HOUSING: 'housing',
  FAMILY: 'family',
  EMPLOYMENT: 'employment',
  DEBT: 'debt',
  CRIMINAL: 'criminal',
} as const;

export type TopicSlug = (typeof TOPIC_SLUGS)[keyof typeof TOPIC_SLUGS];

export const ALL_TOPIC_SLUGS: TopicSlug[] = Object.values(TOPIC_SLUGS);

export function isValidTopicSlug(value: string): value is TopicSlug {
  return ALL_TOPIC_SLUGS.includes(value as TopicSlug);
}

export const PACK_IDS = {
  HOUSING: 'housing',
  IMMIGRATION: 'immigration',
  FAMILY: 'family',
  EMPLOYMENT: 'employment',
  DEBT: 'debt',
  CRIMINAL: 'criminal',
  NEGOTIATION: 'negotiation',
} as const;

export type PackId = (typeof PACK_IDS)[keyof typeof PACK_IDS];

export const ALL_PACK_IDS: PackId[] = Object.values(PACK_IDS);

export function isValidPackId(value: string): value is PackId {
  return ALL_PACK_IDS.includes(value as PackId);
}

export const PLAN_IDS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

export const ALL_PLAN_IDS: PlanId[] = Object.values(PLAN_IDS);

export function isValidPlanId(value: string): value is PlanId {
  return ALL_PLAN_IDS.includes(value as PlanId);
}

export const CHATBOT_TOPICS = {
  COMPLIANCE: 'compliance',
  CONTRACTS: 'contracts',
  EMPLOYMENT: 'employment',
  HOUSING: 'housing',
  FAMILY: 'family',
  INJURY: 'injury',
  DEBT: 'debt',
} as const;

export type ChatbotTopic = (typeof CHATBOT_TOPICS)[keyof typeof CHATBOT_TOPICS];

const CHATBOT_TOPIC_ALIASES: Record<string, ChatbotTopic> = {
  contract: CHATBOT_TOPICS.CONTRACTS,
};

export function resolveChatbotTopic(value: string): ChatbotTopic | null {
  const normalized = value.toLowerCase().trim();
  const direct = Object.values(CHATBOT_TOPICS).find((t) => t === normalized);
  if (direct) return direct;
  return CHATBOT_TOPIC_ALIASES[normalized] || null;
}

export const VALID_ANCHORS: Record<string, string[]> = {
  '/trust-center': ['privacy', 'data-sovereignty', 'security', 'ai-ethics', 'report'],
  '/privacy': ['introduction', 'ethical-ai', 'collection', 'use', 'sharing', 'retention', 'rights', 'children', 'international', 'changes', 'contact'],
  '/terms': ['acceptance', 'definitions', 'services', 'ai-services', 'accounts', 'subscriptions', 'user-conduct', 'intellectual-property', 'disclaimers', 'limitation', 'indemnification', 'termination', 'disputes', 'general', 'contact'],
  '/partner-hub': ['apply', 'models'],
  '/for-partners': ['integration'],
  '/pricing': ['individuals', 'org-plans'],
  '/negotiate': ['how-it-works'],
  '/enterprise-security': ['certifications'],
  '/ai-governance': ['ethics', 'access', 'in-practice'],
  '/for-organizations': ['technical-architecture', 'conflict-checking'],
  '/issue-packs': ['housing', 'immigration', 'family', 'employment', 'debt', 'criminal', 'negotiation', 'compare'],
};

export function isValidAnchor(pathname: string, anchor: string): boolean {
  const anchors = VALID_ANCHORS[pathname];
  if (!anchors) return false;
  return anchors.includes(anchor);
}

export const VALID_QUERY_PARAMS: Record<string, Record<string, (v: string) => boolean>> = {
  '/find-attorney': {
    specialty: (v) => ALL_TOPIC_SLUGS.includes(v as TopicSlug),
    jurisdiction: (v) => /^[A-Za-z\s]{2,30}$/.test(v),
    mode: (v) => ['directory', 'matching', 'pro-bono'].includes(v),
  },
  '/chatbot': {
    topic: (v) => !!resolveChatbotTopic(v),
    jurisdiction: (v) => /^[A-Za-z\s]{2,30}$/.test(v),
  },
  '/issue-packs': {
    pack: (v) => ALL_PACK_IDS.includes(v as PackId),
    ref: (v) => /^[a-zA-Z0-9_\-]{1,64}$/.test(v),
  },
  '/pricing': {
    plan: (v) => ALL_PLAN_IDS.includes(v as PlanId),
    ref: (v) => /^[a-zA-Z0-9_\-]{1,64}$/.test(v),
  },
};

export function validateQueryParams(pathname: string, search: string): Array<{ key: string; value: string }> {
  const rules = VALID_QUERY_PARAMS[pathname];
  if (!rules) return [];
  const violations: Array<{ key: string; value: string }> = [];
  try {
    const params = new URLSearchParams(search);
    params.forEach((value, key) => {
      if (key.startsWith('utm_') || key === 'ref') return;
      const validator = rules[key];
      if (!validator || !validator(value)) {
        violations.push({ key, value });
      }
    });
  } catch {
    // malformed search string
  }
  return violations;
}

export function resolveTopicFallback(value: string): TopicSlug | null {
  const normalized = value.toLowerCase().trim();
  if (isValidTopicSlug(normalized)) return normalized;
  const aliases: Record<string, TopicSlug> = {
    'trabajo': TOPIC_SLUGS.EMPLOYMENT,
    'vivienda': TOPIC_SLUGS.HOUSING,
    'familia': TOPIC_SLUGS.FAMILY,
    'inmigracion': TOPIC_SLUGS.IMMIGRATION,
    'deuda': TOPIC_SLUGS.DEBT,
    'penal': TOPIC_SLUGS.CRIMINAL,
    'labor': TOPIC_SLUGS.EMPLOYMENT,
    'work': TOPIC_SLUGS.EMPLOYMENT,
    'home': TOPIC_SLUGS.HOUSING,
    'rental': TOPIC_SLUGS.HOUSING,
    'eviction': TOPIC_SLUGS.HOUSING,
    'divorce': TOPIC_SLUGS.FAMILY,
    'custody': TOPIC_SLUGS.FAMILY,
    'daca': TOPIC_SLUGS.IMMIGRATION,
    'visa': TOPIC_SLUGS.IMMIGRATION,
  };
  return aliases[normalized] || null;
}
