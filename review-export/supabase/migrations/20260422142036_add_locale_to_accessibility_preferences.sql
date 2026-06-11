/*
  # Add locale preferences for i18n

  1. Purpose
    - Persist the user's chosen UI language, BCP-47 locale, and number/date format overrides
      across devices so internationalization preferences survive logout/login.

  2. Changes
    - accessibility_preferences: adds `locale` (BCP-47 tag, default 'en-US') and
      `timezone` (IANA tz, nullable — falls back to browser).

  3. Safety
    - Uses IF NOT EXISTS wrappers. No destructive operations.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accessibility_preferences' AND column_name = 'locale'
  ) THEN
    ALTER TABLE accessibility_preferences
      ADD COLUMN locale text NOT NULL DEFAULT 'en-US';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accessibility_preferences' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE accessibility_preferences
      ADD COLUMN timezone text;
  END IF;
END $$;
