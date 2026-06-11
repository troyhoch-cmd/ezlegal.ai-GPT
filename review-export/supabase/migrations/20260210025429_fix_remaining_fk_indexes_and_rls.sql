/*
  # Fix Remaining FK Indexes and RLS Auth Init Plan

  1. New Indexes
    - prediction_consent_log (user_id) - FK covering index, previously dropped
    - scraper_run_logs (source_id) - FK covering index, previously dropped

  2. RLS Policy Fix
    - email_captures: "Authenticated users can view own captures"
      Rewrites the policy so auth.jwt() is wrapped in its own
      (select auth.jwt()) subquery, ensuring single evaluation per statement

  3. Important notes
    - The prediction_consent_log and scraper_run_logs FK indexes were dropped
      in a previous unused-index cleanup but are required for FK performance
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_prediction_consent_log_user_id
  ON public.prediction_consent_log (user_id);

CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_source_id
  ON public.scraper_run_logs (source_id);

DROP POLICY IF EXISTS "Authenticated users can view own captures" ON public.email_captures;
CREATE POLICY "Authenticated users can view own captures"
  ON public.email_captures
  FOR SELECT
  TO authenticated
  USING (email = ((select auth.jwt()) ->> 'email'));
