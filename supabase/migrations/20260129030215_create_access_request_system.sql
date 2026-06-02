/*
  # Access Request and Deep Link System

  1. New Tables
    - `access_requests` - Tracks user access requests before account creation
      - `id` (uuid, primary key)
      - `email` (text, required) - Requester's email
      - `full_name` (text) - Requester's name
      - `resource_type` (text) - Type of resource requested (matter, document, workspace)
      - `resource_id` (uuid) - ID of the specific resource
      - `resource_name` (text) - Human-readable resource name
      - `invited_by` (uuid) - User who invited/shared the link
      - `status` (text) - pending, approved, denied, expired
      - `reason` (text) - Reason for request
      - `admin_notes` (text) - Notes from admin reviewing request
      - `reviewed_by` (uuid) - Admin who reviewed the request
      - `reviewed_at` (timestamptz) - When request was reviewed
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - When request link expires
    
    - `access_tokens` - Secure tokens for deep links
      - `id` (uuid, primary key)
      - `token` (text, unique) - Secure random token
      - `resource_type` (text) - Type of resource
      - `resource_id` (uuid) - ID of the resource
      - `resource_name` (text) - Display name
      - `created_by` (uuid) - User who created the link
      - `allowed_email` (text) - Email authorized to use this token (optional)
      - `max_uses` (int) - Maximum number of uses (null = unlimited)
      - `use_count` (int) - Current use count
      - `expires_at` (timestamptz) - Token expiration
      - `created_at` (timestamptz)
      - `revoked_at` (timestamptz) - If manually revoked
      - `last_used_at` (timestamptz)

    - `access_token_usage` - Audit log for token usage
      - `id` (uuid, primary key)
      - `token_id` (uuid) - Reference to access_tokens
      - `user_id` (uuid) - User who used the token (if authenticated)
      - `email` (text) - Email used (for unauthenticated)
      - `ip_address` (text) - For security logging
      - `user_agent` (text)
      - `action` (text) - viewed, requested_access, logged_in
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can manage all access requests
    - Users can view their own requests
    - Resource owners can view requests for their resources
*/

-- Access Requests Table
CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  resource_type text NOT NULL CHECK (resource_type IN ('matter', 'document', 'workspace', 'general')),
  resource_id uuid,
  resource_name text,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  reason text,
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Access Tokens Table
CREATE TABLE IF NOT EXISTS access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  resource_type text NOT NULL CHECK (resource_type IN ('matter', 'document', 'workspace', 'general', 'invite')),
  resource_id uuid,
  resource_name text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  allowed_email text,
  max_uses int,
  use_count int DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);

-- Access Token Usage Audit Log
CREATE TABLE IF NOT EXISTS access_token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES access_tokens(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  ip_address text,
  user_agent text,
  action text NOT NULL CHECK (action IN ('viewed', 'requested_access', 'logged_in', 'signed_up')),
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_invited_by ON access_requests(invited_by);
CREATE INDEX IF NOT EXISTS idx_access_requests_resource ON access_requests(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_created_by ON access_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires_at ON access_tokens(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_access_token_usage_token_id ON access_token_usage(token_id);

-- Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for access_requests

-- Admins can view all access requests
CREATE POLICY "Admins can view all access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update access requests (approve/deny)
CREATE POLICY "Admins can update access requests"
  ON access_requests FOR UPDATE
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

-- Users who invited can view requests for their invitations
CREATE POLICY "Inviters can view their access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING (invited_by = auth.uid());

-- Anyone can insert access requests (for requesting access)
CREATE POLICY "Anyone can create access requests"
  ON access_requests FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for access_tokens

-- Users can view their own created tokens
CREATE POLICY "Users can view own tokens"
  ON access_tokens FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Admins can view all tokens
CREATE POLICY "Admins can view all tokens"
  ON access_tokens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can create tokens
CREATE POLICY "Users can create tokens"
  ON access_tokens FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update their own tokens (revoke)
CREATE POLICY "Users can update own tokens"
  ON access_tokens FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON access_tokens FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for access_token_usage

-- Admins can view all usage
CREATE POLICY "Admins can view all token usage"
  ON access_token_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Token creators can view usage of their tokens
CREATE POLICY "Token creators can view usage"
  ON access_token_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM access_tokens
      WHERE access_tokens.id = access_token_usage.token_id
      AND access_tokens.created_by = auth.uid()
    )
  );

-- Anyone can log token usage
CREATE POLICY "Anyone can log token usage"
  ON access_token_usage FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Function to validate and use an access token
CREATE OR REPLACE FUNCTION validate_access_token(p_token text)
RETURNS TABLE (
  valid boolean,
  token_id uuid,
  resource_type text,
  resource_id uuid,
  resource_name text,
  allowed_email text,
  created_by_name text,
  error_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token access_tokens%ROWTYPE;
  v_creator_name text;
BEGIN
  -- Find the token
  SELECT * INTO v_token
  FROM access_tokens t
  WHERE t.token = p_token;

  -- Token not found
  IF v_token.id IS NULL THEN
    RETURN QUERY SELECT 
      false, NULL::uuid, NULL::text, NULL::uuid, NULL::text, NULL::text, NULL::text, 'TOKEN_NOT_FOUND'::text;
    RETURN;
  END IF;

  -- Token revoked
  IF v_token.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      false, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name, 
      v_token.allowed_email, NULL::text, 'TOKEN_REVOKED'::text;
    RETURN;
  END IF;

  -- Token expired
  IF v_token.expires_at < now() THEN
    RETURN QUERY SELECT 
      false, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name,
      v_token.allowed_email, NULL::text, 'TOKEN_EXPIRED'::text;
    RETURN;
  END IF;

  -- Token max uses exceeded
  IF v_token.max_uses IS NOT NULL AND v_token.use_count >= v_token.max_uses THEN
    RETURN QUERY SELECT 
      false, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name,
      v_token.allowed_email, NULL::text, 'MAX_USES_EXCEEDED'::text;
    RETURN;
  END IF;

  -- Get creator name
  SELECT full_name INTO v_creator_name
  FROM profiles
  WHERE id = v_token.created_by;

  -- Token is valid
  RETURN QUERY SELECT 
    true, v_token.id, v_token.resource_type, v_token.resource_id, v_token.resource_name,
    v_token.allowed_email, v_creator_name, NULL::text;
END;
$$;

-- Function to increment token usage
CREATE OR REPLACE FUNCTION increment_token_usage(p_token_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE access_tokens
  SET 
    use_count = use_count + 1,
    last_used_at = now()
  WHERE id = p_token_id;
END;
$$;
