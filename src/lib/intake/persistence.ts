import { supabase } from '../supabase';
import type { ICP, AffordabilityStatus, TriageRiskLevel } from './types';

function getAnonymousSessionId(): string {
  const KEY = 'ez_anonymous_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function buildIdentity(userId: string | null) {
  return userId
    ? { user_id: userId, anonymous_session_id: null }
    : { user_id: null, anonymous_session_id: getAnonymousSessionId() };
}

export async function saveSpanishTriageSession(params: {
  jurisdiction: string | null;
  affordabilityStatus: AffordabilityStatus;
  riskLevel: TriageRiskLevel;
  hasDeadline: boolean;
  status?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('spanish_triage_sessions')
    .insert({
      ...identity,
      jurisdiction: params.jurisdiction,
      affordability_status: params.affordabilityStatus,
      risk_level: params.riskLevel,
      has_deadline: params.hasDeadline,
      status: params.status ?? 'completed',
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] saveSpanishTriageSession error:', error.message);
    return null;
  }
  return data;
}

export async function saveBusinessIntakeSession(params: {
  jurisdiction?: string | null;
  businessSegment: string;
  documentType?: string | null;
  attorneyReviewRecommended: boolean;
  scopeAcknowledged: boolean;
  status?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('business_intake_sessions')
    .insert({
      ...identity,
      jurisdiction: params.jurisdiction ?? null,
      business_segment: params.businessSegment,
      document_type: params.documentType ?? null,
      attorney_review_recommended: params.attorneyReviewRecommended,
      scope_acknowledged: params.scopeAcknowledged,
      status: params.status ?? 'completed',
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] saveBusinessIntakeSession error:', error.message);
    return null;
  }
  return data;
}

export async function saveOrganizationPartnerProfile(params: {
  orgType: string;
  jurisdictionsServed: string[];
  issueAreas: string[];
  languagesSupported: string[];
  intakeVolume: string;
  acceptsWarmReferrals: boolean;
  requiresConflictCheck: boolean;
  consentGiven: boolean;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('org_partner_profiles')
    .insert({
      ...identity,
      org_type: params.orgType,
      jurisdictions_served: params.jurisdictionsServed,
      issue_areas: params.issueAreas,
      languages_supported: params.languagesSupported,
      intake_volume: params.intakeVolume,
      accepts_warm_referrals: params.acceptsWarmReferrals,
      requires_conflict_check: params.requiresConflictCheck,
      consent_given: params.consentGiven,
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] saveOrganizationPartnerProfile error:', error.message);
    return null;
  }
  return data;
}

export async function createAttorneyReviewRequest(params: {
  businessSessionId?: string | null;
  businessSegment?: string;
  jurisdiction?: string | null;
  issueArea?: string;
  triggerReasons: string[];
  documentType?: string | null;
  urgency?: string;
  priceCents?: number | null;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('attorney_review_requests')
    .insert({
      ...identity,
      business_session_id: params.businessSessionId ?? null,
      business_segment: params.businessSegment ?? null,
      jurisdiction: params.jurisdiction ?? null,
      issue_area: params.issueArea ?? null,
      trigger_reasons: params.triggerReasons,
      document_type: params.documentType ?? null,
      urgency: params.urgency ?? 'normal',
      status: 'draft',
      price_cents: params.priceCents ?? null,
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] createAttorneyReviewRequest error:', error.message);
    return null;
  }
  return data;
}

export async function createReferralRoutingRecord(params: {
  triageSessionId?: string | null;
  partnerProfileId?: string | null;
  jurisdiction?: string | null;
  language?: string;
  issueArea?: string;
  affordabilityStatus?: string;
  riskLevel?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('referral_routing_records')
    .insert({
      ...identity,
      triage_session_id: params.triageSessionId ?? null,
      partner_profile_id: params.partnerProfileId ?? null,
      jurisdiction: params.jurisdiction ?? null,
      language: params.language ?? null,
      issue_area: params.issueArea ?? null,
      affordability_status: params.affordabilityStatus ?? null,
      risk_level: params.riskLevel ?? null,
      referral_status: 'new',
      metadata: params.metadata ?? {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] createReferralRoutingRecord error:', error.message);
    return null;
  }
  return data;
}

export async function recordConsent(params: {
  consentType: string;
  consentText: string;
  consentSource?: string;
  granted: boolean;
  icp?: ICP;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { data, error } = await supabase
    .from('intake_consent_records')
    .insert({
      ...identity,
      consent_type: params.consentType,
      consent_text: params.consentText,
      granted: params.granted,
      icp: params.icp ?? null,
      metadata: {
        ...(params.metadata ?? {}),
        consent_source: params.consentSource ?? 'unknown',
        timestamp: new Date().toISOString(),
      },
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] recordConsent error:', error.message);
    return null;
  }
  return data;
}

export async function recordAuditEvent(params: {
  eventType: string;
  icp?: ICP;
  stepId?: string;
  jurisdiction?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const userId = await getCurrentUserId();
  const identity = buildIdentity(userId);

  const { error } = await supabase
    .from('intake_audit_events')
    .insert({
      ...identity,
      event_type: params.eventType,
      icp: params.icp ?? null,
      step_id: params.stepId ?? null,
      jurisdiction: params.jurisdiction ?? null,
      language: params.language ?? null,
      metadata: params.metadata ?? {},
    });

  if (error) {
    console.error('[intake/persistence] recordAuditEvent error:', error.message);
  }
}

export async function getPartnerProfile(): Promise<{
  id: string;
  org_type: string;
  jurisdictions_served: string[];
  issue_areas: string[];
  languages_supported: string[];
  intake_volume: string;
  accepts_warm_referrals: boolean;
  requires_conflict_check: boolean;
  status: string;
} | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('org_partner_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[intake/persistence] getPartnerProfile error:', error.message);
    return null;
  }
  return data;
}

export async function getPartnerReferrals(partnerProfileId: string): Promise<Array<{
  id: string;
  jurisdiction: string | null;
  language: string | null;
  issue_area: string | null;
  affordability_status: string | null;
  risk_level: string | null;
  referral_status: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('referral_routing_records')
    .select('id, jurisdiction, language, issue_area, affordability_status, risk_level, referral_status, created_at')
    .eq('partner_profile_id', partnerProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[intake/persistence] getPartnerReferrals error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function updateReferralStatus(referralId: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('referral_routing_records')
    .update({ referral_status: status })
    .eq('id', referralId);

  if (error) {
    console.error('[intake/persistence] updateReferralStatus error:', error.message);
    return false;
  }
  return true;
}
