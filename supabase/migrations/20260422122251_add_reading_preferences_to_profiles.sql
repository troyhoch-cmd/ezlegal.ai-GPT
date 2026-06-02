/*
  # Add reading_preferences to profiles

  1. New Columns
    - `profiles.reading_preferences` (jsonb, default '{}')
      Stores per-user readability settings so they persist across devices:
      - `dyslexia_friendly` (boolean)
      - `font_scale` (number, 0.875..1.5)
      - `high_contrast` (boolean)
      - `underline_links` (boolean)
  2. Security
    - No policy changes required. Existing "Users can read/update own profile"
      policies on `profiles` already cover reads and writes to this column.
  3. Notes
    - Default value `'{}'::jsonb` keeps the column non-null and safe to merge
      against from the client.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'reading_preferences'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN reading_preferences jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;
