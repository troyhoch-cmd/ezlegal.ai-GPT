/*
  # GTM Launch QA Audit Log

  1. New Tables
    - `gtm_qa_audit_findings` - Tracks website QA findings for GTM launch
      - `id` (uuid, PK)
      - `category` (text) - e.g. 'internal_linking', 'mobile_responsive', 'seo_meta', 'cta', 'broken_link'
      - `severity` (text) - 'critical', 'high', 'medium', 'low'
      - `file_path` (text)
      - `line_number` (integer, nullable)
      - `finding` (text) - Description of the issue
      - `recommendation` (text) - Suggested fix
      - `status` (text) - 'open', 'in_progress', 'fixed', 'wontfix'
      - `fixed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Only admins can read/write findings
*/

CREATE TABLE IF NOT EXISTS gtm_qa_audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  severity text NOT NULL DEFAULT 'medium',
  file_path text NOT NULL DEFAULT '',
  line_number integer,
  finding text NOT NULL DEFAULT '',
  recommendation text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  fixed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gtm_qa_findings_status ON gtm_qa_audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_gtm_qa_findings_category ON gtm_qa_audit_findings(category);

ALTER TABLE gtm_qa_audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view QA findings"
  ON gtm_qa_audit_findings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert QA findings"
  ON gtm_qa_audit_findings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update QA findings"
  ON gtm_qa_audit_findings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete QA findings"
  ON gtm_qa_audit_findings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );
