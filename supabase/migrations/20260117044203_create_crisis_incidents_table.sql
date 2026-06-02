/*
  # Create Crisis Incidents Logging System

  1. New Tables
    - `crisis_incidents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional - null for anonymous users)
      - `session_id` (text, for tracking anonymous sessions)
      - `crisis_type` (text) - type of crisis detected
      - `trigger_message` (text) - message that triggered the detection
      - `jurisdiction` (text, optional) - user's jurisdiction if known
      - `escalated_to_human` (boolean) - whether user requested human help
      - `resources_shown` (jsonb) - resources displayed to user
      - `dismissed_at` (timestamptz) - when user dismissed the card
      - `created_at` (timestamptz)
      - `ip_address` (text, optional) - for fraud prevention
      - `user_agent` (text, optional)

  2. Security
    - Enable RLS on `crisis_incidents` table
    - Users can insert their own incidents (for logging)
    - Only admins can read all incidents
    - Users cannot update or delete incidents (audit integrity)

  3. Indexes
    - Index on crisis_type for analytics
    - Index on created_at for time-based queries
    - Index on user_id for user lookups
*/

CREATE TABLE IF NOT EXISTS crisis_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  crisis_type text NOT NULL,
  trigger_message text,
  jurisdiction text,
  escalated_to_human boolean DEFAULT false,
  resources_shown jsonb,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE crisis_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert crisis incidents for logging"
  ON crisis_incidents
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own crisis incidents"
  ON crisis_incidents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all crisis incidents"
  ON crisis_incidents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_crisis_incidents_crisis_type ON crisis_incidents(crisis_type);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_created_at ON crisis_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id ON crisis_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_escalated ON crisis_incidents(escalated_to_human) WHERE escalated_to_human = true;
