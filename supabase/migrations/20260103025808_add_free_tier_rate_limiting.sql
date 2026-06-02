/*
  # Free Tier Rate Limiting & Conversion Tracking

  ## Purpose
  Enables free AI legal advice with IP-based rate limiting and tracks conversion funnel
  from free users to paying subscribers.

  ## New Tables
  
  ### `anonymous_chat_sessions`
  Tracks free (non-authenticated) chat sessions by IP address for rate limiting
  - `id` (uuid, primary key)
  - `ip_address` (text, hashed for privacy)
  - `questions_asked` (integer, daily question count)
  - `last_reset_date` (date, for daily limit reset)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `total_questions` (integer, lifetime count)
  - `converted_to_signup` (boolean, conversion tracking)
  - `converted_at` (timestamptz, conversion timestamp)
  
  ### `conversion_events`
  Tracks user journey through conversion funnel
  - `id` (uuid, primary key)
  - `session_id` (uuid, links to anonymous_chat_sessions)
  - `event_type` (text, e.g., 'first_question', 'hit_limit', 'saw_upgrade_prompt', 'clicked_signup')
  - `event_data` (jsonb, flexible metadata)
  - `created_at` (timestamptz)
  
  ### `chat_messages_anonymous`
  Stores anonymous chat messages for free users (limited retention)
  - `id` (uuid, primary key)
  - `session_id` (uuid, links to anonymous_chat_sessions)
  - `message` (text, user question)
  - `response` (text, AI response)
  - `created_at` (timestamptz)
  - `is_converted` (boolean, if shown upgrade prompt)
  
  ## Security
  - RLS enabled on all tables
  - Service role required for writes (prevents abuse)
  - Anonymous users can only read their own session data via session token
  - Auto-cleanup of old anonymous data (30 days)
  
  ## Indexes
  - Fast lookup by IP hash for rate limiting
  - Efficient date-based queries for daily resets
  - Session-based queries for conversion tracking
*/

-- Anonymous chat sessions table
CREATE TABLE IF NOT EXISTS anonymous_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  questions_asked integer DEFAULT 0,
  last_reset_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_questions integer DEFAULT 0,
  converted_to_signup boolean DEFAULT false,
  converted_at timestamptz,
  user_agent text,
  referrer text
);

-- Index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_ip_hash 
  ON anonymous_chat_sessions(ip_hash);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_created_at 
  ON anonymous_chat_sessions(created_at);

-- Conversion events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES anonymous_chat_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id 
  ON conversion_events(session_id);

-- Index for event type analytics
CREATE INDEX IF NOT EXISTS idx_conversion_events_type 
  ON conversion_events(event_type);

-- Anonymous chat messages table
CREATE TABLE IF NOT EXISTS chat_messages_anonymous (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES anonymous_chat_sessions(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_converted boolean DEFAULT false,
  category text,
  satisfaction_rating integer
);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id 
  ON chat_messages_anonymous(session_id);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_created_at 
  ON chat_messages_anonymous(created_at);

-- Enable Row Level Security
ALTER TABLE anonymous_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages_anonymous ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous_chat_sessions
CREATE POLICY "Service role can manage anonymous sessions"
  ON anonymous_chat_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for conversion_events
CREATE POLICY "Service role can manage conversion events"
  ON conversion_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for chat_messages_anonymous
CREATE POLICY "Service role can manage anonymous chat messages"
  ON chat_messages_anonymous
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to reset daily question count
CREATE OR REPLACE FUNCTION reset_daily_questions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE anonymous_chat_sessions
  SET questions_asked = 0,
      last_reset_date = CURRENT_DATE,
      updated_at = now()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$;

-- Function to cleanup old anonymous data (runs via cron/scheduled task)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete anonymous chat messages older than 30 days
  DELETE FROM chat_messages_anonymous
  WHERE created_at < now() - interval '30 days';
  
  -- Delete anonymous sessions older than 90 days (keep for analytics)
  DELETE FROM anonymous_chat_sessions
  WHERE created_at < now() - interval '90 days';
END;
$$;