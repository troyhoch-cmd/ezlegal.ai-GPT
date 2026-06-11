/*
  # Add theme column to accessibility_preferences

  1. Purpose
    - Stores per-user dark/light/system preference so the theme persists across devices.

  2. Changes
    - accessibility_preferences: adds `theme` text column with a CHECK constraint and default 'system'.

  3. Safety
    - Uses IF NOT EXISTS to stay idempotent. No destructive changes.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accessibility_preferences' AND column_name = 'theme'
  ) THEN
    ALTER TABLE accessibility_preferences
      ADD COLUMN theme text NOT NULL DEFAULT 'system'
      CHECK (theme IN ('system', 'light', 'dark'));
  END IF;
END $$;
