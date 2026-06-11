/*
  # Create user_data_requests table

  ## Summary
  Creates a table for tracking CCPA/GDPR data rights requests from users.
  Supports export, deletion, correction, and restriction requests with
  fulfillment tracking for compliance.

  ## New Tables
  - `user_data_requests`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users, ON DELETE CASCADE)
    - `request_type` (text) — 'export', 'deletion', 'correction', 'restriction'
    - `status` (text) — 'pending', 'in_progress', 'completed', 'denied'
    - `requested_at` (timestamptz)
    - `fulfilled_at` (timestamptz, nullable)
    - `fulfilled_by` (uuid, nullable FK to auth.users — admin who processed)
    - `notes` (text, nullable)
    - `metadata` (jsonb) — additional request context

  ## Security
  - RLS enabled
  - Authenticated users can INSERT their own requests
  - Authenticated users can SELECT their own requests
  - Admins can SELECT, INSERT, UPDATE, DELETE all requests (fulfillment workflow)

  ## Indexes
  - (user_id, status) — for per-user request lookups
*/

CREATE TABLE IF NOT EXISTS user_data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  fulfilled_at timestamptz,
  fulfilled_by uuid REFERENCES auth.users(id),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE user_data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own data requests"
  ON user_data_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own data requests"
  ON user_data_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all data requests"
  ON user_data_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update data requests"
  ON user_data_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_data_requests_user_status
  ON user_data_requests (user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_data_requests_status_requested
  ON user_data_requests (status, requested_at DESC);
