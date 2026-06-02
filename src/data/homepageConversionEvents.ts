export type HomepageConversionEvent =
  | 'homepage_viewed'
  | 'language_changed'
  | 'icp_route_selected'
  | 'hero_checkup_started'
  | 'urgent_help_clicked'
  | 'smb_issue_started'
  | 'partner_demo_clicked'
  | 'safety_notice_expanded';

export interface HomepageEventSpec {
  description: string;
  safeFields: string[];
}

export const HOMEPAGE_CONVERSION_EVENTS: Record<HomepageConversionEvent, HomepageEventSpec> = {
  homepage_viewed: { description: 'User landed on homepage', safeFields: ['language'] },
  language_changed: { description: 'User switched language', safeFields: ['language', 'source'] },
  icp_route_selected: { description: 'User picked an ICP path', safeFields: ['route'] },
  hero_checkup_started: { description: 'User submitted the hero intake', safeFields: ['path'] },
  urgent_help_clicked: { description: 'User navigated to urgent resources', safeFields: ['source'] },
  smb_issue_started: { description: 'User entered SMB flow', safeFields: ['source'] },
  partner_demo_clicked: { description: 'User clicked partner demo CTA', safeFields: ['source'] },
  safety_notice_expanded: { description: 'User expanded safety notice', safeFields: [] },
};

export const FORBIDDEN_ANALYTICS_FIELDS = [
  'question', 'text', 'description', 'name', 'email',
  'phone', 'ssn', 'account_number', 'case_facts', 'freeText',
] as const;
