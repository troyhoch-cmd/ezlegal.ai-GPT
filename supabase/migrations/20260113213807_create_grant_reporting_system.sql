/*
  # AI-Powered Grant Reporting System

  1. New Tables
    - `grant_funders` - Stores funder information (foundations, government agencies, corporations)
    - `grants` - Individual grant records
    - `grant_milestones` - Trackable milestones for each grant
    - `grant_expenses` - Expense tracking linked to grants
    - `grant_reports` - Generated grant reports
    - `report_templates` - Funder-specific report templates
    - `grant_metrics` - Tracked outcome metrics

  2. Security
    - Enable RLS on all tables
    - User-based access control
    - Admin policies for platform-wide access
*/

-- Grant Funders Table
CREATE TABLE IF NOT EXISTS grant_funders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('federal', 'state', 'private_foundation', 'corporate', 'other')),
  contact_email text,
  contact_phone text,
  portal_url text,
  reporting_requirements jsonb DEFAULT '{}',
  report_frequency text CHECK (report_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual', 'final_only')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_funders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view funders"
  ON grant_funders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert funders"
  ON grant_funders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update funders"
  ON grant_funders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete funders"
  ON grant_funders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grants Table
CREATE TABLE IF NOT EXISTS grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funder_id uuid REFERENCES grant_funders(id) ON DELETE SET NULL,
  grant_name text NOT NULL,
  grant_number text,
  description text,
  amount_awarded decimal(12, 2) NOT NULL DEFAULT 0,
  amount_spent decimal(12, 2) NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'expired', 'suspended')),
  objectives jsonb DEFAULT '[]',
  budget_categories jsonb DEFAULT '{}',
  compliance_requirements jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grants"
  ON grants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can create their own grants"
  ON grants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own grants"
  ON grants FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete their own grants"
  ON grants FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Milestones Table
CREATE TABLE IF NOT EXISTS grant_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date NOT NULL,
  completed_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for their grants"
  ON grant_milestones FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert milestones for their grants"
  ON grant_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update milestones for their grants"
  ON grant_milestones FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete milestones for their grants"
  ON grant_milestones FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Expenses Table
CREATE TABLE IF NOT EXISTS grant_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  category text NOT NULL,
  subcategory text,
  description text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  date date NOT NULL,
  vendor text,
  budget_line text,
  ai_category_confidence decimal(3, 2),
  ai_suggested_category text,
  receipt_url text,
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses for their grants"
  ON grant_expenses FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert expenses for their grants"
  ON grant_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update expenses for their grants"
  ON grant_expenses FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete expenses for their grants"
  ON grant_expenses FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Reports Table
CREATE TABLE IF NOT EXISTS grant_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('progress', 'financial', 'final', 'compliance', 'narrative', 'combined')),
  reporting_period_start date NOT NULL,
  reporting_period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'submitted', 'accepted', 'revision_requested')),
  title text,
  content jsonb DEFAULT '{}',
  narrative_summary text,
  executive_summary text,
  metrics_data jsonb DEFAULT '{}',
  financial_summary jsonb DEFAULT '{}',
  compliance_score decimal(5, 2),
  compliance_flags jsonb DEFAULT '[]',
  ai_confidence_score decimal(3, 2),
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at timestamptz,
  funder_feedback text,
  export_formats jsonb DEFAULT '["pdf", "xlsx"]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for their grants"
  ON grant_reports FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert reports for their grants"
  ON grant_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update reports for their grants"
  ON grant_reports FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete reports for their grants"
  ON grant_reports FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id uuid REFERENCES grant_funders(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('progress', 'financial', 'final', 'compliance', 'narrative', 'combined')),
  sections jsonb NOT NULL DEFAULT '[]',
  formatting_rules jsonb DEFAULT '{}',
  required_metrics jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates"
  ON report_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert templates"
  ON report_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update templates"
  ON report_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete templates"
  ON report_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Grant Metrics Table
CREATE TABLE IF NOT EXISTS grant_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('count', 'percentage', 'currency', 'hours', 'text', 'boolean')),
  target_value decimal(12, 2),
  current_value decimal(12, 2) DEFAULT 0,
  unit text,
  period_start date,
  period_end date,
  recorded_at timestamptz DEFAULT now(),
  data_source text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grant_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics for their grants"
  ON grant_metrics FOR SELECT
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert metrics for their grants"
  ON grant_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update metrics for their grants"
  ON grant_metrics FOR UPDATE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can delete metrics for their grants"
  ON grant_metrics FOR DELETE
  TO authenticated
  USING (
    grant_id IN (SELECT id FROM grants WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grants_user_id ON grants(user_id);
CREATE INDEX IF NOT EXISTS idx_grants_funder_id ON grants(funder_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id ON grant_milestones(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_milestones_status ON grant_milestones(status);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id ON grant_expenses(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_category ON grant_expenses(category);
CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id ON grant_reports(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_reports_status ON grant_reports(status);
CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id ON grant_metrics(grant_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id ON report_templates(funder_id);

-- Insert sample funders
INSERT INTO grant_funders (name, type, report_frequency, reporting_requirements) VALUES
  ('Legal Services Corporation (LSC)', 'federal', 'semi_annual', '{"requires_csr": true, "demographic_breakdown": true, "case_type_reporting": true}'),
  ('State Bar Foundation', 'state', 'quarterly', '{"financial_detail": "high", "narrative_required": true}'),
  ('Access to Justice Foundation', 'private_foundation', 'annual', '{"impact_metrics": true, "client_stories": true}'),
  ('Corporate Pro Bono Initiative', 'corporate', 'quarterly', '{"volunteer_hours": true, "case_outcomes": true}')
ON CONFLICT DO NOTHING;