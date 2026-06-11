/*
  # Client-side error logging

  1. Purpose
    - Capture JS errors, unhandled promise rejections, network failures, and API errors
      from the browser so operators can diagnose issues users actually hit.

  2. New tables
    - client_error_logs
      - id (uuid, pk)
      - user_id (uuid, nullable — FK to auth.users, null for anonymous visitors)
      - session_key (text, nullable — client-generated key to group errors in a session)
      - severity (text: 'info' | 'warning' | 'error' | 'fatal')
      - category (text: 'network' | 'api' | 'validation' | 'render' | 'unknown')
      - code (text, nullable — HTTP status, error code, etc.)
      - message (text)
      - stack (text, nullable)
      - url (text, nullable)
      - user_agent (text, nullable)
      - context (jsonb, default {})
      - created_at (timestamptz, default now())

  3. Security
    - RLS enabled.
    - Anyone (anonymous + authenticated) may INSERT their own error rows. We pin user_id via auth.uid() so clients cannot spoof another user.
    - Only admins (profiles.is_admin = true) may SELECT/UPDATE/DELETE.

  4. Indexes
    - Created on (created_at desc), (user_id), (severity, created_at desc) for triage queries.
*/

CREATE TABLE IF NOT EXISTS client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_key text,
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'fatal')),
  category text NOT NULL DEFAULT 'unknown' CHECK (category IN ('network', 'api', 'validation', 'render', 'unknown')),
  code text,
  message text NOT NULL DEFAULT '',
  stack text,
  url text,
  user_agent text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_error_logs_created_at ON client_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_user_id ON client_error_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_client_error_logs_severity ON client_error_logs (severity, created_at DESC);

ALTER TABLE client_error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log their own errors" ON client_error_logs;
CREATE POLICY "Anyone can log their own errors"
  ON client_error_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins read all error logs" ON client_error_logs;
CREATE POLICY "Admins read all error logs"
  ON client_error_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins delete error logs" ON client_error_logs;
CREATE POLICY "Admins delete error logs"
  ON client_error_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true
    )
  );
