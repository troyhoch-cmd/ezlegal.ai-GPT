/*
  # Consent Records (GDPR Art. 7 / CCPA §1798.100)

  Captures lawful-basis evidence for privacy notice acknowledgement and
  AI-processing consent, separately from identity so anonymous visitors
  can also be logged.

  1. New Tables
    - `consent_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users)
      - `consent_type` (text NOT NULL — 'privacy_notice' | 'ai_processing' | 'marketing')
      - `consent_version` (text NOT NULL — e.g. '2026-05-03')
      - `granted` (boolean NOT NULL default true)
      - `source` (text — 'home_primary_cta' | 'signup' | 'chat_start' | ...)
      - `language` (text default 'en')
      - `user_agent` (text)
      - `created_at` (timestamptz default now())

  2. Security
    - RLS enabled
    - Anonymous INSERT allowed (consent capture for pre-auth visitors)
    - Owners can SELECT their own records
    - Admins can read all for compliance audits
    - No UPDATE, no DELETE — audit integrity
*/

CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_type text NOT NULL,
  consent_version text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'unspecified',
  language text NOT NULL DEFAULT 'en',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consent_records_user_id_idx ON consent_records (user_id);
CREATE INDEX IF NOT EXISTS consent_records_type_idx ON consent_records (consent_type);
CREATE INDEX IF NOT EXISTS consent_records_created_at_idx ON consent_records (created_at DESC);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous and authenticated can record consent"
  ON consent_records
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = (SELECT auth.uid())
  );

CREATE POLICY "Users can view their own consent records"
  ON consent_records
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all consent records for audit"
  ON consent_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );
