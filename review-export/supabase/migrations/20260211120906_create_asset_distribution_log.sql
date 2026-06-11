/*
  # Create Asset Distribution Log

  1. New Tables
    - `asset_distributions`
      - `id` (uuid, primary key)
      - `asset_id` (uuid, references partner_assets)
      - `kit_generation_id` (uuid, references partner_kit_generations, nullable)
      - `sent_by` (uuid, references auth.users)
      - `recipients` (jsonb) - array of {email, name?}
      - `channel` (text) - email, whatsapp, print, link
      - `subject` (text, nullable)
      - `notes` (text, default '')
      - `partner_id` (text, nullable) - partner reference for attribution
      - `status` (text, default 'sent') - sent, delivered, failed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `asset_distributions`
    - Admins can read all distributions
    - Authenticated users can insert their own distributions
    - Authenticated users can read their own distributions

  3. Indexes
    - Index on asset_id for lookup
    - Index on sent_by for user queries
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS asset_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  kit_generation_id uuid,
  sent_by uuid NOT NULL,
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  channel text NOT NULL DEFAULT 'email',
  subject text,
  notes text DEFAULT '',
  partner_id text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE asset_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own distributions"
  ON asset_distributions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sent_by);

CREATE POLICY "Users can read own distributions"
  ON asset_distributions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sent_by);

CREATE INDEX IF NOT EXISTS idx_asset_distributions_asset_id
  ON asset_distributions (asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_distributions_sent_by
  ON asset_distributions (sent_by);

CREATE INDEX IF NOT EXISTS idx_asset_distributions_created_at
  ON asset_distributions (created_at DESC);
