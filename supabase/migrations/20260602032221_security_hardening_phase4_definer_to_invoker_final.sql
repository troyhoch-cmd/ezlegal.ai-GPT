/*
  # Security Hardening Phase 4 - Convert Remaining SECURITY DEFINER Functions

  ## Summary
  Addresses Supabase security advisor findings for 17 remaining functions
  accessible by authenticated role via PostgREST RPC.

  ## Strategy
  - Functions that only READ tables with proper RLS: convert to INVOKER
  - Functions that WRITE to tables with matching INSERT/UPDATE RLS: convert to INVOKER
  - Functions that WRITE to tables WITHOUT caller INSERT/UPDATE RLS: keep DEFINER
    but add auth.uid() guard to prevent misuse

  ## Functions Converted to SECURITY INVOKER (13)
  1. is_admin() - reads own profile row
  2. is_lso_admin() - reads own profile row
  3. is_user_admin(uuid) - reads profiles with SELECT policy
  4. check_is_admin(uuid) - reads profiles with SELECT policy
  5. check_role_access(uuid, text, text, uuid) - reads role_assignments
  6. has_matter_permission(uuid, uuid, text) - reads matter_participants
  7. is_matter_owner(uuid, uuid) - reads matters
  8. is_matter_participant(uuid, uuid) - reads matter_participants
  9. log_user_activity(...) - activity_log has INSERT policy for own rows
  10. log_access_attempt(...) - access_audit_log has INSERT policy for own rows
  11. accept_case_match(uuid, text) - case_matches has ALL policy for org staff
  12. decline_case_match(uuid, text) - case_matches has ALL policy for org staff
  13. run_case_matching(uuid) - case_matches has ALL policy for org staff

  ## Functions Kept as DEFINER with Auth Guard (4)
  14. increment_usage(uuid, text, integer) - daily/monthly tables lack INSERT policy
  15. increment_usage(uuid, text, integer, integer, integer) - same
  16. log_openai_usage(...) - reads ai_model_configs without RLS
  17. check_openai_rate_limit(...) - reads/writes openai_rate_limits

  ## Security Notes
  - DEFINER functions are hardened with auth.uid() IS NOT NULL check
  - DEFINER functions restrict p_user_id to match auth.uid() preventing impersonation
  - INVOKER functions rely on existing RLS for access control
*/

-- ============================================================
-- PART 1: Convert 13 functions to SECURITY INVOKER
-- ============================================================

ALTER FUNCTION public.is_admin() SECURITY INVOKER;
ALTER FUNCTION public.is_lso_admin() SECURITY INVOKER;
ALTER FUNCTION public.is_user_admin(uuid) SECURITY INVOKER;
ALTER FUNCTION public.check_is_admin(uuid) SECURITY INVOKER;
ALTER FUNCTION public.check_role_access(uuid, text, text, uuid) SECURITY INVOKER;
ALTER FUNCTION public.has_matter_permission(uuid, uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.is_matter_owner(uuid, uuid) SECURITY INVOKER;
ALTER FUNCTION public.is_matter_participant(uuid, uuid) SECURITY INVOKER;
ALTER FUNCTION public.log_user_activity(text, text, text, text, jsonb, uuid, text, text) SECURITY INVOKER;
ALTER FUNCTION public.log_access_attempt(text, uuid, text, boolean, text) SECURITY INVOKER;
ALTER FUNCTION public.accept_case_match(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.decline_case_match(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.run_case_matching(uuid) SECURITY INVOKER;

-- ============================================================
-- PART 2: Harden remaining 4 DEFINER functions with auth guards
-- ============================================================

-- 2a. increment_usage (3-param) - add auth guard and restrict to own user_id
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id uuid,
  p_usage_type text,
  p_amount integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_month text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'cannot increment usage for another user';
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
$$;

-- 2b. increment_usage (5-param) - add auth guard and restrict to own user_id
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id uuid,
  p_resource_type text,
  p_amount integer DEFAULT 1,
  p_tokens integer DEFAULT 0,
  p_cost_cents integer DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'cannot increment usage for another user';
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
$$;

-- 2c. log_openai_usage - add auth guard and restrict to own user_id
CREATE OR REPLACE FUNCTION public.log_openai_usage(
  p_user_id uuid,
  p_session_id text,
  p_model_name text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_request_type text DEFAULT 'chat',
  p_jurisdiction text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost_per_token numeric;
  v_cost_usd numeric;
  v_log_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'cannot log usage for another user';
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
    user_id,
    session_id,
    model_name,
    prompt_tokens,
    completion_tokens,
    cost_usd,
    request_type,
    jurisdiction,
    category,
    response_time_ms,
    success,
    error_message
  ) VALUES (
    p_user_id,
    p_session_id,
    p_model_name,
    p_prompt_tokens,
    p_completion_tokens,
    v_cost_usd,
    p_request_type,
    p_jurisdiction,
    p_category,
    p_response_time_ms,
    p_success,
    p_error_message
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 2d. check_openai_rate_limit - add auth guard
CREATE OR REPLACE FUNCTION public.check_openai_rate_limit(
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_window_type text DEFAULT 'hour',
  p_max_requests integer DEFAULT 100,
  p_max_tokens integer DEFAULT 100000
) RETURNS TABLE (
  allowed boolean,
  requests_remaining integer,
  tokens_remaining integer,
  reset_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_duration interval;
  v_current_requests integer;
  v_current_tokens integer;
  v_window_start timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'cannot check rate limit for another user';
  END IF;

  CASE p_window_type
    WHEN 'minute' THEN v_window_duration := interval '1 minute';
    WHEN 'hour' THEN v_window_duration := interval '1 hour';
    WHEN 'day' THEN v_window_duration := interval '1 day';
    ELSE v_window_duration := interval '1 hour';
  END CASE;

  SELECT
    orl.requests_count,
    orl.tokens_count,
    orl.window_start
  INTO v_current_requests, v_current_tokens, v_window_start
  FROM openai_rate_limits orl
  WHERE (p_user_id IS NOT NULL AND orl.user_id = p_user_id)
     OR (p_ip_address IS NOT NULL AND orl.ip_address = p_ip_address)
  AND orl.window_type = p_window_type
  AND orl.window_start > now() - v_window_duration;

  IF NOT FOUND THEN
    v_current_requests := 0;
    v_current_tokens := 0;
    v_window_start := now();
  END IF;

  RETURN QUERY SELECT
    (v_current_requests < p_max_requests AND v_current_tokens < p_max_tokens) AS allowed,
    GREATEST(0, p_max_requests - v_current_requests) AS requests_remaining,
    GREATEST(0, p_max_tokens - v_current_tokens) AS tokens_remaining,
    (v_window_start + v_window_duration) AS reset_at;
END;
$$;

-- ============================================================
-- PART 3: Revoke PUBLIC execute on newly-recreated DEFINER functions
-- (PostgreSQL grants PUBLIC EXECUTE by default on new functions)
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_openai_usage(uuid, text, text, integer, integer, text, text, text, integer, boolean, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_openai_rate_limit(uuid, text, text, integer, integer) FROM PUBLIC, anon;

-- Re-grant to authenticated only
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_openai_usage(uuid, text, text, integer, integer, text, text, text, integer, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_openai_rate_limit(uuid, text, text, integer, integer) TO authenticated;

-- ============================================================
-- PART 4: Ensure INVOKER-converted functions still have execute grants
-- ============================================================

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lso_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_role_access(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_matter_permission(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_matter_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_matter_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity(text, text, text, text, jsonb, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_access_attempt(text, uuid, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_case_match(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_case_match(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_case_matching(uuid) TO authenticated;
