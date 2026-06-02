/*
  # Optimize RLS Policies with (select auth.uid()) Pattern

  This migration fixes RLS policies that re-evaluate auth.uid() for each row,
  causing suboptimal query performance. The fix wraps auth.uid() in a SELECT
  subquery so it's evaluated once per query instead of per row.

  ## Affected Tables:
  - email_captures (uses auth.jwt())
  - negotiations (4 policies)
  - negotiation_batna_analysis
  - negotiation_zopa
  - negotiation_rounds
  - negotiation_planner_purchases (2 policies)
  - negotiation_plans_generated (2 policies)
  - access_requests (3 policies)
  - access_tokens (5 policies)
  - access_token_usage (2 policies)
*/

-- ============================================
-- email_captures (uses auth.jwt() not auth.uid())
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = (select auth.jwt() ->> 'email'));

-- ============================================
-- negotiations
-- ============================================
DROP POLICY IF EXISTS "Users can create own negotiations" ON public.negotiations;
CREATE POLICY "Users can create own negotiations"
  ON public.negotiations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own negotiations" ON public.negotiations;
CREATE POLICY "Users can view own negotiations"
  ON public.negotiations
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own negotiations" ON public.negotiations;
CREATE POLICY "Users can update own negotiations"
  ON public.negotiations
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own negotiations" ON public.negotiations;
CREATE POLICY "Users can delete own negotiations"
  ON public.negotiations
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- negotiation_batna_analysis
-- ============================================
DROP POLICY IF EXISTS "Users can manage own BATNA analysis" ON public.negotiation_batna_analysis;
CREATE POLICY "Users can manage own BATNA analysis"
  ON public.negotiation_batna_analysis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  );

-- ============================================
-- negotiation_zopa
-- ============================================
DROP POLICY IF EXISTS "Users can manage own ZOPA" ON public.negotiation_zopa;
CREATE POLICY "Users can manage own ZOPA"
  ON public.negotiation_zopa
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  );

-- ============================================
-- negotiation_rounds
-- ============================================
DROP POLICY IF EXISTS "Users can manage own rounds" ON public.negotiation_rounds;
CREATE POLICY "Users can manage own rounds"
  ON public.negotiation_rounds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negotiations n 
      WHERE n.id = negotiation_id 
      AND n.user_id = (select auth.uid())
    )
  );

-- ============================================
-- negotiation_planner_purchases
-- ============================================
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.negotiation_planner_purchases;
CREATE POLICY "Users can insert own purchases"
  ON public.negotiation_planner_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own purchases" ON public.negotiation_planner_purchases;
CREATE POLICY "Users can view own purchases"
  ON public.negotiation_planner_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- negotiation_plans_generated
-- ============================================
DROP POLICY IF EXISTS "Users can insert own plans" ON public.negotiation_plans_generated;
CREATE POLICY "Users can insert own plans"
  ON public.negotiation_plans_generated
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own plans" ON public.negotiation_plans_generated;
CREATE POLICY "Users can view own plans"
  ON public.negotiation_plans_generated
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- access_requests
-- ============================================
DROP POLICY IF EXISTS "Admins can view all access requests" ON public.access_requests;
CREATE POLICY "Admins can view all access requests"
  ON public.access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update access requests" ON public.access_requests;
CREATE POLICY "Admins can update access requests"
  ON public.access_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Inviters can view their access requests" ON public.access_requests;
CREATE POLICY "Inviters can view their access requests"
  ON public.access_requests
  FOR SELECT
  TO authenticated
  USING (invited_by = (select auth.uid()));

-- ============================================
-- access_tokens
-- ============================================
DROP POLICY IF EXISTS "Users can view own tokens" ON public.access_tokens;
CREATE POLICY "Users can view own tokens"
  ON public.access_tokens
  FOR SELECT
  TO authenticated
  USING (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create tokens" ON public.access_tokens;
CREATE POLICY "Users can create tokens"
  ON public.access_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own tokens" ON public.access_tokens;
CREATE POLICY "Users can update own tokens"
  ON public.access_tokens
  FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own tokens" ON public.access_tokens;
CREATE POLICY "Users can delete own tokens"
  ON public.access_tokens
  FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all tokens" ON public.access_tokens;
CREATE POLICY "Admins can view all tokens"
  ON public.access_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );

-- ============================================
-- access_token_usage
-- ============================================
DROP POLICY IF EXISTS "Token creators can view usage" ON public.access_token_usage;
CREATE POLICY "Token creators can view usage"
  ON public.access_token_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.access_tokens t 
      WHERE t.id = token_id 
      AND t.created_by = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all token usage" ON public.access_token_usage;
CREATE POLICY "Admins can view all token usage"
  ON public.access_token_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = (select auth.uid()) 
      AND p.role = 'admin'
    )
  );