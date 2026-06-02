/*
  # Tighten Always-True RLS Policies

  Replaces overly permissive (WITH CHECK true) policies with proper
  ownership checks where the table schema supports it.

  1. Policies tightened
    - user_preferences: INSERT now requires user_id = auth.uid() for authenticated
    - user_preferences: UPDATE now requires user_id = auth.uid() for authenticated
    - match_feedback: INSERT now requires submitted_by = auth.uid()
    - lso_audit_logs: INSERT restricted to admin users
    - matching_notifications: INSERT restricted to admin users
    - case_outcome_predictions: INSERT restricted to admin users
    - trust_safety_reports: INSERT now requires user_id = auth.uid() for authenticated users

  2. Policies intentionally left permissive (public-facing forms)
    - contact_submissions, email_captures, eligibility_screenings,
      access_requests, attorney_perspectives, perspective_submissions,
      anonymized_searches: These accept anonymous form submissions by design.
    - free_chat_sessions, free_chat_messages, chat_contexts,
      crisis_incidents, engagement_events: These serve anonymous
      chat and safety features that must work without authentication.

  3. Security
    - Authenticated users can now only write their own data
    - System-level inserts (audit logs, notifications, predictions) restricted to admins
*/

-- user_preferences: tighten INSERT for authenticated users
DROP POLICY IF EXISTS "Anyone can create preferences" ON public.user_preferences;
CREATE POLICY "Authenticated users can create own preferences"
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Anonymous users can create preferences"
  ON public.user_preferences
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- user_preferences: tighten UPDATE
DROP POLICY IF EXISTS "Visitors can update own preferences" ON public.user_preferences;
CREATE POLICY "Authenticated users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Anonymous users can update preferences"
  ON public.user_preferences
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- match_feedback: tighten INSERT to require ownership
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.match_feedback;
CREATE POLICY "Authenticated users can submit own feedback"
  ON public.match_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = (select auth.uid()));

-- lso_audit_logs: restrict INSERT to admin role
DROP POLICY IF EXISTS "System can insert audit logs" ON public.lso_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.lso_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- matching_notifications: restrict INSERT to admin role
DROP POLICY IF EXISTS "System can insert notifications" ON public.matching_notifications;
CREATE POLICY "Admins can insert matching notifications"
  ON public.matching_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- case_outcome_predictions: restrict INSERT to admin role
DROP POLICY IF EXISTS "System can insert predictions" ON public.case_outcome_predictions;
CREATE POLICY "Admins can insert predictions"
  ON public.case_outcome_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- trust_safety_reports: split into auth (ownership check) and anon (open)
DROP POLICY IF EXISTS "Anyone can submit trust safety reports" ON public.trust_safety_reports;
CREATE POLICY "Authenticated users can submit own safety reports"
  ON public.trust_safety_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = (select auth.uid()));

CREATE POLICY "Anonymous users can submit safety reports"
  ON public.trust_safety_reports
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
