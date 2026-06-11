/*
  # Create Lawyer Profiles Table

  1. New Tables
    - `lawyer_profiles` - stores attorney information for the directory
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `specialty` (text, primary practice area)
      - `hourly_rate` (integer, in dollars)
      - `rating` (numeric, 0-5 rating)
      - `review_count` (integer, number of reviews)
      - `avatar_url` (text, profile photo)
      - `about_me` (text, attorney bio)
      - `is_online` (boolean, availability status)
      - `public_phone` (text, contact number)
      - `email` (text, contact email)
      - `address1` (text, street address)
      - `address2` (text, suite/unit)
      - `city` (text)
      - `state` (text, 2-letter state code)
      - `zip` (text, postal code)
      - `jurisdiction` (text, bar admission)
      - `certifications` (text, additional credentials)
      - `practice_areas` (text[], array of practice areas)
      - `languages` (text[], languages spoken)
      - `website_url` (text, attorney website)
      - `years_experience` (integer)
      - `offers_flat_fee` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `lawyer_profiles` table
    - Public read access for all users (directory is public)
    - Only admins can insert/update/delete lawyer profiles

  3. Indexes
    - Index on city for location searches
    - Index on specialty for filtering
    - Index on rating for sorting
    - GIN index on practice_areas for array searches

  4. Important Notes
    - This replaces external API dependency with internal database
    - Lawyers can be added/managed by admins through the admin panel
    - Public directory access without authentication required
*/

-- Create the lawyer_profiles table
CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  specialty text DEFAULT '',
  hourly_rate integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  avatar_url text DEFAULT '',
  about_me text DEFAULT '',
  is_online boolean DEFAULT false,
  public_phone text DEFAULT '',
  email text DEFAULT '',
  address1 text DEFAULT '',
  address2 text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip text DEFAULT '',
  jurisdiction text DEFAULT '',
  certifications text DEFAULT '',
  practice_areas text[] DEFAULT ARRAY[]::text[],
  languages text[] DEFAULT ARRAY['English']::text[],
  website_url text DEFAULT '',
  years_experience integer DEFAULT 0,
  offers_flat_fee boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for all users (directory is public)
CREATE POLICY "Anyone can view lawyer profiles"
  ON lawyer_profiles
  FOR SELECT
  USING (true);

-- Only admins can insert lawyer profiles
CREATE POLICY "Admins can insert lawyer profiles"
  ON lawyer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update lawyer profiles
CREATE POLICY "Admins can update lawyer profiles"
  ON lawyer_profiles
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

-- Only admins can delete lawyer profiles
CREATE POLICY "Admins can delete lawyer profiles"
  ON lawyer_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_city ON lawyer_profiles(city);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_specialty ON lawyer_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_rating ON lawyer_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_practice_areas ON lawyer_profiles USING GIN(practice_areas);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lawyer_profiles_updated_at
  BEFORE UPDATE ON lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
