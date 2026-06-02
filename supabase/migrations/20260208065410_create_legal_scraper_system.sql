/*
  # Create Legal Scraper System

  1. New Tables
    - `scraper_sources` - Registry of all legal data sources with scraping metadata
      - `id` (uuid, primary key)
      - `source_key` (text, unique) - Machine identifier e.g. 'us_code', 'az_ars', 'ca_codes'
      - `source_name` (text) - Human readable name
      - `source_type` (text) - 'federal_statute', 'state_statute', 'regulation', 'case_law', 'agency_guidance', 'legal_aid', 'attorney_reviewed'
      - `jurisdiction` (text) - 'federal', state code, or 'national'
      - `base_url` (text) - Root URL for scraping
      - `update_frequency` (text) - 'daily', 'weekly', 'monthly', 'quarterly'
      - `last_scraped_at` (timestamptz) - When scraper last ran
      - `last_successful_at` (timestamptz) - When scraper last succeeded
      - `sections_count` (integer) - Total sections scraped
      - `sections_with_embeddings` (integer) - Sections with vector embeddings
      - `is_active` (boolean) - Whether this source is enabled for scraping
      - `scraper_config` (jsonb) - Source-specific scraper configuration
      - `created_at`, `updated_at` (timestamptz)

    - `legal_content` - Generalized legal content from all sources
      - `id` (uuid, primary key)
      - `source_id` (uuid) - FK to scraper_sources
      - `source_key` (text) - Denormalized for faster queries
      - `jurisdiction` (text) - State code or 'federal'
      - `content_type` (text) - 'statute', 'regulation', 'rule', 'guidance', 'article'
      - `title_number` (text) - Title/chapter number
      - `title_name` (text) - Title/chapter name
      - `section_number` (text) - Full section citation
      - `section_title` (text) - Section heading
      - `content` (text) - Full text
      - `summary` (text) - AI-generated summary
      - `url` (text) - Canonical source URL
      - `effective_date` (date)
      - `last_amended` (date)
      - `embedding` (vector(1536)) - OpenAI embedding
      - `practice_areas` (text[]) - Mapped practice areas
      - `keywords` (text[]) - Extracted keywords
      - `related_sections` (text[]) - Cross-references
      - `is_active` (boolean) - Currently in force
      - `version_hash` (text) - Content hash for change detection
      - `scraped_at` (timestamptz) - When this content was scraped
      - `created_at`, `updated_at` (timestamptz)
      - Unique constraint on (source_key, section_number)

    - `scraper_run_logs` - Audit log for every scraper execution
      - `id` (uuid, primary key)
      - `source_id` (uuid) - FK to scraper_sources
      - `source_key` (text)
      - `action` (text) - 'scrape', 'embed', 'validate', 'cleanup'
      - `status` (text) - 'started', 'in_progress', 'completed', 'failed', 'partial'
      - `sections_processed` (integer)
      - `sections_added` (integer)
      - `sections_updated` (integer)
      - `sections_embedded` (integer)
      - `error_message` (text)
      - `duration_ms` (integer)
      - `metadata` (jsonb) - Additional run details
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - scraper_sources: authenticated users can read; service_role can write
    - legal_content: authenticated users can read; service_role can write
    - scraper_run_logs: admin users can read; service_role can write

  3. Functions
    - `match_legal_content()` - Semantic vector search across all legal content
    - `get_source_freshness()` - Returns update status for all active sources

  4. Indexes
    - HNSW vector index on legal_content.embedding
    - B-tree indexes on frequently queried columns
    - GIN indexes on array columns
*/

-- scraper_sources registry
CREATE TABLE IF NOT EXISTS scraper_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text UNIQUE NOT NULL,
  source_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'federal_statute', 'state_statute', 'regulation',
    'case_law', 'agency_guidance', 'legal_aid', 'attorney_reviewed'
  )),
  jurisdiction text NOT NULL DEFAULT 'federal',
  base_url text NOT NULL DEFAULT '',
  update_frequency text NOT NULL DEFAULT 'monthly' CHECK (update_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly'
  )),
  last_scraped_at timestamptz,
  last_successful_at timestamptz,
  sections_count integer NOT NULL DEFAULT 0,
  sections_with_embeddings integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  scraper_config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scraper_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view scraper sources"
  ON scraper_sources FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert scraper sources"
  ON scraper_sources FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scraper sources"
  ON scraper_sources FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- legal_content table
CREATE TABLE IF NOT EXISTS legal_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES scraper_sources(id),
  source_key text NOT NULL,
  jurisdiction text NOT NULL DEFAULT 'federal',
  content_type text NOT NULL DEFAULT 'statute' CHECK (content_type IN (
    'statute', 'regulation', 'rule', 'guidance', 'article'
  )),
  title_number text,
  title_name text,
  section_number text NOT NULL,
  section_title text,
  content text NOT NULL DEFAULT '',
  summary text,
  url text,
  effective_date date,
  last_amended date,
  embedding vector(1536),
  practice_areas text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  related_sections text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  version_hash text,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_key, section_number)
);

ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view legal content"
  ON legal_content FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert legal content"
  ON legal_content FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update legal content"
  ON legal_content FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- scraper_run_logs
CREATE TABLE IF NOT EXISTS scraper_run_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES scraper_sources(id),
  source_key text NOT NULL,
  action text NOT NULL DEFAULT 'scrape' CHECK (action IN ('scrape', 'embed', 'validate', 'cleanup')),
  status text NOT NULL DEFAULT 'started' CHECK (status IN (
    'started', 'in_progress', 'completed', 'failed', 'partial'
  )),
  sections_processed integer NOT NULL DEFAULT 0,
  sections_added integer NOT NULL DEFAULT 0,
  sections_updated integer NOT NULL DEFAULT 0,
  sections_embedded integer NOT NULL DEFAULT 0,
  error_message text,
  duration_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE scraper_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scraper run logs"
  ON scraper_run_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert scraper run logs"
  ON scraper_run_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update scraper run logs"
  ON scraper_run_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for legal_content
CREATE INDEX IF NOT EXISTS idx_legal_content_embedding
  ON legal_content
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_legal_content_source_key
  ON legal_content (source_key);

CREATE INDEX IF NOT EXISTS idx_legal_content_jurisdiction
  ON legal_content (jurisdiction);

CREATE INDEX IF NOT EXISTS idx_legal_content_content_type
  ON legal_content (content_type);

CREATE INDEX IF NOT EXISTS idx_legal_content_section_number
  ON legal_content (section_number);

CREATE INDEX IF NOT EXISTS idx_legal_content_is_active
  ON legal_content (is_active);

CREATE INDEX IF NOT EXISTS idx_legal_content_scraped_at
  ON legal_content (scraped_at);

CREATE INDEX IF NOT EXISTS idx_legal_content_practice_areas
  ON legal_content USING gin (practice_areas);

CREATE INDEX IF NOT EXISTS idx_legal_content_keywords
  ON legal_content USING gin (keywords);

-- Indexes for scraper_sources
CREATE INDEX IF NOT EXISTS idx_scraper_sources_source_type
  ON scraper_sources (source_type);

CREATE INDEX IF NOT EXISTS idx_scraper_sources_is_active
  ON scraper_sources (is_active);

-- Indexes for scraper_run_logs
CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_source_id
  ON scraper_run_logs (source_id);

CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_source_key
  ON scraper_run_logs (source_key);

CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_started_at
  ON scraper_run_logs (started_at);

-- Semantic search function across all legal content
CREATE OR REPLACE FUNCTION match_legal_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_jurisdiction text DEFAULT NULL,
  filter_source_type text DEFAULT NULL,
  filter_practice_area text DEFAULT NULL,
  filter_content_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_key text,
  jurisdiction text,
  content_type text,
  title_number text,
  title_name text,
  section_number text,
  section_title text,
  content text,
  summary text,
  url text,
  practice_areas text[],
  keywords text[],
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.source_key,
    lc.jurisdiction,
    lc.content_type,
    lc.title_number,
    lc.title_name,
    lc.section_number,
    lc.section_title,
    lc.content,
    lc.summary,
    lc.url,
    lc.practice_areas,
    lc.keywords,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM legal_content lc
  WHERE lc.is_active = true
    AND lc.embedding IS NOT NULL
    AND 1 - (lc.embedding <=> query_embedding) > match_threshold
    AND (filter_jurisdiction IS NULL OR lc.jurisdiction = filter_jurisdiction)
    AND (filter_content_type IS NULL OR lc.content_type = filter_content_type)
    AND (filter_source_type IS NULL OR lc.source_key IN (
      SELECT ss.source_key FROM scraper_sources ss WHERE ss.source_type = filter_source_type
    ))
    AND (filter_practice_area IS NULL OR filter_practice_area = ANY(lc.practice_areas))
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Source freshness function for the UI
CREATE OR REPLACE FUNCTION get_source_freshness()
RETURNS TABLE (
  source_key text,
  source_name text,
  source_type text,
  jurisdiction text,
  update_frequency text,
  last_successful_at timestamptz,
  sections_count integer,
  sections_with_embeddings integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.source_key,
    ss.source_name,
    ss.source_type,
    ss.jurisdiction,
    ss.update_frequency,
    ss.last_successful_at,
    ss.sections_count,
    ss.sections_with_embeddings,
    ss.is_active
  FROM scraper_sources ss
  WHERE ss.is_active = true
  ORDER BY ss.source_type, ss.source_name;
END;
$$;

-- Seed the initial source registry
INSERT INTO scraper_sources (source_key, source_name, source_type, jurisdiction, base_url, update_frequency, scraper_config) VALUES
  ('us_code', 'U.S. Code', 'federal_statute', 'federal', 'https://uscode.house.gov', 'weekly', '{"parser": "html", "titles": ["11", "15", "18", "26", "28", "29", "42"], "notes": "Bankruptcy, Commerce, Crimes, Tax, Judiciary, Labor, Public Health"}'),
  ('cfr', 'Code of Federal Regulations', 'regulation', 'federal', 'https://www.ecfr.gov', 'weekly', '{"parser": "api", "titles": ["12", "16", "24", "29", "45"], "notes": "Banks, Commercial Practices, Housing, Labor, Public Welfare"}'),
  ('az_ars', 'Arizona Revised Statutes', 'state_statute', 'AZ', 'https://www.azleg.gov/ars', 'monthly', '{"parser": "html", "titles": ["12", "13", "14", "23", "25", "33", "34", "36", "44"]}'),
  ('ca_codes', 'California Codes', 'state_statute', 'CA', 'https://leginfo.legislature.ca.gov', 'monthly', '{"parser": "html", "codes": ["CIV", "CCP", "FAM", "LAB", "PEN", "PROB"]}'),
  ('tx_statutes', 'Texas Statutes', 'state_statute', 'TX', 'https://statutes.capitol.texas.gov', 'monthly', '{"parser": "html", "codes": ["CP", "FA", "FI", "GV", "HS", "LA", "PE", "PR"]}'),
  ('ny_laws', 'New York Laws', 'state_statute', 'NY', 'https://www.nysenate.gov/legislation/laws', 'monthly', '{"parser": "html", "codes": ["CLS", "CPL", "DOM", "EXC", "GBS", "LAB", "PEN", "RPP"]}'),
  ('fl_statutes', 'Florida Statutes', 'state_statute', 'FL', 'https://www.flsenate.gov/Laws/Statutes', 'monthly', '{"parser": "html", "titles": ["61", "83", "316", "440", "448", "672", "718", "720"]}'),
  ('il_statutes', 'Illinois Compiled Statutes', 'state_statute', 'IL', 'https://www.ilga.gov/legislation/ilcs', 'monthly', '{"parser": "html"}'),
  ('eeoc_guidance', 'EEOC Guidance', 'agency_guidance', 'federal', 'https://www.eeoc.gov/laws/guidance', 'weekly', '{"parser": "html"}'),
  ('cfpb_guidance', 'CFPB Consumer Resources', 'agency_guidance', 'federal', 'https://www.consumerfinance.gov', 'weekly', '{"parser": "html"}'),
  ('dol_guidance', 'DOL Wage & Hour Resources', 'agency_guidance', 'federal', 'https://www.dol.gov/agencies/whd', 'weekly', '{"parser": "html"}'),
  ('ftc_guidance', 'FTC Consumer Protection', 'agency_guidance', 'federal', 'https://www.ftc.gov/legal-library', 'weekly', '{"parser": "html"}'),
  ('lsc_resources', 'Legal Services Corporation Resources', 'legal_aid', 'national', 'https://www.lsc.gov', 'monthly', '{"parser": "html"}'),
  ('lawhelp_org', 'LawHelp.org Self-Help Guides', 'legal_aid', 'national', 'https://www.lawhelp.org', 'monthly', '{"parser": "html"}')
ON CONFLICT (source_key) DO NOTHING;
