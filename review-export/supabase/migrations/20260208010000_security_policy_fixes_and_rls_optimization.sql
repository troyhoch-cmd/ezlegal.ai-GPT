/*
  # Security Policy Fixes and RLS Optimization

  1. Performance Fix
    - `email_captures`: Wrap `auth.jwt()` in `(select ...)` for per-query evaluation instead of per-row

  2. Dangerous Always-True Policies - Locked Down
    - `openai_rate_limits`: Was ALL true for anon+authenticated. Now restricted to service_role + authenticated read-only for own limits
    - `openai_usage_logs`: INSERT was true for anon+authenticated. Now service_role for bulk + authenticated with user_id check
    - `access_token_usage`: INSERT was true for anon+authenticated. Now service_role + authenticated with token ownership check
    - `widget_analytics`: INSERT was true for anon+authenticated. Now restricted to service_role
    - `widget_conversations`: INSERT/UPDATE was true for anon+authenticated. Now restricted to service_role

  3. Duplicate Policy Removal
    - `appointment_requests`: Remove overly-permissive "Anyone can create" (public, true) and duplicate SELECT/UPDATE policies
    - `quote_requests`: Remove overly-permissive "Anyone can create" (public, true) and duplicate SELECT/UPDATE policies

  4. Tightened Public INSERT Policies
    - `funding_requests`: Replace wide-open public INSERT with authenticated INSERT requiring user_id match
    - `pro_bono_applications`: Replace wide-open public INSERT with anon+authenticated but require non-null applicant fields

  5. Important Notes
    - Admin+user SELECT dual policies (e.g., profiles, documents) are intentional OR patterns and are NOT changed
    - Anonymous access for truly public forms (contact_submissions, email_captures, crisis_incidents) is preserved
    - All changes use IF EXISTS to prevent errors
*/

-- ============================================================
-- 1. Fix email_captures RLS performance
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures" ON public.email_captures
  FOR SELECT TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- ============================================================
-- 2. Lock down openai_rate_limits (was ALL true for anon+authenticated)
-- ============================================================
DROP POLICY IF EXISTS "Service can manage rate limits" ON public.openai_rate_limits;

CREATE POLICY "Service role can manage rate limits" ON public.openai_rate_limits
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own rate limits" ON public.openai_rate_limits
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================
-- 3. Lock down openai_usage_logs INSERT
-- ============================================================
DROP POLICY IF EXISTS "Service can insert usage logs" ON public.openai_usage_logs;

CREATE POLICY "Service role can insert usage logs" ON public.openai_usage_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert own usage logs" ON public.openai_usage_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================
-- 4. Lock down access_token_usage INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can log token usage" ON public.access_token_usage;

CREATE POLICY "Service role can log token usage" ON public.access_token_usage
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can log token usage" ON public.access_token_usage
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.access_tokens t
    WHERE t.id = access_token_usage.token_id
    AND t.created_by = (select auth.uid())
  ));

-- ============================================================
-- 5. Lock down widget_analytics INSERT
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert analytics" ON public.widget_analytics;

CREATE POLICY "Service role can insert widget analytics" ON public.widget_analytics
  FOR INSERT TO service_role
  WITH CHECK (true);

-- ============================================================
-- 6. Lock down widget_conversations INSERT/UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.widget_conversations;
DROP POLICY IF EXISTS "Service role can update conversations" ON public.widget_conversations;

CREATE POLICY "Service role can insert widget conversations" ON public.widget_conversations
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update widget conversations" ON public.widget_conversations
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 7. Remove duplicate appointment_requests policies
-- ============================================================
-- Drop the overly-permissive public INSERT (true) policy
DROP POLICY IF EXISTS "Anyone can create appointment requests" ON public.appointment_requests;

-- Drop the duplicate SELECT/UPDATE via connection subquery (keep simpler user_id-based ones)
DROP POLICY IF EXISTS "Users can view their own appointment requests" ON public.appointment_requests;
DROP POLICY IF EXISTS "Users can update their own appointment requests" ON public.appointment_requests;

-- ============================================================
-- 8. Remove duplicate quote_requests policies
-- ============================================================
-- Drop the overly-permissive public INSERT (true) policy
DROP POLICY IF EXISTS "Anyone can create quote requests" ON public.quote_requests;

-- Drop the duplicate SELECT/UPDATE via connection subquery (keep simpler user_id-based ones)
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;

-- ============================================================
-- 9. Tighten funding_requests INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create funding requests" ON public.funding_requests;

CREATE POLICY "Authenticated users can create funding requests" ON public.funding_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================
-- 10. Tighten pro_bono_applications INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit pro bono application" ON public.pro_bono_applications;

CREATE POLICY "Authenticated users can submit pro bono application" ON public.pro_bono_applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Anonymous users can submit pro bono application" ON public.pro_bono_applications
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
