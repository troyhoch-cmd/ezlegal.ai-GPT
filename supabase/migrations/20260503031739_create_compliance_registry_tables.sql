/*
  # Compliance registry: vendor agreements & data processing activities

  Supports GDPR Art. 28 (processors), Art. 30 (records of processing), and
  CCPA/CPRA service-provider tracking. Both tables are admin-only; no
  personal data is stored here.

  1. New Tables
    - `vendor_agreements`
      - `id` (uuid, pk)
      - `vendor_name` (text, not null) — e.g. 'Supabase', 'OpenAI'
      - `agreement_type` (text, not null) — 'DPA' | 'MSA' | 'SCC' | 'BAA' | 'SubprocessorAddendum'
      - `status` (text, default 'pending') — 'pending' | 'signed' | 'expired' | 'terminated'
      - `effective_date` (date)
      - `renewal_date` (date)
      - `storage_region` (text) — e.g. 'us-east-1'
      - `data_categories` (text[]) — e.g. ARRAY['account','chat_content','documents']
      - `zero_retention` (boolean, default false)
      - `notes` (text, default '')
      - `reference_url` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `data_processing_activities`
      - `id` (uuid, pk)
      - `activity_name` (text, not null)
      - `purpose` (text, not null)
      - `legal_basis` (text, not null) — 'consent' | 'contract' | 'legitimate_interest' | ...
      - `data_categories` (text[], not null)
      - `data_subjects` (text[], not null) — 'visitors' | 'users' | 'legal_aid_clients'
      - `retention_period` (text, not null) — e.g. '30 days after deletion request'
      - `recipients` (text[]) — vendors/processors
      - `cross_border_transfer` (boolean, default false)
      - `safeguards` (text, default '')
      - `dpia_required` (boolean, default false)
      - `last_reviewed_at` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - RLS enabled on both.
    - Admin-only SELECT/INSERT/UPDATE. No DELETE policy — audit integrity.
*/

CREATE TABLE IF NOT EXISTS vendor_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  agreement_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  effective_date date,
  renewal_date date,
  storage_region text,
  data_categories text[] NOT NULL DEFAULT ARRAY[]::text[],
  zero_retention boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  reference_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendor_agreements_vendor_idx ON vendor_agreements (vendor_name);
CREATE INDEX IF NOT EXISTS vendor_agreements_status_idx ON vendor_agreements (status);

CREATE TABLE IF NOT EXISTS data_processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name text NOT NULL,
  purpose text NOT NULL,
  legal_basis text NOT NULL,
  data_categories text[] NOT NULL DEFAULT ARRAY[]::text[],
  data_subjects text[] NOT NULL DEFAULT ARRAY[]::text[],
  retention_period text NOT NULL DEFAULT '',
  recipients text[] NOT NULL DEFAULT ARRAY[]::text[],
  cross_border_transfer boolean NOT NULL DEFAULT false,
  safeguards text NOT NULL DEFAULT '',
  dpia_required boolean NOT NULL DEFAULT false,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dpa_activities_legal_basis_idx ON data_processing_activities (legal_basis);

ALTER TABLE vendor_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view vendor agreements"
  ON vendor_agreements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert vendor agreements"
  ON vendor_agreements FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'));

CREATE POLICY "Admins can update vendor agreements"
  ON vendor_agreements FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'));

CREATE POLICY "Admins can view DPA activities"
  ON data_processing_activities FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert DPA activities"
  ON data_processing_activities FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'));

CREATE POLICY "Admins can update DPA activities"
  ON data_processing_activities FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'));

-- Seed with current state so the registry starts non-empty.
INSERT INTO vendor_agreements (vendor_name, agreement_type, status, storage_region, data_categories, zero_retention, notes)
VALUES
  ('Supabase', 'DPA', 'pending', 'us-east-1',
   ARRAY['account','chat_content','documents','analytics'],
   false,
   'Primary processor. DPA execution pending — reference https://supabase.com/privacy.'),
  ('OpenAI', 'DPA', 'pending', 'us',
   ARRAY['chat_content'],
   true,
   'Model inference. Zero-retention requested on org API key. Reference https://openai.com/enterprise-privacy.')
ON CONFLICT DO NOTHING;

INSERT INTO data_processing_activities
  (activity_name, purpose, legal_basis, data_categories, data_subjects, retention_period, recipients, cross_border_transfer, safeguards, dpia_required)
VALUES
  ('Account management', 'Create and maintain user accounts', 'contract',
   ARRAY['email','display_name','plan'], ARRAY['users'],
   'Until deletion request, within 30 days', ARRAY['Supabase'], false, 'TLS + at-rest encryption', false),
  ('Legal chat processing', 'Provide legal information responses via LLM', 'consent',
   ARRAY['chat_content','jurisdiction'], ARRAY['visitors','users'],
   '90 days rolling or on request', ARRAY['Supabase','OpenAI'], true, 'SCCs + zero-retention OpenAI flag', true),
  ('Crisis triage', 'Route urgent users to safe resources', 'legitimate_interest',
   ARRAY['category_tag','quick_exit_flag'], ARRAY['visitors'],
   '180 days for routing-safety audits', ARRAY['Supabase'], false, 'No narrative content stored', false),
  ('Consent recording', 'Evidence of lawful basis', 'legal_obligation',
   ARRAY['consent_type','consent_version','user_agent'], ARRAY['visitors','users'],
   '7 years (statutory)', ARRAY['Supabase'], false, 'Immutable rows, no UPDATE/DELETE', false)
ON CONFLICT DO NOTHING;
