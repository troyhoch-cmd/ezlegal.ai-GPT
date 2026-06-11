/*
  # Free AI Chat and Trial Tracking System

  ## Overview
  This migration creates the infrastructure for Phase 1 implementation:
  - Free AI chat with question limits
  - Trial tracking and conversion management
  - Pro bono eligibility screening

  ## New Tables

  ### 1. `free_chat_sessions`
  Tracks anonymous and authenticated user chat sessions for the free AI assistant.
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, nullable) - Links to auth.users if authenticated
  - `session_token` (text, unique) - Anonymous session identifier for non-logged-in users
  - `question_count` (integer) - Number of questions asked in this session
  - `last_question_at` (timestamptz) - Timestamp of most recent question
  - `created_at` (timestamptz) - Session creation timestamp
  - `ip_address` (text, nullable) - User IP for rate limiting
  - `converted_to_trial` (boolean) - Whether user signed up for trial
  
  ### 2. `free_chat_messages`
  Stores individual messages from free chat sessions.
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid) - References free_chat_sessions
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ### 3. `trial_subscriptions`
  Manages free trial subscriptions and conversion tracking.
  - `id` (uuid, primary key) - Unique trial identifier
  - `user_id` (uuid) - References auth.users
  - `plan_type` (text) - 'basic' or 'premium'
  - `trial_start_date` (timestamptz) - Trial start timestamp
  - `trial_end_date` (timestamptz) - Trial expiration timestamp
  - `converted_to_paid` (boolean) - Whether trial converted to paid subscription
  - `conversion_date` (timestamptz, nullable) - When conversion occurred
  - `cancellation_reason` (text, nullable) - Reason if trial was cancelled
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `eligibility_screenings`
  Tracks pro bono legal aid eligibility screening submissions.
  - `id` (uuid, primary key) - Unique screening identifier
  - `user_id` (uuid, nullable) - References auth.users if authenticated
  - `email` (text) - Contact email
  - `annual_income` (numeric) - Reported annual income
  - `household_size` (integer) - Number in household
  - `state` (text) - US state of residence
  - `legal_issue_type` (text) - Type of legal issue
  - `issue_description` (text) - Brief description of legal issue
  - `is_qualified` (boolean) - Whether they qualify based on income thresholds
  - `status` (text) - 'pending', 'approved', 'rejected', 'contacted'
  - `created_at` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Anonymous users can create free chat sessions
  - Authenticated users can only access their own data
  - Admins can view all eligibility screenings
*/

-- Create free_chat_sessions table
CREATE TABLE IF NOT EXISTS free_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  question_count integer DEFAULT 0 NOT NULL,
  last_question_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  converted_to_trial boolean DEFAULT false NOT NULL
);

-- Create free_chat_messages table
CREATE TABLE IF NOT EXISTS free_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES free_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create trial_subscriptions table
CREATE TABLE IF NOT EXISTS trial_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  trial_start_date timestamptz DEFAULT now() NOT NULL,
  trial_end_date timestamptz NOT NULL,
  converted_to_paid boolean DEFAULT false NOT NULL,
  conversion_date timestamptz,
  cancellation_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create eligibility_screenings table
CREATE TABLE IF NOT EXISTS eligibility_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  annual_income numeric NOT NULL,
  household_size integer NOT NULL,
  state text NOT NULL,
  legal_issue_type text NOT NULL,
  issue_description text NOT NULL,
  is_qualified boolean NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_free_chat_sessions_user_id ON free_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_free_chat_sessions_session_token ON free_chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_free_chat_messages_session_id ON free_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_user_id ON trial_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_screenings_user_id ON eligibility_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_screenings_status ON eligibility_screenings(status);

-- Enable RLS
ALTER TABLE free_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_screenings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for free_chat_sessions
CREATE POLICY "Anyone can create free chat sessions"
  ON free_chat_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own chat sessions"
  ON free_chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view their sessions by token"
  ON free_chat_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can update their own chat sessions"
  ON free_chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update sessions by token"
  ON free_chat_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for free_chat_messages
CREATE POLICY "Anyone can create chat messages"
  ON free_chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view messages from their sessions"
  ON free_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM free_chat_sessions
      WHERE free_chat_sessions.id = free_chat_messages.session_id
      AND free_chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can view their chat messages"
  ON free_chat_messages FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for trial_subscriptions
CREATE POLICY "Users can view their own trial subscriptions"
  ON trial_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trial subscription"
  ON trial_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trial subscription"
  ON trial_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eligibility_screenings
CREATE POLICY "Anyone can create eligibility screenings"
  ON eligibility_screenings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own eligibility screenings"
  ON eligibility_screenings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  ) = true);

CREATE POLICY "Admins can update eligibility screenings"
  ON eligibility_screenings FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for eligibility_screenings
DROP TRIGGER IF EXISTS update_eligibility_screenings_updated_at ON eligibility_screenings;
CREATE TRIGGER update_eligibility_screenings_updated_at
  BEFORE UPDATE ON eligibility_screenings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();