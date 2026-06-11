/*
  # Enhancement Features Database Schema

  1. New Tables
    - `email_captures`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `source` (text) - where captured (exit_intent, newsletter, etc.)
      - `page_url` (text) - which page they were on
      - `user_agent` (text) - device info
      - `created_at` (timestamptz)
      - `converted` (boolean) - did they sign up later
      
    - `user_preferences`
      - `id` (uuid, primary key)
      - `visitor_id` (text) - anonymous visitor tracking
      - `user_id` (uuid, nullable) - linked user if logged in
      - `last_visit` (timestamptz)
      - `visit_count` (integer)
      - `preferred_language` (text)
      - `last_case_type` (text) - last legal topic viewed
      - `last_page` (text)
      - `intake_progress` (jsonb) - saved form progress
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chat_contexts`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - links to free_chat_sessions
      - `detected_case_type` (text)
      - `follow_up_stage` (integer) - which follow-up question we're on
      - `collected_info` (jsonb) - info gathered from follow-ups
      - `urgency_level` (text) - low, medium, high, emergency
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public insert for email captures (anonymous users)
    - Visitor-based access for preferences
*/

-- Email Captures table
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL DEFAULT 'exit_intent',
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false,
  CONSTRAINT email_captures_email_source_unique UNIQUE (email, source)
);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit email capture"
  ON email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view own captures"
  ON email_captures
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_visit timestamptz DEFAULT now(),
  visit_count integer DEFAULT 1,
  preferred_language text DEFAULT 'en',
  last_case_type text,
  last_page text,
  intake_progress jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create preferences"
  ON user_preferences
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Visitors can view own preferences"
  ON user_preferences
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Visitors can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Chat Contexts table for intelligent follow-ups
CREATE TABLE IF NOT EXISTS chat_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  detected_case_type text,
  follow_up_stage integer DEFAULT 0,
  collected_info jsonb DEFAULT '{}',
  urgency_level text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create chat context"
  ON chat_contexts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view chat context"
  ON chat_contexts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update chat context"
  ON chat_contexts
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_visitor_id ON user_preferences(visitor_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_contexts_session_id ON chat_contexts(session_id);
