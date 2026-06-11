/*
  # Create Asset Readiness Audit Log

  Tracks every status change made to asset governance dimensions
  (english, spanish, legal, brand) so admins can see a full history
  of who changed what and when.

  1. New Tables
    - `asset_readiness_audit_log`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, FK to partner_assets) - which asset was changed
      - `dimension` (text) - which governance dimension: english, spanish, legal, brand
      - `old_status` (text) - previous status value
      - `new_status` (text) - new status value
      - `changed_by` (uuid, FK to auth.users) - admin who made the change
      - `note` (text) - optional note explaining the change
      - `created_at` (timestamptz) - when the change was made

  2. Security
    - Enable RLS on `asset_readiness_audit_log`
    - Admins can insert new audit entries (they are the ones making changes)
    - Admins can read all audit entries
    - Authenticated users can read audit entries for active assets

  3. Indexes
    - asset_id + created_at for efficient per-asset history queries
    - changed_by for admin activity lookups
*/

CREATE TABLE IF NOT EXISTS asset_readiness_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES partner_assets(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dimension CHECK (dimension IN ('english', 'spanish', 'legal', 'brand')),
  CONSTRAINT valid_old_status CHECK (old_status IN ('complete', 'in_review', 'draft', 'not_applicable')),
  CONSTRAINT valid_new_status CHECK (new_status IN ('complete', 'in_review', 'draft', 'not_applicable'))
);

ALTER TABLE asset_readiness_audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_readiness_audit_asset_created
  ON asset_readiness_audit_log (asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_readiness_audit_changed_by
  ON asset_readiness_audit_log (changed_by);

CREATE POLICY "Admins can insert readiness audit entries"
  ON asset_readiness_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = changed_by
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can read all readiness audit entries"
  ON asset_readiness_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can read audit for active assets"
  ON asset_readiness_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_assets
      WHERE partner_assets.id = asset_readiness_audit_log.asset_id
      AND partner_assets.is_active = true
    )
  );
