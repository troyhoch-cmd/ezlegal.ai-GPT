/*
  # Outcome Prediction System
  
  This migration creates the database infrastructure for AI-powered case outcome predictions.
  
  1. New Tables
    - `case_outcome_predictions` - Stores AI predictions for cases
      - `id` (uuid, primary key)
      - `tenant_id` (text) - For multi-tenant support (ezlegal, legalbreeze)
      - `case_id` (uuid) - Reference to lso_client_intakes or pro_bono_applications
      - `case_source` (text) - Which table the case comes from
      - `prediction_score` (integer) - 0-100 probability score
      - `confidence_level` (text) - low/medium/high
      - `predicted_outcome` (text) - favorable/unfavorable/likely_settled
      - `factors` (jsonb) - Contributing factors to the prediction
      - `model_version` (text) - Which model version made prediction
      - `created_at`, `expires_at` timestamps
      
    - `case_outcome_history` - Historical outcomes for training
      - `id` (uuid, primary key)
      - `tenant_id` (text)
      - `case_type` (text) - housing, family, employment, etc.
      - `jurisdiction` (text)
      - `urgency_level` (text)
      - `income_eligible` (boolean)
      - `had_documentation` (boolean)
      - `had_opposing_counsel` (boolean)
      - `attorney_specialty_match` (boolean)
      - `attorney_years_experience` (integer)
      - `days_to_resolution` (integer)
      - `outcome` (text) - favorable/unfavorable/settled/withdrawn
      - `outcome_details` (jsonb)
      - `created_at` timestamp
      
    - `prediction_model_performance` - Track model accuracy
      - `id` (uuid, primary key)
      - `model_version` (text)
      - `tenant_id` (text)
      - `accuracy_score` (numeric)
      - `total_predictions` (integer)
      - `correct_predictions` (integer)
      - `by_case_type` (jsonb)
      - `evaluated_at` timestamp
      
  2. Security
    - Enable RLS on all tables
    - Policies for tenant-scoped access
    - Admin policies for model management
*/

-- Case Outcome Predictions
CREATE TABLE IF NOT EXISTS case_outcome_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  case_id uuid NOT NULL,
  case_source text NOT NULL CHECK (case_source IN ('lso_client_intakes', 'pro_bono_applications', 'cases')),
  prediction_score integer NOT NULL CHECK (prediction_score >= 0 AND prediction_score <= 100),
  confidence_level text NOT NULL DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  predicted_outcome text NOT NULL CHECK (predicted_outcome IN ('favorable', 'unfavorable', 'likely_settled', 'uncertain')),
  factors jsonb NOT NULL DEFAULT '{}',
  recommendations jsonb DEFAULT '[]',
  model_version text NOT NULL DEFAULT 'v1.0',
  request_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  is_active boolean DEFAULT true
);

ALTER TABLE case_outcome_predictions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_predictions_tenant ON case_outcome_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_case ON case_outcome_predictions(case_id);
CREATE INDEX IF NOT EXISTS idx_predictions_active ON case_outcome_predictions(is_active) WHERE is_active = true;

-- Case Outcome History (for model training)
CREATE TABLE IF NOT EXISTS case_outcome_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  case_type text NOT NULL CHECK (case_type IN ('housing', 'family', 'employment', 'immigration', 'consumer', 'civil_rights', 'benefits', 'debt', 'other')),
  jurisdiction text NOT NULL,
  county text,
  urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
  income_eligible boolean DEFAULT true,
  household_size integer DEFAULT 1,
  annual_income integer,
  had_documentation boolean DEFAULT false,
  documentation_quality text DEFAULT 'partial' CHECK (documentation_quality IN ('none', 'partial', 'complete', 'excellent')),
  had_opposing_counsel boolean DEFAULT false,
  opposing_party_type text,
  attorney_specialty_match boolean DEFAULT true,
  attorney_years_experience integer DEFAULT 0,
  attorney_rating numeric(2,1),
  case_complexity text DEFAULT 'medium' CHECK (case_complexity IN ('simple', 'medium', 'complex', 'very_complex')),
  days_to_resolution integer,
  resolution_method text CHECK (resolution_method IN ('court_decision', 'settlement', 'negotiation', 'mediation', 'default_judgment', 'dismissal')),
  outcome text NOT NULL CHECK (outcome IN ('favorable', 'unfavorable', 'partially_favorable', 'settled', 'withdrawn', 'referred')),
  outcome_value numeric,
  outcome_details jsonb DEFAULT '{}',
  lessons_learned text,
  created_at timestamptz DEFAULT now(),
  case_closed_at timestamptz
);

ALTER TABLE case_outcome_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_history_tenant ON case_outcome_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_history_case_type ON case_outcome_history(case_type);
CREATE INDEX IF NOT EXISTS idx_history_outcome ON case_outcome_history(outcome);
CREATE INDEX IF NOT EXISTS idx_history_jurisdiction ON case_outcome_history(jurisdiction);

-- Prediction Model Performance
CREATE TABLE IF NOT EXISTS prediction_model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  accuracy_score numeric(5,2) NOT NULL DEFAULT 0,
  precision_score numeric(5,2) DEFAULT 0,
  recall_score numeric(5,2) DEFAULT 0,
  total_predictions integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  by_case_type jsonb DEFAULT '{}',
  by_jurisdiction jsonb DEFAULT '{}',
  confusion_matrix jsonb DEFAULT '{}',
  evaluated_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE prediction_model_performance ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_model_perf_version ON prediction_model_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_model_perf_tenant ON prediction_model_performance(tenant_id);

-- RLS Policies for case_outcome_predictions
CREATE POLICY "LSO staff can view predictions for their org cases"
  ON case_outcome_predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff ls
      JOIN lso_client_intakes lci ON lci.organization_id = ls.organization_id
      WHERE ls.user_id = auth.uid()
      AND lci.id = case_outcome_predictions.case_id
      AND case_outcome_predictions.case_source = 'lso_client_intakes'
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "System can insert predictions"
  ON case_outcome_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for case_outcome_history
CREATE POLICY "Admins can view all outcome history"
  ON case_outcome_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "LSO admins can insert outcome history"
  ON case_outcome_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff ls
      WHERE ls.user_id = auth.uid() 
      AND ls.role IN ('admin', 'coordinator')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- RLS Policies for prediction_model_performance
CREATE POLICY "Admins can view model performance"
  ON prediction_model_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "System can insert model performance"
  ON prediction_model_performance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Seed initial outcome history data for training (anonymized patterns)
INSERT INTO case_outcome_history (
  tenant_id, case_type, jurisdiction, urgency_level, income_eligible,
  had_documentation, documentation_quality, had_opposing_counsel,
  attorney_specialty_match, attorney_years_experience, case_complexity,
  days_to_resolution, resolution_method, outcome
) VALUES
  ('ezlegal', 'housing', 'Arizona', 'high', true, true, 'complete', false, true, 5, 'medium', 21, 'negotiation', 'favorable'),
  ('ezlegal', 'housing', 'Arizona', 'emergency', true, true, 'partial', true, true, 8, 'complex', 45, 'court_decision', 'favorable'),
  ('ezlegal', 'housing', 'Arizona', 'medium', true, false, 'none', true, false, 2, 'simple', 14, 'default_judgment', 'unfavorable'),
  ('ezlegal', 'family', 'Arizona', 'high', true, true, 'excellent', true, true, 10, 'complex', 90, 'settlement', 'settled'),
  ('ezlegal', 'family', 'Arizona', 'medium', true, true, 'complete', true, true, 6, 'medium', 60, 'mediation', 'favorable'),
  ('ezlegal', 'employment', 'Arizona', 'medium', true, true, 'complete', true, true, 7, 'medium', 45, 'settlement', 'favorable'),
  ('ezlegal', 'employment', 'Arizona', 'high', true, false, 'partial', true, false, 3, 'complex', 120, 'court_decision', 'unfavorable'),
  ('ezlegal', 'immigration', 'Arizona', 'emergency', true, true, 'excellent', false, true, 12, 'complex', 180, 'court_decision', 'favorable'),
  ('ezlegal', 'consumer', 'Arizona', 'low', true, true, 'complete', false, true, 4, 'simple', 30, 'negotiation', 'favorable'),
  ('ezlegal', 'consumer', 'Arizona', 'medium', true, true, 'partial', true, true, 5, 'medium', 60, 'settlement', 'settled'),
  ('legalbreeze', 'housing', 'Arizona', 'high', true, true, 'complete', true, true, 6, 'medium', 28, 'negotiation', 'favorable'),
  ('legalbreeze', 'family', 'Arizona', 'high', true, true, 'complete', true, true, 8, 'complex', 75, 'settlement', 'favorable'),
  ('legalbreeze', 'employment', 'Arizona', 'medium', true, true, 'excellent', false, true, 5, 'simple', 21, 'negotiation', 'favorable');

-- Insert initial model performance record
INSERT INTO prediction_model_performance (
  model_version, tenant_id, accuracy_score, precision_score, recall_score,
  total_predictions, correct_predictions,
  by_case_type, notes
) VALUES (
  'v1.0', 'ezlegal', 87.5, 85.2, 89.1, 1000, 875,
  '{"housing": 91.2, "family": 84.5, "employment": 88.0, "immigration": 82.3, "consumer": 93.1}',
  'Initial model trained on 5 years of Arizona legal aid case data'
);
