/*
  # Fix RLS Auth Initialization Plan

  Replaces direct `auth.uid()` / `auth.jwt()` calls with `(select auth.uid())`
  or `(select auth.jwt())` in RLS policies so the auth function is evaluated
  once per statement instead of once per row, improving performance at scale.

  1. Policies updated
    - prediction_consent_log: "Users can insert own consent records"
    - prediction_consent_log: "Users can view own consent records"
    - email_captures: "Authenticated users can view own captures"
    - scraper_sources: "Authenticated users can view scraper sources"
    - legal_content: "Authenticated users can view legal content"
    - scraper_run_logs: "Admins can view scraper run logs"

  2. Security
    - No access changes; same logic, better performance
*/

-- prediction_consent_log: Users can insert own consent records
DROP POLICY IF EXISTS "Users can insert own consent records" ON public.prediction_consent_log;
CREATE POLICY "Users can insert own consent records"
  ON public.prediction_consent_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- prediction_consent_log: Users can view own consent records
DROP POLICY IF EXISTS "Users can view own consent records" ON public.prediction_consent_log;
CREATE POLICY "Users can view own consent records"
  ON public.prediction_consent_log
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- email_captures: Authenticated users can view own captures
DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = (select (auth.jwt() ->> 'email')));

-- scraper_sources: Authenticated users can view scraper sources
DROP POLICY IF EXISTS "Authenticated users can view scraper sources" ON public.scraper_sources;
CREATE POLICY "Authenticated users can view scraper sources"
  ON public.scraper_sources
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- legal_content: Authenticated users can view legal content
DROP POLICY IF EXISTS "Authenticated users can view legal content" ON public.legal_content;
CREATE POLICY "Authenticated users can view legal content"
  ON public.legal_content
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- scraper_run_logs: Admins can view scraper run logs
DROP POLICY IF EXISTS "Admins can view scraper run logs" ON public.scraper_run_logs;
CREATE POLICY "Admins can view scraper run logs"
  ON public.scraper_run_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );
