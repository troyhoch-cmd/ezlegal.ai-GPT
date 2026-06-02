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
