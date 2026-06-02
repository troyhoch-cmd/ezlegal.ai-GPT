/*
  # Create Trust & Safety Reports Table

  1. New Tables
    - `trust_safety_reports`
      - `id` (uuid, primary key)
      - `report_type` (text) - Category of concern (ai_output, privacy, harassment, bias, legal_advice, other)
      - `severity` (text) - Urgency level (low, medium, high, critical)
      - `description` (text) - Detailed description of the concern
      - `conversation_id` (uuid, nullable) - Reference to related chat if applicable
      - `evidence_urls` (text[], nullable) - Screenshots or relevant links
      - `reporter_email` (text) - Contact email for follow-up
      - `reporter_name` (text, nullable) - Optional name
      - `user_id` (uuid, nullable) - If logged in user
      - `status` (text) - Report status (submitted, reviewing, resolved, dismissed)
      - `resolution_notes` (text, nullable) - Admin notes on resolution
      - `resolved_at` (timestamptz, nullable)
      - `resolved_by` (uuid, nullable) - Admin who resolved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can create reports
    - Users can view their own reports
    - Admins can view and update all reports

  3. Indexes
    - Index on status for filtering
    - Index on report_type for categorization
    - Index on user_id for user lookups
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS trust_safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL CHECK (report_type IN ('ai_output', 'privacy', 'harassment', 'bias', 'legal_advice', 'security', 'other')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  conversation_id uuid,
  evidence_urls text[] DEFAULT '{}',
  reporter_email text NOT NULL,
  reporter_name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trust_safety_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit trust safety reports"
  ON trust_safety_reports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own reports"
  ON trust_safety_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON trust_safety_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update reports"
  ON trust_safety_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_status ON trust_safety_reports(status);
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_type ON trust_safety_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user ON trust_safety_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_created ON trust_safety_reports(created_at DESC);

CREATE OR REPLACE FUNCTION update_trust_safety_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trust_safety_reports_updated_at ON trust_safety_reports;
CREATE TRIGGER trust_safety_reports_updated_at
  BEFORE UPDATE ON trust_safety_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_safety_reports_updated_at();
