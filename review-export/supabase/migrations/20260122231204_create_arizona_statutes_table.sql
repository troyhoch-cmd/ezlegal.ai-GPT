/*
  # Create Arizona Statutes and Regulations Table

  This migration creates a dedicated table for Arizona Revised Statutes (ARS)
  and Arizona Administrative Code (AAC) content with pgvector embeddings
  for semantic search in the RAG pipeline.

  ## 1. New Tables

  ### `arizona_legal_sources`
  Stores Arizona statutes, regulations, and administrative code
  - `id` (uuid, primary key)
  - `source_type` (text) - 'ars' or 'aac'
  - `title_number` (text) - Title number (e.g., '33' for Property)
  - `chapter` (text) - Chapter number
  - `article` (text) - Article number if applicable
  - `section` (text) - Section number (e.g., '33-1321')
  - `section_title` (text) - Human-readable title
  - `content` (text) - Full text content
  - `summary` (text) - AI-generated or manual summary
  - `effective_date` (date) - When the law became effective
  - `last_amended` (date) - Most recent amendment
  - `url` (text) - Official source URL
  - `embedding` (vector) - 1536-dim OpenAI embedding
  - `practice_areas` (text[]) - Related practice areas
  - `keywords` (text[]) - Search keywords
  - `is_active` (boolean) - Whether currently in force
  - `scraped_at` (timestamptz) - When content was scraped
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Indexes

  - HNSW index on embedding for fast similarity search
  - B-tree indexes on commonly queried columns
  - GIN index on practice_areas and keywords arrays

  ## 3. Functions

  - `match_arizona_statutes`: Semantic search for Arizona legal sources
  - `search_ars_by_citation`: Exact citation lookup

  ## 4. Security

  - RLS enabled
  - Public read access for active content
  - Admin-only write access
*/

-- Create the arizona_legal_sources table
CREATE TABLE IF NOT EXISTS arizona_legal_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('ars', 'aac', 'court_rule', 'constitution')),
  title_number text NOT NULL,
  title_name text,
  chapter text,
  chapter_name text,
  article text,
  article_name text,
  section text NOT NULL,
  section_title text NOT NULL,
  content text NOT NULL,
  summary text,
  effective_date date,
  last_amended date,
  url text,
  embedding vector(1536),
  practice_areas text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  related_sections text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_repealed boolean DEFAULT false,
  scraped_at timestamptz,
  version_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (source_type, section)
);

-- Create HNSW index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_embedding
ON arizona_legal_sources
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create B-tree indexes for common queries
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_source_type ON arizona_legal_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_title_number ON arizona_legal_sources(title_number);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_section ON arizona_legal_sources(section);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_is_active ON arizona_legal_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_scraped_at ON arizona_legal_sources(scraped_at DESC);

-- Create GIN indexes for array searches
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_practice_areas ON arizona_legal_sources USING GIN(practice_areas);
CREATE INDEX IF NOT EXISTS idx_arizona_legal_sources_keywords ON arizona_legal_sources USING GIN(keywords);

-- Enable RLS
ALTER TABLE arizona_legal_sources ENABLE ROW LEVEL SECURITY;

-- Public can read active statutes (these are public law)
CREATE POLICY "Anyone can view active Arizona legal sources"
  ON arizona_legal_sources FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage Arizona legal sources"
  ON arizona_legal_sources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Service role can manage (for edge functions)
CREATE POLICY "Service role can manage Arizona legal sources"
  ON arizona_legal_sources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create semantic search function
CREATE OR REPLACE FUNCTION match_arizona_statutes(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_source_type text DEFAULT NULL,
  filter_title text DEFAULT NULL,
  filter_practice_areas text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_type text,
  section text,
  section_title text,
  content text,
  summary text,
  url text,
  practice_areas text[],
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    als.id,
    als.source_type,
    als.section,
    als.section_title,
    als.content,
    als.summary,
    als.url,
    als.practice_areas,
    1 - (als.embedding <=> query_embedding) AS similarity
  FROM arizona_legal_sources als
  WHERE
    als.embedding IS NOT NULL
    AND als.is_active = true
    AND 1 - (als.embedding <=> query_embedding) > match_threshold
    AND (filter_source_type IS NULL OR als.source_type = filter_source_type)
    AND (filter_title IS NULL OR als.title_number = filter_title)
    AND (filter_practice_areas IS NULL OR als.practice_areas && filter_practice_areas)
  ORDER BY als.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create citation lookup function
CREATE OR REPLACE FUNCTION search_ars_by_citation(citation_text text)
RETURNS SETOF arizona_legal_sources
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_citation text;
BEGIN
  normalized_citation := regexp_replace(
    upper(trim(citation_text)),
    '[^A-Z0-9\-\.]',
    '',
    'g'
  );
  
  RETURN QUERY
  SELECT *
  FROM arizona_legal_sources als
  WHERE 
    als.is_active = true
    AND (
      upper(replace(als.section, '-', '')) LIKE '%' || normalized_citation || '%'
      OR upper(als.section) LIKE '%' || citation_text || '%'
    )
  ORDER BY als.section
  LIMIT 20;
END;
$$;

-- Create scrape log table to track scraping progress
CREATE TABLE IF NOT EXISTS arizona_scrape_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  title_number text,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),
  sections_scraped integer DEFAULT 0,
  sections_embedded integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer
);

-- Enable RLS on scrape logs
ALTER TABLE arizona_scrape_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view scrape logs
CREATE POLICY "Admins can view scrape logs"
  ON arizona_scrape_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Service role can manage scrape logs
CREATE POLICY "Service role can manage scrape logs"
  ON arizona_scrape_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_arizona_legal_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_arizona_legal_sources_updated_at ON arizona_legal_sources;
CREATE TRIGGER trigger_update_arizona_legal_sources_updated_at
  BEFORE UPDATE ON arizona_legal_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_arizona_legal_sources_updated_at();

-- Add comments
COMMENT ON TABLE arizona_legal_sources IS 'Arizona Revised Statutes (ARS) and Administrative Code (AAC) with vector embeddings for RAG';
COMMENT ON FUNCTION match_arizona_statutes IS 'Semantic search for Arizona statutes using cosine similarity';
COMMENT ON FUNCTION search_ars_by_citation IS 'Exact citation lookup for ARS sections';
