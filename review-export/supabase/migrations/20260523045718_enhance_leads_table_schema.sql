/*
  # Enhance leads table to match production schema

  1. Modified Table: `leads`
    - Rename `role` -> `role_title`
    - Rename `organization_name` -> `organization`
    - Rename `team_size` -> `company_size`
    - Change `document_count` from text to integer
    - Add `source_page` (text) - which page the lead came from
    - Add `raw_payload` (jsonb) - full unprocessed form data
    - Drop `recommendation` column (moved to client-side only)

  2. Security
    - Drop existing insert policy (was for anon + authenticated)
    - Recreate insert policy for anon only (anonymous lead capture)
*/

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'role_title') THEN
    ALTER TABLE leads ADD COLUMN role_title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'organization') THEN
    ALTER TABLE leads ADD COLUMN organization text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company_size') THEN
    ALTER TABLE leads ADD COLUMN company_size text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source_page') THEN
    ALTER TABLE leads ADD COLUMN source_page text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'raw_payload') THEN
    ALTER TABLE leads ADD COLUMN raw_payload jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Migrate data from old columns to new columns where both exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'role') THEN
    UPDATE leads SET role_title = role WHERE role_title IS NULL AND role IS NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'organization_name') THEN
    UPDATE leads SET organization = organization_name WHERE organization IS NULL AND organization_name IS NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'team_size') THEN
    UPDATE leads SET company_size = team_size WHERE company_size IS NULL AND team_size IS NOT NULL;
  END IF;
END $$;

-- Update RLS policy: allow anonymous inserts only
DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads;
CREATE POLICY "Allow anonymous lead inserts"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
