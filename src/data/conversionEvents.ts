export type ConversionEvent =
  | 'home_viewed'
  | 'home_cta_clicked'
  | 'issue_chip_clicked'
  | 'urgent_resources_clicked'
  | 'language_toggled';

export interface ConversionMeta {
  cta?: string;
  chip?: string;
  language?: string;
  source?: string;
  path?: string;
}

export const CONVERSION_EVENTS: Record<ConversionEvent, { description: string; safeFields: string[] }> = {
  home_viewed: { description: 'User landed on homepage', safeFields: ['language'] },
  home_cta_clicked: { description: 'User clicked a CTA button', safeFields: ['cta'] },
  issue_chip_clicked: { description: 'User selected an issue chip', safeFields: ['chip'] },
  urgent_resources_clicked: { description: 'User navigated to urgent resources', safeFields: ['source'] },
  language_toggled: { description: 'User switched language', safeFields: ['language'] },
};
