-- Security Hardening: Fix lead_captures RLS policy and convert SECURITY DEFINER functions
-- Addresses: always-true WITH CHECK on lead_captures, 7 SECURITY DEFINER functions

----------------------------------------------------------------------
-- 1. Fix lead_captures INSERT policy: add basic field validation
--    The table serves public lead capture forms, so anon INSERT must remain,
--    but we restrict to valid-looking data rather than WITH CHECK (true).
----------------------------------------------------------------------

DROP POLICY IF EXISTS "allow_public_insert_lead_captures" ON lead_captures;

CREATE POLICY "allow_public_insert_lead_captures" ON lead_captures
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) >= 5
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND source IS NOT NULL
    AND length(trim(source)) >= 1
    AND (metadata IS NULL OR pg_column_size(metadata) < 4096)
  );

----------------------------------------------------------------------
-- 2. Convert SECURITY DEFINER functions to SECURITY INVOKER
--    These functions don't need elevated privileges; callers already
--    have appropriate permissions via RLS policies.
----------------------------------------------------------------------

ALTER FUNCTION public.check_legal_hold(p_user_id uuid, p_matter_id uuid)
  SECURITY INVOKER;

ALTER FUNCTION public.check_openai_rate_limit(p_user_id uuid, p_ip_address text, p_window_type text, p_max_requests integer, p_max_tokens integer)
  SECURITY INVOKER;

ALTER FUNCTION public.export_matter_record(p_matter_id uuid)
  SECURITY INVOKER;

-- increment_usage has two overloads
ALTER FUNCTION public.increment_usage(p_user_id uuid, p_resource_type text, p_amount integer, p_tokens integer, p_cost_cents integer)
  SECURITY INVOKER;

ALTER FUNCTION public.increment_usage(p_user_id uuid, p_usage_type text, p_amount integer)
  SECURITY INVOKER;

ALTER FUNCTION public.log_openai_usage(p_user_id uuid, p_session_id text, p_model_name text, p_prompt_tokens integer, p_completion_tokens integer, p_request_type text, p_jurisdiction text, p_category text, p_response_time_ms integer, p_success boolean, p_error_message text)
  SECURITY INVOKER;

ALTER FUNCTION public.perform_conflict_check(p_tenant_id uuid, p_search_type text, p_search_query text)
  SECURITY INVOKER;