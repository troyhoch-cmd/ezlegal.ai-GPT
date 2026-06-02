/*
  # Beta Exit Metrics System

  1. New Tables
    - `ab_test_sessions` - Tracks individual test sessions with variant assignment
      - `id` (uuid, primary key)
      - `session_id` (text, unique)
      - `user_id` (uuid, optional)
      - `test_id` (text)
      - `variant_id` (text)
      - `device_type` (text) - desktop/mobile/tablet
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, optional)
      - `metadata` (jsonb)

    - `ab_test_metrics` - Stores individual metric events
      - `id` (uuid, primary key)
      - `session_id` (text)
      - `test_id` (text)
      - `variant_id` (text)
      - `metric_name` (text)
      - `metric_value` (numeric)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `beta_exit_evaluations` - Stores evaluation snapshots
      - `id` (uuid, primary key)
      - `test_id` (text)
      - `evaluated_at` (timestamptz)
      - `sample_requirements_met` (boolean)
      - `hard_gates_passed` (boolean)
      - `soft_gates_passed` (boolean)
      - `soft_gates_pass_count` (integer)
      - `overall_result` (text)
      - `category_results` (jsonb)
      - `notes` (text[])

    - `beta_qa_results` - Stores QA test results (accessibility, crisis detection)
      - `id` (uuid, primary key)
      - `test_id` (text)
      - `qa_type` (text) - accessibility/crisis_detection/keyboard
      - `test_name` (text)
      - `passed` (boolean)
      - `details` (jsonb)
      - `tested_at` (timestamptz)
      - `tested_by` (uuid)

  2. Security
    - Enable RLS on all tables
    - Admins can read/write all data
    - Metrics can be inserted by authenticated and anonymous users
*/

-- AB Test Sessions table
CREATE TABLE IF NOT EXISTS ab_test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  test_id text NOT NULL,
  variant_id text NOT NULL,
  device_type text DEFAULT 'desktop',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ab_test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert sessions"
  ON ab_test_sessions FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view own sessions"
  ON ab_test_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON ab_test_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AB Test Metrics table
CREATE TABLE IF NOT EXISTS ab_test_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  test_id text NOT NULL,
  variant_id text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ab_test_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert metrics"
  ON ab_test_metrics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all metrics"
  ON ab_test_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Beta Exit Evaluations table
CREATE TABLE IF NOT EXISTS beta_exit_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  evaluated_at timestamptz DEFAULT now(),
  sample_requirements_met boolean DEFAULT false,
  hard_gates_passed boolean DEFAULT false,
  soft_gates_passed boolean DEFAULT false,
  soft_gates_pass_count integer DEFAULT 0,
  overall_result text DEFAULT 'pending',
  category_results jsonb DEFAULT '{}'::jsonb,
  notes text[] DEFAULT ARRAY[]::text[],
  evaluated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beta_exit_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage evaluations"
  ON beta_exit_evaluations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Beta QA Results table
CREATE TABLE IF NOT EXISTS beta_qa_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  qa_type text NOT NULL,
  test_name text NOT NULL,
  passed boolean NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  tested_at timestamptz DEFAULT now(),
  tested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE beta_qa_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage QA results"
  ON beta_qa_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_test_sessions_test_id ON ab_test_sessions(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_sessions_variant_id ON ab_test_sessions(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_sessions_started_at ON ab_test_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_ab_test_sessions_device_type ON ab_test_sessions(device_type);

CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_session_id ON ab_test_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_test_id ON ab_test_metrics(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_metric_name ON ab_test_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_metrics_created_at ON ab_test_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_beta_exit_evaluations_test_id ON beta_exit_evaluations(test_id);
CREATE INDEX IF NOT EXISTS idx_beta_qa_results_test_id ON beta_qa_results(test_id);
CREATE INDEX IF NOT EXISTS idx_beta_qa_results_qa_type ON beta_qa_results(qa_type);

-- View for aggregated metrics by variant
CREATE OR REPLACE VIEW ab_test_metrics_summary AS
SELECT 
  test_id,
  variant_id,
  metric_name,
  COUNT(*) as event_count,
  AVG(metric_value) as avg_value,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY metric_value) as p50_value,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM ab_test_metrics
GROUP BY test_id, variant_id, metric_name;

-- View for session summary by variant
CREATE OR REPLACE VIEW ab_test_sessions_summary AS
SELECT 
  test_id,
  variant_id,
  device_type,
  COUNT(*) as session_count,
  COUNT(DISTINCT DATE(started_at)) as active_days,
  MIN(started_at) as first_session,
  MAX(started_at) as last_session
FROM ab_test_sessions
GROUP BY test_id, variant_id, device_type;
