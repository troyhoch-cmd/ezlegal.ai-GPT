/*
  # Security Hardening Phase 3 - Convert SECURITY DEFINER to INVOKER

  Addresses remaining "Signed-In Users Can Execute SECURITY DEFINER Function" 
  security advisor findings.

  ## Strategy
  - Functions used in RLS policies MUST remain SECURITY DEFINER (they need to 
    bypass RLS to read profiles/matters tables during policy evaluation)
  - Functions that only write to tables with existing INSERT policies for 
    authenticated users are safe to convert to SECURITY INVOKER
  - Functions that write to tables without direct user access stay DEFINER 
    but get auth.uid() validation added
  - Read-only functions are converted to SECURITY INVOKER

  ## Changes

  ### Converted to SECURITY INVOKER (safe - tables have proper RLS policies):
  - track_engagement (engagement_analytics has authenticated INSERT)
  - track_share_event (engagement_events has authenticated INSERT)
  - store_anonymized_search (anonymized_searches has authenticated INSERT)
  - log_user_activity (activity_log has authenticated INSERT)
  - log_access_attempt (access_audit_log has authenticated INSERT)
  - get_active_openai_model (read-only from ai_models)
  - get_activity_stats (reads own activity_log)
  - get_user_tier (reads own profile)
  - search_ars_by_citation (read-only search)
  - validate_access_token (reads access_tokens)
  - check_usage_limit (read-only check)
  - check_openai_rate_limit (read-only check)
  - export_matter_record (reads matter data with internal permission check)
  - accept_case_match, decline_case_match (write with internal ownership check)
  - run_case_matching (write with internal check)
  - perform_conflict_check (read-only)
  - match_arizona_statutes, match_documents, match_legal_content, match_rag_chunks (read-only vector search)
  - intake_set_updated_at (trigger function - cannot be called via RPC)

  ### Remain SECURITY DEFINER (used in RLS policies or need elevated access):
  - is_admin, is_lso_admin, is_user_admin, check_is_admin (RLS helpers)
  - get_user_role (called by check_role_access and RLS)
  - check_role_access (reads role_access_matrix bypassing RLS)
  - has_matter_permission, is_matter_owner, is_matter_participant (RLS helpers)
  - increment_usage (both overloads - writes to tracking tables)
  - log_openai_usage (writes to openai_usage_logs with cost calc)
  - increment_route_deprecation_hit (updates route_deprecations)
  - get_user_stats (admin: reads all profiles)

  ### Added auth.uid() validation to remaining DEFINER functions:
  - increment_usage: validates p_user_id matches caller (or caller is admin)
  - log_openai_usage: validates p_user_id matches caller (or caller is admin)
  - increment_route_deprecation_hit: kept as-is (any auth user can trigger)
  - get_user_stats: added admin-only check

  ## Security Notes
  - RLS policy helper functions MUST stay DEFINER to avoid infinite recursion
  - Trigger functions cannot be called via PostgREST RPC regardless of grants
  - Functions converted to INVOKER will now respect RLS on underlying tables
*/

-- =============================================================================
-- SECTION 1: Convert analytics/logging functions to SECURITY INVOKER
-- These tables all have INSERT policies for authenticated users
-- =============================================================================

ALTER FUNCTION public.track_engagement(text, text, text, text, text, integer, jsonb, text) SECURITY INVOKER;
ALTER FUNCTION public.track_share_event(text, text, text, text) SECURITY INVOKER;
ALTER FUNCTION public.store_anonymized_search(text, text, text, text, boolean, boolean) SECURITY INVOKER;
ALTER FUNCTION public.log_user_activity(text, text, text, text, jsonb, uuid, text, text) SECURITY INVOKER;
ALTER FUNCTION public.log_access_attempt(text, uuid, text, boolean, text) SECURITY INVOKER;

-- =============================================================================
-- SECTION 2: Convert read-only functions to SECURITY INVOKER
-- =============================================================================

ALTER FUNCTION public.get_active_openai_model() SECURITY INVOKER;
ALTER FUNCTION public.get_activity_stats(uuid, integer) SECURITY INVOKER;
ALTER FUNCTION public.get_user_tier(uuid) SECURITY INVOKER;
ALTER FUNCTION public.search_ars_by_citation(text) SECURITY INVOKER;
ALTER FUNCTION public.validate_access_token(text) SECURITY INVOKER;
ALTER FUNCTION public.check_usage_limit(uuid, text, integer) SECURITY INVOKER;
ALTER FUNCTION public.check_openai_rate_limit(uuid, text, text, integer, integer) SECURITY INVOKER;
ALTER FUNCTION public.check_legal_hold(uuid, uuid) SECURITY INVOKER;

-- =============================================================================
-- SECTION 3: Convert matter/case functions to SECURITY INVOKER
-- These have internal permission checks and tables have proper RLS
-- =============================================================================

ALTER FUNCTION public.export_matter_record(uuid) SECURITY INVOKER;
ALTER FUNCTION public.accept_case_match(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.decline_case_match(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.run_case_matching(uuid) SECURITY INVOKER;
ALTER FUNCTION public.perform_conflict_check(uuid, text, text) SECURITY INVOKER;

-- =============================================================================
-- SECTION 4: Convert vector search functions to SECURITY INVOKER
-- These are read-only and the underlying tables have SELECT policies
-- =============================================================================

ALTER FUNCTION public.match_arizona_statutes(vector, double precision, integer, text, text, text[]) SECURITY INVOKER;
ALTER FUNCTION public.match_documents(vector, double precision, integer, text, text) SECURITY INVOKER;
ALTER FUNCTION public.match_legal_content(vector, double precision, integer, text, text, text, text) SECURITY INVOKER;
ALTER FUNCTION public.match_rag_chunks(vector, double precision, integer, text, text) SECURITY INVOKER;

-- =============================================================================
-- SECTION 5: Convert trigger function to SECURITY INVOKER
-- Trigger functions cannot be invoked via PostgREST RPC
-- =============================================================================

ALTER FUNCTION public.intake_set_updated_at() SECURITY INVOKER;

-- =============================================================================
-- SECTION 6: Harden remaining SECURITY DEFINER functions with auth checks
-- These must stay DEFINER but should validate the caller
-- =============================================================================

-- Recreate get_user_stats with admin-only check
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE(total_users bigint, active_users bigint, suspended_users bigint, free_tier bigint, basic_tier bigint, professional_tier bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_users,
    COUNT(*) FILTER (WHERE status = 'active')::bigint as active_users,
    COUNT(*) FILTER (WHERE status = 'suspended')::bigint as suspended_users,
    COUNT(*) FILTER (WHERE subscription_tier = 'free')::bigint as free_tier,
    COUNT(*) FILTER (WHERE subscription_tier = 'basic')::bigint as basic_tier,
    COUNT(*) FILTER (WHERE subscription_tier = 'professional')::bigint as professional_tier
  FROM profiles;
END;
$function$;

-- Recreate increment_usage (3-arg) with caller validation
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid, p_usage_type text, p_amount integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_month text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: cannot modify another user usage';
  END IF;

  v_current_month := to_char(now(), 'YYYY-MM');

  IF p_usage_type = 'questions' THEN
    INSERT INTO usage_tracking (user_id, month_year, questions_used)
    VALUES (p_user_id, v_current_month, p_amount)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
      questions_used = usage_tracking.questions_used + p_amount,
      updated_at = now();
  ELSIF p_usage_type = 'documents' THEN
    INSERT INTO usage_tracking (user_id, month_year, documents_used)
    VALUES (p_user_id, v_current_month, p_amount)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
      documents_used = usage_tracking.documents_used + p_amount,
      updated_at = now();
  END IF;
END;
$function$;

-- Recreate increment_usage (5-arg) with caller validation
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid, p_resource_type text, p_amount integer DEFAULT 1, p_tokens integer DEFAULT 0, p_cost_cents integer DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: cannot modify another user usage';
  END IF;

  CASE p_resource_type
  WHEN 'messages' THEN
    INSERT INTO daily_usage_tracking (user_id, usage_date, messages_count, tokens_used, estimated_cost_cents)
    VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
      messages_count = daily_usage_tracking.messages_count + p_amount,
      tokens_used = daily_usage_tracking.tokens_used + p_tokens,
      estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
      updated_at = now();

  WHEN 'ai_queries' THEN
    INSERT INTO daily_usage_tracking (user_id, usage_date, ai_queries_count, tokens_used, estimated_cost_cents)
    VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
      ai_queries_count = daily_usage_tracking.ai_queries_count + p_amount,
      tokens_used = daily_usage_tracking.tokens_used + p_tokens,
      estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
      updated_at = now();

  WHEN 'rag_queries' THEN
    INSERT INTO daily_usage_tracking (user_id, usage_date, rag_queries_count, tokens_used, estimated_cost_cents)
    VALUES (p_user_id, CURRENT_DATE, p_amount, p_tokens, p_cost_cents)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
      rag_queries_count = daily_usage_tracking.rag_queries_count + p_amount,
      tokens_used = daily_usage_tracking.tokens_used + p_tokens,
      estimated_cost_cents = daily_usage_tracking.estimated_cost_cents + p_cost_cents,
      updated_at = now();

  WHEN 'documents' THEN
    INSERT INTO monthly_usage_tracking (user_id, usage_month, documents_count)
    VALUES (p_user_id, date_trunc('month', CURRENT_DATE)::date, p_amount)
    ON CONFLICT (user_id, usage_month)
    DO UPDATE SET 
      documents_count = monthly_usage_tracking.documents_count + p_amount,
      updated_at = now();

  WHEN 'exports' THEN
    INSERT INTO monthly_usage_tracking (user_id, usage_month, export_requests_count)
    VALUES (p_user_id, date_trunc('month', CURRENT_DATE)::date, p_amount)
    ON CONFLICT (user_id, usage_month)
    DO UPDATE SET 
      export_requests_count = monthly_usage_tracking.export_requests_count + p_amount,
      updated_at = now();
  END CASE;
END;
$function$;

-- Recreate log_openai_usage with caller validation
CREATE OR REPLACE FUNCTION public.log_openai_usage(p_user_id uuid, p_session_id text, p_model_name text, p_prompt_tokens integer, p_completion_tokens integer, p_request_type text DEFAULT 'chat'::text, p_jurisdiction text DEFAULT NULL::text, p_category text DEFAULT NULL::text, p_response_time_ms integer DEFAULT NULL::integer, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cost_per_token numeric;
  v_cost_usd numeric;
  v_log_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: cannot log usage for another user';
  END IF;

  SELECT cost_per_token INTO v_cost_per_token
  FROM ai_model_configs
  WHERE model_name = p_model_name
  LIMIT 1;

  IF v_cost_per_token IS NULL THEN
    v_cost_per_token := 0.00001;
  END IF;

  v_cost_usd := (p_prompt_tokens + p_completion_tokens) * v_cost_per_token;

  INSERT INTO openai_usage_logs (
    user_id, session_id, model_name, prompt_tokens, completion_tokens,
    cost_usd, request_type, jurisdiction, category, response_time_ms,
    success, error_message
  ) VALUES (
    p_user_id, p_session_id, p_model_name, p_prompt_tokens, p_completion_tokens,
    v_cost_usd, p_request_type, p_jurisdiction, p_category, p_response_time_ms,
    p_success, p_error_message
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$function$;

-- Recreate increment_route_deprecation_hit with auth check
CREATE OR REPLACE FUNCTION public.increment_route_deprecation_hit(p_old_path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE route_deprecations
  SET hits = hits + 1, last_hit_at = now()
  WHERE old_path = p_old_path;
END;
$function$;

-- =============================================================================
-- SECTION 7: Revoke remaining anon access on resolve_subdomain_tenant
-- This function needs anon access for pre-auth tenant resolution,
-- but convert it to SECURITY INVOKER since it only reads a public table
-- =============================================================================

ALTER FUNCTION public.resolve_subdomain_tenant(text) SECURITY INVOKER;

-- =============================================================================
-- SECTION 8: Re-grant permissions (INVOKER functions still need explicit grants)
-- =============================================================================

-- Maintain existing grants (functions converted to INVOKER still need EXECUTE grants)
GRANT EXECUTE ON FUNCTION public.resolve_subdomain_tenant(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_engagement(text, text, text, text, text, integer, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_share_event(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.store_anonymized_search(text, text, text, text, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity(text, text, text, text, jsonb, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_access_attempt(text, uuid, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_openai_model() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_stats(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_ars_by_citation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_access_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_usage_limit(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_openai_rate_limit(uuid, text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_legal_hold(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_matter_record(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_case_match(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_case_match(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_case_matching(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_conflict_check(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_arizona_statutes(vector, double precision, integer, text, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents(vector, double precision, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_legal_content(vector, double precision, integer, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_rag_chunks(vector, double precision, integer, text, text) TO authenticated;
