import { supabase } from '../lib/supabase';

export type EngagementType = 'view' | 'click' | 'complete' | 'convert' | 'share' | 'export';

export interface TrackEngagementParams {
  featureName: string;
  engagementType: EngagementType;
  caseType?: string;
  activityType?: string;
  jurisdiction?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export interface PopularCaseType {
  case_type: string;
  total_engagements: number;
  conversion_rate: number;
}

export interface FeatureEngagementStats {
  feature_name: string;
  total_views: number;
  total_completions: number;
  total_conversions: number;
  avg_duration: number;
}

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export async function trackEngagement(params: TrackEngagementParams): Promise<string | null> {
  const { data, error } = await supabase.rpc('track_engagement', {
    p_feature_name: params.featureName,
    p_engagement_type: params.engagementType,
    p_case_type: params.caseType || null,
    p_activity_type: params.activityType || null,
    p_jurisdiction: params.jurisdiction || null,
    p_duration_seconds: params.durationSeconds || null,
    p_metadata: params.metadata || {},
    p_session_id: params.sessionId || getSessionId()
  });

  if (error) {
    console.error('Failed to track engagement:', error);
    return null;
  }

  return data;
}

export async function storeAnonymizedSearch(params: {
  queryText: string;
  caseType?: string;
  jurisdiction?: string;
  intent?: string;
  ledToConversion?: boolean;
  ledToLawyerMatch?: boolean;
}): Promise<string | null> {
  const { data, error } = await supabase.rpc('store_anonymized_search', {
    p_query_text: params.queryText,
    p_case_type: params.caseType || null,
    p_jurisdiction: params.jurisdiction || null,
    p_intent: params.intent || null,
    p_led_to_conversion: params.ledToConversion || false,
    p_led_to_lawyer_match: params.ledToLawyerMatch || false
  });

  if (error) {
    console.error('Failed to store anonymized search:', error);
    return null;
  }

  return data;
}

export async function getPopularCaseTypes(days: number = 30): Promise<PopularCaseType[]> {
  const { data, error } = await supabase.rpc('get_popular_case_types', {
    p_days: days
  });

  if (error) {
    console.error('Failed to get popular case types:', error);
    return [];
  }

  return data || [];
}

export async function getFeatureEngagementStats(days: number = 30): Promise<FeatureEngagementStats[]> {
  const { data, error } = await supabase.rpc('get_feature_engagement_stats', {
    p_days: days
  });

  if (error) {
    console.error('Failed to get feature engagement stats:', error);
    return [];
  }

  return data || [];
}

export function trackFeatureView(featureName: string, metadata?: Record<string, unknown>) {
  trackEngagement({
    featureName,
    engagementType: 'view',
    metadata
  });
}

export function trackFeatureComplete(featureName: string, caseType?: string, metadata?: Record<string, unknown>) {
  trackEngagement({
    featureName,
    engagementType: 'complete',
    caseType,
    metadata
  });
}

export function trackConversion(featureName: string, caseType?: string) {
  trackEngagement({
    featureName,
    engagementType: 'convert',
    caseType
  });
}

export function trackExport(featureName: string) {
  trackEngagement({
    featureName,
    engagementType: 'export'
  });
}

export function classifyQueryIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (/how (much|long|many)|cost|price|fee|time|duration/.test(lowerQuery)) {
    return 'informational';
  }
  if (/can i|should i|do i need|am i eligible/.test(lowerQuery)) {
    return 'decision_support';
  }
  if (/how (to|do)|steps|process|file|submit/.test(lowerQuery)) {
    return 'procedural';
  }
  if (/what (is|are|does)|define|explain|meaning/.test(lowerQuery)) {
    return 'definitional';
  }
  if (/help|need|urgent|emergency|immediately/.test(lowerQuery)) {
    return 'urgent_assistance';
  }
  if (/lawyer|attorney|represent|hire/.test(lowerQuery)) {
    return 'legal_referral';
  }

  return 'general_inquiry';
}

export type FunnelEvent =
  | 'persona_selected'
  | 'persona_intake_completed'
  | 'icp_track_selected'
  | 'ask_topic_submitted'
  | 'trust_popup_opened'
  | 'next_best_step_impression'
  | 'next_best_step_clicked'
  | 'email_capture_submitted'
  | 'exit_intent_impression'
  | 'exit_intent_converted'
  | 'issue_pack_viewed'
  | 'issue_pack_purchase_started'
  | 'case_predictor_viewed'
  | 'case_predictor_started'
  | 'share_prompt_impression'
  | 'share_prompt_clicked';

export function trackFunnelEvent(
  event: FunnelEvent,
  metadata?: Record<string, unknown>
) {
  trackEngagement({
    featureName: event,
    engagementType: event.includes('impression') || event.includes('viewed') ? 'view'
      : event.includes('clicked') || event.includes('started') || event.includes('selected') || event.includes('submitted') ? 'click'
      : event.includes('converted') || event.includes('purchase') ? 'convert'
      : 'view',
    metadata: {
      ...metadata,
      icp_track: localStorage.getItem('ez_icp_track') || 'individuals',
      language: document.documentElement.lang || 'en',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    },
  });
}

export function detectCaseType(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  const caseTypePatterns: Record<string, RegExp> = {
    'employment': /employ|job|work|fired|terminated|wage|salary|discrimination|harassment/,
    'landlord_tenant': /landlord|tenant|rent|lease|evict|security deposit|apartment|housing/,
    'family': /divorce|custody|child support|alimony|marriage|spouse|visitation/,
    'personal_injury': /injury|accident|hurt|damage|negligence|slip|fall|car accident/,
    'contract': /contract|agreement|breach|promise|deal|signed/,
    'criminal': /arrest|charge|crime|criminal|dui|assault|theft/,
    'business': /business|llc|corporation|partnership|startup|company/,
    'consumer': /refund|warranty|defective|consumer|fraud|scam|complaint/,
    'estate': /will|trust|estate|inheritance|probate|heir|beneficiary/,
    'immigration': /visa|immigration|citizen|green card|deportation|asylum/,
    'intellectual_property': /trademark|copyright|patent|intellectual property|ip|invention/,
    'bankruptcy': /bankruptcy|debt|creditor|chapter 7|chapter 13|foreclosure/
  };

  for (const [caseType, pattern] of Object.entries(caseTypePatterns)) {
    if (pattern.test(lowerQuery)) {
      return caseType;
    }
  }

  return null;
}
