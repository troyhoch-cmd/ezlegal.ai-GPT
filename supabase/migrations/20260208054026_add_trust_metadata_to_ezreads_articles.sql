/*
  # Add trust metadata to EZ Reads articles

  1. Modified Tables
    - `ezreads_articles`
      - `jurisdiction` (text, nullable) - State code for state-specific content; null means general/federal
      - `review_status` (text, default 'editorial_review') - Content provenance level: editorial_review, attorney_reviewed, official_sources
      - `sources` (text, nullable) - Source attribution text
      - `last_reviewed_at` (timestamptz, nullable) - Date content was last reviewed for accuracy

  2. Indexes
    - Index on jurisdiction column for state-based filtering

  3. Important Notes
    - Existing articles default to review_status = 'editorial_review'
    - jurisdiction = null indicates general/federal guidance applicable to all states
    - These fields enable trust metadata display (jurisdiction badges, review provenance, freshness signals)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'jurisdiction'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN jurisdiction text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN review_status text DEFAULT 'editorial_review';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'sources'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN sources text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ezreads_articles' AND column_name = 'last_reviewed_at'
  ) THEN
    ALTER TABLE ezreads_articles ADD COLUMN last_reviewed_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ezreads_articles_jurisdiction ON ezreads_articles(jurisdiction);
