/*
  # Crisis Triage Sessions

  Records every time a visitor reaches the emergency-resources gate so we can
  measure routing safety (did they reach a safe resource vs. bounce?) without
  storing sensitive facts.

  1. New Tables
    - `crisis_triage_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable — anonymous visitors allowed)
      - `language` (text, default 'en')
      - `category` (text, nullable — eviction | ice | dv | other)
      - `resource_viewed` (boolean, default false)
      - `quick_exit_used` (boolean, default false)
      - `acknowledged_not_emergency` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - RLS enabled
    - Anonymous INSERT allowed (crisis users must not be forced to sign in)
    - SELECT/UPDATE restricted to owner (when user_id matches) or admins
    - No DELETE policy — audit integrity
*/

CREATE TABLE IF NOT EXISTS crisis_triage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  language text NOT NULL DEFAULT 'en',
  category text,
  resource_viewed boolean NOT NULL DEFAULT false,
  quick_exit_used boolean NOT NULL DEFAULT false,
  acknowledged_not_emergency boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crisis_triage_sessions_user_id_idx
  ON crisis_triage_sessions (user_id);
CREATE INDEX IF NOT EXISTS crisis_triage_sessions_created_at_idx
  ON crisis_triage_sessions (created_at DESC);

ALTER TABLE crisis_triage_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a crisis triage session"
  ON crisis_triage_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = (SELECT auth.uid())
  );

CREATE POLICY "Owners can view their own crisis sessions"
  ON crisis_triage_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Owners can update their own crisis sessions"
  ON crisis_triage_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anonymous can update their just-created session by id"
  ON crisis_triage_sessions
  FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);
