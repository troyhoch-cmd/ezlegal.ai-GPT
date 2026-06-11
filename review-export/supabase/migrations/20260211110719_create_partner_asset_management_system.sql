/*
  # Create Partner Asset Management System

  1. New Tables
    - `partner_assets`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - human-readable identifier
      - `name` (text) - display name
      - `asset_type` (text) - pdf, html, docx, pptx, zip
      - `file_size` (text) - display size string
      - `description` (text) - short description
      - `audience` (text) - target audience
      - `content_sections` (jsonb) - structured content blocks
      - `jurisdictions` (text[]) - applicable jurisdictions
      - `owner_team` (text) - responsible team
      - `pipeline_stages` (text[]) - relevant pipeline stages
      - `pinned` (boolean) - priority flag
      - `recommended` (boolean) - featured flag
      - `is_active` (boolean) - soft delete
      - `created_at`, `updated_at` timestamps

    - `asset_readiness`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, FK to partner_assets)
      - `english_status` (text) - complete, in_review, draft, not_applicable
      - `spanish_status` (text)
      - `legal_review_status` (text)
      - `brand_approval_status` (text)
      - `legal_reviewer_id` (uuid) - who approved legal
      - `legal_reviewed_at` (timestamptz)
      - `brand_approver_id` (uuid) - who approved brand
      - `brand_approved_at` (timestamptz)
      - `version` (integer) - revision counter
      - `blocked_reasons` (text[]) - explicit list of blockers
      - `created_at`, `updated_at` timestamps

    - `asset_downloads`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, FK to partner_assets)
      - `user_id` (uuid) - who downloaded
      - `partner_id` (uuid) - optional partner association
      - `download_type` (text) - preview, full_download, kit_inclusion
      - `created_at` timestamp

    - `partner_kit_generations`
      - `id` (uuid, primary key)
      - `partner_id` (uuid) - optional partner association
      - `generated_by` (uuid) - user who generated
      - `language_filter` (text) - en, es, both
      - `jurisdiction_filter` (text)
      - `stage_filter` (text)
      - `selected_asset_ids` (uuid[]) - which assets included
      - `spanish_only_enforced` (boolean) - strict mode flag
      - `kit_content` (text) - generated output
      - `created_at` timestamp

    - `user_saved_asset_views`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `name` (text) - view name
      - `filters` (jsonb) - stored filter configuration
      - `is_default` (boolean)
      - `created_at`, `updated_at` timestamps

  2. Security
    - RLS enabled on all tables
    - Admins can manage assets and readiness
    - Authenticated users can view active assets
    - Download and kit generation tracked per user
    - Saved views scoped to owning user

  3. Indexes
    - partner_assets: slug, is_active
    - asset_readiness: asset_id
    - asset_downloads: asset_id, user_id, created_at
    - partner_kit_generations: generated_by, partner_id
    - user_saved_asset_views: user_id
*/

-- partner_assets: master data for all distributable collateral
CREATE TABLE IF NOT EXISTS partner_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  asset_type text NOT NULL DEFAULT '',
  file_size text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  content_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  jurisdictions text[] NOT NULL DEFAULT '{}',
  owner_team text NOT NULL DEFAULT '',
  pipeline_stages text[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  recommended boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE partner_assets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_partner_assets_slug ON partner_assets (slug);
CREATE INDEX IF NOT EXISTS idx_partner_assets_active ON partner_assets (is_active) WHERE is_active = true;

-- asset_readiness: tracks approval/translation status per asset with audit trail
CREATE TABLE IF NOT EXISTS asset_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES partner_assets(id) ON DELETE CASCADE,
  english_status text NOT NULL DEFAULT 'draft',
  spanish_status text NOT NULL DEFAULT 'draft',
  legal_review_status text NOT NULL DEFAULT 'draft',
  brand_approval_status text NOT NULL DEFAULT 'draft',
  legal_reviewer_id uuid REFERENCES auth.users(id),
  legal_reviewed_at timestamptz,
  brand_approver_id uuid REFERENCES auth.users(id),
  brand_approved_at timestamptz,
  spanish_reviewer_id uuid REFERENCES auth.users(id),
  spanish_reviewed_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  blocked_reasons text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_asset_readiness UNIQUE (asset_id)
);

ALTER TABLE asset_readiness ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_asset_readiness_asset_id ON asset_readiness (asset_id);

-- asset_downloads: event log for every download action
CREATE TABLE IF NOT EXISTS asset_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES partner_assets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  partner_id uuid,
  download_type text NOT NULL DEFAULT 'full_download',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE asset_downloads ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_asset_downloads_asset_id ON asset_downloads (asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_downloads_user_id ON asset_downloads (user_id);
CREATE INDEX IF NOT EXISTS idx_asset_downloads_created_at ON asset_downloads (created_at);

-- partner_kit_generations: persistent record of every kit build
CREATE TABLE IF NOT EXISTS partner_kit_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid,
  generated_by uuid REFERENCES auth.users(id),
  language_filter text NOT NULL DEFAULT 'both',
  jurisdiction_filter text NOT NULL DEFAULT 'all',
  stage_filter text NOT NULL DEFAULT 'all',
  selected_asset_ids uuid[] NOT NULL DEFAULT '{}',
  spanish_only_enforced boolean NOT NULL DEFAULT false,
  kit_content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE partner_kit_generations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_kit_generations_generated_by ON partner_kit_generations (generated_by);
CREATE INDEX IF NOT EXISTS idx_kit_generations_partner_id ON partner_kit_generations (partner_id);

-- user_saved_asset_views: stored filter configurations per user
CREATE TABLE IF NOT EXISTS user_saved_asset_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_saved_asset_views ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_saved_views_user_id ON user_saved_asset_views (user_id);

-- RLS Policies

-- partner_assets: admins manage, authenticated users read active assets
CREATE POLICY "Admins can manage partner assets"
  ON partner_assets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view active assets"
  ON partner_assets FOR SELECT
  TO authenticated
  USING (is_active = true);

-- asset_readiness: admins manage, authenticated users read
CREATE POLICY "Admins can manage asset readiness"
  ON asset_readiness FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view asset readiness"
  ON asset_readiness FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM partner_assets
      WHERE partner_assets.id = asset_readiness.asset_id
      AND partner_assets.is_active = true
    )
  );

-- asset_downloads: users can insert their own, admins can read all
CREATE POLICY "Users can record own downloads"
  ON asset_downloads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own downloads"
  ON asset_downloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all downloads"
  ON asset_downloads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- partner_kit_generations: users manage own, admins read all
CREATE POLICY "Users can create own kit generations"
  ON partner_kit_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Users can view own kit generations"
  ON partner_kit_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = generated_by);

CREATE POLICY "Admins can view all kit generations"
  ON partner_kit_generations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- user_saved_asset_views: users manage own views only
CREATE POLICY "Users can manage own saved views"
  ON user_saved_asset_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved views"
  ON user_saved_asset_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved views"
  ON user_saved_asset_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved views"
  ON user_saved_asset_views FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
