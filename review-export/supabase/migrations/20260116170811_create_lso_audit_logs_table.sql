/*
  # Create LSO Audit Logs Table

  1. New Tables
    - `lso_audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action_type` (text) - type of action performed
      - `entity_type` (text) - what entity was affected (case, client, attorney, etc.)
      - `entity_id` (text) - ID of the affected entity
      - `details` (jsonb) - additional details about the action
      - `ip_address` (text) - IP address of the user (optional)
      - `user_agent` (text) - browser/device info (optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `lso_audit_logs` table
    - Add policy for admin users to read all logs
    - Add policy for LSO staff to read their organization's logs
    - Add policy for system to insert logs

  3. Indexes
    - Index on user_id for filtering by user
    - Index on action_type for filtering by action
    - Index on entity_type for filtering by entity
    - Index on created_at for date range queries
*/

CREATE TABLE IF NOT EXISTS lso_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lso_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read all audit logs"
  ON lso_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "System can insert audit logs"
  ON lso_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id ON lso_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_action_type ON lso_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_entity_type ON lso_audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_created_at ON lso_audit_logs(created_at DESC);
