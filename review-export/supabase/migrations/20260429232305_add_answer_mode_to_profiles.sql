/*
  # Add answer_mode preference to profiles

  1. Schema changes
    - Adds `answer_mode` text column to `profiles` with default 'simple'.
    - Allowed values: 'simple', 'stepbystep', 'legal_aid_prep', 'draft', 'spanish'.
    - Adds a check constraint to enforce allowed values.
    - Adds `last_resume_chat_id` uuid column to remember the user's last chat session for the "Resume where you left off" banner.

  2. Security
    - No new tables; existing RLS on `profiles` covers both columns.

  3. Notes
    1. This replaces the consumer-facing ChatGPT model picker with user-friendly modes.
    2. Internal / admin users can still override by setting the deprecated `ai_model_override` flag (no change).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'answer_mode'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN answer_mode text NOT NULL DEFAULT 'simple';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_resume_chat_id'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN last_resume_chat_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'resume_banner_dismissed_at'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN resume_banner_dismissed_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_answer_mode_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_answer_mode_check
      CHECK (answer_mode IN ('simple','stepbystep','legal_aid_prep','draft','spanish'));
  END IF;
END $$;
