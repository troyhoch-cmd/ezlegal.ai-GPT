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
