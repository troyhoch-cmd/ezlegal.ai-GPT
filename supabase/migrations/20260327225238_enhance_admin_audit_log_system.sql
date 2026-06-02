/*
  # Enhance Admin Audit Log System

  1. Changes
    - Add missing columns to existing admin_audit_logs table:
      - `resource_name` (text) - Human-readable name/description
      - `metadata` (jsonb) - Additional context
    - Add missing indexes for better query performance
    - Add action_type check constraint for data validation

  Note: Table already exists with columns: id, admin_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at
*/

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit_logs' AND column_name = 'resource_name'
  ) THEN
    ALTER TABLE admin_audit_logs ADD COLUMN resource_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit_logs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE admin_audit_logs ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add check constraint for action types if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'admin_audit_logs_action_check'
  ) THEN
    ALTER TABLE admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_action_check
    CHECK (action IN ('create', 'update', 'delete', 'view', 'export', 'login', 'logout'));
  END IF;
END $$;

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id
  ON admin_audit_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action
  ON admin_audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity_type
  ON admin_audit_logs(entity_type);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at_desc
  ON admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity_lookup
  ON admin_audit_logs(entity_type, entity_id);