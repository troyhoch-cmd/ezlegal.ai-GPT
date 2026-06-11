/*
  # Optimize RLS Policies - Auth Function Initialization

  ## Purpose
  Optimize RLS policies by wrapping auth.uid() and auth.jwt() in (select ...) to prevent
  re-evaluation for each row. This significantly improves query performance at scale.

  ## Tables Affected
  1. activity_log - 4 policies (select, insert, update, delete)
  2. engagement_analytics - 2 policies (select, insert)
  3. email_captures - 1 policy (select) - uses auth.jwt()
  4. engagement_events - 1 policy (select)
  5. referral_codes - 2 policies (select, insert)

  ## Security
  No changes to security - same access rules, just optimized execution
*/

-- ============================================
-- activity_log policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activity_log;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activity_log;

CREATE POLICY "Users can view own activities"
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own activities"
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own activities"
  ON public.activity_log
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own activities"
  ON public.activity_log
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- engagement_analytics policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own engagement data" ON public.engagement_analytics;
DROP POLICY IF EXISTS "Users can insert own engagement data" ON public.engagement_analytics;

CREATE POLICY "Users can view own engagement data"
  ON public.engagement_analytics
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own engagement data"
  ON public.engagement_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================
-- email_captures policies (uses auth.jwt() for email matching)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;

CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- ============================================
-- engagement_events policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own engagement events" ON public.engagement_events;

CREATE POLICY "Users can view own engagement events"
  ON public.engagement_events
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- referral_codes policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can create referral codes" ON public.referral_codes;

CREATE POLICY "Users can view own referral codes"
  ON public.referral_codes
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = referrer_id OR (select auth.uid()) = referred_user_id);

CREATE POLICY "Users can create referral codes"
  ON public.referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = referrer_id);
