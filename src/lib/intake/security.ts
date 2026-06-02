import { supabase } from '../supabase';

export type SecurityCheckResult =
  | { ok: true; userId: string }
  | { ok: false; reason: string };

export type PartnerSecurityResult =
  | { ok: true; userId: string; partnerProfileId: string }
  | { ok: false; reason: string };

export async function requireAuthenticated(): Promise<SecurityCheckResult> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { ok: false, reason: 'not_authenticated' };
  }
  return { ok: true, userId: data.user.id };
}

export async function requirePartnerAccess(): Promise<PartnerSecurityResult> {
  const authCheck = await requireAuthenticated();
  if (!authCheck.ok) {
    return authCheck;
  }

  const { data: profile, error } = await supabase
    .from('org_partner_profiles')
    .select('id')
    .eq('user_id', authCheck.userId)
    .maybeSingle();

  if (error || !profile) {
    return { ok: false, reason: 'no_partner_profile' };
  }

  return { ok: true, userId: authCheck.userId, partnerProfileId: profile.id };
}

export async function requireReferralOwnership(referralId: string): Promise<PartnerSecurityResult> {
  const partnerCheck = await requirePartnerAccess();
  if (!partnerCheck.ok) {
    return partnerCheck;
  }

  const { data: referral, error } = await supabase
    .from('referral_routing_records')
    .select('id, partner_profile_id')
    .eq('id', referralId)
    .maybeSingle();

  if (error || !referral) {
    return { ok: false, reason: 'referral_not_found' };
  }

  if (referral.partner_profile_id !== partnerCheck.partnerProfileId) {
    return { ok: false, reason: 'referral_not_assigned_to_partner' };
  }

  return partnerCheck;
}

export async function requireRequestOwnership(requestId: string): Promise<SecurityCheckResult> {
  const authCheck = await requireAuthenticated();
  if (!authCheck.ok) {
    return authCheck;
  }

  const { data: request, error } = await supabase
    .from('attorney_review_requests')
    .select('id, user_id')
    .eq('id', requestId)
    .maybeSingle();

  if (error || !request) {
    return { ok: false, reason: 'request_not_found' };
  }

  if (request.user_id !== authCheck.userId) {
    return { ok: false, reason: 'request_not_owned_by_user' };
  }

  return authCheck;
}
