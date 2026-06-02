/*
  # Create RBAC and Approval Workflow System

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - role name like 'admin', 'coordinator', 'reviewer'
      - `description` (text) - human-readable description
      - `permissions` (jsonb) - array of permission strings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role_id` (uuid, references roles)
      - `assigned_by` (uuid, references auth.users)
      - `assigned_at` (timestamptz)

    - `approval_workflows`
      - `id` (uuid, primary key)
      - `name` (text) - workflow name
      - `description` (text)
      - `entity_type` (text) - what this workflow applies to
      - `required_approvals` (int) - number of approvals needed
      - `approval_roles` (jsonb) - roles that can approve
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `approval_requests`
      - `id` (uuid, primary key)
      - `workflow_id` (uuid, references approval_workflows)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `requested_by` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `status` (text) - pending, approved, rejected
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz)

    - `approval_decisions`
      - `id` (uuid, primary key)
      - `request_id` (uuid, references approval_requests)
      - `decided_by` (uuid, references auth.users)
      - `decision` (text) - approve or reject
      - `comments` (text)
      - `decided_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can manage roles and workflows
    - Users can view their own role assignments
    - Approvers can view and act on pending requests

  3. Seed Data
    - Create default roles (admin, coordinator, reviewer, user)
*/

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  entity_type text NOT NULL,
  required_approvals int DEFAULT 1,
  approval_roles jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS approval_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  decided_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('approve', 'reject')),
  comments text,
  decided_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles"
  ON roles
  FOR ALL
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

CREATE POLICY "Authenticated users can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage user roles"
  ON user_roles
  FOR ALL
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

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage workflows"
  ON approval_workflows
  FOR ALL
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

CREATE POLICY "Authenticated users can view workflows"
  ON approval_workflows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create approval requests"
  ON approval_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can view own requests"
  ON approval_requests
  FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Admins can view all requests"
  ON approval_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update requests"
  ON approval_requests
  FOR UPDATE
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

CREATE POLICY "Admins can create approval decisions"
  ON approval_decisions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view decisions on their requests"
  ON approval_decisions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approval_requests
      WHERE approval_requests.id = approval_decisions.request_id
      AND approval_requests.requested_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all decisions"
  ON approval_decisions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id ON approval_decisions(request_id);

INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system administrator', '["manage_users", "manage_roles", "manage_content", "manage_settings", "approve_all", "view_analytics"]'::jsonb),
  ('coordinator', 'Legal aid coordinator', '["manage_cases", "assign_attorneys", "view_reports", "approve_cases"]'::jsonb),
  ('reviewer', 'Content reviewer', '["review_content", "approve_documents", "view_cases"]'::jsonb),
  ('attorney', 'Licensed attorney', '["view_cases", "respond_cases", "create_documents"]'::jsonb),
  ('user', 'Standard user', '["create_cases", "view_own_cases", "use_chat"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO approval_workflows (name, description, entity_type, required_approvals, approval_roles, is_active) VALUES
  ('Document Publication', 'Approval workflow for publishing legal documents', 'document', 1, '["admin", "reviewer"]'::jsonb, true),
  ('Prompt Template Change', 'Approval workflow for modifying AI prompt templates', 'prompt', 2, '["admin"]'::jsonb, true),
  ('AI Model Configuration', 'Approval workflow for changing AI model settings', 'ai_config', 2, '["admin"]'::jsonb, true),
  ('User Role Assignment', 'Approval workflow for assigning elevated user roles', 'role_assignment', 1, '["admin"]'::jsonb, true)
ON CONFLICT DO NOTHING;
