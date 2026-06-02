/*
  # Create KPI and Guardrail Dashboard Tables

  1. New Tables
    - `kpi_snapshots`
      - `id` (uuid, primary key)
      - `metric_name` (text) - e.g. 'free_to_paid_rate', 'activation_completion', 'churn_rate'
      - `metric_value` (numeric) - the actual measured value
      - `metric_target` (numeric) - the target/goal for this metric
      - `metric_unit` (text) - 'percent', 'count', 'currency', 'ratio'
      - `period_start` (timestamptz) - start of measurement period
      - `period_end` (timestamptz) - end of measurement period
      - `metadata` (jsonb) - additional context
      - `created_at` (timestamptz)
    - `guardrail_alerts`
      - `id` (uuid, primary key)
      - `guardrail_name` (text) - e.g. 'modal_suppression_rate', 'exit_intent_fire_rate'
      - `current_value` (numeric) - current measured value
      - `threshold_value` (numeric) - the threshold that triggered the alert
      - `severity` (text) - 'info', 'warning', 'critical'
      - `status` (text) - 'open', 'acknowledged', 'resolved'
      - `details` (jsonb) - context and recommended action
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)
      - `resolved_by` (uuid, nullable, references auth.users)
    - `funnel_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users)
      - `session_id` (text) - anonymous session tracking
      - `event_name` (text) - e.g. 'page_view', 'cta_click', 'checkout_start', 'purchase_complete'
      - `event_category` (text) - 'acquisition', 'activation', 'retention', 'revenue', 'referral'
      - `page_path` (text) - the page where the event occurred
      - `properties` (jsonb) - additional event properties
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only admin users can read KPI snapshots and guardrail alerts
    - Funnel events can be inserted by authenticated users for their own data
    - Admin users can read all funnel events

  3. Indexes
    - `kpi_snapshots`: index on metric_name, period_end
    - `guardrail_alerts`: index on status, severity
    - `funnel_events`: index on event_name, created_at, user_id
*/

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_target numeric,
  metric_unit text NOT NULL DEFAULT 'count',
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read KPI snapshots"
  ON kpi_snapshots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert KPI snapshots"
  ON kpi_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_metric_period
  ON kpi_snapshots (metric_name, period_end DESC);


CREATE TABLE IF NOT EXISTS guardrail_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardrail_name text NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  threshold_value numeric NOT NULL DEFAULT 0,
  severity text NOT NULL DEFAULT 'info',
  status text NOT NULL DEFAULT 'open',
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

ALTER TABLE guardrail_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read guardrail alerts"
  ON guardrail_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update guardrail alerts"
  ON guardrail_alerts FOR UPDATE
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

CREATE POLICY "Admins can insert guardrail alerts"
  ON guardrail_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_guardrail_alerts_status_severity
  ON guardrail_alerts (status, severity);

CREATE INDEX IF NOT EXISTS idx_guardrail_alerts_resolved_by
  ON guardrail_alerts (resolved_by)
  WHERE resolved_by IS NOT NULL;


CREATE TABLE IF NOT EXISTS funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL DEFAULT '',
  event_name text NOT NULL,
  event_category text NOT NULL DEFAULT 'acquisition',
  page_path text NOT NULL DEFAULT '',
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own funnel events"
  ON funnel_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all funnel events"
  ON funnel_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_funnel_events_name_created
  ON funnel_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id
  ON funnel_events (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_funnel_events_category
  ON funnel_events (event_category, created_at DESC);