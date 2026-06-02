/*
  # Add preferred jurisdiction to profiles

  1. Changes
    - Adds `preferred_jurisdiction` text column to `profiles` so user's
      chosen jurisdiction in Chat and Research stays in sync across devices.
  2. Security
    - No RLS changes needed: existing profiles policies already restrict
      updates/selects to the owning user.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_jurisdiction'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_jurisdiction text;
  END IF;
END $$;
