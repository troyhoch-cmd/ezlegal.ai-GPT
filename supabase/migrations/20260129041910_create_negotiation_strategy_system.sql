/*
  # Negotiation Strategy System

  This migration creates the tables needed for ezLegal.ai's AI-powered
  negotiation strategy planner - bringing AmLaw 100 tactics to consumers and SMBs.

  ## 1. New Tables

  ### `negotiations`
  Main table storing user negotiation cases
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, optional) - Links to authenticated user (null for anonymous)
  - `session_id` (text) - Session identifier for anonymous users
  - `dispute_type` (text) - Category of dispute (landlord, employer, debt, insurance, etc.)
  - `dispute_title` (text) - User-provided title
  - `dispute_description` (text) - Detailed description of the situation
  - `your_position` (text) - What the user wants
  - `their_position` (text) - What the other party wants
  - `jurisdiction` (text) - State/jurisdiction for legal context
  - `status` (text) - ongoing, resolved, abandoned
  - `resolution_outcome` (text) - How it ended (if resolved)
  - `created_at` (timestamptz) - When created
  - `updated_at` (timestamptz) - Last updated

  ### `negotiation_batna_analysis`
  Stores BATNA (Best Alternative To Negotiated Agreement) analysis
  - `id` (uuid, primary key)
  - `negotiation_id` (uuid) - Links to negotiation
  - `your_batna` (text) - User's best alternative
  - `their_batna` (text) - Estimated other party's alternative
  - `your_batna_value` (numeric) - Monetary value of user's alternative
  - `their_batna_value` (numeric) - Estimated value of their alternative
  - `leverage_score` (integer) - 1-100 score of negotiating leverage
  - `leverage_analysis` (text) - AI-generated analysis

  ### `negotiation_zopa`
  Stores Zone Of Possible Agreement calculations
  - `id` (uuid, primary key)
  - `negotiation_id` (uuid) - Links to negotiation
  - `your_reservation_point` (numeric) - Minimum you'll accept
  - `their_reservation_point` (numeric) - Estimated max they'll offer
  - `your_target` (numeric) - Your ideal outcome
  - `their_target` (numeric) - Their likely ideal
  - `zopa_exists` (boolean) - Whether overlap exists
  - `zopa_low` (numeric) - Lower bound of ZOPA
  - `zopa_high` (numeric) - Upper bound of ZOPA
  - `recommended_anchor` (numeric) - Suggested first offer

  ### `negotiation_rounds`
  Tracks each round of offers/counter-offers
  - `id` (uuid, primary key)
  - `negotiation_id` (uuid) - Links to negotiation
  - `round_number` (integer) - Sequential round number
  - `party` (text) - 'you' or 'them'
  - `offer_type` (text) - demand, offer, counter, bracket, final
  - `monetary_amount` (numeric) - Dollar amount if applicable
  - `non_monetary_terms` (text) - Non-monetary asks
  - `bracket_low` (numeric) - Low end if bracket
  - `bracket_high` (numeric) - High end if bracket
  - `notes` (text) - Notes about this round
  - `tactics_detected` (text[]) - Manipulation tactics identified
  - `recommended_response` (text) - AI-suggested response
  - `created_at` (timestamptz)

  ### `negotiation_scripts`
  Pre-written scripts for common scenarios
  - `id` (uuid, primary key)
  - `dispute_type` (text) - Type of dispute
  - `scenario` (text) - Specific scenario
  - `script_type` (text) - opening, counter, walkaway, bracket, closing
  - `script_title` (text) - Display title
  - `script_content` (text) - The actual script with placeholders
  - `psychology_notes` (text) - Why this works
  - `is_active` (boolean)

  ## 2. Security
  - RLS enabled on all tables
  - Users can only access their own negotiations
  - Anonymous users identified by session_id

  ## 3. Indexes
  - Foreign key indexes for performance
  - Session lookup index for anonymous users
*/

-- Main negotiations table
CREATE TABLE IF NOT EXISTS negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  dispute_type text NOT NULL,
  dispute_title text NOT NULL,
  dispute_description text,
  your_position text,
  their_position text,
  other_party_name text,
  other_party_type text,
  jurisdiction text DEFAULT 'AZ',
  status text DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'resolved', 'abandoned')),
  resolution_outcome text,
  final_settlement_amount numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- BATNA analysis table
CREATE TABLE IF NOT EXISTS negotiation_batna_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  your_batna text,
  their_batna text,
  your_batna_value numeric,
  their_batna_value numeric,
  leverage_score integer CHECK (leverage_score >= 0 AND leverage_score <= 100),
  leverage_analysis text,
  time_pressure_you text,
  time_pressure_them text,
  information_advantage text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ZOPA calculation table
CREATE TABLE IF NOT EXISTS negotiation_zopa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  your_reservation_point numeric,
  their_reservation_point numeric,
  your_target numeric,
  their_target numeric,
  zopa_exists boolean DEFAULT false,
  zopa_low numeric,
  zopa_high numeric,
  recommended_anchor numeric,
  anchor_justification text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Negotiation rounds tracker
CREATE TABLE IF NOT EXISTS negotiation_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  party text NOT NULL CHECK (party IN ('you', 'them')),
  offer_type text NOT NULL CHECK (offer_type IN ('demand', 'offer', 'counter', 'bracket', 'final', 'walkaway')),
  monetary_amount numeric,
  non_monetary_terms text,
  bracket_low numeric,
  bracket_high numeric,
  notes text,
  tactics_detected text[] DEFAULT '{}',
  recommended_response text,
  midpoint_at_round numeric,
  created_at timestamptz DEFAULT now()
);

-- Pre-written negotiation scripts
CREATE TABLE IF NOT EXISTS negotiation_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_type text NOT NULL,
  scenario text NOT NULL,
  script_type text NOT NULL CHECK (script_type IN ('opening', 'counter', 'walkaway', 'bracket', 'closing', 'tactic_response')),
  script_title text NOT NULL,
  script_content text NOT NULL,
  psychology_notes text,
  variables jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_batna_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_zopa ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for negotiations
CREATE POLICY "Users can view own negotiations"
  ON negotiations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own negotiations"
  ON negotiations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own negotiations"
  ON negotiations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own negotiations"
  ON negotiations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous users can access by session
CREATE POLICY "Anonymous can view by session"
  ON negotiations FOR SELECT
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous can create by session"
  ON negotiations FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous can update by session"
  ON negotiations FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- RLS for BATNA analysis (via negotiation ownership)
CREATE POLICY "Users can manage own BATNA analysis"
  ON negotiation_batna_analysis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can manage BATNA by session"
  ON negotiation_batna_analysis FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_batna_analysis.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  );

-- RLS for ZOPA (via negotiation ownership)
CREATE POLICY "Users can manage own ZOPA"
  ON negotiation_zopa FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can manage ZOPA by session"
  ON negotiation_zopa FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_zopa.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  );

-- RLS for rounds (via negotiation ownership)
CREATE POLICY "Users can manage own rounds"
  ON negotiation_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can manage rounds by session"
  ON negotiation_rounds FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.id = negotiation_rounds.negotiation_id
      AND n.session_id IS NOT NULL AND n.user_id IS NULL
    )
  );

-- Scripts are public read
CREATE POLICY "Anyone can read active scripts"
  ON negotiation_scripts FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_negotiations_user_id ON negotiations(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_session_id ON negotiations(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_dispute_type ON negotiations(dispute_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_batna_negotiation_id ON negotiation_batna_analysis(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_zopa_negotiation_id ON negotiation_zopa(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_negotiation_id ON negotiation_rounds(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_round_number ON negotiation_rounds(negotiation_id, round_number);
CREATE INDEX IF NOT EXISTS idx_negotiation_scripts_dispute_type ON negotiation_scripts(dispute_type);
CREATE INDEX IF NOT EXISTS idx_negotiation_scripts_scenario ON negotiation_scripts(dispute_type, scenario);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_negotiation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER negotiations_updated_at
  BEFORE UPDATE ON negotiations
  FOR EACH ROW
  EXECUTE FUNCTION update_negotiation_timestamp();

CREATE TRIGGER batna_updated_at
  BEFORE UPDATE ON negotiation_batna_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_negotiation_timestamp();

CREATE TRIGGER zopa_updated_at
  BEFORE UPDATE ON negotiation_zopa
  FOR EACH ROW
  EXECUTE FUNCTION update_negotiation_timestamp();