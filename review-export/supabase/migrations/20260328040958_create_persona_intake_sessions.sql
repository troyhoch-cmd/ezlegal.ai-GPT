/*
  # Create Persona Intake Sessions Table

  1. New Tables
    - `persona_intake_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - Links to auth.users if user is logged in
      - `persona_type` (text) - individual, business, or legal-aid
      - `intake_data` (jsonb) - Stores category, urgency, context, timeline, workflow, scale
      - `completed` (boolean) - Whether the intake was completed
      - `converted_to_chat` (boolean) - Whether user continued to chat
      - `session_id` (text) - Browser session identifier
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `persona_intake_sessions` table
    - Add policies for authenticated users to read/write their own sessions
    - Add policy for anonymous users to create sessions
    - Add admin policy for analytics

  3. Indexes
    - Index on user_id for user lookup
    - Index on persona_type for analytics
    - Index on created_at for time-based queries
    - Index on session_id for anonymous tracking
*/

CREATE TABLE IF NOT EXISTS persona_intake_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_type text NOT NULL CHECK (persona_type IN ('individual', 'business', 'legal-aid')),
  intake_data jsonb DEFAULT '{}'::jsonb,
  completed boolean DEFAULT false,
  converted_to_chat boolean DEFAULT false,
  session_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE persona_intake_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_persona_intake_sessions_user_id ON persona_intake_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_intake_sessions_persona_type ON persona_intake_sessions(persona_type);
CREATE INDEX IF NOT EXISTS idx_persona_intake_sessions_created_at ON persona_intake_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_persona_intake_sessions_session_id ON persona_intake_sessions(session_id);

CREATE POLICY "Users can insert their own intake sessions"
  ON persona_intake_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create intake sessions"
  ON persona_intake_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view their own intake sessions"
  ON persona_intake_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all intake sessions for analytics"
  ON persona_intake_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own intake sessions"
  ON persona_intake_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
