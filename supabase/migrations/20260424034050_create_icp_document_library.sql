/*
  # ICP Document Library (all 50 states)

  1. New Tables
    - `icp_document_categories` - Canonical taxonomy
      - id, slug unique, name, description, sort_order
    - `icp_document_templates` - Scraped + templated forms
      - id, jurisdiction (state code), category_id FK, title, slug,
        description, source_url, source_agency, file_url, file_mime,
        template_body text (extracted/normalized), fields jsonb (field map),
        qr_code_url, version_hash, version int, last_verified_at,
        is_active, language, created_at, updated_at
    - `icp_document_scrape_runs` - Per-run audit trail
      - id, state, category_slug, status, documents_added, documents_updated,
        documents_skipped, error_message, duration_ms, started_at, completed_at

  2. Indexes
    - trigram + btree on title, jurisdiction, category_id for search/filter
    - unique (jurisdiction, slug) to guarantee one canonical template per state

  3. Security
    - RLS enabled on all 3 tables; categories + templates public-readable;
      writes restricted to admins. Run logs admin-only.
*/

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS icp_document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS icp_document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction text NOT NULL,
  category_id uuid REFERENCES icp_document_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  source_agency text DEFAULT '',
  file_url text DEFAULT '',
  file_mime text DEFAULT '',
  template_body text DEFAULT '',
  fields jsonb DEFAULT '[]'::jsonb,
  qr_code_url text DEFAULT '',
  version_hash text DEFAULT '',
  version int DEFAULT 1,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  last_verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (jurisdiction, slug)
);

CREATE INDEX IF NOT EXISTS idx_icp_templates_jurisdiction ON icp_document_templates(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_icp_templates_category ON icp_document_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_icp_templates_title_trgm ON icp_document_templates USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_icp_templates_active ON icp_document_templates(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS icp_document_scrape_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL,
  category_slug text DEFAULT '',
  status text NOT NULL DEFAULT 'started',
  documents_added int DEFAULT 0,
  documents_updated int DEFAULT 0,
  documents_skipped int DEFAULT 0,
  error_message text DEFAULT '',
  duration_ms int DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_icp_runs_state ON icp_document_scrape_runs(state);
CREATE INDEX IF NOT EXISTS idx_icp_runs_started ON icp_document_scrape_runs(started_at DESC);

ALTER TABLE icp_document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE icp_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE icp_document_scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read icp_document_categories"
  ON icp_document_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert icp_document_categories"
  ON icp_document_categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update icp_document_categories"
  ON icp_document_categories FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete icp_document_categories"
  ON icp_document_categories FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Public read icp_document_templates"
  ON icp_document_templates FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins insert icp_document_templates"
  ON icp_document_templates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update icp_document_templates"
  ON icp_document_templates FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete icp_document_templates"
  ON icp_document_templates FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins read icp_document_scrape_runs"
  ON icp_document_scrape_runs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins insert icp_document_scrape_runs"
  ON icp_document_scrape_runs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins update icp_document_scrape_runs"
  ON icp_document_scrape_runs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));
CREATE POLICY "Admins delete icp_document_scrape_runs"
  ON icp_document_scrape_runs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.is_admin = true));

INSERT INTO icp_document_categories (slug, name, description, sort_order) VALUES
  ('business-registration', 'Business Registration', 'LLC/DBA/Sole-proprietor formation and annual renewal forms', 10),
  ('tax-compliance',        'Tax Compliance',        'Federal and state tax registration, 1099-NEC, quarterly filings', 20),
  ('professional-licensing','Professional Licensing','State-issued occupational licenses and renewals', 30),
  ('worker-classification', 'Worker Classification', 'W-9, independent-contractor agreements, ABC-test checklists', 40),
  ('insurance-requirements','Insurance Requirements','Liability, workers comp waivers, bond filings', 50),
  ('contract-templates',    'Contract Templates',    'Master service agreements, SOWs, NDAs, scope addendums', 60)
ON CONFLICT (slug) DO NOTHING;
