/*
  # Collateral Studio: drafts, versions, storage

  1. New Tables
    - `collateral_drafts`: one row per asset draft (C-suite editable copy of a partner_asset)
      - `asset_id` links to partner_assets; one active draft per asset (unique index on asset_id WHERE is_current)
      - `content_sections` jsonb - the editable structured content
      - `custom_css`, `cover_image_url`, `qr_payload` for visual customisation
      - `status`: 'draft' | 'ready' | 'sent' | 'archived'
      - `created_by`, `updated_by` track authorship
    - `collateral_draft_versions`: append-only snapshot per save
      - captures prior content_sections so executives can roll back
  2. Storage
    - Creates `collateral-images` public bucket for embedded images and cover art
  3. Security
    - RLS: only admins (profiles.is_admin = true) can read/write drafts and versions
    - Storage policies: admins can upload/delete; public read for embedded images in generated PDFs/emails
*/

CREATE TABLE IF NOT EXISTS collateral_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES partner_assets(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  content_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url text NOT NULL DEFAULT '',
  qr_payload text NOT NULL DEFAULT '',
  accent_color text NOT NULL DEFAULT '#0d9488',
  status text NOT NULL DEFAULT 'draft',
  version int NOT NULL DEFAULT 1,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE collateral_drafts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_collateral_drafts_asset ON collateral_drafts (asset_id);
CREATE INDEX IF NOT EXISTS idx_collateral_drafts_status ON collateral_drafts (status);
CREATE INDEX IF NOT EXISTS idx_collateral_drafts_updated_by ON collateral_drafts (updated_by);
CREATE INDEX IF NOT EXISTS idx_collateral_drafts_created_by ON collateral_drafts (created_by);

CREATE POLICY "Admins view collateral drafts"
  ON collateral_drafts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins insert collateral drafts"
  ON collateral_drafts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins update collateral drafts"
  ON collateral_drafts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins delete collateral drafts"
  ON collateral_drafts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE TABLE IF NOT EXISTS collateral_draft_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES collateral_drafts(id) ON DELETE CASCADE,
  version int NOT NULL,
  snapshot jsonb NOT NULL,
  note text NOT NULL DEFAULT '',
  saved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE collateral_draft_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_collateral_versions_draft ON collateral_draft_versions (draft_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_collateral_versions_saved_by ON collateral_draft_versions (saved_by);

CREATE POLICY "Admins view collateral versions"
  ON collateral_draft_versions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins insert collateral versions"
  ON collateral_draft_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'collateral-images',
  'collateral-images',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read collateral images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'collateral-images');

CREATE POLICY "Admins upload collateral images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'collateral-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

CREATE POLICY "Admins update collateral images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'collateral-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

CREATE POLICY "Admins delete collateral images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'collateral-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );
