/*
  # Add onboarding tour completion tracking to profiles

  1. Changes
    - Add `onboarding_tour_completed_at` (timestamptz, nullable) to `profiles`
      - NULL = user has not completed the guided chat tour
      - Non-null timestamp = when the user completed or dismissed the tour
    - This persists tour state across devices, browsers, and re-installs so
      returning users never re-see the 5-step introductory tour.

  2. Security
    - No RLS policy changes required; `profiles` already has user-scoped SELECT/UPDATE
      policies restricting access to `auth.uid() = id`.

  3. Notes
    - Nullable with no default so existing users are treated as "has not seen tour"
      exactly once, and we can detect engaged returning users via other signals
      (chat message history) to skip the tour regardless of this column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_tour_completed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_tour_completed_at timestamptz;
  END IF;
END $$;
