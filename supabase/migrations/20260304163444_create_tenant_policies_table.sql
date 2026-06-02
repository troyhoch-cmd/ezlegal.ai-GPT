/*
  # Create tenant_policies table

  ## Summary
  Creates a table for storing per-tenant policy configuration values.
  Enables runtime control of feature flags, retention periods, CTA limits,
  and other policy parameters without code deploys.

  ## New Tables
  - `tenant_policies`
    - `id` (uuid, primary key)
    - `tenant_id` (text, non-null) — matches TenantContext.tenantId
    - `policy_key` (text, non-null) — e.g. 'max_free_questions', 'enable_outcome_prediction'
    - `policy_value` (jsonb, non-null) — the value (boolean, number, string, array, or object)
    - `description` (text, nullable) — human-readable explanation
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - UNIQUE constraint on (tenant_id, policy_key)

  ## Security
  - RLS enabled
  - Admins can SELECT, INSERT, UPDATE, DELETE all tenant policies
  - Service role has full access (for edge functions reading policy at runtime)
  - No user-level access (policies are internal configuration)

  ## Indexes
  - (tenant_id, policy_key) — unique constraint doubles as lookup index
*/

CREATE TABLE IF NOT EXISTS tenant_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  policy_key text NOT NULL,
  policy_value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, policy_key)
);

ALTER TABLE tenant_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read tenant policies"
  ON tenant_policies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert tenant policies"
  ON tenant_policies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update tenant policies"
  ON tenant_policies FOR UPDATE
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

CREATE POLICY "Admins can delete tenant policies"
  ON tenant_policies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_tenant_policies_tenant_key
  ON tenant_policies (tenant_id, policy_key);
