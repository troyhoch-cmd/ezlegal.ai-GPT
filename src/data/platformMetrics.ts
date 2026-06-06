export const platformMetrics = {
  routes: {
    public: 25,
    authenticated: 12,
    total: 70,
    lastVerified: '2026-06-06',
  },
  tests: {
    unitFiles: 22,
    e2eFiles: 9,
    evalFiles: 3,
    total: 34,
    lastVerified: '2026-06-06',
  },
  languages: {
    supported: ['en', 'es'] as const,
    partial: ['ar'] as const,
    translationKeys: 960,
    lastVerified: '2026-06-06',
  },
  accessibility: {
    targetLevel: 'WCAG 2.2 AA',
    skipLinks: true,
    focusManagement: true,
    ariaLabels: true,
    reducedMotion: true,
    readingPreferences: true,
    lastVerified: '2026-06-06',
  },
  governance: {
    modelCard: { version: '3.2', lastUpdated: '2026-05' },
    biasMonitoring: { version: '2.1', lastAssessment: '2026-04', nextAssessment: '2026-07' },
    impactAssessment: { version: '1.3', period: 'Q2 2026', nextReview: 'Q3 2026' },
    dataProvenance: { version: '1.0', lastUpdated: '2026-06' },
  },
  security: {
    rlsEnabled: true,
    cspHeaders: true,
    zodValidation: true,
    secretsScan: true,
    securityHardeningPhases: 4,
    lastVerified: '2026-06-06',
  },
  pwa: {
    serviceWorker: true,
    offlineFallback: true,
    manifest: true,
    installPrompt: true,
    lastVerified: '2026-06-06',
  },
} as const;

export type PlatformMetrics = typeof platformMetrics;
