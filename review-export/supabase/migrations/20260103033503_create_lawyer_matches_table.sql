/*
  # Create Lawyer Matches and Consultations Table

  1. New Tables
    - `lawyer_matches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `chat_message_id` (uuid, foreign key to chat_messages, nullable)
      - `practice_area` (text) - detected practice area
      - `lawyer_name` (text) - matched lawyer name
      - `lawyer_id` (text) - external lawyer ID
      - `status` (text) - match status (suggested, contacted, scheduled, completed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lawyer_consultations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `lawyer_match_id` (uuid, foreign key to lawyer_matches, nullable)
      - `lawyer_name` (text)
      - `lawyer_email` (text, nullable)
      - `practice_area` (text)
      - `consultation_date` (timestamptz, nullable)
      - `consultation_notes` (text, nullable)
      - `status` (text) - consultation status (requested, scheduled, completed, cancelled)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create lawyer_matches table
CREATE TABLE IF NOT EXISTS lawyer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chat_message_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  practice_area text NOT NULL,
  lawyer_name text NOT NULL,
  lawyer_id text NOT NULL,
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'contacted', 'scheduled', 'completed', 'dismissed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create lawyer_consultations table
CREATE TABLE IF NOT EXISTS lawyer_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lawyer_match_id uuid REFERENCES lawyer_matches(id) ON DELETE SET NULL,
  lawyer_name text NOT NULL,
  lawyer_email text,
  practice_area text NOT NULL,
  consultation_date timestamptz,
  consultation_notes text,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_user_id ON lawyer_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_status ON lawyer_matches(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_created_at ON lawyer_matches(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_user_id ON lawyer_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_status ON lawyer_consultations(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_date ON lawyer_consultations(consultation_date);

-- Enable Row Level Security
ALTER TABLE lawyer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lawyer_matches
CREATE POLICY "Users can view own lawyer matches"
  ON lawyer_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lawyer matches"
  ON lawyer_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lawyer matches"
  ON lawyer_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lawyer matches"
  ON lawyer_matches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for lawyer_consultations
CREATE POLICY "Users can view own consultations"
  ON lawyer_consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consultations"
  ON lawyer_consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations"
  ON lawyer_consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own consultations"
  ON lawyer_consultations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_lawyer_matches_updated_at ON lawyer_matches;
CREATE TRIGGER update_lawyer_matches_updated_at
  BEFORE UPDATE ON lawyer_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lawyer_consultations_updated_at ON lawyer_consultations;
CREATE TRIGGER update_lawyer_consultations_updated_at
  BEFORE UPDATE ON lawyer_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
