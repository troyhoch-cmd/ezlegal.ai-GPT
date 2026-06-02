/*
  # Data Governance System for Legal Tech Compliance

  This migration creates the infrastructure for enterprise-grade data governance
  including retention policies, legal holds, data export tracking, and deletion requests.

  ## 1. New Tables

  ### data_retention_policies
  - Configurable retention periods per data type
  - Organization-level overrides
  - Legal hold support

  ### legal_holds
  - Matter-level legal holds to prevent deletion
  - Tracks hold reason, creator, and duration
  - Links to matters and users

  ### data_export_requests
  - Tracks user data export requests
  - Status tracking (pending, processing, completed, failed)
  - Download URL with expiration

  ### data_deletion_requests
  - GDPR/CCPA compliant deletion tracking
  - Scheduled vs immediate deletion
  - Verification and audit trail

  ## 2. Functions

  ### check_legal_hold(user_id, matter_id)
  - Returns true if data is under legal hold

  ### get_retention_policy(data_type, org_id)
  - Returns applicable retention period

  ## 3. Security

  - RLS enabled on all tables
  - Users can only see their own requests
  - Admins can manage organization policies
*/

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  retention_days integer NOT NULL DEFAULT 90,
  is_default boolean DEFAULT false,
  legal_hold_override boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_data_type CHECK (data_type IN (
    'chat_messages', 'chat_contexts', 'documents', 
    'audit_logs', 'activity_logs', 'attachments'
  )),
  CONSTRAINT valid_retention CHECK (retention_days >= 0 AND retention_days <= 2555)
);

-- Insert default retention policies
INSERT INTO data_retention_policies (data_type, retention_days, is_default) VALUES
  ('chat_messages', 90, true),
  ('chat_contexts', 90, true),
  ('documents', 365, true),
  ('audit_logs', 2555, true),
  ('activity_logs', 365, true),
  ('attachments', 90, true)
ON CONFLICT DO NOTHING;

-- Legal holds table
CREATE TABLE IF NOT EXISTS legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid REFERENCES matters(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hold_reason text NOT NULL,
  hold_type text NOT NULL DEFAULT 'litigation',
  started_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_hold_type CHECK (hold_type IN (
    'litigation', 'regulatory', 'investigation', 'audit', 'preservation'
  )),
  CONSTRAINT valid_hold_target CHECK (matter_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  export_format text NOT NULL DEFAULT 'json',
  include_chat_history boolean DEFAULT true,
  include_documents boolean DEFAULT true,
  include_profile boolean DEFAULT true,
  include_activity_logs boolean DEFAULT false,
  download_url text,
  download_expires_at timestamptz,
  file_size_bytes bigint,
  requested_at timestamptz DEFAULT now(),
  processing_started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'expired'
  )),
  CONSTRAINT valid_format CHECK (export_format IN ('json', 'csv', 'zip'))
);

-- Data deletion requests table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL DEFAULT 'full',
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz,
  reason text,
  legal_basis text,
  verified_at timestamptz,
  verification_method text,
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  deletion_log jsonb DEFAULT '[]'::jsonb,
  blocked_by_legal_hold boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_request_type CHECK (request_type IN (
    'full', 'chat_only', 'documents_only', 'specific_matter'
  )),
  CONSTRAINT valid_deletion_status CHECK (status IN (
    'pending', 'verified', 'scheduled', 'processing', 'completed', 'blocked', 'cancelled'
  )),
  CONSTRAINT valid_legal_basis CHECK (legal_basis IS NULL OR legal_basis IN (
    'gdpr_article_17', 'ccpa', 'user_request', 'account_closure', 'other'
  ))
);

-- Add soft delete columns to chat_messages if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN deleted_at timestamptz;
    ALTER TABLE chat_messages ADD COLUMN deletion_reason text;
  END IF;
END $$;

-- Add soft delete to chat_contexts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_contexts' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE chat_contexts ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

-- Function to check if data is under legal hold
CREATE OR REPLACE FUNCTION check_legal_hold(
  p_user_id uuid DEFAULT NULL,
  p_matter_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM legal_holds
    WHERE is_active = true
      AND (ends_at IS NULL OR ends_at > now())
      AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR (p_matter_id IS NOT NULL AND matter_id = p_matter_id)
      )
  );
END;
$$;

-- Function to get applicable retention policy
CREATE OR REPLACE FUNCTION get_retention_days(
  p_data_type text,
  p_org_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retention integer;
BEGIN
  SELECT retention_days INTO v_retention
  FROM data_retention_policies
  WHERE data_type = p_data_type
    AND (organization_id = p_org_id OR (organization_id IS NULL AND is_default = true))
  ORDER BY organization_id NULLS LAST
  LIMIT 1;
  
  RETURN COALESCE(v_retention, 90);
END;
$$;

-- Function to soft delete expired chat messages
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat_retention integer;
  v_context_retention integer;
  v_deleted_messages integer := 0;
  v_deleted_contexts integer := 0;
BEGIN
  SELECT get_retention_days('chat_messages') INTO v_chat_retention;
  SELECT get_retention_days('chat_contexts') INTO v_context_retention;
  
  UPDATE chat_messages
  SET deleted_at = now(),
      deletion_reason = 'retention_policy'
  WHERE deleted_at IS NULL
    AND created_at < now() - (v_chat_retention || ' days')::interval
    AND NOT check_legal_hold(user_id, NULL);
  
  GET DIAGNOSTICS v_deleted_messages = ROW_COUNT;
  
  UPDATE chat_contexts
  SET deleted_at = now()
  WHERE deleted_at IS NULL
    AND created_at < now() - (v_context_retention || ' days')::interval
    AND NOT check_legal_hold(user_id, NULL);
  
  GET DIAGNOSTICS v_deleted_contexts = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'messages_deleted', v_deleted_messages,
    'contexts_deleted', v_deleted_contexts,
    'executed_at', now()
  );
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_legal_holds_active 
  ON legal_holds(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_legal_holds_user 
  ON legal_holds(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_legal_holds_matter 
  ON legal_holds(matter_id) WHERE matter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user 
  ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status 
  ON data_export_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user 
  ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status 
  ON data_deletion_requests(status) WHERE status IN ('pending', 'verified', 'scheduled');
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted 
  ON chat_messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_retention 
  ON chat_messages(created_at) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_retention_policies
CREATE POLICY "Admins can manage retention policies"
  ON data_retention_policies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view default retention policies"
  ON data_retention_policies FOR SELECT
  TO authenticated
  USING (is_default = true);

-- RLS Policies for legal_holds
CREATE POLICY "Admins can manage legal holds"
  ON legal_holds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view holds on their data"
  ON legal_holds FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- RLS Policies for data_export_requests
CREATE POLICY "Users can create own export requests"
  ON data_export_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own export requests"
  ON data_export_requests FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all export requests"
  ON data_export_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can update export requests"
  ON data_export_requests FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

-- RLS Policies for data_deletion_requests
CREATE POLICY "Users can create own deletion requests"
  ON data_deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own deletion requests"
  ON data_deletion_requests FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can cancel own pending deletion requests"
  ON data_deletion_requests FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND status IN ('pending', 'verified', 'scheduled')
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'cancelled'
  );

CREATE POLICY "Admins can manage all deletion requests"
  ON data_deletion_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );
