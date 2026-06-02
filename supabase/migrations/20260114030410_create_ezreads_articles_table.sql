/*
  # Create EZ Reads Articles Table

  1. New Tables
    - `ezreads_articles`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title` (text) - Article title
      - `excerpt` (text) - Short summary for cards
      - `content` (text) - Full article content (HTML supported)
      - `category` (text) - Article category
      - `read_time` (text) - Estimated read time
      - `image_url` (text) - Featured image URL
      - `is_featured` (boolean) - Featured article flag
      - `is_published` (boolean) - Publication status
      - `author_name` (text) - Author display name
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `published_at` (timestamptz)

  2. Security
    - Enable RLS on `ezreads_articles` table
    - Public read access for published articles
    - Admin-only write access (using is_admin column)

  3. Indexes
    - Index on category for filtering
    - Index on is_published for query optimization
    - Index on published_at for sorting
*/

CREATE TABLE IF NOT EXISTS ezreads_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL,
  read_time text NOT NULL DEFAULT '5 min read',
  image_url text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  author_name text DEFAULT 'EZLegal.ai Team',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz DEFAULT now()
);

ALTER TABLE ezreads_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON ezreads_articles
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can insert articles"
  ON ezreads_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update articles"
  ON ezreads_articles
  FOR UPDATE
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

CREATE POLICY "Admins can delete articles"
  ON ezreads_articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_ezreads_articles_category ON ezreads_articles(category);
CREATE INDEX IF NOT EXISTS idx_ezreads_articles_published ON ezreads_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_ezreads_articles_published_at ON ezreads_articles(published_at DESC);