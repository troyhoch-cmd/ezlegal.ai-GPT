/*
  # Create RLS Role Access Matrix System

  This migration implements a formal role-based access control matrix designed
  from user journeys rather than tables. Defines canonical roles and their
  access patterns across all major entities.

  ## Role Definitions

  ### Client (default)
  - Can view/edit their own matters
  - Can view/add documents to their matters
  - Can participate in chat within their matters

  ### Attorney
  - Can view matters they're assigned to as participants
  - Can view/edit documents in assigned matters
  - Can respond in chat threads for assigned matters

  ### Paralegal
  - Similar to attorney but with more limited edit permissions
  - Can view and organize documents

  ### Support
  - Can view limited matter information for support purposes
  - Cannot view sensitive documents or full chat history

  ### Admin
  - Full access for compliance review
  - Can view audit logs and provenance records
  - Can manage user roles and permissions

  ## Changes

  1. Add `role` column to profiles table
  2. Create role_access_matrix reference table
  3. Create access_audit_log table
  4. Add helper functions for role-based access
*/

-- Add role column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'client' 
      CHECK (role IN ('client', 'attorney', 'paralegal', 'support', 'admin'));
  END IF;
END $$;

-- Migrate existing is_admin users to admin role
UPDATE profiles SET role = 'admin' WHERE is_admin = true AND role = 'client';

-- Create index on profiles.role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create role_access_matrix reference table
CREATE TABLE IF NOT EXISTS role_access_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  entity_type text NOT NULL,
  action text NOT NULL CHECK (action IN ('select', 'insert', 'update', 'delete')),
  access_level text NOT NULL CHECK (access_level IN ('none', 'own', 'assigned', 'all')),
  conditions jsonb DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (role, entity_type, action)
);

-- Create access_audit_log table
CREATE TABLE IF NOT EXISTS access_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  access_granted boolean NOT NULL,
  denial_reason text,
  user_role text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for access_audit_log
CREATE INDEX IF NOT EXISTS idx_access_audit_user_id ON access_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_entity ON access_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_action ON access_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_access_audit_granted ON access_audit_log(access_granted);
CREATE INDEX IF NOT EXISTS idx_access_audit_created_at ON access_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE role_access_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;

-- Role access matrix is readable by authenticated users (reference data)
CREATE POLICY "Authenticated users can view access matrix"
  ON role_access_matrix FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify access matrix
CREATE POLICY "Admins can modify access matrix"
  ON role_access_matrix FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Users can view their own audit log entries
CREATE POLICY "Users can view own audit log"
  ON access_audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON access_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON access_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Populate role access matrix with canonical access patterns
INSERT INTO role_access_matrix (role, entity_type, action, access_level, description) VALUES
  -- Client role
  ('client', 'matters', 'select', 'own', 'Clients can view matters they own or participate in'),
  ('client', 'matters', 'insert', 'own', 'Clients can create their own matters'),
  ('client', 'matters', 'update', 'own', 'Clients can update their own matters'),
  ('client', 'matters', 'delete', 'own', 'Clients can delete their own matters'),
  ('client', 'documents', 'select', 'assigned', 'Clients can view documents in their matters'),
  ('client', 'documents', 'insert', 'assigned', 'Clients can upload documents to their matters'),
  ('client', 'chat_messages', 'select', 'assigned', 'Clients can view chat in their matters'),
  ('client', 'chat_messages', 'insert', 'assigned', 'Clients can send messages in their matters'),
  
  -- Attorney role
  ('attorney', 'matters', 'select', 'assigned', 'Attorneys can view matters they are assigned to'),
  ('attorney', 'matters', 'update', 'assigned', 'Attorneys can update assigned matters'),
  ('attorney', 'documents', 'select', 'assigned', 'Attorneys can view documents in assigned matters'),
  ('attorney', 'documents', 'insert', 'assigned', 'Attorneys can add documents to assigned matters'),
  ('attorney', 'documents', 'update', 'assigned', 'Attorneys can update documents in assigned matters'),
  ('attorney', 'chat_messages', 'select', 'assigned', 'Attorneys can view chat in assigned matters'),
  ('attorney', 'chat_messages', 'insert', 'assigned', 'Attorneys can respond in assigned matters'),
  ('attorney', 'ai_response_provenance', 'select', 'assigned', 'Attorneys can review AI provenance for assigned matters'),
  
  -- Paralegal role
  ('paralegal', 'matters', 'select', 'assigned', 'Paralegals can view assigned matters'),
  ('paralegal', 'documents', 'select', 'assigned', 'Paralegals can view documents in assigned matters'),
  ('paralegal', 'documents', 'insert', 'assigned', 'Paralegals can add documents to assigned matters'),
  ('paralegal', 'chat_messages', 'select', 'assigned', 'Paralegals can view chat in assigned matters'),
  
  -- Support role
  ('support', 'matters', 'select', 'assigned', 'Support can view limited matter info for support purposes'),
  ('support', 'profiles', 'select', 'all', 'Support can view user profiles for assistance'),
  
  -- Admin role
  ('admin', 'matters', 'select', 'all', 'Admins can view all matters for compliance'),
  ('admin', 'documents', 'select', 'all', 'Admins can view all documents for compliance'),
  ('admin', 'chat_messages', 'select', 'all', 'Admins can view all messages for compliance'),
  ('admin', 'ai_response_provenance', 'select', 'all', 'Admins can review all AI provenance'),
  ('admin', 'access_audit_log', 'select', 'all', 'Admins can view all access audit logs'),
  ('admin', 'profiles', 'select', 'all', 'Admins can view all profiles'),
  ('admin', 'profiles', 'update', 'all', 'Admins can update user roles')
ON CONFLICT (role, entity_type, action) DO UPDATE SET
  access_level = EXCLUDED.access_level,
  description = EXCLUDED.description;

-- Function to get user's effective role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = p_user_id),
    'client'
  );
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND (role = 'admin' OR is_admin = true)
  );
$$;

-- Function to check if user has access based on role matrix
CREATE OR REPLACE FUNCTION public.check_role_access(
  p_user_id uuid,
  p_entity_type text,
  p_action text,
  p_entity_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_access_level text;
  v_has_access boolean := false;
BEGIN
  v_role := public.get_user_role(p_user_id);
  
  SELECT access_level INTO v_access_level
  FROM role_access_matrix
  WHERE role = v_role
  AND entity_type = p_entity_type
  AND action = p_action;
  
  IF v_access_level IS NULL THEN
    RETURN false;
  END IF;
  
  CASE v_access_level
    WHEN 'all' THEN
      v_has_access := true;
    WHEN 'own' THEN
      IF p_entity_type = 'matters' AND p_entity_id IS NOT NULL THEN
        SELECT EXISTS (
          SELECT 1 FROM matters WHERE id = p_entity_id AND user_id = p_user_id
        ) INTO v_has_access;
      ELSIF p_entity_type = 'profiles' AND p_entity_id IS NOT NULL THEN
        v_has_access := (p_entity_id = p_user_id);
      ELSE
        v_has_access := true;
      END IF;
    WHEN 'assigned' THEN
      IF p_entity_id IS NOT NULL THEN
        IF p_entity_type IN ('matters', 'documents', 'chat_messages') THEN
          SELECT EXISTS (
            SELECT 1 FROM matter_participants mp
            WHERE mp.user_id = p_user_id
            AND mp.removed_at IS NULL
            AND (
              mp.matter_id = p_entity_id
              OR EXISTS (
                SELECT 1 FROM matter_documents md WHERE md.document_id = p_entity_id AND md.matter_id = mp.matter_id
              )
              OR EXISTS (
                SELECT 1 FROM chat_messages cm 
                JOIN chat_contexts cc ON cc.id = cm.context_id
                WHERE cm.id = p_entity_id AND cc.matter_id = mp.matter_id
              )
            )
          ) INTO v_has_access;
        END IF;
      ELSE
        v_has_access := true;
      END IF;
    ELSE
      v_has_access := false;
  END CASE;
  
  RETURN v_has_access;
END;
$$;

-- Function to log access attempts (can be called from application)
CREATE OR REPLACE FUNCTION public.log_access_attempt(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_granted boolean,
  p_denial_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO access_audit_log (
    user_id,
    entity_type,
    entity_id,
    action,
    access_granted,
    denial_reason,
    user_role
  ) VALUES (
    auth.uid(),
    p_entity_type,
    p_entity_id,
    p_action,
    p_granted,
    p_denial_reason,
    public.get_user_role(auth.uid())
  );
END;
$$;

-- Add admin access policies for compliance review on existing tables

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Admins can view all messages for compliance'
  ) THEN
    CREATE POLICY "Admins can view all messages for compliance"
      ON chat_messages FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'documents' 
    AND policyname = 'Admins can view all documents for compliance'
  ) THEN
    CREATE POLICY "Admins can view all documents for compliance"
      ON documents FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_response_provenance' 
    AND policyname = 'Admins can view all AI provenance for compliance'
  ) THEN
    CREATE POLICY "Admins can view all AI provenance for compliance"
      ON ai_response_provenance FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_response_citations' 
    AND policyname = 'Admins can view all citations for compliance'
  ) THEN
    CREATE POLICY "Admins can view all citations for compliance"
      ON ai_response_citations FOR SELECT
      TO authenticated
      USING (public.is_user_admin(auth.uid()));
  END IF;
END $$;
