import { supabase } from '../supabase';
import type { AttorneyReviewRequest, ReviewUrgency } from './types';

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

export async function createReviewRequest(params: {
  businessSegment: string;
  jurisdiction?: string | null;
  issueArea?: string | null;
  triggerReasons: string[];
  urgency: ReviewUrgency;
  documentType?: string | null;
  priceCents?: number | null;
}): Promise<{ id: string } | null> {
  const userId = await getCurrentUserId();
  const anonymousSessionId = userId ? null : getAnonymousSessionId();

  const { data, error } = await supabase
    .from('attorney_review_requests')
    .insert({
      user_id: userId,
      anonymous_session_id: anonymousSessionId,
      business_segment: params.businessSegment,
      jurisdiction: params.jurisdiction ?? null,
      issue_area: params.issueArea ?? null,
      trigger_reasons: params.triggerReasons,
      urgency: params.urgency,
      document_type: params.documentType ?? null,
      status: 'draft',
      price_cents: params.priceCents ?? null,
      metadata: {},
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[attorneyReview/requests] createReviewRequest error:', error.message);
    return null;
  }
  return data;
}

export async function submitReviewRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('attorney_review_requests')
    .update({ status: 'submitted', metadata: { submitted_at: new Date().toISOString() } })
    .eq('id', requestId)
    .eq('status', 'draft');

  if (error) {
    console.error('[attorneyReview/requests] submitReviewRequest error:', error.message);
    return false;
  }
  return true;
}

export async function acknowledgeScope(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('attorney_review_requests')
    .update({ scope_acknowledged_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) {
    console.error('[attorneyReview/requests] acknowledgeScope error:', error.message);
    return false;
  }
  return true;
}

export async function cancelReviewRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('attorney_review_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .in('status', ['draft', 'submitted']);

  if (error) {
    console.error('[attorneyReview/requests] cancelReviewRequest error:', error.message);
    return false;
  }
  return true;
}

export async function getUserReviewRequests(): Promise<AttorneyReviewRequest[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('attorney_review_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[attorneyReview/requests] getUserReviewRequests error:', error.message);
    return [];
  }

  return (data ?? []).map(mapDbToRequest);
}

export async function getReviewRequestById(id: string): Promise<AttorneyReviewRequest | null> {
  const { data, error } = await supabase
    .from('attorney_review_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('[attorneyReview/requests] getReviewRequestById error:', error?.message);
    return null;
  }

  return mapDbToRequest(data);
}

function mapDbToRequest(row: Record<string, unknown>): AttorneyReviewRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string | null,
    anonymousSessionId: row.anonymous_session_id as string | null,
    businessSegment: row.business_segment as string,
    jurisdiction: row.jurisdiction as string | null,
    issueArea: row.issue_area as string | null,
    triggerReasons: row.trigger_reasons as string[],
    urgency: row.urgency as ReviewUrgency,
    documentType: row.document_type as string | null,
    status: row.status as AttorneyReviewRequest['status'],
    priceCents: row.price_cents as number | null,
    scopeAcknowledgedAt: row.scope_acknowledged_at as string | null,
    assignedAttorneyId: row.assigned_attorney_id as string | null,
    attorneyAcceptedAt: row.attorney_accepted_at as string | null,
    completedAt: row.completed_at as string | null,
    conflictCheckStatus: row.conflict_check_status as AttorneyReviewRequest['conflictCheckStatus'],
    requestedTurnaround: row.requested_turnaround as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
