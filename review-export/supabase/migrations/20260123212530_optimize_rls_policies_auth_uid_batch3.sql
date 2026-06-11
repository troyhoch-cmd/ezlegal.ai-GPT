/*
  # Optimize RLS Policies - Batch 3 (AI & Usage Tables)

  This migration optimizes RLS policies for AI provenance, consent, and usage tables.

  ## Tables Updated:
  1. ai_response_provenance - All policies
  2. ai_response_citations - All policies
  3. ai_consent_records - All policies
  4. ai_disclosure_acknowledgments - All policies
  5. daily_usage_tracking - View policy
  6. monthly_usage_tracking - View policy
  7. usage_alerts - All policies
  8. arizona_scrape_logs - Admin policy
  9. arizona_legal_sources - Admin policy
*/

-- ai_response_provenance: Admins can view all AI provenance for compliance
DROP POLICY IF EXISTS "Admins can view all AI provenance for compliance" ON public.ai_response_provenance;
CREATE POLICY "Admins can view all AI provenance for compliance" ON public.ai_response_provenance
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- ai_response_provenance: Users can create own AI provenance
DROP POLICY IF EXISTS "Users can create own AI provenance" ON public.ai_response_provenance;
CREATE POLICY "Users can create own AI provenance" ON public.ai_response_provenance
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_response_provenance: Users can view own AI provenance
DROP POLICY IF EXISTS "Users can view own AI provenance" ON public.ai_response_provenance;
CREATE POLICY "Users can view own AI provenance" ON public.ai_response_provenance
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ai_response_citations: Admins can view all citations for compliance
DROP POLICY IF EXISTS "Admins can view all citations for compliance" ON public.ai_response_citations;
CREATE POLICY "Admins can view all citations for compliance" ON public.ai_response_citations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- ai_response_citations: Users can create citations for own provenance
DROP POLICY IF EXISTS "Users can create citations for own provenance" ON public.ai_response_citations;
CREATE POLICY "Users can create citations for own provenance" ON public.ai_response_citations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_response_provenance
      WHERE ai_response_provenance.id = ai_response_citations.provenance_id
      AND ai_response_provenance.user_id = (select auth.uid())
    )
  );

-- ai_response_citations: Users can view citations for own provenance
DROP POLICY IF EXISTS "Users can view citations for own provenance" ON public.ai_response_citations;
CREATE POLICY "Users can view citations for own provenance" ON public.ai_response_citations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_response_provenance
      WHERE ai_response_provenance.id = ai_response_citations.provenance_id
      AND ai_response_provenance.user_id = (select auth.uid())
    )
  );

-- ai_consent_records: Users can create own consent records
DROP POLICY IF EXISTS "Users can create own consent records" ON public.ai_consent_records;
CREATE POLICY "Users can create own consent records" ON public.ai_consent_records
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_consent_records: Users can update own consent records
DROP POLICY IF EXISTS "Users can update own consent records" ON public.ai_consent_records;
CREATE POLICY "Users can update own consent records" ON public.ai_consent_records
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ai_consent_records: Users can view own consent records
DROP POLICY IF EXISTS "Users can view own consent records" ON public.ai_consent_records;
CREATE POLICY "Users can view own consent records" ON public.ai_consent_records
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- ai_disclosure_acknowledgments: Users can create own acknowledgments
DROP POLICY IF EXISTS "Users can create own acknowledgments" ON public.ai_disclosure_acknowledgments;
CREATE POLICY "Users can create own acknowledgments" ON public.ai_disclosure_acknowledgments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ai_disclosure_acknowledgments: Users can view own acknowledgments
DROP POLICY IF EXISTS "Users can view own acknowledgments" ON public.ai_disclosure_acknowledgments;
CREATE POLICY "Users can view own acknowledgments" ON public.ai_disclosure_acknowledgments
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- daily_usage_tracking: Users can view own daily usage
DROP POLICY IF EXISTS "Users can view own daily usage" ON public.daily_usage_tracking;
CREATE POLICY "Users can view own daily usage" ON public.daily_usage_tracking
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- monthly_usage_tracking: Users can view own monthly usage
DROP POLICY IF EXISTS "Users can view own monthly usage" ON public.monthly_usage_tracking;
CREATE POLICY "Users can view own monthly usage" ON public.monthly_usage_tracking
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- usage_alerts: Users can acknowledge own alerts
DROP POLICY IF EXISTS "Users can acknowledge own alerts" ON public.usage_alerts;
CREATE POLICY "Users can acknowledge own alerts" ON public.usage_alerts
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- usage_alerts: Users can view own alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON public.usage_alerts;
CREATE POLICY "Users can view own alerts" ON public.usage_alerts
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- arizona_scrape_logs: Admins can view scrape logs
DROP POLICY IF EXISTS "Admins can view scrape logs" ON public.arizona_scrape_logs;
CREATE POLICY "Admins can view scrape logs" ON public.arizona_scrape_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- arizona_legal_sources: Admins can manage Arizona legal sources
DROP POLICY IF EXISTS "Admins can manage Arizona legal sources" ON public.arizona_legal_sources;
CREATE POLICY "Admins can manage Arizona legal sources" ON public.arizona_legal_sources
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );
