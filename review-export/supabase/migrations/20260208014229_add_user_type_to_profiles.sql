/*
  # Add user_type column to profiles

  1. Modified Tables
    - `profiles`
      - Added `user_type` (text, NOT NULL, default 'individual')
      - Valid values: 'individual', 'business', 'organization'

  2. Security
    - Existing RLS policies on profiles table cover this new column
    - Users can update their own user_type through existing update policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text NOT NULL DEFAULT 'individual';
  END IF;
END $$;
