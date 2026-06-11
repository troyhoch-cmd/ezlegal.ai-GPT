/*
  # Create Chat Audit Logs Table for RAG Pipeline

  1. New Tables
    - `chat_audit_logs`
      - `id` (uuid, primary key)
      - `tenant_id` (text) - Multi-tenant identifier
      - `session_id` (text) - Chat session identifier
      - `user_id` (uuid, optional) - References authenticated user
      - `query` (text) - User's question
      - `response_preview` (text) - First 500 chars of response
      - `jurisdiction` (text) - Legal jurisdiction
      - `category` (text, optional) - Legal category
      - `citations_count` (integer) - Number of citations returned
      - `compliance_score` (integer, optional) - Enforcement/compliance score
      - `model_used` (text) - AI model or backend used
      - `backend_used` (text) - Which backend served the request
      - `audit_trail_id` (text) - Unique audit trail identifier
      - `created_at` (timestamptz) - Timestamp

  2. Security
    - Enable RLS on `chat_audit_logs` table
    - Admins can view all logs
    - Service role can insert logs

  3. Indexes
    - Index on tenant_id for multi-tenant queries
    - Index on session_id for session lookups
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS chat_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'ezlegal',
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query text NOT NULL,
  response_preview text,
  jurisdiction text DEFAULT 'Arizona',
  category text,
  citations_count integer DEFAULT 0,
  compliance_score integer,
  model_used text,
  backend_used text,
  audit_trail_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all chat audit logs"
  ON chat_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Service role can insert chat audit logs"
  ON chat_audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_tenant_id ON chat_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_session_id ON chat_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_created_at ON chat_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_audit_logs_audit_trail_id ON chat_audit_logs(audit_trail_id);
